# Sistema de Gestão de Correspondências

Sistema web completo para gerenciamento de correspondências, solicitações, emails e tramitações desenvolvido com Next.js 15 e TypeScript. O sistema permite gerenciar todo o fluxo de trabalho de correspondências entre concessionárias e órgãos reguladores.

## 📋 Sobre o Projeto

Este é uma plataforma de gestão de correspondências que facilita o controle e acompanhamento de solicitações, emails, tramitações e responsáveis. O sistema oferece funcionalidades completas de gestão, relatórios em PDF e Excel, controle de prazos, e muito mais. O sistema suporta múltiplos clientes com branding personalizado.

### Características Principais

- ✅ **Multi-tenant**: Suporta múltiplas concessionárias com isolamento de dados
- ✅ **Gestão completa de solicitações** com tramitações e histórico
- ✅ **Sistema de permissões** granular por perfil de usuário
- ✅ **Relatórios exportáveis** em PDF e Excel
- ✅ **Interface responsiva** e moderna
- ✅ **Sistema de notificações** em tempo real
- ✅ **Gestão de anexos** e documentos
- ✅ **Dashboard interativo** com métricas e prazos

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 15.4.6** - Framework React para aplicações full-stack com App Router
- **React 19.1.1** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.6.2** - Superset JavaScript com tipagem estática
- **Tailwind CSS 4** - Framework CSS utility-first
- **Radix UI** - Componentes UI acessíveis e customizáveis
- **Framer Motion** - Biblioteca de animações
- **React Hook Form** - Gerenciamento eficiente de formulários
- **Zod** - Validação de schemas TypeScript-first
- **TanStack Query** - Gerenciamento de estado do servidor
- **@react-pdf/renderer** - Geração de relatórios PDF
- **Sonner** - Sistema de notificações toast
- **Phosphor Icons** - Biblioteca de ícones moderna

### Backend Integration
- **REST API** - Comunicação com backend Java
- **JWT Authentication** - Autenticação baseada em tokens
- **Axios/Fetch** - Cliente HTTP para requisições

## 📦 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ ou **Bun** (recomendado)
- **npm**, **yarn** ou **bun** como gerenciador de pacotes

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd way-correspondencias-web
   ```

2. **Instale as dependências**
   ```bash
   # Usando Bun (recomendado)
   bun install
   
   # Ou usando npm
   npm install
   
   # Ou usando yarn
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```bash
   # URL da API backend
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   
   # Layout do cliente (way ou mvp)
   NEXT_PUBLIC_LAYOUT_CLIENT=way
   ```

4. **Execute o projeto em modo de desenvolvimento**
   ```bash
   bun dev
   # ou
   npm run dev
   # ou
   yarn dev
   ```

