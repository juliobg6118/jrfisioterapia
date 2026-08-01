import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Torus, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Animated DNA-like helix ─── */
function HelixSpheres({ count = 40, radius = 1.8, height = 6 }) {
  const groupRef = useRef();

  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 4;
      const y = (t - 0.5) * height;
      arr.push(
        { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, side: 0 },
        { x: Math.cos(angle + Math.PI) * radius, y, z: Math.sin(angle + Math.PI) * radius, side: 1 },
      );
    }
    return arr;
  }, [count, radius, height]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {positions.map((p, i) => (
        <Float key={i} speed={1.5 + (i % 3)} rotationIntensity={0.3} floatIntensity={0.4}>
          <mesh position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <MeshDistortMaterial
              color={p.side === 0 ? '#14b8a6' : '#0ea5e9'}
              speed={2}
              distort={0.2}
              roughness={0.3}
              metalness={0.6}
            />
          </mesh>
        </Float>
      ))}
      {/* Connecting rungs */}
      {positions.filter((_, i) => i % 2 === 0).map((p, i) => {
        const counterpart = positions[i * 2 + 1];
        if (!counterpart) return null;
        const mid = [(p.x + counterpart.x) / 2, p.y, (p.z + counterpart.z) / 2];
        const dx = counterpart.x - p.x;
        const dz = counterpart.z - p.z;
        const len = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx);
        return (
          <mesh key={`rung-${i}`} position={mid} rotation={[0, -angle, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, len, 8]} />
            <meshStandardMaterial color="#5eead4" transparent opacity={0.4} metalness={0.3} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─── Floating ring ─── */
function FloatingRing({ position, color, scale = 1 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.3;
      ref.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Torus ref={ref} position={position} args={[0.8 * scale, 0.08 * scale, 16, 64]}>
      <MeshWobbleMaterial
        color={color}
        speed={1.5}
        factor={0.3}
        metalness={0.7}
        roughness={0.2}
        transparent
        opacity={0.7}
      />
    </Torus>
  );
}

/* ─── Floating orb ─── */
function FloatingOrb({ position, color, size = 0.5 }) {
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
      <Sphere position={position} args={[size, 32, 32]}>
        <MeshDistortMaterial
          color={color}
          speed={3}
          distort={0.4}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.6}
        />
      </Sphere>
    </Float>
  );
}

/* ─── Rounded box ─── */
function FloatingBox({ position, color, size = 0.4 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.4;
      ref.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.6}>
      <RoundedBox ref={ref} position={position} args={[size, size, size]} radius={0.08} smoothness={4}>
        <MeshWobbleMaterial
          color={color}
          speed={2}
          factor={0.15}
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={0.5}
        />
      </RoundedBox>
    </Float>
  );
}

/* ─── Particles ─── */
function Particles({ count = 80 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#5eead4"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Main scene ─── */
function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, 3, -3]} intensity={0.6} color="#14b8a6" />
      <pointLight position={[3, -2, 3]} intensity={0.4} color="#0ea5e9" />

      {/* DNA helix centerpiece */}
      <HelixSpheres count={30} radius={1.5} height={5} />

      {/* Floating decorative elements */}
      <FloatingRing position={[-3, 1.5, -1]} color="#14b8a6" scale={0.7} />
      <FloatingRing position={[3.2, -1, 0.5]} color="#0ea5e9" scale={0.5} />
      <FloatingOrb position={[-2.5, -2, 1]} color="#0ea5e9" size={0.35} />
      <FloatingOrb position={[2.8, 2, -1.5]} color="#14b8a6" size={0.45} />
      <FloatingOrb position={[0, 3.5, 0.5]} color="#5eead4" size={0.25} />
      <FloatingBox position={[-2, 2.5, -2]} color="#14b8a6" size={0.35} />
      <FloatingBox position={[3, -2.5, -1]} color="#0ea5e9" size={0.3} />

      {/* Background particles */}
      <Particles count={100} />
    </>
  );
}

/* ─── Exported component ─── */
export default function Scene3D({ className = '' }) {
  return (
    <div className={`h-full w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
