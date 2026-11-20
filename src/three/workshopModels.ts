import * as THREE from 'three';
import { WorkshopModelType, WorkshopZoneConfig } from '../data/workshopOrganizerData';

export interface SmartyRobotHandle {
  group: THREE.Group;
  head: THREE.Group;
  torso: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  eyeLeft: THREE.Mesh;
  eyeRight: THREE.Mesh;
  beacon: THREE.Mesh;
  beaconMat: THREE.MeshStandardMaterial;
  eyeMat: THREE.MeshStandardMaterial;
  updateAnimation: (
    mood: 'idle' | 'happy' | 'oops' | 'point' | 'celebrate',
    elapsed: number
  ) => void;
}

export interface DropZoneHandle {
  zoneId: string;
  group: THREE.Group;
  ringMesh: THREE.Mesh;
  ringMat: THREE.MeshStandardMaterial;
  padMesh: THREE.Mesh;
  padMat: THREE.MeshStandardMaterial;
  setState: (
    state: 'idle' | 'hover' | 'filled' | 'wrong',
    showVisualGuides: boolean,
    elapsed: number
  ) => void;
}

export interface WorkshopRoomHandle {
  group: THREE.Group;
  bayRingMat: THREE.MeshStandardMaterial;
  baySpindle: THREE.Group;
  ceilingLedsMat: THREE.MeshStandardMaterial;
  wallMat: THREE.MeshStandardMaterial;
  floorMat: THREE.MeshStandardMaterial;
  disposables: { geometries: THREE.BufferGeometry[]; materials: THREE.Material[]; textures: THREE.Texture[] };
}

function makeCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  maxAnisotropy = 4,
  repeat?: [number, number]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, width, height);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.max(1, maxAnisotropy);
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  tex.needsUpdate = true;
  return tex;
}

