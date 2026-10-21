'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SecureVideoPlayer } from '@/components/SecureVideoPlayer';
import type { CourseMaterial } from '@/lib/types';
import { friendlyError } from '@/lib/friendly-error';
import { classifyVideoSource } from '@/lib/video-source';
import { Loader2, PlayCircle, AlertCircle, RotateCw } from 'lucide-react';

/**
 * Resolve the playable/openable source for a material.
 *
 * A material either points at an external URL (content) or at a file in the
 * private "course-materials" bucket. Bucket files need a short-lived signed
 * URL, which Supabase issues only when RLS agrees the viewer may see the
 * material — so the same visibility rule covers the file automatically.
 */
export async function resolveMaterialUrl(
  material: CourseMaterial,
): Promise<{ url: string } | { error: string }> {
  if (material.storage_path) {
    const { data, error } = await supabase.storage
      .from('course-materials')
      .createSignedUrl(material.storage_path, 900);
    if (error || !data?.signedUrl) {
      // Fall back to an external URL if the row carries one, so a material with
      // both a stored file and a link is not lost when the file goes missing.
      if (material.content) return { url: material.content };
      return { error: friendlyError(error, 'lesson file') };
    }
    return { url: data.signedUrl };
  }
  if (material.content) return { url: material.content };
  return {
    error: 'This lesson has no video attached yet. Please tell the institute office which lesson this is.',
  };
}

/** Video card with an in-place preview. Used by both the admin and the portal. */
export const VideoPreview: React.FC<{ material: CourseMaterial; watermark: string; trackStudy?: boolean }> = ({
  material, watermark, trackStudy = false,
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const result = await resolveMaterialUrl(material);
    setLoading(false);
    if ('error' in result) setError(result.error);
    else setUrl(result.url);
  };

  // A signed URL lives 15 minutes. When one expires mid-session the <video>
  // element fails silently — it just shows a black frame — so the player
  // reports the failure back here and the lesson is re-opened with a fresh URL
  // rather than leaving the student staring at an empty box.
  useEffect(() => {
    if (!trackStudy || !url) return;
    let lastInput = Date.now();
    const mark = () => { lastInput = Date.now(); };
    window.addEventListener('pointerdown', mark);
    window.addEventListener('keydown', mark);
    const send = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastInput > 60_000) return;
      supabase.rpc('record_learning_heartbeat', { p_material_id: material.id });
    };
    send();
    const timer = window.setInterval(send, 30_000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', mark);
    };
  }, [trackStudy, url, material.id]);

  const handlePlaybackError = (message: string) => {
    setUrl(null);
    setError(message);
  };

  if (url) {
    const source = classifyVideoSource(url);
    // A hosted link plays in the provider's own iframe. The watermark and the
    // download blocks do not apply there — the video is already public on that
    // platform — so the protected player is used only for the institute's own
    // files, which is where it actually protects something.
    if (source.kind !== 'file') {
      return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-black">
          <iframe
            src={source.embedUrl}
            title={material.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 w-full h-full"
          />
        </div>
      );
    }
    return <SecureVideoPlayer src={url} watermark={watermark} onPlaybackError={handlePlaybackError} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={load}
        disabled={loading}
        className="pill-button-forest text-xs py-2.5 flex items-center justify-center gap-1.5"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : error ? (
          <RotateCw className="w-4 h-4" />
        ) : (
          <PlayCircle className="w-4 h-4" />
        )}
        {loading ? 'Opening' : error ? 'Try again' : 'Play lesson'}
      </button>
      {error && (
        <span className="text-[11px] text-red-700 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" /> {error}
        </span>
      )}
    </div>
  );
};

/**
 * Note body. Notes are written as light markdown in the admin, so headings,
 * bullets and bold text are rendered rather than dumped as raw characters.
 */
export const NoteBody: React.FC<{ content: string }> = ({ content }) => (
  <div className="flex flex-col gap-2 text-sm leading-relaxed text-foreground">
    {content.split('\n').map((line, i) => {
      const key = `${i}-${line.slice(0, 12)}`;
      if (!line.trim()) return <span key={key} className="h-1" />;
      if (line.startsWith('### ')) return <h4 key={key} className="text-sm font-semibold mt-2">{inline(line.slice(4))}</h4>;
      if (line.startsWith('## ')) return <h3 key={key} className="text-base font-semibold mt-3">{inline(line.slice(3))}</h3>;
      if (line.startsWith('# ')) return <h2 key={key} className="text-lg font-normal text-forest mt-1">{inline(line.slice(2))}</h2>;
      if (/^\s*[-*]\s+/.test(line)) {
        return (
          <span key={key} className="flex gap-2 pl-1">
            <span className="text-forest select-none">•</span>
            <span>{inline(line.replace(/^\s*[-*]\s+/, ''))}</span>
          </span>
        );
      }
      return <p key={key}>{inline(line)}</p>;
    })}
  </div>
);

/** Bold spans inside a line: **like this**. */
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}
