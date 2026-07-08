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

async function removeAllUnderPrefix(adminClient: ReturnType<typeof createClient>, bucket: string, userId: string) {
  const { data: files } = await adminClient.storage.from(bucket).list(userId);
  if (!files || files.length === 0) return;
  const paths = files.map((f) => `${userId}/${f.name}`);
  await adminClient.storage.from(bucket).remove(paths);
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
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: CORS_HEADERS });
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { error: docsError } = await adminClient.from('knowledge_documents').delete().eq('profile_id', user.id);
    if (docsError) throw new Error(`Failed to delete knowledge documents (check service_role grants): ${docsError.message}`);

    await removeAllUnderPrefix(adminClient, 'avatars', user.id);
    await removeAllUnderPrefix(adminClient, 'documents', user.id);

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw new Error(`Failed to delete account: ${deleteError.message}`);

    return new Response(JSON.stringify({ success: true }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