export function createWorkshopRoom(isDark: boolean, maxAnisotropy: number): WorkshopRoomHandle {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = (t: THREE.CanvasTexture): THREE.CanvasTexture => {
    textures.push(t);
    return t;
  };

  // Floor Grid Canvas Texture
  const floorTex = trackTex(
    makeCanvasTexture(
      512,
      512,
      (ctx, w, h) => {
        ctx.fillStyle = isDark ? '#182032' : '#d8e0ea';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = isDark ? '#27354f' : '#c1ccdc';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, w - 4, h - 4);
        ctx.strokeStyle = isDark ? '#1e2940' : '#cdd6e3';
        ctx.lineWidth = 1.5;
        for (let i = 128; i < w; i += 128) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, h);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(w, i);
          ctx.stroke();
        }
        ctx.fillStyle = isDark ? '#32415e' : '#aebbd0';
        ctx.beginPath();
        ctx.arc(24, 24, 5, 0, Math.PI * 2);
        ctx.arc(w - 24, 24, 5, 0, Math.PI * 2);
        ctx.arc(24, h - 24, 5, 0, Math.PI * 2);
        ctx.arc(w - 24, h - 24, 5, 0, Math.PI * 2);
        ctx.fill();
      },
      maxAnisotropy,
      [7, 6]
    )
  );

  const floorGeo = trackGeo(new THREE.PlaneGeometry(14, 11));
  const floorMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.72,
      metalness: 0.12,
    })
  );
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Foreground Robotics Floor Mat (where unsorted items initially sit clearly)
  const scatterMatTex = trackTex(
    makeCanvasTexture(
      512,
      256,
      (ctx, w, h) => {
        ctx.fillStyle = isDark ? '#212b40' : '#eef2f7';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 10;
        ctx.setLineDash([22, 14]);
        ctx.strokeRect(12, 12, w - 24, h - 24);
        ctx.setLineDash([]);
        ctx.fillStyle = isDark ? '#f59e0b' : '#b45309';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PARTS PICKUP ZONE', w / 2, h - 26);
      },
      maxAnisotropy
    )
  );
  const pickupPad = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.9, 0.03, 0.95)),
    trackMat(new THREE.MeshStandardMaterial({ map: scatterMatTex, roughness: 0.85, metalness: 0.05 }))
  );
  pickupPad.position.set(-0.2, 0.015, 0.92);
  pickupPad.receiveShadow = true;
  group.add(pickupPad);

  // Back Wall + Side Accent Walls
  const wallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: isDark ? 0x1a2235 : 0xe5ebf4,
      roughness: 0.82,
      metalness: 0.08,
    })
  );
  const backWall = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(14, 5.2, 0.25)), wallMat);
  backWall.position.set(0, 2.5, -3.35);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Wall Wainscot Stripe (SmartTech Red Accent Band)
  const stripeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.45,
      metalness: 0.2,
    })
  );
  const wallStripe = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(14, 0.14, 0.05)), stripeMat);
  wallStripe.position.set(0, 1.15, -3.21);
  group.add(wallStripe);

  // SmartTech Workshop Header Banner Decal
  const bannerTex = trackTex(
    makeCanvasTexture(
      1024,
      256,
      (ctx, w, h) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, 0, 22, h);
        ctx.fillRect(w - 22, 0, 22, h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 54px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SMART CODERS ROBOTICS LAB', w / 2, 112);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText('SMART WORKSHOP ORGANIZER · STEM', w / 2, 178);
      },
      maxAnisotropy
    )
  );
  const bannerMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.8, 1.05, 0.08)),
    trackMat(new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.35, metalness: 0.2 }))
  );
  bannerMesh.position.set(0.2, 3.35, -3.18);
  group.add(bannerMesh);

  // Overhead Lighting Truss + Emissive LED Bar
  const trussMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.78, roughness: 0.32 }));
  const trussBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.5, 0.12, 0.18)), trussMat);
  trussBar.position.set(0, 4.15, -1.3);
  group.add(trussBar);

  const ceilingLedsMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    })
  );
  const ledStrip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.8, 0.06, 0.14)), ceilingLedsMat);
  ledStrip.position.set(0, 4.08, -1.3);
  group.add(ledStrip);

  // =========================================================
  // 1. WORKBENCH STATION (x = -0.55, z = -2.1)
  // =========================================================
  const steelDarkMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.78, roughness: 0.32 }));
  const oakTopMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xb97f4c, metalness: 0.08, roughness: 0.58 }));
  const benchGroup = new THREE.Group();
  benchGroup.position.set(-0.55, 0, -2.12);

  // Tabletop
  const benchTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.25, 0.12, 1.25)), oakTopMat);
  benchTop.position.set(0, 0.96, 0);
  benchTop.castShadow = true;
  benchTop.receiveShadow = true;
  benchGroup.add(benchTop);

  // 4 Steel Workbench Legs + Crossbar
  const legGeo = trackGeo(new THREE.BoxGeometry(0.11, 0.92, 0.11));
  [
    [-1.48, 0.46, -0.5],
    [1.48, 0.46, -0.5],
    [-1.48, 0.46, 0.5],
    [1.48, 0.46, 0.5],
  ].forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, steelDarkMat);
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    benchGroup.add(leg);
  });
  const lowerShelf = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.9, 0.05, 0.95)), steelDarkMat);
  lowerShelf.position.set(0, 0.28, 0);
  benchGroup.add(lowerShelf);

  // ESD Anti-Static Cutting Mat Texture on Tabletop
  const esdTex = trackTex(
    makeCanvasTexture(
      512,
      256,
      (ctx, w, h) => {
        ctx.fillStyle = '#065f46';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, w - 20, h - 20);
        ctx.lineWidth = 1;
        for (let x = 32; x < w; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 14);
          ctx.lineTo(x, h - 14);
          ctx.stroke();
        }
        for (let y = 32; y < h; y += 32) {
          ctx.beginPath();
          ctx.moveTo(14, y);
          ctx.lineTo(w - 14, y);
          ctx.stroke();
        }
      },
      maxAnisotropy
    )
  );
  const esdMat = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.6, 0.02, 0.9)),
    trackMat(new THREE.MeshStandardMaterial({ map: esdTex, roughness: 0.65, metalness: 0.05 }))
  );
  esdMat.position.set(0, 1.03, 0.06);
  esdMat.receiveShadow = true;
  benchGroup.add(esdMat);

  // Magnetic Tool Pegboard Back Panel
  const pegTex = trackTex(
    makeCanvasTexture(
      512,
      256,
      (ctx, w, h) => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#475569';
        for (let x = 24; x < w; x += 28) {
          for (let y = 24; y < h; y += 28) {
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, w - 8, h - 8);
      },
      maxAnisotropy
    )
  );
  const pegboard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.1, 1.35, 0.08)),
    trackMat(new THREE.MeshStandardMaterial({ map: pegTex, roughness: 0.5, metalness: 0.35 }))
  );
  pegboard.position.set(0, 1.72, -0.52);
  pegboard.castShadow = true;
  benchGroup.add(pegboard);
  group.add(benchGroup);

  // =========================================================
  // 2. 3-TIER INDUSTRIAL STORAGE SHELVES (x = 2.85, z = -1.65)
  // =========================================================
  const shelfGroup = new THREE.Group();
  shelfGroup.position.set(2.85, 0, -1.65);

  const postGeo = trackGeo(new THREE.BoxGeometry(0.08, 2.55, 0.08));
  const shelfPostMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.28 }));
  [
    [-0.72, 1.275, -0.38],
    [0.72, 1.275, -0.38],
    [-0.72, 1.275, 0.38],
    [0.72, 1.275, 0.38],
  ].forEach(([px, py, pz]) => {
    const post = new THREE.Mesh(postGeo, shelfPostMat);
    post.position.set(px, py, pz);
    post.castShadow = true;
    shelfGroup.add(post);
  });

  const plankGeo = trackGeo(new THREE.BoxGeometry(1.56, 0.07, 0.84));
  const plankMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.45, roughness: 0.45 }));
  const tierLabels = [
    { y: 0.38, title: 'BOTTOM SHELF', color: '#dc2626' },
    { y: 1.16, title: 'MIDDLE SHELF', color: '#f59e0b' },
    { y: 1.94, title: 'TOP SHELF', color: '#0ea5e9' },
  ];
  tierLabels.forEach((tier) => {
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.position.set(0, tier.y, 0);
    plank.castShadow = true;
    plank.receiveShadow = true;
    shelfGroup.add(plank);

    const signTex = trackTex(
      makeCanvasTexture(
        256,
        64,
        (ctx, w, h) => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = tier.color;
          ctx.fillRect(0, 0, 14, h);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(tier.title, w / 2 + 6, 41);
        },
        maxAnisotropy
      )
    );
    const labelPlaque = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.95, 0.14, 0.03)),
      trackMat(new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.35 }))
    );
    labelPlaque.position.set(0, tier.y, 0.43);
    shelfGroup.add(labelPlaque);
  });
  group.add(shelfGroup);

  // =========================================================
  // 3. MECHANICAL PARTS SORTING CART (x = 2.25, z = 0.92)
  // =========================================================
  const cartGroup = new THREE.Group();
  cartGroup.position.set(2.25, 0, 0.92);

  const cartDeck = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.45, 0.08, 1.15)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.42, metalness: 0.35 }))
  );
  cartDeck.position.set(0, 0.72, 0);
  cartDeck.castShadow = true;
  cartDeck.receiveShadow = true;
  cartGroup.add(cartDeck);

  const cartLegGeo = trackGeo(new THREE.CylinderGeometry(0.035, 0.035, 0.66, 12));
  const casterGeo = trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16));
  const rubberMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.88, metalness: 0.05 }));
  [
    [-0.6, -0.45],
    [0.6, -0.45],
    [-0.6, 0.45],
    [0.6, 0.45],
  ].forEach(([cx, cz]) => {
    const leg = new THREE.Mesh(cartLegGeo, steelDarkMat);
    leg.position.set(cx, 0.39, cz);
    cartGroup.add(leg);
    const caster = new THREE.Mesh(casterGeo, rubberMat);
    caster.rotation.z = Math.PI / 2;
    caster.position.set(cx, 0.06, cz);
    cartGroup.add(caster);
  });
  const cartTex = trackTex(
    makeCanvasTexture(
      256,
      64,
      (ctx, w, h) => {
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MECHANICAL CART', w / 2, 41);
      },
      maxAnisotropy
    )
  );
  const cartPlaque = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.05, 0.16, 0.04)),
    trackMat(new THREE.MeshStandardMaterial({ map: cartTex, roughness: 0.4 }))
  );
  cartPlaque.position.set(0, 0.64, 0.59);
  cartGroup.add(cartPlaque);
  group.add(cartGroup);

  // =========================================================
  // 4. CENTRAL ROBOT ASSEMBLY STATION (x = 0.55, z = -0.35)
  // =========================================================
  const bayGroup = new THREE.Group();
  bayGroup.position.set(0.55, 0, -0.35);
  bayGroup.scale.setScalar(0.84);

  const bayBaseMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.72, roughness: 0.32 }));
  const bayBase = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(1.05, 1.15, 0.22, 32)), bayBaseMat);
  bayBase.position.y = 0.11;
  bayBase.receiveShadow = true;
  bayGroup.add(bayBase);

  const bayRingMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.65,
      roughness: 0.25,
    })
  );
  const bayRing = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.98, 0.035, 12, 48)), bayRingMat);
  bayRing.rotation.x = Math.PI / 2;
  bayRing.position.y = 0.23;
  bayGroup.add(bayRing);

  // Assembly Gantry Arch Pillars (framing without blocking front access)
  const archMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.28 }));
  const leftPillar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.09, 1.38, 0.09)), archMat);
  leftPillar.position.set(-0.82, 0.9, -0.25);
  bayGroup.add(leftPillar);
  const rightPillar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.09, 1.38, 0.09)), archMat);
  rightPillar.position.set(0.82, 0.9, -0.25);
  bayGroup.add(rightPillar);
  const topGantry = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.75, 0.1, 0.12)), archMat);
  topGantry.position.set(0, 1.58, -0.25);
  bayGroup.add(topGantry);

  // Central Spindle Chassis Frame waiting for Robot Assembly parts
  const baySpindle = new THREE.Group();
  baySpindle.position.set(0, 0.24, 0.02);
  const pedestalStem = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.18, 0.28, 0.45, 20)), steelDarkMat);
  pedestalStem.position.y = 0.22;
  baySpindle.add(pedestalStem);
  const frameChest = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.55, 0.52, 0.36)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.65, roughness: 0.36 }))
  );
  frameChest.position.y = 0.72;
  frameChest.castShadow = true;
  baySpindle.add(frameChest);
  bayGroup.add(baySpindle);

  group.add(bayGroup);

  return {
    group,
    bayRingMat,
    baySpindle,
    ceilingLedsMat,
    wallMat,
    floorMat,
    disposables: { geometries, materials, textures },
  };
}

