const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

export interface PexelsPhoto {
  id: number;
  url: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

// Curated fallback golf images (Pexels URLs that are freely available)
const FALLBACK_GOLF_IMAGES = [
  {
    id: 1,
    url: '',
    photographer: 'Unsplash',
    src: {
      original: 'https://images.pexels.com/photos/1325747/pexels-photo-1325747.jpeg',
      large2x: 'https://images.pexels.com/photos/1325747/pexels-photo-1325747.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      large: 'https://images.pexels.com/photos/1325747/pexels-photo-1325747.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      medium: 'https://images.pexels.com/photos/1325747/pexels-photo-1325747.jpeg?auto=compress&cs=tinysrgb&h=350',
      small: 'https://images.pexels.com/photos/1325747/pexels-photo-1325747.jpeg?auto=compress&cs=tinysrgb&h=130',
      portrait: 'https://images.pexels.com/photos/1325747/pexels-photo-1325747.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
      landscape: 'https://images.pexels.com/photos/1325747/pexels-photo-1325747.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      tiny: 'https://images.pexels.com/photos/1325747/pexels-photo-1325747.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280',
    },
    alt: 'Golf course landscape',
  },
  {
    id: 2,
    url: '',
    photographer: 'Unsplash',
    src: {
      original: 'https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg',
      large2x: 'https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      large: 'https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      medium: 'https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg?auto=compress&cs=tinysrgb&h=350',
      small: 'https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg?auto=compress&cs=tinysrgb&h=130',
      portrait: 'https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
      landscape: 'https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      tiny: 'https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280',
    },
    alt: 'Golf ball on green grass',
  },
  {
    id: 3,
    url: '',
    photographer: 'Unsplash',
    src: {
      original: 'https://images.pexels.com/photos/114972/pexels-photo-114972.jpeg',
      large2x: 'https://images.pexels.com/photos/114972/pexels-photo-114972.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      large: 'https://images.pexels.com/photos/114972/pexels-photo-114972.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      medium: 'https://images.pexels.com/photos/114972/pexels-photo-114972.jpeg?auto=compress&cs=tinysrgb&h=350',
      small: 'https://images.pexels.com/photos/114972/pexels-photo-114972.jpeg?auto=compress&cs=tinysrgb&h=130',
      portrait: 'https://images.pexels.com/photos/114972/pexels-photo-114972.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
      landscape: 'https://images.pexels.com/photos/114972/pexels-photo-114972.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      tiny: 'https://images.pexels.com/photos/114972/pexels-photo-114972.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280',
    },
    alt: 'Golf course with sunset',
  },
  {
    id: 4,
    url: '',
    photographer: 'Unsplash',
    src: {
      original: 'https://images.pexels.com/photos/274126/pexels-photo-274126.jpeg',
      large2x: 'https://images.pexels.com/photos/274126/pexels-photo-274126.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      large: 'https://images.pexels.com/photos/274126/pexels-photo-274126.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      medium: 'https://images.pexels.com/photos/274126/pexels-photo-274126.jpeg?auto=compress&cs=tinysrgb&h=350',
      small: 'https://images.pexels.com/photos/274126/pexels-photo-274126.jpeg?auto=compress&cs=tinysrgb&h=130',
      portrait: 'https://images.pexels.com/photos/274126/pexels-photo-274126.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
      landscape: 'https://images.pexels.com/photos/274126/pexels-photo-274126.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      tiny: 'https://images.pexels.com/photos/274126/pexels-photo-274126.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280',
    },
    alt: 'Golf club and ball',
  },
];

let cachedPhotos: PexelsPhoto[] | null = null;

export async function searchGolfPhotos(query = 'golf course', perPage = 15): Promise<PexelsPhoto[]> {
  if (cachedPhotos) return cachedPhotos;

  if (!PEXELS_API_KEY) {
    cachedPhotos = FALLBACK_GOLF_IMAGES as PexelsPhoto[];
    return cachedPhotos;
  }

  try {
    const response = await fetch(
      `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: { Authorization: PEXELS_API_KEY },
      }
    );

    if (!response.ok) {
      cachedPhotos = FALLBACK_GOLF_IMAGES as PexelsPhoto[];
      return cachedPhotos;
    }

    const data: PexelsResponse = await response.json();
    cachedPhotos = data.photos.length > 0 ? data.photos : FALLBACK_GOLF_IMAGES as PexelsPhoto[];
    return cachedPhotos;
  } catch {
    cachedPhotos = FALLBACK_GOLF_IMAGES as PexelsPhoto[];
    return cachedPhotos;
  }
}

export function getRandomFallbackImage(): PexelsPhoto {
  const idx = Math.floor(Math.random() * FALLBACK_GOLF_IMAGES.length);
  return FALLBACK_GOLF_IMAGES[idx] as PexelsPhoto;
}
