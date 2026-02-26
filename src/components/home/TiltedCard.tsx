import { useRef, useState, useCallback, ReactNode } from "react";

interface TiltedCardProps {
  children: ReactNode;
  className?: string;
  tiltStrength?: number;
  glareOpacity?: number;
}

const TiltedCard = ({
  children,
  className = "",
  tiltStrength = 8,
  glareOpacity = 0.12,
}: TiltedCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
    transition: "transform 0.4s cubic-bezier(0.03,0.98,0.52,0.99)",
  });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * tiltStrength * 2;
      const rotateX = (0.5 - y) * tiltStrength * 2;

      setStyle({
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`,
        transition: "transform 0.1s ease-out",
      });
      setGlare({ x: x * 100, y: y * 100, opacity: glareOpacity });
    },
    [tiltStrength, glareOpacity]
  );

  const handleLeave = useCallback(() => {
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
      transition: "transform 0.4s cubic-bezier(0.03,0.98,0.52,0.99)",
    });
    setGlare({ x: 50, y: 50, opacity: 0 });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative ${className}`}
      style={{ ...style, transformStyle: "preserve-3d" }}
    >
      {children}
      {/* Glare overlay */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
          transition: "opacity 0.2s",
        }}
      />
    </div>
  );
};

export default TiltedCard;
