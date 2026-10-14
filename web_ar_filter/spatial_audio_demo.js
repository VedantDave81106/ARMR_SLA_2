/**
 * Spatial Audio Engine (Web Audio API)
 * Demonstrating HRTF vs Standard Stereo Panning & 3D Point-Source Attenuation
 * Author: Vedant Parimal Dave (ARMR SLA 2)
 */

class SpatialAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.panner = null;
    this.gainNode = null;
    this.azimuth = 90; // degrees
    this.distance = 3.0; // meters
    this.panningModel = 'HRTF';
    this.isOrbiting = false;
    this.orbitInterval = null;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    // Create 3D Panner Node
    this.panner = this.audioCtx.createPanner();
    this.panner.panningModel = this.panningModel;
    this.panner.distanceModel = 'inverse';
    this.panner.refDistance = 1;
    this.panner.maxDistance = 100;
    this.panner.rolloffFactor = 1.2;
    this.panner.coneInnerAngle = 360; // omnidirectional point-source

    // Master Gain
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0.6;

    // Connect panner -> master gain -> destination
    this.panner.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    // Setup listener orientation (Facing forward along -Z, Up along +Y)
    if (this.audioCtx.listener.positionX) {
      this.audioCtx.listener.positionX.value = 0;
      this.audioCtx.listener.positionY.value = 0;
      this.audioCtx.listener.positionZ.value = 0;
      this.audioCtx.listener.forwardX.value = 0;
      this.audioCtx.listener.forwardY.value = 0;
      this.audioCtx.listener.forwardZ.value = -1;
      this.audioCtx.listener.upX.value = 0;
      this.audioCtx.listener.upY.value = 1;
      this.audioCtx.listener.upZ.value = 0;
    } else {
      this.audioCtx.listener.setOrientation(0, 0, -1, 0, 1, 0);
    }

    this.update3DPosition();
  }

  update3DPosition() {
    if (!this.panner) return;
    // Convert Azimuth (deg) & Distance (m) to Cartesian Coordinates (X, Z)
    // 0 deg = Front (-Z), 90 deg = Right (+X), -90 deg = Left (-X), 180 deg = Behind (+Z)
    const rad = (this.azimuth * Math.PI) / 180;
    const x = this.distance * Math.sin(rad);
    const z = -this.distance * Math.cos(rad);
    const y = 0.2; // slight head height offset

    if (this.panner.positionX) {
      this.panner.positionX.setTargetAtTime(x, this.audioCtx.currentTime, 0.05);
      this.panner.positionY.setTargetAtTime(y, this.audioCtx.currentTime, 0.05);
      this.panner.positionZ.setTargetAtTime(z, this.audioCtx.currentTime, 0.05);
    } else {
      this.panner.setPosition(x, y, z);
    }

    // Update Radar Blip UI
    this.updateRadarUI(x, z);
  }

  updateRadarUI(x, z) {
    const radarBlip = document.getElementById('radarBlip');
    if (!radarBlip) return;
    // Map (-5m to +5m) to (-35px to +35px)
    const pxX = Math.max(-38, Math.min(38, (x / 5) * 35));
    const pxY = Math.max(-38, Math.min(38, (z / 5) * 35));
    radarBlip.style.transform = `translate(${pxX}px, ${pxY}px)`;
  }

  setAzimuth(deg) {
    this.azimuth = deg;
    this.update3DPosition();
  }

  setDistance(m) {
    this.distance = m;
    this.update3DPosition();
  }

  setPanningMode(mode) {
    this.panningModel = mode;
    if (this.panner) {
      this.panner.panningModel = mode;
    }
  }

  playSpatialPing(freq = 640, duration = 0.35) {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const env = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    // Subtle frequency modulation for radar beacon chirp
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.audioCtx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, this.audioCtx.currentTime + duration);

    env.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    env.gain.linearRampToValueAtTime(0.7, this.audioCtx.currentTime + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

    osc.connect(env);
    env.connect(this.panner);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playBeamAudio() {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const env = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2800, this.audioCtx.currentTime + 0.15);

    env.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
    env.gain.linearRampToValueAtTime(0.5, this.audioCtx.currentTime + 0.05);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.panner);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.45);
  }

  toggleOrbit() {
    if (this.isOrbiting) {
      clearInterval(this.orbitInterval);
      this.isOrbiting = false;
      return false;
    } else {
      this.isOrbiting = true;
      this.orbitInterval = setInterval(() => {
        let newAz = this.azimuth + 8;
        if (newAz > 180) newAz = -180;
        this.setAzimuth(newAz);
        const rng = document.getElementById('rngAzimuth');
        const lbl = document.getElementById('lblAzimuth');
        if (rng) rng.value = newAz;
        if (lbl) lbl.textContent = `${newAz}°`;
        this.playSpatialPing(520, 0.15);
      }, 350);
      return true;
    }
  }
}

window.spatialAudio = new SpatialAudioEngine();
