# WorldSticker

## A rede social para colecionadores de figurinhas da Copa do Mundo

WorldSticker é uma aplicação web desenvolvida com Vite, React, TypeScript, Supabase e shadcn/ui. O projeto simula uma rede social real para colecionadores de figurinhas digitais de atletas da Copa do Mundo, com autenticação, feed, perfis, coleção, curtidas, comentários, denúncias e mensagens privadas.

## Objetivo

O objetivo da WorldSticker é permitir que colecionadores compartilhem figurinhas digitais, interajam com outros usuários e organizem sua coleção pessoal com status como **Quero**, **Tenho** e **Repetida**.

A aplicação foi construída para demonstrar domínio de:

- CRUD completo com persistência real
- Autenticação com Supabase
- Banco de dados relacional
- Regras de autoria dos dados
- Interface responsiva
- Componentes reutilizáveis
- Deploy em ambiente web

## Tema da rede social

O tema escolhido foi uma rede social de colecionadores de figurinhas digitais da Copa do Mundo. A identidade visual usa cores inspiradas no Brasil e no futebol:

- Verde Brasil: `#009739`
- Amarelo: `#FEDD00`
- Azul: `#012169`
- Branco: `#FFFFFF`
- Escuro: `#0F172A`

A aplicação possui tema claro e escuro com alternância persistida no navegador.

## Tecnologias utilizadas

- Vite
- React
- TypeScript
- React Router DOM
- Supabase Auth
- Supabase Database
- Supabase Storage
- Tailwind CSS
- shadcn/ui
- Lucide React
- Sonner
- date-fns
- Vercel

## Funcionalidades implementadas

### Autenticação

A WorldSticker usa Supabase Auth para cadastro, login, logout e recuperação de senha. As páginas privadas são protegidas por rota e só podem ser acessadas por usuários autenticados.

Fluxos disponíveis:

- Criar conta
- Entrar na conta
- Sair da conta
- Recuperar senha
- Redirecionamento de usuários não autenticados
- Criação automática de perfil no banco após cadastro

### Feed

A página de feed mostra as figurinhas publicadas pelos colecionadores. Cada card exibe:

- Atleta
- Seleção
- Posição
- Número da camisa
- Status da figurinha
- Descrição
- Autor
- Avatar do autor
- Curtidas
- Comentários
- Ações de editar/excluir quando a figurinha pertence ao usuário logado

Os dados são buscados no Supabase e ordenados pelas publicações mais recentes.

### CRUD de figurinhas digitais

O CRUD principal da aplicação é o cadastro de figurinhas digitais.

Campos da figurinha:

- Nome do atleta
- Seleção
- Posição
- Número da camisa
- Imagem ou URL da imagem
- Status: Quero, Tenho ou Repetida
- Descrição curta

O usuário pode criar, visualizar, editar e excluir apenas as próprias figurinhas. As regras de autoria são aplicadas no frontend e reforçadas no banco por políticas RLS.

### Minha Coleção

A página **Minha Coleção** exibe apenas as figurinhas do usuário autenticado. Ela possui filtros por status:

- Todas
- Quero
- Tenho
- Repetida

Essa página funciona como o gerenciamento pessoal do álbum digital do usuário.

### Perfis

Cada usuário possui um perfil público com:

- Avatar
- Nome
- Nome de usuário
- Biografia
- Seleção favorita
- Quantidade de figurinhas
- Quantidade de seguidores
- Quantidade de seguindo
- Figurinhas publicadas

O usuário pode editar apenas o próprio perfil.

### Sistema de seguir usuários

A aplicação possui sistema de conexões entre colecionadores:

- Seguir usuário
- Deixar de seguir
- Contador de seguidores
- Contador de seguindo
- Bloqueio para não seguir a si mesmo

### Curtidas em postagens

Usuários autenticados podem curtir e remover curtida das figurinhas publicadas no feed. O banco impede curtidas duplicadas por meio de uma constraint única entre `user_id` e `sticker_id`.

