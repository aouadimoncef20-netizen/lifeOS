import { useState, useRef, useCallback, useEffect } from 'react';

export function useAmbientAudio(sounds) {
  const [currentSound, setCurrentSound] = useState(null);
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);

  // We use OscillatorNode as a placeholder since we don't have actual audio files
  // In production, replace with Audio element for real sound files
  const playSound = useCallback((soundId) => {
    // Stop current
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      sourceNodeRef.current = null;
      gainNodeRef.current = null;
    }

    if (!soundId) {
      setCurrentSound(null);
      setIsPlaying(false);
      return;
    }

    const sound = sounds.find(s => s.id === soundId);
    if (!sound) return;

    setCurrentSound(sound);
    setIsPlaying(true);

    // Create ambient noise generator as placeholder
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      gainNodeRef.current = gain;
      gain.connect(ctx.destination);

      // Generate appropriate noise type based on sound
      if (soundId === 'whitenoise') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        source.start();
        sourceNodeRef.current = source;
      } else {
        // Brown/pink noise approximation for "natural" sounds
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        source.start();
        sourceNodeRef.current = source;
      }
    } catch {}
  }, [sounds, volume]);

  const stopSound = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setCurrentSound(null);
    setIsPlaying(false);
  }, []);

  const setVolumeLevel = useCallback((v) => {
    setVolume(v);
    if (gainNodeRef.current) gainNodeRef.current.gain.value = v;
  }, []);

  useEffect(() => {
    return () => { if (audioContextRef.current) audioContextRef.current.close(); };
  }, []);

  return { currentSound, isPlaying, volume, playSound, stopSound, setVolume: setVolumeLevel };
}
