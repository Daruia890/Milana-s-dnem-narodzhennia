// Основна логіка: клік по кульці -> конфеті -> показати привітання
(function () {
  const balloon = document.getElementById('smiley');
  const hint = document.querySelector('.click-text');
  const congrats = document.querySelector('.congrats-wrapper');
  const bgMusic = document.getElementById('bg-music');
  const openSound = document.getElementById('open-sound');
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');

  // Розміри canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Конфеті — частинки
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#B983FF', '#FF8FAB'];
  let pieces = [];
  const pieceCount = 220;

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createPieces() {
    pieces = [];
    for (let i = 0; i < pieceCount; i++) {
      pieces.push({
        x: randomRange(0, canvas.width),
        y: randomRange(-canvas.height, 0),
        size: randomRange(6, 12),
        rotation: randomRange(0, 2 * Math.PI),
        rotationSpeed: randomRange(-0.05, 0.05),
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: randomRange(2, 5),
        swing: randomRange(0.5, 2.5),
        alpha: 1
      });
    }
  }

  let running = false;
  let startTs = 0;
  const DURATION = 3200; // тривалість конфеті ~4.2 секунди

  function drawPiece(p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6); // прямокутник як "конфеті"
    ctx.restore();
  }

  function updatePiece(p, dt) {
    p.y += p.speed;
    p.x += Math.sin((p.y + startTs) * 0.01) * p.swing;
    p.rotation += p.rotationSpeed;
    if (p.y > canvas.height + 20) {
      p.y = -20;
      p.x = randomRange(0, canvas.width);
    }
  }

  function animateConfetti(ts) {
    if (!running) return;
    if (!startTs) startTs = ts;

    const elapsed = ts - startTs;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      updatePiece(p, elapsed);
      drawPiece(p);
    }

    if (elapsed < DURATION) {
      requestAnimationFrame(animateConfetti);
    } else {
      // Плавно згасити
      fadeOutConfetti(800);
    }
  }

  function fadeOutConfetti(ms) {
    const steps = 30;
    let step = 0;
    const interval = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alpha = 1 - step / steps;
      ctx.globalAlpha = alpha;
      for (const p of pieces) {
        drawPiece({ ...p, alpha });
      }
      step++;
      if (step > steps) {
        clearInterval(interval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        running = false;
        ctx.globalAlpha = 1;
      }
    }, ms / steps);
  }

  function revealCongrats() {
    congrats.classList.remove('hidden');
    // невелика попередня позиція для плавної появи
    congrats.classList.add('show-dissolve');

    // Поступово показуємо рядки привітання
    const lines = document.querySelectorAll('.congrats-text .line');
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('visible'), 250 + i * 250);
    });
  }

  function startExperience() {
    // Приховати кульку і підказку
    balloon.classList.add('hidden');
    if (hint) hint.classList.add('hidden');

    // Звук + музика
    try { openSound && openSound.play(); } catch (e) {}
    try { bgMusic && bgMusic.play(); } catch (e) {}

    // Конфеті
    createPieces();
    running = true;
    startTs = 0;
    requestAnimationFrame(animateConfetti);

    // Показати привітання трохи пізніше
    setTimeout(revealCongrats, 1200);
  }

  // Події
  balloon.addEventListener('click', startExperience);
  balloon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') startExperience();
  });
})();
