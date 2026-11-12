type IconName = "search" | "chat" | "more" | "attach" | "smile" | "send" | "back" | "refresh";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "search") return <svg {...common}><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>;
  if (name === "chat") return <svg {...common}><path d="M20 11.4a7.8 7.8 0 0 1-8.2 7.8 8.5 8.5 0 0 1-3.5-.8L4 20l1.4-3.7a7.5 7.5 0 0 1-1.7-4.9A7.8 7.8 0 0 1 12 3.6a7.8 7.8 0 0 1 8 7.8Z"/></svg>;
  if (name === "more") return <svg {...common}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>;
  if (name === "attach") return <svg {...common}><path d="m8.5 12.5 6.7-6.7a3.2 3.2 0 0 1 4.5 4.5l-8.8 8.8a5 5 0 0 1-7.1-7.1l8.5-8.5"/></svg>;
  if (name === "smile") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M8 14s1.4 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>;
  if (name === "send") return <svg {...common}><path d="m21 3-7.2 18-3.7-7.1L3 10.2 21 3Z"/><path d="M10.1 13.9 15 9"/></svg>;
  if (name === "back") return <svg {...common}><path d="m15 18-6-6 6-6"/></svg>;
  return <svg {...common}><path d="M12 2.8a9.2 9.2 0 1 0 9.2 9.2"/><path d="M21 3v6h-6"/><path d="M20.3 9A8 8 0 0 0 6.4 5.7"/></svg>;
}
