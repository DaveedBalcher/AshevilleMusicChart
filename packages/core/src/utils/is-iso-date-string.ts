const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isISODateString(value: string): boolean {
  return typeof value === 'string' && ISO_DATE_REGEX.test(value);
}
