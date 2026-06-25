"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
  opacityDir: number;
  life: number;
  maxLife: number;
}

const COLORS = [
  "#ffd700", // yellow
  "#ffb300", // amber
  "#ff8c00", // dark orange
  "#ff6b00", // orange
  "#ff4500", // orange-red
  "#ff2e2e", // crimson
];

function spawn(w: number, h: number, fromBottom = false): Particle {
  return {
    x: Math.random() * w,
    y: fromBottom ? h + 5 : Math.random() * h,
    radius: Math.random() * 2 + 0.4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speedX: (Math.random() - 0.5) * 0.35,
    speedY: -(Math.random() * 0.55 + 0.18),
    opacity: Math.random() * 0.7 + 0.2,
    opacityDir: Math.random() > 0.5 ? 1 : -1,
    life: 0,
    maxLife: Math.random() * 280 + 140,
  };
}

export default function ParticleCanvas({ count = 90 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: count }, () =>
        spawn(canvas.width, canvas.height)
      );
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;
        p.opacity += p.opacityDir * 0.006;

        if (p.opacity > 0.95) p.opacityDir = -1;
        if (p.opacity < 0.1) p.opacityDir = 1;

        if (p.life > p.maxLife || p.y < -8) {
          particles[i] = spawn(canvas.width, canvas.height, true);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.radius * 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 3 }}
    />
  );
}
