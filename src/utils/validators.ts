export const ACCEPTED_FILE_TYPES = {
  pdf: 'application/pdf',
  jpeg: 'image/jpeg',
  jpg: 'image/jpg',
  png: 'image/png',
  webp: 'image/webp',
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const FREE_PLAN_UPLOAD_LIMIT = 2;

export function validateFile(file: File): { valid: boolean; error?: string } {
  const acceptedTypes = Object.values(ACCEPTED_FILE_TYPES);

  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type. Please upload a PDF or image (JPG, PNG, WEBP).`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size is 10MB.`,
    };
  }

  return { valid: true };
}

export function getFileType(file: File): 'pdf' | 'image' {
  return file.type === 'application/pdf' ? 'pdf' : 'image';
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  return { valid: errors.length === 0, errors };
}
