# Refatoração do Software Regulatório

Data: 12/10/2026. Branch de trabalho: `mvp_develop`.

## Escopo e preservação

A identificação de cliente foi removida das rotas, menus, middleware, AuthGuard, tabelas, formulários e hooks. A seleção em lote, o cadastro de áreas e a criticidade dos temas passam a ser comportamentos permanentes, com as mesmas permissões, validações e proteções de negócio anteriores.

Todas as páginas e funcionalidades foram mantidas: dashboards, correspondências, solicitações, obrigações, edição e conferência, caixa de entrada e detalhe do e-mail, áreas, temas, responsáveis, concessionárias e FAQ. Os relatórios PDF e Excel, anexos, tramitações e configuração LDAP permanecem disponíveis.

Não houve alterações em `src/api`, nos DTOs, nos endpoints, nos payloads, nos cookies, nos stores, nos contextos de dados ou nas definições de permissões. A seleção de concessionária continua definindo o escopo dos dados enviados à API por `idConcessionaria`. Removê-la quebraria o isolamento de dados e os contratos existentes; ela não representa seleção de marca ou cliente de layout.

Os únicos módulos TypeScript excluídos são os dois antigos arquivos de configuração de identidade por cliente. Nenhuma página, componente de funcionalidade, serviço de API ou hook foi excluído.

## Identidade visual

O nome único é definido em `src/lib/branding.ts` e utilizado no login, cabeçalho, metadados, título da aba e nos quatro relatórios PDF. O nome do pacote também foi atualizado nos manifests e lockfiles.

Recursos visuais:

- `public/images/mvp/mvp-logo.png`, `mvp-favicon.png` e `mvp-background-login.png`: as mesmas imagens já usadas no MVP, em login, aba e relatórios PDF.
- `public/images/importacao-planilha-obrigacoes.svg` e `.png`: exemplo recriado com as mesmas onze colunas e instrução de nome da aba, usando dados fictícios sem marcas.

Foram removidos os antigos diretórios de imagens por cliente, todos os seus logos, favicons e fundos, além das duas fotografias antigas de rodovia sem uso. O avatar genérico foi preservado. As cores funcionais compartilhadas de estados, alertas e controles foram preservadas; os novos símbolos e fundos não reproduzem a identidade anterior.

Também foram removidos os workflows exclusivos do outro ambiente e os metadados locais do IDE que carregavam a identidade anterior. O utilitário de implantação foi preservado e passou a receber suas configurações pelo ambiente.

## Verificações e limites

- Compilação de produção com geração de todas as rotas.
- TypeScript verificado separadamente, pois a configuração preexistente do Next ignora erros de tipos durante o build.
- Doze testes em `tests/frontend.test.cjs`: permissões de todas as rotas e subrotas, cookies, menus, middleware, cinco barras de seleção em lote, paginação de seleção com exclusões de negócio, existência dos assets e incorporação do logo em PDF.
- Login conferido no navegador, incluindo o título da aba, logo, fundo e mensagens de usuário e senha obrigatórios.
- Inventário de rotas e comparação dos diretórios de API, contextos, stores e permissões com a revisão anterior.
- Busca global em código, documentação, configurações, arquivos ocultos, nomes de arquivos e assets; inspeção visual das imagens antigas e das substituições.

O lint completo identifica três erros preexistentes de `no-explicit-any`: dois em `src/components/areas/FilterModalArea.tsx` e um em `src/providers/ApiProvider.tsx`. A comparação com a revisão anterior confirmou os mesmos erros. Eles não foram suprimidos nem modificados nesta refatoração.

Não foi realizada homologação autenticada contra a API de produção: não havia sessão ou credenciais fornecidas. Compilação e testes locais não substituem a verificação dos fluxos de cadastro, edição, exclusão, importação e tramitação com usuários reais e diferentes permissões. Nenhum dado de produção foi alterado.

## Identificadores técnicos preservados e migração

Os workflows do MVP mantêm a URL operacional `https://deploy.correspondencias.rtechsolution.com.br/correspondencias/web`, os nomes de imagem/container (`correspondencias-web`, `correspondencias-web-dev`, `correspondencias-web-prd`) e os secrets `ENV_FILE_MVP_DEV` e `ENV_FILE_MVP_PRD`. Homologação publica no push de `mvp_develop` e envia a branch `develop_mvp` para o deploy acompanhar o backend. Produção publica no push de `main` e envia a branch `main`. A identidade do fornecedor no DNS é uma dependência de infraestrutura, não branding da aplicação.

Para migrar esses identificadores com segurança: provisionar e validar um endpoint neutro com o mesmo contrato, registrar os novos secrets e aliases de imagem/container, testar build e rollback em homologação e somente depois trocar os workflows. Manter os aliases anteriores até confirmar que não há consumidores. Não houve publicação nesta tarefa.

O script `deployment/deploy-web.py` mantém preparação, verificação de versão, health check, troca de processo e rollback. Antes de usá-lo, configurar:

| Variável | Uso |
| --- | --- |
| `FRONTEND_REPOSITORY_DIR` | Caminho absoluto do checkout existente; obrigatório |
| `FRONTEND_DEPLOY_DIR` | Diretório existente de logs, releases e recuperação; obrigatório |
| `FRONTEND_PROCESS_NAME` | Nome do processo PM2 existente; padrão neutro `software-regulatorio-dev` |
| `FRONTEND_SOURCE_BRANCH` | Branch autorizada para releases; padrão `mvp_develop` |
| `FRONTEND_RELEASE_MARKER` | Nome do marcador já existente nas releases; padrão neutro `software-regulatorio-release.json` |
| `FRONTEND_NODE_BIN` | Diretório de binários Node, quando necessário |

Na migração de um servidor existente, informar inicialmente os caminhos, processo, branch e marcador atuais por essas variáveis, preservando `HOME` e `PM2_HOME` no ambiente do serviço. Validar health check e recuperação em homologação antes de renomear diretórios ou processos. Não reiniciar, renomear ou recriar processos de produção apenas para mudar a identidade visual. O script não foi executado contra servidores.

Ocorrências parciais em `always`, nomes de pacotes de terceiros e hashes de integridade não são referências à marca; foram mantidas para não alterar bibliotecas, verificações de integridade ou política de atualização de dados. O diretório local do checkout e o histórico/metadados Git também não foram renomeados: não integram a identidade entregue ao navegador. Caches e dependências instaladas não foram editados para apagar palavras de terceiros.
