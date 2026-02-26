const C = {
  bg: "#0A0E1A",
  bgCard: "#111827",
  bgCardAlt: "#0F172A",
  border: "#1E293B",
  borderBright: "#2D3748",
  cyan: "#00D4FF",
  cyanDim: "#00D4FF33",
  orange: "#FF6B2B",
  orangeDim: "#FF6B2B33",
  green: "#10B981",
  greenDim: "#10B98133",
  yellow: "#F59E0B",
  red: "#EF4444",
  text: "#E2E8F0",
  textSecondary: "#64748B",
  textMuted: "#334155",
  tint: "#00D4FF",
};

export default {
  light: {
    text: C.text,
    background: C.bg,
    tint: C.tint,
    tabIconDefault: C.textSecondary,
    tabIconSelected: C.tint,
  },
  dark: {
    text: C.text,
    background: C.bg,
    tint: C.tint,
    tabIconDefault: C.textSecondary,
    tabIconSelected: C.tint,
  },
  ...C,
};
