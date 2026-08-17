export default function ConnectionLines({ count, color }) {
  if (!count) return null;
  return (
    <svg
      className="absolute left-1/2 pointer-events-none"
      style={{ top: 220, transform: 'translateX(-50%)', width: 400, height: 140, zIndex: 5 }}
      viewBox="0 0 400 140"
    >
      {Array.from({ length: count }).map((_, i) => {
        const spread = count === 1 ? 0 : (i / (count - 1) - 0.5) * 220;
        const x2 = 200 + spread;
        return (
          <line
            key={i}
            x1="200" y1="0" x2={x2} y2="130"
            stroke={color} strokeWidth="1" strokeDasharray="4 6" opacity="0.4"
            style={{ animation: `dash-flow 1.2s linear infinite`, animationDelay: `${i * 0.15}s` }}
          />
        );
      })}
      <style>{`
        @keyframes dash-flow { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
      `}</style>
    </svg>
  );
}
