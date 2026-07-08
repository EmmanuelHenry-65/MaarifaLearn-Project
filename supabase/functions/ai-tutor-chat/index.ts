// AI Tutor chat — Socratic RAG pipeline using OpenAI (gpt-5-mini + text-embedding-3-small).
//
// Deploy via the Supabase Dashboard (Edge Functions > Create a new function >
// paste this file > Deploy), or `supabase functions deploy ai-tutor-chat` if
// you have the CLI linked. Requires an OPENAI_API_KEY secret set on the
// project (Edge Functions > Secrets) -- never referenced from client code.
//
// Request body: { conversationId: string, question: string, attachmentPath?: string, attachmentName?: string }
// Response: { answer: string }

import { createClient } from 'npm:@supabase/supabase-js@2';
import pdfParse from 'npm:pdf-parse@1.1.1';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Maarifa Learn's AI Tutor for Kenyan Grade 10 (CBE) students.
You are Socratic: guide the student to the answer with questions, hints, and small steps —
do not just state the final answer outright, unless the student is clearly stuck after a couple
of hints and asks directly for the answer. Keep responses short, encouraging, and age-appropriate.
If context from the student's own uploaded materials is provided below, ground your guidance in it
and mention specifically what part of their material is relevant.`;

async function embed(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000), dimensions: 768 }),
  });
  if (!res.ok) throw new Error(`Embedding request failed: ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const { conversationId, question, attachmentPath, attachmentName } = await req.json();

    // Client scoped to the caller's own JWT -- used for anything that must
    // respect RLS / auth.uid() (match_documents, reading their own conversation).
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

    // Service-role client -- the only thing allowed to write to knowledge_documents.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Recent conversation history, for multi-turn context (this conversation is confirmed
    // to belong to the caller via the userClient query below, which is RLS-scoped).
    const { data: history } = await userClient
      .from('messages')
      .select('sender, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    let attachmentContext = '';

    // If an attachment came with this question, extract its text (PDF only for now --
    // images are out of scope until a vision-capable pass is added) and embed it into
    // knowledge_documents so future questions can retrieve it too.
    if (attachmentPath) {
      const { data: fileBlob } = await adminClient.storage.from('documents').download(attachmentPath);
      if (fileBlob) {
        const isPdf = attachmentPath.toLowerCase().endsWith('.pdf');
        if (isPdf) {
          try {
            const buffer = new Uint8Array(await fileBlob.arrayBuffer());
            const parsed = await pdfParse(buffer);
            const text = parsed.text.trim();
            if (text) {
              attachmentContext = text.slice(0, 6000);
              const embedding = await embed(text);
              await adminClient.from('knowledge_documents').insert({
                profile_id: user.id,
                title: attachmentName ?? 'Uploaded document',
                file_name: attachmentName ?? attachmentPath.split('/').pop(),
                file_url: attachmentPath,
                file_type: 'application/pdf',
                content: text,
                embedding,
              });
            }
          } catch {
            // Extraction failed (e.g. scanned/image-only PDF) -- continue without it.
          }
        }
      }
    }

    // Retrieval: search the student's own past uploads for relevant context.
    let retrievedContext = '';
    try {
      const queryEmbedding = await embed(question);
      const { data: matches } = await userClient.rpc('match_documents', {
        p_query_embedding: queryEmbedding,
        p_match_count: 3,
      });
      if (matches?.length) {
        retrievedContext = matches
          .map((m: { title: string; content: string }) => `From "${m.title}":\n${m.content.slice(0, 1500)}`)
          .join('\n\n');
      }
    } catch {
      // Retrieval is best-effort -- an empty knowledge base or a transient error
      // shouldn't block the tutor from answering.
    }

    const contextBlock = [attachmentContext && `Attached document:\n${attachmentContext}`, retrievedContext && `Relevant past material:\n${retrievedContext}`]
      .filter(Boolean)
      .join('\n\n');

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(contextBlock ? [{ role: 'system', content: `Context from the student's own materials:\n\n${contextBlock}` }] : []),
      ...(history ?? []).map((m: { sender: string; content: string }) => ({
        role: m.sender === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: question },
    ];

    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-5-mini', messages }),
    });
    if (!chatRes.ok) throw new Error(`Chat request failed: ${await chatRes.text()}`);
    const chatJson = await chatRes.json();
    const answer = chatJson.choices[0].message.content as string;

    return new Response(JSON.stringify({ answer }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
