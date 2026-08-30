import { CLOUDINARY } from '../config/site';

interface TransformOptions {
  width?:       number;
  height?:      number;
  crop?:        'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'pad';
  gravity?:     'auto' | 'face' | 'center' | 'north' | 'south';
  format?:      'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  quality?:     'auto' | 'auto:best' | 'auto:good' | number;
  aspectRatio?: string;
}

export function cloudinaryUrl(publicIdOrUrl: string, opts: TransformOptions = {}): string {
  if (!publicIdOrUrl) return '';

  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    format = 'auto',
    quality = 'auto',
    aspectRatio,
  } = opts;

  const t: string[] = [`f_${format}`, `q_${quality}`];

  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`);
  if (aspectRatio) t.push(`ar_${aspectRatio}`);

  if (width || height || aspectRatio) {
    t.push(`c_${crop}`, `g_${gravity}`);
  }

  const transform = t.join(',');

  // Nowy format z CMS: pełny URL Cloudinary
  if (publicIdOrUrl.startsWith('https://res.cloudinary.com/')) {
    return publicIdOrUrl.replace(
      '/image/upload/',
      `/image/upload/${transform}/`
    );
  }

  // Awaryjnie: inny pełny URL — zwracamy bez przebudowy
  if (
    publicIdOrUrl.startsWith('http://') ||
    publicIdOrUrl.startsWith('https://')
  ) {
    return publicIdOrUrl;
  }

  // Stary format: sam public ID
  return `${CLOUDINARY.baseUrl}/${CLOUDINARY.cloudName}/image/upload/${transform}/${publicIdOrUrl}`;
}

export function cloudinarySrcset(
  publicId: string,
  widths: number[] = [400, 800, 1200, 1600],
  opts: Omit<TransformOptions, 'width'> = {},
): string {
  return widths.map(w => `${cloudinaryUrl(publicId, { ...opts, width: w })} ${w}w`).join(', ');
}

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v', 'ogv', 'avi', 'mkv', 'flv', 'wmv'];

// Rozstrzyga typ zasobu po ścieżce Cloudinary (/video/upload/ vs /image/upload/)
// albo, dla starego formatu (sam public ID), po rozszerzeniu pliku.
export function isVideoAsset(publicIdOrUrl: string): boolean {
  if (!publicIdOrUrl) return false;
  if (publicIdOrUrl.includes('/video/upload/')) return true;
  if (publicIdOrUrl.includes('/image/upload/')) return false;

  const ext = publicIdOrUrl.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  return !!ext && VIDEO_EXTENSIONS.includes(ext);
}

interface MediaTransformOptions {
  width?:       number;
  height?:      number;
  crop?:        'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'pad';
  gravity?:     'auto' | 'face' | 'center' | 'north' | 'south';
  aspectRatio?: string;
  quality?:     'auto' | 'auto:best' | 'auto:good' | number;
  startOffset?: number;
}

interface VideoTransformOptions extends MediaTransformOptions {
  format?: 'auto' | 'mp4' | 'webm' | 'ogv';
}

export function cloudinaryVideoUrl(publicIdOrUrl: string, opts: VideoTransformOptions = {}): string {
  if (!publicIdOrUrl) return '';

  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    format = 'auto',
    quality = 'auto',
    aspectRatio,
  } = opts;

  const t: string[] = [`f_${format}`, `q_${quality}`];

  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`);
  if (aspectRatio) t.push(`ar_${aspectRatio}`);

  let transform = t.join(',');

  if (width || height || aspectRatio) {
    transform += `,c_${crop}`;
    // g_auto dla wideo wymaga bycia w osobnym, samodzielnym komponencie transformacji.
    transform += gravity === 'auto' ? '/g_auto' : `,g_${gravity}`;
  }

  if (publicIdOrUrl.startsWith('https://res.cloudinary.com/')) {
    // Normalizujemy na /video/upload/ (na wypadek błędnie zapisanego /image/upload/) i wstawiamy transformację.
    const normalized = publicIdOrUrl.replace('/image/upload/', '/video/upload/');
    return normalized.replace('/video/upload/', `/video/upload/${transform}/`);
  }

  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    return publicIdOrUrl;
  }

  return `${CLOUDINARY.baseUrl}/${CLOUDINARY.cloudName}/video/upload/${transform}/${publicIdOrUrl}`;
}

