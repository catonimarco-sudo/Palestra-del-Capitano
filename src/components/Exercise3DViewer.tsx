import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ExerciseAnimationType } from '../types';
import { Play, Pause, Rotate3d, Eye, Zap, RefreshCw } from 'lucide-react';

interface Exercise3DViewerProps {
  animationType: ExerciseAnimationType;
  exerciseName: string;
  targetMuscles: string[];
  className?: string;
}

export const Exercise3DViewer: React.FC<Exercise3DViewerProps> = ({
  animationType,
  exerciseName,
  targetMuscles,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'front' | 'side'>('iso');
  const [highlightMuscles, setHighlightMuscles] = useState<boolean>(true);

  // References for render loop
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const highlightMusclesRef = useRef(highlightMuscles);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(2.5, 2.0, 3.2));
  const targetCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.1, 0));

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const modelRotationRef = useRef(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    highlightMusclesRef.current = highlightMuscles;
  }, [highlightMuscles]);

  // Set camera angle preset
  const setPreset = (preset: 'iso' | 'front' | 'side') => {
    setCameraPreset(preset);
    if (preset === 'iso') {
      targetCamPosRef.current.set(2.5, 2.0, 3.0);
      targetCamLookRef.current.set(0, 1.1, 0);
    } else if (preset === 'front') {
      targetCamPosRef.current.set(0, 1.3, 3.8);
      targetCamLookRef.current.set(0, 1.1, 0);
    } else if (preset === 'side') {
      targetCamPosRef.current.set(3.6, 1.3, 0);
      targetCamLookRef.current.set(0, 1.1, 0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 320;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.copy(targetCamPosRef.current);
    camera.lookAt(targetCamLookRef.current);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const amb = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(amb);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(3, 5, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rim = new THREE.DirectionalLight(0x06b6d4, 1.4);
    rim.position.set(-3, 3, -3);
    scene.add(rim);

    // 5. Gym Flooring & Grid Plate
    const floorPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.65, 0.08, 36),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.3 })
    );
    floorPlate.position.y = -0.04;
    floorPlate.receiveShadow = true;
    scene.add(floorPlate);

    const gridHelper = new THREE.GridHelper(3, 10, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // 6. Base Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.4,
      metalness: 0.2,
    });

    const activeMuscleMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Glowing Red/Amber for target muscle
      roughness: 0.3,
      metalness: 0.1,
      emissive: new THREE.Color(0xdc2626),
      emissiveIntensity: 0.45,
    });

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.2,
      metalness: 0.85,
    });

    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Bumper plates blue
      roughness: 0.5,
      metalness: 0.2,
    });

    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.7,
    });

    // 7. Rig Root
    const rigRoot = new THREE.Group();
    scene.add(rigRoot);

    // Dynamic objects to animate
    let animUpdate = (_phase: number, _t: number) => {};

    // Build specific setup based on animationType
    if (animationType === 'squat') {
      // Model for Back Squat
      const squatGuy = new THREE.Group();
      rigRoot.add(squatGuy);

      // Pelvis / Hips
      const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.2, 12), bodyMat);
      squatGuy.add(pelvis);

      // Torso
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.55, 12), highlightMusclesRef.current ? activeMuscleMat : bodyMat);
      torso.position.y = 0.35;
      pelvis.add(torso);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), bodyMat);
      head.position.y = 0.42;
      torso.add(head);

      // Barbell on shoulders
      const barbell = new THREE.Group();
      barbell.position.set(0, 0.32, -0.05);
      torso.add(barbell);

      const barRod = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.8, 12), ironMat);
      barRod.rotation.z = Math.PI / 2;
      barbell.add(barRod);

      // Weight plates
      [-0.75, 0.75].forEach((posX) => {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.07, 24), plateMat);
        plate.rotation.z = Math.PI / 2;
        plate.position.x = posX;
        barbell.add(plate);
      });

      // Upper Legs (Quads / Hamstrings)
      const thighMat = highlightMusclesRef.current ? activeMuscleMat : bodyMat;
      const leftThighGroup = new THREE.Group();
      leftThighGroup.position.set(-0.16, 0, 0);
      rigRoot.add(leftThighGroup);
      const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.45, 12), thighMat);
      leftThigh.position.y = -0.22;
      leftThighGroup.add(leftThigh);

      const rightThighGroup = new THREE.Group();
      rightThighGroup.position.set(0.16, 0, 0);
      rigRoot.add(rightThighGroup);
      const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.45, 12), thighMat);
      rightThigh.position.y = -0.22;
      rightThighGroup.add(rightThigh);

      // Calves & Feet
      const leftCalfGroup = new THREE.Group();
      leftCalfGroup.position.set(-0.16, 0.45, 0);
      rigRoot.add(leftCalfGroup);
      const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.45, 12), bodyMat);
      leftCalf.position.y = -0.22;
      leftCalfGroup.add(leftCalf);

      const rightCalfGroup = new THREE.Group();
      rightCalfGroup.position.set(0.16, 0.45, 0);
      rigRoot.add(rightCalfGroup);
      const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.45, 12), bodyMat);
      rightCalf.position.y = -0.22;
      rightCalfGroup.add(rightCalf);

      animUpdate = (phase) => {
        // Phase 0..1..0 sinusoidal depth
        const depth = (Math.cos(phase * Math.PI * 2) + 1) * 0.5; // 0 = standing, 1 = deep squat
        const hipY = 0.9 - depth * 0.42;
        const hipZ = -depth * 0.22;

        squatGuy.position.set(0, hipY, hipZ);
        torso.rotation.x = depth * 0.35; // Slight forward lean maintaining neutral spine

        // Knees flexion
        leftThighGroup.position.set(-0.16, hipY, hipZ);
        rightThighGroup.position.set(0.16, hipY, hipZ);
        leftThighGroup.rotation.x = -depth * 1.3;
        rightThighGroup.rotation.x = -depth * 1.3;

        // Calves stay anchored to floor feet
        leftCalfGroup.position.set(-0.16, 0.45 - depth * 0.1, 0);
        rightCalfGroup.position.set(0.16, 0.45 - depth * 0.1, 0);
        leftCalfGroup.rotation.x = depth * 0.6;
        rightCalfGroup.rotation.x = depth * 0.6;
      };
    } else if (animationType === 'bench_press') {
      // Model for Bench Press
      // Workout Bench
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 1.4), benchMat);
      bench.position.set(0, 0.45, 0);
      rigRoot.add(bench);

      // Bench legs
      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.1), ironMat);
      leg1.position.set(0, 0.22, 0.55);
      rigRoot.add(leg1);
      const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.1), ironMat);
      leg2.position.set(0, 0.22, -0.55);
      rigRoot.add(leg2);

      // Mannequin on bench
      const chestMat = highlightMusclesRef.current ? activeMuscleMat : bodyMat;
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.65), chestMat);
      torso.position.set(0, 0.58, 0);
      rigRoot.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), bodyMat);
      head.position.set(0, 0.62, -0.42);
      rigRoot.add(head);

      // Barbell
      const barbell = new THREE.Group();
      rigRoot.add(barbell);
      const barRod = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.7, 12), ironMat);
      barRod.rotation.z = Math.PI / 2;
      barbell.add(barRod);

      [-0.72, 0.72].forEach((posX) => {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 24), plateMat);
        plate.rotation.z = Math.PI / 2;
        plate.position.x = posX;
        barbell.add(plate);
      });

      // Arms
      const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.45, 12), bodyMat);
      rigRoot.add(leftArm);
      const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.45, 12), bodyMat);
      rigRoot.add(rightArm);

      animUpdate = (phase) => {
        const pressProgress = (Math.cos(phase * Math.PI * 2) + 1) * 0.5; // 0 = bar on chest, 1 = bar locked out
        const barY = 0.76 + pressProgress * 0.48;
        barbell.position.set(0, barY, 0.05);

        // Arms following bar
        leftArm.position.set(-0.35, (0.58 + barY) * 0.5, 0.05);
        leftArm.rotation.z = 0.4 - pressProgress * 0.3;
        rightArm.position.set(0.35, (0.58 + barY) * 0.5, 0.05);
        rightArm.rotation.z = -0.4 + pressProgress * 0.3;
      };
    } else if (animationType === 'deadlift') {
      // Model for Deadlift
      const deadliftGuy = new THREE.Group();
      rigRoot.add(deadliftGuy);

      const backMat = highlightMusclesRef.current ? activeMuscleMat : bodyMat;
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.6, 12), backMat);
      deadliftGuy.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), bodyMat);
      head.position.y = 0.44;
      torso.add(head);

      // Floor Barbell
      const barbell = new THREE.Group();
      rigRoot.add(barbell);
      const barRod = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.7, 12), ironMat);
      barRod.rotation.z = Math.PI / 2;
      barbell.add(barRod);

      [-0.72, 0.72].forEach((posX) => {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 24), plateMat);
        plate.rotation.z = Math.PI / 2;
        plate.position.x = posX;
        barbell.add(plate);
      });

      animUpdate = (phase) => {
        const pullProgress = (Math.cos(phase * Math.PI * 2) + 1) * 0.5; // 0 = floor, 1 = standing lockout
        const barY = 0.26 + pullProgress * 0.65;
        barbell.position.set(0, barY, 0.22);

        // Torso hinge
        const hingeAngle = (1 - pullProgress) * 0.9;
        torso.rotation.x = hingeAngle;
        deadliftGuy.position.set(0, 0.8 + pullProgress * 0.3, -hingeAngle * 0.2);
      };
    } else if (animationType === 'pull_up') {
      // Model for Pull Ups
      // Overhead Bar Rig
      const rackPostL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 12), ironMat);
      rackPostL.position.set(-0.8, 1.15, 0);
      rigRoot.add(rackPostL);

      const rackPostR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 12), ironMat);
      rackPostR.position.set(0.8, 1.15, 0);
      rigRoot.add(rackPostR);

      const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8, 12), ironMat);
      topBar.rotation.z = Math.PI / 2;
      topBar.position.set(0, 2.25, 0);
      rigRoot.add(topBar);

      // Hanging Mannequin
      const pullupGuy = new THREE.Group();
      rigRoot.add(pullupGuy);

      const latMat = highlightMusclesRef.current ? activeMuscleMat : bodyMat;
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.56, 12), latMat);
      torso.position.y = 0;
      pullupGuy.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), bodyMat);
      head.position.y = 0.42;
      torso.add(head);

      // Arms hanging
      const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 12), bodyMat);
      leftArm.position.set(-0.35, 0.35, 0);
      pullupGuy.add(leftArm);

      const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 12), bodyMat);
      rightArm.position.set(0.35, 0.35, 0);
      pullupGuy.add(rightArm);

      // Legs slightly bent
      const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.7, 12), bodyMat);
      legs.position.set(0, -0.55, -0.1);
      legs.rotation.x = 0.25;
      pullupGuy.add(legs);

      animUpdate = (phase) => {
        const pullProgress = (Math.cos(phase * Math.PI * 2) + 1) * 0.5; // 0 = dead hang, 1 = chin over bar
        const guyY = 1.35 + pullProgress * 0.55;
        pullupGuy.position.set(0, guyY, 0);

        // Elbows flexing
        leftArm.rotation.z = 0.3 - pullProgress * 0.9;
        rightArm.rotation.z = -0.3 + pullProgress * 0.9;
      };
    } else {
      // Default: Shoulder Press / Bicep Curl
      const defaultGuy = new THREE.Group();
      defaultGuy.position.y = 0.85;
      rigRoot.add(defaultGuy);

      const torsoMat = highlightMusclesRef.current ? activeMuscleMat : bodyMat;
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.6, 12), torsoMat);
      defaultGuy.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), bodyMat);
      head.position.y = 0.46;
      torso.add(head);

      // Barbell overhead
      const barbell = new THREE.Group();
      rigRoot.add(barbell);
      const barRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 12), ironMat);
      barRod.rotation.z = Math.PI / 2;
      barbell.add(barRod);

      [-0.65, 0.65].forEach((posX) => {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24), plateMat);
        plate.rotation.z = Math.PI / 2;
        plate.position.x = posX;
        barbell.add(plate);
      });

      animUpdate = (phase) => {
        const pressProgress = (Math.cos(phase * Math.PI * 2) + 1) * 0.5; // 0 = chin height, 1 = overhead lockout
        const barY = 1.3 + pressProgress * 0.65;
        barbell.position.set(0, barY, 0.02);
      };
    }

    // 8. Drag interaction for 360 rotation
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - previousMousePositionRef.current.x;
      modelRotationRef.current += deltaX * 0.015;
      rigRoot.rotation.y = modelRotationRef.current;
      previousMousePositionRef.current = { x: clientX, y: 'touches' in e ? e.touches[0].clientY : e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let animPhase = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isPlayingRef.current) {
        animPhase = (animPhase + delta * speedRef.current * 0.45) % 1;
      }

      // Smooth camera interpolation towards target
      camera.position.lerp(targetCamPosRef.current, 0.08);
      camera.lookAt(targetCamLookRef.current);

      // Run exercise animation
      animUpdate(animPhase, clock.getElapsedTime());

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [animationType]);

  return (
    <div className={`relative bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl ${className}`}>
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full h-72 sm:h-80 cursor-grab active:cursor-grabbing touch-none relative"
      />

      {/* Muscle Focus Badge on Top Left */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-700/70 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-200">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Focus Primario:</span>
          <span className="text-emerald-400 font-bold">{targetMuscles.join(', ')}</span>
        </div>
      </div>

      {/* View Presets & Muscle Toggle on Top Right */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/70 z-10">
        <button
          onClick={() => setPreset('iso')}
          className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
            cameraPreset === 'iso' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Vista 3D Isometrica"
        >
          3D
        </button>
        <button
          onClick={() => setPreset('front')}
          className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
            cameraPreset === 'front' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Vista Frontale"
        >
          Fronte
        </button>
        <button
          onClick={() => setPreset('side')}
          className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
            cameraPreset === 'side' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Vista Laterale (Controllo postura e schiena)"
        >
          Profilo
        </button>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 z-10">
        {/* Play/Pause & Speed */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center"
            title={isPlaying ? 'Pausa animazione' : 'Riprendi animazione'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* Speed Pill Buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            {[0.5, 1, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  speed === s ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Drag Hint */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Rotate3d className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ruota 360° per analizzare l'angolo</span>
        </div>

        {/* Muscle Glow Toggle */}
        <button
          onClick={() => setHighlightMuscles(!highlightMuscles)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            highlightMuscles
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Muscoli Attivi</span>
        </button>
      </div>
    </div>
  );
};
