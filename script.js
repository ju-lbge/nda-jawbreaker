document.addEventListener("DOMContentLoaded", () => {
    // --- ÉLÉMENTS DOM ---
    const specimen = document.getElementById("evidence-specimen");
    const checkboxes = document.querySelectorAll(".nda-checkbox");
    const waxBtn = document.getElementById("wax-seal-btn");
    const stampModal = document.getElementById("stamp-modal");
    const breachAlert = document.getElementById("breach-alert");
    const countdownEl = document.getElementById("countdown");
    const censors = document.querySelectorAll(".censor-text");

    // --- 1. MOTEUR DE BUÉE AVEC EFFACEMENT CIRCULAIRE NET ---
    const smokeCanvas = document.getElementById("smoke-canvas");
    const sCtx = smokeCanvas.getContext("2d");
    let w = smokeCanvas.width = window.innerWidth;
    let h = smokeCanvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        w = smokeCanvas.width = window.innerWidth;
        h = smokeCanvas.height = window.innerHeight;
        generateMist();
    });

    // Génération de la buée froide avec reflets subtils
    function generateMist() {
        sCtx.globalCompositeOperation = "source-over";
        sCtx.fillStyle = "rgba(18, 10, 14, 0.94)";
        sCtx.fillRect(0, 0, w, h);

        for (let i = 0; i < 50; i++) {
            const rx = Math.random() * w;
            const ry = Math.random() * h;
            const rad = 70 + Math.random() * 150;
            const grad = sCtx.createRadialGradient(rx, ry, 10, rx, ry, rad);
            grad.addColorStop(0, "rgba(245, 3, 128, 0.07)");
            grad.addColorStop(0.7, "rgba(245, 3, 128, 0.02)");
            grad.addColorStop(1, "transparent");
            sCtx.fillStyle = grad;
            sCtx.beginPath();
            sCtx.arc(rx, ry, rad, 0, Math.PI * 2);
            sCtx.fill();
        }
    }
    generateMist();

    // Effacement circulaire : centre 100% net avec dégradé doux sur les bords
    function wipeCircle(x, y) {
        sCtx.globalCompositeOperation = "destination-out";
        const brushRadius = 90;
        const grad = sCtx.createRadialGradient(x, y, 0, x, y, brushRadius);
        grad.addColorStop(0, "rgba(0, 0, 0, 1)");
        grad.addColorStop(0.7, "rgba(0, 0, 0, 0.95)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        sCtx.fillStyle = grad;
        sCtx.beginPath();
        sCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
        sCtx.fill();
    }

    // Support Souris (Desktop)
    window.addEventListener("mousemove", (e) => {
        wipeCircle(e.clientX, e.clientY);
    }, { passive: true });

    // Support Tactile (Mobiles & Tablettes)
    window.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches[0]) {
            wipeCircle(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    // Ré-embuage progressif en arrière-plan
    setInterval(() => {
        sCtx.globalCompositeOperation = "source-over";
        sCtx.fillStyle = "rgba(58, 29, 47, 0.01)";
        sCtx.fillRect(0, 0, w, h);
    }, 150);

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
    let totalSeconds = 4 * 3600 + 12 * 60 + 47;
    function updateCountdown() {
        if (totalSeconds <= 0) {
            countdownEl.textContent = "00:00:00 - CLOS";
            return;
        }
        totalSeconds--;
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const s = String(totalSeconds % 60).padStart(2, "0");
        countdownEl.textContent = `${h}:${m}:${s}`;
    }
    setInterval(updateCountdown, 1000);

// --- 4. PARALLAX FLUIDE SUR L'ENVELOPPE (DESKTOP ET MOBILE) ---
    let targetY = 0;
    let currentY = 0;
    let targetRot = 0;
    let currentRot = 0;

    window.addEventListener("scroll", () => {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
        const isMobile = window.innerWidth <= 768;
        
        // Amplitude adaptée : 160px sur smartphone, 280px sur desktop
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

    // --- 5. CANVAS DE SIGNATURE RESPONSIVE TACTILE / SOURIS ---
    const canvas = document.getElementById("sig-canvas");
    const ctx = canvas.getContext("2d");
    const clearBtn = document.getElementById("clear-sig");
    let isDrawing = false;
    let hasSigned = false;

    function resizeSignatureCanvas() {
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

    function startSign(e) {
        isDrawing = true;
        const { x, y } = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function drawSign(e) {
        if (!isDrawing) return;
        if (e.cancelable) e.preventDefault();
        const { x, y } = getCoords(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        hasSigned = true;
        checkCompliance();
    }

    function stopSign() {
        isDrawing = false;
    }

    canvas.addEventListener("mousedown", startSign);
    canvas.addEventListener("mousemove", drawSign);
    window.addEventListener("mouseup", stopSign);

    canvas.addEventListener("touchstart", startSign, { passive: false });
    canvas.addEventListener("touchmove", drawSign, { passive: false });
    window.addEventListener("touchend", stopSign);

    clearBtn.addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasSigned = false;
        checkCompliance();
    });

    // --- 6. DÉBLOCAGE DU BOUTON (CLAUSES + SIGNATURE) ---
    function checkCompliance() {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        waxBtn.disabled = !(allChecked && hasSigned);
    }

    checkboxes.forEach(cb => cb.addEventListener("change", checkCompliance));

    // --- 7. IMPACT AUDIO (WEB AUDIO SANS FICHIER EXTERNE) ---
    function playSlamImpact() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const actx = new AudioContext();
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(160, actx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(25, actx.currentTime + 0.4);
            
            gain.gain.setValueAtTime(1, actx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.45);
            
            osc.connect(gain);
            gain.connect(actx.destination);
            
            osc.start();
            osc.stop(actx.currentTime + 0.5);
        } catch(e) {}
    }

    // --- 8. ACTION DU SCEAU DE CIRE ---
    waxBtn.addEventListener("click", () => {
        if (waxBtn.disabled) return;
        
        playSlamImpact();
        
        document.body.style.transform = "translateY(5px)";
        setTimeout(() => document.body.style.transform = "none", 100);

        stampModal.classList.remove("modal-hidden");
        
        setTimeout(() => {
            stampModal.classList.add("modal-hidden");
            const orderRef = "SWD-087-" + Math.random().toString(36).substring(2, 7).toUpperCase();
            waxBtn.disabled = true;
            waxBtn.innerHTML = `<span class="wax-text">ACQUISITION OK</span><span class="wax-price">${orderRef}</span>`;
        }, 1800);
    });

    // --- 9. POP-UP ALERTE BRÈCHE ALÉATOIRE ---
    function triggerBreach() {
        if (!breachAlert) return;
        breachAlert.classList.remove("breach-hidden");
        setTimeout(() => breachAlert.classList.add("breach-hidden"), 3200);
        setTimeout(triggerBreach, 14000 + Math.random() * 16000);
    }
    setTimeout(triggerBreach, 6000);
});