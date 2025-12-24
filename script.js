// Árbol grande con corazón fijo y todas las luces encendidas, más efectos interactivos.
const ledBaseColors = ['#f97316', '#22c55e', '#38bdf8', '#e11d48', '#facc15'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Ecuación de corazón normalizado (x^2 + y^2 - 1)^3 - x^2 y^3 <= 0 [web:44]
function isInHeart(nx, ny) {
  const x = nx;
  const y = ny;
  const v = (x * x + y * y - 1);
  return (v * v * v - x * x * y * y * y) <= 0;
}

function createTreeLights() {
  const tree = document.getElementById('tree');

  const baseRadius = 245;
  const foliageBottom = 60;
  const layer6Bottom = 40;

  const tipY = foliageBottom + 290 + 120;
  const baseY = foliageBottom + layer6Bottom;
  const height = tipY - baseY;

  const rows = 16;
  const minCols = 4;
  const maxCols = 18;

  const coreSideMargin = 14;
  const edgeExtraMargin = 24;

  let indexGlobal = 0;

  // Corazón alto y algo estrecho para que la parte superior esté bien redondeada.
  const heartCenterY = baseY + height * 0.50;
  const heartHalfWidth = baseRadius * 0.28;
  const heartHalfHeight = height * 0.26;

  for (let r = 0; r < rows; r++) {
    const tRow = r / (rows - 1);
    const yBase = baseY + 10 + tRow * (height - 20);
    const fullRadiusAtY = baseRadius * (1 - tRow);

    let sideMargin = coreSideMargin;
    if (r <= 1 || r >= rows - 2) sideMargin += edgeExtraMargin;

    const innerRadius = Math.max(0, fullRadiusAtY - sideMargin);
    if (innerRadius <= 0) continue;

    const cols = Math.round(minCols + (maxCols - minCols) * (1 - tRow));

    if (cols <= 1) {
      placeLed(tree, 0, yBase, baseRadius, indexGlobal++,
               heartCenterY, heartHalfWidth, heartHalfHeight);
      continue;
    }

    const dx = (innerRadius * 2) / (cols - 1);
    const maxJitterX = dx * 0.06;
    const maxJitterY = 1.5;

    for (let c = 0; c < cols; c++) {
      const xBase = -innerRadius + c * dx;
      const jitterX = (Math.random() - 0.5) * 2 * maxJitterX;
      const jitterY = (Math.random() - 0.5) * 2 * maxJitterY;

      const x = xBase + jitterX;
      const y = yBase + jitterY;

      placeLed(tree, x, y, baseRadius, indexGlobal++,
               heartCenterY, heartHalfWidth, heartHalfHeight);
    }
  }

  // Estrella
  const star = document.createElement('div');
  star.className = 'star';
  star.textContent = '★';

  const starBottom = tipY + 10;
  star.style.bottom = `${starBottom}px`;
  star.style.animationDelay = `2.2s`;
  tree.appendChild(star);
}

function placeLed(tree, x, y, baseRadius, idx,
                  heartCenterY, heartHalfWidth, heartHalfHeight) {
  const led = document.createElement('div');
  led.className = 'led';

  led.style.left = `${x}px`;
  led.style.bottom = `${y}px`;

  const z = (Math.random() * 2 - 1) * baseRadius * 0.18;
  const maxZ = baseRadius * 0.5;
  const depthNorm = (z + maxZ) / (2 * maxZ);

  let size = 4.5 + depthNorm * 4.5;
  let opacity = 0.28 + depthNorm * 0.3;
  let color = pick(ledBaseColors);

  const nx = x / heartHalfWidth;
  const ny = (y - heartCenterY) / heartHalfHeight;
  const inHeart = isInHeart(nx, ny);

  if (inHeart) {
    size *= 1.3;
    opacity = 1;
    color = '#fb7185';
    led.classList.add('led-heart');
    const baseDelay = (idx % 20) * 0.12;
    led.style.animationDelay = `${baseDelay.toFixed(2)}s`;
  } else {
    opacity *= 0.38;
  }

  led.style.color = color;
  led.style.width = `${size}px`;
  led.style.height = `${size}px`;
  led.style.opacity = opacity;
  led.style.transform = `translateZ(${z})`;

  tree.appendChild(led);
}

// Nieve
function createSnow() {
  const snowLayer = document.getElementById('snow-layer');
  const symbols = ['❄', '❅', '❆'];

  const flakes = 50;
  for (let i = 0; i < flakes; i++) {
    const flake = document.createElement('div');
    flake.className = 'snowflake';
    flake.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const startLeft = Math.random() * 100;
    const duration = 10 + Math.random() * 6;
    const delay = Math.random() * 10;
    const size = 7 + Math.random() * 6;

    flake.style.left = `${startLeft}vw`;
    flake.style.fontSize = `${size}px`;
    flake.style.animationDuration = `${duration}s`;
    flake.style.animationDelay = `${delay}s`;

    snowLayer.appendChild(flake);
  }
}

// Estados fijos: corazón destacado + parpadeo general desde el inicio
function setupStaticLights() {
  const body = document.body;
  body.classList.add('lights-heart');
  body.classList.add('lights-on');
}

// Brillo local al mover el dedo / ratón sobre el árbol
function setupTreeGlowFollowPointer() {
  const treeWrapper = document.querySelector('.tree-wrapper');
  if (!treeWrapper) return;

  const leds = Array.from(document.querySelectorAll('.led'));
  if (!leds.length) return;

  const applyGlow = (clientX, clientY) => {
    const rect = treeWrapper.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    leds.forEach((led) => {
      const ledRect = led.getBoundingClientRect();
      const ledX = ledRect.left + ledRect.width / 2 - rect.left;
      const ledY = ledRect.top + ledRect.height / 2 - rect.top;

      const dx = ledX - x;
      const dy = ledY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const radius = rect.width * 0.25;
      const t = Math.max(0, 1 - dist / radius);

      const extraScale = 0.25 * t;
      const extraOpacity = 0.35 * t;

      led.style.transform = `translateZ(0) scale(${0.9 + extraScale})`;
      if (!led.classList.contains('led-heart')) {
        led.style.opacity = `${0.2 + extraOpacity}`;
      }
    });
  };

  const resetGlow = () => {
    leds.forEach((led) => {
      led.style.transform = 'translateZ(0) scale(0.9)';
      if (!led.classList.contains('led-heart')) {
        led.style.opacity = '';
      }
    });
  };

  treeWrapper.addEventListener('mousemove', (e) => {
    applyGlow(e.clientX, e.clientY);
  });

  treeWrapper.addEventListener('mouseleave', () => {
    resetGlow();
  });

  treeWrapper.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    applyGlow(touch.clientX, touch.clientY);
  }, { passive: true });

  treeWrapper.addEventListener('touchend', () => {
    resetGlow();
  });
}

// Estrella reactiva: destello global muy intenso al tocarla
function setupStarReactiveGlow() {
  const star = document.querySelector('.star');
  const body = document.body;
  if (!star) return;

  let isFlashing = false;

  const flash = () => {
    if (isFlashing) return;
    isFlashing = true;

    body.classList.add('tree-flash');

    setTimeout(() => {
      body.classList.remove('tree-flash');
      isFlashing = false;
    }, 1300);
  };

  star.addEventListener('click', flash);
  star.addEventListener('touchstart', (e) => {
    e.preventDefault();
    flash();
  }, { passive: false });
}

document.addEventListener('DOMContentLoaded', () => {
  createTreeLights();
  createSnow();
  setupStaticLights();
  setupTreeGlowFollowPointer();
  setupStarReactiveGlow();
});
