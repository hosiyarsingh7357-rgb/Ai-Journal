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

    vec3 colorBg = vec3(0.01, 0.03, 0.01);
    vec3 color1 = vec3(0.05, 0.25, 0.08);
    vec3 color2 = vec3(0.05, 0.28, 0.15);
    vec3 color3 = vec3(0.25, 0.65, 0.35);
    
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
    finalColor += vec3(0.1, 0.3, 0.15) * streaks * 0.15;

    finalColor *= 1.1;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const BackgroundAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        powerPreference: "high-performance"
    });

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const currentMouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    
    const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio) },
        iMouse: { value: new THREE.Vector2(0, 0) }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        targetMouse.x = (e.clientX - rect.left) * pixelRatio;
        targetMouse.y = (rect.height - (e.clientY - rect.top)) * pixelRatio;
    };

    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        uniforms.iResolution.value.set(width * pixelRatio, height * pixelRatio);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animationFrameId: number;
    
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        uniforms.iTime.value = elapsedTime;

        currentMouse.lerp(targetMouse, 0.08);
        uniforms.iMouse.value.copy(currentMouse);

        renderer.render(scene, camera);
    }

    animate();

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 block" />;
};
