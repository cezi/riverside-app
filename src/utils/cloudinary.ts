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
