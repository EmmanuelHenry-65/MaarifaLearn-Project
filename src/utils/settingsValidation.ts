// Pure validation functions for the Settings page. Each returns a user-facing
// error string, or null when the value is valid — keeps form components free
// of validation logic so the rules can be unit-tested in isolation.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export const AVATAR_MAX_BYTES = 3 * 1024 * 1024; // 3MB
export const AVATAR_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function validateFullName(value: string): string | null {
  if (!value.trim()) return 'Name is required.';
  if (value.trim().length < 2) return 'Name must be at least 2 characters.';
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Email is required.';
  if (!EMAIL_PATTERN.test(value.trim())) return 'Enter a valid email address.';
  return null;
}

// Optional field (existing accounts may not have picked one yet) — only
// validated for format once the user actually enters something.
export function validateUsername(value: string): string | null {
  if (!value.trim()) return null;
  if (!USERNAME_PATTERN.test(value.trim())) {
    return 'Username must be 3-20 characters and contain only letters, numbers, or underscores.';
  }
  return null;
}

// Applied only to the "new password" field during a password change.
export function validatePasswordStrength(value: string): string | null {
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(value)) return 'Password must include an uppercase letter.';
  if (!/[a-z]/.test(value)) return 'Password must include a lowercase letter.';
  if (!/[0-9]/.test(value)) return 'Password must include a number.';
  return null;
}

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
    return 'Please upload a PNG, JPEG, or WEBP image.';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Image must be smaller than 3MB.';
  }
  return null;
}
