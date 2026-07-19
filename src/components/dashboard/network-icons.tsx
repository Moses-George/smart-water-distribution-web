import type { NodeType } from "@/types/network";

// Each icon is drawn centered at (0,0). Scale ~6 svg units wide.
export function NodeIcon({ type, ring }: { type: NodeType; ring: string }) {
  const stroke = ring;
  const sw = 0.35;
  switch (type) {
    case "reservoir":
      // Trapezoidal dam with water lines
      return (
        <g>
          <path d="M -3.6 -2 L 3.6 -2 L 2.6 2 L -2.6 2 Z"
            fill="url(#g-reservoir)" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M -2.4 -0.6 Q -1.2 -1.1 0 -0.6 T 2.4 -0.6" fill="none" stroke="#fff" strokeWidth={0.3} opacity={0.9} />
          <path d="M -2.2 0.4 Q -1 -0.1 0.2 0.4 T 2.2 0.4" fill="none" stroke="#fff" strokeWidth={0.3} opacity={0.7} />
        </g>
      );
    case "tank":
      // Cylinder (ellipse cap + body + ellipse base)
      return (
        <g>
          <rect x={-2.4} y={-2} width={4.8} height={4} fill="url(#g-tank)" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={0} cy={-2} rx={2.4} ry={0.7} fill="url(#g-tank-top)" stroke={stroke} strokeWidth={sw} />
          <ellipse cx={0} cy={2} rx={2.4} ry={0.7} fill="none" stroke={stroke} strokeWidth={sw} />
          <line x1={-1.6} y1={0.6} x2={1.6} y2={0.6} stroke="#fff" strokeWidth={0.3} opacity={0.7} />
        </g>
      );
    case "pump":
      // Circular pump with impeller
      return (
        <g>
          <circle r={2.4} fill="url(#g-pump)" stroke={stroke} strokeWidth={sw} />
          <g stroke="#fff" strokeWidth={0.4} strokeLinecap="round" opacity={0.95}>
            <line x1={0} y1={-1.4} x2={0} y2={1.4} />
            <line x1={-1.4} y1={0} x2={1.4} y2={0} />
            <line x1={-1} y1={-1} x2={1} y2={1} />
            <line x1={-1} y1={1} x2={1} y2={-1} />
          </g>
          <circle r={0.5} fill="#fff" />
        </g>
      );
    case "valve":
      // Butterfly / bowtie
      return (
        <g>
          <path d="M -2.4 -1.6 L 0 0 L -2.4 1.6 Z" fill="url(#g-valve)" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M 2.4 -1.6 L 0 0 L 2.4 1.6 Z" fill="url(#g-valve)" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <circle r={0.45} fill={stroke} />
        </g>
      );
    case "junction":
      return (
        <g>
          <circle r={1.1} fill="url(#g-junction)" stroke={stroke} strokeWidth={sw} />
          <circle r={0.35} fill={stroke} />
        </g>
      );
    case "consumer":
      // House shape
      return (
        <g>
          <path d="M -2 -0.4 L 0 -2 L 2 -0.4 L 2 1.8 L -2 1.8 Z"
            fill="url(#g-consumer)" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <rect x={-0.6} y={0.4} width={1.2} height={1.4} fill="#fff" opacity={0.85} stroke={stroke} strokeWidth={0.2} />
        </g>
      );
  }
}

export function IconDefs() {
  return (
    <defs>
      <linearGradient id="g-reservoir" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4aa8d8" />
        <stop offset="1" stopColor="#2a6b8c" />
      </linearGradient>
      <linearGradient id="g-tank" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dfe9ef" />
        <stop offset="1" stopColor="#9fb6c2" />
      </linearGradient>
      <linearGradient id="g-tank-top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4f8fa" />
        <stop offset="1" stopColor="#c6d5dd" />
      </linearGradient>
      <linearGradient id="g-pump" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f2c94c" />
        <stop offset="1" stopColor="#c48a1a" />
      </linearGradient>
      <linearGradient id="g-valve" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b58cd8" />
        <stop offset="1" stopColor="#6a4a8c" />
      </linearGradient>
      <linearGradient id="g-junction" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#cfd7de" />
        <stop offset="1" stopColor="#7f8c94" />
      </linearGradient>
      <linearGradient id="g-consumer" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7dd3a0" />
        <stop offset="1" stopColor="#2e8a55" />
      </linearGradient>
    </defs>
  );
}