### Comentários

Cada figurinha possui uma área de comentários. O usuário pode:

- Criar comentário
- Visualizar comentários
- Excluir o próprio comentário
- Curtir comentários
- Remover curtida de comentários
- Curtir o próprio comentário

### Aviso de regras da comunidade

Antes do primeiro comentário, a aplicação mostra um aviso com as regras da comunidade. Esse aviso aparece somente uma vez para cada usuário.

A confirmação é salva no campo `has_seen_comment_rules` da tabela `profiles`.

Regras exibidas:

> Não são permitidos comentários com spam, racismo, ofensas, violações dos direitos humanos, pornografia, incentivo à automutilação, incentivo ao abuso infantil ou qualquer conteúdo derivado dessas práticas.

### Denúncia de comentários

Comentários podem ser denunciados por violação de regras. Os motivos disponíveis são:

- Spam
- Racismo
- Ofensa
- Violação dos direitos humanos
- Pornografia
- Incentivo à automutilação
- Incentivo ao abuso infantil
- Outro

As denúncias são salvas na tabela `comment_reports`.

### Chat / Direct

A WorldSticker possui mensagens privadas entre usuários. A conversa pode ser aberta pelo perfil de outro colecionador.

O chat permite:

- Criar conversa
- Listar conversas
- Abrir conversa
- Enviar mensagem
- Visualizar histórico de mensagens

As mensagens são persistidas no Supabase.

### Tema claro e escuro

A aplicação possui alternância entre tema claro e escuro. A preferência é salva no navegador com a chave `worldsticker-theme`.

## Estrutura de páginas

### Páginas públicas

- `/` — Landing page
- `/login` — Login
- `/register` — Cadastro
- `/forgot-password` — Recuperação de senha

### Páginas privadas

- `/feed` — Feed principal
- `/collection` — Minha coleção
- `/sticker/create` — Criar figurinha
- `/sticker/:id` — Detalhes da figurinha
- `/sticker/edit/:id` — Editar figurinha
- `/profile/:id` — Perfil público
- `/edit-profile` — Editar meu perfil
- `/conversations` — Lista de conversas
- `/chat/:id` — Chat privado
- `/settings` — Configurações

## Estrutura de pastas

```txt
src/
  components/
    comments/
    layout/
    stickers/
    ui/
  hooks/
  lib/
  pages/
  routes/
  types/
  utils/
supabase/
  schema.sql
README.md
DEPLOY_AND_SETUP.md
.env.example
```

## Supabase

A aplicação usa três recursos principais do Supabase:

### Supabase Auth

Responsável por cadastro, login, sessão do usuário e recuperação de senha.

### Supabase Database

Responsável por armazenar:

- Perfis
- Figurinhas
- Curtidas
- Comentários
- Curtidas de comentários
- Denúncias
- Seguidores
- Conversas
- Participantes das conversas
- Mensagens

### Supabase Storage

Responsável por armazenar:

- Avatares dos usuários
- Imagens das figurinhas

Buckets utilizados:

- `avatars`
- `stickers`

## Arquivos importantes

- `supabase/schema.sql`: SQL completo do banco de dados
- `DEPLOY_AND_SETUP.md`: passo a passo para configurar Supabase, rodar localmente e publicar na Vercel
- `.env.example`: modelo das variáveis de ambiente

## Prints da aplicação

Adicione aqui prints após rodar o projeto:

- Landing page
- Feed
- Criar figurinha
- Minha coleção
- Perfil
- Chat
- Tema escuro

## Links da entrega

GitHub: `coloque aqui o link do repositório`

Vercel: `coloque aqui o link do deploy`

## Breve apresentação das funcionalidades

A WorldSticker é uma rede social de figurinhas digitais da Copa do Mundo. O usuário cria uma conta, edita seu perfil, publica figurinhas, interage com postagens por curtidas e comentários, denuncia comentários inadequados, segue outros colecionadores, troca mensagens privadas e organiza sua coleção pessoal por status.
