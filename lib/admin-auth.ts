export function getAdminResetRedirectUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.origin}/admin/reset-password`;
}

export function getAuthErrorMessage(message?: string | null) {
  if (!message) {
    return 'Es gab ein Problem mit der Anmeldung. Bitte versuchen Sie es erneut.';
  }

  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Die Kombination aus E-Mail und Passwort stimmt nicht.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Bitte bestaetigen Sie zuerst Ihre E-Mail-Adresse.';
  }

  if (normalizedMessage.includes('security purposes')) {
    return 'Bitte warten Sie kurz, bevor Sie einen weiteren Link anfordern.';
  }

  if (normalizedMessage.includes('same password')) {
    return 'Bitte waehlen Sie ein neues Passwort, das sich vom alten unterscheidet.';
  }

  if (normalizedMessage.includes('weak password')) {
    return 'Bitte waehlen Sie ein staerkeres Passwort mit mindestens 10 Zeichen.';
  }

  if (normalizedMessage.includes('session not found')) {
    return 'Der Reset-Link ist ungueltig oder abgelaufen. Fordern Sie bitte einen neuen Link an.';
  }

  return message;
}
