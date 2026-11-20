import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Camera,
  CheckCircle2,
  Eye,
  HelpCircle,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { JuniorAgeGroup, Language, StudentProgress } from '../types';
import {
  WorkshopCameraFocus,
  WorkshopGameConfig,
  WorkshopItemConfig,
  WorkshopMissionConfig,
  loadWorkshopConfig,
} from '../data/workshopOrganizerData';
import {
  DropZoneHandle,
  SmartyRobotHandle,
  WorkshopRoomHandle,
  createDropZoneMarker,
  createSmartyRobotGuide,
  createWorkshopProp,
  createWorkshopRoom,
} from '../three/workshopModels';
import {
  getAudioMuted,
  playPickupSfx,
  playRetrySfx,
  playSnapSfx,
  playSuccessFanfareSfx,
  setAudioMuted,
  speakInstruction,
} from '../utils/soundEffects';
import { SmartyMascot3D } from './SmartyMascot3D';

interface WorkshopOrganizerGameProps {
  language: Language;
  progress: StudentProgress;
  onUpdateProgress: (next: StudentProgress) => void;
  onExit: () => void;
  initialMissionNumber?: number;
  adminPreviewMode?: boolean;
  configOverride?: WorkshopGameConfig;
}

const CAMERA_PRESETS: Record<
  WorkshopCameraFocus,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  overview: { pos: [-0.15, 3.65, 5.35], target: [-0.1, 0.72, -0.35] },
  workbench: { pos: [-0.55, 3.25, 4.45], target: [-0.45, 0.72, -0.65] },
  gears_cart: { pos: [0.25, 3.15, 4.65], target: [0.75, 0.65, 0.1] },
  electronics: { pos: [-0.5, 3.1, 4.35], target: [-0.45, 0.72, -0.65] },
  shelves: { pos: [0.35, 3.15, 4.65], target: [0.95, 0.85, -0.65] },
  assembly_bay: { pos: [-0.25, 3.05, 4.45], target: [0.2, 0.68, -0.05] },
};

function detectSoftwareGl(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return false;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '')
      : String(gl.getParameter(gl.RENDERER) || '');
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
  } catch {
    return false;
  }
}

