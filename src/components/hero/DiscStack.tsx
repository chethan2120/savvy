'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

const DISC_COUNT = 13;

/* --- Orbit cycle -----------------------------------------------------------
 * One loop: the discs sit stacked at home, the lead disc pulls away along a
 * circular path travelling anticlockwise, each disc behind it departs a beat
 * later and follows the same track, all of them complete one full revolution,
 * then they close back up into the stack at the point they started and hold
 * briefly before the next loop.
 * ------------------------------------------------------------------------ */

/** Seconds for one complete departure-orbit-restack loop. */
const CYCLE = 9;
/** Fraction of the cycle a single disc spends travelling its 360. */
const TRAVEL = 0.55;
/** Fraction of the cycle each disc waits after the one ahead of it leaves. */
const LAG = 0.03;
/** Radius of the orbit path, in disc radii — sized to sweep the whole hero. */
const ORBIT_RADIUS = 3.2;
/** Discs start and re-stack at the top of the ring (12 o'clock). */
const START_ANGLE = Math.PI / 2;
/** Spacing kept between discs along their own axis, so home reads as a roll. */
const STACK_GAP = 0.26;

/** Brand-tinted metal ramp: forest -> industrial blue -> warm steel. */
const RAMP = ['#00543d', '#0a6a4f', '#1c6f74', '#345b76', '#4d6f88', '#7c8fa1', '#b0a894', '#e7a06e'];

function discColor(i: number) {
  const t = i / (DISC_COUNT - 1);
  const scaled = t * (RAMP.length - 1);
  const lo = Math.floor(scaled);
  const hi = Math.min(RAMP.length - 1, lo + 1);
  return new THREE.Color(RAMP[lo]).lerp(new THREE.Color(RAMP[hi]), scaled - lo);
}

interface StackProps {
  /** 0 = tight stack, 1 = fully fanned out. Driven by scroll. */
  progressRef: React.MutableRefObject<number>;
}

const Stack: React.FC<StackProps> = ({ progressRef }) => {
  const group = useRef<THREE.Group>(null);
  const discs = useRef<THREE.Mesh[]>([]);

  const geometry = useMemo(() => new THREE.CylinderGeometry(1, 1, 0.09, 128, 1, false), []);
  const materials = useMemo(
    () =>
      Array.from({ length: DISC_COUNT }, (_, i) =>
        new THREE.MeshPhysicalMaterial({
          color: discColor(i),
          metalness: 0.15,
          roughness: 0.46,
          clearcoat: 0.65,
          clearcoatRoughness: 0.35,
          envMapIntensity: 1.1,
          sheen: 0.5,
          sheenColor: new THREE.Color('#ffd9b8'),
        })
      ),
    []
  );

  React.useEffect(() => {
    return () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    };
  }, [geometry, materials]);

  useFrame((state, delta) => {
    const p = progressRef.current;
    const t = state.clock.elapsedTime;

    discs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const centred = i - (DISC_COUNT - 1) / 2;

      // This disc leaves LAG later than the one ahead of it, then covers its
      // own full revolution at the same speed as every other disc. Clamping at
      // both ends is what makes it wait in the stack before departing and hold
      // there again once it lands.
      const u = (t % CYCLE) / CYCLE;
      const own = THREE.MathUtils.clamp((u - i * LAG) / TRAVEL, 0, 1);

      // Smoothstep so discs ease out of the stack and settle back into it
      // rather than snapping to orbit speed.
      const eased = own * own * (3 - 2 * own);
      // Anticlockwise, one full turn, departing from and returning to the top.
      const theta = START_ANGLE + eased * Math.PI * 2;

      // Travel around the ring. The radius opens up as the page scrolls.
      const radius = ORBIT_RADIUS * THREE.MathUtils.lerp(1, 1.35, p);
      const px = Math.cos(theta) * radius;
      const py = Math.sin(theta) * radius;

      // The disc's own axis stays tangent to the path, so it rolls along the
      // track like a coin — presenting its face on one side of the ring and its
      // edge on the other.
      mesh.rotation.set(0, 0, theta);

      // Residual offset along that tangent keeps the discs a tidy roll while
      // they are bunched together at home instead of intersecting.
      const gap = STACK_GAP * THREE.MathUtils.lerp(1, 1.3, p);
      mesh.position.set(px - Math.sin(theta) * centred * gap, py + Math.cos(theta) * centred * gap, 0);
      mesh.scale.setScalar(1);
    });

    if (group.current) {
      // Centred, so the ring sweeps the full width of the hero. The scrim
      // layer behind the copy is what keeps the headline readable.
      const narrow = state.size.width < 768;
      group.current.scale.setScalar(narrow ? 0.62 : 1);
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 0, 0.08);

      // The orbit plane itself is fixed — tilted 45 degrees away from the
      // camera so the ring reads as an ellipse in depth. Nothing rotates at the
      // group level; every bit of movement belongs to the discs.
      group.current.rotation.x = -Math.PI / 4;
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -0.22 + p * 0.34, 0.05);

      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -p * 1.2, 0.05);
    }
  });

  return (
    // Drift only — rotation is driven entirely by the precession above.
    <Float speed={1.1} rotationIntensity={0} floatIntensity={0.35}>
      {/* Offset right of centre so the stack frames the headline instead of covering it. */}
      <group ref={group} position={[0.9, 0, 0]} rotation={[0.18, 0, -0.22]}>
        {Array.from({ length: DISC_COUNT }, (_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) discs.current[i] = el;
            }}
            geometry={geometry}
            material={materials[i]}
            castShadow={false}
          />
        ))}
      </group>
    </Float>
  );
};

export const DiscStack: React.FC<StackProps> = ({ progressRef }) => {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.3, 9.2], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} color="#ffffff" />
      <directionalLight position={[-5, -2, -3]} intensity={1.2} color="#abcbf9" />
      <pointLight position={[0, -3, 4]} intensity={12} distance={14} color="#e7a06e" />
      {/* Hand-built studio environment — no CDN HDRI fetch. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -2]} scale={[10, 6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.4} position={[-5, 1, 1]} scale={[6, 8, 1]} color="#abcbf9" />
        <Lightformer form="rect" intensity={2.8} position={[5, -1, 2]} scale={[6, 8, 1]} color="#e7a06e" />
        <Lightformer form="ring" intensity={3} position={[0, -4, 3]} scale={5} color="#00543d" />
      </Environment>
      <Stack progressRef={progressRef} />
    </Canvas>
  );
};

export default DiscStack;
