import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef } from 'react';

function DriftingCamera({ warping }) {
  const zRef = useRef(5);
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();

    if (warping) {
      zRef.current -= 0.55;
      camera.position.x += (0 - camera.position.x) * 0.1;
      camera.position.y += (0 - camera.position.y) * 0.1;
      camera.position.z = zRef.current;
      camera.fov += (95 - camera.fov) * 0.06;
      camera.updateProjectionMatrix();
    } else {
      zRef.current = 5;
      camera.position.x = Math.sin(t * 0.05) * 4;
      camera.position.y = Math.cos(t * 0.04) * 2;
      camera.position.z = 5;
      camera.fov += (60 - camera.fov) * 0.05;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

function RotatingStars({ warping }) {
  const groupRef = useRef();
  const scaleRef = useRef(1);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (warping ? 0.15 : 0.01);

      // Stretch stars along z-axis during warp to read as motion streaks, not a burst.
      const targetScale = warping ? 3.2 : 1;
      scaleRef.current += (targetScale - scaleRef.current) * 0.08;
      groupRef.current.scale.set(1, 1, scaleRef.current);
    }
  });

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={warping ? 3 : 1} />
      <Stars radius={60} depth={30} count={1500} factor={2} saturation={0} fade speed={warping ? 2 : 0.5} />
    </group>
  );
}

export default function Starfield({ warping = false }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <DriftingCamera warping={warping} />
        <RotatingStars warping={warping} />
      </Canvas>
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-500"
        style={{
          opacity: warping ? 1 : 0,
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(10,5,25,0.85) 100%)',
        }}
      />
    </div>
  );
}
