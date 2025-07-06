/**
 * Utilitários para validação de convites de equipe
 */

/**
 * Verifica se um email é válido para convite (não é o próprio usuário)
 * @param inviteEmail Email do convite
 * @param currentUserEmail Email do usuário atual
 * @returns true se o convite é válido, false caso contrário
 */
export const isValidInviteEmail = (
  inviteEmail: string,
  currentUserEmail?: string
): boolean => {
  if (!currentUserEmail || !inviteEmail) return true;

  return inviteEmail.toLowerCase().trim() !== currentUserEmail.toLowerCase().trim();
};

/**
 * Retorna mensagem de erro para convite inválido
 * @param inviteEmail Email do convite
 * @param currentUserEmail Email do usuário atual
 * @returns string com a mensagem de erro ou null se válido
 */
export const getInviteValidationError = (
  inviteEmail: string,
  currentUserEmail?: string
): string | null => {
  if (!currentUserEmail || !inviteEmail) return null;

  if (inviteEmail.toLowerCase().trim() === currentUserEmail.toLowerCase().trim()) {
    return 'Você não pode enviar um convite para si mesmo';
  }

  return null;
};

/**
 * Verifica se um usuário já está na equipe
 * @param email Email para verificar
 * @param teamMembers Lista de membros da equipe
 * @returns true se o usuário já está na equipe
 */
export const isUserAlreadyInTeam = (
  email: string,
  teamMembers: Array<{ email: string }>
): boolean => {
  return teamMembers.some(
    member => member.email.toLowerCase() === email.toLowerCase()
  );
};

/**
 * Verifica se já existe um convite pendente para o email
 * @param email Email para verificar
 * @param pendingInvites Lista de convites pendentes
 * @returns true se já existe um convite pendente
 */
export const hasExistingInvite = (
  email: string,
  pendingInvites: Array<{ email: string; status: string }>
): boolean => {
  return pendingInvites.some(
    invite => invite.email.toLowerCase() === email.toLowerCase() &&
      invite.status === 'pending'
  );
};
