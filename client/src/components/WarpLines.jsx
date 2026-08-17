import { useEffect, useRef } from 'react';

// Canvas-based radial speed lines, drawn from center outward, to sell the "warp speed" feeling.
export default function WarpLines({ active }) {
  const canvasRef = useRef(null);
  const linesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function spawnLine() {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const angle = Math.random() * Math.PI * 2;
      return {
        angle,
        cx,
        cy,
        dist: Math.random() * 60,
        speed: 14 + Math.random() * 18,
        length: 20 + Math.random() * 40,
        opacity: 0.3 + Math.random() * 0.5,
      };
    }

    for (let i = 0; i < 120; i++) linesRef.current.push(spawnLine());

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (active) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        linesRef.current.forEach((l) => {
          l.dist += l.speed;
          const x1 = l.cx + Math.cos(l.angle) * l.dist;
          const y1 = l.cy + Math.sin(l.angle) * l.dist;
          const x2 = l.cx + Math.cos(l.angle) * (l.dist + l.length);
          const y2 = l.cy + Math.sin(l.angle) * (l.dist + l.length);

          ctx.strokeStyle = `rgba(200, 190, 255, ${l.opacity})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          const maxDist = Math.hypot(canvas.width, canvas.height) / 1.5;
          if (l.dist > maxDist) {
            Object.assign(l, spawnLine());
          }
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300"
      style={{ opacity: active ? 1 : 0 }}
    />
  );
}
