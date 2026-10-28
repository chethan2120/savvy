'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Enrolment-gated video player.
 *
 * Anti-download / anti-share measures:
 *   * source is a short-lived signed URL from a PRIVATE bucket — a copied link
 *     dies quickly and only an enrolled account can mint a new one;
 *   * native download / remote-playback / PiP controls removed;
 *   * right-click, drag and the common save shortcuts are blocked on the player;
 *   * a moving watermark carries the viewer's enrolment ID, so any screen
 *     recording that leaks is traceable to the account that made it.
 *
 * Honest limit: no browser player can stop a screen recorder outright. The
 * watermark plus per-account signed URLs make sharing attributable, which is
 * what the institute can actually enforce.
 */
export const SecureVideoPlayer: React.FC<{
  src: string;
  watermark: string;
  poster?: string;
  /** Called when the media element itself fails, with a message for the viewer. */
  onPlaybackError?: (message: string) => void;
}> = ({ src, watermark, poster, onPlaybackError }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [pos, setPos] = useState({ top: '12%', left: '8%' });
  const [failed, setFailed] = useState('');

  // Drift the watermark so it cannot be cropped out of a recording.
  useEffect(() => {
    const id = setInterval(() => {
      setPos({
        top: `${10 + Math.random() * 65}%`,
        left: `${5 + Math.random() * 55}%`,
      });
    }, 7000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Not exposed as React props on HTMLVideoElement typings in all browsers.
    v.setAttribute('controlsList', 'nodownload noplaybackrate noremoteplayback');
    v.setAttribute('disablePictureInPicture', 'true');
    v.setAttribute('disableRemotePlayback', 'true');
  }, []);

  // Reset when a fresh URL arrives, so a retry is not stuck on the old failure.
  useEffect(() => setFailed(''), [src]);

  /**
   * `<video>` reports failures only through this event — nothing is thrown and
   * nothing is logged. Without it a lesson whose signed URL had expired, or
   * whose file the browser cannot decode, simply rendered a black rectangle
   * that never played.
   */
  const handleError = () => {
    const code = ref.current?.error?.code;
    const message =
      code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
        ? 'This video cannot be played in your browser. It may still be uploading, or it may be in a format the browser does not support — MP4 (H.264) plays everywhere.'
        : code === MediaError.MEDIA_ERR_DECODE
          ? 'This video file appears to be damaged. Please tell the institute office so it can be uploaded again.'
          : 'The video link has expired or the connection dropped. Choose "Try again" to reload the lesson.';
    setFailed(message);
    onPlaybackError?.(message);
  };

  const blockSaveKeys = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'u' || k === 'p')) {
      e.preventDefault();
    }
  };

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-border bg-black select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onKeyDown={blockSaveKeys}
      tabIndex={-1}
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onError={handleError}
        className="w-full block bg-black"
      />
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-xs text-white/90 bg-black/80">
          {failed}
        </p>
      )}
      <span
        aria-hidden
        style={{ top: pos.top, left: pos.left }}
        className="pointer-events-none absolute text-[10px] md:text-xs font-semibold tracking-wider text-white/35 transition-all duration-1000 drop-shadow"
      >
        {watermark}
      </span>
      <span className="pointer-events-none absolute inset-0 print:bg-black print:opacity-100" />
    </div>
  );
};
