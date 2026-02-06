import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
}

export const NetworkMesh: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 };

    // Colors: White and Fuchsia
    const colors = ['rgba(255, 255, 255, 0.8)', 'rgba(232, 121, 249, 0.8)'];

    const init = () => {
       const parent = containerRef.current;
       if (parent) {
         width = parent.clientWidth;
         height = parent.clientHeight;
         canvas.width = width;
         canvas.height = height;
         
         // Create Particles
         particles = [];
         const particleCount = Math.floor((width * height) / 10000); // Node Density
         
         for (let i = 0; i < particleCount; i++) {
           const sizeCategory = Math.random();
           // 10% Large Hubs, 90% Small Nodes
           const radius = sizeCategory > 0.9 ? Math.random() * 4 + 3 : Math.random() * 2 + 1;
           const x = Math.random() * width;
           const y = Math.random() * height;
           
           particles.push({
             x, y,
             originX: x, originY: y,
             radius,
             vx: (Math.random() - 0.5) * 0.5,
             vy: (Math.random() - 0.5) * 0.5,
             color: sizeCategory > 0.9 ? colors[1] : colors[0]
           });
         }
       }
    };

    const animate = () => {
       ctx.clearRect(0, 0, width, height);

       // Update Physics
       particles.forEach((p, i) => {
          // Base movement
          p.x += p.vx;
          p.y += p.vy;

          // Wall Bounce
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          // Mouse Interaction (Gentle repulsion)
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const maxDist = 200;
          
          if (dist < maxDist) {
             const force = (maxDist - dist) / maxDist;
             // Push away
             p.x -= (dx / dist) * force * 2;
             p.y -= (dy / dist) * force * 2;
          }

          // Draw Particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Draw Connections
          for (let j = i + 1; j < particles.length; j++) {
             const p2 = particles[j];
             const linkDx = p.x - p2.x;
             const linkDy = p.y - p2.y;
             const linkDist = Math.sqrt(linkDx*linkDx + linkDy*linkDy);
             const maxLinkDist = 150;

             if (linkDist < maxLinkDist) {
                const opacity = 1 - linkDist / maxLinkDist;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
                ctx.lineWidth = p.radius > 3 || p2.radius > 3 ? 1.5 : 0.5; // Thicker lines for Hubs
                ctx.stroke();
             }
          }
       });
    };

    // Use GSAP Ticker for efficient rAF loop
    gsap.ticker.add(animate);
    
    // Handle Resizing with Observer
    const resizeObserver = new ResizeObserver(() => init());
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    // Mouse Tracking
    const handleMouseMove = (e: MouseEvent) => {
       const rect = canvas.getBoundingClientRect();
       mouse.x = e.clientX - rect.left;
       mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
       mouse.x = -1000;
       mouse.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      gsap.ticker.remove(animate);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
        <canvas ref={canvasRef} className="block" />
    </div>
  );
};
