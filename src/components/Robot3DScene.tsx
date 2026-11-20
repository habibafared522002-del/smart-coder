import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SmartyMascot3D, SmartyAction, OFFICIAL_SMARTY_ROBOT_SRC } from './SmartyMascot3D';

function createSmartTechChestTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // White/silver glossy armor base
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.6, '#f1f5f9');
  grad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Red V-collar trim & side dark carbon accents matching the uploaded robot
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(256, 95);
  ctx.lineTo(472, 0);
  ctx.lineTo(512, 0);
  ctx.lineTo(512, 50);
  ctx.lineTo(256, 145);
  ctx.lineTo(0, 50);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // Side red & carbon ribs
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.lineTo(85, 360);
  ctx.lineTo(85, 512);
  ctx.lineTo(0, 512);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(512, 120);
  ctx.lineTo(427, 360);
  ctx.lineTo(427, 512);
  ctx.lineTo(512, 512);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(6, 110);
  ctx.lineTo(92, 360);
  ctx.moveTo(506, 110);
  ctx.lineTo(420, 360);
  ctx.stroke();

  // Center vertical seam line
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(256, 145);
  ctx.lineTo(256, 480);
  ctx.stroke();

  // Official "SmartTech Training Center" Typography
  ctx.save();
  ctx.font = '900 78px Georgia, serif';
  ctx.fillStyle = '#dc2626';
  ctx.fillText('S', 112, 250);

  ctx.font = 'bold 50px sans-serif';
  ctx.fillStyle = '#dc2626';
  ctx.fillText('mart', 162, 245);
  ctx.fillStyle = '#dc2626';
  ctx.fillText('T', 284, 245);
  ctx.fillStyle = '#0f172a';
  ctx.fillText('ech', 320, 245);

  // Stylized C & T emblem on left
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('C', 88, 295);
  ctx.fillStyle = '#dc2626';
  ctx.fillText('T', 125, 310);

  ctx.font = '600 29px serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('Training Center', 172, 304);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createRedLedVisorTexture(action: SmartyAction): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // Deep glossy black visor screen with subtle red radial glow
  const bgGrad = ctx.createRadialGradient(256, 160, 20, 256, 160, 240);
  bgGrad.addColorStop(0, '#2a0a10');
  bgGrad.addColorStop(0.65, '#0b0f19');
  bgGrad.addColorStop(1, '#05070c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 320);

  // Helper to draw dotted LED ring eye (matching the uploaded robot's red matrix rings)
  const drawLedEye = (cx: number, cy: number, outerR: number) => {
    // Outer soft red glow
    const glow = ctx.createRadialGradient(cx, cy, outerR * 0.2, cx, cy, outerR * 1.45);
    glow.addColorStop(0, 'rgba(255, 60, 40, 0.55)');
    glow.addColorStop(0.6, 'rgba(239, 68, 68, 0.25)');
    glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR * 1.45, 0, Math.PI * 2);
    ctx.fill();

    // Dotted LED matrix concentric rings
    for (let ring = 0; ring < 3; ring++) {
      const r = outerR - ring * 7;
      const dots = 24 - ring * 4;
      for (let i = 0; i < dots; i++) {
        const a = (i / dots) * Math.PI * 2;
        const dx = cx + Math.cos(a) * r;
        const dy = cy + Math.sin(a) * r;
        ctx.fillStyle = ring === 1 ? '#fff1f2' : '#ff2e1f';
        ctx.beginPath();
        ctx.arc(dx, dy, 2.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Inner bright specular highlight dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - outerR * 0.22, cy - outerR * 0.22, 4.5, 0, Math.PI * 2);
    ctx.fill();
  };

  const eyeY = action === 'thinking' ? 142 : 148;
  drawLedEye(162, eyeY, 44);
  drawLedEye(350, eyeY, 44);

  // Dotted Red LED Eyebrows
  ctx.strokeStyle = '#ff3b2f';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.shadowColor = '#ff2e1f';
  ctx.shadowBlur = 14;

  // Left eyebrow
  ctx.beginPath();
  if (action === 'thinking') {
    ctx.arc(162, 92, 42, Math.PI * 1.15, Math.PI * 1.85);
  } else {
    ctx.arc(162, 102, 44, Math.PI * 1.2, Math.PI * 1.8);
  }
  ctx.stroke();

  // Right eyebrow
  ctx.beginPath();
  if (action === 'thinking') {
    ctx.arc(350, 78, 44, Math.PI * 1.2, Math.PI * 1.85);
  } else {
    ctx.arc(350, 102, 44, Math.PI * 1.2, Math.PI * 1.8);
  }
  ctx.stroke();

  // Dotted Red LED Smile
  ctx.beginPath();
  ctx.lineWidth = 10;
  if (action === 'celebrating' || action === 'victory') {
    ctx.arc(256, 204, 42, 0.15 * Math.PI, 0.85 * Math.PI);
  } else if (action === 'thinking') {
    ctx.arc(262, 224, 22, 0.2 * Math.PI, 0.8 * Math.PI);
  } else {
    ctx.arc(256, 206, 34, 0.18 * Math.PI, 0.82 * Math.PI);
  }
  ctx.stroke();

  // Diagonal glossy glass highlight
  const sheen = ctx.createLinearGradient(0, 0, 512, 320);
  sheen.addColorStop(0, 'rgba(255,255,255,0.14)');
  sheen.addColorStop(0.45, 'rgba(255,255,255,0.03)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 512, 320);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

const EXPRESSION_BUTTONS: { id: SmartyAction; labelAr: string; labelEn: string; icon: string }[] = [
  { id: 'greeting', labelAr: 'ترحيب', labelEn: 'Greet', icon: '👋' },
  { id: 'pointing', labelAr: 'إشارة', labelEn: 'Point', icon: '👉' },
  { id: 'thinking', labelAr: 'تفكير', labelEn: 'Think', icon: '💡' },
  { id: 'celebrating', labelAr: 'احتفال', labelEn: 'Celebrate', icon: '🌟' },
  { id: 'encouraging', labelAr: 'تشجيع', labelEn: 'Encourage', icon: '💪' },
  { id: 'victory', labelAr: 'انتصار', labelEn: 'Victory', icon: '🏆' },
];

export const Robot3DScene: React.FC<{ language?: 'ar' | 'en' }> = ({ language = 'ar' }) => {
  const isAr = language === 'ar';
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeAction, setActiveAction] = useState<SmartyAction>('greeting');
  const activeActionRef = useRef<SmartyAction>('greeting');
  const visorMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  const handleActionChange = (nextAction: SmartyAction) => {
    setActiveAction(nextAction);
    activeActionRef.current = nextAction;
    if (visorMatRef.current) {
      const oldMap = visorMatRef.current.map;
      visorMatRef.current.map = createRedLedVisorTexture(nextAction);
      visorMatRef.current.needsUpdate = true;
      if (oldMap) oldMap.dispose();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.3, 6.4);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 1.9;
    controls.target.set(0, 0.25, 0);

    // 5. Studio 3D Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const redRimLight = new THREE.DirectionalLight(0xff2e1f, 2.1);
    redRimLight.position.set(-5, 4, -4);
    scene.add(redRimLight);

    const cyanFillLight = new THREE.PointLight(0x38bdf8, 1.4, 12);
    cyanFillLight.position.set(4, 1, 3);
    scene.add(cyanFillLight);

    // 6. Materials matching the uploaded SmartTech Robot
    const whiteArmorMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.12,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.45,
      roughness: 0.38,
    });

    const crimsonMat = new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      metalness: 0.25,
      roughness: 0.22,
      clearcoat: 0.9,
    });

    const redLedGlowMat = new THREE.MeshStandardMaterial({
      color: 0xff2e1f,
      emissive: 0xff1e10,
      emissiveIntensity: 2.2,
      roughness: 0.15,
    });

    const chestTex = createSmartTechChestTexture();
    const chestArmorMat = new THREE.MeshPhysicalMaterial({
      map: chestTex,
      metalness: 0.1,
      roughness: 0.2,
      clearcoat: 0.9,
    });

    const visorTex = createRedLedVisorTexture(activeActionRef.current);
    const visorMat = new THREE.MeshBasicMaterial({
      map: visorTex,
    });
    visorMatRef.current = visorMat;

    // 7. Build the Official SmartTech 3D Robot Hierarchy
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // --- HEAD (Rounded White Helmet + Dark Top Pad + Red Ear Pods + Antennas + Red LED Visor) ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.38, 0);
    robotGroup.add(headGroup);

    // Rounded helmet shell
    const helmetGeo = new THREE.SphereGeometry(0.95, 36, 32);
    helmetGeo.scale(1.22, 0.96, 1.02);
    const helmetMesh = new THREE.Mesh(helmetGeo, whiteArmorMat);
    helmetMesh.castShadow = true;
    headGroup.add(helmetMesh);

    // Dark carbon top head pad
    const topPadGeo = new THREE.SphereGeometry(0.55, 24, 16);
    topPadGeo.scale(1.1, 0.35, 0.9);
    const topPadMesh = new THREE.Mesh(topPadGeo, carbonMat);
    topPadMesh.position.set(0, 0.78, 0.05);
    headGroup.add(topPadMesh);

    // Curved dark glass visor with glowing Red LED Eyes, Eyebrows & Smile
    const visorFrameGeo = new THREE.BoxGeometry(1.56, 0.98, 0.28);
    const visorFrame = new THREE.Mesh(visorFrameGeo, carbonMat);
    visorFrame.position.set(0, -0.02, 0.8);
    headGroup.add(visorFrame);

    const visorScreenGeo = new THREE.PlaneGeometry(1.42, 0.86);
    const visorScreen = new THREE.Mesh(visorScreenGeo, visorMat);
    visorScreen.position.set(0, -0.02, 0.95);
    headGroup.add(visorScreen);

    // Side Red Ear Pods + Angled Dark Antennas
    [-1, 1].forEach((side) => {
      const earPodGroup = new THREE.Group();
      earPodGroup.position.set(side * 1.14, -0.02, 0);
      headGroup.add(earPodGroup);

      const redEarCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.18, 24),
        crimsonMat
      );
      redEarCyl.rotation.z = Math.PI / 2;
      earPodGroup.add(redEarCyl);

      const darkEarCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.22, 24),
        carbonMat
      );
      darkEarCap.rotation.z = Math.PI / 2;
      earPodGroup.add(darkEarCap);

      // Sleek upward antenna blade
      const antennaBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.65, 0.14),
        carbonMat
      );
      antennaBlade.position.set(side * 0.06, 0.38, -0.04);
      antennaBlade.rotation.z = side * -0.18;
      earPodGroup.add(antennaBlade);
    });

    // --- TORSO (SmartTech Training Center White/Red Chest Armor) ---
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.12, 0);
    robotGroup.add(torsoGroup);

    // Neck ring
    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.38, 0.28, 24),
      carbonMat
    );
    neckMesh.position.set(0, 0.65, 0);
    torsoGroup.add(neckMesh);

    // Main chest body
    const chestGeo = new THREE.CylinderGeometry(0.68, 0.54, 1.05, 32);
    chestGeo.scale(1.16, 1, 0.82);
    const chestMesh = new THREE.Mesh(chestGeo, whiteArmorMat);
    chestMesh.castShadow = true;
    torsoGroup.add(chestMesh);

    // Front SmartTech Emblem Plate
    const frontPlateGeo = new THREE.PlaneGeometry(0.98, 0.88);
    const frontPlateMesh = new THREE.Mesh(frontPlateGeo, chestArmorMat);
    frontPlateMesh.position.set(0, 0.04, 0.56);
    torsoGroup.add(frontPlateMesh);

    // Red Collar Ring
    const collarGeo = new THREE.TorusGeometry(0.56, 0.085, 16, 36);
    collarGeo.scale(1.2, 0.85, 1);
    const collarMesh = new THREE.Mesh(collarGeo, crimsonMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 0.52, 0.04);
    torsoGroup.add(collarMesh);

    // Waist / Pelvis
    const pelvisMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 24, 20),
      whiteArmorMat
    );
    pelvisMesh.scale.set(1.15, 0.55, 0.82);
    pelvisMesh.position.set(0, -0.58, 0);
    torsoGroup.add(pelvisMesh);

    // --- RIGHT ARM (Resting on Hip with Glowing Red Square Wrist Badge - Viewer's Left) ---
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-0.86, 0.45, 0);
    robotGroup.add(rightArmGroup);

    const rightShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 24, 24),
      crimsonMat
    );
    rightArmGroup.add(rightShoulder);

    const rightUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.14, 0.5, 20),
      carbonMat
    );
    rightUpperArm.position.set(-0.22, -0.22, 0);
    rightUpperArm.rotation.z = -0.65;
    rightArmGroup.add(rightUpperArm);

    const rightForearmGroup = new THREE.Group();
    rightForearmGroup.position.set(-0.42, -0.44, 0.12);
    rightForearmGroup.rotation.z = 0.75;
    rightForearmGroup.rotation.x = 0.35;
    rightArmGroup.add(rightForearmGroup);

    const rightForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.16, 0.46, 20),
      carbonMat
    );
    rightForearmGroup.add(rightForearm);

    // Glowing Red Wrist Badge matching uploaded image
    const wristBadge = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.16, 0.06),
      redLedGlowMat
    );
    wristBadge.position.set(0, 0, 0.17);
    rightForearmGroup.add(wristBadge);

    const rightHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 20, 20),
      carbonMat
    );
    rightHand.position.set(0, -0.28, 0);
    rightForearmGroup.add(rightHand);

    // --- LEFT ARM (Raised Waving with 5 Fingers & Red Cuff - Viewer's Right) ---
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(0.86, 0.45, 0);
    robotGroup.add(leftArmGroup);

    const leftShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 24, 24),
      crimsonMat
    );
    leftArmGroup.add(leftShoulder);

    const leftUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.14, 0.48, 20),
      carbonMat
    );
    leftUpperArm.position.set(0.24, -0.05, 0);
    leftUpperArm.rotation.z = 1.25;
    leftArmGroup.add(leftUpperArm);

    const leftForearmGroup = new THREE.Group();
    leftForearmGroup.position.set(0.52, 0.08, 0.1);
    leftForearmGroup.rotation.z = 0.35;
    leftArmGroup.add(leftForearmGroup);

    const leftForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.15, 0.46, 20),
      carbonMat
    );
    leftForearm.position.set(0, 0.22, 0);
    leftForearmGroup.add(leftForearm);

    // Red wrist cuff
    const leftWristCuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.17, 0.04, 12, 24),
      crimsonMat
    );
    leftWristCuff.rotation.x = Math.PI / 2;
    leftWristCuff.position.set(0, 0.44, 0);
    leftForearmGroup.add(leftWristCuff);

    // Waving Palm + 5 Articulated Fingers
    const leftPalm = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 20, 20),
      carbonMat
    );
    leftPalm.scale.set(1.1, 1.0, 0.65);
    leftPalm.position.set(0, 0.6, 0);
    leftForearmGroup.add(leftPalm);

    const fingerAngles = [-0.65, -0.3, 0, 0.28, 0.56];
    fingerAngles.forEach((angle, idx) => {
      const finger = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.036, idx === 0 ? 0.12 : 0.18, 8, 12),
        carbonMat
      );
      const radius = 0.22;
      finger.position.set(
        Math.sin(angle) * radius,
        0.62 + Math.cos(angle) * radius,
        0
      );
      finger.rotation.z = -angle;
      leftForearmGroup.add(finger);
    });

    // --- LEGS (Carbon Thighs, Red Knees, Red Ankle Rings & White Rounded Boots) ---
    [-1, 1].forEach((side) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.42, -0.62, 0);
      robotGroup.add(legGroup);

      // Carbon Thigh
      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.16, 0.48, 20),
        carbonMat
      );
      thigh.position.set(side * 0.05, -0.22, 0);
      thigh.rotation.z = side * -0.12;
      legGroup.add(thigh);

      // Red Knee Guard
      const kneeGuard = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.24, 0.26),
        crimsonMat
      );
      kneeGuard.position.set(side * 0.08, -0.48, 0.05);
      legGroup.add(kneeGuard);

      // Lower Leg
      const shin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.24, 0.45, 20),
        carbonMat
      );
      shin.position.set(side * 0.1, -0.72, 0);
      legGroup.add(shin);

      // Red Ankle Ring + Glowing Side Node
      const ankleTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.23, 0.045, 12, 24),
        crimsonMat
      );
      ankleTrim.rotation.x = Math.PI / 2;
      ankleTrim.position.set(side * 0.11, -0.92, 0.04);
      legGroup.add(ankleTrim);

      const ankleGlow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16),
        redLedGlowMat
      );
      ankleGlow.rotation.z = Math.PI / 2;
      ankleGlow.position.set(side * 0.28, -0.9, 0);
      legGroup.add(ankleGlow);

      // White/Silver Rounded Boot
      const boot = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 24, 20),
        whiteArmorMat
      );
      boot.scale.set(0.95, 0.55, 1.38);
      boot.position.set(side * 0.12, -1.08, 0.12);
      boot.castShadow = true;
      legGroup.add(boot);
    });

    // --- 3D Glowing Pedestal Base ---
    const platformGroup = new THREE.Group();
    platformGroup.position.y = -1.82;
    scene.add(platformGroup);

    const baseCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(1.95, 2.2, 0.18, 48),
      carbonMat
    );
    baseCyl.receiveShadow = true;
    platformGroup.add(baseCyl);

    const glowingRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.02, 0.045, 16, 64),
      redLedGlowMat
    );
    glowingRing.rotation.x = Math.PI / 2;
    glowingRing.position.y = 0.08;
    platformGroup.add(glowingRing);

    // 8. Animation Loop Supporting All 6 Expressions
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const mode = activeActionRef.current;

      if (mode === 'greeting') {
        robotGroup.position.y = Math.sin(t * 2.2) * 0.1;
        robotGroup.rotation.y = Math.sin(t * 1.1) * 0.18;
        headGroup.rotation.z = Math.sin(t * 2.2) * 0.06;
        headGroup.rotation.x = 0;
        leftForearmGroup.rotation.z = 0.35 + Math.sin(t * 6.5) * 0.28;
      } else if (mode === 'pointing') {
        robotGroup.position.y = Math.sin(t * 2.5) * 0.06;
        robotGroup.rotation.y = 0.32 + Math.sin(t * 3) * 0.08;
        headGroup.rotation.y = 0.2;
        leftForearmGroup.rotation.z = -0.25 + Math.sin(t * 4) * 0.12;
      } else if (mode === 'thinking') {
        robotGroup.position.y = Math.sin(t * 1.6) * 0.06;
        robotGroup.rotation.y = Math.sin(t * 0.9) * 0.12;
        headGroup.rotation.z = 0.18 + Math.sin(t * 2) * 0.05;
        headGroup.rotation.x = -0.08;
        leftForearmGroup.rotation.z = 0.65;
      } else if (mode === 'celebrating') {
        robotGroup.position.y = Math.abs(Math.sin(t * 5.5)) * 0.28;
        robotGroup.rotation.y = Math.sin(t * 3.5) * 0.35;
        headGroup.rotation.z = Math.sin(t * 5.5) * 0.12;
        leftForearmGroup.rotation.z = 0.2 + Math.sin(t * 9) * 0.35;
      } else if (mode === 'encouraging') {
        robotGroup.position.y = Math.sin(t * 2.8) * 0.08;
        headGroup.rotation.x = Math.sin(t * 5) * 0.14;
        headGroup.rotation.z = 0;
        leftForearmGroup.rotation.z = 0.35 + Math.sin(t * 4.5) * 0.2;
      } else if (mode === 'victory') {
        robotGroup.position.y = 0.18 + Math.sin(t * 4) * 0.14;
        robotGroup.rotation.y = t * 1.4;
        headGroup.rotation.z = 0;
        leftForearmGroup.rotation.z = 0.15 + Math.sin(t * 7) * 0.25;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[450px] md:h-[520px] flex items-center justify-center">
      {/* Three.js Canvas Container (Preserves Exact Focused Selector Path: div:nth-of-type(1) > div:nth-of-type(1) > canvas:nth-of-type(1)) */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        title="اسحب لتدوير روبوت SmartTech ثلاثي الأبعاد"
      />

      {/* Glow Backdrop */}
      <div className="absolute w-3/4 h-3/4 bg-gradient-to-tr from-rose-500/20 via-sky-500/20 to-amber-500/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />

      {/* Official Uploaded 3D Character Portrait Overlay Card (Top-Right) */}
      <div className="absolute top-3 right-3 z-20 bg-slate-900/85 backdrop-blur-md border border-white/15 rounded-2xl p-2 shadow-xl flex items-center gap-2.5">
        <SmartyMascot3D
          action={activeAction}
          size="md"
          showBadge={true}
          lang={language}
        />
        <div className="pr-1 hidden sm:block text-right">
          <div className="text-[11px] font-black text-rose-400 tracking-wide">
            SMARTTECH 3D
          </div>
          <div className="text-xs font-bold text-white">
            {isAr ? 'الروبوت الذكي الرسمي' : 'Official Smart Robot'}
          </div>
        </div>
      </div>

      {/* Interactive 6-Expression Selector Bar (Bottom Overlay) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/15 shadow-xl w-max max-w-[95%]">
        {EXPRESSION_BUTTONS.map((btn) => {
          const isSelected = activeAction === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => handleActionChange(btn.id)}
              data-testid={`robot-expression-${btn.id}`}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-md scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{btn.icon}</span>
              <span>{isAr ? btn.labelAr : btn.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
