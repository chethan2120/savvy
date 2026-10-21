/**
 * What kind of video a lesson URL points at.
 *
 * The admin form accepts any URL, and staff paste YouTube share links into it
 * — reasonably, since that is where their recorded sessions live. A `<video>`
 * element cannot play a YouTube watch page: it fails with
 * MEDIA_ERR_SRC_NOT_SUPPORTED and renders a black rectangle, which is exactly
 * what students reported. Hosted links are played in the provider's own
 * embedded player instead; direct media files keep the enrolment-gated player.
 */
export type VideoSource =
  | { kind: 'file'; url: string }
  | { kind: 'youtube'; url: string; embedUrl: string }
  | { kind: 'vimeo'; url: string; embedUrl: string };

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'];
const VIMEO_HOSTS = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];

/** The 11-character video id in any of YouTube's link shapes, or null. */
function youtubeId(u: URL): string | null {
  if (u.hostname.endsWith('youtu.be')) {
    const id = u.pathname.slice(1).split('/')[0];
    return id || null;
  }
  // /watch?v=…
  const v = u.searchParams.get('v');
  if (v) return v;
  // /embed/…, /shorts/…, /live/…
  const match = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
  return match ? match[1] : null;
}

function vimeoId(u: URL): string | null {
  const match = u.pathname.match(/(\d+)/);
  return match ? match[1] : null;
}

export function classifyVideoSource(rawUrl: string): VideoSource {
  const url = rawUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Signed storage URLs and relative paths land here; treat them as files.
    return { kind: 'file', url };
  }

  const host = parsed.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.includes(host)) {
    const id = youtubeId(parsed);
    if (id) {
      // `rel=0` keeps the end screen on the same channel; `modestbranding`
      // trims the chrome so the lesson does not look like a YouTube page.
      return { kind: 'youtube', url, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` };
    }
  }

  if (VIMEO_HOSTS.includes(host)) {
    const id = vimeoId(parsed);
    if (id) return { kind: 'vimeo', url, embedUrl: `https://player.vimeo.com/video/${id}` };
  }

  return { kind: 'file', url };
}

/** Label for the admin form, so staff can see how a pasted link will play. */
export const videoSourceLabel: Record<VideoSource['kind'], string> = {
  file: 'Direct video file — plays in the protected player with the student watermark.',
  youtube: 'YouTube link — plays in an embedded YouTube player.',
  vimeo: 'Vimeo link — plays in an embedded Vimeo player.',
};
