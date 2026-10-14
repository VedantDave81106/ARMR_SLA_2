# ARMR SELF LEARNING ASSIGNMENT  2
### Spatial Audio Integration, Haptic Feedback & Social AR Interactive Filter Design

**Student Name:** Vedant Parimal Dave  
**SAP ID:** 60017240057  
**Roll No.:** A011  
**Batch:** A1-1  
**Subject:** Augmented Reality and Mixed Reality (DJS23ALH1501)  
**Target Outcomes:** CO3, CO4  

---

## 📌 Deliverables Overview

| Requirement | Deliverable File / Directory | Description |
| :--- | :--- | :--- |
| **Part A: Social AR Filter Package** | [`spark_ar_filter/FaceInteractionFilter.arexport`](file:///spark_ar_filter/FaceInteractionFilter.arexport) & [`web_ar_filter/`](file:///web_ar_filter/) | Exported Meta Spark AR filter package + Live browser-based WebAR face tracking filter. |
| **Part B: System Design Document** | [`ARMR_SLA_2_REPORT.md`](file:///ARMR_SLA_2_REPORT.md) & [`ARMR_SLA_2_REPORT.html`](file:///ARMR_SLA_2_REPORT.html) | 2–3 page comprehensive technical report on HRTF vs. Stereo Panning, Attenuation curves, and Haptics. |
| **Part C: 5-Minute Video Pitch** | [`VIDEO_PITCH_SCRIPT_AND_INSTRUCTIONS.md`](file:///VIDEO_PITCH_SCRIPT_AND_INSTRUCTIONS.md) | Timed, minute-by-minute instructions and word-for-word presentation script for video recording. |
| **Unity Spatial Audio Architecture** | [`unity_spatial_audio_haptics/`](file:///unity_spatial_audio_haptics/) | Production Unity C# scripts (`SpatialAudioTargetGuide.cs`, `HapticFeedbackManager.cs`, `ARRaycastInteraction.cs`). |

---

## 🚀 Quick Start: Running the Interactive WebAR Filter

No heavy software or Unity installation is required to run and test this project!

### Option 1: Using Node.js (Recommended)
1. In the project root directory, run:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option 2: Direct File Open
Double click [`web_ar_filter/index.html`](file:///web_ar_filter/index.html) in any modern browser (Google Chrome, Microsoft Edge, Safari, or Firefox).

---

## 🎮 Interactive Features & Interaction Mechanics

### 1. Part A: Face Tracking & Gestures (CO3)
- **Forehead Anchor:** 3D Holographic Crown rotating in real time with head Pitch, Yaw, and Roll.
- **Eye Anchor:** Cybernetic Visor HUD with real-time Eye Aspect Ratio (EAR) blink detection.
- **Mouth Open Trigger:** Mouth opening distance ($> 35\%$) triggers a high-energy plasma beam, animated particle shockwave, spatial sound, and haptic rumble.
- **Simulation Mode:** Includes a built-in *Simulated Face Demo* that allows testing and presenting all interactions without webcam requirements.

### 2. Part B: HRTF 3D Spatial Audio & Off-Screen Guidance (CO4)
- **HRTF vs. Stereo Panning:** Live toggle comparing true binaural Head-Related Transfer Functions against basic equal-power stereo panning.
- **Off-Screen Radar & 360° Orbit:** Audio source orbits around the player's head, simulating Interaural Time Difference (ITD), Interaural Level Difference (ILD), and spectral pinna filtering to guide player attention toward targets outside the viewport.
- **Inverse Distance Attenuation:** Implements $\text{Gain}(d) = \frac{d_{\min}}{d_{\min} + \alpha(d - d_{\min})}$ with head-shadow low-pass filtering.

### 3. Part B: Mobile Tactile Haptics (CO4)
- **Web Vibration API & Android/iOS:** Triggers authentic tactile signatures for raycast hovering ($15\text{ ms}$ tick), target lock confirmation ($40\text{ ms}$), energy blast impact ($80\text{ ms}$), and off-screen alert waveforms.
- **Visual Actuator Visualizer:** Live HUD indicator for desktop demonstration and screen recording.

---

## 📁 Repository Directory Structure

```
ARMR_SLA_2/
├── README.md                                  # Repository overview and quick start guide
├── package.json                               # Node.js project specification
├── server.js                                  # Zero-dependency local HTTP server
├── ARMR_SLA_2_REPORT.md                       # Comprehensive Technical Report (Markdown)
├── ARMR_SLA_2_REPORT.html                     # Styled Report (Press Ctrl+P to export to PDF)
├── VIDEO_PITCH_SCRIPT_AND_INSTRUCTIONS.md     # 5-minute timed video script and instructions
│
├── web_ar_filter/                             # Live WebAR Interactive Filter & Multi-Sensory Lab
│   ├── index.html                             # UI Layout with Camera Viewport & HUD Overlay
│   ├── style.css                              # Responsive Cyberpunk HUD Styling
│   ├── app.js                                 # MediaPipe Face Mesh, Landmark anchors & triggers
│   ├── spatial_audio_demo.js                  # Web Audio API HRTF 3D Panner Engine
│   └── haptics_demo.js                        # Tactile vibration controller & visualizer
│
├── spark_ar_filter/                           # Meta Spark AR / Effect House Project Package
│   ├── FaceInteractionFilter.arexport         # Exported filter package archive
│   ├── manifest.json                          # Project capabilities manifest
│   ├── PatchEditor_Workflow_Guide.md          # Visual Patch Editor connection diagrams
│   └── scripts/
│       └── FaceInteractionScript.js           # Reactive scripting graph for facial landmarks
│
└── unity_spatial_audio_haptics/               # Unity C# Implementation for AR Off-Screen Guidance
    ├── SpatialAudioTargetGuide.cs             # 3D Point-source HRTF attenuation & beacon guide
    ├── HapticFeedbackManager.cs               # Mobile vibration feedback (Android/iOS haptic engine)
    ├── ARRaycastInteraction.cs                # Raycast gaze detection & multi-modal triggers
    └── AudioAttenuationCurves.md              # Mathematical curves & configuration parameters
```

---

## 🛠️ Step-by-Step GitHub Setup Instructions

Follow these steps to link this project to your GitHub account (`VedantDave81106`):

### Step 1: Create a New Repository on GitHub
1. Open your browser and go to: [https://github.com/new](https://github.com/new)
2. In **Repository name**, enter: `ARMR_SLA_2` (or `ARMR_Self_Learning_Assignment_2`)
3. Set visibility to **Public**.
4. Leave *Add a README file*, *.gitignore*, and *license* **unchecked** (we already have them created).
5. Click **Create repository**.

### Step 2: Push Local Files to GitHub
Open your terminal (PowerShell or Command Prompt) inside `c:\Users\Hp\Desktop\ARMR_SLA_2` and run:

```bash
# 1. Initialize Git repository
git init

# 2. Stage all files
git add .

# 3. Commit files
git commit -m "Complete ARMR Self Learning Assignment 2: Social AR Filter, HRTF Spatial Audio & Haptics"

# 4. Set main branch
git branch -M main

# 5. Add remote origin (replace with your exact GitHub repository URL)
git remote add origin https://github.com/VedantDave81106/ARMR_SLA_2.git

# 6. Push to GitHub
git push -u origin main
```

---

## 📄 Converting Report to PDF for Submission
1. Double-click [`ARMR_SLA_2_REPORT.html`](file:///ARMR_SLA_2_REPORT.html) to open in Google Chrome or Microsoft Edge.
2. Press **`Ctrl + P`** (Print).
3. In the printer destination dropdown, select **"Save as PDF"**.
4. Check **"Background graphics"** and click **Save**.
5. You now have a clean, professionally formatted PDF report ready for submission!
