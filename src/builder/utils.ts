export function cleanSpaces(str: string) {
  return str.trim().replace(/\n\s+/g, '');
}
