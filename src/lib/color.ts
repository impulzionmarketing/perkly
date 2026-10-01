function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Variables CSS de marca: color principal, texto legible encima y un tinte suave. */
export function brandVars(hex: string): Record<string, string> {
  const safe = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#2563EB";
  const fg = luminance(safe) > 0.45 ? "#14161A" : "#FFFFFF";
  const [r, g, b] = rgb(safe);
  return {
    "--brand": safe,
    "--brand-fg": fg,
    "--brand-soft": `rgba(${r}, ${g}, ${b}, 0.12)`,
    "--brand-ring": `rgba(${r}, ${g}, ${b}, 0.35)`,
  };
}
