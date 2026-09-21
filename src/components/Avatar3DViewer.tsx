import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AttendanceStatus } from '../types';
import confetti from 'canvas-confetti';
import { Sparkles, Eye, RotateCw } from 'lucide-react';

interface Avatar3DViewerProps {
  status: AttendanceStatus;
  avatarColor?: string;
  headbandColor?: string;
  memberName?: string;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar3DViewer: React.FC<Avatar3DViewerProps> = ({
  status,
  avatarColor = '#10b981',
  headbandColor = '#ef4444',
  memberName = 'Il Tuo Avatar',
  interactive = true,
  size = 'md',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<AttendanceStatus>(status);
  const isInteractingRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationRef = useRef<number>(0);
  const targetRotationRef = useRef<number>(0);
  const [reactionText, setReactionText] = useState<string>('');

  // Keep ref up to date for animation loop
  useEffect(() => {
    statusRef.current = status;
    if (status === 'present') {
      triggerSmallConfetti();
    }
  }, [status]);

  const triggerSmallConfetti = () => {
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        disableForReducedMotion: true,
      });
    } catch {
      // safe fallback
    }
  };

  const handlePoke = () => {
    if (status === 'present') {
      const messages = ['Carico a molla! 🔥', 'Oggi non si scherza! 💪', 'Andiamo a conquistare la ghisa! 🦁', '100% Presenza!'];
      setReactionText(messages[Math.floor(Math.random() * messages.length)]);
      triggerSmallConfetti();
    } else if (status === 'maybe') {
      const messages = ['Deciditi Bro! 🤔', 'Dai che ti aspettiamo!', 'Basta un\'ora sola!', 'Ti passiamo a prendere?'];
      setReactionText(messages[Math.floor(Math.random() * messages.length)]);
    } else {
      const messages = ['Offri tu il frullato proteico! 🥤', 'Ti faremo fare 50 burpees di penitenza! 💀', 'Il divano chiama eh?', 'Ti aspettiamo la prossima volta! 🥺'];
      setReactionText(messages[Math.floor(Math.random() * messages.length)]);
    }
    setTimeout(() => setReactionText(''), 2500);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.3, 3.8);
    camera.lookAt(0, 0.9, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xf59e0b, 0.8, 10);
    fillLight.position.set(0, -0.5, 2);
    scene.add(fillLight);

    // 5. Floor shadow disc (Pedana fitness)
    const floorGeo = new THREE.CylinderGeometry(1.2, 1.25, 0.08, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.04;
    floor.receiveShadow = true;
    scene.add(floor);

    // Golden accent ring on floor
    const ringGeo = new THREE.TorusGeometry(1.18, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.y = 0.005;
    scene.add(floorRing);

    // 6. Character Rig Hierarchy
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffdfba,
      roughness: 0.5,
      metalness: 0.05,
    });

    const tankMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(avatarColor),
      roughness: 0.4,
      metalness: 0.1,
    });

    const shortsMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e2f,
      roughness: 0.6,
    });

    const headbandMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(headbandColor),
      roughness: 0.3,
    });

    const dumbbellMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.2,
      metalness: 0.8,
    });

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // === Torso ===
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.8;
    characterGroup.add(torsoGroup);

    // Chest & Abs (Athletic wedge)
    const chestGeo = new THREE.CylinderGeometry(0.36, 0.28, 0.52, 16);
    const chest = new THREE.Mesh(chestGeo, tankMat);
    chest.castShadow = true;
    chest.receiveShadow = true;
    torsoGroup.add(chest);

    // Tank top squad badge / star
    const badgeGeo = new THREE.CircleGeometry(0.09, 16);
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0, 0.08, 0.33);
    torsoGroup.add(badge);

    // === Head Group ===
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.5, 0);
    torsoGroup.add(headGroup);

    // Head base (cute rounded cartoon sphere)
    const headGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Headband
    const headbandGeo = new THREE.TorusGeometry(0.31, 0.05, 12, 32);
    const headband = new THREE.Mesh(headbandGeo, headbandMat);
    headband.rotation.x = Math.PI / 2;
    headband.position.y = 0.12;
    headGroup.add(headband);

    // Headband knot
    const knotGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const knot = new THREE.Mesh(knotGeo, headbandMat);
    knot.position.set(0.28, 0.12, -0.15);
    headGroup.add(knot);

    // Hair top
    const hairGeo = new THREE.SphereGeometry(0.31, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x271911, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.08;
    headGroup.add(hair);

    // Left Eye White & Pupil
    const eyeWhiteGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeWhite.position.set(-0.11, 0.02, 0.28);
    leftEyeWhite.scale.set(1, 1.1, 0.5);
    headGroup.add(leftEyeWhite);

    const pupilGeo = new THREE.SphereGeometry(0.04, 10, 10);
    const leftPupil = new THREE.Mesh(pupilGeo, eyeMat);
    leftPupil.position.set(-0.11, 0.02, 0.32);
    headGroup.add(leftPupil);

    // Right Eye White & Pupil
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEyeWhite.position.set(0.11, 0.02, 0.28);
    rightEyeWhite.scale.set(1, 1.1, 0.5);
    headGroup.add(rightEyeWhite);

    const rightPupil = new THREE.Mesh(pupilGeo, eyeMat);
    rightPupil.position.set(0.11, 0.02, 0.32);
    headGroup.add(rightPupil);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.09, 0.025, 0.03);
    const browMat = new THREE.MeshBasicMaterial({ color: 0x1e1e24 });
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.11, 0.12, 0.31);
    leftBrow.rotation.z = -0.05;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.11, 0.12, 0.31);
    rightBrow.rotation.z = 0.05;
    headGroup.add(rightBrow);

    // Cute Mouth (Torus arc)
    const mouthGeo = new THREE.TorusGeometry(0.07, 0.02, 8, 16, Math.PI * 0.9);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.14, 0.28);
    mouth.rotation.z = Math.PI;
    headGroup.add(mouth);

    // Sweating droplet (active when skipping or tired)
    const sweatGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const sweatMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0 });
    const sweatDrop = new THREE.Mesh(sweatGeo, sweatMat);
    sweatDrop.position.set(0.3, 0.22, 0.2);
    headGroup.add(sweatDrop);

    // === Arms & Dumbbells ===
    // Left Arm Pivot
    const leftShoulderGroup = new THREE.Group();
    leftShoulderGroup.position.set(-0.42, 0.18, 0);
    torsoGroup.add(leftShoulderGroup);

    const armGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.38, 12);
    const leftArm = new THREE.Mesh(armGeo, skinMat);
    leftArm.position.y = -0.19;
    leftShoulderGroup.add(leftArm);

    // Left Forearm + Dumbbell
    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), skinMat);
    leftHand.position.y = -0.38;
    leftShoulderGroup.add(leftHand);

    // Dumbbell Left
    const dumbbellLeft = new THREE.Group();
    leftHand.add(dumbbellLeft);
    const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.24, 8);
    const barMeshL = new THREE.Mesh(barGeo, dumbbellMat);
    barMeshL.rotation.z = Math.PI / 2;
    dumbbellLeft.add(barMeshL);

    const plateGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 12);
    const plateL1 = new THREE.Mesh(plateGeo, dumbbellMat);
    plateL1.rotation.z = Math.PI / 2;
    plateL1.position.x = -0.1;
    dumbbellLeft.add(plateL1);
    const plateL2 = new THREE.Mesh(plateGeo, dumbbellMat);
    plateL2.rotation.z = Math.PI / 2;
    plateL2.position.x = 0.1;
    dumbbellLeft.add(plateL2);

    // Right Arm Pivot
    const rightShoulderGroup = new THREE.Group();
    rightShoulderGroup.position.set(0.42, 0.18, 0);
    torsoGroup.add(rightShoulderGroup);

    const rightArm = new THREE.Mesh(armGeo, skinMat);
    rightArm.position.y = -0.19;
    rightShoulderGroup.add(rightArm);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), skinMat);
    rightHand.position.y = -0.38;
    rightShoulderGroup.add(rightHand);

    // Dumbbell Right
    const dumbbellRight = new THREE.Group();
    rightHand.add(dumbbellRight);
    const barMeshR = new THREE.Mesh(barGeo, dumbbellMat);
    barMeshR.rotation.z = Math.PI / 2;
    dumbbellRight.add(barMeshR);

    const plateR1 = new THREE.Mesh(plateGeo, dumbbellMat);
    plateR1.rotation.z = Math.PI / 2;
    plateR1.position.x = -0.1;
    dumbbellRight.add(plateR1);
    const plateR2 = new THREE.Mesh(plateGeo, dumbbellMat);
    plateR2.rotation.z = Math.PI / 2;
    plateR2.position.x = 0.1;
    dumbbellRight.add(plateR2);

    // === Hips & Shorts ===
    const hipsGeo = new THREE.CylinderGeometry(0.29, 0.26, 0.24, 16);
    const hips = new THREE.Mesh(hipsGeo, shortsMat);
    hips.position.y = -0.32;
    torsoGroup.add(hips);

    // === Legs & Shoes ===
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.38, 12);
    const leftLeg = new THREE.Mesh(legGeo, skinMat);
    leftLeg.position.set(-0.15, 0.28, 0);
    characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, skinMat);
    rightLeg.position.set(0.15, 0.28, 0);
    characterGroup.add(rightLeg);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.15, 0.1, 0.25);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.15, 0.05, 0.04);
    characterGroup.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.15, 0.05, 0.04);
    characterGroup.add(rightShoe);

    // 7. Drag rotation handling
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isInteractingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pointerStartRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isInteractingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - pointerStartRef.current.x;
      targetRotationRef.current += deltaX * 0.015;
      pointerStartRef.current.x = clientX;
    };

    const onPointerUp = () => {
      isInteractingRef.current = false;
    };

    if (interactive) {
      container.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      container.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);
    }

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentStatus = statusRef.current;

      // Smooth camera/character rotation damping
      rotationRef.current += (targetRotationRef.current - rotationRef.current) * 0.1;
      characterGroup.rotation.y = rotationRef.current;

      // Dynamic Reactions based on status:
      if (currentStatus === 'present') {
        // High-energy celebration & bicep curls/jumping
        const bounce = Math.sin(elapsedTime * 6) * 0.06;
        characterGroup.position.y = bounce;

        // Smile & active eyebrows
        mouth.rotation.z = Math.PI; // Upward happy curve
        mouth.position.y = -0.13;
        leftBrow.rotation.z = -0.15;
        rightBrow.rotation.z = 0.15;
        headGroup.rotation.z = Math.sin(elapsedTime * 3) * 0.05;
        headGroup.rotation.x = -0.05;

        // Pumping arms up and down with dumbbells!
        const armFlex = (Math.sin(elapsedTime * 6) + 1) * 0.5; // 0 to 1
        leftShoulderGroup.rotation.z = -0.5 - armFlex * 0.8;
        leftShoulderGroup.rotation.x = Math.PI * 0.7 + Math.sin(elapsedTime * 6) * 0.3;

        rightShoulderGroup.rotation.z = 0.5 + armFlex * 0.8;
        rightShoulderGroup.rotation.x = Math.PI * 0.7 + Math.sin(elapsedTime * 6) * 0.3;

        sweatMat.opacity = 0;
        floorRing.material.color.setHex(0x10b981);
      } else if (currentStatus === 'maybe') {
        // Thinking / Scratching head animation
        characterGroup.position.y = 0;
        const sway = Math.sin(elapsedTime * 2) * 0.1;
        headGroup.rotation.z = 0.18 + sway;
        headGroup.rotation.y = Math.sin(elapsedTime * 1.5) * 0.2;

        // Right arm scratching back of head
        rightShoulderGroup.rotation.z = 1.6;
        rightShoulderGroup.rotation.x = Math.PI * 0.75 + Math.sin(elapsedTime * 4) * 0.25;

        // Left arm relaxing
        leftShoulderGroup.rotation.z = -0.15;
        leftShoulderGroup.rotation.x = Math.sin(elapsedTime * 2) * 0.1;

        // Curious expression
        mouth.rotation.z = Math.PI * 0.8;
        leftBrow.rotation.z = 0.25; // Raised eyebrow
        rightBrow.rotation.z = -0.05;

        sweatMat.opacity = 0;
        floorRing.material.color.setHex(0xf59e0b);
      } else {
        // Skipping / Lazy couch potato droop
        const slowBreathing = Math.sin(elapsedTime * 1.8) * 0.02;
        characterGroup.position.y = -0.06 + slowBreathing;

        // Drooping head & slouching
        torsoGroup.rotation.x = 0.25;
        headGroup.rotation.x = 0.3;
        headGroup.rotation.z = Math.sin(elapsedTime * 1.2) * 0.05;

        // Arms hanging limply down
        leftShoulderGroup.rotation.z = -0.05;
        leftShoulderGroup.rotation.x = 0.1;
        rightShoulderGroup.rotation.z = 0.05;
        rightShoulderGroup.rotation.x = 0.1;

        // Sad/frown mouth
        mouth.rotation.z = 0; // Downward sad curve
        mouth.position.y = -0.15;
        leftBrow.rotation.z = 0.2;
        rightBrow.rotation.z = -0.2;

        // Sweat drop appearing
        sweatMat.opacity = 0.8 + Math.sin(elapsedTime * 3) * 0.2;
        sweatDrop.position.y = 0.22 - (elapsedTime % 1.5) * 0.08;

        floorRing.material.color.setHex(0xef4444);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (interactive) {
        container.removeEventListener('mousedown', onPointerDown);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        container.removeEventListener('touchstart', onPointerDown);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [avatarColor, headbandColor, interactive]);

  // Size classes
  const sizeClasses = {
    sm: 'h-44 w-44',
    md: 'h-64 w-full max-w-[320px]',
    lg: 'h-80 md:h-96 w-full',
  }[size];

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* 3D Canvas Mount Container */}
      <div
        ref={containerRef}
        onClick={handlePoke}
        className={`${sizeClasses} cursor-grab active:cursor-grabbing relative touch-none transition-transform hover:scale-[1.02]`}
        title="Tocca o trascina l'avatar per interagire!"
      />

      {/* Floating Reaction Bubble */}
      {reactionText && (
        <div className="absolute top-3 bg-slate-900/95 border border-amber-400 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce pointer-events-none z-20 flex items-center gap-1.5 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{reactionText}</span>
        </div>
      )}

      {/* Interactive Helper Hint */}
      {interactive && (
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <RotateCw className="w-3 h-3 text-slate-500 animate-spin-slow" />
            Trascina per ruotare 360°
          </span>
          <span>•</span>
          <button
            onClick={handlePoke}
            className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline underline-offset-2"
          >
            Tocca per interagire
          </button>
        </div>
      )}
    </div>
  );
};
