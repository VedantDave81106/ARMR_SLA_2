using UnityEngine;

/// <summary>
/// SpatialAudioTargetGuide
/// Implements 3D Point-Source Spatial Audio guidance using HRTF to direct player attention
/// to off-screen AR targets in mobile Augmented Reality.
/// 
/// Course: Augmented Reality & Mixed Reality (DJS23ALH1501)
/// Author: Vedant Parimal Dave (SAP ID: 60017240057 | Roll: A011 | Batch: A1-1)
/// </summary>
[RequireComponent(typeof(AudioSource))]
public class SpatialAudioTargetGuide : MonoBehaviour
{
    [Header("Target & Camera References")]
    [Tooltip("The off-screen AR target object to track.")]
    public Transform targetTransform;
    [Tooltip("The AR Camera representing the player's head and audio listener.")]
    public Transform arCamera;

    [Header("Spatial Audio Settings")]
    [Tooltip("Enable Unity HRTF Spatializer SDK.")]
    public bool enableHRTF = true;
    [Tooltip("Minimum distance at which sound is at full volume (meters).")]
    public float minDistance = 1.0f;
    [Tooltip("Maximum audible distance (meters).")]
    public float maxDistance = 25.0f;
    [Tooltip("Rolloff factor for distance attenuation.")]
    [Range(0.1f, 5.0f)]
    public float rolloffFactor = 1.2f;

    [Header("Acoustic Head-Shadow Simulation (Low-Pass Filter)")]
    [Tooltip("Cutoff frequency when target is directly in front of player (Hz).")]
    public float frontCutoffFreq = 22000f;
    [Tooltip("Cutoff frequency when target is directly behind player (simulating pinna/head occlusion) (Hz).")]
    public float rearCutoffFreq = 2500f;

    [Header("Dynamic Beacon Pinging")]
    [Tooltip("Audio clip for the beacon ping sound.")]
    public AudioClip beaconClip;
    [Tooltip("Base interval between pings when off-screen (seconds).")]
    public float basePingInterval = 1.2f;
    [Tooltip("Fastest ping interval when nearing viewport alignment (seconds).")]
    public float minPingInterval = 0.3f;

    // Component references
    private AudioSource audioSource;
    private AudioLowPassFilter lowPassFilter;
    private float pingTimer = 0f;

    // Output telemetry
    public float CurrentDistance { get; private set; }
    public float CurrentAzimuthAngle { get; private set; }
    public bool IsInViewport { get; private set; }

    void Awake()
    {
        audioSource = GetComponent<AudioSource>();
        if (arCamera == null && Camera.main != null)
        {
            arCamera = Camera.main.transform;
        }

        // Add or retrieve low-pass filter for head-shadow simulation
        lowPassFilter = GetComponent<AudioLowPassFilter>();
        if (lowPassFilter == null)
        {
            lowPassFilter = gameObject.AddComponent<AudioLowPassFilter>();
        }

        ConfigureAudioSource();
    }

    /// <summary>
    /// Configures the AudioSource with HRTF 3D spatial properties and custom attenuation curves.
    /// </summary>
    void ConfigureAudioSource()
    {
        audioSource.spatialize = enableHRTF;
        audioSource.spatializePostEffects = true;
        audioSource.spatialBlend = 1.0f; // 100% 3D spatialization
        audioSource.rolloffMode = AudioRolloffMode.Custom;
        audioSource.minDistance = minDistance;
        audioSource.maxDistance = maxDistance;
        audioSource.dopplerLevel = 0.5f;

        // Construct 3D logarithmic inverse-distance attenuation curve
        AnimationCurve distanceCurve = new AnimationCurve();
        int samples = 25;
        for (int i = 0; i <= samples; i++)
        {
            float t = (float)i / samples;
            float d = Mathf.Lerp(minDistance, maxDistance, t);
            // Inverse distance attenuation model: Gain = minDistance / (minDistance + rolloff * (d - minDistance))
            float gain = minDistance / (minDistance + rolloffFactor * (d - minDistance));
            distanceCurve.AddKey(d / maxDistance, Mathf.Clamp01(gain));
        }

        audioSource.SetCustomCurve(AudioSourceCurveType.CustomRolloff, distanceCurve);
    }

    void Update()
    {
        if (targetTransform == null || arCamera == null) return;

        // Position audio source at target in 3D world space
        transform.position = targetTransform.position;

        // Vector from player head/camera to target
        Vector3 playerToTarget = targetTransform.position - arCamera.position;
        CurrentDistance = playerToTarget.magnitude;

        // Calculate horizontal relative azimuth angle (-180 to +180 deg)
        Vector3 forwardXZ = Vector3.ProjectOnPlane(arCamera.forward, Vector3.up).normalized;
        Vector3 targetXZ = Vector3.ProjectOnPlane(playerToTarget, Vector3.up).normalized;
        CurrentAzimuthAngle = Vector3.SignedAngle(forwardXZ, targetXZ, Vector3.up);

        // Check if target is inside camera viewport
        Vector3 viewportPoint = Camera.main.WorldToViewportPoint(targetTransform.position);
        IsInViewport = (viewportPoint.z > 0 &&
                        viewportPoint.x >= 0.05f && viewportPoint.x <= 0.95f &&
                        viewportPoint.y >= 0.05f && viewportPoint.y <= 0.95f);

        // Apply acoustic head-shadow filtering based on azimuth
        ApplyHeadShadowOcclusion(CurrentAzimuthAngle);

        // Handle dynamic beacon pinging
        HandleBeaconPinging();
    }

    /// <summary>
    /// Simulates anatomical head-shadow and pinna frequency filtering.
    /// Sounds behind the listener have higher frequencies attenuated.
    /// </summary>
    void ApplyHeadShadowOcclusion(float azimuth)
    {
        float absAzimuth = Mathf.Abs(azimuth); // 0 (front) to 180 (directly behind)
        float behindRatio = Mathf.Clamp01(absAzimuth / 180f);

        // Non-linear spectral rolloff simulating ear canal & head diffraction
        float targetCutoff = Mathf.Lerp(frontCutoffFreq, rearCutoffFreq, Mathf.Pow(behindRatio, 1.5f));
        lowPassFilter.cutoffFrequency = Mathf.Lerp(lowPassFilter.cutoffFrequency, targetCutoff, Time.deltaTime * 8f);
    }

    /// <summary>
    /// Modulates audio beacon frequency as player aligns orientation towards the target.
    /// </summary>
    void HandleBeaconPinging()
    {
        if (beaconClip == null) return;

        // Calculate angular alignment factor: 1.0 = perfectly facing, 0.0 = opposite direction
        float alignment = Mathf.Clamp01(1f - (Mathf.Abs(CurrentAzimuthAngle) / 180f));
        float currentInterval = Mathf.Lerp(basePingInterval, minPingInterval, alignment);

        pingTimer += Time.deltaTime;
        if (pingTimer >= currentInterval)
        {
            pingTimer = 0f;
            // Play pitch-modulated spatial ping
            audioSource.pitch = Mathf.Lerp(0.9f, 1.4f, alignment);
            audioSource.PlayOneShot(beaconClip, 0.8f);
        }
    }
}