export function createSmartyRobotGuide(maxAnisotropy: number): SmartyRobotHandle {
  const group = new THREE.Group();
  group.position.set(-2.35, 0, -0.45);
  group.rotation.y = 0.56;

  const whiteArmor = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.18, roughness: 0.22 });
  const redArmor = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3, roughness: 0.25 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.32 });
  const visorGlass = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.7, roughness: 0.1 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff2e1f, emissive: 0xff1e10, emissiveIntensity: 1.8 });
  const beaconMat = new THREE.MeshStandardMaterial({ color: 0xff2e1f, emissive: 0xff2e1f, emissiveIntensity: 1.4 });

  // Rounded White Boots + Red Ankle Rings
  const leftFoot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), whiteArmor);
  leftFoot.scale.set(0.95, 0.55, 1.35);
  leftFoot.position.set(-0.2, 0.08, 0.05);
  leftFoot.castShadow = true;
  group.add(leftFoot);

  const rightFoot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), whiteArmor);
  rightFoot.scale.set(0.95, 0.55, 1.35);
  rightFoot.position.set(0.2, 0.08, 0.05);
  rightFoot.castShadow = true;
  group.add(rightFoot);

  // Carbon Legs with Red Knee Pads
  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.44, 16), darkMetal);
  leftLeg.position.set(-0.2, 0.34, 0);
  group.add(leftLeg);
  const leftKnee = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.14), redArmor);
  leftKnee.position.set(-0.2, 0.35, 0.04);
  group.add(leftKnee);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.44, 16), darkMetal);
  rightLeg.position.set(0.2, 0.34, 0);
  group.add(rightLeg);
  const rightKnee = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.14), redArmor);
  rightKnee.position.set(0.2, 0.35, 0.04);
  group.add(rightKnee);

  // Torso Group
  const torso = new THREE.Group();
  torso.position.set(0, 0.92, 0);
  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 16), whiteArmor);
  pelvis.scale.set(1.15, 0.55, 0.85);
  pelvis.position.y = -0.32;
  torso.add(pelvis);

  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.29, 0.56, 24), whiteArmor);
  chest.scale.set(1.15, 1, 0.82);
  chest.castShadow = true;
  torso.add(chest);

  const shoulderTrim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.045, 12, 28), redArmor);
  shoulderTrim.scale.set(1.2, 0.85, 1);
  shoulderTrim.rotation.x = Math.PI / 2;
  shoulderTrim.position.y = 0.27;
  torso.add(shoulderTrim);

  // Chest SmartTech Training Center Emblem
  const badgeTex = makeCanvasTexture(
    256,
    160,
    (ctx, w, h) => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, w - 8, h - 8);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 36px Georgia, serif';
      ctx.fillText('Smart', 24, 72);
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Tech', 132, 72);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px serif';
      ctx.fillText('Training Center', 44, 114);
    },
    maxAnisotropy
  );
  const chestScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.28),
    new THREE.MeshStandardMaterial({ map: badgeTex, roughness: 0.22 })
  );
  chestScreen.position.set(0, 0.02, 0.28);
  torso.add(chestScreen);

  // Articulated Carbon & Red Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.44, 0.16, 0);
  const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), redArmor);
  const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 16), darkMetal);
  lForearm.position.set(0, -0.22, 0);
  const lWristBadge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.03), beaconMat);
  lWristBadge.position.set(0, -0.24, 0.08);
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), darkMetal);
  lHand.position.set(0, -0.45, 0);
  leftArm.add(lShoulder, lForearm, lWristBadge, lHand);
  torso.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.44, 0.16, 0);
  const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), redArmor);
  const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 16), darkMetal);
  rForearm.position.set(0, -0.22, 0);
  const rCuff = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.02, 10, 20), redArmor);
  rCuff.rotation.x = Math.PI / 2;
  rCuff.position.set(0, -0.36, 0);
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), darkMetal);
  rHand.position.set(0, -0.45, 0);
  rightArm.add(rShoulder, rForearm, rCuff, rHand);
  torso.add(rightArm);

  // Rounded White Helmet + Glowing Red Ring-Eyes Visor + Side Red Ear Pods & Antennas
  const head = new THREE.Group();
  head.position.set(0, 0.62, 0);
  const headShell = new THREE.Mesh(new THREE.SphereGeometry(0.38, 28, 24), whiteArmor);
  headShell.scale.set(1.22, 0.96, 1.02);
  headShell.castShadow = true;
  head.add(headShell);

  const topPad = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), darkMetal);
  topPad.scale.set(1.1, 0.35, 0.9);
  topPad.position.set(0, 0.31, 0.02);
  head.add(topPad);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.08), visorGlass);
  visor.position.set(0, -0.01, 0.33);
  head.add(visor);

  const eyeLeft = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.022, 12, 24), eyeMat);
  eyeLeft.position.set(-0.13, 0.01, 0.38);
  const eyeRight = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.022, 12, 24), eyeMat);
  eyeRight.position.set(0.13, 0.01, 0.38);

  const smileArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.055, 0.014, 10, 20, Math.PI),
    eyeMat
  );
  smileArc.rotation.z = Math.PI;
  smileArc.position.set(0, -0.06, 0.38);
  head.add(eyeLeft, eyeRight, smileArc);

  // EarPods + Side Blade Antennas
  const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16), redArmor);
  earL.rotation.z = Math.PI / 2;
  earL.position.set(-0.45, 0, 0);
  const antL = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.24, 0.05), darkMetal);
  antL.position.set(-0.48, 0.14, -0.02);
  antL.rotation.z = 0.16;

  const earR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16), redArmor);
  earR.rotation.z = Math.PI / 2;
  earR.position.set(0.45, 0, 0);
  const antR = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.24, 0.05), darkMetal);
  antR.position.set(0.48, 0.14, -0.02);
  antR.rotation.z = -0.16;

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), beaconMat);
  beacon.position.set(0, 0.38, 0);
  head.add(earL, antL, earR, antR, beacon);

  torso.add(head);
  group.add(torso);

  return {
    group,
    head,
    torso,
    leftArm,
    rightArm,
    eyeLeft,
    eyeRight,
    beacon,
    beaconMat,
    eyeMat,
    updateAnimation: (mood, elapsed) => {
      torso.position.y = 0.92 + Math.sin(elapsed * 2.4) * 0.025;
      if (mood === 'celebrate' || mood === 'happy') {
        eyeMat.color.setHex(0xff2e1f);
        eyeMat.emissive.setHex(0xff2e1f);
        beaconMat.emissive.setHex(0x34d399);
        torso.position.y = 0.96 + Math.abs(Math.sin(elapsed * 7)) * 0.08;
        rightArm.rotation.z = 2.4 + Math.sin(elapsed * 10) * 0.35;
        leftArm.rotation.z = -2.2 - Math.sin(elapsed * 10) * 0.35;
        head.rotation.z = Math.sin(elapsed * 6) * 0.1;
      } else if (mood === 'oops') {
        eyeMat.color.setHex(0xf59e0b);
        eyeMat.emissive.setHex(0xf59e0b);
        beaconMat.emissive.setHex(0xf59e0b);
        head.rotation.y = Math.sin(elapsed * 12) * 0.18;
        rightArm.rotation.z = 0.4;
        leftArm.rotation.z = -0.4;
      } else if (mood === 'point') {
        eyeMat.color.setHex(0xff2e1f);
        eyeMat.emissive.setHex(0xff2e1f);
        rightArm.rotation.z = 1.25 + Math.sin(elapsed * 4) * 0.08;
        rightArm.rotation.x = -0.5;
        leftArm.rotation.z = -0.15;
        head.rotation.y = 0.15;
      } else {
        eyeMat.color.setHex(0xff2e1f);
        eyeMat.emissive.setHex(0xff1e10);
        beaconMat.emissive.setHex(0xff2e1f);
        rightArm.rotation.z = 2.35 + Math.sin(elapsed * 4.5) * 0.22;
        rightArm.rotation.x = 0;
        leftArm.rotation.z = -0.35;
        head.rotation.z = Math.sin(elapsed * 1.4) * 0.04;
        head.rotation.y = Math.sin(elapsed * 0.9) * 0.1;
      }
    },
  };
}

