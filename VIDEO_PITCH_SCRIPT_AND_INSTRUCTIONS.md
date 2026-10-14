# 5-Minute Video Pitch & Technical Walkthrough Guide

**Project:** ARMR Self Learning Assignment 2  
**Subject:** Augmented Reality and Mixed Reality (DJS23ALH1501)  
**Student:** Vedant Parimal Dave  
**SAP ID:** 60017240057 | **Roll No.:** A011 | **Batch:** A1-1  
**Target Video Duration:** Exactly 5 Minutes (4:45 – 5:00)

---

## 1. Quick Recording Setup (Zero Tool Installation Needed)

You do **not** need Unity or expensive software installed to record this 5-minute video!

### Recording Tools on Windows:
1. **Windows Built-in Game Bar (Easiest):**
   - Press **`Win + G`** or **`Win + Alt + R`** to instantly start/stop recording your screen and microphone.
2. **OBS Studio (Free & Recommended):**
   - Allows showing your face via webcam in the corner while sharing your screen.
3. **Microsoft Clipchamp / Loom / Zoom:**
   - Free screen recording tools built into Windows 11 or available in your browser.

### Before Hitting Record:
1. Open your terminal in the project folder and run:
   ```bash
   npm start
   ```
   Open **`http://localhost:3000`** in Google Chrome or Microsoft Edge (or simply double-click `web_ar_filter/index.html`).
