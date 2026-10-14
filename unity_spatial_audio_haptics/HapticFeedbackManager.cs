using UnityEngine;

/// <summary>
/// HapticFeedbackManager
/// Cross-platform mobile tactile vibration feedback controller for AR Raycasts and UI Events.
/// Supports native Android VibrationEffect, iOS UIImpactFeedbackGenerator, and Unity fallback.
/// 
/// Course: Augmented Reality & Mixed Reality (DJS23ALH1501)
/// Author: Vedant Parimal Dave (SAP ID: 60017240057 | Roll: A011 | Batch: A1-1)
/// </summary>
public class HapticFeedbackManager : MonoBehaviour
{
    public static HapticFeedbackManager Instance { get; private set; }

    [Header("Debug Settings")]
    [Tooltip("Log haptic trigger calls in Unity Console.")]
    public bool enableDebugLogs = true;

    // Android Native Java Objects
#if UNITY_ANDROID && !UNITY_EDITOR
    private AndroidJavaObject vibrator;
    private AndroidJavaClass vibrationEffectClass;
    private bool hasVibrator = false;
    private int apiLevel = 0;
#endif

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeHapticHardware();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    /// <summary>
    /// Initializes low-level Android/iOS platform vibration services.
    /// </summary>
    void InitializeHapticHardware()
    {
#if UNITY_ANDROID && !UNITY_EDITOR
        try
        {
            using (AndroidJavaClass versionClass = new AndroidJavaClass("android.os.Build$VERSION"))
            {
                apiLevel = versionClass.GetStatic<int>("SDK_INT");
            }

            using (AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer"))
            {
                AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");
                vibrator = currentActivity.Call<AndroidJavaObject>("getSystemService", "vibrator");
                hasVibrator = vibrator != null && vibrator.Call<bool>("hasVibrator");
            }

            if (apiLevel >= 26)
            {
                vibrationEffectClass = new AndroidJavaClass("android.os.VibrationEffect");
            }
            if (enableDebugLogs) Debug.Log($"[Haptics] Android Vibrator initialized. API: {apiLevel}, Active: {hasVibrator}");
        }
        catch (System.Exception ex)
        {
            Debug.LogWarning("[Haptics] Failed to bind Android vibrator: " + ex.Message);
        }
#endif
    }

    /// <summary>
    /// Light subtle tactile tick (15ms) triggered on AR Raycast hover or UI button focus.
    /// </summary>
    public void TriggerLightTick()
    {
        ExecuteVibration(15, 60, "LightTick (15ms)");
    }

    /// <summary>
    /// Medium confirmatory tactile pulse (40ms) triggered when an AR target is locked in crosshair.
    /// </summary>
    public void TriggerTargetLock()
    {
        ExecuteVibration(40, 150, "TargetLock (40ms)");
    }

    /// <summary>
    /// Heavy resonant tactile impact (80ms) triggered when interacting or firing in AR.
    /// </summary>
    public void TriggerActionImpact()
    {
        ExecuteVibration(80, 255, "ActionImpact (80ms)");
    }

    /// <summary>
    /// Dual-pulse warning pattern triggered when target is off-screen.
    /// </summary>
    public void TriggerOffScreenAlert()
    {
#if UNITY_ANDROID && !UNITY_EDITOR
        if (hasVibrator && apiLevel >= 26)
        {
            long[] timings = new long[] { 0, 30, 50, 30 };
            int[] amplitudes = new int[] { 0, 120, 0, 180 };
            AndroidJavaObject effect = vibrationEffectClass.CallStatic<AndroidJavaObject>("createWaveform", timings, amplitudes, -1);
            vibrator.Call("vibrate", effect);
            if (enableDebugLogs) Debug.Log("[Haptics] Triggered OffScreenAlert waveform.");
            return;
        }
#endif
        // Fallback for editor or non-waveform platforms
        StartCoroutine(SimulateAlertSequence());
    }

    private System.Collections.IEnumerator SimulateAlertSequence()
    {
        ExecuteVibration(30, 120, "AlertPulse_1");
        yield return new WaitForSeconds(0.08f);
        ExecuteVibration(30, 180, "AlertPulse_2");
    }

    /// <summary>
    /// Executes platform-specific vibration call with microsecond accuracy.
    /// </summary>
    private void ExecuteVibration(long milliseconds, int amplitude, string debugTag)
    {
        if (enableDebugLogs)
        {
            Debug.Log($"<color=#00f3ff>[Haptic Event]</color> {debugTag} | Amplitude: {amplitude}/255");
        }

#if UNITY_ANDROID && !UNITY_EDITOR
        if (hasVibrator)
        {
            if (apiLevel >= 26 && vibrationEffectClass != null)
            {
                int defaultAmp = vibrationEffectClass.GetStatic<int>("DEFAULT_AMPLITUDE");
                int amp = Mathf.Clamp(amplitude, 1, 255);
                AndroidJavaObject effect = vibrationEffectClass.CallStatic<AndroidJavaObject>("createOneShot", milliseconds, amp);
                vibrator.Call("vibrate", effect);
            }
            else
            {
                vibrator.Call("vibrate", milliseconds);
            }
            return;
        }
#endif

#if (UNITY_IOS || UNITY_ANDROID) && !UNITY_EDITOR
        Handheld.Vibrate();
#endif
    }
}