export const WorkshopOrganizerGame: React.FC<WorkshopOrganizerGameProps> = ({
  language,
  progress,
  onUpdateProgress,
  onExit,
  initialMissionNumber = 1,
  adminPreviewMode = false,
  configOverride,
}) => {
  const isAr = language === 'ar';

  const [workshopConfig, setWorkshopConfig] = useState<WorkshopGameConfig>(
    () => configOverride || loadWorkshopConfig()
  );

  useEffect(() => {
    if (configOverride) {
      setWorkshopConfig(configOverride);
      return;
    }
    const sync = () => setWorkshopConfig(loadWorkshopConfig());
    window.addEventListener('smartcoders:workshop-updated', sync);
    return () => window.removeEventListener('smartcoders:workshop-updated', sync);
  }, [configOverride]);

  const visibleMissions = useMemo(() => {
    const list = adminPreviewMode
      ? workshopConfig.missions
      : workshopConfig.missions.filter((m) => m.isPublished);
    return list.length > 0 ? list : workshopConfig.missions;
  }, [workshopConfig, adminPreviewMode]);

  const ageGroup: JuniorAgeGroup = progress.selectedAgeGroup || '4-5';
  const [missionIdx, setMissionIdx] = useState<number>(() => {
    const found = visibleMissions.findIndex((m) => m.missionNumber === initialMissionNumber);
    return found >= 0 ? found : 0;
  });

  const currentMission: WorkshopMissionConfig = visibleMissions[missionIdx] || visibleMissions[0];
  const ageVariant = currentMission.ageVariants[ageGroup] || currentMission.ageVariants['4-5'];

  const activeItems = useMemo(() => {
    const ids = new Set(ageVariant.activeItemIds);
    return currentMission.items.filter((it) => ids.has(it.id));
  }, [currentMission, ageVariant]);

  const activeZones = useMemo(() => {
    const ids = new Set(ageVariant.activeZoneIds);
    return currentMission.zones.filter((z) => ids.has(z.id));
  }, [currentMission, ageVariant]);

  // Game UI State
  const [showIntroModal, setShowIntroModal] = useState<boolean>(!adminPreviewMode && initialMissionNumber === 1);
  const [placedMap, setPlacedMap] = useState<Record<string, string>>({}); // itemId -> zoneId
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [wrongZoneId, setWrongZoneId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'retry' | 'hint'; text: string } | null>(null);
  const [missionComplete, setMissionComplete] = useState<boolean>(false);
  const [allMissionsDoneModal, setAllMissionsDoneModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => getAudioMuted());
  const [cameraPreset, setCameraPreset] = useState<WorkshopCameraFocus>(currentMission.cameraFocus);
  const [contextLost, setContextLost] = useState<boolean>(false);

  const unlockedMax = adminPreviewMode
    ? visibleMissions.length
    : progress.unlockedWorkshopByAge?.[ageGroup] ?? 1;

  const xpTotal = progress.xpEarned ?? progress.starsEarned * 10;

  // Reset per-mission placements when mission or age group changes
  useEffect(() => {
    setPlacedMap({});
    setSelectedItemId(null);
    setDraggingItemId(null);
    setHoveredZoneId(null);
    setWrongZoneId(null);
    setFeedback(null);
    setMissionComplete(false);
    setCameraPreset(currentMission.cameraFocus);
    if (!showIntroModal) {
      speakInstruction(currentMission.audioText[language], language);
    }
  }, [currentMission.id, ageGroup]);

  // Mutable refs for Three.js animation & event loop (zero stale closures)
  const mountRef = useRef<HTMLDivElement | null>(null);
  const placedMapRef = useRef(placedMap);
  const draggingItemIdRef = useRef(draggingItemId);
  const hoveredZoneIdRef = useRef(hoveredZoneId);
  const wrongZoneIdRef = useRef(wrongZoneId);
  const selectedItemIdRef = useRef(selectedItemId);
  const activeItemsRef = useRef(activeItems);
  const activeZonesRef = useRef(activeZones);
  const showGuidesRef = useRef(ageVariant.showVisualGuides);
  const missionCompleteRef = useRef(missionComplete);
  const cameraPresetRef = useRef<WorkshopCameraFocus>(cameraPreset);
  const smartyMoodRef = useRef<'idle' | 'happy' | 'oops' | 'point' | 'celebrate'>('idle');
  const celebrateUntilRef = useRef<number>(0);

  placedMapRef.current = placedMap;
  draggingItemIdRef.current = draggingItemId;
  hoveredZoneIdRef.current = hoveredZoneId;
  wrongZoneIdRef.current = wrongZoneId;
  selectedItemIdRef.current = selectedItemId;
  activeItemsRef.current = activeItems;
  activeZonesRef.current = activeZones;
  showGuidesRef.current = ageVariant.showVisualGuides;
  missionCompleteRef.current = missionComplete;
  cameraPresetRef.current = cameraPreset;

  // Dynamic Scene Object Pools stored in refs so mission switches rebuild items/zones cleanly without tearing down WebGLRenderer!
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const propMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const zoneMapRef = useRef<Map<string, DropZoneHandle>>(new Map());
  const roomRef = useRef<WorkshopRoomHandle | null>(null);
  const smartyRef = useRef<SmartyRobotHandle | null>(null);
  const cameraTweenRef = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    pos: new THREE.Vector3(...CAMERA_PRESETS.overview.pos),
    target: new THREE.Vector3(...CAMERA_PRESETS.overview.target),
  });

  // Pre-allocated math helpers outside render loop
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerNdcRef = useRef(new THREE.Vector2());
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.6));
  const hitVecRef = useRef(new THREE.Vector3());
  const worldVecRef = useRef(new THREE.Vector3());

  // Core attempt drop handler stored in ref for canvas pointerup
  const attemptPlaceRef = useRef<(itemId: string, zoneId: string) => boolean>(() => false);

  attemptPlaceRef.current = (itemId: string, zoneId: string) => {
    const zone = activeZonesRef.current.find((z) => z.id === zoneId);
    const item = activeItemsRef.current.find((it) => it.id === itemId);
    if (!zone || !item) return false;

    const alreadyInZone = Object.entries(placedMapRef.current).some(([, zId]) => zId === zoneId);
    if (alreadyInZone) {
      playRetrySfx();
      smartyMoodRef.current = 'oops';
      celebrateUntilRef.current = performance.now() + 1400;
      setFeedback({ type: 'retry', text: currentMission.retryMessage[language] });
      return false;
    }

    if (zone.acceptsItemIds.includes(itemId)) {
      playSnapSfx();
      smartyMoodRef.current = 'happy';
      celebrateUntilRef.current = performance.now() + 1600;
      const nextPlaced = { ...placedMapRef.current, [itemId]: zoneId };
      setPlacedMap(nextPlaced);
      setSelectedItemId(null);
      setFeedback({
        type: 'success',
        text: isAr ? `رائع! تم وضع ${item.label.ar} في ${zone.label.ar}!` : `Great! Placed ${item.label.en} in ${zone.label.en}!`,
      });

      // Check Mission Completion
      const allDone = activeItemsRef.current.every((it) => Boolean(nextPlaced[it.id]));
      if (allDone) {
        setMissionComplete(true);
        smartyMoodRef.current = 'celebrate';
        celebrateUntilRef.current = performance.now() + 5000;
        playSuccessFanfareSfx();
        speakInstruction(currentMission.successMessage[language], language);

        const completionKey = `ws-${currentMission.id}-${ageGroup}`;
        const alreadyEarned = progress.completedActivityIds.includes(completionKey);
        const currentUnlocked = progress.unlockedWorkshopByAge?.[ageGroup] ?? 1;
        const nextUnlocked = Math.min(
          visibleMissions.length,
          Math.max(currentUnlocked, currentMission.missionNumber + 1)
        );
        const updatedProgress: StudentProgress = {
          ...progress,
          completedActivityIds: alreadyEarned
            ? progress.completedActivityIds
            : [...progress.completedActivityIds, completionKey],
          xpEarned: alreadyEarned ? xpTotal : xpTotal + currentMission.xpReward,
          starsEarned: alreadyEarned ? progress.starsEarned : progress.starsEarned + 1,
          unlockedWorkshopByAge: {
            '3-4': 1,
            '4-5': 1,
            '5-6': 1,
            ...(progress.unlockedWorkshopByAge || {}),
            [ageGroup]: nextUnlocked,
          },
          lastActiveDate: new Date().toISOString().split('T')[0],
        };
        onUpdateProgress(updatedProgress);

        if (missionIdx === visibleMissions.length - 1) {
          setTimeout(() => setAllMissionsDoneModal(true), 1100);
        }
      }
      return true;
    }

    // Wrong slot feedback + snap back
    playRetrySfx();
    smartyMoodRef.current = 'oops';
    celebrateUntilRef.current = performance.now() + 1400;
    setWrongZoneId(zoneId);
    setTimeout(() => setWrongZoneId(null), 700);
    setFeedback({ type: 'retry', text: currentMission.retryMessage[language] });
    return false;
  };

  // Trigger camera tween whenever cameraPreset changes
  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.overview;
    cameraTweenRef.current.pos.set(...preset.pos);
    cameraTweenRef.current.target.set(...preset.target);
    cameraTweenRef.current.active = true;
  }, [cameraPreset]);

  // Mount Three.js Scene ONCE & clean up on unmount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isDark = document.documentElement.classList.contains('dark');
    const isSoftwareGl = detectSoftwareGl();

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x0b1120 : 0xdbe5f1);
    scene.fog = new THREE.Fog(isDark ? 0x0b1120 : 0xdbe5f1, 10, 24);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 60);
    const startPreset = CAMERA_PRESETS[cameraPresetRef.current] || CAMERA_PRESETS.overview;
    camera.position.set(...startPreset.pos);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.05 : 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.setAttribute('data-testid', 'workshop-3d-canvas');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // RoomEnvironment IBL (essential for metallic PBR gears, tools, and robot chassis)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    // Studio & Workshop Lighting Rig
    const hemi = new THREE.HemisphereLight(0xf1f5f9, 0x334155, isDark ? 0.8 : 0.95);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.25);
    keyLight.position.set(4.5, 7.5, 5.2);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 22;
      keyLight.shadow.camera.left = -6;
      keyLight.shadow.camera.right = 6;
      keyLight.shadow.camera.top = 6;
      keyLight.shadow.camera.bottom = -6;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.95);
    fillLight.position.set(-5.5, 4.0, 2.5);
    scene.add(fillLight);

    const bayLight = new THREE.PointLight(0x38bdf8, 1.8, 7.5, 1.6);
    bayLight.position.set(0.2, 1.8, 0.3);
    scene.add(bayLight);

    // OrbitControls with gentle constraints
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(...startPreset.target);
    controls.minPolarAngle = 0.22;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.minDistance = 2.8;
    controls.maxDistance = 8.8;
    controls.update();
    controlsRef.current = controls;

    const stopTween = () => {
      cameraTweenRef.current.active = false;
    };
    controls.addEventListener('start', stopTween);

    // Build Room + Smarty Guide
    const maxAniso = isSoftwareGl ? 1 : Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const room = createWorkshopRoom(isDark, maxAniso);
    scene.add(room.group);
    roomRef.current = room;

    const smarty = createSmartyRobotGuide(maxAniso);
    scene.add(smarty.group);
    smartyRef.current = smarty;

    // Context Loss Handling
    const onContextLost = (ev: Event) => {
      ev.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => setContextLost(false);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // ResizeObserver for crisp layout
    const resizeObs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(300, entry.contentRect.width);
      const h = Math.max(260, entry.contentRect.height);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    });
    resizeObs.observe(container);

    // Pointer Events for Direct 3D Drag & Drop
    const canvas = renderer.domElement;

    const updateNdc = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerNdcRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdcRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const findNearestZone = (pos: THREE.Vector3): string | null => {
      let bestId: string | null = null;
      let bestDist = 0.92;
      for (const z of activeZonesRef.current) {
        const occupied = Object.values(placedMapRef.current).includes(z.id);
        if (occupied) continue;
        worldVecRef.current.set(...z.worldPos);
        const dist = pos.distanceTo(worldVecRef.current);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = z.id;
        }
      }
      return bestId;
    };

    const onPointerDown = (e: PointerEvent) => {
      updateNdc(e);
      raycasterRef.current.setFromCamera(pointerNdcRef.current, camera);

      // 1. Check if clicking an unplaced 3D prop
      const pickables: THREE.Object3D[] = [];
      propMapRef.current.forEach((grp, id) => {
        if (!placedMapRef.current[id]) pickables.push(grp);
      });

      const propHits = raycasterRef.current.intersectObjects(pickables, true);
      if (propHits.length > 0) {
        const hitItemId = propHits[0].object.userData.itemId as string | undefined;
        if (hitItemId && !placedMapRef.current[hitItemId]) {
          e.stopPropagation();
          controls.enabled = false;
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch {
            // Ignore in synthetic events
          }
          playPickupSfx();
          setDraggingItemId(hitItemId);
          setSelectedItemId(hitItemId);
          smartyMoodRef.current = 'point';
          celebrateUntilRef.current = performance.now() + 2500;
          // Set drag plane angled softly toward camera at ~height of hovered item
          const grp = propMapRef.current.get(hitItemId);
          if (grp) {
            dragPlaneRef.current.setFromNormalAndCoplanarPoint(
              new THREE.Vector3(0, 0.72, 0.7).normalize(),
              new THREE.Vector3(grp.position.x, Math.max(0.75, grp.position.y + 0.35), grp.position.z)
            );
          }
          return;
        }
      }

      // 2. If child previously selected an item in dock and clicked directly on a 3D DropZone!
      if (selectedItemIdRef.current) {
        const zoneObjects: THREE.Object3D[] = [];
        zoneMapRef.current.forEach((z) => zoneObjects.push(z.group));
        const zoneHits = raycasterRef.current.intersectObjects(zoneObjects, true);
        if (zoneHits.length > 0) {
          let curr: THREE.Object3D | null = zoneHits[0].object;
          let zId: string | undefined;
          while (curr && !zId) {
            zId = curr.userData.zoneId as string | undefined;
            curr = curr.parent;
          }
          if (zId) {
            e.stopPropagation();
            attemptPlaceRef.current(selectedItemIdRef.current, zId);
          }
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      updateNdc(e);
      raycasterRef.current.setFromCamera(pointerNdcRef.current, camera);

      const dragId = draggingItemIdRef.current;
      if (!dragId) {
        // Cursor affordance on hover
        const pickables: THREE.Object3D[] = [];
        propMapRef.current.forEach((grp, id) => {
          if (!placedMapRef.current[id]) pickables.push(grp);
        });
        const hits = raycasterRef.current.intersectObjects(pickables, true);
        canvas.style.cursor = hits.length > 0 ? 'grab' : 'default';
        return;
      }

      canvas.style.cursor = 'grabbing';
      const draggedGroup = propMapRef.current.get(dragId);
      if (!draggedGroup) return;

      // Check direct raycast onto a DropZone first (so high shelves & back wall pegboard lock effortlessly!)
      const zoneObjects: THREE.Object3D[] = [];
      zoneMapRef.current.forEach((z) => zoneObjects.push(z.group));
      const zoneHits = raycasterRef.current.intersectObjects(zoneObjects, true);

      let targetZoneHit: string | null = null;
      if (zoneHits.length > 0) {
        let curr: THREE.Object3D | null = zoneHits[0].object;
        while (curr && !targetZoneHit) {
          targetZoneHit = (curr.userData.zoneId as string | undefined) || null;
          curr = curr.parent;
        }
      }

      if (targetZoneHit) {
        const zoneCfg = activeZonesRef.current.find((z) => z.id === targetZoneHit);
        if (zoneCfg && !Object.values(placedMapRef.current).includes(targetZoneHit)) {
          draggedGroup.position.lerp(
            worldVecRef.current.set(zoneCfg.worldPos[0], zoneCfg.worldPos[1] + 0.14, zoneCfg.worldPos[2] + 0.08),
            0.45
          );
          setHoveredZoneId(targetZoneHit);
          return;
        }
      }

      // Otherwise slide cleanly along the sloped camera-friendly workspace drag plane
      if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, hitVecRef.current)) {
        hitVecRef.current.x = THREE.MathUtils.clamp(hitVecRef.current.x, -3.1, 3.4);
        hitVecRef.current.y = THREE.MathUtils.clamp(hitVecRef.current.y, 0.35, 2.45);
        hitVecRef.current.z = THREE.MathUtils.clamp(hitVecRef.current.z, -2.55, 2.65);
        draggedGroup.position.copy(hitVecRef.current);
        const nearId = findNearestZone(hitVecRef.current);
        setHoveredZoneId(nearId);
      }
    };

    const finishDrag = (e: PointerEvent) => {
      const dragId = draggingItemIdRef.current;
      if (!dragId) return;
      controls.enabled = true;
      canvas.style.cursor = 'default';
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      const targetId = hoveredZoneIdRef.current;
      setDraggingItemId(null);
      setHoveredZoneId(null);
      if (targetId) {
        attemptPlaceRef.current(dragId, targetId);
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', finishDrag);
    canvas.addEventListener('pointercancel', finishDrag);

    // Animation Loop (Software-GL fenceSync aware per Three.js skill)
    let rafId = 0;
    let timerId = 0;
    let disposed = false;
    const startMs = performance.now();

    const stepAndRender = () => {
      if (disposed) return;
      const now = performance.now();
      const elapsed = (now - startMs) * 0.001;

      if (cameraTweenRef.current.active) {
        camera.position.lerp(cameraTweenRef.current.pos, 0.08);
        controls.target.lerp(cameraTweenRef.current.target, 0.08);
        if (
          camera.position.distanceTo(cameraTweenRef.current.pos) < 0.03 &&
          controls.target.distanceTo(cameraTweenRef.current.target) < 0.03
        ) {
          cameraTweenRef.current.active = false;
        }
      }
      controls.update();

      // Update Smarty Robot mood & animation
      if (now > celebrateUntilRef.current && !missionCompleteRef.current) {
        smartyMoodRef.current = draggingItemIdRef.current ? 'point' : 'idle';
      }
      smarty.updateAnimation(smartyMoodRef.current, elapsed);

      // Update Assembly Bay lighting & spin on completion
      if (missionCompleteRef.current) {
        room.bayRingMat.color.setHex(0x10b981);
        room.bayRingMat.emissive.setHex(0x10b981);
        room.bayRingMat.emissiveIntensity = 1.15 + Math.sin(elapsed * 5) * 0.25;
        bayLight.color.setHex(0x10b981);
        room.baySpindle.rotation.y += 0.015;
      } else {
        room.bayRingMat.color.setHex(0x38bdf8);
        room.bayRingMat.emissive.setHex(0x0ea5e9);
        room.bayRingMat.emissiveIntensity = 0.65;
        bayLight.color.setHex(0x38bdf8);
      }

      // Animate props gently (placed snap lerp vs unplaced idle bob vs selected glow bounce)
      activeItemsRef.current.forEach((itemCfg, idx) => {
        const prop = propMapRef.current.get(itemCfg.id);
        if (!prop) return;
        const placedZoneId = placedMapRef.current[itemCfg.id];
        if (placedZoneId) {
          const zoneCfg = activeZonesRef.current.find((z) => z.id === placedZoneId);
          if (zoneCfg) {
            worldVecRef.current.set(zoneCfg.worldPos[0], zoneCfg.worldPos[1] + 0.14, zoneCfg.worldPos[2] + (zoneCfg.zoneKind === 'tool_rack' ? 0.08 : 0));
            prop.position.lerp(worldVecRef.current, 0.22);
            if (itemCfg.modelType === 'spur_gear' && missionCompleteRef.current) {
              prop.rotation.y += 0.035;
            } else {
              prop.rotation.y = THREE.MathUtils.lerp(prop.rotation.y, 0, 0.15);
            }
            prop.scale.setScalar(0.95);
          }
        } else if (draggingItemIdRef.current !== itemCfg.id) {
          const isSelected = selectedItemIdRef.current === itemCfg.id;
          const baseY = itemCfg.scatterPos[1] + (isSelected ? 0.26 + Math.sin(elapsed * 6) * 0.04 : Math.sin(elapsed * 2 + idx) * 0.025);
          worldVecRef.current.set(itemCfg.scatterPos[0], baseY, itemCfg.scatterPos[2]);
          prop.position.lerp(worldVecRef.current, 0.18);
          prop.rotation.y = itemCfg.scatterRotY + Math.sin(elapsed * 1.2 + idx) * 0.08;
          prop.scale.setScalar(isSelected ? 1.18 : 1.0);
        } else {
          prop.scale.setScalar(1.16);
        }
      });

      // Animate DropZone Markers
      zoneMapRef.current.forEach((handle, zId) => {
        const isFilled = Object.values(placedMapRef.current).includes(zId);
        const state = isFilled
          ? 'filled'
          : wrongZoneIdRef.current === zId
          ? 'wrong'
          : hoveredZoneIdRef.current === zId
          ? 'hover'
          : 'idle';
        handle.setState(state, showGuidesRef.current, elapsed);
      });

      renderer.render(scene, camera);
    };

    const scheduleHardware = () => {
      if (disposed) return;
      stepAndRender();
      rafId = requestAnimationFrame(scheduleHardware);
    };

    const glCtx = renderer.getContext() as WebGL2RenderingContext;
    const scheduleSoftware = () => {
      if (disposed) return;
      stepAndRender();
      if (typeof glCtx.fenceSync === 'function') {
        const sync = glCtx.fenceSync(glCtx.SYNC_GPU_COMMANDS_COMPLETE, 0);
        glCtx.flush();
        const poll = () => {
          if (disposed) {
            if (sync) glCtx.deleteSync(sync);
            return;
          }
          if (!sync) {
            timerId = window.setTimeout(scheduleSoftware, 80);
            return;
          }
          const status = glCtx.clientWaitSync(sync, 0, 0);
          if (status === glCtx.TIMEOUT_EXPIRED) {
            timerId = window.setTimeout(poll, 16);
          } else {
            glCtx.deleteSync(sync);
            timerId = window.setTimeout(scheduleSoftware, 80);
          }
        };
        timerId = window.setTimeout(poll, 80);
      } else {
        timerId = window.setTimeout(scheduleSoftware, 90);
      }
    };

    // Synchronous first-frame render so canvas never flashes blank before timer fires
    stepAndRender();

    if (isSoftwareGl) {
      scheduleSoftware();
    } else {
      scheduleHardware();
    }

    // Live Light/Dark Theme Sync via class MutationObserver
    const themeObs = new MutationObserver(() => {
      const darkNow = document.documentElement.classList.contains('dark');
      const bgHex = darkNow ? 0x0b1120 : 0xdbe5f1;
      scene.background = new THREE.Color(bgHex);
      scene.fog = new THREE.Fog(bgHex, 10, 24);
      room.wallMat.color.setHex(darkNow ? 0x1e293b : 0xe5ebf4);
      room.floorMat.color.setHex(darkNow ? 0x64748b : 0xffffff);
      hemi.intensity = darkNow ? 0.65 : 0.95;
      renderer.toneMappingExposure = darkNow ? 0.96 : 1.12;
      stepAndRender();
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      disposed = true;
      themeObs.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
      resizeObs.disconnect();
      controls.removeEventListener('start', stopTween);
      controls.dispose();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', finishDrag);
      canvas.removeEventListener('pointercancel', finishDrag);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      // Dispose all geometries, materials, textures cleanly
      propMapRef.current.forEach((grp) => {
        grp.traverse((child) => {
          const m = child as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          if (m.material) {
            if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
            else m.material.dispose();
          }
        });
      });
      zoneMapRef.current.forEach((z) => {
        z.group.traverse((child) => {
          const m = child as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          if (m.material) {
            if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
            else m.material.dispose();
          }
        });
      });
      room.disposables.geometries.forEach((g) => g.dispose());
      room.disposables.materials.forEach((m) => m.dispose());
      room.disposables.textures.forEach((t) => t.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // Synchronize mission items & drop zones inside the live 3D scene whenever mission/ageGroup changes
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!scene || !renderer) return;

    // Remove previous mission props & zones
    propMapRef.current.forEach((grp) => {
      scene.remove(grp);
      grp.traverse((child) => {
        const m = child as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material.dispose();
        }
      });
    });
    propMapRef.current.clear();

    zoneMapRef.current.forEach((z) => {
      scene.remove(z.group);
      z.group.traverse((child) => {
        const m = child as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material.dispose();
        }
      });
    });
    zoneMapRef.current.clear();

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    activeItems.forEach((item) => {
      const prop = createWorkshopProp(item.modelType, item.accentHex, item.id);
      prop.position.set(...item.scatterPos);
      prop.rotation.y = item.scatterRotY;
      scene.add(prop);
      propMapRef.current.set(item.id, prop);
    });

    activeZones.forEach((zone) => {
      const marker = createDropZoneMarker(zone, maxAniso);
      scene.add(marker.group);
      zoneMapRef.current.set(zone.id, marker);
    });

    if (cameraRef.current) {
      renderer.render(scene, cameraRef.current);
    }
  }, [activeItems, activeZones]);

  // Helper to handle Dock Card Pointer Drag directly onto the 3D canvas zones!
  const handleDockCardPointerDown = (item: WorkshopItemConfig, e: React.PointerEvent<HTMLButtonElement>) => {
    if (placedMap[item.id] || missionComplete) return;
    playPickupSfx();
    setSelectedItemId(item.id);
    setDraggingItemId(item.id);
    smartyMoodRef.current = 'point';
    celebrateUntilRef.current = performance.now() + 2500;

    const startX = e.clientX;
    const startY = e.clientY;
    let movedFar = false;

    const onWinMove = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 12) {
        movedFar = true;
      }
      const canvas = rendererRef.current?.domElement;
      const camera = cameraRef.current;
      if (!canvas || !camera) return;
      const rect = canvas.getBoundingClientRect();
      if (
        ev.clientX >= rect.left &&
        ev.clientX <= rect.right &&
        ev.clientY >= rect.top &&
        ev.clientY <= rect.bottom
      ) {
        pointerNdcRef.current.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdcRef.current.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterRef.current.setFromCamera(pointerNdcRef.current, camera);

        const zoneObjects: THREE.Object3D[] = [];
        zoneMapRef.current.forEach((z) => zoneObjects.push(z.group));
        const hits = raycasterRef.current.intersectObjects(zoneObjects, true);
        let zId: string | null = null;
        if (hits.length > 0) {
          let curr: THREE.Object3D | null = hits[0].object;
          while (curr && !zId) {
            zId = (curr.userData.zoneId as string | undefined) || null;
            curr = curr.parent;
          }
        }
        if (!zId && raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, hitVecRef.current)) {
          let bestDist = 1.05;
          for (const z of activeZonesRef.current) {
            if (Object.values(placedMapRef.current).includes(z.id)) continue;
            const d = hitVecRef.current.distanceTo(worldVecRef.current.set(...z.worldPos));
            if (d < bestDist) {
              bestDist = d;
              zId = z.id;
            }
          }
        }
        setHoveredZoneId(zId);
        const prop = propMapRef.current.get(item.id);
        if (prop) {
          if (zId) {
            const zCfg = activeZonesRef.current.find((z) => z.id === zId);
            if (zCfg) {
              prop.position.set(zCfg.worldPos[0], zCfg.worldPos[1] + 0.2, zCfg.worldPos[2] + 0.08);
            }
          } else if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, hitVecRef.current)) {
            prop.position.set(
              THREE.MathUtils.clamp(hitVecRef.current.x, -3.1, 3.4),
              THREE.MathUtils.clamp(hitVecRef.current.y, 0.35, 2.45),
              THREE.MathUtils.clamp(hitVecRef.current.z, -2.55, 2.65)
            );
          }
        }
      }
    };

    const onWinUp = () => {
      window.removeEventListener('pointermove', onWinMove);
      window.removeEventListener('pointerup', onWinUp);
      const targetId = hoveredZoneIdRef.current;
      setDraggingItemId(null);
      setHoveredZoneId(null);
      if (movedFar && targetId) {
        attemptPlaceRef.current(item.id, targetId);
      }
    };

    window.addEventListener('pointermove', onWinMove);
    window.addEventListener('pointerup', onWinUp);
  };

  const handleAgeSwitch = (nextAge: JuniorAgeGroup) => {
    onUpdateProgress({
      ...progress,
      selectedAgeGroup: nextAge,
    });
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
  };

  const handleResetMission = () => {
    setPlacedMap({});
    setSelectedItemId(null);
    setDraggingItemId(null);
    setHoveredZoneId(null);
    setFeedback(null);
    setMissionComplete(false);
    smartyMoodRef.current = 'idle';
  };

  const placedCount = Object.keys(placedMap).length;
  const totalCount = activeItems.length;

  return (
    <div className="relative w-full h-[calc(100vh-4.2rem)] min-h-[600px] bg-slate-100 dark:bg-slate-950 overflow-hidden select-none">
      {/* Empty React Mount for 3D Three.js WebGL Canvas — ZERO siblings overlay with backdrop-blur */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {contextLost && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/90 text-white p-6 text-center">
          <div className="max-w-md space-y-3">
            <h3 className="text-lg font-bold">
              {isAr ? 'جاري استعادة العرض ثلاثي الأبعاد...' : 'Restoring 3D Workshop Display...'}
            </h3>
          </div>
        </div>
      )}

      {/* TOP COMPACT HUD BAR (Solid high-contrast surface, zero backdrop-blur) */}
      <div className="pointer-events-none absolute top-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-lg">
          <button
            type="button"
            onClick={onExit}
            data-testid="workshop-exit-btn"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-red-600 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? 'رجوع' : 'Back'}</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-red-600 shrink-0" />
            <div className="leading-tight">
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{workshopConfig.title[language]}</span>
                {adminPreviewMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">
                    <Eye className="w-3 h-3" />
                    {isAr ? 'معاينة إدارية' : 'Admin Preview'}
                  </span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {currentMission.title[language]}
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls: Age Groups, XP Counter, Camera Presets, Audio, Reset */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-lg">
          {/* Age Tier Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
            {(['3-4', '4-5', '5-6'] as JuniorAgeGroup[]).map((age) => (
              <button
                key={age}
                type="button"
                data-testid={`workshop-age-${age}`}
                onClick={() => handleAgeSwitch(age)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  ageGroup === age
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {age}
              </button>
            ))}
          </div>

          {/* Camera Views */}
          <button
            type="button"
            onClick={() =>
              setCameraPreset((prev) => (prev === 'overview' ? currentMission.cameraFocus : 'overview'))
            }
            data-testid="workshop-camera-toggle"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
            title={isAr ? 'تبديل زاوية الكاميرا' : 'Switch Camera View'}
          >
            <Camera className="w-3.5 h-3.5 text-sky-500" />
            <span>{cameraPreset === 'overview' ? (isAr ? 'تقريب' : 'Focus') : (isAr ? 'نظرة شاملة' : 'Overview')}</span>
          </button>

          <button
            type="button"
            onClick={() => speakInstruction(currentMission.audioText[language], language)}
            className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
            title={isAr ? 'اسمع المهمة' : 'Replay Voice'}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            title={isMuted ? (isAr ? 'تشغيل الصوت' : 'Unmute') : (isAr ? 'كتم الصوت' : 'Mute')}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setFeedback({ type: 'hint', text: currentMission.hint[language] });
              speakInstruction(currentMission.hint[language], language);
            }}
            className="p-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-200"
            title={isAr ? 'تلميح ذكي' : 'Smart Hint'}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetMission}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            title={isAr ? 'إعادة ضبط المهمة' : 'Reset Mission'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div
            data-testid="workshop-xp-badge"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-900 font-black text-xs tabular-nums"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{xpTotal}</span>
            <span>XP</span>
          </div>
        </div>
      </div>

      {/* SMARTY INSTRUCTION SPEECH BANNER + FEEDBACK (Compact, Non-Occluding Left/Top Strip) */}
      <div className="pointer-events-none absolute top-20 inset-x-3 z-20 flex flex-col items-start gap-2 max-w-md">
        <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-3">
          <SmartyMascot3D
            action={
              missionComplete
                ? 'victory'
                : feedback?.type === 'retry'
                ? 'encouraging'
                : feedback?.type === 'hint'
                ? 'thinking'
                : selectedItemId
                ? 'pointing'
                : 'greeting'
            }
            size="md"
            lang={language}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-black text-red-600 dark:text-red-400">
                {isAr ? `الروبوت سمارتي · التقدم (${placedCount}/${totalCount})` : `Smarty Robot · Progress (${placedCount}/${totalCount})`}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {ageVariant.hintNote[language]}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-relaxed" data-testid="workshop-instruction-text">
              {currentMission.instruction[language]}
            </p>
          </div>
        </div>

        {feedback && (
          <div
            data-testid="workshop-feedback-banner"
            className={`pointer-events-auto rounded-xl px-3.5 py-2 text-xs font-bold shadow-md border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-400 text-emerald-800 dark:text-emerald-200'
                : feedback.type === 'retry'
                ? 'bg-amber-50 dark:bg-amber-950/90 border-amber-400 text-amber-800 dark:text-amber-200'
                : 'bg-sky-50 dark:bg-sky-950/90 border-sky-400 text-sky-800 dark:text-sky-200'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* MISSION STEPPER SIDEBAR (Right Compact Strip) */}
      <div className="pointer-events-none absolute top-20 end-3 z-20 hidden md:flex flex-col gap-1.5">
        <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-lg space-y-1">
          {visibleMissions.map((m, idx) => {
            const unlocked = idx + 1 <= unlockedMax;
            const isActive = idx === missionIdx;
            const done = progress.completedActivityIds.includes(`ws-${m.id}-${ageGroup}`);
            return (
              <button
                key={m.id}
                type="button"
                disabled={!unlocked}
                data-testid={`workshop-mission-btn-${m.missionNumber}`}
                onClick={() => unlocked && setMissionIdx(idx)}
                className={`w-10 h-9 rounded-xl font-black text-xs flex items-center justify-center transition-colors border ${
                  isActive
                    ? 'bg-red-600 text-white border-red-500 shadow-sm'
                    : done
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-400'
                    : unlocked
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-red-400'
                    : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-55 cursor-not-allowed'
                }`}
                title={m.title[language]}
              >
                {unlocked ? (done && !isActive ? '✓' : m.missionNumber) : <Lock className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM WORKSHOP PARTS DOCK + ACCESSIBLE ZONE SNAP BAR (Solid surface, no backdrop-blur) */}
      <div className="pointer-events-none absolute bottom-3 inset-x-3 z-20 flex flex-col items-center gap-2">
        {missionComplete ? (
          <div
            data-testid="workshop-mission-complete-bar"
            className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 border-2 border-emerald-500 rounded-2xl px-5 py-3 shadow-2xl flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-black text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>{currentMission.successMessage[language]}</span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-900 text-xs font-black">
                +{currentMission.xpReward} XP
              </span>
            </div>
            {missionIdx < visibleMissions.length - 1 ? (
              <button
                type="button"
                data-testid="workshop-next-mission-btn"
                onClick={() => setMissionIdx((i) => Math.min(visibleMissions.length - 1, i + 1))}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'المهمة التالية' : 'Next Mission'}</span>
              </button>
            ) : (
              <button
                type="button"
                data-testid="workshop-finish-btn"
                onClick={() => setAllMissionsDoneModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>{isAr ? 'احتفال جاهزية المعمل!' : 'Workshop Ready Celebration!'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-xl max-w-4xl w-full flex flex-col gap-2">
            {/* Draggable / Selectable Components Tray */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {activeItems.map((item) => {
                const isPlaced = Boolean(placedMap[item.id]);
                const isSelected = selectedItemId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isPlaced}
                    data-testid={`workshop-tray-item-${item.id}`}
                    onPointerDown={(e) => handleDockCardPointerDown(item, e)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all touch-none ${
                      isPlaced
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-700 dark:text-emerald-300 opacity-75'
                        : isSelected
                        ? 'bg-red-600 text-white border-red-500 shadow-md -translate-y-0.5'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-red-400 cursor-grab'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: item.accentHex }}
                    />
                    <span>{item.label[language]}</span>
                    {isPlaced && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>

            {/* Selected Item Helper Bar -> Tap a Target Zone directly if desired */}
            {selectedItemId && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'اسحب في المعمل ثلاثي الأبعاد أو اختر مكان التخزين:' : 'Drag in 3D or tap target station:'}
                </span>
                {activeZones.map((zone) => {
                  const occupied = Object.values(placedMap).includes(zone.id);
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      disabled={occupied}
                      data-testid={`workshop-zone-target-${zone.id}`}
                      onClick={() => attemptPlaceRef.current(selectedItemId, zone.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        occupied
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 border-emerald-300 opacity-60'
                          : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700 hover:bg-sky-600 hover:text-white'
                      }`}
                    >
                      {zone.label[language]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* STORY INTRO MODAL WITH EXACT REQUIRED BILINGUAL COPY */}
      {showIntroModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4">
          <div
            data-testid="workshop-intro-modal"
            className="bg-white dark:bg-slate-900 rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md p-1 shrink-0">
                <SmartyMascot3D action="greeting" size="md" lang={language} />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                  {workshopConfig.pathwayLabel[language]}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {workshopConfig.title[language]}
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <p
                data-testid="workshop-intro-story-text"
                className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed"
              >
                {workshopConfig.introStory[language]}
              </p>
            </div>

            <button
              type="button"
              data-testid="workshop-start-btn"
              onClick={() => {
                setShowIntroModal(false);
                speakInstruction(
                  `${workshopConfig.introStory[language]} ${currentMission.audioText[language]}`,
                  language
                );
              }}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isAr ? 'ابدأ تنظيم المعمل الآن!' : 'Start Organizing Workshop!'}</span>
            </button>
          </div>
        </div>
      )}

      {/* FINAL WORKSHOP READY CELEBRATION MODAL */}
      {allMissionsDoneModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4">
          <div
            data-testid="workshop-celebration-modal"
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-emerald-500 text-center space-y-5"
          >
            <div className="flex items-center justify-center mx-auto">
              <SmartyMascot3D action="victory" size="xl" lang={language} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {isAr ? 'معمل الروبوتات جاهز!' : 'Robotics Workshop Ready!'}
            </h3>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              {workshopConfig.completionStory[language]}
            </p>
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black text-sm mx-auto w-fit">
              <Star className="w-4 h-4 fill-current" />
              <span>{isAr ? `إجمالي نقاطك: ${xpTotal} XP` : `Total XP: ${xpTotal} XP`}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAllMissionsDoneModal(false);
                  setMissionIdx(0);
                  handleResetMission();
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs"
              >
                {isAr ? 'العب مجدداً' : 'Play Again'}
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md"
              >
                {isAr ? 'العودة للمسار' : 'Back to Junior Lab'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
