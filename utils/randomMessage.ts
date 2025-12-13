export function pickRandomMessage(list: string[] = []): string {
  if (!list.length) return "";
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}
