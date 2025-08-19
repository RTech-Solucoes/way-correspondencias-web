# Way - Sistema de Gestão de Correspondências

Sistema web para gerenciamento de correspondências e emails, desenvolvido com Next.js e TypeScript.

## 📋 Funcionalidades

- **Autenticação de usuários** - Sistema de login com validação
- **Gestão de Emails** - Visualização, criação e gerenciamento de emails
- **Gestão de Áreas** - Cadastro e controle de áreas organizacionais
- **Gestão de Temas** - Organização por temas/categorias
- **Gestão de Responsáveis** - Controle de responsáveis por área/tema
- **Gestão de Solicitações** - Sistema de solicitações e acompanhamento

## 🚀 Tecnologias Utilizadas

- **Next.js 15** - Framework React para aplicações full-stack
- **TypeScript** - Linguagem tipada baseada em JavaScript
- **Tailwind CSS** - Framework CSS utility-first
- **Radix UI** - Componentes UI acessíveis e customizáveis
- **React Hook Form** - Gerenciamento de formulários
- **Phosphor Icons** - Biblioteca de ícones
- **Bun** - Runtime e package manager

## 📦 Instalação

### Pré-requisitos

- Bun

### Passos de instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd way-correspondencias-web
   ```

2. **Instale as dependências**
   ```bash
   bun install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. **Execute o projeto em modo de desenvolvimento**
   ```bash
   bun dev
   ```

5. **Acesse a aplicação**
   
   Abra o navegador em [http://localhost:3000](http://localhost:3000)

## ⚙️ Scripts Disponíveis

- `bun dev` - Executa o projeto em modo de desenvolvimento
- `bun build` - Gera build de produção
- `bun start` - Executa o projeto em modo de produção
- `bun lint` - Executa o linter para verificar qualidade do código

## 🏗️ Estrutura do Projeto

```
src/
├── api/                    # Clients da API e tipos
│   ├── areas/             # API de áreas
│   ├── auth/              # API de autenticação
│   ├── email/             # API de emails
│   ├── responsaveis/      # API de responsáveis
│   ├── solicitacoes/      # API de solicitações
│   └── temas/             # API de temas
├── app/                   # Páginas da aplicação (App Router)
│   ├── areas/            # Página de gestão de áreas
│   ├── dashboard/        # Dashboard principal
│   ├── email/            # Página de gestão de emails
│   ├── responsaveis/     # Página de gestão de responsáveis
│   ├── solicitacoes/     # Página de gestão de solicitações
│   └── temas/            # Página de gestão de temas
├── components/           # Componentes reutilizáveis
│   ├── areas/           # Componentes específicos de áreas
│   ├── email/           # Componentes específicos de emails
│   ├── layout/          # Componentes de layout
│   ├── providers/       # Providers da aplicação
│   ├── responsaveis/    # Componentes específicos de responsáveis
│   ├── solicitacoes/    # Componentes específicos de solicitações
│   ├── temas/           # Componentes específicos de temas
│   └── ui/              # Componentes de interface
├── constants/           # Constantes da aplicação
├── hooks/               # Hooks customizados
├── lib/                 # Bibliotecas e utilitários
├── types/               # Tipos TypeScript
└── utils/               # Funções utilitárias
```

## 🔐 Autenticação

O sistema possui autenticação baseada em token JWT. Para fazer login:

1. Acesse a página inicial (`/`)
2. Insira email e senha
3. O token será armazenado no localStorage
4. Você será redirecionado para o dashboard

## 📧 Gestão de Emails

### Funcionalidades:
- Visualizar lista de emails
- Filtrar emails por remetente, destinatário, status, etc.
- Visualizar detalhes do email
- Criar novos emails
- Gerenciar status dos emails

### Como usar:
1. Acesse `/email`
2. Use a barra de pesquisa para buscar emails
3. Clique no botão de filtros para filtros avançados
4. Clique em "Novo Email" para criar um email
5. Clique em um email da lista para ver detalhes

## 🏢 Gestão de Áreas

Sistema para cadastro e gerenciamento de áreas organizacionais.

### Como usar:
1. Acesse `/areas`
2. Visualize a lista de áreas cadastradas
3. Use "Nova Área" para cadastrar
4. Edite ou exclua áreas existentes

## 📑 Gestão de Temas

Organização de correspondências por temas/categorias.

### Como usar:
1. Acesse `/temas`
2. Cadastre novos temas
3. Associe temas às correspondências

## 👥 Gestão de Responsáveis

Controle de responsáveis por áreas e temas.

### Como usar:
1. Acesse `/responsaveis`
2. Cadastre responsáveis
3. Associe responsáveis às áreas/temas

## 📋 Gestão de Solicitações

Sistema de solicitações e acompanhamento.

### Como usar:
1. Acesse `/solicitacoes`
2. Visualize solicitações existentes
3. Crie novas solicitações
4. Acompanhe o status das solicitações

## 🎨 Interface

O sistema utiliza:
- **Design System** baseado em Radix UI
- **Tema escuro/claro** (configurável)
- **Componentes acessíveis** seguindo padrões WCAG
- **Interface responsiva** para desktop e mobile

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

Crie `.env.local` com:

```bash
# URL da API backend
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Outras configurações conforme necessário
```

### Estrutura da API

O sistema espera uma API REST com os seguintes endpoints base:
- `/auth` - Autenticação
- `/emails` - Gestão de emails
- `/areas` - Gestão de áreas
- `/temas` - Gestão de temas
- `/responsaveis` - Gestão de responsáveis
- `/solicitacoes` - Gestão de solicitações