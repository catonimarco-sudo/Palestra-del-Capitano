// App Icon Generator & Manager for iPhone, iPad, and Web App Manifest

export interface AppIconPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  bgGradient: [string, string];
  symbolType: 'hof' | 'dumbbell' | 'kettlebell' | 'flame' | 'bolt' | 'heart' | 'shield';
  accentColor: string;
}

export const ICON_PRESETS: AppIconPreset[] = [
  {
    id: 'hof_original',
    name: 'HOF Centro Sportivo',
    category: 'Ufficiale',
    description: 'Logo originale HOF House of Fitness con sfondo scuro e verde lime',
    bgGradient: ['#090d16', '#020617'],
    symbolType: 'hof',
    accentColor: '#7cb342',
  },
  {
    id: 'fitsquad_dumbbell',
    name: 'FitSquad Pesi Pro',
    category: 'Fitness',
    description: 'Manubrio fitness dinamico con gradiente verde lime e azzurro',
    bgGradient: ['#0f172a', '#020617'],
    symbolType: 'dumbbell',
    accentColor: '#84cc16',
  },
  {
    id: 'flame_cardio',
    name: 'Fiamma Energy',
    category: 'Intensità',
    description: 'Fiamma energica arancio e fucsia per corsi cardio e tonificazione',
    bgGradient: ['#18080f', '#090306'],
    symbolType: 'flame',
    accentColor: '#f97316',
  },
  {
    id: 'bolt_power',
    name: 'Fulmine Elettrico',
    category: 'Potenza',
    description: 'Fulmine brillante in ciano e lime per potenza ed energia pura',
    bgGradient: ['#04121e', '#01070e'],
    symbolType: 'bolt',
    accentColor: '#00e5ff',
  },
  {
    id: 'kettlebell_gold',
    name: 'Kettlebell Oro',
    category: 'Funzionale',
    description: 'Kettlebell con accenti dorati e ambra per cross training',
    bgGradient: ['#1c1304', '#0a0701'],
    symbolType: 'kettlebell',
    accentColor: '#f59e0b',
  },
  {
    id: 'heart_pulse',
    name: 'Cardio & Salute',
    category: 'Benessere',
    description: 'Cuore e battito cardio per pilates, postura e benessere',
    bgGradient: ['#1a060d', '#080104'],
    symbolType: 'heart',
    accentColor: '#f43f5e',
  },
  {
    id: 'shield_crest',
    name: 'Scudo Squad Club',
    category: 'Club',
    description: 'Stemma sportivo d\'élite con finiture grafite e verde HOF',
    bgGradient: ['#0e1726', '#030712'],
    symbolType: 'shield',
    accentColor: '#7cb342',
  },
];

export const ICON_BACKGROUNDS = [
  { label: 'Nero Profondo', hex: '#020617', dark: true },
  { label: 'Verde HOF', hex: '#7cb342', dark: false },
  { label: 'Azzurro Elettrico', hex: '#0288d1', dark: false },
  { label: 'Fucsia / Magenta', hex: '#d81b60', dark: false },
  { label: 'Grafite Titanio', hex: '#1e293b', dark: true },
  { label: 'Arancio Fuoco', hex: '#ea580c', dark: false },
  { label: 'Viola Notte', hex: '#581c87', dark: true },
  { label: 'Bianco Perla', hex: '#f8fafc', dark: false },
];

/**
 * Renders an app icon to an HTML5 Canvas and outputs a PNG Data URL.
 * Produces crisp square images suitable for Apple Touch Icon (180x180) and PWA (512x512).
 */
