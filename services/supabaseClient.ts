import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Visual Debug for Production: Show error on screen instead of white screen
  document.body.innerHTML = `
    <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif; background-color: #fef2f2; color: #991b1b;">
      <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 500px; width: 90%;">
        <h1 style="margin-top: 0; color: #dc2626; font-size: 1.5rem;">Erro de Configuração</h1>
        <p>O sistema não encontrou as chaves do Supabase.</p>
        <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; font-family: monospace; font-size: 0.9rem;">
          <div><strong>URL:</strong> ${supabaseUrl ? '✅ Definida' : '❌ AUSENTE'}</div>
          <div><strong>KEY:</strong> ${supabaseAnonKey ? '✅ Definida' : '❌ AUSENTE'}</div>
        </div>
        <p style="font-size: 0.9rem; color: #4b5563;">Vá no Vercel > Settings > Environment Variables e verifique se as chaves <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> estão corretas.</p>
      </div>
    </div>
  `;
  throw new Error('Missing Supabase environment variables. Visual error displayed.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
