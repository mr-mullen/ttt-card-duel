// TTT Card Duel — Settings Management
// Handles user preferences: color, font, sound, etc.

const Settings = {
  defaults: {
    color: '#00FF41',
    font: 'Share Tech Mono',
    scanlines: true,
    sound: true,
    flicker: false
  },

  current: {
    color: '#00FF41',
    font: 'Share Tech Mono',
    scanlines: true,
    sound: true,
    flicker: false
  },

  // Initialize settings
  init() {
    // Set input values to current settings
    document.getElementById('color-picker').value = this.current.color;
    document.getElementById('font-select').value = this.current.font;
    document.getElementById('scanlines-checkbox').checked = this.current.scanlines;
    document.getElementById('sound-checkbox').checked = this.current.sound;
    document.getElementById('flicker-checkbox').checked = this.current.flicker;

    // Set global styles
    document.documentElement.style.setProperty('--color-primary', this.current.color);

    // Setup event listeners
    this.setupListeners();
  },

  setupListeners() {
    // Color picker
    document.getElementById('color-picker').addEventListener('input', (e) => {
      this.current.color = e.target.value;
      document.documentElement.style.setProperty('--color-primary', this.current.color);
      this.log(`Color changed to ${this.current.color}`);
    });

    // Font selector
    document.getElementById('font-select').addEventListener('change', (e) => {
      this.current.font = e.target.value;
      document.body.style.fontFamily = e.target.value;
      // Also set Google Font if needed
      if (e.target.value.includes('Share Tech Mono') || e.target.value.includes('VT323')) {
        const link = document.querySelector('link[href*="fonts.googleapis.com"]');
        if (link) {
          link.href = 'https://fonts.googleapis.com/css2?family=' +
            (e.target.value === 'Share Tech Mono' ? 'Share+Tech+Mono' :
             e.target.value === 'VT323' ? 'VT323' : '') + '&display=swap';
        }
      }
      this.log(`Font changed to ${this.current.font}`);
    });

    // Scanlines toggle
    document.getElementById('scanlines-checkbox').addEventListener('change', (e) => {
      this.current.scanlines = e.target.checked;
      const body = document.body;
      if (this.current.scanlines) {
        body.classList.add('crt');
        this.log('Scanlines enabled');
      } else {
        body.classList.remove('crt');
        this.log('Scanlines disabled');
      }
    });

    // Sound toggle
    document.getElementById('sound-checkbox').addEventListener('change', (e) => {
      this.current.sound = e.target.checked;
      this.log(`Sound ${e.target.checked ? 'enabled' : 'disabled'}`);
    });

    // Flicker toggle
    document.getElementById('flicker-checkbox').addEventListener('change', (e) => {
      this.current.flicker = e.target.checked;
      if (this.current.flicker) {
        document.body.classList.add('flicker-active');
        this.log('Screen flicker enabled');
      } else {
        document.body.classList.remove('flicker-active');
        this.log('Screen flicker disabled');
      }
    });

    // Settings panel toggles
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.toggleMenu(true);
    });

    document.getElementById('settings-close-btn').addEventListener('click', () => {
      this.toggleMenu(false);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('settings-menu');
      if (panel && !panel.contains(e.target) && e.target.id !== 'settings-btn') {
        this.toggleMenu(false);
      }
    });
  },

  toggleMenu(show) {
    const menu = document.getElementById('settings-menu');
    menu.classList.toggle('hidden', !show);
  },

  log(message) {
    // Add log entry if needed
    const log = document.getElementById('event-log');
    if (log) {
      const li = document.createElement('li');
      li.textContent = `[Settings] ${message}`;
      li.className = 'event-system';
      log.appendChild(li);
      log.scrollTop = log.scrollHeight;
    }
  }
};

// Initialize settings when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Settings.init());
} else {
  Settings.init();
}
