import { useState } from 'react';

export default function ImageSatellites({ images = [] }) {
  const [lightbox, setLightbox] = useState(null);
  if (!images.length) return null;

  const radii = [150, 190, 230];
  const durations = [16, 22, 28];

  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        {images.map((src, i) => {
          const radius = radii[i % radii.length];
          const duration = durations[i % durations.length];
          const startAngle = (360 / images.length) * i;
          const reverse = i % 2 === 1;
          return (
            <div
              key={src}
              className="absolute top-1/2 left-1/2"
              style={{
                animation: `orbit-rotate ${duration}s linear infinite ${reverse ? 'reverse' : 'normal'}`,
                transform: `rotate(${startAngle}deg)`,
              }}
            >
              <div style={{ transform: `translateX(${radius}px)` }}>
                <div
                  className="pointer-events-auto"
                  style={{
                    animation: `orbit-rotate ${duration}s linear infinite ${reverse ? 'normal' : 'reverse'}`,
                  }}
                >
                  <button
                    onClick={() => setLightbox(src)}
                    className="block rounded-lg overflow-hidden border border-white/20 shadow-lg hover:scale-110 hover:border-white/50 transition-transform -translate-x-1/2 -translate-y-1/2"
                    style={{ width: 56, height: 56 }}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes orbit-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-8"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-2xl max-h-[80vh] rounded-lg border border-white/20 shadow-2xl" />
        </div>
      )}
    </>
  );
}
