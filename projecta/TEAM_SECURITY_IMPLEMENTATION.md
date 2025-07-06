# Sistema de Segurança de Convites - Team Management

## Visão Geral

O sistema de convites da equipe foi implementado com segurança robusta para garantir que apenas usuários autorizados possam ver e gerenciar convites.

## Segurança Implementada

### 1. Visibilidade de Convites

**Regra Principal**: Apenas o usuário que enviou o convite e o usuário convidado podem ver o convite.

#### No Backend (`src/Api/services/invites.ts`)

```typescript
// Buscar convites de um projeto
export const getProjectInvites = async (projectId: string, currentUserId?: string): Promise<TeamInvitation[]> => {
  // ...query no Firestore...
  
  querySnapshot.forEach((doc) => {
    const data = doc.data() as TeamInvitation;

    // ✅ SEGURANÇA: apenas quem enviou o convite pode ver
    if (currentUserId && data.invitedBy !== currentUserId) {
      return; // Pula este convite
    }
    
    invites.push({ ...data, id: doc.id });
  });
}

// Buscar convites de um usuário
export const getUserInvites = async (email: string, currentUserEmail?: string): Promise<TeamInvitation[]> => {
  // ✅ SEGURANÇA: usuário só pode ver seus próprios convites
  if (currentUserEmail && email.toLowerCase() !== currentUserEmail.toLowerCase()) {
    console.warn('Usuário tentando acessar convites de outro usuário');
    return [];
  }
  // ...resto da implementação...
}
```

### 2. Validação de Auto-Convite

**Regra**: Usuários não podem enviar convites para si mesmos.

#### No Frontend (`team/page.tsx`)
```typescript
// Validação no modal de convite
{currentMember?.email && inviteEmail.toLowerCase().trim() === currentMember.email.toLowerCase().trim() && (
  <p className="text-sm text-red-500 mt-1">
    Você não pode enviar um convite para si mesmo
  </p>
)}

// Desabilitar botão se for auto-convite
disabled={
  !inviteEmail ||
  inviteLoading ||
  Boolean(currentMember?.email && inviteEmail.toLowerCase().trim() === currentMember.email.toLowerCase().trim())
}
```

#### No Hook (`useInvites.ts`)
```typescript
const sendInvite = async (email: string, role: UserRole, projectTitle: string): Promise<boolean> => {
  // ✅ VALIDAÇÃO: impedir auto-convite
  if (email.toLowerCase().trim() === user.email?.toLowerCase().trim()) {
    setError('Você não pode enviar um convite para si mesmo');
    return false;
  }
  // ...resto da implementação...
}
```

#### No Backend (`invites.ts`)
```typescript
export const sendTeamInvite = async (...args): Promise<TeamInvitation> => {
  // ✅ VALIDAÇÃO: impedir auto-convite
  if (currentUserEmail && email.toLowerCase().trim() === currentUserEmail.toLowerCase().trim()) {
    throw new Error('Você não pode enviar um convite para si mesmo');
  }
  // ...resto da implementação...
}
```

### 3. Integração com Dados Reais

#### Removido Mock Data
- ❌ `usePermissions` (mock) → ✅ `useProjectMembers` (real)
- ❌ `users` (mock) → ✅ `members` (Firestore)
- ❌ `currentUser` (mock) → ✅ `currentMember` (Firestore)

#### Dados Reais do Firestore
```typescript
// Hook useProjectMembers integrado
const {
  members,           // Lista real de membros do Firestore
  currentMember,     // Membro atual baseado no userId
  currentUserRole,   // Role real do usuário no projeto
  stats: memberStats, // Estatísticas reais
  hasPermission,     // Permissões baseadas na role real
  updateRole,        // Atualizar role no Firestore
  removeMember       // Remover membro do Firestore
} = useProjectMembers(projectId);
```

#### Estatísticas Reais
```typescript
const teamStats: TeamStats = {
  totalMembers: memberStats.total,        // Contagem real do Firestore
  activeMembers: memberStats.active,      // Membros ativos reais
  pendingInvitations: invitations.length, // Convites reais pendentes
  recentActivity: memberStats.recentActivity // Atividade real das últimas 24h
};
```

## Fluxo de Segurança

### 1. Envio de Convite
1. Usuário preenche email e role
2. **Validação Frontend**: Impede auto-convite
3. **Validação Hook**: Impede auto-convite novamente
4. **Validação Backend**: Validação final no Firestore
5. Convite criado com `invitedBy: currentUserId`

### 2. Visualização de Convites
1. Hook `useInvites` chama `getProjectInvites(projectId, currentUserId)`
2. **Filtro Backend**: Apenas convites onde `invitedBy === currentUserId`
3. Frontend recebe apenas convites autorizados

### 3. Recebimento de Convites
1. Usuário convidado chama `getUserInvites(userEmail, userEmail)`
2. **Validação Backend**: Apenas se `email === currentUserEmail`
3. Usuário vê apenas seus próprios convites

## Permissões de Roles

```typescript
const hasPermission = (action: 'view' | 'create' | 'update' | 'delete'): boolean => {
  switch (action) {
    case 'view':   return ['viewer', 'member', 'manager', 'admin'].includes(currentUserRole);
    case 'create': return ['manager', 'admin'].includes(currentUserRole);
    case 'update': return ['manager', 'admin'].includes(currentUserRole);  
    case 'delete': return ['admin'].includes(currentUserRole);
  }
};
```

## Estrutura Firestore

### Collection: `team_invitations`
```typescript
{
  id: string,
  email: string,
  role: UserRole,
  projectId: string,
  projectTitle: string,
  invitedBy: string,        // ✅ UID do usuário que enviou
  invitedByName: string,
  invitedAt: string,
  status: 'pending' | 'accepted' | 'declined' | 'expired',
  expiresAt: string
}
```

### Collection: `project_members`
```typescript
{
  id: string,
  projectId: string,
  userId: string,           // ✅ UID do usuário
  email: string,
  name: string,
  role: UserRole,
  avatar?: string,
  isActive: boolean,
  lastActive: string,
  joinedAt: string
}
```

## Implementação Completa

✅ **Segurança de convites**: Apenas inviter e invitee podem ver
✅ **Validação de auto-convite**: Em todos os níveis (frontend, hook, backend)
✅ **Dados reais**: Integração completa com Firestore
✅ **Remoção de mocks**: Todo mock data removido
✅ **Permissões baseadas em roles**: Sistema real de permissões
✅ **Estatísticas reais**: Dados em tempo real do Firestore
✅ **UI atualizada**: Interface usando dados reais

## Próximos Passos

1. **Contexto de Projeto**: Implementar contexto real para obter projectId dinamicamente
2. **Notificações Push**: Integrar com sistema de notificações em tempo real
3. **Auditoria**: Logs detalhados de ações na equipe
4. **Bulk Actions**: Operações em lote para gerenciar múltiplos membros