function buildGearGeometry(radius: number, teeth: number, thickness: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const outer = radius;
  const inner = radius * 0.78;
  const step = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.2;
    const a2 = a0 + step * 0.45;
    const a3 = a0 + step * 0.65;
    if (i === 0) shape.moveTo(Math.cos(a0) * inner, Math.sin(a0) * inner);
    else shape.lineTo(Math.cos(a0) * inner, Math.sin(a0) * inner);
    shape.lineTo(Math.cos(a1) * outer, Math.sin(a1) * outer);
    shape.lineTo(Math.cos(a2) * outer, Math.sin(a2) * outer);
    shape.lineTo(Math.cos(a3) * inner, Math.sin(a3) * inner);
  }
  shape.closePath();

  const hole = new THREE.Path();
  hole.absarc(0, 0, radius * 0.26, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

export function createWorkshopProp(
  modelType: WorkshopModelType,
  accentHex: string,
  itemId: string
): THREE.Group {
  const group = new THREE.Group();
  group.userData.itemId = itemId;

  const steelMat = new THREE.MeshStandardMaterial({ color: 0xdbe3ec, metalness: 0.88, roughness: 0.22 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.34 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accentHex, metalness: 0.3, roughness: 0.36 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.05, roughness: 0.86 });
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x047857, metalness: 0.22, roughness: 0.42 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.25 });

  switch (modelType) {
    case 'wrench': {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.06, 0.11), steelMat);
      const jawL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.065, 16), steelMat);
      jawL.position.set(0.28, 0, 0);
      const jawCut = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.075, 0.07), darkMetalMat);
      jawCut.position.set(0.32, 0, 0);
      const ringEnd = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.028, 12, 24), accentMat);
      ringEnd.rotation.x = Math.PI / 2;
      ringEnd.position.set(-0.28, 0, 0);
      group.add(handle, jawL, jawCut, ringEnd);
      break;
    }
    case 'screwdriver': {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.26, 16), accentMat);
      grip.rotation.z = Math.PI / 2;
      grip.position.set(-0.15, 0, 0);
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.05, 16), rubberMat);
      collar.rotation.z = Math.PI / 2;
      collar.position.set(-0.01, 0, 0);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 12), steelMat);
      shaft.rotation.z = Math.PI / 2;
      shaft.position.set(0.16, 0, 0);
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.045), darkMetalMat);
      tip.position.set(0.32, 0, 0);
      group.add(grip, collar, shaft, tip);
      break;
    }
    case 'pliers': {
      const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.06), accentMat);
      h1.position.set(-0.12, 0, 0.06);
      h1.rotation.y = 0.22;
      const h2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.06), accentMat);
      h2.position.set(-0.12, 0, -0.06);
      h2.rotation.y = -0.22;
      const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.07, 16), darkMetalMat);
      pivot.position.set(0.04, 0, 0);
      const n1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.045, 0.04), steelMat);
      n1.position.set(0.16, 0, 0.025);
      n1.rotation.y = -0.14;
      const n2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.045, 0.04), steelMat);
      n2.position.set(0.16, 0, -0.025);
      n2.rotation.y = 0.14;
      group.add(h1, h2, pivot, n1, n2);
      break;
    }
    case 'spur_gear': {
      const gearGeo = buildGearGeometry(0.27, 10, 0.09);
      const gearMesh = new THREE.Mesh(gearGeo, accentMat);
      gearMesh.rotation.x = Math.PI / 2;
      const hubRing = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 20), steelMat);
      const bolt1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.13, 8), darkMetalMat);
      bolt1.position.set(0.14, 0, 0);
      const bolt2 = bolt1.clone();
      bolt2.position.set(-0.14, 0, 0);
      group.add(gearMesh, hubRing, bolt1, bolt2);
      break;
    }
    case 'rover_wheel': {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 24), rubberMat);
      tire.rotation.z = Math.PI / 2;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.19, 18), accentMat);
      rim.rotation.z = Math.PI / 2;
      const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.21, 12), steelMat);
      hubCap.rotation.z = Math.PI / 2;
      for (let i = 0; i < 6; i++) {
        const tread = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.04, 0.05), darkMetalMat);
        const angle = (i / 6) * Math.PI * 2;
        tread.position.set(0, Math.cos(angle) * 0.23, Math.sin(angle) * 0.23);
        tread.rotation.x = -angle;
        group.add(tread);
      }
      group.add(tire, rim, hubCap);
      break;
    }
    case 'axle_rod': {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.62, 16), steelMat);
      rod.rotation.z = Math.PI / 2;
      const collarL = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 16), accentMat);
      collarL.rotation.z = Math.PI / 2;
      collarL.position.x = -0.22;
      const collarR = collarL.clone();
      collarR.position.x = 0.22;
      const centerBearing = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 16), darkMetalMat);
      centerBearing.rotation.z = Math.PI / 2;
      group.add(rod, collarL, collarR, centerBearing);
      break;
    }
    case 'cpu_module': {
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.36), pcbMat);
      const chip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.055, 0.18), darkMetalMat);
      chip.position.set(0, 0.04, 0);
      const pinStrip = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.05), goldMat);
      pinStrip.position.set(0, 0.04, 0.13);
      const statusLed = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.04, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.2 })
      );
      statusLed.position.set(-0.16, 0.04, -0.11);
      group.add(board, chip, pinStrip, statusLed);
      break;
    }
    case 'sensor_sonar': {
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.05), accentMat);
      const eyeL = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.12, 20), steelMat);
      eyeL.rotation.x = Math.PI / 2;
      eyeL.position.set(-0.12, 0.01, 0.07);
      const eyeR = eyeL.clone();
      eyeR.position.set(0.12, 0.01, 0.07);
      const pins = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.04), goldMat);
      pins.position.set(0, -0.12, 0);
      group.add(pcb, eyeL, eyeR, pins);
      break;
    }
    case 'power_cable': {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.036, 12, 28), accentMat);
      coil.rotation.x = Math.PI / 2;
      const coil2 = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.032, 12, 28), rubberMat);
      coil2.rotation.x = Math.PI / 2;
      coil2.position.y = 0.04;
      const plug = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.14), darkMetalMat);
      plug.position.set(0.22, 0.02, 0.06);
      const prong = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.07), goldMat);
      prong.position.set(0.3, 0.02, 0.06);
      group.add(coil, coil2, plug, prong);
      break;
    }
    case 'battery_pack': {
      const caseBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.34), darkMetalMat);
      const topPlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 0.36), accentMat);
      topPlate.position.y = 0.14;
      const termPos = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.07, 12), accentMat);
      termPos.position.set(0.13, 0.19, 0.09);
      const termNeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.07, 12), goldMat);
      termNeg.position.set(-0.13, 0.19, 0.09);
      group.add(caseBody, topPlate, termPos, termNeg);
      break;
    }
    case 'servo_motor': {
      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.24), darkMetalMat);
      const topCap = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.07, 0.26), accentMat);
      topCap.position.y = 0.14;
      const spline = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.09, 16), steelMat);
      spline.position.set(0.09, 0.21, 0);
      const horn = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.07), goldMat);
      horn.position.set(0.09, 0.26, 0);
      group.add(housing, topCap, spline, horn);
      break;
    }
    case 'chassis_core':
    default: {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.32), darkMetalMat);
      const coreFrame = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.34), accentMat);
      coreFrame.position.y = 0.12;
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.06, 20),
        new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 1.3 })
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, -0.02, 0.16);
      group.add(body, coreFrame, lens);
      break;
    }
  }

  // Transparent invisible hit-box for reliable toddler raycast picking
  const hitProxy = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.44, 0.56),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hitProxy.userData.itemId = itemId;
  group.add(hitProxy);

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.userData.itemId = itemId;
      if (child !== hitProxy) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    }
  });

  return group;
}

