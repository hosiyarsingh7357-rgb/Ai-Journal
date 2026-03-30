import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform vec2 iMouse;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec2 uv = vUv;
    vec2 mouse = iMouse / iResolution.xy;
    float dist = distance(uv, mouse);
    float glow = 0.3 / (dist + 0.05);
    
    float aspect = iResolution.x / iResolution.y;
    vec2 p = uv;
    p.x *= aspect;
    vec2 m = mouse;
    m.x *= aspect;
    float pDist = distance(p, m);

    vec3 colorBg = vec3(0.01, 0.01, 0.03); 
    vec3 color1 = vec3(0.05, 0.08, 0.25);  
    vec3 color2 = vec3(0.15, 0.05, 0.28);  
    vec3 color3 = vec3(0.25, 0.35, 0.65);  
    
    float mouseInfluence = smoothstep(0.6, 0.0, pDist);
    
    vec2 waveUv = p;
    waveUv.x += sin(p.y * 3.0 + iTime * 0.5) * 0.05;
    waveUv.y += cos(p.x * 3.0 + iTime * 0.4) * 0.05;
    waveUv += (p - m) * mouseInfluence * 0.15;
    
    float g1 = smoothstep(0.2, 0.8, noise(waveUv * 1.2 + iTime * 0.15));
    float g2 = smoothstep(0.3, 0.7, noise(waveUv * 0.8 - iTime * 0.1));
    
    vec3 finalColor = colorBg;
    finalColor = mix(finalColor, color1, g1 * 0.6);
    finalColor = mix(finalColor, color2, g2 * 0.4);
    
    finalColor += color3 * glow * 0.2;
    
    float streaks = sin(p.x * 10.0 + p.y * 5.0 + iTime) * 0.5 + 0.5;
    streaks *= pow(noise(p * 4.0 + iTime * 0.2), 3.0);
    finalColor += vec3(0.1, 0.15, 0.3) * streaks * 0.15;

    finalColor *= 1.1;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const BackgroundAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      alpha: true
    });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(width * pixelRatio, height * pixelRatio) },
      iMouse: { value: new THREE.Vector2(0, 0) }
    };

    const currentMouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Initial mouse position
    mouseRef.current.targetX = (width / 2) * pixelRatio;
    mouseRef.current.targetY = (height / 2) * pixelRatio;
    mouseRef.current.x = mouseRef.current.targetX;
    mouseRef.current.y = mouseRef.current.targetY;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      targetMouse.set(
        (e.clientX - rect.left) * pixelRatio,
        (rect.height - (e.clientY - rect.top)) * pixelRatio
      );
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height);
      uniforms.iResolution.value.set(width * pixelRatio, height * pixelRatio);
      
      camera.left = -1;
      camera.right = 1;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(containerRef.current);

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      uniforms.iTime.value = clock.getElapsedTime();

      // Lerp mouse
      currentMouse.lerp(targetMouse, 0.08);
      uniforms.iMouse.value.copy(currentMouse);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden w-screen h-screen"
    />
  );
};
