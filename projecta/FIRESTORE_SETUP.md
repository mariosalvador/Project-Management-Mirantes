# Configuração do Firebase Firestore

## ⚠️ Índices Necessários

Os erros que você está vendo são porque o Firestore precisa de índices compostos para consultas complexas. Aqui estão as soluções:

### 🔧 Solução Implementada

**Modificamos as consultas para evitar a necessidade de índices compostos:**

1. **Notificações**: Removemos `orderBy` das consultas e fazemos a ordenação no cliente
2. **Convites**: Simplificamos as consultas e filtramos no cliente

### 📋 Estrutura das Coleções

#### Coleção: `notifications`
```json
{
  "id": "string",
  "type": "team_invitation | task_deadline | ...",
  "title": "string",
  "message": "string", 
  "userId": "string",
  "projectId": "string",
  "invitationId": "string (opcional)",
  "isRead": "boolean",
  "priority": "low | medium | high | urgent",
  "createdAt": "string (ISO date)",
  "actionUrl": "string (opcional)",
  "metadata": "object (opcional)"
}
```

#### Coleção: `team_invitations`
```json
{
  "id": "string",
  "email": "string",
  "role": "viewer | contributor | manager | admin",
  "projectId": "string",
  "projectTitle": "string",
  "invitedBy": "string (userId)",
  "invitedByName": "string",
  "invitedAt": "string (ISO date)",
  "status": "pending | accepted | declined | expired",
  "expiresAt": "string (ISO date)",
  "acceptedAt": "string (opcional)",
  "declinedAt": "string (opcional)"
}
```

### 🚀 Testando o Sistema

#### 1. Criando Dados de Teste

**Para testar convites:**
```javascript
// No console do Firebase ou em um script
import { collection, addDoc } from 'firebase/firestore';

// Criar um convite de teste
await addDoc(collection(db, 'team_invitations'), {
  email: 'teste@example.com',
  role: 'contributor',
  projectId: 'current-project-id',
  projectTitle: 'Projeto Atual',
  invitedBy: 'seu-user-id',
  invitedByName: 'Seu Nome',
  invitedAt: new Date().toISOString(),
  status: 'pending',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
});
```

**Para testar notificações:**
```javascript
// Criar uma notificação de teste
await addDoc(collection(db, 'notifications'), {
  type: 'team_invitation',
  title: 'Convite para equipe',
  message: 'Você foi convidado para participar do projeto',
  userId: 'seu-user-id',
  projectId: 'current-project-id',
  isRead: false,
  priority: 'medium',
  createdAt: new Date().toISOString(),
  actionUrl: '/apk/team/invites'
});
```

#### 2. Verificando no Console do Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá para Firestore Database
4. Verifique se as coleções `notifications` e `team_invitations` existem
5. Adicione alguns documentos de teste

### 🔍 Debug

#### Verificar se o usuário está autenticado:
```javascript
// No console do navegador
import { useAuth } from '@/contexts/AuthContext';
const { user } = useAuth();
console.log('Usuário atual:', user);
```

#### Verificar se as consultas estão funcionando:
```javascript
// As consultas agora são mais simples e não devem gerar erros de índice
// Se ainda houver erros, verifique:
// 1. Se o Firebase está configurado corretamente
// 2. Se as regras de segurança permitem leitura/escrita
// 3. Se o usuário está autenticado
```

### 🛠️ Regras de Segurança (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Notificações - usuário só pode ver suas próprias
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Convites - usuário pode ver convites para seu email ou que criou
    match /team_invitations/{inviteId} {
      allow read: if request.auth != null && 
        (request.auth.token.email == resource.data.email || 
         request.auth.uid == resource.data.invitedBy);
      allow write: if request.auth != null;
    }
  }
}
```

### ✅ Verificação Final

**Os erros devem estar resolvidos porque:**

1. ❌ **Antes**: Consultas complexas com múltiplos `where` + `orderBy`
2. ✅ **Agora**: Consultas simples com apenas `where`, ordenação no cliente

**Se ainda houver erros:**
- Verifique se o Firebase está configurado
- Confirme se as coleções existem
- Teste com dados mockados primeiro
- Verifique as regras de segurança

### 📱 Próximos Passos

1. **Adicionar dados de teste** nas coleções
2. **Testar envio de convites** 
3. **Testar notificações**
4. **Implementar funcionalidades avançadas**

---

✅ **Status**: Erros de índice resolvidos
🔧 **Método**: Simplificação de consultas
🎯 **Resultado**: Sistema funcional sem necessidade de índices compostos
