// Utilitaires de validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Format français : 10 chiffres commençant par 0
  const phoneRegex = /^0[1-9](?:[0-9]{8})$/;
  const cleaned = phone.replace(/\s/g, '');
  return phoneRegex.test(cleaned);
};

export const isValidPostalCode = (postalCode: string): boolean => {
  // Code postal français : 5 chiffres
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
};

export const isValidSIRET = (siret: string): boolean => {
  // SIRET français : 14 chiffres
  const siretRegex = /^[0-9]{14}$/;
  const cleaned = siret.replace(/\s/g, '');
  return siretRegex.test(cleaned);
};

export const isValidIBAN = (iban: string): boolean => {
  // IBAN français : FR + 2 chiffres + 23 caractères alphanumériques
  const ibanRegex = /^FR[0-9]{2}[A-Z0-9]{23}$/;
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return ibanRegex.test(cleaned);
};

export const validateRequired = (value: any): string | null => {
  if (value === null || value === undefined || value === '') {
    return 'Ce champ est requis';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return 'L\'email est requis';
  if (!isValidEmail(email)) return 'Format d\'email invalide';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Le téléphone est requis';
  if (!isValidPhone(phone)) return 'Format de téléphone invalide (ex: 06 12 34 56 78)';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Le mot de passe est requis';
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
  if (!/(?=.*[a-z])/.test(password)) return 'Le mot de passe doit contenir au moins une minuscule';
  if (!/(?=.*[A-Z])/.test(password)) return 'Le mot de passe doit contenir au moins une majuscule';
  if (!/(?=.*\d)/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre';
  return null;
};

export const validateAmount = (amount: number, min = 0): string | null => {
  if (isNaN(amount)) return 'Montant invalide';
  if (amount < min) return `Le montant doit être supérieur ou égal à ${min}`;
  return null;
};

export const validateDate = (date: string | Date): string | null => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Date invalide';
  return null;
};

export const validateFutureDate = (date: string | Date): string | null => {
  const dateValidation = validateDate(date);
  if (dateValidation) return dateValidation;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  if (dateObj <= now) return 'La date doit être dans le futur';
  return null;
};

export const validatePastDate = (date: string | Date): string | null => {
  const dateValidation = validateDate(date);
  if (dateValidation) return dateValidation;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  if (dateObj >= now) return 'La date doit être dans le passé';
  return null;
};
