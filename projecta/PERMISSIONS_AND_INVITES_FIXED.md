# Correções de Permissões e Convites - Sistema de Equipe

## Problemas Identificados e Soluções

### 1. **Problema**: Usuários não conseguiam ver convites que enviaram
**Causa**: Sistema estava baseado apenas em roles de projeto
**Solução**: ✅ Implementada lógica de "dono do projeto" baseada no ID do projeto

### 2. **Problema**: Qualquer usuário deveria poder criar seus próprios projetos
**Causa**: Permissões muito restritivas
**Solução**: ✅ Adicionada função `isProjectOwner()` que permite ações completas no próprio projeto

### 3. **Problema**: Convites não apareciam para o criador
**Causa**: Filtragem incorreta na UI
**Solução**: ✅ Melhorada lógica de permissões para incluir donos de projeto

## Mudanças Implementadas

### 1. Nova Lógica de Permissões (`team/page.tsx`)

```typescript
// Verificar se o usuário é o dono do projeto (baseado no projectId)
const isProjectOwner = () => {
  return projectId === `project-${user?.uid}`;
};

// Verificar se o usuário pode convidar (dono do projeto OU tem permissão)
const canInvite = () => {
  return isProjectOwner() || hasPermission('create');
};
```

### 2. Condições de UI Atualizadas

#### Botão "Convidar Membro"
```typescript
{(canInvite() || currentUserRole === null) && (
  <Button 
    onClick={() => setIsInviteModalOpen(true)} 
    className="gap-2"
    disabled={currentUserRole === null && !isProjectOwner()}
  >
    <UserPlus className="h-4 w-4" />
    {currentUserRole === null && !isProjectOwner() ? 'Carregando...' : 'Convidar Membro'}
  </Button>
)}
```

#### Ações de Membros (Alterar Role/Remover)
```typescript
// Mostrar menu se é dono do projeto OU tem permissão
{(hasPermission('update') || isProjectOwner()) && member.userId !== currentMember?.userId && member.userId !== user?.uid && (
  <DropdownMenu>
    // ... menu de ações
  </DropdownMenu>
)}
```

### 3. Validação Anti-Auto-Convite Melhorada

```typescript
// Validação: impedir auto-convite
if (currentMember?.email && inviteEmail.toLowerCase().trim() === currentMember.email.toLowerCase().trim()) {
  showToast("Você não pode enviar um convite para si mesmo.", "error");
  return;
}

// Também verificar com o email do usuário logado se não há currentMember
if (!currentMember && user?.email && inviteEmail.toLowerCase().trim() === user.email.toLowerCase().trim()) {
  showToast("Você não pode enviar um convite para si mesmo.", "error");
  return;
}
```

### 4. Logs de Debug Adicionados

#### No Serviço de Convites (`invites.ts`)
```typescript
console.log('getProjectInvites chamado com:', { projectId, currentUserId });
console.log('Convite encontrado:', { id: doc.id, invitedBy: data.invitedBy, currentUserId, email: data.email });
console.log(`Retornando ${filteredInvites.length} convites filtrados`);
```

#### No Hook (`useInvites.ts`)
```typescript
console.log('Buscando convites para projeto:', projectId, 'usuário:', user?.uid);
console.log(`Carregados ${invites.length} convites para o projeto ${projectId}:`, invites);
```

## Fluxo de Permissões Atualizado

### 1. **Dono do Projeto** (`project-${user.uid}`)
- ✅ Pode convidar qualquer role
- ✅ Pode alterar roles de qualquer membro
- ✅ Pode remover qualquer membro (exceto a si mesmo)
- ✅ Vê todos os convites que enviou
- ✅ Pode promover membros a admin

### 2. **Admin do Projeto** (convidado como admin)
- ✅ Pode convidar qualquer role
- ✅ Pode alterar roles de qualquer membro
- ✅ Pode remover qualquer membro
- ✅ Vê todos os convites que enviou
- ✅ Pode promover membros a admin

### 3. **Manager do Projeto** (convidado como manager)
- ✅ Pode convidar viewer, member, manager
- ✅ Pode alterar roles (exceto para admin)
- ❌ Não pode remover membros
- ✅ Vê todos os convites que enviou

### 4. **Member/Viewer do Projeto**
- ❌ Não pode convidar
- ❌ Não pode alterar roles
- ❌ Não pode remover membros
- ❌ Não vê convites (porque não pode enviar)

## Sistema de Convites

### Segurança Mantida
- ✅ **Backend**: Apenas `invitedBy === currentUserId` pode ver convites
- ✅ **Frontend**: Validação visual e funcional
- ✅ **Hook**: Validação de dados

### Visibilidade
- ✅ **Convites Enviados**: Apenas quem enviou pode ver e cancelar
- ✅ **Convites Recebidos**: Apenas o destinatário pode ver e aceitar/recusar

## Como Testar

### 1. **Criar Próprio Projeto**
1. Fazer login
2. Navegar para Team page
3. ✅ Botão "Convidar Membro" deve aparecer (mesmo sem role definido)
4. ✅ Usuário é automaticamente criado como admin do projeto

### 2. **Enviar Convites**
1. Clicar em "Convidar Membro"
2. Inserir email e role
3. ✅ Convite deve ser enviado
4. ✅ Deve aparecer em "Convites Pendentes"

### 3. **Gerenciar Membros**
1. ✅ Deve poder alterar roles de membros
2. ✅ Deve poder remover membros
3. ✅ Não pode alterar próprio role ou remover a si mesmo

### 4. **Logs de Debug**
- Abrir DevTools > Console
- ✅ Ver logs detalhados de convites e permissões

## Estrutura de Projeto

```
Projeto: project-{userId}
├── Criador: userId (automaticamente admin)
├── Membros Convidados: roles definidos pelo criador
└── Convites: enviados pelo criador ou admins/managers
```

## Próximos Passos

1. **Múltiplos Projetos**: Sistema para criar e gerenciar múltiplos projetos
2. **Contexto Dinâmico**: ProjectContext real ao invés de baseado em userId
3. **Templates de Projetos**: Projetos pré-configurados com roles
4. **Convites em Lote**: Convidar múltiplos usuários de uma vez
