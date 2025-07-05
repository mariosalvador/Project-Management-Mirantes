# Configuração do Login com Google - Firebase

## Passos para habilitar o login com Google no Firebase Console:

### 1. **Habilitar Autenticação por Email/Password (se ainda não fez):**
1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto (`teste-a0a09`)
3. No menu lateral, clique em **"Authentication"**
4. Vá para a aba **"Sign-in method"**
5. Encontre **"Email/Password"** na lista de provedores
6. Clique no ícone de edição (lápis) ao lado
7. **Habilite** a opção "Email/Password"
8. Clique em **"Save"**

### 2. **Habilitar Autenticação com Google:**
1. Na mesma tela (Authentication → Sign-in method)
2. Encontre **"Google"** na lista de provedores
3. Clique no ícone de edição (lápis) ao lado
4. **Habilite** a opção "Google"
5. **Importante:** Adicione um email de suporte do projeto (obrigatório)
6. Clique em **"Save"**

### 3. **Configurar domínios autorizados (se necessário):**
1. Na mesma tela, role para baixo até **"Authorized domains"**
2. Adicione `localhost` para desenvolvimento (geralmente já está)
3. Adicione seu domínio de produção quando for fazer deploy

## ✅ **Funcionalidades implementadas:**

- ✅ Login com email/senha
- ✅ Login com Google (popup)
- ✅ Tratamento de erros específicos para ambos os métodos
- ✅ Loading states durante autenticação
- ✅ Redirecionamento automático após login bem-sucedido
- ✅ Interface responsiva e acessível

## 🔧 **Erros comuns e soluções:**

### `auth/operation-not-allowed`
- **Causa:** Método de autenticação não habilitado no Firebase
- **Solução:** Habilite Email/Password ou Google no Firebase Console

### `auth/popup-blocked`
- **Causa:** Navegador bloqueou o popup do Google
- **Solução:** Usuário deve permitir popups para o site

### `auth/popup-closed-by-user`
- **Causa:** Usuário fechou a janela de login do Google
- **Solução:** Informar ao usuário para tentar novamente

## 🚀 **Próximos passos:**
1. Habilite Google Authentication no Firebase Console
2. Teste o login com Google
3. Considere implementar logout
4. Adicione persistência de estado de autenticação
