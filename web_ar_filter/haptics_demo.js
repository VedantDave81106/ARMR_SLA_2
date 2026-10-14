/**
 * Tactile Haptic Feedback Controller (Web Vibration API & Visualizer)
 * Author: Vedant Parimal Dave (ARMR SLA 2)
 */

class HapticController {
  constructor() {
    this.isSupported = 'vibrate' in navigator;
    this.vibrationBar = null;
    this.hapticPill = null;
    this.hapticVal = null;
    this.pulseTimeout = null;
  }

  init() {
    this.vibrationBar = document.getElementById('vibrationBar');
    this.hapticPill = document.getElementById('pillHaptic');
    this.hapticVal = document.getElementById('valHaptic');
  }

  trigger(type = 'light') {
    if (!this.vibrationBar) this.init();

    let pattern = [20];
    let intensityLabel = 'LIGHT (15ms)';
    let barWidth = '30%';

    switch (type) {
      case 'light':
        pattern = [15];
        intensityLabel = 'TICK (15ms)';
        barWidth = '35%';
        break;
      case 'medium':
        pattern = [40];
        intensityLabel = 'CONFIRM (40ms)';
        barWidth = '65%';
        break;
      case 'heavy':
        pattern = [80];
        intensityLabel = 'IMPACT (80ms)';
        barWidth = '100%';
        break;
      case 'warning':
        pattern = [40, 60, 40];
        intensityLabel = 'WARN (40/60/40)';
        barWidth = '85%';
        break;
    }

    // Trigger Mobile Hardware Haptic if supported
    if (this.isSupported) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Vibration API blocked or unavailable:', e);
      }
    }

    // Visual Actuator Feedback (For Desktop Video Demo & Mobile Screen)
    if (this.vibrationBar) {
      this.vibrationBar.style.width = barWidth;
      clearTimeout(this.pulseTimeout);
      this.pulseTimeout = setTimeout(() => {
        if (this.vibrationBar) this.vibrationBar.style.width = '0%';
      }, 200);
    }

    if (this.hapticPill && this.hapticVal) {
      this.hapticPill.classList.add('triggered');
      this.hapticVal.textContent = intensityLabel;
      setTimeout(() => {
        if (this.hapticPill) this.hapticPill.classList.remove('triggered');
        if (this.hapticVal) this.hapticVal.textContent = 'IDLE';
      }, 500);
    }
  }
}

window.haptics = new HapticController();
