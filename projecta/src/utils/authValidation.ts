
// Tipos para os erros de autenticação
export interface AuthError {
  code?: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida um endereço de email
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: "Email é obrigatório." };
  }

  if (!email.includes('@')) {
    return { isValid: false, error: "Email deve conter @." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Email inválido. Verifique o formato do email." };
  }

  return { isValid: true };
};

/**
 * Valida uma senha
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Senha é obrigatória." };
  }

  if (password.length < 6) {
    return { isValid: false, error: "A senha deve ter pelo menos 6 caracteres." };
  }

  return { isValid: true };
};

/**
 * Valida confirmação de senha
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: "Confirmação de senha é obrigatória." };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "As senhas não coincidem." };
  }

  return { isValid: true };
};

/**
 * Valida nome completo
 */
export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: "Nome é obrigatório." };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: "Nome deve ter pelo menos 2 caracteres." };
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: "Nome deve ter no máximo 100 caracteres." };
  }

  return { isValid: true };
};

/**
 * Valida todos os campos de registro
 */
export const validateRegistrationForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  const confirmPasswordValidation = validatePasswordConfirmation(password, confirmPassword);
  if (!confirmPasswordValidation.isValid) {
    return confirmPasswordValidation;
  }

  return { isValid: true };
};

/**
 * Valida campos de login
 */
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  if (!password) {
    return { isValid: false, error: "Senha é obrigatória." };
  }

  return { isValid: true };
};

/**
 * Converte erros do Firebase para mensagens em português
 */
export const handleFirebaseAuthError = (error: unknown): string => {
  const authError = error as AuthError;
  const firebaseError = error as { code?: string };

  // Erros customizados do nosso sistema
  if (authError.message === 'USER_NOT_FOUND') {
    return "Conta não encontrada. Verifique se você já se cadastrou ou cadastre-se primeiro.";
  }

  if (authError.message === 'WRONG_PASSWORD') {
    return "Senha incorreta. Tente novamente.";
  }

  if (authError.message === 'INVALID_EMAIL') {
    return "Email inválido. Verifique o formato do email.";
  }

  if (authError.message === 'USER_DISABLED') {
    return "Conta desabilitada. Entre em contato com o suporte.";
  }

  if (authError.message === 'TOO_MANY_REQUESTS') {
    return "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.";
  }

  if (authError.message === 'EMAIL_ALREADY_EXISTS') {
    return "Este email já está cadastrado. Tente fazer login ou use outro email.";
  }

  // Erros do Google Sign-In
  if (authError.message === 'POPUP_CLOSED') {
    return "Login cancelado. A janela foi fechada.";
  }

  if (authError.message === 'POPUP_BLOCKED') {
    return "Pop-up bloqueado. Permita pop-ups para este site e tente novamente.";
  }

  if (authError.message === 'POPUP_CANCELLED') {
    return "Login cancelado.";
  }

  // Códigos de erro do Firebase
  switch (firebaseError.code) {
    case 'auth/operation-not-allowed':
      return "Método de autenticação não habilitado. Contate o administrador.";

    case 'auth/user-not-found':
      return "Conta não encontrada. Verifique se você já se cadastrou ou cadastre-se primeiro.";

    case 'auth/wrong-password':
      return "Senha incorreta. Tente novamente.";

    case 'auth/invalid-email':
      return "Email inválido. Verifique o formato do email.";

    case 'auth/user-disabled':
      return "Conta desabilitada. Entre em contato com o suporte.";

    case 'auth/too-many-requests':
      return "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.";

    case 'auth/email-already-in-use':
      return "Este email já está cadastrado. Tente fazer login ou use outro email.";

    case 'auth/weak-password':
      return "Senha muito fraca. Use uma senha mais forte.";

    case 'auth/popup-closed-by-user':
      return "Login cancelado. A janela foi fechada.";

    case 'auth/popup-blocked':
      return "Pop-up bloqueado. Permita pop-ups para este site e tente novamente.";

    case 'auth/cancelled-popup-request':
      return "Login cancelado.";

    case 'auth/network-request-failed':
      return "Erro de conexão. Verifique sua internet e tente novamente.";

    case 'auth/timeout':
      return "Tempo limite excedido. Tente novamente.";

    default:
      return "Erro inesperado. Tente novamente.";
  }
};

/**
 * Trata erros específicos do Google Sign-In
 */
export const handleGoogleSignInError = (error: unknown): string => {
  const authError = error as AuthError;
  const firebaseError = error as { code?: string };

  if (authError.message === 'POPUP_CLOSED') {
    return "Login cancelado. A janela foi fechada.";
  }

  if (authError.message === 'POPUP_BLOCKED') {
    return "Pop-up bloqueado. Permita pop-ups para este site e tente novamente.";
  }

  if (authError.message === 'POPUP_CANCELLED') {
    return "Login cancelado.";
  }

  switch (firebaseError.code) {
    case 'auth/operation-not-allowed':
      return "Login com Google não habilitado. Contate o administrador.";

    case 'auth/popup-closed-by-user':
      return "Login cancelado. A janela foi fechada.";

    case 'auth/popup-blocked':
      return "Pop-up bloqueado. Permita pop-ups para este site e tente novamente.";

    case 'auth/cancelled-popup-request':
      return "Login cancelado.";

    case 'auth/network-request-failed':
      return "Erro de conexão. Verifique sua internet e tente novamente.";

    default:
      return "Erro ao fazer login com Google. Tente novamente.";
  }
};

/**
 * Formata uma mensagem de sucesso para diferentes ações
 */
export const getSuccessMessage = (action: 'login' | 'register' | 'logout'): string => {
  switch (action) {
    case 'login':
      return "Login realizado com sucesso!";

    case 'register':
      return "Conta criada com sucesso! Redirecionando...";

    case 'logout':
      return "Logout realizado com sucesso!";

    default:
      return "Operação realizada com sucesso!";
  }
};