export function createDropZoneMarker(
  zone: WorkshopZoneConfig,
  maxAnisotropy: number
): DropZoneHandle {
  const group = new THREE.Group();
  group.position.set(...zone.worldPos);
  group.userData.zoneId = zone.id;

  const isWallMount = zone.zoneKind === 'tool_rack';

  const padMat = new THREE.MeshStandardMaterial({
    color: zone.accentHex,
    emissive: zone.accentHex,
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.35,
    roughness: 0.4,
  });

  const ringMat = new THREE.MeshStandardMaterial({
    color: zone.accentHex,
    emissive: zone.accentHex,
    emissiveIntensity: 0.75,
    roughness: 0.3,
  });

  const padMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.34, 0.05, 24),
    padMat
  );
  const ringMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.33, 0.032, 12, 32),
    ringMat
  );

  if (isWallMount) {
    padMesh.rotation.x = Math.PI / 2;
  } else {
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.03;
  }
  group.add(padMesh, ringMesh);

  // Clean Floating Micro-Sign Badge above/front of slot
  const badgeTex = makeCanvasTexture(
    256,
    80,
    (ctx, w, h) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = zone.accentHex;
      ctx.lineWidth = 6;
      ctx.strokeRect(4, 4, w - 8, h - 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.shortBadge, w / 2, 52);
    },
    maxAnisotropy
  );
  const badgeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.16, 0.03),
    new THREE.MeshStandardMaterial({ map: badgeTex, roughness: 0.35 })
  );
  badgeMesh.position.set(0, isWallMount ? -0.38 : 0.36, isWallMount ? 0.05 : 0);
  group.add(badgeMesh);

  // Larger invisible drop raycast volume
  const dropHit = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 12, 12),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  dropHit.userData.zoneId = zone.id;
  group.add(dropHit);

  return {
    zoneId: zone.id,
    group,
    ringMesh,
    ringMat,
    padMesh,
    padMat,
    setState: (state, showVisualGuides, elapsed) => {
      const pulse = 0.85 + Math.sin(elapsed * 4) * 0.15;
      if (state === 'filled') {
        ringMat.color.setHex(0x10b981);
        ringMat.emissive.setHex(0x10b981);
        ringMat.emissiveIntensity = 0.9;
        padMat.color.setHex(0x10b981);
        padMat.opacity = 0.5;
        ringMesh.scale.setScalar(1);
      } else if (state === 'hover') {
        ringMat.color.setHex(0x38bdf8);
        ringMat.emissive.setHex(0x38bdf8);
        ringMat.emissiveIntensity = 1.6;
        padMat.opacity = 0.65;
        ringMesh.scale.setScalar(1.16);
      } else if (state === 'wrong') {
        ringMat.color.setHex(0xef4444);
        ringMat.emissive.setHex(0xef4444);
        ringMat.emissiveIntensity = 1.5;
        ringMesh.scale.setScalar(1.08);
      } else {
        const baseHex = showVisualGuides ? zone.accentHex : '#64748b';
        ringMat.color.set(baseHex);
        ringMat.emissive.set(baseHex);
        ringMat.emissiveIntensity = showVisualGuides ? 0.85 * pulse : 0.35;
        padMat.color.set(baseHex);
        padMat.opacity = showVisualGuides ? 0.34 : 0.18;
        ringMesh.scale.setScalar(showVisualGuides ? 0.98 + Math.sin(elapsed * 3.5) * 0.05 : 1);
      }
    },
  };
}
