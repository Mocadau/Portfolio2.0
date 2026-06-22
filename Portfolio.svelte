<script>
  import { onMount, tick } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';

  const BACKGROUND_FRAME_COUNT = 29;
  const CHARACTER_FRAME_COUNT = 30;
  const SCROLL_LENGTH = 4300;
  const CHARACTER_HEIGHT_RATIO = 0.75;
  const CONSTANT_ANIMATION_FPS = 18;
  const SCROLL_IDLE_TAIL_MS = 620;

  /*
    Browser-safe paths for Vite/localhost. These are the only paths the
    animation preloads; removed lowercase backgroundXX/walkingXX attempts
    permanently to avoid 404 preload errors.
    /portfolio-assets/Background/02.png ... /portfolio-assets/Background/30.png
    /portfolio-assets/Walking/01.png ... /portfolio-assets/Walking/30.png
  */
  export let assetBase = '/portfolio-assets';

  const projects = [
    {
      title: 'Pokemon Warsaw',
      description:
        'A location-based Citydex from my semester abroad in Warsaw, with mapped encounters, capture animations, and collectible Pokemon records.',
      tags: ['Pokemon', 'Map UI', 'Warsaw'],
      revealAt: 0.08,
      align: 'right',
      href: '/pokemon/',
      target: '_blank',
      icon: '/pokemon/assets/pikachu.png',
      cta: 'Visit Pokemon Warsaw'
    },
    {
      title: 'Unknown',
      description: 'Coming soon.',
      tags: [],
      revealAt: 0.22,
      align: 'left',
      comingSoon: true
    },
    {
      title: 'Unknown',
      description: 'Coming soon.',
      tags: [],
      revealAt: 0.42,
      align: 'right',
      comingSoon: true
    }
  ];

  let ready = false;
  let loadError = '';
  let loadedCount = 0;
  let frameIndex = 0;
  let scrollProgress = 0;
  let emailCopied = false;

  let viewport;
  let backgroundCanvas;
  let characterCanvas;
  let backgroundContext;
  let characterContext;
  let backgroundImages = [];
  let characterImages = [];
  let characterBounds = [];
  let rafId = 0;
  let frameCursor = 0;
  let scrollDirection = 1;
  let lastScrollY = 0;
  let activeUntil = 0;
  let lastFrameTime = 0;

  $: totalFrameCount = BACKGROUND_FRAME_COUNT + CHARACTER_FRAME_COUNT;
  $: percentLoaded = Math.round((loadedCount / totalFrameCount) * 100);

  const padFrame = (frame) => String(frame).padStart(2, '0');
  const positiveModulo = (value, divisor) => ((value % divisor) + divisor) % divisor;
  const emailAddress = 'maurice.cadau@hfg.design';

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(emailAddress);
    } catch {
      const input = document.createElement('input');
      input.value = emailAddress;
      document.body.append(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }

    emailCopied = true;
    window.setTimeout(() => {
      emailCopied = false;
    }, 1800);
  }

  function backgroundPath(index) {
    return `${assetBase}/Background/${padFrame(index + 2)}.png`;
  }

  function characterPath(index) {
    return `${assetBase}/Walking/${padFrame(index + 1)}.png`;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.decoding = 'async';
      image.onload = () => {
        loadedCount += 1;
        resolve(image);
      };
      image.onerror = () => reject(new Error(`Unable to preload ${src}`));
      image.src = src;
    });
  }

  function preloadFrames() {
    const backgroundPromises = Array.from({ length: BACKGROUND_FRAME_COUNT }, (_, index) =>
      loadImage(backgroundPath(index))
    );
    const characterPromises = Array.from({ length: CHARACTER_FRAME_COUNT }, (_, index) =>
      loadImage(characterPath(index))
    );

    return Promise.all([Promise.all(backgroundPromises), Promise.all(characterPromises)]);
  }

  function getVisibleImageBounds(image) {
    const scanCanvas = document.createElement('canvas');
    const scanContext = scanCanvas.getContext('2d', { willReadFrequently: true });
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    let top = height;
    let right = 0;
    let bottom = 0;
    let left = width;

    scanCanvas.width = width;
    scanCanvas.height = height;
    scanContext.drawImage(image, 0, 0);

    const pixels = scanContext.getImageData(0, 0, width, height).data;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const alpha = pixels[(y * width + x) * 4 + 3];

        if (alpha > 8) {
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
          left = Math.min(left, x);
        }
      }
    }

    if (right <= left || bottom <= top) {
      return {
        sx: 0,
        sy: 0,
        sw: width,
        sh: height
      };
    }

    return {
      sx: left,
      sy: top,
      sw: right - left + 1,
      sh: bottom - top + 1
    };
  }

  function getMaxScroll() {
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      viewport?.offsetHeight ?? 0
    );

    return Math.max(documentHeight - window.innerHeight, 1);
  }

  function setupCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    });

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    return context;
  }

  function resizeCanvases() {
    if (!backgroundCanvas || !characterCanvas) {
      return;
    }

    backgroundContext = setupCanvas(backgroundCanvas);
    characterContext = setupCanvas(characterCanvas);
    requestStaticRender();
  }

  function drawImageCover(context, image, width, height) {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let drawX = 0;
    let drawY = 0;

    if (imageRatio > canvasRatio) {
      drawWidth = height * imageRatio;
      drawX = (width - drawWidth) / 2;
    } else {
      drawHeight = width / imageRatio;
      drawY = (height - drawHeight) / 2;
    }

    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  function drawCharacterBottomAnchored(context, image, bounds, width, height) {
    const targetHeight = height * CHARACTER_HEIGHT_RATIO;
    const targetWidth = targetHeight * (bounds.sw / bounds.sh);
    const targetX = (width - targetWidth) / 2;
    const targetY = height - targetHeight;

    context.drawImage(
      image,
      bounds.sx,
      bounds.sy,
      bounds.sw,
      bounds.sh,
      targetX,
      targetY,
      targetWidth,
      targetHeight
    );
  }

  function drawFrame(characterFrameIndex, backgroundFrameIndex) {
    if (!ready || !backgroundContext || !characterContext) {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const maxScroll = getMaxScroll();
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const clampedScroll = Math.min(Math.max(scrollY, 0), maxScroll);

    frameIndex = characterFrameIndex;
    scrollProgress = clampedScroll / maxScroll;

    backgroundContext.clearRect(0, 0, width, height);
    characterContext.clearRect(0, 0, width, height);

    drawImageCover(backgroundContext, backgroundImages[backgroundFrameIndex], width, height);
    drawCharacterBottomAnchored(
      characterContext,
      characterImages[characterFrameIndex],
      characterBounds[characterFrameIndex],
      width,
      height
    );
  }

  function renderStaticFrame() {
    const maxScroll = getMaxScroll();
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const clampedScroll = Math.min(Math.max(scrollY, 0), maxScroll);
    scrollProgress = clampedScroll / maxScroll;

    drawFrame(
      positiveModulo(Math.floor(frameCursor), CHARACTER_FRAME_COUNT),
      positiveModulo(Math.floor(frameCursor), BACKGROUND_FRAME_COUNT)
    );
  }

  function renderLoop(timestamp) {
    if (!lastFrameTime) {
      lastFrameTime = timestamp;
    }

    const deltaSeconds = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
    lastFrameTime = timestamp;

    if (timestamp <= activeUntil) {
      frameCursor += scrollDirection * CONSTANT_ANIMATION_FPS * deltaSeconds;
    }

    drawFrame(
      positiveModulo(Math.floor(frameCursor), CHARACTER_FRAME_COUNT),
      positiveModulo(Math.floor(frameCursor), BACKGROUND_FRAME_COUNT)
    );

    if (timestamp <= activeUntil) {
      rafId = requestAnimationFrame(renderLoop);
      return;
    }

    rafId = 0;
    lastFrameTime = 0;
  }

  function handleScroll() {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const delta = currentScrollY - lastScrollY;

    if (delta !== 0) {
      scrollDirection = delta > 0 ? 1 : -1;
    }

    lastScrollY = currentScrollY;
    activeUntil = performance.now() + SCROLL_IDLE_TAIL_MS;

    if (rafId) {
      return;
    }

    rafId = requestAnimationFrame(renderLoop);
  }

  function requestStaticRender() {
    lastScrollY = window.scrollY || window.pageYOffset || 0;

    if (rafId) {
      return;
    }

    rafId = requestAnimationFrame((timestamp) => {
      rafId = 0;
      lastFrameTime = timestamp;
      renderStaticFrame();
      lastFrameTime = 0;
    });
  }

  onMount(() => {
    let mounted = true;

    preloadFrames()
      .then(async ([loadedBackgrounds, loadedCharacters]) => {
        if (!mounted) {
          return;
        }

        backgroundImages = loadedBackgrounds;
        characterImages = loadedCharacters;
        characterBounds = loadedCharacters.map(getVisibleImageBounds);
        lastScrollY = window.scrollY || window.pageYOffset || 0;
        ready = true;

        await tick();

        if (!mounted) {
          return;
        }

        resizeCanvases();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', resizeCanvases, { passive: true });
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        loadError = error instanceof Error ? error.message : 'The portfolio frames failed to load.';
      });

    return () => {
      mounted = false;
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvases);

      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  });
</script>

{#if !ready}
  <section class="loading-shell" aria-live="polite" aria-busy="true" transition:fade>
    <div class="loading-panel">
      <p class="kicker">Preparing the canvas sequence</p>
      <h1>Loading portfolio frames</h1>
      <div class="progress-track" aria-hidden="true">
        <span style={`width: ${percentLoaded}%`}></span>
      </div>
      <p class="loading-meta">
        {#if loadError}
          {loadError}
        {:else}
          {percentLoaded}% loaded
        {/if}
      </p>
    </div>
  </section>
{:else}
  <section
    class="portfolio"
    bind:this={viewport}
    style={`--scroll-length: ${SCROLL_LENGTH}px`}
    aria-label="Interactive portfolio"
  >
    <div class="canvas-stage" aria-hidden="true">
      <canvas
        bind:this={backgroundCanvas}
        class="background-canvas"
        id="background-canvas"
      ></canvas>
      <canvas
        bind:this={characterCanvas}
        class="character-canvas"
        id="character-canvas"
      ></canvas>
    </div>

    <main class="content-layer">
      <section class="intro" aria-labelledby="portfolio-title">
        <p class="kicker">Hello, I'm Maurice</p>
        <h1 id="portfolio-title">Interaction Designer based in Germany.</h1>
        <p>
          I am 24 and I love being creative.
          <br />
          This Portfolio is in development.
        </p>
      </section>

      {#each projects as project, index}
        <section
          class:align-right={project.align === 'right'}
          class="project-stop"
          aria-label={project.title}
        >
          {#if scrollProgress >= project.revealAt}
            <article
              class="project-card"
              transition:fly={{
                x: project.align === 'right' ? 96 : -96,
                y: 12,
                duration: 620,
                easing: cubicOut
              }}
            >
              {#if project.icon}
                <img class="project-icon" src={project.icon} alt="" loading="lazy" decoding="async" />
              {:else}
                <span class="project-number">{String(index + 1).padStart(2, '0')}</span>
              {/if}
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              {#if project.tags.length}
                <ul aria-label={`${project.title} tags`}>
                  {#each project.tags as tag}
                    <li>{tag}</li>
                  {/each}
                </ul>
              {/if}
              {#if project.comingSoon}
                <span class="project-status">Coming soon</span>
              {:else}
                <a
                  href={project.href ?? `#${project.title.toLowerCase().replaceAll(' ', '-')}`}
                  target={project.target}
                  rel={project.target === '_blank' ? 'noreferrer' : undefined}
                >
                  {project.cta ?? 'View case study'}
                </a>
              {/if}
            </article>
          {/if}
        </section>
      {/each}

      <section class="contact-stop" aria-label="Contact">
        {#if scrollProgress >= 0.76}
          <article
            class="liquid-contact"
            transition:fly={{
              x: -72,
              y: 18,
              duration: 680,
              easing: cubicOut
            }}
          >
            <p class="kicker">Contact</p>
            <h2>Come back soon.</h2>
            <p class="contact-copy">
              This portfolio is still growing. For now, you can reach me here.
            </p>
            <div class="contact-actions">
              <button class="contact-chip" type="button" onclick={copyEmail}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6.5h16v11H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                <span>{emailCopied ? 'Email copied' : emailAddress}</span>
              </button>
              <a class="contact-chip" href="https://instagram.com/mocadau" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="5" width="14" height="14" rx="4" />
                  <circle cx="12" cy="12" r="3.2" />
                  <circle cx="16.4" cy="7.7" r="0.8" />
                </svg>
                <span>Instagram / mocadau</span>
              </a>
            </div>
          </article>
        {/if}
      </section>
    </main>
  </section>
{/if}

<style>
  :global(html) {
    background: #05070a;
    scroll-behavior: smooth;
  }

  :global(body) {
    margin: 0;
    color: #f5f1e8;
    background: #05070a;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .loading-shell {
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: 24px;
    background: #05070a;
  }

  .loading-panel {
    width: min(440px, 100%);
    padding: 28px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 8px;
    background: rgba(12, 16, 22, 0.72);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.36);
    backdrop-filter: blur(18px);
  }

  .loading-panel h1 {
    margin: 8px 0 22px;
    font-size: clamp(2rem, 6vw, 4rem);
    line-height: 0.94;
  }

  .kicker {
    margin: 0;
    color: #e0be73;
    font-size: 0.74rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .progress-track {
    height: 4px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
  }

  .progress-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #e0be73, #fff1c4);
    transition: width 180ms ease;
  }

  .loading-meta {
    margin: 14px 0 0;
    color: rgba(245, 241, 232, 0.74);
    font-size: 0.9rem;
  }

  .portfolio {
    position: relative;
    min-height: calc(100vh + var(--scroll-length));
    isolation: isolate;
    background: #05070a;
  }

  .canvas-stage {
    position: sticky;
    top: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    pointer-events: none;
  }

  .background-canvas,
  .character-canvas {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .background-canvas {
    z-index: 1;
  }

  .character-canvas {
    z-index: 2;
  }

  .content-layer {
    position: absolute;
    inset: 0;
    z-index: 3;
    min-height: 100%;
    padding: max(28px, env(safe-area-inset-top)) clamp(18px, 4vw, 64px) 56px;
    pointer-events: none;
  }

  .content-layer :where(a, button, article) {
    pointer-events: auto;
  }

  .intro {
    display: grid;
    min-height: 100vh;
    align-content: center;
    max-width: 760px;
  }

  .intro h1,
  .liquid-contact h2 {
    max-width: 11ch;
    margin: 12px 0 18px;
    color: #fff9ed;
    font-size: clamp(3.1rem, 10vw, 8.2rem);
    line-height: 0.88;
    text-wrap: balance;
  }

  .intro p:not(.kicker) {
    max-width: 560px;
    margin: 0;
    color: rgba(245, 241, 232, 0.78);
    font-size: clamp(1rem, 2vw, 1.2rem);
    line-height: 1.7;
  }

  .project-stop {
    display: flex;
    min-height: 92vh;
    align-items: center;
    justify-content: flex-start;
  }

  .project-stop.align-right {
    justify-content: flex-end;
  }

  .project-card {
    width: min(460px, 100%);
    padding: clamp(20px, 3vw, 32px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #f8f2e6;
    background: rgba(8, 12, 18, 0.58);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
    backdrop-filter: blur(18px) saturate(1.15);
  }

  .project-number {
    display: inline-grid;
    width: 40px;
    height: 40px;
    place-items: center;
    border: 1px solid rgba(224, 190, 115, 0.42);
    border-radius: 50%;
    color: #e0be73;
    font-weight: 800;
  }

  .project-icon {
    display: block;
    width: 52px;
    height: 52px;
    object-fit: contain;
    image-rendering: pixelated;
    filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.38));
  }

  .project-card h2 {
    margin: 22px 0 12px;
    font-size: clamp(2rem, 4vw, 3.8rem);
    line-height: 0.95;
  }

  .project-card p {
    margin: 0;
    color: rgba(245, 241, 232, 0.78);
    font-size: 1rem;
    line-height: 1.7;
  }

  .project-card ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0;
    margin: 24px 0;
    list-style: none;
  }

  .project-card li {
    padding: 7px 10px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 999px;
    color: rgba(245, 241, 232, 0.86);
    background: rgba(255, 255, 255, 0.08);
    font-size: 0.78rem;
    font-weight: 700;
  }

  .project-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 0 14px;
    margin-top: 24px;
    border: 1px solid rgba(224, 190, 115, 0.46);
    border-radius: 999px;
    color: #e0be73;
    background: rgba(224, 190, 115, 0.1);
    font-size: 0.86rem;
    font-weight: 800;
  }

  .project-card a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 16px;
    border: 1px solid rgba(224, 190, 115, 0.46);
    border-radius: 999px;
    color: #0a0c10;
    background: #e0be73;
    font-weight: 800;
    text-decoration: none;
    transition:
      transform 180ms ease,
      background-color 180ms ease;
  }

  .project-card a:hover {
    background: #fff1c4;
    transform: translateY(-2px);
  }

  .project-card a:focus-visible,
  .contact-chip:focus-visible {
    outline: 3px solid rgba(255, 241, 196, 0.72);
    outline-offset: 4px;
  }

  .contact-stop {
    display: flex;
    min-height: 78vh;
    align-items: center;
    justify-content: flex-start;
  }

  .liquid-contact {
    position: relative;
    width: min(680px, 100%);
    padding: clamp(24px, 4vw, 42px);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 24px;
    color: #fff9ed;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05)),
      rgba(10, 14, 20, 0.48);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.28),
      inset 0 -60px 80px rgba(224, 190, 115, 0.06),
      0 34px 90px rgba(0, 0, 0, 0.42);
    backdrop-filter: blur(24px) saturate(1.45);
  }

  .liquid-contact::before {
    position: absolute;
    inset: -40% -20% auto;
    height: 70%;
    content: "";
    background:
      radial-gradient(circle at 18% 20%, rgba(255, 255, 255, 0.38), transparent 26%),
      radial-gradient(circle at 75% 40%, rgba(224, 190, 115, 0.24), transparent 28%);
    opacity: 0.9;
    pointer-events: none;
  }

  .liquid-contact::after {
    position: absolute;
    inset: 1px;
    content: "";
    border-radius: 23px;
    background: linear-gradient(140deg, rgba(255, 255, 255, 0.18), transparent 38%);
    mask: linear-gradient(#000, transparent 46%);
    pointer-events: none;
  }

  .liquid-contact > * {
    position: relative;
    z-index: 1;
  }

  .liquid-contact h2 {
    max-width: 8ch;
    font-size: clamp(3.4rem, 9vw, 7rem);
  }

  .contact-copy {
    max-width: 430px;
    margin: 0;
    color: rgba(245, 241, 232, 0.76);
    font-size: clamp(1rem, 2vw, 1.15rem);
    line-height: 1.7;
  }

  .contact-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 28px;
  }

  .contact-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    gap: 10px;
    padding: 0 16px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 999px;
    color: #fff9ed;
    background: rgba(255, 255, 255, 0.12);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      0 14px 30px rgba(0, 0, 0, 0.22);
    font: inherit;
    font-size: 0.92rem;
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
    backdrop-filter: blur(14px) saturate(1.3);
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background-color 180ms ease;
  }

  .contact-chip:hover {
    border-color: rgba(224, 190, 115, 0.46);
    background: rgba(224, 190, 115, 0.16);
    transform: translateY(-2px);
  }

  .contact-chip svg {
    width: 19px;
    height: 19px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  @media (max-width: 720px) {
    .content-layer {
      padding-inline: 16px;
    }

    .intro {
      align-content: start;
      padding-top: 16vh;
    }

    .project-stop,
    .project-stop.align-right {
      align-items: end;
      justify-content: center;
      min-height: 96vh;
      padding-bottom: 18vh;
    }

    .project-card {
      width: 100%;
    }

    .contact-stop {
      align-items: center;
      justify-content: flex-start;
      min-height: 76vh;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(html) {
      scroll-behavior: auto;
    }

    .project-card a,
    .contact-chip,
    .progress-track span {
      transition: none;
    }
  }
</style>
