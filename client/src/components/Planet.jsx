import { useEffect, useState } from 'react';
import axios from 'axios';
import ImageSatellites from './ImageSatellites.jsx';
import ConnectionLines from './ConnectionLines.jsx';

const FALLBACK = {
  title: 'No results',
  tagline: "We couldn't find a Wikipedia article matching that search. Try a different spelling or a more specific term.",
  color: '#495057',
  related: [],
  images: [],
};

export default function Planet({ topicKey, onTravel, onBack }) {
  const [topic, setTopic] = useState(null);
  const [relatedTopics, setRelatedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setShowVideo(false);

    axios.get(`http://localhost:5000/api/topics/${topicKey}`)
      .then(async (res) => {
        if (cancelled) return;
        const t = res.data;
        setTopic(t);

        const relPromises = (t.related || []).map((slug) =>
          axios.get(`http://localhost:5000/api/topics/${slug}`)
            .then((r) => ({ slug, title: r.data.title }))
            .catch(() => ({ slug, title: slug }))
        );
        const rel = await Promise.all(relPromises);
        if (!cancelled) setRelatedTopics(rel);
      })
      .catch(() => {
        if (!cancelled) setTopic(FALLBACK);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [topicKey]);

  if (loading || !topic) {
    return (
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <p className="text-sm text-gray-500 tracking-widest animate-pulse">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 animate-[fadeIn_0.6s_ease-out]">
      <ConnectionLines count={relatedTopics.length} color={topic.color} />

      <div className="relative w-56 h-56 mb-6 flex items-center justify-center">
        <ImageSatellites images={topic.images || []} />

        <div
          className="absolute inset-0 rounded-full border border-white/10"
          style={{ transform: 'rotateX(70deg)' }}
        />
        <div
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: '#fff',
            boxShadow: '0 0 8px 2px rgba(255,255,255,0.8)',
            animation: 'orbit 6s linear infinite',
          }}
        />
        <button
          onClick={() => topic.videoUrl && setShowVideo(true)}
          className="w-32 h-32 rounded-full relative animate-[spin_30s_linear_infinite]"
          style={{
            background: `radial-gradient(circle at 32% 28%, ${topic.color}dd, ${topic.color}55 45%, #05050a 80%)`,
            boxShadow: `0 0 70px ${topic.color}66, inset -14px -10px 30px rgba(0,0,0,0.6), inset 8px 6px 20px rgba(255,255,255,0.08)`,
            cursor: topic.videoUrl ? 'pointer' : 'default',
          }}
          title={topic.videoUrl ? 'Play video' : undefined}
        />
        <div
          className="absolute w-36 h-36 rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 40px 6px ${topic.color}33` }}
        />
        {topic.videoUrl && (
          <div className="absolute bottom-0 text-[10px] text-gray-500 tracking-wide pointer-events-none">
            click planet to play video
          </div>
        )}
      </div>

      <h1 className="text-2xl font-semibold mb-3 tracking-wide">{topic.title}</h1>
      <p className="text-sm text-gray-400 max-w-md text-center mb-8">{topic.tagline}</p>

      {relatedTopics.length > 0 && (
        <>
          <p className="text-xs text-gray-500 tracking-widest mb-3">CONNECTED PLANETS</p>
          <div className="flex flex-wrap gap-3 justify-center max-w-lg mb-10">
            {relatedTopics.map((r) => (
              <button
                key={r.slug}
                onClick={() => onTravel(r.slug)}
                className="px-4 py-2 text-xs rounded-full bg-white/5 border border-white/20 text-gray-200 hover:bg-white/10 hover:border-white/40 transition-colors"
              >
                {r.title}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        onClick={onBack}
        className="text-xs text-gray-500 border border-white/10 rounded-lg px-4 py-2 hover:text-gray-300 hover:border-white/30 transition-colors"
      >
        New search
      </button>

      {showVideo && topic.videoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
          onClick={() => setShowVideo(false)}
        >
          <div className="w-full max-w-2xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={topic.videoUrl}
              className="w-full h-full rounded-lg border border-white/20"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Topic video"
            />
          </div>
        </div>
      )}
    </div>
  );
}
