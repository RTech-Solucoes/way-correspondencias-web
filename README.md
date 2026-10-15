# Sistema de Gestão de Correspondências

Sistema web completo para gerenciamento de correspondências, solicitações, emails e tramitações desenvolvido com Next.js 15 e TypeScript. O sistema permite gerenciar todo o fluxo de trabalho de correspondências entre concessionárias e órgãos reguladores.

## Publicar na WAY

Toda publicação em produção avisa o grupo **PROJETOS - WAY 262**, com menção a todos, resultado, SHA solicitado, responsável e link da execução. O envio não possui opção de desligamento. O job `deploy` informa o resultado da publicação. O job `notify` informa separadamente se o aviso chegou ao Chat. Se apenas `notify` falhar, conferir `deploy` antes de repetir a publicação.

A produção WAY é publicada manualmente pelo GitHub Actions. Push ou merge em
`main` aciona o MVP legado e não publica no ambiente do cliente.

| Componente | Workflow de produção | Repositório |
| --- | --- | --- |
| API | [Deploy WAY api main](https://github.com/RTech-Solucoes/way-correspondencias-api/actions/workflows/workflow-way-main.yaml) | `way-correspondencias-api` |
| Frontend | [Deploy WAY web main](https://github.com/RTech-Solucoes/way-correspondencias-web/actions/workflows/workflow-way-main.yaml) | `way-correspondencias-web` |

1. Confirme a janela e os dois commits aprovados. API e frontend têm SHAs próprios.
2. Abra **Deploy WAY api main → Run workflow**. Selecione `main` e informe em
   `source_ref` o SHA completo de 40 caracteres aprovado para a API.
3. Aguarde **Publicar e confirmar imagem instalada** concluir com sucesso.
   Confira a versão e as verificações previstas para o pacote.
4. Execute **Deploy WAY web main** no outro repositório, em `main`, com o SHA
   completo aprovado para o frontend.
5. Confira as duas execuções e valide login e os fluxos alterados no cliente.
   `notify` controla o aviso ao grupo e vem habilitado por padrão.

Quem publica precisa de permissão de escrita nos repositórios. O GitHub usa os
secrets configurados e o gateway mantém a conexão com a WAY. Disparar o workflow
independe de console AWS, VPN local, SSH ou IP fixo no computador do operador.
Para abrir o portal do cliente, é necessário acesso à rede e ao DNS da WAY.

Uma imagem enviada ao ECR ainda não comprova instalação. O workflow confere o
digest instalado e a saúde da aplicação. O commit aprovado em `source_ref` pode
ser anterior ao último commit de `main`, e não deve ser substituído por uma
branch ou por toda a `develop` por conveniência.

### Como interpretar os indicadores

- **Deploy WAY** registra a publicação no cliente.
- **Deploy Correspondencias ... for Production/Develop** é o MVP legado.
  Qualquer push em `main` ou `develop`, inclusive de documentação, pode acioná-lo.
- **Production/Preview da Vercel** representa outra integração de hospedagem.
  Seu resultado não mede a instalação nos servidores WAY.
- A autoria do commit e o usuário que executou a publicação são registros distintos.

Se aparecer `The security token included in the request is invalid`, confira
primeiro o workflow. Os fluxos MVP ainda apontam à AWS antiga. Reexecutá-los ou
trocar seus secrets pelas chaves WAY não publica no cliente.

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
- **Next.js 15.4.11** - Framework React para aplicações full-stack com App Router
- **React 19.1.8** - Biblioteca JavaScript para construção de interfaces
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

- **Node.js 20** para reproduzir o build Docker de publicação. Bun pode ser usado no desenvolvimento local.
- **npm**, **yarn** ou **bun** como gerenciador de pacotes
- **API backend** em execução e acessível (por padrão `http://localhost:8080/api`; ajuste `NEXT_PUBLIC_API_URL` se for outro host/porta)

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
   
   Na raiz do projeto, crie o arquivo **`.env.local`** (nome usado pelo Next.js). Não use `.env-local` — esse nome não é carregado automaticamente.
   
   Variáveis utilizadas pelo frontend (todas com prefixo `NEXT_PUBLIC_`):
   ```bash
   # URL base da API (REST)
   NEXT_PUBLIC_API_URL=http://localhost:8080/api

   # Tema/branding: "way" (Way Brasil) ou "mvp" (RTech / testes)
   NEXT_PUBLIC_LAYOUT_CLIENT=way

   # Integração LDAP: "true" ou "false" (deve estar alinhado ao backend)
   NEXT_PUBLIC_LDAP_ENABLED=false
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
   
   Abra o navegador em [http://localhost:3000](http://localhost:3000). Sem o backend na URL configurada em `NEXT_PUBLIC_API_URL`, login e demais chamadas à API falharão.

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
│   ├── dashboard-correspondencia/ # Dashboard de correspondências
│   ├── dashboard-obrigacoes/    # Dashboard de obrigações
│   ├── obrigacao/               # Fluxo de obrigações (lista, edição, conferência)
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

## 📋 Roteiro de Implantação (Novo Cliente)

### 2.1 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_LAYOUT_CLIENT` | Identificador do cliente (ex: `nome_novo_cliente`) |
| `NEXT_PUBLIC_API_URL` | DNS/URL do back-end |
| `NEXT_PUBLIC_LDAP_ENABLED` | Habilita/desabilita integração LDAP (`"true"` ou `"false"`) |

**Exemplo de configuração:**
```bash
NEXT_PUBLIC_LAYOUT_CLIENT=way
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_LDAP_ENABLED=false
```

### 2.2 Alterações no Código

#### Configurar layout do cliente

Editar o arquivo `src/lib/layout/layout-client.enum.ts` e adicionar um novo objeto JSON com os textos e imagens personalizados do cliente.

#### Adicionar assets do cliente

Criar a pasta `public/images/nome_novo_cliente/` e adicionar os arquivos de imagem.

**Assets obrigatórios:**

| Arquivo | Descrição |
|---------|-----------|
| `logo.png` | Logotipo principal do cliente |
| `favicon.ico` | Ícone da aba do navegador |
| `login-bg.png` | Imagem de fundo da tela de login |

### 2.3 Configuração LDAP

A variável `NEXT_PUBLIC_LDAP_ENABLED` controla a integração com LDAP. Use os valores literais `"true"` ou `"false"` (string), alinhados ao backend:

```bash
NEXT_PUBLIC_LDAP_ENABLED=true   # Habilita LDAP
NEXT_PUBLIC_LDAP_ENABLED=false  # Desabilita LDAP (padrão local)
```

**Importante:** Deve possuir o mesmo valor no frontend e no backend.

Quando habilitado (`"true"`):
- O botão "Gerar Senha" aparece no menu de ações dos responsáveis
- Requer a permissão `RESPONSAVEL_GERAR_SENHA` para usar a funcionalidade
- O usuário logado não pode gerar senha para si mesmo

### 2.4 Envio de senha por e-mail

O responsável com perfil **Admin** possui a opção de enviar a senha do usuário por e-mail através do botão "Gerar Senha" no menu de ações dos responsáveis.

**Requisitos:**
- `NEXT_PUBLIC_LDAP_ENABLED="true"`
- Permissão `RESPONSAVEL_GERAR_SENHA`
- Endpoint: `POST /responsaveis/{id}/gerar-senha`

### 2.5 Primeiro acesso sem LDAP

Para uso sem LDAP, configure o primeiro acesso no backend e compartilhe a credencial pelo canal restrito da equipe. Senhas iniciais e hashes não pertencem ao README. Na produção WAY com LDAP, o acesso utiliza as contas do diretório do cliente.

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

Use `.env.local` na raiz (ver passos em **Instalação e Configuração**). Resumo:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | Sim | URL base da API |
| `NEXT_PUBLIC_LAYOUT_CLIENT` | Sim | `way` ou `mvp` |
| `NEXT_PUBLIC_LDAP_ENABLED` | Recomendada | `true` ou `false` |

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

## Build local e Docker

Os comandos desta seção geram ou iniciam a aplicação localmente. Não publicam uma versão nos servidores WAY.

### Gerar o build localmente

```bash
bun build
```

### Executar o build localmente

```bash
bun start
```

### Docker

O projeto inclui um `Dockerfile` para containerização:

```bash
docker build -t way-correspondencias-web .
docker run -p 3000:3000 way-correspondencias-web
```

## Canais de publicação

| Destino | Workflow | Como inicia |
| --- | --- | --- |
| WAY, produção frontend | `Deploy WAY web main`, em `.github/workflows/workflow-way-main.yaml` | Manual, em `main`, com `source_ref` aprovado |
| WAY, produção API | `Deploy WAY api main`, no repositório `way-correspondencias-api` | Manual, em `main`, antes do frontend |
| MVP, produção | `Deploy Correspondencias Web for Production`, em `.github/workflows/workflow-mvp-main.yaml` | Push em `main` |
| MVP, desenvolvimento | `Deploy Correspondencias Web for Develop`, em `.github/workflows/workflow-mvp-develop.yaml` | Push em `develop` |

Os checks e previews herdados da Vercel são independentes da instalação nos servidores WAY. O resultado dessa integração ou de um workflow do MVP não confirma a publicação no cliente.

### Configuração do fluxo WAY

A publicação usa o ECR da conta nova em `sa-east-1` e o gateway de deploy. Não exige que o operador entre no console AWS nem conecte uma VPN local para disparar o workflow. O gateway mantém a conexão com a infraestrutura do cliente. Para abrir o portal, é necessário acesso à rede e ao DNS da WAY.

Os secrets já referenciados pelo workflow são:

| Secret | Uso |
| --- | --- |
| `WAY_ECR_ACCESS_KEY_ID` e `WAY_ECR_SECRET_ACCESS_KEY` | Autenticação da publicação de imagens |
| `WAY_ECR_ACCOUNT_ID` | Identificação e conferência da conta AWS |
| `WAY_DEPLOY_PRD_TOKEN` | Autenticação do pedido ao gateway de produção |
| `ENV_FILE_WAY_PRD` | Conteúdo do `.env` usado no build do frontend |
| `WAY_CHAT_WEBHOOK` | Aviso ao grupo quando `notify` estiver habilitado |

As variáveis `NEXT_PUBLIC_*` do frontend são compiladas na imagem. Alterar apenas o ambiente do container não muda o endereço da API presente no JavaScript. O workflow preserva uma imagem já existente para o mesmo SHA. Uma mudança de configuração de build precisa de uma imagem nova, identificada e conferida antes da instalação.

### Antes e depois da publicação

- Confirme os dois commits aprovados e o impacto das migrações. Não publique toda a `develop` por conveniência.
- Execute a API e aguarde sua conferência antes de iniciar o frontend. Os repositórios não impõem essa ordem automaticamente.
- O workflow só conclui a instalação quando o gateway informa sucesso e o digest instalado coincide com o digest publicado no ECR.
- Depois, valide a aplicação no cliente. Saúde HTTP e workflow verde não substituem a conferência dos fluxos afetados.
- O retorno do container anterior não desfaz migrações, permissões ou dados do banco. A recuperação do banco deve estar definida antes de publicar mudanças que dependam dela.

### Se uma execução falhar

Confira primeiro o nome do workflow e o ambiente. Uma falha em **Deploy Correspondencias Web for Production** pertence ao MVP, não ao deploy WAY. Reexecutar esse job não publica no cliente.

Registre o link da execução WAY, o SHA solicitado, a etapa que falhou e a imagem ou digest informado. Se a comunicação cair depois do pedido ao gateway, confira a versão instalada antes de tentar novamente. Não altere secrets nem exponha credenciais para contornar uma falha de outro canal.

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
**Última atualização:** 2026
