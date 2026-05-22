const Audio = {
  sounds: {},
  enabled: true,
  
  init() {
    this.sounds = {
      place: { freq: 440, duration: 0.1 },
      win: { freq: 880, duration: 0.3 },
      cardPlay: { freq: 660, duration: 0.15 },
      cardDraw: { freq: 550, duration: 0.08 },
      error: { freq: 220, duration: 0.15 },
      click: { freq: 330, duration: 0.05 }
    };
  },
  
  play(soundName) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    const sound = this.sounds[soundName];
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(sound.freq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + sound.duration);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + sound.duration);
    } catch (e) {
      console.log('Audio not available');
    }
  },
  
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  },
  
  setEnabled(enabled) {
    this.enabled = enabled;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Audio;
}