import { Filter } from 'bad-words';

// Initialize profanity filter
const filter = new Filter();

// Arsenal-specific exceptions (legitimate words that might be flagged)
const arsenalExceptions: string[] = [
  'arsenal',
  'gunners',
  'cannon',
  'gooner',
  'arteta',
  'emirates',
  'highbury',
  'invincibles',
  'gunner',
  'coyg', // Come On You Gunners
];

// Remove Arsenal-specific terms from the filter
filter.removeWords(...arsenalExceptions);

// Add Arsenal-specific inappropriate terms if needed
const arsenalBlocklist: string[] = [
  // Add rival team offensive terms if needed
];

if (arsenalBlocklist.length > 0) {
  filter.addWords(...arsenalBlocklist);
}

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
