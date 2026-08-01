import { lazy, Suspense } from 'react';

const Scene3D = lazy(() => import('./index'));

export default function Scene3DLazy(props) {
  return (
    <Suspense fallback={null}>
      <Scene3D {...props} />
    </Suspense>
  );
}
