import type { CourseMaterial } from '@/lib/types';

/** A video is playable only after a real file or hosted source is published. */
export function isPlayableVideo(material: CourseMaterial): boolean {
  if (material.type !== 'video') return false;
  if (material.is_published === false) return false;
  return Boolean(material.storage_path || material.content);
}

export function formatStudy(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours === 0) return `${minutes} minutes`;
  return `${hours} hours ${minutes} minutes`;
}
