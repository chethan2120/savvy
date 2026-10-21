'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import * as THREE from 'three';

/** One full trip around the ring. Constant angular speed, so the loop has no ease-in pause. */
const REVOLUTION = 6;
const RING_RADIUS = 1.28;
const TUBE = 0.16;
const COIN_RADIUS = 0.145;
/** Just outside the tube, so the disc rides the track instead of disappearing inside it. */
const TRACK = RING_RADIUS + TUBE + COIN_RADIUS * 0.55;

const SHIELD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 4 52 12v16c0 12.2-8.2 22.4-20 26C20.2 50.4 12 40.2 12 28V12L32 4Z"/></svg>`;

const BLOCKS = [
  { position: [-0.2, 0.02, -1.55] as const, size: [2.05, 1.25, 0.1] as const, shift: [0.48, 0.1, 0] as const, speed: 0.21, phase: 0.2 },
  { position: [1.55, -1.05, 0.95] as const, size: [0.95, 1.35, 0.09] as const, shift: [0.22, 0.16, 0.08] as const, speed: 0.17, phase: 1.3 },
  { position: [0.2, 1.32, -0.45] as const, size: [1.75, 0.34, 0.08] as const, shift: [0.36, 0.05, 0.08] as const, speed: 0.15, phase: 2.1 },
  { position: [-1.35, -0.7, 0.55] as const, size: [0.72, 0.95, 0.08] as const, shift: [0.14, 0.2, 0.06] as const, speed: 0.19, phase: 0.7 },
];

function makeShield() {
  const parsed = new SVGLoader().parse(SHIELD_SVG);
  const shapes = SVGLoader.createShapes(parsed.paths[0]);
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 2.2,
    bevelEnabled: true,
    bevelThickness: 0.6,
    bevelSize: 0.45,
    bevelSegments: 1,
    curveSegments: 8,
  });
  geo.computeBoundingBox();
  geo.center();
  const width = geo.boundingBox ? geo.boundingBox.max.x - geo.boundingBox.min.x : 40;
  return { geo, scale: (COIN_RADIUS * 0.92) / width };
}

function makeCoin() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, COIN_RADIUS, 0, Math.PI * 2, false);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.042,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.014,
    bevelSegments: 2,
    curveSegments: 40,
  });
  geo.center();
  return geo;
}

interface RigProps {
  animate: boolean;
  /** Fixed time used for the reduced-motion still. Null while the scene is allowed to run. */
  pose: number | null;
  quality: 'high' | 'low';
  angleRef: React.RefObject<HTMLElement | null>;
}

