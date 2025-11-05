import { Filter } from 'bad-words';

// Initialize profanity filter
const filter = new Filter();

// Add Arsenal-specific inappropriate terms
const arsenalBlocklist: string[] = [
  // Add rival team offensive terms if needed
];

filter.addWords(...arsenalBlocklist);

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}

/**
 * Clean profanity from text (replace with asterisks)
 */
export function cleanProfanity(text: string): string {
  return filter.clean(text);
}

/**
 * Validate username for profanity and inappropriate content
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (containsProfanity(username)) {
    return {
      valid: false,
      error: 'Username contains inappropriate language. Please choose a different username.',
    };
  }

  return { valid: true };
}
