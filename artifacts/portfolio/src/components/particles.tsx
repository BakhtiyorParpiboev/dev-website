import { useEffect, useRef } from "react";

type Particle = {
  u: number;
  v: number;
  dust: boolean;
  depth: number;
  length: number;
  color: string;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
};

// Increase cursor displacement and tracking response by 20%.
const POINTER_RESPONSE = 1.2;
const STROKE_LENGTH_SCALE = 1.25;

const PALETTE = ["#3670df", "#505bd0", "#7550bd", "#3b4eb4", "#8760c5", "#d05d98", "#d3647d"];

// Smooth value noise, independently implemented for this Canvas 2D field.
// Sampling continuous coordinates avoids per-frame random changes.
function noise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const hash = (a: number, b: number) => {
    const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  };
  const a = hash(ix, iy), b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/** A transparent, non-interactive field; particle properties stay stable between frames. */
export function ParticleField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, frame = 0, previous = 0, elapsed = 0;
    let visible = true;
    let particles: Particle[] = [];
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, localX: 0, localY: 0, targetLocalX: 0, targetLocalY: 0, strength: 0, active: false };

    function populate() {
      // A jittered sheet keeps density even while perspective creates depth.
      // Random properties are assigned once, never during a render frame.
      const columns = Math.max(16, Math.min(44, Math.round(width / 30)));
      const rows = Math.max(20, Math.min(32, Math.round(height / 27)));
      particles = Array.from({ length: columns * rows }, (_, i) => ({
        u: ((i % columns) + Math.random()) / columns,
        v: (Math.floor(i / columns) + Math.random()) / rows,
        dust: Math.random() < 0.18,
        depth: Math.random(),
        length: 2 + Math.random() * 3,
        color: PALETTE[Math.random() < 0.96 ? Math.floor(Math.random() * 5) : 5 + Math.floor(Math.random() * 2)],
        offsetX: 0, offsetY: 0, velocityX: 0, velocityY: 0,
      }));
    }

    function paint(dt = 0) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      const time = elapsed * 0.22;
      const unit = Math.min(width, height);
      // Keep desktop whitespace tied to the copy, rather than the full screen.
      // This brings strokes inward on wide displays while preserving mobile spacing.
      const clearWidth = width >= 1024 ? Math.min(width * 0.3, 380) : width * 0.42;
      // An autonomous focal ring gently follows the pointer when present.
      const ringX = width * (0.5 + noise(time * 0.4, 12.7) * 0.16) + pointer.x * width * 0.12 * POINTER_RESPONSE;
      const ringY = height * (0.54 + noise(8.3, time * 0.35) * 0.14) + pointer.y * height * 0.1 * POINTER_RESPONSE;
      const radius = unit * (0.3 + Math.sin(time * 1.5) * 0.025);
      for (const p of particles) {
        const u = p.u * 2 - 1;
        const v = p.v * 2 - 1;
        const flow = noise(u * 1.6 + time * 0.3, v * 1.6 - time * 0.25);
        const rippleX = noise(u * 4 + time * 0.6, v * 4 + 23.4);
        const rippleY = noise(u * 4 + 71.2, v * 4 - time * 0.5);
        let x = p.u * width + rippleX * unit * 0.035 + Math.sin(v * 12 + time * 2) * unit * 0.008;
        let y = p.v * height + rippleY * unit * 0.035 + Math.cos(u * 12 + time * 1.5) * unit * 0.008;
        const rx = x - ringX, ry = y - ringY;
        const ringDistance = Math.hypot(rx, ry);
        const band = Math.exp(-Math.pow((ringDistance - radius) / (unit * 0.13), 2));
        const scale = Math.max(0.15, 0.35 + (flow + 1) * 0.32 + band * 0.75);
        // A ring lifts nearby strokes outward; smaller-scale noise gives them
        // individual motion without losing the larger shared flow.
        x += rx * band * 0.08 + pointer.x * p.depth * 9 * POINTER_RESPONSE;
        y += ry * band * 0.08 + pointer.y * p.depth * 9 * POINTER_RESPONSE;

        const px = x - pointer.localX, py = y - pointer.localY;
        const distanceToPointer = Math.hypot(px, py);
        const influence = Math.exp(-Math.pow(distanceToPointer / 150, 2)) * pointer.strength;
        const force = 48 * influence * POINTER_RESPONSE;
        const targetX = px / Math.max(distanceToPointer, 1) * force;
        const targetY = py / Math.max(distanceToPointer, 1) * force;
        if (dt) {
          p.velocityX += ((targetX - p.offsetX) * 35 - p.velocityX * 10) * dt;
          p.velocityY += ((targetY - p.offsetY) * 35 - p.velocityY * 10) * dt;
          p.offsetX += p.velocityX * dt;
          p.offsetY += p.velocityY * dt;
        }
        x += p.offsetX;
        y += p.offsetY;
        const edge = Math.max(0, Math.min(1, x / 45, (width - x) / 45, y / 45, (height - y) / 45));
        const distance = Math.hypot((x - width * 0.5) / clearWidth, (y - height * 0.46) / (height * 0.35));
        const clearCenter = Math.min(1, Math.max(0, (distance - 0.6) / 0.6));
        ctx.globalAlpha = (p.dust ? 0.28 : 0.55 + p.depth * 0.35) * edge * clearCenter * Math.min(1, scale);
        if (ctx.globalAlpha < 0.008) continue;
        const tangent = Math.atan2(ry, rx) + rippleX * 0.65;
        const half = p.dust ? 0.35 : p.length * scale * 0.95 * STROKE_LENGTH_SCALE;
        const dx = Math.cos(tangent) * half, dy = Math.sin(tangent) * half;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.dust ? 0.75 : 1.15 + p.depth * 0.7;
        ctx.beginPath();
        ctx.moveTo(x - dx, y - dy);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function animate(now: number) {
      frame = 0;
      if (motion.matches || !visible || document.hidden) { previous = 0; return; }
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      elapsed += dt;
      const smoothing = 1 - Math.exp(-dt * 3 * POINTER_RESPONSE);
      pointer.x += (pointer.targetX - pointer.x) * smoothing;
      pointer.y += (pointer.targetY - pointer.y) * smoothing;
      pointer.localX += (pointer.targetLocalX - pointer.localX) * smoothing;
      pointer.localY += (pointer.targetLocalY - pointer.localY) * smoothing;
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * smoothing;
      paint(dt);
      frame = requestAnimationFrame(animate);
    }

    function syncAnimation() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (motion.matches) {
        pointer.x = pointer.y = pointer.targetX = pointer.targetY = pointer.strength = 0;
        pointer.active = false;
        for (const p of particles) p.offsetX = p.offsetY = p.velocityX = p.velocityY = 0;
        paint();
      } else if (visible && !document.hidden) {
        frame = requestAnimationFrame(animate);
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === width && rect.height === height) return;
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      populate();
      paint();
    };
    const resetPointer = () => { pointer.targetX = pointer.targetY = 0; pointer.active = false; };
    const move = (event: PointerEvent) => {
      if (motion.matches || !visible || width <= 0 || height <= 0 || event.pointerType === "touch") return;
      const bounds = canvas.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        resetPointer(); return;
      }
      pointer.targetLocalX = event.clientX - bounds.left;
      pointer.targetLocalY = event.clientY - bounds.top;
      if (!pointer.active && pointer.strength < 0.01) {
        pointer.localX = pointer.targetLocalX;
        pointer.localY = pointer.targetLocalY;
      }
      pointer.active = true;
      pointer.targetX = ((event.clientX - bounds.left) / width - 0.5) * 2;
      pointer.targetY = ((event.clientY - bounds.top) / height - 0.5) * 2;
    };
    const resizeObserver = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    resize();
    resizeObserver.observe(canvas);
    intersection.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", resetPointer);
    document.documentElement.addEventListener("pointerleave", resetPointer);
    document.addEventListener("visibilitychange", syncAnimation);
    motion.addEventListener("change", syncAnimation);
    syncAnimation();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", resetPointer);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", syncAnimation);
      motion.removeEventListener("change", syncAnimation);
    };
  }, []);

  return (
    <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
  );
}