const Rig: React.FC<RigProps> = ({ animate, pose, quality, angleRef }) => {
  const carrier = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);
  const blocks = useRef<Array<THREE.Group | null>>([]);
  const pinned = useRef<number | null>(pose);
  const high = quality === 'high';

  const coinGeo = useMemo(() => makeCoin(), []);
  const shield = useMemo(() => makeShield(), []);
  const gold = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#e6c15a'),
        metalness: 0.82,
        roughness: 0.32,
        clearcoat: 0.55,
        clearcoatRoughness: 0.28,
        envMapIntensity: 1.45,
      }),
    []
  );
  const ceramic = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#f7f5f0'),
        metalness: 0.02,
        roughness: 0.46,
        clearcoat: 0.18,
        clearcoatRoughness: 0.55,
      }),
    []
  );
  const glow = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#e7f6ec'),
        emissive: new THREE.Color('#8fbfa4'),
        emissiveIntensity: 0.45,
        roughness: 0.72,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    return () => {
      coinGeo.dispose();
      shield.geo.dispose();
      gold.dispose();
      ceramic.dispose();
      glow.dispose();
    };
  }, [ceramic, coinGeo, glow, gold, shield.geo]);

  useFrame((state) => {
    if (animate) pinned.current = null;
    else if (pinned.current == null) pinned.current = state.clock.elapsedTime;
    const t = pinned.current ?? state.clock.getElapsedTime();
    // Constant angular speed. sin/cos are continuous at 0 and 2π, so the loop never jumps.
    const theta = (t / REVOLUTION) * Math.PI * 2;
    const sway = animate ? 1 : 0;

    if (carrier.current) {
      carrier.current.position.set(Math.cos(theta) * TRACK, Math.sin(theta) * TRACK, 0);
    }
    if (spinner.current) {
      spinner.current.rotation.z = t * 0.85;
    }
    blocks.current.forEach((node, index) => {
      const block = BLOCKS[index];
      if (!node || !block) return;
      const wave = sway ? Math.sin(t * block.speed * Math.PI * 2 + block.phase) : 0;
      node.position.set(
        block.position[0] + wave * block.shift[0],
        block.position[1] + Math.cos(t * block.speed * Math.PI * 2 + block.phase) * block.shift[1] * sway,
        block.position[2] + wave * block.shift[2]
      );
    });

    const node = angleRef.current;
    if (node) {
      node.dataset.angle = (((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)).toFixed(3);
      node.dataset.x = carrier.current ? carrier.current.position.x.toFixed(3) : '';
      node.dataset.y = carrier.current ? carrier.current.position.y.toFixed(3) : '';
      node.dataset.spin = ((t * 0.85) % (Math.PI * 2)).toFixed(3);
    }
  });

  const tubeSeg = high ? 28 : 16;
  const radialSeg = high ? 96 : 56;

  return (
    <>
      <hemisphereLight args={['#f6f4ee', '#d7ebdf', 0.72]} />
      <directionalLight position={[4.2, 5.4, 3.2]} intensity={1.85} color="#fffaf3" />
      <directionalLight position={[-3.4, 1.2, -2]} intensity={0.45} color="#e7f4ec" />
      <pointLight position={[1.6, -1.1, 1.8]} intensity={high ? 3.2 : 1.6} distance={7} color="#c6e6d2" />

      <Environment resolution={high ? 128 : 64} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[0, 3.2, 2]} scale={[7, 4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.4} position={[-3.2, 0.4, 1]} scale={[3, 3, 1]} color="#d9f0e2" />
        <Lightformer form="rect" intensity={1.6} position={[3, -0.6, 2]} scale={[3, 2.4, 1]} color="#f3efe4" />
      </Environment>

      {BLOCKS.map((block, index) => (
        <group
          key={block.phase}
          ref={(node) => {
            blocks.current[index] = node;
          }}
          position={block.position}
        >
          <RoundedBox
            args={[block.size[0] * 1.035, block.size[1] * 1.04, block.size[2] * 1.2]}
            radius={0.06}
            smoothness={2}
            material={glow}
          />
          <RoundedBox args={[block.size[0], block.size[1], block.size[2]]} radius={0.05} smoothness={high ? 3 : 2} material={ceramic} />
        </group>
      ))}

      <group rotation={[1.08, 0.22, -0.4]}>
        <mesh material={ceramic}>
          <torusGeometry args={[RING_RADIUS, TUBE, tubeSeg, radialSeg]} />
        </mesh>
        <mesh>
          <torusGeometry args={[RING_RADIUS + TUBE * 0.2, 0.01, 8, high ? 80 : 48]} />
          <meshStandardMaterial color="#e5f5eb" emissive="#7eaf96" emissiveIntensity={0.32} roughness={0.8} />
        </mesh>
        {/* Child of the tilted ring, so this circle is the ring's circumference. */}
        <group ref={carrier}>
          <group ref={spinner}>
            <mesh geometry={coinGeo} material={gold} />
            <mesh
              geometry={shield.geo}
              material={gold}
              position={[0, 0, 0.03]}
              scale={[shield.scale, -shield.scale, shield.scale * 0.35]}
            />
            <mesh
              geometry={shield.geo}
              material={gold}
              position={[0, 0, -0.03]}
              rotation={[0, Math.PI, 0]}
              scale={[shield.scale, -shield.scale, shield.scale * 0.35]}
            />
          </group>
        </group>
      </group>
    </>
  );
};

export const CoinScene: React.FC<RigProps> = (props) => {
  const high = props.quality === 'high';
  return (
    <Canvas
      dpr={high ? [1, 1.5] : [1, 1.15]}
      camera={{ position: [0.05, 0.42, high ? 7.15 : 8.5], fov: high ? 32 : 30, near: 0.1, far: 30 }}
      gl={{
        antialias: high,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      frameloop={props.animate ? 'always' : 'demand'}
      style={{ width: '100%', height: '100%', maxWidth: 'none', pointerEvents: 'none', display: 'block' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#f6f4ee', 0);
      }}
    >
      <Rig {...props} />
    </Canvas>
  );
};
