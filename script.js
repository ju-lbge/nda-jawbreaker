document.addEventListener("DOMContentLoaded", () => {
    // --- ÉLÉMENTS DU DOM ---
    const terminalBoot = document.getElementById("terminal-boot");
    const enterBtn = document.getElementById("enter-btn");
    const mainContent = document.getElementById("main-content");
    const checkboxes = document.querySelectorAll(".nda-check");
    const payBtn = document.getElementById("pay-btn");
    const glitchPopup = document.getElementById("glitch-popup");
    const employeeLogin = document.getElementById("employee-login");

    // --- TRANSITION DU TERMINAL VERS LE CONTRAT ---
    enterBtn.addEventListener("click", () => {
        terminalBoot.classList.add("hidden");
        mainContent.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // --- GESTION DU CANVAS DE SIGNATURE ---
    const canvas = document.getElementById("signature-pad");
    const ctx = canvas.getContext("2d");
    const clearBtn = document.getElementById("clear-sig");
    let isDrawing = false;
    let hasSigned = false;

    ctx.strokeStyle = "#000";
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

    function startDrawing(e) {
        isDrawing = true;
        const coords = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const coords = getCoords(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        hasSigned = true;
        checkUnlockStatus();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stopDrawing);

    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    window.addEventListener("touchend", stopDrawing);

    clearBtn.addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasSigned = false;
        checkUnlockStatus();
    });

    // --- VÉRIFICATION DES CONDITIONS D'ACHAT ---
    function checkUnlockStatus() {
        const allChecked = Array.from(checkboxes).every(box => box.checked);

        if (allChecked && hasSigned) {
            payBtn.disabled = false;
            payBtn.classList.add("unlocked");
            payBtn.textContent = "[ DÉVERROUILLÉ : EXTRACTION 87.00€ ]";
        } else {
            payBtn.disabled = true;
            payBtn.classList.remove("unlocked");
            payBtn.textContent = "VERROUILLÉ : COMPLÉTER LES PROCÉDURES";
        }
    }

    checkboxes.forEach(box => {
        box.addEventListener("change", checkUnlockStatus);
    });

    // --- SYNTHÈSE SONORE DE TAMPON ADMINISTRATIF (Web Audio) ---
    function playSlamSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctxAudio = new AudioCtx();
            const osc = ctxAudio.createOscillator();
            const gain = ctxAudio.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(150, ctxAudio.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, ctxAudio.currentTime + 0.3);

            gain.gain.setValueAtTime(1, ctxAudio.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + 0.4);

            osc.connect(gain);
            gain.connect(ctxAudio.destination);

            osc.start();
            osc.stop(ctxAudio.currentTime + 0.45);
        } catch (err) {
            console.error("Audio Context indisponible", err);
        }
    }

    // --- CLIC SUR LE BOUTON D'ACHAT ---
    payBtn.addEventListener("click", () => {
        if (payBtn.disabled) return;
        playSlamSound();
        payBtn.textContent = "DOSSIER TRANSMIS // SUJET ENREGISTRÉ";
        payBtn.style.background = "#fff";
        payBtn.style.color = "#000";
        alert("PROTOCOLE VALIDÉ. L'échantillon #087 sera expédié dans un conteneur scellé. Toute discussion publique annulera la commande.");
    });

    // --- FAUX POP-UP DE SÉCURITÉ ALÉATOIRE ---
    function triggerBreachWarning() {
        glitchPopup.classList.remove("hidden");
        setTimeout(() => {
            glitchPopup.classList.add("hidden");
        }, 2200);

        const nextDelay = 12000 + Math.random() * 18000;
        setTimeout(triggerBreachWarning, nextDelay);
    }
    setTimeout(triggerBreachWarning, 7000);

    // --- EASTER EGG : TERMINAL EMPLOYÉ ---
    employeeLogin.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const val = employeeLogin.value.trim().toLowerCase();
            if (val === "acide citrique" || val === "sujet zero") {
                alert("ACCÈS AUTORISÉ : Échantillon classé violet toxique. pH mesuré à 1.4.");
            } else {
                alert("ACCÈS REFUSÉ : Incident consigné dans le journal de bord.");
            }
            employeeLogin.value = "";
        }
    });
});