2. Put on headphones so you can hear and demonstrate the 3D HRTF spatial audio.
3. Have two browser tabs or windows ready:
   - **Tab 1:** Live WebAR Interactive Filter & Spatial Lab (`http://localhost:3000`)
   - **Tab 2:** Your Report or GitHub Repository (`ARMR_SLA_2_REPORT.html` or VS Code showing the Unity C# scripts).

---

## 2. 5-Minute Step-by-Step Timing Breakdown

| Time Window | Segment | What to Show on Screen | Key Points to Cover |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:45** | **Introduction & Objectives** | WebAR Lab screen showing title and student details | State your name, SAP ID, Roll No., and objective: Building multi-sensory AR combining face tracking, HRTF spatial audio, and haptics. |
| **0:45 – 2:00** | **Part A: Social AR Filter Live Demo** | WebAR Face Tracking Viewport (Webcam or Simulation) | Demonstrate 3 facial anchors: 3D Holographic Crown (head tilt), Cyber Visor (eye blink), and Plasma Beam (mouth open). Explain social virality and viewport constraints. |
| **2:00 – 3:15** | **Part B: HRTF Spatial Audio Architecture** | Click on "Part B: HRTF Audio" Tab + Spatial Radar | Explain HRTF vs. Stereo panning (ITD, ILD, pinna filtering). Drag azimuth slider & toggle 360° orbit to show how off-screen targets guide player gaze. |
| **3:15 – 4:15** | **Part B: Tactile Haptics & Unity Scripts** | Click on "Part B: Haptics Lab" Tab + Show Unity C# Code | Demonstrate haptic waveforms (Light tick, Target lock, Impact). Explain Android `VibrationEffect` and Unity raycast interaction. |
| **4:15 – 5:00** | **Conclusion & Deliverables** | Show GitHub Repository & Project Structure | Summarize CO3/CO4 learning outcomes, show `.arexport` package and report, and wrap up professionally. |

---

## 3. Word-for-Word Spoken Script (Read This During Recording)

### [0:00 – 0:45] Minute 1: Introduction & Problem Statement
> **(Screen: Display the WebAR application header showing your details)**
>  
> *"Hello everyone and respected faculty. My name is **Vedant Parimal Dave**, SAP ID **60017240057**, Roll Number **A011**, from Batch **A1-1**.*  
> *Today, I am presenting my **ARMR Self Learning Assignment 2** on **Spatial Audio Integration, Haptic Feedback, and Social AR Interactive Filter Design**, covering course outcomes **CO3** and **CO4**.*  
>  
> *In Augmented and Mixed Reality, true immersion requires more than just visual overlays. We must coordinate multiple human sensory channels: visual facial tracking, binaural 3D spatial sound using Head-Related Transfer Functions, and tactile haptic feedback. Today, I will demonstrate our executed interactive social AR filter and walk through the spatial audio and haptic architecture for immersive AR gaming."*

---

### [0:45 – 2:00] Minute 2: Part A — Social AR Face Tracking Filter Demo
> **(Screen: Click 'Start Webcam' or 'Simulated Face Demo' to show live tracking)**
>  
> *"Let us begin with **Part A: Interactive Face Tracking and Social AR Experience**.*  
> *Here in our live application, the engine tracks 468 3D facial landmarks in real time. We have anchored procedural 2D and 3D assets to three key anatomical landmarks:*  
>  
> 1. *First, on the **forehead anchor**, we have a **3D Holographic Crown**. Notice how as I tilt my head left or right, the Roll, Pitch, and Yaw matrices update dynamically, and the crown rotates seamlessly in 3D world space.*  
> 2. *Second, across the **eye landmarks**, we have anchored a **Cybernetic Visor HUD**. Our algorithm continuously monitors the Eye Aspect Ratio (EAR). When I blink—or when the simulation blinks—the system instantly registers the gesture, toggling the visor reticle and shifting the shader glow from neon cyan to glowing magenta.*  
> 3. *Third, look at the **mouth landmark**. When the distance between the upper and lower lip exceeds 35% of face height, the filter triggers a high-energy **Plasma Beam blast**, accompanied by glowing particles, audio synthesis, and a haptic impact pulse.*  
>  
> *From a social interactive design perspective, these micro-interactions create powerful viral hooks on platforms like Instagram and TikTok, while our damping algorithms prevent asset clipping against 9:16 mobile viewport boundaries."*

---

### [2:00 – 3:15] Minute 3: Part B — HRTF Spatial Audio Architecture
> **(Screen: Click on the 'Part B: HRTF Audio' tab. Move the Azimuth slider and show the radar blip)**
>  
> *"Now moving to **Part B: Spatial Audio Architecture**.*  
> *A core challenge in mobile AR gaming is that the camera viewport is narrow—players often cannot see targets located beside or behind them. Standard stereo panning fails completely here because it only adjusts left/right gain using simple sine/cosine panning. Stereo panning cannot produce vertical elevation cues and suffers from severe front-back ambiguity.*  
>  
> *To solve this, our architecture implements **Head-Related Transfer Functions (HRTF)**.*  
> *HRTF models the physiological scattering of sound waves around the human head, torso, and external ear pinna. It computes:*  
> - *First, **Interaural Time Difference (ITD)**—the microsecond delay between ears.*  
> - *Second, **Interaural Level Difference (ILD)**—the acoustic head-shadow.*  
> - *And third, **Spectral Pinna Filtering** between 4 to 10 kilohertz, allowing the brain to instantly discern whether a sound is in front, behind, or above.*  
>  
> *(Click 'Toggle 360° Sound Orbit')*  
> *As you can hear in headphones and see on our 3D radar blip, as the target orbits around the player's head, the audio source attenuates using an inverse-distance curve: $\text{Gain} = \frac{d_{\min}}{d_{\min} + \alpha(d - d_{\min})}$. When the target is directly behind the user, our script applies a low-pass filter down to 2500 Hz, instinctively prompting the player to turn their head toward the off-screen target."*

---

### [3:15 – 4:15] Minute 4: Part B — Tactile Haptics & Unity Implementation
> **(Screen: Click on 'Part B: Haptics Lab' tab. Trigger buttons to show visualizer, then show VS Code / script `SpatialAudioTargetGuide.cs`)**
>  
> *"Next, let us look at the **Tactile Vibration Feedback Subsystem**.*  
> *In mobile AR, haptics provide physical confirmation that anchors virtual interactions into the physical hand.*  
> *We have architected four precise haptic signatures:*  
> 1. *A **15 millisecond Subtle Tick** when the AR camera raycast first intersects an interactive collider.*  
> 2. *A **40 millisecond Confirmation Pulse** when the player maintains gaze dwell for one second to lock onto a target.*  
> 3. *An **80 millisecond Heavy Impact** for high-energy actions like our mouth plasma beam.*  
> 4. *And a **Dual-Pulse Waveform** alerting the player when an off-screen target enters proximity.*  
>  
> *In our Unity C# scripts—specifically `SpatialAudioTargetGuide.cs` and `HapticFeedbackManager.cs`—we leverage Android's native `VibrationEffect` API and the Unity Spatializer SDK, ensuring zero latency and hardware-level precision across Android and iOS devices."*

---

### [4:15 – 5:00] Minute 5: Summary, Learnings & Conclusion
> **(Screen: Show the project directory or GitHub repository with `README.md` and `ARMR_SLA_2_REPORT.html`)**
>  
> *"To conclude:*  
> - *In **Part A**, we successfully engineered an interactive face-tracked social AR filter with facial landmark anchoring, gesture triggers, and social design patterns.*  
> - *In **Part B**, we authored a comprehensive technical design document comparing HRTF against stereo panning, formulated 3D inverse attenuation curves, and established mobile haptic trigger matrices.*  
> - *All deliverables—including the exported filter package `.arexport`, Unity C# scripts, printable report, and this live WebAR application—are completely organized in our GitHub repository.*  
>  
> *Thank you very much for your time and guidance!"*

---

## 4. Tips for High Scoring
1. **Pacing:** Speak at a steady, confident pace. Don't rush; follow the minute milestones.
2. **Audio Quality:** Use your earphones or headset mic close to your mouth.
3. **Screen Layout:** Full-screen your browser tab at 100% zoom so all HUD pills, metrics, and radar indicators are crisp and readable.
