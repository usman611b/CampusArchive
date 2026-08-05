import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const LiquidShaderBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      const isLight = theme === 'light';

      if (isLight) {
        // Light Mode Soft Slate/White Background
        const bgGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.2,
          100,
          width * 0.5,
          height * 0.5,
          Math.max(width, height)
        );
        bgGrad.addColorStop(0, '#ffffff');
        bgGrad.addColorStop(0.5, '#f8fafc');
        bgGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Light Blue Glow Orb
        const x1 = width * 0.3 + Math.sin(time * 0.8) * 120;
        const y1 = height * 0.3 + Math.cos(time * 0.6) * 80;
        const grad1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, width * 0.4);
        grad1.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
        grad1.addColorStop(0.5, 'rgba(99, 102, 241, 0.04)');
        grad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(x1, y1, width * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Light Indigo Wave
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.06)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          for (let x = 0; x < width; x += 20) {
            const y =
              height * (0.25 + i * 0.2) +
              Math.sin(x * 0.003 + time * (1 + i * 0.2)) * 30 +
              Math.cos(x * 0.001 + time * 0.5) * 15;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
      } else {
        // Dark Mode Base
        const bgGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.3,
          100,
          width * 0.5,
          height * 0.5,
          Math.max(width, height)
        );
        bgGrad.addColorStop(0, '#0c0e1a');
        bgGrad.addColorStop(0.5, '#09090b');
        bgGrad.addColorStop(1, '#050507');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Dark Blue Glow Orb
        const x1 = width * 0.3 + Math.sin(time * 0.8) * 120;
        const y1 = height * 0.3 + Math.cos(time * 0.6) * 80;
        const grad1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, width * 0.4);
        grad1.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
        grad1.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
        grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(x1, y1, width * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Dark Purple Orb
        const x2 = width * 0.7 + Math.cos(time * 0.7) * 140;
        const y2 = height * 0.6 + Math.sin(time * 0.9) * 100;
        const grad2 = ctx.createRadialGradient(x2, y2, 10, x2, y2, width * 0.45);
        grad2.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
        grad2.addColorStop(0.5, 'rgba(129, 140, 248, 0.06)');
        grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(x2, y2, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          for (let x = 0; x < width; x += 20) {
            const y =
              height * (0.25 + i * 0.18) +
              Math.sin(x * 0.003 + time * (1 + i * 0.2)) * 40 +
              Math.cos(x * 0.001 + time * 0.5) * 20;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none transition-opacity"
      style={{ zIndex: -1 }}
    />
  );
};

export default LiquidShaderBackground;
