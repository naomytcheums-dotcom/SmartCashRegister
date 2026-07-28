import { Audio } from 'expo-av';

let cachedSound = null;

/**
 * Joue le bip de scan (fichier audio local généré une fois, pas de
 * dépendance internet — fonctionne toujours, même hors ligne).
 */
export async function playBeep() {
  try {
    if (!cachedSound) {
      const { sound } = await Audio.Sound.createAsync(require('../../assets/beep.wav'));
      cachedSound = sound;
    }
    await cachedSound.replayAsync();
  } catch (e) {
    // Le son n'est qu'un bonus — on ne bloque jamais le scan si ça échoue.
    console.log('Son indisponible :', e.message);
  }
}
