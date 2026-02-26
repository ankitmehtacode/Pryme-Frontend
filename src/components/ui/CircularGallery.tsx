import { useEffect, useRef, useState } from 'react';
import {
  Renderer,
  Camera,
  Transform,
  Plane,
  Mesh,
  Program,
  Texture,
} from 'ogl';

interface CircularGalleryItem {
  image: string;
  text?: string;
  quote?: string;
  name?: string;
  role?: string;
}

interface CircularGalleryProps {
  items: CircularGalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
}

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uProgress;
  uniform float uBend;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Apply bend effect
    float bend = uBend * uProgress;
    pos.z += sin(pos.x * 3.14159) * bend;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uAlpha;
  uniform float uBorderRadius;
  varying vec2 vUv;
  
  void main() {
    vec4 color = texture2D(tMap, vUv);
    
    // Apply rounded corners
    vec2 center = vUv - 0.5;
    float dist = length(max(abs(center) - 0.5 + uBorderRadius, 0.0));
    float alpha = 1.0 - smoothstep(uBorderRadius - 0.01, uBorderRadius, dist);
    
    gl_FragColor = vec4(color.rgb, color.a * uAlpha * alpha);
  }
`;

const CircularGallery = ({
  items,
  bend = 3,
  textColor = 'hsl(var(--foreground))',
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05,
}: CircularGalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef({ current: 0, target: 0 });
  const meshesRef = useRef<Mesh[]>([]);
  const rendererRef = useRef<Renderer | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || items.length === 0) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    // Initialize renderer
    const renderer = new Renderer({
      canvas,
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // Camera setup
    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 5;

    const scene = new Transform();
    const meshes: Mesh[] = [];

    // Create geometry
    const geometry = new Plane(gl, { width: 1.5, height: 1 });

    // Load textures and create meshes
    items.forEach((item, i) => {
      const texture = new Texture(gl);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.image;
      img.onload = () => {
        texture.image = img;
      };

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          tMap: { value: texture },
          uAlpha: { value: 1 },
          uProgress: { value: 0 },
          uBend: { value: bend * 0.1 },
          uBorderRadius: { value: borderRadius },
        },
        transparent: true,
      });

      const mesh = new Mesh(gl, { geometry, program });
      mesh.position.x = i * 2;
      mesh.setParent(scene);
      meshes.push(mesh);
    });

    meshesRef.current = meshes;

    // Resize handler
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };

    // Scroll handler
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollRef.current.target += e.deltaY * scrollSpeed * 0.001;
    };

    // Touch handlers
    let touchStart = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      const delta = touchStart - e.touches[0].clientX;
      scrollRef.current.target += delta * scrollSpeed * 0.005;
      touchStart = e.touches[0].clientX;
    };

    // Animation loop
    const animate = () => {
      scrollRef.current.current += (scrollRef.current.target - scrollRef.current.current) * scrollEase;

      const totalWidth = items.length * 2;
      
      meshes.forEach((mesh, i) => {
        let x = (i * 2 - scrollRef.current.current) % totalWidth;
        if (x < -2) x += totalWidth;
        if (x > totalWidth - 2) x -= totalWidth;
        
        mesh.position.x = x - totalWidth / 2 + 1;
        
        // Apply circular bend
        const normalizedX = mesh.position.x / (totalWidth / 2);
        mesh.position.z = -Math.abs(normalizedX) * bend * 0.5;
        mesh.rotation.y = -normalizedX * 0.3;
        
        // Fade edges
        const alpha = 1 - Math.abs(normalizedX) * 0.5;
        mesh.program.uniforms.uAlpha.value = Math.max(0.3, alpha);
        mesh.program.uniforms.uProgress.value = normalizedX;
      });

      // Update current index
      const newIndex = Math.round(scrollRef.current.current / 2) % items.length;
      const normalizedIndex = ((newIndex % items.length) + items.length) % items.length;
      setCurrentIndex(normalizedIndex);

      renderer.render({ scene, camera });
      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resize();
    window.addEventListener('resize', resize);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
    };
  }, [items, bend, borderRadius, scrollSpeed, scrollEase]);

  const goToSlide = (index: number) => {
    scrollRef.current.target = index * 2;
  };

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Text overlay */}
      <div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none w-full max-w-2xl px-6"
      >
        <p className="text-lg md:text-xl italic text-muted-foreground leading-relaxed mb-3 animate-fade-in font-light">
          "{items[currentIndex]?.quote}"
        </p>
        <div className="flex items-center justify-center gap-2 animate-fade-in">
          <span className="text-base md:text-lg font-semibold text-primary">
            {items[currentIndex]?.name}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {items[currentIndex]?.role}
          </span>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-primary w-8' 
                : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CircularGallery;
