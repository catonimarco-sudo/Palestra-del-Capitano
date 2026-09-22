import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Smartphone,
  Tablet,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Info,
  ExternalLink,
  Share,
  PlusSquare,
  Layers,
  Palette,
  Eye,
} from 'lucide-react';
import {
  ICON_PRESETS,
  ICON_BACKGROUNDS,
  generateIconCanvasDataUrl,
  applyAppIconToDOM,
  downloadIconPng,
} from '../utils/appIcon';
import { GymInfoSettings } from '../data/gymScheduleData';

interface AppIconModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymInfo: GymInfoSettings;
  onSaveGymInfo: (updated: GymInfoSettings) => void;
  onShowToast: (msg: string) => void;
}

export const AppIconModal: React.FC<AppIconModalProps> = ({
  isOpen,
  onClose,
  gymInfo,
  onSaveGymInfo,
  onShowToast,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hof_original');
  const [selectedBgColor, setSelectedBgColor] = useState<string>('');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [devicePreview, setDevicePreview] = useState<'iphone' | 'ipad'>('iphone');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [appNameInput, setAppNameInput] = useState<string>(gymInfo.appName || 'FitSquad');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing custom icon if already configured
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gym_custom_app_icon');
      if (saved) {
        setPreviewDataUrl(saved);
      }
    } catch {}
    setAppNameInput(gymInfo.appName || 'FitSquad');
  }, [gymInfo, isOpen]);

  // Re-generate preview whenever preset, background, custom image or name changes
  useEffect(() => {
    if (!isOpen) return;
    const dataUrl = generateIconCanvasDataUrl({
      presetId: selectedPresetId,
      customImageUrl: customImageUrl || undefined,
      bgColor: selectedBgColor || undefined,
      size: 180,
      appName: appNameInput,
      gymAcronym: gymInfo.logoAcronym || 'HOF',
    });
    setPreviewDataUrl(dataUrl);
  }, [selectedPresetId, selectedBgColor, customImageUrl, appNameInput, gymInfo, isOpen]);

  if (!isOpen) return null;

  // Handle custom image upload from device/iPhone/iPad library or camera
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomImageUrl(result);
        onShowToast('✓ Immagine personalizzata caricata!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Apply icon to document and save to Cloud / localStorage
  const handleApplyIcon = () => {
    if (!previewDataUrl) return;

    // 1. Apply to DOM (apple-touch-icon, favicon, title)
    applyAppIconToDOM(previewDataUrl, appNameInput);

    // 2. Persist in gymInfo
    const updated = {
      ...gymInfo,
      appName: appNameInput,
      appIconUrl: previewDataUrl,
      appIconType: selectedPresetId,
      appIconBg: selectedBgColor,
    };
    onSaveGymInfo(updated);

    onShowToast('🎉 Icona applicata con successo per iPhone, iPad e Web App!');
    onClose();
  };

  // Direct download of 180x180 PNG
  const handleDownload = () => {
    if (!previewDataUrl) return;
    downloadIconPng(previewDataUrl, `apple-touch-icon-${appNameInput.toLowerCase()}.png`);
    onShowToast('✓ Download icona PNG completato (180x180 px)!');
  };

  const handleResetToDefault = () => {
    setSelectedPresetId('hof_original');
    setSelectedBgColor('');
    setCustomImageUrl('');
    setAppNameInput('FitSquad');
    const defaultUrl = generateIconCanvasDataUrl({
      presetId: 'hof_original',
      size: 180,
      appName: 'FitSquad',
      gymAcronym: 'HOF',
    });
    setPreviewDataUrl(defaultUrl);
    applyAppIconToDOM(defaultUrl, 'FitSquad');
    onShowToast('Icona ripristinata a quella predefinita HOF.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[94vh]">
        {/* Decorative ambient background */}
        <div className="absolute -right-24 -top-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-60 h-60 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7cb342] via-[#0288d1] to-[#d81b60] p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-[#7cb342]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black font-display text-white">
                  Cambia Icona App per iPhone, iPad & Tablet
                </h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#7cb342]/20 text-[#7cb342] font-black border border-[#7cb342]/40">
                  iOS & PWA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Scegli lo stile o carica il tuo logo: l'icona apparirà sulla schermata Home del tuo dispositivo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 py-4 overflow-y-auto flex-1 pr-1">
          {/* LEFT: Controls, Presets & Upload (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* App Title in Home Screen */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Nome App sulla Schermata Home:</span>
                <span className="text-[10px] text-slate-500 font-normal">Massimo 12 caratteri consigliati</span>
              </label>
              <input
                type="text"
                value={appNameInput}
                onChange={(e) => setAppNameInput(e.target.value.slice(0, 16))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-[#7cb342]"
                placeholder="FitSquad"
              />
            </div>

            {/* Icon Presets Gallery */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#7cb342]" />
                  <span>Scegli uno Stile Predefinito:</span>
                </span>
                <span className="text-[11px] text-slate-500">Tocca per selezionare</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ICON_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id && !customImageUrl;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        setCustomImageUrl('');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#7cb342] bg-[#7cb342]/10 ring-2 ring-[#7cb342]/30 shadow-md'
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#7cb342] text-slate-950 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {preset.category}
                        </span>
                        <span className="text-xs font-black text-white block mt-0.5 truncate">
                          {preset.name}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{
                            background: `linear-gradient(135deg, ${preset.bgGradient[0]}, ${preset.accentColor})`,
                          }}
                        />
                        <span className="text-[10px] text-slate-400 truncate">{preset.symbolType}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Image Upload Option */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#0288d1]" />
                  <span>Oppure Carica Foto / Logo Personalizzato:</span>
                </span>
                {customImageUrl && (
                  <button
                    type="button"
                    onClick={() => setCustomImageUrl('')}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                  >
                    Rimuovi immagine
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-[#7cb342]" />
                  <span>Carica da Galleria iPhone, iPad o Computer</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Formati supportati: PNG, JPG, WEBP. L'immagine verrà ottimizzata a 180x180 px.
              </p>
            </div>

            {/* Background Color Palette */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                Colore di Sfondo Personalizzato (Opzionale):
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedBgColor('')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    !selectedBgColor
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Gradiente Predefinito
                </button>
                {ICON_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.hex}
                    type="button"
                    onClick={() => setSelectedBgColor(bg.hex)}
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                      selectedBgColor === bg.hex
                        ? 'ring-2 ring-white scale-110 shadow-lg'
                        : 'border-slate-700 hover:scale-105'
                    }`}
                    style={{ backgroundColor: bg.hex }}
                    title={bg.label}
                  >
                    {selectedBgColor === bg.hex && (
                      <Check
                        className={`w-3.5 h-3.5 ${bg.dark ? 'text-white' : 'text-slate-900'} stroke-[3]`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Realistic iPhone & iPad Mockup (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/80 p-4 rounded-3xl border border-slate-800 space-y-4">
            {/* Device Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDevicePreview('iphone')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  devicePreview === 'iphone'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#7cb342]" />
                <span>iPhone</span>
              </button>
              <button
                type="button"
                onClick={() => setDevicePreview('ipad')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  devicePreview === 'ipad'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5 text-[#0288d1]" />
                <span>iPad / Tablet</span>
              </button>
            </div>

            {/* Apple Device Frame Simulation */}
            <div
              className={`relative rounded-[36px] p-4 border-4 border-slate-800 shadow-2xl flex flex-col items-center justify-between transition-all ${
                devicePreview === 'iphone'
                  ? 'w-[240px] h-[340px] bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950'
                  : 'w-[300px] h-[310px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950'
              }`}
            >
              {/* Dynamic Island / Camera Notch */}
              <div className="w-18 h-3.5 bg-black rounded-full mb-3 flex items-center justify-center shadow-inner">
                <div className="w-2 h-2 rounded-full bg-slate-900 ml-auto mr-1" />
              </div>

              {/* Home Screen Grid Mockup */}
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                {/* Active App Icon with iOS rounded squircle */}
                <div className="flex flex-col items-center group cursor-pointer animate-pulse-subtle">
                  <div className="relative shadow-2xl shadow-black/80 transition-transform active:scale-95">
                    {previewDataUrl ? (
                      <img
                        src={previewDataUrl}
                        alt="App Icon Preview"
                        className="w-18 h-18 rounded-[20px] shadow-lg border border-white/15 object-cover"
                      />
                    ) : (
                      <div className="w-18 h-18 rounded-[20px] bg-slate-800 flex items-center justify-center border border-white/20">
                        <Sparkles className="w-8 h-8 text-[#7cb342]" />
                      </div>
                    )}
                    {/* iOS glossy shine overlay */}
                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
                  </div>
                  <span className="text-white font-bold text-xs mt-1.5 tracking-tight text-center drop-shadow-md truncate max-w-[85px]">
                    {appNameInput}
                  </span>
                </div>
              </div>

              {/* iPhone Bottom Bar */}
              <div className="w-24 h-1 bg-white/40 rounded-full mt-2" />
            </div>

            {/* Quick iOS Instructions Card */}
            <div className="w-full bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Share className="w-3.5 h-3.5 text-[#7cb342]" />
                <span>Come installare su iPhone & iPad:</span>
              </div>
              <ol className="text-[11px] text-slate-300 list-decimal list-inside space-y-1">
                <li>
                  Tocca <strong>Condividi</strong> in Safari (il quadrato con la freccia).
                </li>
                <li>
                  Scorri e tocca <strong>"Aggiungi alla schermata Home"</strong>.
                </li>
                <li>
                  L'icona scelta verrà creata come app nativa sul tuo display!
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ripristina Default</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
              title="Scarica il file PNG dell'icona (180x180 px)"
            >
              <Download className="w-3.5 h-3.5 text-[#0288d1]" />
              <span>Scarica PNG (180x180)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleApplyIcon}
              className="px-5 py-2.5 rounded-xl bg-[#7cb342] hover:bg-[#689f38] text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-[#7cb342]/20 active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Applica Icona Ora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
