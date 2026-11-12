import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, RefreshCw, Volume2, Sparkles, Shield, Cpu } from 'lucide-react';
import { Language } from '../types';

interface Robot3DSceneProps {
  language: Language;
}

export const Robot3DScene: React.FC<Robot3DSceneProps> = ({ language }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [robotState, setRobotState] = useState<'idle' | 'greeting' | 'celebrating'>('idle');
  const isAr = language === 'ar';

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.2, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5f0, 2.5);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 3, 10);
    blueLight.position.set(-3, 2, 2);
    scene.add(blueLight);

    const redLight = new THREE.PointLight(0xef4444, 3, 10);
    redLight.position.set(3, 2, 2);
    scene.add(redLight);

    // Create Detailed Humanoid Robot (Procedural 3D Engineered Model)
    const robotGroup = new THREE.Group();

    // Materials
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.15,
    });

    const darkGraphiteMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });

    const glowingRedMaterial = new THREE.MeshBasicMaterial({
      color: 0xef4444,
    });

    const visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.9,
    });

    // Head
    const headGeo = new THREE.BoxGeometry(0.6, 0.55, 0.55);
    const head = new THREE.Mesh(headGeo, metalMaterial);
    head.position.y = 1.75;
    robotGroup.add(head);

    // Visor / Face Display
    const visorGeo = new THREE.BoxGeometry(0.5, 0.25, 0.1);
    const visor = new THREE.Mesh(visorGeo, visorMaterial);
    visor.position.set(0, 1.75, 0.26);
    robotGroup.add(visor);

    // LED Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, glowingRedMaterial);
    leftEye.position.set(-0.15, 1.78, 0.32);
    const rightEye = new THREE.Mesh(eyeGeo, glowingRedMaterial);
    rightEye.position.set(0.15, 1.78, 0.32);
    robotGroup.add(leftEye);
    robotGroup.add(rightEye);

    // Torso / Chest
    const torsoGeo = new THREE.BoxGeometry(0.9, 1.1, 0.5);
    const torso = new THREE.Mesh(torsoGeo, metalMaterial);
    torso.position.y = 1.0;
    robotGroup.add(torso);

    // Chest Badge / Panel (SmartTech style)
    const badgeGeo = new THREE.BoxGeometry(0.35, 0.35, 0.05);
    const badge = new THREE.Mesh(badgeGeo, darkGraphiteMaterial);
    badge.position.set(0, 1.05, 0.26);
    robotGroup.add(badge);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 16);
    
    const leftArm = new THREE.Mesh(armGeo, metalMaterial);
    leftArm.position.set(-0.65, 1.0, 0);
    leftArm.rotation.z = 0.15;
    robotGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, metalMaterial);
    rightArm.position.set(0.65, 1.0, 0);
    rightArm.rotation.z = -0.15;
    robotGroup.add(rightArm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.14, 0.12, 1.0, 16);
    
    const leftLeg = new THREE.Mesh(legGeo, darkGraphiteMaterial);
    leftLeg.position.set(-0.25, 0.1, 0);
    robotGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, darkGraphiteMaterial);
    rightLeg.position.set(0.25, 0.1, 0);
    robotGroup.add(rightLeg);

    scene.add(robotGroup);

    // Animation loop
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Idle breathing animation
      robotGroup.position.y = Math.sin(elapsedTime * 2) * 0.04;
      head.rotation.y = Math.sin(elapsedTime * 1.2) * 0.1;
      
      if (robotState === 'greeting') {
        rightArm.rotation.z = -1.2 + Math.sin(elapsedTime * 8) * 0.3;
      } else if (robotState === 'celebrating') {
        leftArm.rotation.z = 1.2;
        rightArm.rotation.z = -1.2;
        robotGroup.position.y += Math.sin(elapsedTime * 12) * 0.08;
      } else {
        rightArm.rotation.z = -0.15;
        leftArm.rotation.z = 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [robotState]);

  const triggerGreeting = () => {
    setRobotState('greeting');
    setIsSpeaking(true);
    setTimeout(() => {
      setRobotState('idle');
      setIsSpeaking(false);
    }, 3000);
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[550px] flex items-center justify-center">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" onClick={triggerGreeting} />

      {/* Floating Interactive Badge */}
      <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl flex items-center gap-4 max-w-xs pointer-events-auto">
        <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md">
          🤖
        </div>
        <div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
            {isAr ? 'الروبوت الذكي (Smarty)' : 'Smarty Robot Assistant'}
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            {isSpeaking
              ? (isAr ? 'مرحباً بك في سمارت كودرز!' : 'Welcome to Smart Coders!')
              : (isAr ? 'انقر على الروبوت للتفاعل معي' : 'Click robot to interact')}
          </p>
        </div>
      </div>
    </div>
  );
};
