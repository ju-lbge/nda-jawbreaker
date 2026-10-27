document.addEventListener("DOMContentLoaded", () => {
    // --- ÉLÉMENTS DOM ---
    const specimen = document.getElementById("evidence-specimen");
    const checkboxes = document.querySelectorAll(".nda-checkbox");
    const waxBtn = document.getElementById("wax-seal-btn");
    const lockWarning = document.getElementById("lock-warning");
    const stampModal = document.getElementById("stamp-modal");
    const breachAlert = document.getElementById("breach-alert");
    const argConsole = document.getElementById("arg-console");
    const countdownEl = document.getElementById("countdown");
    const censors = document.querySelectorAll(".censor-text");

    // --- 1. LAMPE TORCHE DYNAMIQUE SUR TEXTES CAVIARDÉS ---
    censors.forEach(el => {
        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty("--torch-x", `${x}px`);
            el.style.setProperty("--torch-y", `${y}px`);
        });
    });

    // --- 2. COMPTE À REBOURS DU DROP ÉPHÉMÈRE ---
    let totalSeconds = 4 * 3600 + 12 * 60 + 47;
    function updateCountdown() {
        if (totalSeconds <= 0) {
            countdownEl.textContent = "00:00:00 - EXCHANGES CLOSED";
            return;
        }
        totalSeconds--;
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const s = String(totalSeconds % 60).padStart(2, "0");
        countdownEl.textContent = `${h}:${m}:${s}`;
    }
    setInterval(updateCountdown, 1000);

    // --- 3. PARALLAX FLUIDE SUR L'ENVELOPPE FLOTTANTE ---
    let targetY = 0;
    let currentY = 0;
    let targetRot = 0;
    let currentRot = 0;

    window.addEventListener("scroll", () => {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        targetY = scrollPercent * 280;
        targetRot = -4 + scrollPercent * 16;
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

    // --- 4. CANVAS DE SIGNATURE TACTILE / SOURIS ---
    const canvas = document.getElementById("sig-canvas");
    const ctx = canvas.getContext("2d");
    const clearBtn = document.getElementById("clear-sig");
    let isDrawing = false;
    let hasSigned = false;

    ctx.strokeStyle = "#111317";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

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

    // --- 5. VÉRIFICATION DES CLAUSES ET SIGNATURE ---
    function checkCompliance() {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked && hasSigned) {
            waxBtn.disabled = false;
            lockWarning.textContent = "PROTOCOLE REMPLI // ACCÈS AU CONTENEUR DÉVERROUILLÉ";
            lockWarning.style.color = "var(--term-green)";
        } else {
            waxBtn.disabled = true;
            lockWarning.textContent = "VERROUILLÉ : SIGNEZ LE PROTOCOLE ET VALIDEZ LES 4 CLAUSES";
            lockWarning.style.color = "#8b949e";
        }
    }

    checkboxes.forEach(cb => cb.addEventListener("change", checkCompliance));

    // --- 6. SYNTHÈSE AUDIO WEB-AUDIO (IMPACT TAMPON SANS FICHIER EXTERNE) ---
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

    // --- 7. SCEAU DE PAIEMENT & IMPACT VISUEL ---
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
            lockWarning.textContent = "ÉCHANTILLON EN COURS D'ACHEMINEMENT SÉCURISÉ // GARDEZ LE SILENCE";
            lockWarning.style.color = "var(--pink-wax)";
        }, 1800);
    });

    // --- 8. POP-UP ALERTE BRÈCHE ALÉATOIRE ---
    function triggerBreach() {
        if (!breachAlert) return;
        breachAlert.classList.remove("breach-hidden");
        
        setTimeout(() => {
            breachAlert.classList.add("breach-hidden");
        }, 3200);

        setTimeout(triggerBreach, 14000 + Math.random() * 16000);
    }
    setTimeout(triggerBreach, 6000);

    // --- 9. EASTER EGG CONSOLE ARG ---
    if (argConsole) {
        argConsole.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const val = argConsole.value.trim().toLowerCase();
                if (val === "251-4330" || val === "#087-1036") {
                    alert("RAPPORT DÉCLASSIFIÉ : Le bonbon n'a pas été aromatisé intentionnellement. Il s'agit d'un résidu de polymère comestible ayant absorbé le nettoyant industriel.");
                } else if (val === "sujet zero") {
                    alert("IDENTIFIANT CONFIRMÉ : Vos coordonnées ont été purgées du registre public. Conservez l'enveloppe.");
                } else {
                    alert("ERREUR CODE ARCHIVE : Entrée non répertoriée.");
                }
                argConsole.value = "";
            }
        });
    }
});