// Klatka z wideo jako JPG — Cloudinary generuje ją, dostarczając plik wideo z rozszerzeniem .jpg.
export function cloudinaryVideoPoster(publicIdOrUrl: string, opts: MediaTransformOptions = {}): string {
  if (!publicIdOrUrl) return '';

  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    aspectRatio,
    startOffset = 0,
  } = opts;

  const t: string[] = [`q_${quality}`, `so_${startOffset}`];

  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`);
  if (aspectRatio) t.push(`ar_${aspectRatio}`);

  let transform = t.join(',');

  if (width || height || aspectRatio) {
    transform += `,c_${crop}`;
    // g_auto dla wideo wymaga bycia w osobnym, samodzielnym komponencie transformacji.
    transform += gravity === 'auto' ? '/g_auto' : `,g_${gravity}`;
  }

  const stripExt = (s: string) => s.replace(/\.[a-z0-9]+$/i, '');

  if (publicIdOrUrl.startsWith('https://res.cloudinary.com/')) {
    const normalized = stripExt(publicIdOrUrl.replace('/image/upload/', '/video/upload/'));
    return `${normalized.replace('/video/upload/', `/video/upload/${transform}/`)}.jpg`;
  }

  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    return publicIdOrUrl;
  }

  return `${CLOUDINARY.baseUrl}/${CLOUDINARY.cloudName}/video/upload/${transform}/${stripExt(publicIdOrUrl)}.jpg`;
}

// Miniatura niezależna od typu zasobu: dla wideo zwraca klatkę-plakat, dla zdjęcia — zwykły URL.
export function cloudinaryThumbUrl(publicIdOrUrl: string, opts: MediaTransformOptions = {}): string {
  if (!publicIdOrUrl) return '';
  return isVideoAsset(publicIdOrUrl)
    ? cloudinaryVideoPoster(publicIdOrUrl, opts)
    : cloudinaryUrl(publicIdOrUrl, opts);
}

export interface ResolvedMedia {
  type:   'image' | 'video';
  url:    string;
  poster: string | null;
}

// Punkt wejścia dla pól galerii mieszających zdjęcia i wideo — rozstrzyga typ i buduje właściwe URL-e.
export function resolveMedia(publicIdOrUrl: string, opts: MediaTransformOptions = {}): ResolvedMedia {
  const video = isVideoAsset(publicIdOrUrl);
  return {
    type:   video ? 'video' : 'image',
    url:    video ? cloudinaryVideoUrl(publicIdOrUrl, opts) : cloudinaryUrl(publicIdOrUrl, opts),
    poster: video ? cloudinaryVideoPoster(publicIdOrUrl, opts) : null,
  };
}

export const img = {
  hero:          (id: string) => cloudinaryUrl(id, { width: 1200, aspectRatio: '4:3',  crop: 'fill' }),
  section:       (id: string) => cloudinaryUrl(id, { width: 900,  aspectRatio: '4:3',  crop: 'fill' }),
  portfolioCard: (id: string) => cloudinaryUrl(id, { width: 800,  aspectRatio: '4:3',  crop: 'fill' }),
  portfolioFull: (id: string) => cloudinaryUrl(id, { width: 1600, format: 'auto' }),
  postCover:     (id: string) => cloudinaryUrl(id, { width: 1200, aspectRatio: '16:9', crop: 'fill' }),
  postThumb:     (id: string) => cloudinaryUrl(id, { width: 600,  aspectRatio: '16:9', crop: 'fill' }),
  og:            (id: string) => cloudinaryUrl(id, { width: 1200, height: 630,         crop: 'fill' }),
  portrait:      (id: string) => cloudinaryUrl(id, { width: 600,  aspectRatio: '3:4',  crop: 'fill' }),  
  story:         (id: string) => cloudinaryUrl(id, { width: 600,  aspectRatio: '9:16', crop: 'fill' }),  
  square:        (id: string) => cloudinaryUrl(id, { width: 800,  aspectRatio: '1:1',  crop: 'fill' }),  
  wide:          (id: string) => cloudinaryUrl(id, { width: 1600, aspectRatio: '21:9', crop: 'fill' }), 
};
