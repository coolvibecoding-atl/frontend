export interface GenrePreset {
  name: string;
  description: string;
  lufs: {
    target: number;
    range: string;
  };
  eq: {
    lowShelf: { frequency: number; gain: number };
    lowMid: { frequency: number; gain: number; q: number };
    mid: { frequency: number; gain: number; q: number };
    highMid: { frequency: number; gain: number; q: number };
    highShelf: { frequency: number; gain: number };
  };
  compression: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    knee: number;
  };
  limiter: {
    threshold: number;
  };
  characteristics: string[];
}

export const genrePresets: Record<string, GenrePreset> = {
  'hip-hop': {
    name: 'Hip-Hop',
    description: 'Punchy bass, forward vocals, wide low-end',
    lufs: { target: -8, range: '-7 to -9' },
    eq: {
      lowShelf: { frequency: 80, gain: 4 },
      lowMid: { frequency: 200, gain: 2, q: 1.5 },
      mid: { frequency: 1000, gain: -1, q: 1 },
      highMid: { frequency: 3500, gain: 1, q: 2 },
      highShelf: { frequency: 10000, gain: 0 },
    },
    compression: {
      threshold: -15,
      ratio: 4,
      attack: 10,
      release: 150,
      knee: 6,
    },
    limiter: { threshold: -1 },
    characteristics: ['Punchy 808s', 'Forward lead vocal', 'Crisp hi-hats', 'Warm low-end'],
  },
  'trap': {
    name: 'Trap',
    description: 'Aggressive bass, heavy 808s, dark tone',
    lufs: { target: -7, range: '-6 to -8' },
    eq: {
      lowShelf: { frequency: 60, gain: 5 },
      lowMid: { frequency: 150, gain: 3, q: 2 },
      mid: { frequency: 800, gain: -2, q: 1 },
      highMid: { frequency: 3000, gain: 0, q: 1.5 },
      highShelf: { frequency: 12000, gain: -2 },
    },
    compression: {
      threshold: -12,
      ratio: 6,
      attack: 5,
      release: 100,
      knee: 4,
    },
    limiter: { threshold: -0.5 },
    characteristics: ['Deep 808s', 'Dark tonal balance', 'Hard-hitting transients', 'Aggressive sound'],
  },
  'pop': {
    name: 'Pop',
    description: 'Radio-ready, loud, polished, modern',
    lufs: { target: -7, range: '-6 to -8' },
    eq: {
      lowShelf: { frequency: 100, gain: 2 },
      lowMid: { frequency: 250, gain: 1, q: 1 },
      mid: { frequency: 2000, gain: 1, q: 1.5 },
      highMid: { frequency: 4500, gain: 2, q: 2 },
      highShelf: { frequency: 12000, gain: 1 },
    },
    compression: {
      threshold: -18,
      ratio: 3,
      attack: 15,
      release: 200,
      knee: 8,
    },
    limiter: { threshold: -1 },
    characteristics: ['Radio-ready loudness', 'Shiny top-end', 'Smooth vocals', 'Catchy presence'],
  },
  'r-b': {
    name: 'R&B',
    description: 'Smooth, warm, vocal-forward, silky',
    lufs: { target: -9, range: '-8 to -10' },
    eq: {
      lowShelf: { frequency: 120, gain: 2 },
      lowMid: { frequency: 300, gain: 1, q: 1.2 },
      mid: { frequency: 1500, gain: 0, q: 1 },
      highMid: { frequency: 4000, gain: 1, q: 1.5 },
      highShelf: { frequency: 8000, gain: 2 },
    },
    compression: {
      threshold: -20,
      ratio: 2.5,
      attack: 20,
      release: 250,
      knee: 10,
    },
    limiter: { threshold: -1.5 },
    characteristics: ['Warm bass', 'Smooth vocals', 'Silky highs', 'Vocal-forward mix'],
  },
  'edm': {
    name: 'EDM',
    description: 'Loud, punchy, festival-ready, aggressive',
    lufs: { target: -6, range: '-5 to -7' },
    eq: {
      lowShelf: { frequency: 80, gain: 3 },
      lowMid: { frequency: 200, gain: 2, q: 1.5 },
      mid: { frequency: 1200, gain: 1, q: 1 },
      highMid: { frequency: 3500, gain: 2, q: 2 },
      highShelf: { frequency: 10000, gain: 3 },
    },
    compression: {
      threshold: -14,
      ratio: 5,
      attack: 3,
      release: 80,
      knee: 5,
    },
    limiter: { threshold: -0.3 },
    characteristics: ['Festival loudness', 'Punchy kicks', 'Bright synthesizers', 'Heavy bass'],
  },
  'rock': {
    name: 'Rock',
    description: 'Raw, dynamic, guitar-forward, powerful',
    lufs: { target: -8.5, range: '-8 to -9' },
    eq: {
      lowShelf: { frequency: 100, gain: 2 },
      lowMid: { frequency: 250, gain: 0, q: 1 },
      mid: { frequency: 2000, gain: 1, q: 1.5 },
      highMid: { frequency: 4000, gain: 2, q: 2 },
      highShelf: { frequency: 8000, gain: 1 },
    },
    compression: {
      threshold: -16,
      ratio: 3,
      attack: 8,
      release: 180,
      knee: 6,
    },
    limiter: { threshold: -1 },
    characteristics: ['Dynamic range', 'Guitar presence', 'Punchy drums', 'Raw sound'],
  },
  'country': {
    name: 'Country',
    description: 'Warm, natural, acoustic-forward, storytelling',
    lufs: { target: -9, range: '-8 to -10' },
    eq: {
      lowShelf: { frequency: 150, gain: 1 },
      lowMid: { frequency: 400, gain: 1, q: 1 },
      mid: { frequency: 1500, gain: 0, q: 1 },
      highMid: { frequency: 3500, gain: 1, q: 1.5 },
      highShelf: { frequency: 7500, gain: 0 },
    },
    compression: {
      threshold: -18,
      ratio: 2,
      attack: 25,
      release: 300,
      knee: 10,
    },
    limiter: { threshold: -2 },
    characteristics: ['Natural dynamics', 'Acoustic warmth', 'Clear vocals', 'Storytelling focus'],
  },
  'jazz': {
    name: 'Jazz',
    description: 'Natural, warm, dynamic, organic',
    lufs: { target: -14, range: '-12 to -16' },
    eq: {
      lowShelf: { frequency: 150, gain: 1 },
      lowMid: { frequency: 300, gain: 0, q: 1 },
      mid: { frequency: 1200, gain: 0, q: 1 },
      highMid: { frequency: 4000, gain: 1, q: 1.5 },
      highShelf: { frequency: 8000, gain: 2 },
    },
    compression: {
      threshold: -22,
      ratio: 1.5,
      attack: 30,
      release: 400,
      knee: 12,
    },
    limiter: { threshold: -3 },
    characteristics: ['Preserved dynamics', 'Natural warmth', 'Instrument clarity', 'Organic sound'],
  },
  'latin': {
    name: 'Latin',
    description: 'Rhythmic, warm, percussion-forward, energetic',
    lufs: { target: -8, range: '-7 to -9' },
    eq: {
      lowShelf: { frequency: 100, gain: 3 },
      lowMid: { frequency: 250, gain: 2, q: 1.5 },
      mid: { frequency: 1500, gain: 1, q: 1 },
      highMid: { frequency: 4500, gain: 2, q: 2 },
      highShelf: { frequency: 10000, gain: 1 },
    },
    compression: {
      threshold: -16,
      ratio: 3,
      attack: 8,
      release: 150,
      knee: 6,
    },
    limiter: { threshold: -1 },
    characteristics: ['Percussion energy', 'Warm bass', 'Rhythmic feel', 'Vibrant horns'],
  },
  'afrobeats': {
    name: 'Afrobeats',
    description: 'Fusing African rhythms with hip-hop and R&B elements',
    lufs: { target: -7, range: '-6 to -8' },
    eq: {
      lowShelf: { frequency: 80, gain: 4 },
      lowMid: { frequency: 200, gain: 2, q: 1.5 },
      mid: { frequency: 1200, gain: 0, q: 1 },
      highMid: { frequency: 3800, gain: 2, q: 2 },
      highShelf: { frequency: 10000, gain: 1 },
    },
    compression: {
      threshold: -14,
      ratio: 4,
      attack: 8,
      release: 120,
      knee: 5,
    },
    limiter: { threshold: -0.5 },
    characteristics: ['Groovy basslines', 'Layered percussion', 'Melodic hooks', 'Modern feel'],
  },
};

export const defaultPreset = genrePresets['pop'];

export function getPreset(genre: string): GenrePreset {
  return genrePresets[genre] || defaultPreset;
}

export function getGenreList(): Array<{ id: string; name: string; description: string }> {
  return Object.entries(genrePresets).map(([id, preset]) => ({
    id,
    name: preset.name,
    description: preset.description,
  }));
}
