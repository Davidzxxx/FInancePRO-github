# FinancePRO 💰

Sistema completo de controle financeiro pessoal e empresarial desenvolvido com React, TypeScript e Supabase.

![FinancePRO](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## 🚀 Funcionalidades

- ✅ **Dashboard Interativo** - Visão geral completa das finanças
- ✅ **Gestão de Perfis** - Controle de contas pessoais e empresariais  
- ✅ **Lançamentos Financeiros** - Rendas, despesas e dívidas
- ✅ **Análise BI** - Gráficos e relatórios detalhados
- ✅ **Metas e Simulações** - Planejamento financeiro futuro
- ✅ **Banco de Dados na Nuvem** - Sincronização automática via Supabase

## 🛠️ Tecnologias

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Supabase** - Backend as a Service (PostgreSQL)
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos

## 📦 Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd <nome-do-repositorio>

# Instale as dependências
npm install
```

## ⚙️ Configuração

1. Crie um projeto no [Supabase](https://supabase.com)
2. Crie um arquivo `.env.local` na raiz do projeto
3. Adicione suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
GEMINI_API_KEY=sua-chave-gemini (opcional)
```

## 🚀 Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

Acesse: **http://localhost:3000**

## 📊 Estrutura do Banco de Dados

O projeto usa Supabase com as seguintes tabelas:

- **profiles** - Perfis de usuários (pessoal/empresa)
- **transactions** - Lançamentos financeiros (rendas, despesas, dívidas)
- **goals** - Metas financeiras

Row Level Security (RLS) habilitado para proteção dos dados.

## 📁 Estrutura do Projeto

```
├── components/          # Componentes React
│   ├── Dashboard.tsx
│   ├── ProfileManager.tsx
│   ├── TransactionForm.tsx
│   ├── AnalyticsBI.tsx
│   └── GoalsSimulator.tsx
├── services/           # Camada de serviços
│   ├── supabaseClient.ts
│   ├── supabaseService.ts
│   └── geminiService.ts
├── types.ts           # Definições TypeScript
├── App.tsx            # Componente principal
└── index.tsx          # Entry point
```

## 🚀 Deploy na Vercel

### Opção 1: Deploy Automático via GitHub (Recomendado)

1. Faça upload do projeto para o GitHub (se ainda não fez)
2. Acesse: https://vercel.com
3. Faça login com sua conta GitHub
4. Clique em **"Add New Project"**
5. Selecione o repositório `FInancePRO-github`
6. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave pública do Supabase
   - `GEMINI_API_KEY` = sua chave do Gemini (opcional)
7. Clique em **"Deploy"**

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
vercel

# Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Configurações Importantes

A Vercel detectará automaticamente que é um projeto Vite e usará:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Não esqueça de adicionar as variáveis de ambiente no painel da Vercel!**

## 📝 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com ❤️ usando Supabase e React
