/**
 * Main WebAR Application Controller
 * Interactive Face Tracking Filter & Multi-Sensory Spatial Audio/Haptic Integration
 * Author: Vedant Parimal Dave (ARMR SLA 2)
 */

(function () {
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('arCanvas');
  const ctx = canvas.getContext('2d');

  // UI Elements
  const trackingDot = document.getElementById('trackingDot');
  const trackingStatus = document.getElementById('trackingStatus');
  const fpsDisplay = document.getElementById('fpsDisplay');
  const pillMouth = document.getElementById('pillMouth');
  const valMouth = document.getElementById('valMouth');
  const pillBlink = document.getElementById('pillBlink');
  const valBlink = document.getElementById('valBlink');
  const pillTilt = document.getElementById('pillTilt');
  const valTilt = document.getElementById('valTilt');

  // Metrics
  const metricPitch = document.getElementById('metricPitch');
  const metricYaw = document.getElementById('metricYaw');
  const metricRoll = document.getElementById('metricRoll');

  // Checkboxes
  const chkCyberVisor = document.getElementById('chkCyberVisor');
  const chkCrown = document.getElementById('chkCrown');
  const chkMouthBeam = document.getElementById('chkMouthBeam');
  const chkFaceMesh = document.getElementById('chkFaceMesh');

  // Buttons
  const btnToggleCam = document.getElementById('btnToggleCam');
  const btnSimulateFace = document.getElementById('btnSimulateFace');
  const btnSwitchEffect = document.getElementById('btnSwitchEffect');
  const btnTriggerAudio = document.getElementById('btnTriggerAudio');

  // State Variables
  let isCameraRunning = false;
  let isSimulating = false;
  let simulationTimer = 0;
  let faceMeshInstance = null;
  let cameraInstance = null;
  let lastFrameTime = performance.now();
  let frameCount = 0;
  let currentFps = 0;
  let activeThemeIndex = 0;
  const themes = [
    { primary: '#00f3ff', secondary: '#ff007f', accent: '#ffb703' }, // Cyberpunk Neon
    { primary: '#00f59b', secondary: '#0070f3', accent: '#ff0055' }, // Bio-Matrix Emerald
    { primary: '#ff3366', secondary: '#ffea00', accent: '#9d4edd' }  // Solar Flare
  ];

  let mouthOpenTriggered = false;
  let blinkTriggered = false;
  let beamParticles = [];

  // Initialize Canvas Resolution
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth || 640;
    canvas.height = canvas.parentElement.clientHeight || 480;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Tab Navigation Handling
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.getAttribute('data-tab'));
      if (target) target.classList.add('active');
    });
  });

  // Spatial Audio & Haptics UI Event Listeners
  const rngAzimuth = document.getElementById('rngAzimuth');
  const lblAzimuth = document.getElementById('lblAzimuth');
  if (rngAzimuth && lblAzimuth) {
    rngAzimuth.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      lblAzimuth.textContent = `${val}°`;
      window.spatialAudio.setAzimuth(val);
      window.spatialAudio.playSpatialPing(600, 0.12);
    });
  }

  const rngDistance = document.getElementById('rngDistance');
  const lblDistance = document.getElementById('lblDistance');
  if (rngDistance && lblDistance) {
    rngDistance.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      lblDistance.textContent = `${val.toFixed(1)} m`;
      window.spatialAudio.setDistance(val);
    });
  }

  document.querySelectorAll('input[name="panningMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      window.spatialAudio.setPanningMode(e.target.value);
      window.spatialAudio.playSpatialPing(700, 0.2);
    });
  });

  const btnOrbitSound = document.getElementById('btnOrbitSound');
  if (btnOrbitSound) {
    btnOrbitSound.addEventListener('click', () => {
      const orbiting = window.spatialAudio.toggleOrbit();
      btnOrbitSound.textContent = orbiting ? 'Stop 360° Sound Orbit' : 'Toggle 360° Sound Orbit';
      btnOrbitSound.classList.toggle('btn-accent', orbiting);
    });
  }

  document.querySelectorAll('.haptic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pattern = btn.getAttribute('data-pattern');
      window.haptics.trigger(pattern);
      window.spatialAudio.playSpatialPing(300 + Math.random() * 400, 0.1);
    });
  });

  btnTriggerAudio.addEventListener('click', () => {
    window.spatialAudio.playSpatialPing(680, 0.3);
    window.haptics.trigger('medium');
  });

  btnSwitchEffect.addEventListener('click', () => {
    activeThemeIndex = (activeThemeIndex + 1) % themes.length;
    btnSwitchEffect.style.borderColor = themes[activeThemeIndex].primary;
    window.haptics.trigger('light');
  });

  // Calculate FPS
  function updateFPS() {
    const now = performance.now();
    frameCount++;
    if (now - lastFrameTime >= 1000) {
      currentFps = frameCount;
      frameCount = 0;
      lastFrameTime = now;
      fpsDisplay.textContent = `FPS: ${currentFps}`;
    }
  }

  // MediaPipe FaceMesh Initialization
  function initMediaPipe() {
    if (typeof FaceMesh === 'undefined') {
      console.warn('FaceMesh library not yet loaded from CDN. Will retry or use simulation.');
      return;
    }

    faceMeshInstance = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMeshInstance.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMeshInstance.onResults(onFaceMeshResults);
  }

  // Camera Toggle
  btnToggleCam.addEventListener('click', async () => {
    if (isCameraRunning) {
      stopCamera();
    } else {
      if (isSimulating) stopSimulation();
      await startCamera();
    }
  });

  // Synthetic Face Simulation Toggle
  btnSimulateFace.addEventListener('click', () => {
    if (isSimulating) {
      stopSimulation();
    } else {
      if (isCameraRunning) stopCamera();
      startSimulation();
    }
  });

  async function startCamera() {
    trackingStatus.textContent = 'Requesting Camera...';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      video.srcObject = stream;
      await video.play();

      isCameraRunning = true;
      btnToggleCam.textContent = 'Stop Webcam';
      btnToggleCam.classList.add('btn-secondary');
      btnToggleCam.classList.remove('btn-primary');
      trackingDot.classList.add('active');
      trackingStatus.textContent = 'Tracking Active';

      if (!faceMeshInstance) initMediaPipe();

      if (typeof Camera !== 'undefined' && faceMeshInstance) {
        cameraInstance = new Camera(video, {
          onFrame: async () => {
            if (isCameraRunning) await faceMeshInstance.send({ image: video });
          },
          width: 640,
          height: 480
        });
        cameraInstance.start();
      } else {
        requestAnimationFrame(processCameraFrameManual);
      }
    } catch (err) {
      console.error('Camera access denied or failed:', err);
      trackingStatus.textContent = 'Camera Denied - Using Simulation';
      startSimulation();
    }
  }

  function stopCamera() {
    isCameraRunning = false;
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    if (cameraInstance) {
      cameraInstance.stop();
      cameraInstance = null;
    }
    btnToggleCam.textContent = 'Start Webcam';
    btnToggleCam.classList.remove('btn-secondary');
    btnToggleCam.classList.add('btn-primary');
    trackingDot.classList.remove('active');
    trackingStatus.textContent = 'Camera Stopped';
  }

  function startSimulation() {
    isSimulating = true;
    btnSimulateFace.textContent = 'Stop Simulation';
    btnSimulateFace.classList.add('btn-accent');
    trackingDot.classList.add('active');
    trackingStatus.textContent = 'Synthetic Face Simulation Mode';
    requestAnimationFrame(renderSimulationLoop);
  }

  function stopSimulation() {
    isSimulating = false;
    btnSimulateFace.textContent = 'Simulated Face Demo';
    btnSimulateFace.classList.remove('btn-accent');
    trackingDot.classList.remove('active');
    trackingStatus.textContent = 'Simulation Stopped';
  }

  async function processCameraFrameManual() {
    if (!isCameraRunning) return;
    if (faceMeshInstance && video.readyState >= 2) {
      await faceMeshInstance.send({ image: video });
    }
    requestAnimationFrame(processCameraFrameManual);
  }

  // Real-time Facial Tracking Logic
  function onFaceMeshResults(results) {
    if (!isCameraRunning) return;
    updateFPS();
    resizeCanvas();

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Video Feed mirrored
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      processLandmarksAndRender(landmarks);
    } else {
      trackingStatus.textContent = 'Searching for face...';
    }

    ctx.restore();
  }

  // Simulation Render Loop (Fallback & Demo Mode)
  function renderSimulationLoop() {
    if (!isSimulating) return;
    updateFPS();
    resizeCanvas();
    simulationTimer += 0.04;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark cyber backdrop
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0a0e17');
    grad.addColorStop(1, '#151e33');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Synthetic head oscillations
    const centerX = canvas.width / 2 + Math.sin(simulationTimer * 0.8) * 35;
    const centerY = canvas.height / 2 + Math.cos(simulationTimer * 0.6) * 20;
    const roll = Math.sin(simulationTimer * 0.9) * 14; // roll in deg
    const yaw = Math.sin(simulationTimer * 0.7) * 18;  // yaw in deg
    const pitch = Math.cos(simulationTimer * 0.5) * 10;

    // Periodic mouth opening cycle
    const mouthCycle = (Math.sin(simulationTimer * 1.5) + 1) / 2; // 0 to 1
    const mouthOpen = mouthCycle > 0.65 ? (mouthCycle - 0.65) * 2.8 : 0;

    // Periodic eye blink cycle
    const blinkCycle = Math.sin(simulationTimer * 2.2);
    const isBlinking = blinkCycle > 0.88;

    // Build synthetic landmarks mapping
    const synthLandmarks = generateSyntheticLandmarks(centerX, centerY, roll, yaw, pitch, mouthOpen, isBlinking);
    processLandmarksAndRender(synthLandmarks, true);

    ctx.restore();
    requestAnimationFrame(renderSimulationLoop);
  }

  // Generate Synthetic Facial Mesh Points
  function generateSyntheticLandmarks(cx, cy, rollDeg, yawDeg, pitchDeg, mouthOpenFactor, isBlinking) {
    const rad = (rollDeg * Math.PI) / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);

    function rotatePoint(x, y) {
      return {
        x: (cx + (x * cosR - y * sinR)) / canvas.width,
        y: (cy + (x * sinR + y * cosR)) / canvas.height,
        z: 0
      };
    }

    const scale = Math.min(canvas.width, canvas.height) * 0.35;
    const yawOffset = (yawDeg / 45) * 25;
    const pitchOffset = (pitchDeg / 30) * 20;

    return {
      forehead: rotatePoint(yawOffset, -scale * 0.85 + pitchOffset),
      noseTip: rotatePoint(yawOffset * 1.3, -scale * 0.1 + pitchOffset),
      chin: rotatePoint(yawOffset * 0.7, scale * 0.85 + pitchOffset),
      leftEyeOuter: rotatePoint(-scale * 0.45 + yawOffset, -scale * 0.35 + pitchOffset),
      leftEyeInner: rotatePoint(-scale * 0.15 + yawOffset, -scale * 0.35 + pitchOffset),
      rightEyeInner: rotatePoint(scale * 0.15 + yawOffset, -scale * 0.35 + pitchOffset),
      rightEyeOuter: rotatePoint(scale * 0.45 + yawOffset, -scale * 0.35 + pitchOffset),
      upperLip: rotatePoint(yawOffset, scale * 0.28 + pitchOffset),
      lowerLip: rotatePoint(yawOffset, scale * (0.32 + mouthOpenFactor * 0.3) + pitchOffset),
      isSim: true,
      roll: rollDeg,
      yaw: yawDeg,
      pitch: pitchDeg,
      mouthOpen: mouthOpenFactor,
      isBlinking: isBlinking
    };
  }

  // Main Processing & Rendering Logic
  function processLandmarksAndRender(lm, isSynthetic = false) {
    let pForehead, pNose, pChin, pLeftEye, pRightEye, pUpperLip, pLowerLip;
    let roll = 0, yaw = 0, pitch = 0, mouthRatio = 0, isBlinking = false;

    if (isSynthetic) {
      pForehead = toScreen(lm.forehead);
      pNose = toScreen(lm.noseTip);
      pChin = toScreen(lm.chin);
      pLeftEye = toScreen(lm.leftEyeOuter);
      pRightEye = toScreen(lm.rightEyeOuter);
      pUpperLip = toScreen(lm.upperLip);
      pLowerLip = toScreen(lm.lowerLip);

      roll = lm.roll;
      yaw = lm.yaw;
      pitch = lm.pitch;
      mouthRatio = lm.mouthOpen;
      isBlinking = lm.isBlinking;
    } else {
      // MediaPipe Landmark Indices:
      // 10: Forehead center, 1: Nose tip, 152: Chin, 33: Right eye outer, 263: Left eye outer
      // 13: Upper lip center, 14: Lower lip center, 159/145: Right eye top/bottom, 386/374: Left eye top/bottom
      pForehead = toScreen(lm[10]);
      pNose = toScreen(lm[1]);
      pChin = toScreen(lm[152]);
      pRightEye = toScreen(lm[33]);
      pLeftEye = toScreen(lm[263]);
      pUpperLip = toScreen(lm[13]);
      pLowerLip = toScreen(lm[14]);

      // Calculate Roll (Head Tilt) from eye angles
      const dX = pLeftEye.x - pRightEye.x;
      const dY = pLeftEye.y - pRightEye.y;
      roll = (Math.atan2(dY, dX) * 180) / Math.PI;

      // Face height normalization
      const faceHeight = Math.hypot(pChin.x - pForehead.x, pChin.y - pForehead.y) || 1;

      // Mouth Open Ratio (Distance between upper and lower lip relative to face height)
      const mouthDist = Math.hypot(pLowerLip.x - pUpperLip.x, pLowerLip.y - pUpperLip.y);
      mouthRatio = mouthDist / faceHeight;

      // Calculate Yaw & Pitch
      const eyeMidX = (pLeftEye.x + pRightEye.x) / 2;
      yaw = ((pNose.x - eyeMidX) / (faceHeight * 0.5)) * 45;
      const eyeMidY = (pLeftEye.y + pRightEye.y) / 2;
      pitch = ((pNose.y - eyeMidY) / (faceHeight * 0.3) - 0.7) * 35;

      // Eye Aspect Ratio (EAR) for blink detection
      const rEyeH = Math.hypot(toScreen(lm[159]).x - toScreen(lm[145]).x, toScreen(lm[159]).y - toScreen(lm[145]).y);
      const lEyeH = Math.hypot(toScreen(lm[386]).x - toScreen(lm[374]).x, toScreen(lm[386]).y - toScreen(lm[374]).y);
      const ear = (rEyeH + lEyeH) / (2 * faceHeight);
      isBlinking = ear < 0.022;
    }

    // Update HUD Metrics
    metricPitch.textContent = `${pitch.toFixed(1)}°`;
    metricYaw.textContent = `${yaw.toFixed(1)}°`;
    metricRoll.textContent = `${roll.toFixed(1)}°`;
    valTilt.textContent = `${roll.toFixed(0)}°`;

    // 1. Mouth Open Trigger Evaluation
    const mouthThreshold = isSynthetic ? 0.35 : 0.075;
    const isMouthOpen = mouthRatio > mouthThreshold;
    valMouth.textContent = `${Math.min(100, Math.round((mouthRatio / (mouthThreshold * 2)) * 100))}%`;

    if (isMouthOpen) {
      pillMouth.classList.add('triggered');
      if (!mouthOpenTriggered) {
        mouthOpenTriggered = true;
        window.spatialAudio.playBeamAudio();
        window.haptics.trigger('heavy');
      }
    } else {
      pillMouth.classList.remove('triggered');
      mouthOpenTriggered = false;
    }

    // 2. Blink Trigger Evaluation
    if (isBlinking) {
      pillBlink.classList.add('triggered');
      valBlink.textContent = 'BLINK!';
      if (!blinkTriggered) {
        blinkTriggered = true;
        window.haptics.trigger('light');
        window.spatialAudio.playSpatialPing(880, 0.08);
      }
    } else {
      pillBlink.classList.remove('triggered');
      valBlink.textContent = 'OPEN';
      blinkTriggered = false;
    }

    // 3. Render AR Visual Elements
    const curTheme = themes[activeThemeIndex];

    // Optional 3D Face Wireframe
    if (chkFaceMesh.checked && !isSynthetic) {
      drawFaceWireframe(lm, curTheme.primary);
    }

    // 3D Holographic Horns / Cyber Crown on Forehead
    if (chkCrown.checked) {
      drawHolographicCrown(pForehead, pLeftEye, pRightEye, roll, curTheme);
    }

    // Cybernetic Visor / Glasses on Eyes
    if (chkCyberVisor.checked) {
      drawCyberVisor(pLeftEye, pRightEye, pNose, roll, isBlinking, curTheme);
    }

    // Plasma Beam & Particles on Mouth Open
    if (chkMouthBeam.checked && isMouthOpen) {
      drawMouthEnergyBeam(pUpperLip, pLowerLip, roll, curTheme);
    }

    // Update ongoing particles
    updateAndDrawParticles();
  }

  function toScreen(pt) {
    return {
      x: pt.x * canvas.width,
      y: pt.y * canvas.height
    };
  }

  // Draw Cyber Visor HUD over eyes
  function drawCyberVisor(pL, pR, pNose, rollDeg, blinking, theme) {
    ctx.save();
    const midX = (pL.x + pR.x) / 2;
    const midY = (pL.y + pR.y) / 2;
    const eyeDist = Math.hypot(pR.x - pL.x, pR.y - pL.y);

    ctx.translate(midX, midY);
    ctx.rotate((rollDeg * Math.PI) / 180);

    const w = eyeDist * 1.5;
    const h = eyeDist * 0.45;

    // Glowing Visor Shield
    ctx.fillStyle = blinking ? 'rgba(255, 0, 127, 0.45)' : 'rgba(0, 243, 255, 0.2)';
    ctx.strokeStyle = blinking ? theme.secondary : theme.primary;
    ctx.lineWidth = 3;
    ctx.shadowColor = blinking ? theme.secondary : theme.primary;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(w / 2, -h / 2);
    ctx.lineTo(w * 0.45, h / 2);
    ctx.lineTo(0, h * 0.7);
    ctx.lineTo(-w * 0.45, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crosshairs & Reticles
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.5;
    [-w * 0.28, w * 0.28].forEach(offsetX => {
      ctx.beginPath();
      ctx.arc(offsetX, 0, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(offsetX - 20, 0); ctx.lineTo(offsetX + 20, 0);
      ctx.moveTo(offsetX, -20); ctx.lineTo(offsetX, 20);
      ctx.stroke();
    });

    ctx.restore();
  }

  // Draw Holographic Crown / Horns on Forehead
  function drawHolographicCrown(pForehead, pL, pR, rollDeg, theme) {
    ctx.save();
    const eyeDist = Math.hypot(pR.x - pL.x, pR.y - pL.y);
    ctx.translate(pForehead.x, pForehead.y);
    ctx.rotate((rollDeg * Math.PI) / 180);

    ctx.strokeStyle = theme.primary;
    ctx.fillStyle = theme.secondary;
    ctx.lineWidth = 3;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 15;

    const span = eyeDist * 0.8;
    const height = eyeDist * 0.9;

    // Left Horn
    ctx.beginPath();
    ctx.moveTo(-span * 0.3, 0);
    ctx.quadraticCurveTo(-span * 0.9, -height * 0.5, -span * 0.7, -height);
    ctx.quadraticCurveTo(-span * 0.4, -height * 0.4, -span * 0.1, 0);
    ctx.stroke();

    // Right Horn
    ctx.beginPath();
    ctx.moveTo(span * 0.3, 0);
    ctx.quadraticCurveTo(span * 0.9, -height * 0.5, span * 0.7, -height);
    ctx.quadraticCurveTo(span * 0.4, -height * 0.4, span * 0.1, 0);
    ctx.stroke();

    // Center Crystal Gem
    ctx.beginPath();
    ctx.moveTo(0, -height * 0.45);
    ctx.lineTo(12, -height * 0.25);
    ctx.lineTo(0, -height * 0.05);
    ctx.lineTo(-12, -height * 0.25);
    ctx.closePath();
    ctx.fillStyle = theme.accent;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Draw Mouth Plasma Energy Beam
  function drawMouthEnergyBeam(pUpper, pLower, rollDeg, theme) {
    const mouthMidX = (pUpper.x + pLower.x) / 2;
    const mouthMidY = (pUpper.y + pLower.y) / 2;

    ctx.save();
    ctx.translate(mouthMidX, mouthMidY);
    ctx.rotate((rollDeg * Math.PI) / 180);

    // Glowing core
    const coreGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, theme.secondary);
    coreGrad.addColorStop(1, 'rgba(255, 0, 127, 0)');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fill();

    // Shockwave Rings
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 3;
    ctx.shadowColor = theme.secondary;
    ctx.shadowBlur = 20;

    const pulseSize = 25 + Math.sin(performance.now() * 0.02) * 10;
    ctx.beginPath();
    ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // Spawn Particles
    for (let i = 0; i < 4; i++) {
      beamParticles.push({
        x: mouthMidX + (Math.random() - 0.5) * 20,
        y: mouthMidY + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 8, // downward/forward surge
        life: 1.0,
        color: Math.random() > 0.5 ? theme.primary : theme.secondary,
        size: 3 + Math.random() * 5
      });
    }
  }

  function updateAndDrawParticles() {
    for (let i = beamParticles.length - 1; i >= 0; i--) {
      const p = beamParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;

      if (p.life <= 0) {
        beamParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw Face Wireframe Contour
  function drawFaceWireframe(landmarks, color) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
    ctx.lineWidth = 1;

    // Key facial oval landmarks
    const ovalIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
    ctx.beginPath();
    for (let i = 0; i < ovalIndices.length; i++) {
      const pt = toScreen(landmarks[ovalIndices[i]]);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Initial State: Start with Simulation so page is immediately active and visually responsive!
  setTimeout(() => {
    startSimulation();
  }, 400);

})();
