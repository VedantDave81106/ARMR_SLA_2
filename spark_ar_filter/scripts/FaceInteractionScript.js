/**
 * Meta Spark AR Studio - Face Interaction Script
 * Project: ARMR Self Learning Assignment 2
 * Author: Vedant Parimal Dave
 * SAP ID: 60017240057 | Roll: A011 | Batch: A1-1
 *
 * Description:
 * Reactive scripting graph for facial landmark anchoring:
 * 1. Forehead Anchor: 3D Holographic Horns/Crown with 3-axis rotation sync
 * 2. Eye Landmark Anchor: Cyber Visor with blink toggle logic
 * 3. Mouth Landmark Anchor: Plasma beam & sound trigger on mouth open
 */

const Scene = require('Scene');
const FaceTracking = require('FaceTracking');
const Reactive = require('Reactive');
const Audio = require('Audio');
const Diagnostics = require('Diagnostics');

(async function () {
  try {
    // 1. Locate Face 0 in the Scene Tree
    const face = FaceTracking.face(0);

    // 2. Fetch 2D and 3D Anchor Objects from Scene
    const [cyberCrown, cyberVisor, mouthBeamEmitter, mouthAudioController] = await Promise.all([
      Scene.root.findFirst('CyberCrown3D'),
      Scene.root.findFirst('CyberVisorHUD'),
      Scene.root.findFirst('MouthBeamParticles'),
      Audio.getAudioPlaybackController('MouthBeamAudioController')
    ]);

    Diagnostics.log('Face tracking elements successfully bound.');

    // -------------------------------------------------------------
    // ANCHOR 1: FOREHEAD / HEAD ROTATION TRACKING (CO3)
    // -------------------------------------------------------------
    // Bind 3D crown position to forehead landmark and mirror head rotation
    if (cyberCrown) {
      // Forehead coordinate is derived from face 3D transform with vertical offset
      cyberCrown.transform.position = face.cameraTransform.position.add(Reactive.point(0, 0.08, 0));
      cyberCrown.transform.rotationX = face.cameraTransform.rotationX;
      cyberCrown.transform.rotationY = face.cameraTransform.rotationY;
      cyberCrown.transform.rotationZ = face.cameraTransform.rotationZ;
    }

    // -------------------------------------------------------------
    // ANCHOR 2: EYE ANCHORS & BLINK TRIGGER (CO3)
    // -------------------------------------------------------------
    if (cyberVisor) {
      // Visor sits across bridge of nose / eyes
      cyberVisor.transform.position = face.cameraTransform.position.add(Reactive.point(0, 0.03, 0.02));
      cyberVisor.transform.rotationZ = face.cameraTransform.rotationZ;

      // Detect Eye Blinks using reactive signals
      const leftBlink = face.leftEye.blink;
      const rightBlink = face.rightEye.blink;
      const anyBlink = Reactive.or(leftBlink, rightBlink);

      // On blink: Scale up visor laser glow
      const visorScale = Reactive.val(anyBlink).ifThenElse(
        Reactive.vector(1.15, 1.15, 1.15),
        Reactive.vector(1.0, 1.0, 1.0)
      );
      cyberVisor.transform.scale = visorScale;
    }

    // -------------------------------------------------------------
    // ANCHOR 3: MOUTH OPEN TRIGGER & AUDIO DISPATCH (CO3, CO4)
    // -------------------------------------------------------------
    const mouthOpenness = face.mouth.openness; // Signal: 0.0 (closed) to 1.0 (wide open)
    const MOUTH_THRESHOLD = 0.35;
    const isMouthWideOpen = mouthOpenness.gt(MOUTH_THRESHOLD);

    if (mouthBeamEmitter) {
      // Position mouth emitter at mouth landmark
      mouthBeamEmitter.transform.position = face.cameraTransform.position.add(Reactive.point(0, -0.04, 0.01));
      
      // Control particle birthrate dynamically based on openness
      mouthBeamEmitter.birthrate = Reactive.val(isMouthWideOpen).ifThenElse(
        Reactive.val(60),
        Reactive.val(0)
      );
    }

    // Trigger audio playback controller when mouth opens
    if (mouthAudioController) {
      isMouthWideOpen.onOn().subscribe(() => {
        Diagnostics.log('Mouth Open Trigger: Firing Spatial Energy Beam Audio!');
        mouthAudioController.reset();
        mouthAudioController.setPlaying(true);
      });

      isMouthWideOpen.onOff().subscribe(() => {
        mouthAudioController.setPlaying(false);
      });
    }

  } catch (error) {
    Diagnostics.error('Initialization error in FaceInteractionScript: ' + error);
  }
})();
