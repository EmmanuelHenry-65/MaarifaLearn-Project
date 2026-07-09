// Deletes the calling user's own account entirely -- auth user, profile, and
// all owned data. Self-service account deletion requires the service-role
// key (supabase.auth.admin.deleteUser is not available client-side), which
// is why this needs to be an Edge Function rather than a plain RPC.
//
// Deleting the auth.users row cascades (ON DELETE CASCADE) through profiles
// to nearly every other user-owned table -- see the FK definitions across
// database/schema/*.sql. Two things do NOT cascade and are cleaned up
// explicitly here:
//   1. knowledge_documents.profile_id is ON DELETE SET NULL by design (so
//      shared curriculum documents survive their uploader's deletion), so a
//      student's own personal uploads must be deleted first or they'd
//      become permanently "shared" documents visible to everyone.
//   2. Storage objects (avatars/documents buckets) aren't Postgres rows, so
//      the FK cascade never touches them.
//
// Request body: {} -- the authenticated caller is the only account this can
// ever delete, there is no "delete a different user" parameter.

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// storage.list() is NOT recursive: entries with a null id are subfolders
// (e.g. `${userId}/exam-submissions/`), and passing a folder path to remove()
// silently deletes nothing. Walk the tree so nested uploads -- exam answer
// sheets live at `${userId}/exam-submissions/<file>` -- actually get removed.
async function removeAllUnderPrefix(adminClient: ReturnType<typeof createClient>, bucket: string, prefix: string) {
  const { data: entries } = await adminClient.storage.from(bucket).list(prefix, { limit: 1000 });
  if (!entries || entries.length === 0) return;

  const files: string[] = [];
  for (const entry of entries) {
    const path = `${prefix}/${entry.name}`;
    if (entry.id === null) {
      await removeAllUnderPrefix(adminClient, bucket, path);
    } else {
      files.push(path);
    }
  }
  if (files.length > 0) await adminClient.storage.from(bucket).remove(files);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Must happen BEFORE deleteUser: the profiles cascade would SET NULL these
    // rows' profile_id, turning personal uploads into "shared" documents.
    const { error: docsError } = await adminClient.from('knowledge_documents').delete().eq('profile_id', user.id);
    if (docsError) throw new Error(`Failed to delete knowledge documents (check service_role grants): ${docsError.message}`);

    // Delete the auth user first (cascades through profiles to all DB rows).
    // If THIS fails, nothing else has been touched yet, so the account is
    // left intact rather than half-deleted.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw new Error(`Failed to delete account: ${deleteError.message}`);

    // Storage cleanup last, best-effort: the paths are keyed by the (now
    // deleted) user's id string, so this still works after deleteUser, and a
    // failure here only leaves orphaned files -- never a half-alive account.
    try {
      await removeAllUnderPrefix(adminClient, 'avatars', user.id);
      await removeAllUnderPrefix(adminClient, 'documents', user.id);
    } catch {
      // Orphaned files can be swept manually; the account itself is gone.
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
