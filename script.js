document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const contract = document.getElementById('contract');
  const product = document.getElementById('product');
  const ghost = document.getElementById('ghost');
  const grid = document.getElementById('grid');
  const clauseHud = document.getElementById('clause');
  const articles = [...contract.querySelectorAll('article')];
  const securityBreach = document.getElementById('security-breach');

  // ---- Effet Lampe Torche (suivi de souris) ----
  let mx = innerWidth * .5, my = innerHeight * .45;
  let sx = mx, sy = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, {passive:true});

  // ---- Défilement Parallax ----
  let curP = 0;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function frame(t) {
    sx = lerp(sx, mx, .2); sy = lerp(sy, my, .2);
    
    // Application du masque de lampe torche sur le contrat
    if (contract) {
      const top = contract.getBoundingClientRect().top;
      const flicker = Math.sin(t / 85) * 4 + (Math.random() < .015 ? -55 : 0);
      root.style.setProperty('--mx', sx.toFixed(1) + 'px');
      root.style.setProperty('--my', (sy - top).toFixed(1) + 'px');
      root.style.setProperty('--r', (265 + flicker).toFixed(1) + 'px');
    }

    const sc = scrollY, max = Math.max(1, root.scrollHeight - innerHeight);
    const p = clamp(sc / max, 0, 1);
    curP = lerp(curP, p, .08);
    
    // Parallax du produit flottant
    if (product) {
      const prodH = product.offsetHeight;
      const y = lerp(innerHeight * .12, innerHeight * .88 - prodH, curP);
      const dx = (sx / innerWidth - .5) * -26;
      const rot = -14 + curP * 70;
      const scale = 1 + Math.sin(curP * Math.PI) * .22;
      product.style.transform = `translate3d(${dx.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
    }
    
    // Parallax de l'arrière plan sombre
    if (ghost && grid) {
      ghost.style.transform = `translate3d(${(-curP * 160).toFixed(1)}px,${(-sc * .12).toFixed(1)}px,0)`;
      grid.style.transform  = `translate3d(0,${(-sc * .06 % 80).toFixed(1)}px,0)`;
    }

    // Mise à jour du compteur de clause dans le HUD
    let n = 0;
    articles.forEach((a, i) => { if (a.getBoundingClientRect().top < innerHeight * .55) n = i + 1; });
    if(clauseHud) clauseHud.textContent = 'CLAUSE ' + String(n).padStart(2, '0') + '/' + articles.length;

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---- Système de validation des clauses ----
  const boxes = [...document.querySelectorAll('.clause-box')];
  const seal = document.getElementById('seal');
  const status = document.getElementById('status');
  
  function refresh() {
    const n = boxes.filter(b => b.checked).length;
    const ok = n === boxes.length;
    if(seal) seal.disabled = !ok;
    if(status) status.textContent = n + '/' + boxes.length + ' CLAUSES ACCEPTÉES — ' + (ok ? 'SCEAU DÉVERROUILLÉ' : 'SCEAU VERROUILLÉ');
  }
  boxes.forEach(b => b.addEventListener('change', refresh));
  refresh();

  // ---- Sound Design (Générateur de son "Tampon" lourd) ----
  function thump() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(140, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(32, ac.currentTime + .35);
      g.gain.setValueAtTime(.9, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .45);
      o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + .5);
    } catch(e) {}
  }

  // ---- Événement final d'achat ----
  const overlay = document.getElementById('stampOverlay');
  const zone = document.getElementById('buyZone');
  let done = false;
  
  if(seal) {
    seal.addEventListener('click', () => {
      if (seal.disabled || done) return;
      done = true;
      seal.disabled = true;
      overlay.classList.add('on');
      
      // Impact physique sur l'écran
      setTimeout(() => {
        thump();
        document.body.classList.add('shake');
      }, 370);
      
      setTimeout(() => document.body.classList.remove('shake'), 1100);
      setTimeout(() => overlay.classList.remove('on'), 1500);
      
      // Validation du "Paiement"
      setTimeout(() => {
        const ref = 'NDA-087-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        zone.innerHTML = '<div class="granted">Accès<br>Autorisé<small>ORDER REF. ' + ref + ' // NE PAS DIVULGUER</small></div>';
        status.textContent = boxes.length + '/' + boxes.length + ' CLAUSES ACCEPTÉES — VOUS ÊTES DÉSORMAIS LIÉ';
      }, 1450);
    });
  }

  // ---- Easter Egg : Faux pop-up "Breach" aléatoire ----
  function randomBreach() {
    if (securityBreach) {
      securityBreach.classList.add('active');
      // Disparaît après 1 à 3 secondes
      setTimeout(() => {
        securityBreach.classList.remove('active');
      }, 1000 + Math.random() * 2000);
    }
    // Réapparaît entre 10 et 25 secondes
    setTimeout(randomBreach, 10000 + Math.random() * 15000);
  }
  // Démarre le cycle de piratage après 5 secondes
  setTimeout(randomBreach, 5000);
});