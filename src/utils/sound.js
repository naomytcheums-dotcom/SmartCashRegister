import { Audio } from 'expo-av';

let cachedSound = null;

/**
 * Plays the scan beep (a locally generated audio file, no internet
 * dependency — always works, even offline).
 */
export async function playBeep() {
  try {
    if (!cachedSound) {
      const { sound } = await Audio.Sound.createAsync(require('../../assets/beep.wav'));
      cachedSound = sound;
    }
    await cachedSound.replayAsync();
  } catch (e) {
    // The sound is just a bonus — never block the scan if it fails.
    console.log('Sound unavailable:', e.message);
  }
}
