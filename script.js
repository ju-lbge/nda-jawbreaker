document.addEventListener("DOMContentLoaded", () => {
    // --- ÉLÉMENTS DOM DE BASE ---
    const specimen = document.getElementById("evidence-specimen");
    const specimenTrigger = document.getElementById("specimen-trigger");
    const checkboxes = document.querySelectorAll(".nda-checkbox");
    const waxBtn = document.getElementById("wax-seal-btn");
    const stampModal = document.getElementById("stamp-modal");
    const breachAlert = document.getElementById("breach-alert");
    const countdownEl = document.getElementById("countdown");
    const censors = document.querySelectorAll(".censor-text");

    // --- CONFIGURATION CENTRALE DE L'ENQUÊTE & GESTIONNAIRE D'ÉTAT ---
    const INVESTIGATION_CONFIG = {
        codes: {
            "ALPHA-04": {
                label: "ACCÈS PALIER 2 VALIDE",
                response: "REGISTRE DÉVERROUILLÉ // INTERCEPTION AUDIO 87.4 MHz EN COURS D'ACHEMINEMENT.",
                unlockIndex: 2
            },
            "X-RAY-99": {
                label: "ACCÈS PALIER 3 VALIDE",
                response: "MESSAGE COBAYE DÉCODÉ // INSPECTEZ L'ENVELOPPE KRAFT POUR MATRICE UV.",
                unlockIndex: 3
            },
            "SUJET ZERO": {
                label: "IDENTIFIANT CONFIRMÉ",
                response: "DOSSIER ARCHIVE #087 OUVERT DANS LE REGISTRE PRIVÉ.",
                unlockIndex: 4
            }
        },
        officialTargetDate: new Date("2026-10-29T23:59:59+01:00")
    };

    const InvestigationState = {
        currentLevel: 1,
        restoredNodes: new Set(),
        timelineSolved: false,
        
        load() {
            try {
                const saved = JSON.parse(localStorage.getItem("swd_investigation_state") || "{}");
                this.currentLevel = saved.currentLevel || 1;
                this.restoredNodes = new Set(saved.restoredNodes || []);
                this.timelineSolved = !!saved.timelineSolved;
            } catch (e) {
                this.currentLevel = 1;
            }
            this.syncUI();
        },

        save() {
            try {
                localStorage.setItem("swd_investigation_state", JSON.stringify({
                    currentLevel: this.currentLevel,
                    restoredNodes: Array.from(this.restoredNodes),
                    timelineSolved: this.timelineSolved
                }));
            } catch (e) {}
            this.syncUI();
        },

        syncUI() {
            const badge = document.getElementById("investigation-status-badge");
            if (badge) {
                badge.textContent = `NIVEAU ${this.currentLevel} / 5`;
            }
            document.querySelectorAll(".corrupt-node").forEach(node => {
                const target = node.getAttribute("data-target");
                if (this.restoredNodes.has(target)) {
                    node.textContent = target;
                    node.classList.add("restored");
                }
            });

            const memoFeedback = document.getElementById("memo-feedback");
            if (memoFeedback) {
                if (this.restoredNodes.size === 3) {
                    memoFeedback.textContent = "CLÉ PRIMAIRE EXTRAITE : [ ALPHA-04 ] // SAISISSEZ CE VECTEUR AU TERMINAL.";
                    memoFeedback.style.color = "var(--term-green)";
                }
            }

            const timelineFeedback = document.getElementById("timeline-feedback");
            if (timelineFeedback && this.timelineSolved) {
                timelineFeedback.textContent = "CONCORDANCE VALIDÉE : 29/10/2026 // COMPTEUR SYNCHRONISÉ SUR L'ORDONNANCE #087.";
                timelineFeedback.style.color = "var(--term-green)";
            }
        }
    };

    // --- 1. MOTEUR DE VRAIE FUMÉE ORGANIQUE SANS EFFET BULLE ---
    const smokeCanvas = document.getElementById("smoke-canvas");
    if (smokeCanvas) {
        const sCtx = smokeCanvas.getContext("2d");
        let w = smokeCanvas.width = window.innerWidth;
        let h = smokeCanvas.height = window.innerHeight;

        window.addEventListener("resize", () => {
            w = smokeCanvas.width = window.innerWidth;
            h = smokeCanvas.height = window.innerHeight;
            initSmokeClouds();
        });

        // Génère une nappe de fumée texturée asymétrique sur un canvas tampon
        function generateOrganicSmokePuff(width, height, isPinkTinted) {
            const pCanvas = document.createElement("canvas");
            pCanvas.width = width;
            pCanvas.height = height;
            const pCtx = pCanvas.getContext("2d");

            const cx = width / 2;
            const cy = height / 2;

            // Création de 7 à 9 sous-centres nébuleux entremêlés pour casser tout contour circulaire
            const subLobes = 8;
            for (let i = 0; i < subLobes; i++) {
                const angle = (i / subLobes) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
                const dist = 35 + Math.random() * 55;
                const lx = cx + Math.cos(angle) * dist;
                const ly = cy + Math.sin(angle) * dist * 0.75;
                const radius = 60 + Math.random() * 65;

                const grad = pCtx.createRadialGradient(lx, ly, 4, lx, ly, radius);
                if (isPinkTinted) {
                    grad.addColorStop(0, "rgba(22, 6, 18, 0.45)");
                    grad.addColorStop(0.4, "rgba(35, 8, 24, 0.22)");
                    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
                } else {
                    grad.addColorStop(0, "rgba(6, 6, 9, 0.52)");
                    grad.addColorStop(0.5, "rgba(8, 7, 12, 0.25)");
                    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
                }

                pCtx.fillStyle = grad;
                pCtx.beginPath();
                // Forme ovoïde étirée et irrégulière
                pCtx.ellipse(lx, ly, radius, radius * (0.6 + Math.random() * 0.4), angle, 0, Math.PI * 2);
                pCtx.fill();
            }

            // Micro-bruit de texture pour ajouter du grain vaporeux à la fumée
            const imgData = pCtx.getImageData(0, 0, width, height);
            const data = imgData.data;
            for (let p = 3; p < data.length; p += 4) {
                if (data[p] > 10) {
                    data[p] = Math.max(0, data[p] + (Math.random() * 18 - 9));
                }
            }
            pCtx.putImageData(imgData, 0, 0);

            return pCanvas;
        }

        const puffDark = generateOrganicSmokePuff(380, 320, false);
        const puffHaze = generateOrganicSmokePuff(420, 340, true);

        // Nappes de fumée volumétriques
        const clouds = [];
        const CLOUD_COUNT = Math.min(38, Math.floor((w * h) / 32000) + 16);

        function initSmokeClouds() {
            clouds.length = 0;
            for (let i = 0; i < CLOUD_COUNT; i++) {
                clouds.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    scaleX: 1.0 + Math.random() * 0.9,
                    scaleY: 0.8 + Math.random() * 0.7,
                    vx: (Math.random() - 0.48) * 0.35,
                    vy: -0.15 - Math.random() * 0.25, // Dérive naturelle ascensionnelle
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.0018,
                    stamp: Math.random() > 0.4 ? puffDark : puffHaze,
                    alpha: 0.75 + Math.random() * 0.22,
                    wobbleSpeed: 0.008 + Math.random() * 0.012,
                    wobblePhase: Math.random() * Math.PI * 2
                });
            }
        }
        initSmokeClouds();

        // Sillage d'effacement organique irrégulier (brise la forme ronde sous la souris)
        const clearMaskCanvas = document.createElement("canvas");
        const mSize = 220;
        clearMaskCanvas.width = mSize;
        clearMaskCanvas.height = mSize;
        const mCtx = clearMaskCanvas.getContext("2d");

        // Dessine une tâche de dissipation floue à plusieurs pétales vaporeux
        for (let j = 0; j < 6; j++) {
            const mAngle = (j / 6) * Math.PI * 2;
            const mDist = 20 + Math.random() * 20;
            const mx = mSize / 2 + Math.cos(mAngle) * mDist;
            const my = mSize / 2 + Math.sin(mAngle) * mDist;
            const mRad = 70 + Math.random() * 20;

            const mGrad = mCtx.createRadialGradient(mx, my, 0, mx, my, mRad);
            mGrad.addColorStop(0, "rgba(0, 0, 0, 0.85)");
            mGrad.addColorStop(0.65, "rgba(0, 0, 0, 0.45)");
            mGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

            mCtx.fillStyle = mGrad;
            mCtx.beginPath();
            mCtx.arc(mx, my, mRad, 0, Math.PI * 2);
            mCtx.fill();
        }

        const clearTrails = [];
        let lastMoveTime = 0;

        function addClearPoint(x, y) {
            const now = performance.now();
            if (now - lastMoveTime < 18) return; // Évite les paquets trop denses
            lastMoveTime = now;

            clearTrails.push({
                x: x,
                y: y,
                angle: Math.random() * Math.PI * 2,
                scale: 0.85 + Math.random() * 0.35,
                life: 1.0
            });
            if (clearTrails.length > 30) clearTrails.shift();
        }

        window.addEventListener("mousemove", (e) => {
            addClearPoint(e.clientX, e.clientY);
        }, { passive: true });

        window.addEventListener("touchmove", (e) => {
            if (e.touches && e.touches[0]) {
                addClearPoint(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        // Boucle de rendu
        let frameTime = 0;
        function renderSmokeLoop() {
            frameTime += 0.02;
            sCtx.clearRect(0, 0, w, h);

            // Voile de fond noir abysse très opaque
            sCtx.globalCompositeOperation = "source-over";
            sCtx.fillStyle = "rgba(140, 0, 68, 0.94)";
            sCtx.fillRect(0, 0, w, h);

            // Rendu des nappes de fumée volumétrique
            for (let i = 0; i < clouds.length; i++) {
                const c = clouds[i];
                c.x += c.vx;
                c.y += c.vy;
                c.rotation += c.rotSpeed;

                // Ondulation douce de forme
                const currentScaleX = c.scaleX + Math.sin(frameTime * c.wobbleSpeed + c.wobblePhase) * 0.08;
                const currentScaleY = c.scaleY + Math.cos(frameTime * c.wobbleSpeed + c.wobblePhase) * 0.08;

                const pad = 250;
                if (c.x < -pad) c.x = w + pad;
                if (c.x > w + pad) c.x = -pad;
                if (c.y < -pad) c.y = h + pad;
                if (c.y > h + pad) c.y = -pad;

                sCtx.save();
                sCtx.globalAlpha = c.alpha;
                sCtx.translate(c.x, c.y);
                sCtx.rotate(c.rotation);
                sCtx.scale(currentScaleX, currentScaleY);
                sCtx.drawImage(c.stamp, -c.stamp.width / 2, -c.stamp.height / 2);
                sCtx.restore();
            }

            // Trouée organique dans la fumée
            sCtx.globalCompositeOperation = "destination-out";

            for (let i = clearTrails.length - 1; i >= 0; i--) {
                const pt = clearTrails[i];
                sCtx.save();
                sCtx.globalAlpha = pt.life;
                sCtx.translate(pt.x, pt.y);
                sCtx.rotate(pt.angle);
                sCtx.scale(pt.scale, pt.scale);
                sCtx.drawImage(clearMaskCanvas, -mSize / 2, -mSize / 2);
                sCtx.restore();

                pt.life -= 0.013;
                if (pt.life <= 0) {
                    clearTrails.splice(i, 1);
                }
            }

            requestAnimationFrame(renderSmokeLoop);
        }
        renderSmokeLoop();
    }

    // --- 2. LAMPE TORCHE DYNAMIQUE SUR TEXTES CAVIARDÉS ---
    censors.forEach(el => {
        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty("--torch-x", `${x}px`);
            el.style.setProperty("--torch-y", `${y}px`);
        });
    });

    // --- 3. COMPTE À REBOURS DU DROP ---
    function updateCountdown() {
        if (!countdownEl) return;
        
        let diff = 0;
        if (InvestigationState.timelineSolved) {
            const now = new Date();
            diff = Math.max(0, Math.floor((INVESTIGATION_CONFIG.officialTargetDate - now) / 1000));
        } else {
            diff = 4 * 3600 + 12 * 60 + 33;
        }

        if (diff <= 0) {
            countdownEl.textContent = "00:00:00 - EXCHANGES OPEN";
            return;
        }

        const h = String(Math.floor(diff / 3600)).padStart(2, "0");
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        const s = String(diff % 60).padStart(2, "0");
        countdownEl.textContent = `${h}:${m}:${s}`;
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- 4. PARALLAX FLUIDE SUR L'ENVELOPPE FLOTTANTE ---
    let targetY = 0;
    let currentY = 0;
    let targetRot = 0;
    let currentRot = 0;

    window.addEventListener("scroll", () => {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
        const isMobile = window.innerWidth <= 768;
        targetY = scrollPercent * (isMobile ? 160 : 280);
        targetRot = (isMobile ? -2 : -4) + scrollPercent * (isMobile ? 8 : 16);
    }, { passive: true });

    function renderParallax() {
        currentY += (targetY - currentY) * 0.08;
        currentRot += (targetRot - currentRot) * 0.08;
        if (specimen) {
            specimen.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0) rotate(${currentRot.toFixed(2)}deg)`;
        }
        requestAnimationFrame(renderParallax);
    }
    renderParallax();

    // --- 5. RESTAURATION DE TEXTES CORROMPUS ---
    const corruptNodes = document.querySelectorAll(".corrupt-node");
    corruptNodes.forEach(node => {
        function triggerRestore() {
            const val = node.getAttribute("data-target");
            InvestigationState.restoredNodes.add(val);
            if (InvestigationState.restoredNodes.size >= 3 && InvestigationState.currentLevel < 2) {
                InvestigationState.currentLevel = 2;
            }
            InvestigationState.save();
            playShortFeedbackBeep(620);
        }

        node.addEventListener("click", triggerRestore);
        node.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                triggerRestore();
            }
        });
    });

    // --- 6. TERMINAL D'ACCÈS SECRET ---
    const argConsole = document.getElementById("arg-console");
    const argSubmitBtn = document.getElementById("arg-submit-btn");
    const argConsoleOutput = document.getElementById("arg-console-output");
    let isProcessingCommand = false;

    function processTerminalInput() {
        if (!argConsole || isProcessingCommand) return;
        const val = argConsole.value.trim().toUpperCase();
        if (!val) return;

        isProcessingCommand = true;
        argConsoleOutput.textContent = "ANALYSE DU FLUX CHIFFRÉ EN COURS...";
        argConsoleOutput.style.color = "#8b949e";

        setTimeout(() => {
            if (INVESTIGATION_CONFIG.codes[val]) {
                const conf = INVESTIGATION_CONFIG.codes[val];
                argConsoleOutput.textContent = `${conf.label} : ${conf.response}`;
                argConsoleOutput.style.color = "var(--term-green)";
                playShortFeedbackBeep(880);

                if (conf.unlockIndex > InvestigationState.currentLevel) {
                    InvestigationState.currentLevel = conf.unlockIndex;
                    InvestigationState.save();
                }
            } else {
                argConsoleOutput.textContent = "ACCÈS REFUSÉ — IDENTIFIANT NON HOMOLOGUÉ PAR LA SECTION CONTENTIEUX.";
                argConsoleOutput.style.color = "var(--pink-wax)";
                playShortFeedbackBeep(180);
            }
            argConsole.value = "";
            isProcessingCommand = false;
        }, 450);
    }

    if (argConsole) {
        argConsole.addEventListener("keydown", (e) => {
            if (e.key === "Enter") processTerminalInput();
        });
    }
    if (argSubmitBtn) {
        argSubmitBtn.addEventListener("click", processTerminalInput);
    }

    // --- 7. MESSAGE AUDIO D'INTERCEPTION ---
    const audioPlayBtn = document.getElementById("audio-play-btn");
    const audioTimerDisplay = document.getElementById("audio-timer-display");
    const audioVolumeSlider = document.getElementById("audio-volume-slider");
    const transcriptToggleBtn = document.getElementById("transcript-toggle-btn");
    const audioTranscriptBox = document.getElementById("audio-transcript-box");
    const audioTrackStatus = document.querySelector(".audio-track-status");

    let isAudioPlaying = false;
    let audioPlaybackTimer = null;
    let audioCtx = null;
    let gainNode = null;

    function playInterceptionRadioAudio() {
        if (isAudioPlaying) {
            stopInterceptionAudio();
            return;
        }

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            gainNode = audioCtx.createGain();
            const currentVol = parseFloat(audioVolumeSlider ? audioVolumeSlider.value : 0.7);
            gainNode.gain.setValueAtTime(currentVol, audioCtx.currentTime);
            gainNode.connect(audioCtx.destination);

            const bufferSize = audioCtx.sampleRate * 6;
            const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = audioCtx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;

            const bandpass = audioCtx.createBiquadFilter();
            bandpass.type = "bandpass";
            bandpass.frequency.setValueAtTime(1050, audioCtx.currentTime);
            bandpass.Q.setValueAtTime(4.0, audioCtx.currentTime);

            whiteNoise.connect(bandpass);
            bandpass.connect(gainNode);

            const beepOsc = audioCtx.createOscillator();
            beepOsc.type = "sine";
            beepOsc.frequency.setValueAtTime(740, audioCtx.currentTime);

            const beepGain = audioCtx.createGain();
            beepGain.gain.setValueAtTime(0, audioCtx.currentTime);
            
            const intervals = [0.8, 1.4, 2.2, 3.0, 3.8, 4.4];
            intervals.forEach(t => {
                beepGain.gain.setValueAtTime(0.2, audioCtx.currentTime + t);
                beepGain.gain.setValueAtTime(0, audioCtx.currentTime + t + 0.15);
            });

            beepOsc.connect(beepGain);
            beepGain.connect(gainNode);

            whiteNoise.start();
            beepOsc.start();

            isAudioPlaying = true;
            if (audioTrackStatus) audioTrackStatus.classList.add("playing");
            if (audioPlayBtn) audioPlayBtn.querySelector(".btn-label").textContent = "STOPPER LE SIGNAL";

            let elapsed = 0;
            audioPlaybackTimer = setInterval(() => {
                elapsed++;
                if (audioTimerDisplay) audioTimerDisplay.textContent = `00:0${elapsed} / 00:06`;
                if (elapsed >= 6) {
                    stopInterceptionAudio();
                }
            }, 1000);

        } catch (e) {
            if (audioTranscriptBox) audioTranscriptBox.classList.remove("hidden");
        }
    }

    function stopInterceptionAudio() {
        if (audioPlaybackTimer) clearInterval(audioPlaybackTimer);
        if (audioCtx) {
            try { audioCtx.close(); } catch(e) {}
        }
        isAudioPlaying = false;
        if (audioTrackStatus) audioTrackStatus.classList.remove("playing");
        if (audioPlayBtn) audioPlayBtn.querySelector(".btn-label").textContent = "INTERCEPTER LE SIGNAL";
        if (audioTimerDisplay) audioTimerDisplay.textContent = "00:00 / 00:06";
    }

    if (audioPlayBtn) audioPlayBtn.addEventListener("click", playInterceptionRadioAudio);
    
    if (audioVolumeSlider) {
        audioVolumeSlider.addEventListener("input", (e) => {
            if (gainNode && audioCtx) {
                gainNode.gain.setValueAtTime(parseFloat(e.target.value), audioCtx.currentTime);
            }
        });
    }

    if (transcriptToggleBtn && audioTranscriptBox) {
        transcriptToggleBtn.addEventListener("click", () => {
            const isHidden = audioTranscriptBox.classList.toggle("hidden");
            transcriptToggleBtn.setAttribute("aria-expanded", !isHidden);
            transcriptToggleBtn.textContent = isHidden 
                ? "[+] AFFICHER LA TRANSCRIPTION LÉGALE DÉCLASSIFIÉE" 
                : "[-] MASQUER LA TRANSCRIPTION LÉGALE DÉCLASSIFIÉE";
        });
    }

    // --- 8. QR CODE DISSIMULÉ ---
    const qrModal = document.getElementById("qr-modal");
    const closeQrModal = document.getElementById("close-qr-modal");

    function openEnvelopeQrModal() {
        if (qrModal) {
            qrModal.classList.remove("modal-hidden");
            if (InvestigationState.currentLevel < 3) {
                InvestigationState.currentLevel = 3;
                InvestigationState.save();
            }
        }
    }

    if (specimenTrigger) {
        specimenTrigger.addEventListener("click", openEnvelopeQrModal);
        specimenTrigger.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openEnvelopeQrModal();
            }
        });
    }

    if (closeQrModal && qrModal) {
        closeQrModal.addEventListener("click", () => {
            qrModal.classList.add("modal-hidden");
        });
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !qrModal.classList.contains("modal-hidden")) {
                qrModal.classList.add("modal-hidden");
            }
        });
    }

    // --- 9. VERIFICATION CHRONOLOGIQUE ---
    const timelineSelector = document.getElementById("timeline-selector");
    const confirmTimelineBtn = document.getElementById("confirm-timeline-btn");
    const timelineFeedback = document.getElementById("timeline-feedback");

    function verifyTimelineSelection() {
        if (!timelineSelector || !timelineFeedback) return;
        const val = timelineSelector.value;
        if (val === "2026-10-29") {
            InvestigationState.timelineSolved = true;
            InvestigationState.currentLevel = 5;
            InvestigationState.save();
            updateCountdown();
            playShortFeedbackBeep(980);
        } else if (val) {
            timelineFeedback.textContent = "ANOMALIE CHRONOLOGIQUE : Cette archive a été falsifiée par les services juridiques.";
            timelineFeedback.style.color = "var(--pink-wax)";
            playShortFeedbackBeep(180);
        }
    }

    if (confirmTimelineBtn) {
        confirmTimelineBtn.addEventListener("click", verifyTimelineSelection);
    }

    // --- 10. PAD DE SIGNATURE & VALIDATION SCEAU ---
    const canvas = document.getElementById("sig-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const clearBtn = document.getElementById("clear-sig");
    let isDrawing = false;
    let hasSigned = false;

    function resizeSignatureCanvas() {
        if (!canvas) return;
        const wrapper = canvas.parentElement;
        const targetWidth = Math.min(340, wrapper.clientWidth || 340);
        if (canvas.width !== targetWidth) {
            canvas.width = targetWidth;
            canvas.height = 130;
            ctx.strokeStyle = "#111317";
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
        }
    }
    resizeSignatureCanvas();
    window.addEventListener("resize", resizeSignatureCanvas);

    function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    if (canvas) {
        canvas.addEventListener("mousedown", (e) => {
            isDrawing = true;
            const { x, y } = getCoords(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
        });
        canvas.addEventListener("mousemove", (e) => {
            if (!isDrawing) return;
            const { x, y } = getCoords(e);
            ctx.lineTo(x, y);
            ctx.stroke();
            hasSigned = true;
            checkCompliance();
        });
        window.addEventListener("mouseup", () => isDrawing = false);

        canvas.addEventListener("touchstart", (e) => {
            isDrawing = true;
            const { x, y } = getCoords(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
        }, { passive: false });

        canvas.addEventListener("touchmove", (e) => {
            if (!isDrawing) return;
            if (e.cancelable) e.preventDefault();
            const { x, y } = getCoords(e);
            ctx.lineTo(x, y);
            ctx.stroke();
            hasSigned = true;
            checkCompliance();
        }, { passive: false });

        window.addEventListener("touchend", () => isDrawing = false);
    }

    if (clearBtn && canvas) {
        clearBtn.addEventListener("click", () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hasSigned = false;
            checkCompliance();
        });
    }

    function checkCompliance() {
        if (!waxBtn) return;
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        waxBtn.disabled = !(allChecked && hasSigned);
    }

    checkboxes.forEach(cb => cb.addEventListener("change", checkCompliance));

    // --- 11. FEEDBACKS AUDIO ---
    function playShortFeedbackBeep(freq) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const actx = new AudioContext();
            const osc = actx.createOscillator();
            const g = actx.createGain();
            osc.frequency.setValueAtTime(freq, actx.currentTime);
            g.gain.setValueAtTime(0.08, actx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.18);
            osc.connect(g);
            g.connect(actx.destination);
            osc.start();
            osc.stop(actx.currentTime + 0.2);
        } catch(e) {}
    }

    if (waxBtn) {
        waxBtn.addEventListener("click", () => {
            if (waxBtn.disabled) return;
            if (stampModal) stampModal.classList.remove("modal-hidden");
            setTimeout(() => {
                if (stampModal) stampModal.classList.add("modal-hidden");
                const orderRef = "SWD-087-" + Math.random().toString(36).substring(2, 7).toUpperCase();
                waxBtn.disabled = true;
                waxBtn.innerHTML = `<span class="wax-text">ACQUISITION OK</span><span class="wax-price">${orderRef}</span>`;
            }, 1800);
        });
    }

    // --- 12. BRÈCHE INTERMITTENTE ---
    function triggerBreach() {
        if (!breachAlert) return;
        breachAlert.classList.remove("breach-hidden");
        setTimeout(() => breachAlert.classList.add("breach-hidden"), 3200);
        setTimeout(triggerBreach, 18000 + Math.random() * 16000);
    }
    setTimeout(triggerBreach, 7000);

    // Initialisation
    InvestigationState.load();
});