using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// ARRaycastInteraction
/// Manages user raycast selection, gaze dwell tracking, and multi-modal feedback triggers
/// (Spatial Audio ping modulation + Tactile vibration pulses) in Augmented Reality.
/// 
/// Course: Augmented Reality & Mixed Reality (DJS23ALH1501)
/// Author: Vedant Parimal Dave (SAP ID: 60017240057 | Roll: A011 | Batch: A1-1)
/// </summary>
public class ARRaycastInteraction : MonoBehaviour
{
    [Header("Raycast Configuration")]
    [Tooltip("Maximum raycast distance for AR interactive objects (meters).")]
    public float raycastDistance = 15.0f;
    [Tooltip("Layer mask for interactable AR entities.")]
    public LayerMask interactiveLayer;

    [Header("UI Reticle & Feedback Elements")]
    [Tooltip("Center screen crosshair / reticle image.")]
    public Image reticleImage;
    [Tooltip("Reticle default resting color.")]
    public Color normalColor = new Color(0f, 0.95f, 1f, 0.7f); // Neon Cyan
    [Tooltip("Reticle color when hovering over target.")]
    public Color hoverColor = new Color(1f, 0.7f, 0.0f, 1f);   // Amber
    [Tooltip("Reticle color when target is locked / selected.")]
    public Color lockedColor = new Color(1f, 0.0f, 0.5f, 1f);  // Magenta

    [Header("Dwell Selection Time")]
    [Tooltip("Time in seconds of steady gaze required to trigger selection.")]
    public float dwellTimeRequired = 1.0f;

    // Internal state
    private Camera arCamera;
    private GameObject currentHoverTarget = null;
    private float dwellTimer = 0f;
    private bool hasTriggeredLockHaptic = false;

    void Start()
    {
        arCamera = Camera.main;
        if (reticleImage != null)
        {
            reticleImage.color = normalColor;
        }
    }

    void Update()
    {
        PerformGazeRaycast();
        HandleTouchInput();
    }

    /// <summary>
    /// Performs a continuous forward raycast from center of AR camera viewport.
    /// </summary>
    void PerformGazeRaycast()
    {
        if (arCamera == null) return;

        Ray ray = new Ray(arCamera.transform.position, arCamera.transform.forward);
        RaycastHit hit;

        if (Physics.Raycast(ray, out hit, raycastDistance, interactiveLayer))
        {
            GameObject hitObj = hit.collider.gameObject;

            // Target Entry Event
            if (currentHoverTarget != hitObj)
            {
                currentHoverTarget = hitObj;
                dwellTimer = 0f;
                hasTriggeredLockHaptic = false;

                // 1. Subtle Haptic Tick on Raycast Enter
                if (HapticFeedbackManager.Instance != null)
                {
                    HapticFeedbackManager.Instance.TriggerLightTick();
                }

                // 2. Visual Reticle Feedback
                if (reticleImage != null) reticleImage.color = hoverColor;
            }

            // Gaze Dwell Accumulation
            dwellTimer += Time.deltaTime;
            float dwellProgress = Mathf.Clamp01(dwellTimer / dwellTimeRequired);

            // Scale Reticle while dwelling
            if (reticleImage != null)
            {
                float scale = Mathf.Lerp(1.0f, 1.35f, dwellProgress);
                reticleImage.transform.localScale = new Vector3(scale, scale, 1f);
            }

            // Dwell Selection Completed
            if (dwellProgress >= 1.0f && !hasTriggeredLockHaptic)
            {
                hasTriggeredLockHaptic = true;
                if (reticleImage != null) reticleImage.color = lockedColor;

                // Trigger Confirmatory Target Lock Haptic & Audio
                if (HapticFeedbackManager.Instance != null)
                {
                    HapticFeedbackManager.Instance.TriggerTargetLock();
                }

                ExecuteTargetSelection(currentHoverTarget);
            }
        }
        else
        {
            // Raycast Exited Target
            if (currentHoverTarget != null)
            {
                currentHoverTarget = null;
                dwellTimer = 0f;
                hasTriggeredLockHaptic = false;

                if (reticleImage != null)
                {
                    reticleImage.color = normalColor;
                    reticleImage.transform.localScale = Vector3.one;
                }
            }
        }
    }

    /// <summary>
    /// Handles direct touch raycast for mobile screens.
    /// </summary>
    void HandleTouchInput()
    {
        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);
            if (touch.phase == TouchPhase.Began)
            {
                Ray touchRay = arCamera.ScreenPointToRay(touch.position);
                RaycastHit hit;

                if (Physics.Raycast(touchRay, out hit, raycastDistance, interactiveLayer))
                {
                    if (HapticFeedbackManager.Instance != null)
                    {
                        HapticFeedbackManager.Instance.TriggerActionImpact();
                    }
                    ExecuteTargetSelection(hit.collider.gameObject);
                }
            }
        }
    }

    void ExecuteTargetSelection(GameObject target)
    {
        Debug.Log($"<color=#00f59b>[Target Selected]</color> {target.name} confirmed via multi-sensory raycast!");
        // Notify target or perform game action
        target.SendMessage("OnTargetSelected", SendMessageOptions.DontRequireReceiver);
    }
}
