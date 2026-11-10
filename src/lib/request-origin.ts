/** Compare the browser origin with the externally requested host, not Next's internal hostname. */
export function isSameOriginRequest(
  origin: string | null,
  host: string | null,
  protocol: string,
) {
  if (!origin || !host || !["http:", "https:"].includes(protocol)) return false;
  try {
    return new URL(`${protocol}//${host}`).origin === origin;
  } catch {
    return false;
  }
}