5. **Acesse a aplicação**
   
   Abra o navegador em [http://localhost:3000](http://localhost:3000)

## ⚙️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `bun dev` | Executa o projeto em modo de desenvolvimento com hot-reload |
| `bun build` | Gera build otimizado de produção |
| `bun start` | Executa o projeto em modo de produção |
| `bun lint` | Executa o ESLint para verificar qualidade do código |

## 🏗️ Estrutura do Projeto

```
src/
├── api/                          # Clients da API e tipos
│   ├── areas/                   # API de áreas organizacionais
│   ├── auth/                    # API de autenticação
│   ├── concessionaria/          # API de concessionárias
│   ├── email/                   # API de emails
│   ├── perfis/                  # API de perfis de usuário
│   ├── responsaveis/            # API de responsáveis
│   ├── solicitacoes/            # API de solicitações
│   ├── temas/                   # API de temas
│   ├── tramitacoes/             # API de tramitações
│   └── client.ts                # Cliente HTTP base
│
├── app/                          # Páginas da aplicação (App Router)
│   ├── areas/                   # Página de gestão de áreas
│   ├── dashboard/               # Dashboard principal
│   ├── email/                   # Página de gestão de emails
│   ├── responsaveis/            # Página de gestão de responsáveis
│   ├── solicitacoes/            # Página de gestão de solicitações
│   ├── temas/                   # Página de gestão de temas
│   ├── layout.tsx               # Layout raiz da aplicação
│   └── page.tsx                 # Página de login
│
├── components/                   # Componentes reutilizáveis
│   ├── areas/                   # Componentes específicos de áreas
│   ├── dashboard/               # Componentes do dashboard
│   ├── email/                   # Componentes específicos de emails
│   ├── layout/                  # Componentes de layout (Header, Sidebar)
│   ├── responsaveis/           # Componentes específicos de responsáveis
│   ├── solicitacoes/            # Componentes de solicitações e relatórios
│   ├── temas/                   # Componentes específicos de temas
│   └── ui/                      # Componentes de interface base
│
├── context/                      # Context API para estado global
│   ├── areas/                   # Context de áreas
│   ├── concessionaria/          # Context de concessionárias
│   ├── email/                   # Context de emails
│   ├── permissoes/              # Context de permissões
│   ├── responsaveis/             # Context de responsáveis
│   ├── solicitacoes/             # Context de solicitações
│   └── temas/                   # Context de temas
│
├── hooks/                        # Hooks customizados
│   ├── use-debounce.ts          # Hook para debounce
│   ├── use-has-permissao.ts     # Hook para verificar permissões
│   └── use-user-gestao.ts       # Hook para dados do usuário
│
├── providers/                    # Providers React
│   ├── ApiProvider.tsx          # Provider da API
│   ├── AuthGuard.tsx            # Guard de autenticação
│   └── Providers.tsx            # Provider raiz
│
├── stores/                       # Zustand stores
│   └── permissoes-store.tsx     # Store de permissões
│
├── types/                        # Tipos TypeScript globais
│   ├── auth/                    # Tipos de autenticação
│   ├── areas/                   # Tipos de áreas
│   └── ...
│
└── utils/                        # Funções utilitárias
    ├── layout-client.ts         # Helpers para layout do cliente
    ├── utils.ts                 # Utilitários gerais
    └── FormattDate.ts           # Formatação de datas
```

## 🔐 Autenticação e Segurança

O sistema utiliza autenticação baseada em **JWT (JSON Web Tokens)**:

- Tokens armazenados no `localStorage`
- Renovação automática de tokens
- Proteção de rotas com `AuthGuard`
- Sistema de permissões granular por perfil

### Como fazer login:

1. Acesse a página inicial (`/`)
2. Insira email e senha
3. O token será armazenado automaticamente
4. Você será redirecionado para o dashboard

## 📊 Funcionalidades Principais

### 1. Dashboard

O dashboard oferece uma visão geral do sistema com:
- **Métricas principais** (solicitações pendentes, em análise, etc.)
- **Calendário de prazos** com visualização mensal
- **Próximos prazos** destacados
- **Atividades recentes**
- **Board de status** de solicitações

### 2. Gestão de Solicitações

Sistema completo de gestão de solicitações com:

- ✅ **Criação e edição** de solicitações
- ✅ **Filtros avançados** (status, área, tema, datas, etc.)
- ✅ **Tramitações** com histórico completo
- ✅ **Anexos** e documentos
- ✅ **Controle de prazos** e alertas
- ✅ **Exportação** em PDF e Excel
- ✅ **Histórico de respostas** e pareceres
- ✅ **Status em tempo real**

### 3. Gestão de Emails

- Visualização de emails recebidos
- Filtros por remetente, destinatário, status
- Associação com solicitações
- Histórico completo

### 4. Gestão de Áreas

- Cadastro de áreas organizacionais
- Códigos de área padronizados (CdAreaEnum)
- Associação com concessionárias
- Filtros e busca

### 5. Gestão de Temas

- Organização por temas/categorias
- Associação com áreas
- Filtros e busca

### 6. Gestão de Responsáveis

- Cadastro completo de responsáveis
- **Obrigatório selecionar concessionárias** ao criar
- Associação com áreas e temas
- Upload de foto de perfil
- Controle de perfis e permissões

### 7. Relatórios

#### Exportação PDF
- Relatório completo de solicitações
- Layout otimizado para impressão
- Colunas ajustadas automaticamente
- Logo e branding dinâmicos por cliente

#### Exportação Excel
- Tabela formatada
- Colunas com largura ajustada
- Pronto para análise

### 8. Sistema de Concessionárias

- Seleção de concessionária no header
- Filtragem automática de dados
- Multi-seleção em formulários
- Context global para gerenciamento

## 🎨 Personalização por Cliente

O sistema suporta múltiplos clientes com branding personalizado:

### Variável de Ambiente
```bash
NEXT_PUBLIC_LAYOUT_CLIENT=way  # ou "mvp"
```

### Assets por Cliente
Os assets (logos, backgrounds, favicons) são organizados em:
- `public/images/way/` - Assets do cliente Way Brasil
- `public/images/mvp/` - Assets do cliente RTech

### Funcionalidades
- Logo dinâmico no header e login
- Background personalizado na tela de login
- Favicon específico por cliente
- Títulos e labels customizados

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

Crie `.env.local` com as seguintes variáveis:

```bash
# URL da API backend
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Layout do cliente (way ou mvp)
NEXT_PUBLIC_LAYOUT_CLIENT=way
```

### Estrutura da API

O sistema espera uma API REST com os seguintes endpoints:

#### Autenticação
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Dados do usuário logado

#### Solicitações
- `GET /solicitacoes` - Listar solicitações
- `POST /solicitacoes` - Criar solicitação
- `PUT /solicitacoes/:id` - Atualizar solicitação
- `GET /solicitacoes/:id` - Detalhes da solicitação

#### Outros Endpoints
- `/areas` - Gestão de áreas
- `/temas` - Gestão de temas
- `/responsaveis` - Gestão de responsáveis
- `/email` - Gestão de emails
- `/concessionarias` - Gestão de concessionárias
- `/tramitacoes` - Gestão de tramitações

## 📱 Interface e UX

### Design System
- **Componentes acessíveis** seguindo padrões WCAG
- **Tema responsivo** para desktop e mobile
- **Animações suaves** com Framer Motion
- **Loading states** com spinners e overlays
- **Feedback visual** com toasts e notificações

### Componentes UI Principais
- Dialog/Modal
- Button
- Input/TextField
- Select
- Table
- Toast/Notifications
- Loading Overlay
- Multi-select (Áreas, Concessionárias)

## 🚀 Deploy

### Build de Produção

```bash
bun build
```

### Executar em Produção

```bash
bun start
```

### Docker

O projeto inclui um `Dockerfile` para containerização:

```bash
docker build -t way-correspondencias-web .
docker run -p 3000:3000 way-correspondencias-web
```

## 📝 Convenções de Código

### TypeScript
- Tipagem estrita habilitada
- Interfaces para todos os tipos de API
- Enums para valores constantes

### Componentes
- Componentes funcionais com hooks
- Props tipadas com TypeScript
- Nomenclatura em PascalCase

### Estrutura de Arquivos
- Um componente por arquivo
- Pastas organizadas por feature
- Barrels exports quando necessário

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
2. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
3. Push para a branch (`git push origin feature/nova-feature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Equipe

Desenvolvido pela equipe RTech Solution.

> **Nota:** Este sistema suporta múltiplos clientes. Todas as referências a nomes de clientes, logos e branding são configuráveis através do sistema de layout em `src/lib/layout/layout-client.enum.ts`.

---

**Versão:** 0.1.0  
**Última atualização:** 2025