export function generateIconCanvasDataUrl(options: {
  presetId?: string;
  customImageUrl?: string;
  bgColor?: string;
  size?: number;
  appName?: string;
  gymAcronym?: string;
}): string {
  const {
    presetId = 'hof_original',
    customImageUrl,
    bgColor,
    size = 180,
    appName = 'FitSquad',
    gymAcronym = 'HOF',
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const preset = ICON_PRESETS.find((p) => p.id === presetId) || ICON_PRESETS[0];

  // 1. Draw Background
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
  } else {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, preset.bgGradient[0]);
    grad.addColorStop(1, preset.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  // 2. Subtle radial highlight
  const radialGlow = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.1,
    size / 2,
    size / 2,
    size * 0.55
  );
  radialGlow.addColorStop(0, `${preset.accentColor}33`);
  radialGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, size, size);

  // 3. Custom Image if provided and loaded
  if (customImageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = customImageUrl;
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, size * 0.1, size * 0.1, size * 0.8, size * 0.8);
        return canvas.toDataURL('image/png');
      }
    } catch {}
  }

  // 4. Draw preset symbol
  ctx.save();
  ctx.translate(size / 2, size / 2);

  const scale = size / 180;

  switch (preset.symbolType) {
    case 'hof': {
      // HOF Shield & Monogram
      ctx.beginPath();
      ctx.moveTo(0, -55 * scale);
      ctx.lineTo(48 * scale, -28 * scale);
      ctx.lineTo(38 * scale, 34 * scale);
      ctx.lineTo(0, 56 * scale);
      ctx.lineTo(-38 * scale, 34 * scale);
      ctx.lineTo(-48 * scale, -28 * scale);
      ctx.closePath();
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 4 * scale;
      ctx.strokeStyle = preset.accentColor;
      ctx.stroke();

      // Bold Typography
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${32 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(gymAcronym || 'HOF', 0, -4 * scale);

      ctx.fillStyle = preset.accentColor;
      ctx.font = `800 ${10 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.fillText('FITNESS', 0, 24 * scale);
      break;
    }

    case 'dumbbell': {
      // Modern rotated dumbbell
      ctx.rotate((-35 * Math.PI) / 180);

      // Central Bar
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-45 * scale, -7 * scale, 90 * scale, 14 * scale);

      // Collars
      ctx.fillStyle = preset.accentColor;
      ctx.fillRect(-32 * scale, -16 * scale, 8 * scale, 32 * scale);
      ctx.fillRect(24 * scale, -16 * scale, 8 * scale, 32 * scale);

      // Inner plates
      ctx.fillStyle = preset.accentColor;
      ctx.beginPath();
      ctx.roundRect(-46 * scale, -28 * scale, 12 * scale, 56 * scale, 4 * scale);
      ctx.roundRect(34 * scale, -28 * scale, 12 * scale, 56 * scale, 4 * scale);
      ctx.fill();

      // Outer plates
      ctx.fillStyle = '#0288d1';
      ctx.beginPath();
      ctx.roundRect(-60 * scale, -38 * scale, 12 * scale, 76 * scale, 4 * scale);
      ctx.roundRect(48 * scale, -38 * scale, 12 * scale, 76 * scale, 4 * scale);
      ctx.fill();
      break;
    }

    case 'flame': {
      // Energy Flame
      ctx.beginPath();
      ctx.moveTo(0, 48 * scale);
      ctx.bezierCurveTo(
        35 * scale, 48 * scale,
        45 * scale, 10 * scale,
        20 * scale, -25 * scale
      );
      ctx.bezierCurveTo(
        15 * scale, -15 * scale,
        10 * scale, -10 * scale,
        0 * scale, -52 * scale
      );
      ctx.bezierCurveTo(
        -8 * scale, -25 * scale,
        -15 * scale, -15 * scale,
        -25 * scale, -20 * scale
      );
      ctx.bezierCurveTo(
        -48 * scale, 5 * scale,
        -35 * scale, 48 * scale,
        0, 48 * scale
      );
      ctx.closePath();
      const flameGrad = ctx.createLinearGradient(0, 48 * scale, 0, -50 * scale);
      flameGrad.addColorStop(0, '#ea580c');
      flameGrad.addColorStop(0.5, '#f59e0b');
      flameGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // Inner flame
      ctx.beginPath();
      ctx.moveTo(0, 42 * scale);
      ctx.bezierCurveTo(18 * scale, 42 * scale, 22 * scale, 18 * scale, 10 * scale, -5 * scale);
      ctx.bezierCurveTo(-10 * scale, 18 * scale, -18 * scale, 42 * scale, 0, 42 * scale);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      break;
    }

    case 'bolt': {
      // Electric lightning bolt
      ctx.beginPath();
      ctx.moveTo(8 * scale, -55 * scale);
      ctx.lineTo(-32 * scale, 5 * scale);
      ctx.lineTo(-2 * scale, 5 * scale);
      ctx.lineTo(-8 * scale, 55 * scale);
      ctx.lineTo(32 * scale, -5 * scale);
      ctx.lineTo(2 * scale, -5 * scale);
      ctx.closePath();
      const boltGrad = ctx.createLinearGradient(-30 * scale, 50 * scale, 30 * scale, -50 * scale);
      boltGrad.addColorStop(0, '#00e5ff');
      boltGrad.addColorStop(1, '#7cb342');
      ctx.fillStyle = boltGrad;
      ctx.fill();
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      break;
    }

    case 'kettlebell': {
      // Kettlebell
      // Handle
      ctx.beginPath();
      ctx.arc(0, -26 * scale, 28 * scale, Math.PI, 0, false);
      ctx.lineWidth = 10 * scale;
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();

      // Body sphere
      ctx.beginPath();
      ctx.arc(0, 14 * scale, 38 * scale, 0, Math.PI * 2);
      const kbGrad = ctx.createRadialGradient(-10 * scale, 0, 5 * scale, 0, 14 * scale, 42 * scale);
      kbGrad.addColorStop(0, '#fbbf24');
      kbGrad.addColorStop(0.8, '#d97706');
      kbGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = kbGrad;
      ctx.fill();

      // Flatten base
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-22 * scale, 44 * scale, 44 * scale, 6 * scale);

      // Text 24KG
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${14 * scale}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FIT', 0, 14 * scale);
      break;
    }

    case 'heart': {
      // Cardio Heart Pulse
      ctx.beginPath();
      ctx.moveTo(0, 36 * scale);
      ctx.bezierCurveTo(40 * scale, 10 * scale, 50 * scale, -28 * scale, 24 * scale, -42 * scale);
      ctx.bezierCurveTo(8 * scale, -48 * scale, 0, -32 * scale, 0, -24 * scale);
      ctx.bezierCurveTo(0, -32 * scale, -8 * scale, -48 * scale, -24 * scale, -42 * scale);
      ctx.bezierCurveTo(-50 * scale, -28 * scale, -40 * scale, 10 * scale, 0, 36 * scale);
      ctx.closePath();
      const heartGrad = ctx.createLinearGradient(0, -40 * scale, 0, 35 * scale);
      heartGrad.addColorStop(0, '#f43f5e');
      heartGrad.addColorStop(1, '#be123c');
      ctx.fillStyle = heartGrad;
      ctx.fill();

      // Pulse ECG line
      ctx.beginPath();
      ctx.moveTo(-32 * scale, -4 * scale);
      ctx.lineTo(-14 * scale, -4 * scale);
      ctx.lineTo(-6 * scale, -22 * scale);
      ctx.lineTo(4 * scale, 16 * scale);
      ctx.lineTo(12 * scale, -10 * scale);
      ctx.lineTo(20 * scale, -4 * scale);
      ctx.lineTo(32 * scale, -4 * scale);
      ctx.lineWidth = 4 * scale;
      ctx.strokeStyle = '#ffffff';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      break;
    }

    case 'shield': {
      // Shield crest
      ctx.beginPath();
      ctx.moveTo(0, -50 * scale);
      ctx.lineTo(40 * scale, -32 * scale);
      ctx.lineTo(32 * scale, 24 * scale);
      ctx.lineTo(0, 52 * scale);
      ctx.lineTo(-32 * scale, 24 * scale);
      ctx.lineTo(-40 * scale, -32 * scale);
      ctx.closePath();
      const sGrad = ctx.createLinearGradient(-30 * scale, -40 * scale, 30 * scale, 40 * scale);
      sGrad.addColorStop(0, '#1e293b');
      sGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = sGrad;
      ctx.fill();
      ctx.lineWidth = 4 * scale;
      ctx.strokeStyle = '#7cb342';
      ctx.stroke();

      // V wings
      ctx.beginPath();
      ctx.moveTo(-20 * scale, -10 * scale);
      ctx.lineTo(0, 16 * scale);
      ctx.lineTo(20 * scale, -10 * scale);
      ctx.lineWidth = 6 * scale;
      ctx.strokeStyle = '#7cb342';
      ctx.stroke();
      break;
    }
  }

  ctx.restore();

  // Subtle bottom title label if not customized
  if (preset.symbolType !== 'hof') {
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.round(15 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText((appName || 'FITSQUAD').toUpperCase(), size / 2, size - 14 * scale);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Dynamically applies the chosen icon to the HTML document:
 * Updates <link rel="apple-touch-icon">, <link rel="icon">, and <meta name="apple-mobile-web-app-title">.
 * This guarantees that when an iPhone or iPad user taps "Add to Home Screen",
 * iOS immediately uses the new customized icon!
 */
export function applyAppIconToDOM(iconDataUrl: string, appTitle: string = 'FitSquad') {
  if (typeof document === 'undefined') return;

  // 1. Update Apple Touch Icon
  let appleTouch = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
  if (!appleTouch) {
    appleTouch = document.createElement('link');
    appleTouch.rel = 'apple-touch-icon';
    appleTouch.sizes = '180x180';
    document.head.appendChild(appleTouch);
  }
  appleTouch.href = iconDataUrl;

  // 2. Update Standard PNG Favicon
  let faviconPng = document.querySelector('link[id="app-favicon-png"]') as HTMLLinkElement;
  if (!faviconPng) {
    faviconPng = document.querySelector('link[type="image/png"]') as HTMLLinkElement;
  }
  if (faviconPng) {
    faviconPng.href = iconDataUrl;
  }

  // 3. Update iOS App Title
  let titleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement;
  if (!titleMeta) {
    titleMeta = document.createElement('meta');
    titleMeta.name = 'apple-mobile-web-app-title';
    document.head.appendChild(titleMeta);
  }
  titleMeta.content = appTitle;

  // 4. Save to local storage for instant cold reload
  try {
    localStorage.setItem('gym_custom_app_icon', iconDataUrl);
    localStorage.setItem('gym_custom_app_title', appTitle);
  } catch {}
}

/**
 * Triggers a direct download of the icon file in PNG format.
 */
export function downloadIconPng(dataUrl: string, filename: string = 'apple-touch-icon.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
