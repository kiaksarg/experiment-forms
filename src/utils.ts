export function extractSubjectNumber(subject: string): string {
  const trimmed = subject.trim();
  const match = trimmed.match(/(\d+)$/);
  return match ? match[1] : subject;
}