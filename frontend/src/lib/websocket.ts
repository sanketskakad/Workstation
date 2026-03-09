export function connectWebSocket(token?: string) {
  const base = process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:4000";
  const url = token ? `${base}?token=${encodeURIComponent(token)}` : base;
  return new WebSocket(url);
}
