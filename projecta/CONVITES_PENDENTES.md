# Sistema de Convites Pendentes - Documentação

## Visão Geral

Esta implementação adiciona a funcionalidade de detecção e notificação automática de convites pendentes quando um usuário cria uma conta ou faz login no sistema.

## Funcionalidades Implementadas

### 1. Detecção Automática de Convites Pendentes

Quando um usuário **cria uma conta** ou **faz login**, o sistema:
- Busca automaticamente por convites pendentes vinculados ao email do usuário
- Verifica a validade dos convites (não expirados)
- Cria notificações apenas para convites válidos
- Evita duplicação de notificações

### 2. Diferenciação entre Novo Usuário e Login

O sistema distingue entre:
- **Novo usuário** (primeira vez criando conta): Mostra mensagem de boas-vindas especial
- **Usuário existente** (fazendo login): Verifica convites pendentes normalmente

### 3. Componentes Visuais

#### WelcomeWithInvites
- Modal especial para novos usuários com convites pendentes
- Mostra mensagem de boas-vindas personalizada
- Permite aceitar/recusar convites diretamente

#### PendingInvitesCard
- Card reutilizável para exibir convites pendentes
- Mostra informações detalhadas do convite (projeto, papel, quem convidou)
- Botões para aceitar/recusar convites

### 4. Hook Personalizado

#### usePendingInvites
- Gerencia estado dos convites pendentes
- Fornece funções para verificar e atualizar convites
- Integração automática com contexto de autenticação

## Arquivos Modificados/Criados

### Serviços (API)
- `src/Api/services/invites.ts` - Lógica principal de convites
- `src/Api/services/auth.ts` - Integração com autenticação

### Hooks
- `src/hooks/usePendingInvites.ts` - Hook para gerenciar convites pendentes

### Componentes
- `src/components/projecta/Notification/pending-invites-card.tsx` - Card de convites
- `src/components/projecta/Notification/welcome-with-invites.tsx` - Modal de boas-vindas

### Layout
- `src/app/Layout/layout-with-sidebar.tsx` - Integração do modal de boas-vindas

## Fluxo de Funcionamento

### Para Novo Usuário:
1. Usuário recebe convite por email (convite fica pendente no banco)
2. Usuário cria conta usando o mesmo email do convite
3. Sistema detecta convites pendentes automaticamente
4. Modal de boas-vindas é exibido com os convites
5. Usuário pode aceitar/recusar convites diretamente

### Para Usuário Existente:
1. Usuário faz login normalmente
2. Sistema verifica convites pendentes
3. Cria notificações se houver convites novos
4. Usuário vê notificações no centro de notificações

## Principais Funções

### `checkPendingInvitesOnLogin`
```typescript
checkPendingInvitesOnLogin(email: string, userId: string, isNewUser: boolean)
```
- Busca convites pendentes por email
- Cria notificações evitando duplicatas
- Diferencia mensagens para novos usuários

### `getPendingInvitesByEmail`
```typescript
getPendingInvitesByEmail(email: string): Promise<TeamInvitation[]>
```
- Função pública para buscar convites por email
- Remove restrições de segurança para permitir busca antes do login

### `notificationExistsForInvite`
```typescript
notificationExistsForInvite(userId: string, inviteId: string): Promise<boolean>
```
- Verifica se já existe notificação para um convite específico
- Previne duplicação de notificações

## Melhorias de Segurança

- Verificação de validade dos convites (data de expiração)
- Prevenção de duplicação de notificações
- Validação de email antes de criar notificações
- Limpeza automática de notificações duplicadas

## Integração com UI

O sistema está totalmente integrado com:
- Sistema de notificações existente
- Toast notifications (sonner)
- Design system (shadcn/ui)
- Responsividade mobile/desktop

## Próximos Passos (Opcionais)

1. **Email de lembrete**: Enviar emails automáticos para usuários com convites pendentes
2. **Painel administrativo**: Interface para gerenciar convites em massa
3. **Analytics**: Métricas de aceitação/recusa de convites
4. **Integração com calendário**: Lembretes baseados em datas de expiração

## Dependências

- Firebase Firestore (banco de dados)
- React/Next.js (frontend)
- Lucide React (ícones)
- Sonner (toast notifications)
- date-fns (formatação de datas)
- shadcn/ui (componentes UI)
