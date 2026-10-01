/**
 * Helper to compute user initials based on name or email.
 * - Single word name (e.g. "Krishna") -> "K"
 * - Multi-word name (e.g. "Krishna Kirola") -> "KK" (first name initial + surname initial)
 * - Three or more words (e.g. "Krishna Kumar Kirola") -> "KK" (first word + surname)
 * - Fallback to email prefix or 'U' if no name provided
 */
export function getInitials(name, email = '') {
  const cleanName = (typeof name === 'string' ? name : '').trim();
  if (cleanName) {
    const spaceParts = cleanName.split(/\s+/).filter(Boolean);
    if (spaceParts.length >= 2) {
      const first = spaceParts[0].replace(/[^a-zA-Z0-9]/g, '');
      const last = spaceParts[spaceParts.length - 1].replace(/[^a-zA-Z0-9]/g, '');
      const firstChar = first ? first.charAt(0).toUpperCase() : spaceParts[0].charAt(0).toUpperCase();
      const lastChar = last ? last.charAt(0).toUpperCase() : spaceParts[spaceParts.length - 1].charAt(0).toUpperCase();
      return `${firstChar}${lastChar}`;
    }

    // If single word with dots/underscores (e.g. "krishna.kirola")
    const dotParts = cleanName.split(/[._-]+/).filter(Boolean);
    if (dotParts.length >= 2) {
      const first = dotParts[0].replace(/[^a-zA-Z0-9]/g, '');
      const last = dotParts[dotParts.length - 1].replace(/[^a-zA-Z0-9]/g, '');
      const firstChar = first ? first.charAt(0).toUpperCase() : dotParts[0].charAt(0).toUpperCase();
      const lastChar = last ? last.charAt(0).toUpperCase() : dotParts[dotParts.length - 1].charAt(0).toUpperCase();
      return `${firstChar}${lastChar}`;
    }

    const single = cleanName.replace(/[^a-zA-Z0-9]/g, '') || cleanName;
    return single.charAt(0).toUpperCase() || 'U';
  }

  const cleanEmail = (typeof email === 'string' ? email : '').trim();
  if (cleanEmail) {
    const prefix = cleanEmail.split('@')[0].trim();
    const parts = prefix.split(/[._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0].replace(/[^a-zA-Z0-9]/g, '');
      const last = parts[parts.length - 1].replace(/[^a-zA-Z0-9]/g, '');
      const firstChar = first ? first.charAt(0).toUpperCase() : parts[0].charAt(0).toUpperCase();
      const lastChar = last ? last.charAt(0).toUpperCase() : parts[parts.length - 1].charAt(0).toUpperCase();
      return `${firstChar}${lastChar}`;
    }
    if (parts.length === 1 && parts[0].length > 0) {
      const single = parts[0].replace(/[^a-zA-Z0-9]/g, '') || parts[0];
      return single.charAt(0).toUpperCase() || 'U';
    }
  }

  return 'U';
}
