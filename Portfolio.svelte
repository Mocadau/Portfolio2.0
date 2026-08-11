<script>
  import { onMount, tick } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import Lenis from 'lenis';
  import { fade } from 'svelte/transition';
  import performThumb from './src/assets/PerForm/PerformBanner.avif';
  import migrantsThumb from './src/assets/Migrants/GlobeOverview.png';
  import alignspaceThumb from './src/assets/Alignspace/Ubersicht.png';
  import catchPokemonThumb from './src/assets/Pokemon/CatchPokemonThumb.jpg';
  import {
    introFrameBounds,
    walkingFrameBounds
  } from './src/assets/portfolioFrameBounds.js';

  const BACKGROUND_FRAME_COUNT = 29;
  const CHARACTER_FRAME_COUNT = 30;
  const FINAL_INTRO_FRAME_COUNT = 42;
  const INITIAL_FRAME_COUNT = 3;
  const FRAME_LOAD_CONCURRENCY = 4;
  const CHARACTER_HEIGHT_RATIO = 0.75;
  const CONSTANT_ANIMATION_FPS = 18;
  const INTRO_SMOOTH_FPS = 18;
  const INTRO_SCROLL_PIXELS_PER_FRAME = 52;
  const INTRO_DROP_END_FRAME = 6;
  const INTRO_NAV_CONTACT_Y = 10;
  const INTRO_TO_WALK_PAUSE_MS = 500;
  const SCROLL_IDLE_TAIL_MS = 900;
  const MINIMUM_LOADER_MS = 420;
  const LASER_INTRO_FRAMES = [1, 2, 3, 4, 5, 9, 12];
  const LASER_POINTER_FRAMES = Array.from({ length: 12 }, (_, index) => index + 13);
  const LASER_OUTRO_FRAMES = Array.from({ length: 5 }, (_, index) => index + 25);
  const LASER_FRAME_NUMBERS = [
    ...new Set([...LASER_INTRO_FRAMES, ...LASER_POINTER_FRAMES, ...LASER_OUTRO_FRAMES])
  ];
  const LASER_INTRO_FRAME_MS = 155;
  const LASER_OUTRO_FRAME_MS = 220;
  const LASER_POINTER_HOLD_MS = 115;
  const LASER_POINTER_START = 0.2;
  const LASER_OUTRO_START = 0.86;
  const WORK_PIN_DISTANCE = 1400;

  /*
    Browser-safe paths for Vite/localhost. These are the only paths the
    animation preloads; removed lowercase backgroundXX/walkingXX attempts
    permanently to avoid 404 preload errors.
    /portfolio-assets/Background/02.webp ... /portfolio-assets/Background/30.webp
    /portfolio-assets/Walking/01.webp ... /portfolio-assets/Walking/30.webp
    /portfolio-assets/FinalIntro/01.webp ... /portfolio-assets/FinalIntro/42.webp
    /portfolio-assets/Laserpointer/01.webp, 02.webp, 03.webp, 04.webp, 05.webp, 09.webp, 12.webp ... 29.webp
  */
  export let assetBase = '/portfolio-assets';

  const projects = [
    {
      title: 'Catch Pokémon',
      category: 'university',
      description:
        'A liquid-glass city exploration interface built from my semester abroad in Warsaw.',
      longDescription:
        'Mapped encounters, escape sequences, and collectible Pokemon records turn the city into a small interactive discovery system.',
      tags: ['Pokemon', 'Liquid Glass', 'Warsaw'],
      href: '/pokemon-case',
      thumbnail: catchPokemonThumb,
      status: 'Live',
      side: 'left',
      pointerTarget: { x: 28, y: 30 },
      cta: 'Open Catch Pokémon'
    },
    {
      title: 'PerForm',
      category: 'university',
      description: 'A VR fitness app for safer exercises with body tracking and real-time feedback.',
      longDescription:
        'PerForm uses virtual training environments, posture detection, and step-by-step corrections to help beginners train with more control.',
      tags: ['VR', 'Fitness', 'Invention Design'],
      href: '/perform',
      thumbnail: performThumb,
      status: 'Case study',
      side: 'left',
      pointerTarget: { x: 24, y: 50 },
      cta: 'Open PerForm'
    },
    {
      title: 'Global Missing Migrants',
      category: 'university',
      description: 'An interactive 3D globe visualizing migration routes, incidents, and patterns.',
      longDescription:
        'The project maps Missing Migrants data onto a globe to make risk zones, timelines, and human stories behind the statistics visible.',
      tags: ['Data Viz', 'Three.js', 'Research'],
      href: '/migrants',
      thumbnail: migrantsThumb,
      status: 'Case study',
      side: 'left',
      pointerTarget: { x: 30, y: 70 },
      cta: 'Open Migrants'
    },
    {
      title: 'Alignspace',
      category: 'university',
      description: 'A workspace booking platform for hybrid teams, desks, rooms, and services.',
      longDescription:
        'Alignspace turns booking, team visibility, service support, and flexible workday planning into one clear product experience.',
      tags: ['UX Design', 'Prototype', 'Workspace'],
      href: '/alignspace',
      thumbnail: alignspaceThumb,
      status: 'Case study',
      side: 'right',
      pointerTarget: { x: 70, y: 30 },
      cta: 'Open Alignspace'
    }
  ];
  const workCategories = [
    { id: 'university', label: 'University work' },
    { id: 'independent', label: 'Independent work' }
  ];
  const PROJECT_WHEEL_START_ANGLE = -90;
  const PROJECT_WHEEL_DRAG_THRESHOLD = 6;

  const aboutPanels = [
    {
      align: 'left',
      kicker: 'About me',
      title: 'I turn ideas into things people can use.',
      body:
        'I move from concept and visual direction to prototype and implementation — building websites, interactive experiences, and experiments that connect design with technology.'
    },
    {
      align: 'right',
      kicker: 'How I work',
      title: 'From Figma to a working build.',
      body:
        'I design in Figma, build in VS Code, shape visuals with Adobe and Blender, and use Codex and other AI tools to move quickly from rough ideas to testable results.'
    },
    {
      align: 'left',
      kicker: 'AI & making',
      title: 'AI expands what I can make.',
      body:
        'I combine AI tools with design judgment, prompting, and hands-on building. That helps me explore unfamiliar fields, prototype faster, and realize a wide range of ideas.'
    }
  ];
  const introTitle = 'Interaction Designer based in Germany.';
  let introCharacterOffset = 0;
  const introWords = introTitle.split(' ').map((word) => {
    const start = introCharacterOffset;
    introCharacterOffset += word.length + 1;
    return { word, start };
  });

  let ready = false;
  let loadError = '';
  let loadedCount = 0;
  let frameIndex = 0;
  let scrollProgress = 0;
  let emailCopied = false;
  let activeSection = 'about';
  let workState = 'walking';
  let pendingNavSection = null;
  let navJumpInProgress = false;

  let viewport;
  let projectScene;
  let projectStage;
  let projectWheel;
  let aboutSection;
  let contactSection;
  let backgroundCanvas;
  let characterCanvas;
  let backgroundContext;
  let characterContext;
  let backgroundImages = Array(BACKGROUND_FRAME_COUNT).fill(null);
  let characterImages = Array(CHARACTER_FRAME_COUNT).fill(null);
  let finalIntroImages = Array(FINAL_INTRO_FRAME_COUNT).fill(null);
  const characterBounds = walkingFrameBounds;
  const finalIntroBounds = introFrameBounds;
  let introAssetsPromise = null;
  let walkingAssetsPromise = null;
  let rafId = 0;
  let introRafId = 0;
  let frameCursor = 0;
  let introFrameIndex = 0;
  let introFrameCursor = 0;
  let introTargetFrame = 0;
  let introComplete = false;
  let introScrollAccumulator = 0;
  let walkingUnlockedAt = 0;
  let touchStartY = 0;
  let scrollDirection = 1;
  let lastScrollY = 0;
  let activeUntil = 0;
  let lastFrameTime = 0;
  let introLastFrameTime = 0;
  let lastViewportWidth = 0;
  let lastViewportHeight = 0;
  let lenis;
  let lenisTicker;
  let lenisActivationTimer = 0;
  let workMatchMedia;
  let workTimeline;
  let storyTimeline;
  let contactTimeline;
  let projectWheelRotation = 0;
  let projectWheelDragging = false;
  let projectWheelDidDrag = false;
  let projectWheelSuppressClick = false;
  let projectWheelPointerId = null;
  let projectWheelStartX = 0;
  let projectWheelStartY = 0;
  let projectWheelLastAngle = 0;
  let projectWheelMotionRafId = 0;
  let projectWheelMotionToken = 0;
  let activeWorkCategory = 'university';
  let visibleProjects = projects.filter((project) => project.category === activeWorkCategory);
  let projectWheelStep = 360 / visibleProjects.length;
  let projectWheelSlotStyles = [];
  let projectWheelFocusIndex = 0;
  let projectWheelFocusProject = visibleProjects[0];
  let laserCharacter;
  let laserVisible = false;
  let laserInteractive = false;
  let laserCursorVisible = false;
  let laserFrameNumber = 12;
  let laserDotX = -120;
  let laserDotY = -120;
  let laserLastDotX = -120;
  let laserLastDotY = -120;
  let laserTailAngle = 0;
  let laserTailLength = 34;
  let laserMouseX = 0;
  let laserMouseY = 0;
  let laserSequenceTimer = 0;
  let laserSequenceToken = 0;
  let laserAssetsReady = false;
  let laserAssetsPromise = null;
  let laserPointerRafId = 0;
  let laserHoldUntil = 0;
  let laserScrollLockedUntil = 0;
  let laserLockedScrollY = 0;
  let laserLockTimer = 0;
  let laserPhase = 'idle';

  $: percentLoaded = Math.round((loadedCount / INITIAL_FRAME_COUNT) * 100);
  $: visibleProjects = projects.filter((project) => project.category === activeWorkCategory);
  $: projectWheelStep = 360 / Math.max(visibleProjects.length, 1);
  $: projectWheelSlotStyles = visibleProjects.map((_, index) =>
    getProjectWheelSlotStyle(index, projectWheelRotation)
  );
  $: projectWheelFocusIndex = getProjectWheelFocusIndex(projectWheelRotation);
  $: projectWheelFocusProject = visibleProjects[projectWheelFocusIndex] ?? visibleProjects[0];

  const padFrame = (frame) => String(frame).padStart(2, '0');
  const positiveModulo = (value, divisor) => ((value % divisor) + divisor) % divisor;
  const emailAddress = 'maurice.cadau@hfg-gmuend.de';

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

  function handleLiquidPointerMove(event) {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const mx = (x / rect.width) * 100;
    const my = (y / rect.height) * 100;
    const rx = ((y / rect.height) - 0.5) * -8;
    const ry = ((x / rect.width) - 0.5) * 10;

    target.style.setProperty('--mx', `${mx}%`);
    target.style.setProperty('--my', `${my}%`);
    target.style.setProperty('--rx', `${rx}deg`);
    target.style.setProperty('--ry', `${ry}deg`);
  }

  function handleLiquidPointerLeave(event) {
    const target = event.currentTarget;

    target.style.setProperty('--mx', '50%');
    target.style.setProperty('--my', '18%');
    target.style.setProperty('--rx', '0deg');
    target.style.setProperty('--ry', '0deg');
  }

  function getProjectWheelSlotStyle(index, rotation) {
    const angle = rotation + PROJECT_WHEEL_START_ANGLE + index * projectWheelStep;
    const radians = angle * (Math.PI / 180);
    const left = 50 + Math.cos(radians) * 37.5;
    const top = 50 + Math.sin(radians) * 34;
    const depth = (Math.sin(radians) + 1) / 2;
    const scale = 0.96 + depth * 0.04;
    const opacity = 0.86 + depth * 0.14;
    const layer = Math.round(1 + depth * 4);

    return `--slot-left: ${left.toFixed(3)}%; --slot-top: ${top.toFixed(3)}%; --slot-scale: ${scale.toFixed(3)}; --slot-opacity: ${opacity.toFixed(3)}; --slot-layer: ${layer}; --float-delay: ${(-index * 0.72).toFixed(2)}s;`;
  }

  function normalizeProjectWheelDelta(value) {
    return ((value + 540) % 360) - 180;
  }

  function getProjectWheelFocusIndex(rotation) {
    let closestIndex = 0;
    let closestDistance = Infinity;

    visibleProjects.forEach((_, index) => {
      const angle = rotation + PROJECT_WHEEL_START_ANGLE + index * projectWheelStep;
      const distance = Math.abs(normalizeProjectWheelDelta(angle + 90));

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  function getProjectWheelPointerAngle(event) {
    const rect = projectWheel?.getBoundingClientRect();

    if (!rect) {
      return 0;
    }

    return Math.atan2(
      event.clientY - (rect.top + rect.height / 2),
      event.clientX - (rect.left + rect.width / 2)
    ) * (180 / Math.PI);
  }

  function usesCompactProjectRail() {
    return window.matchMedia?.('(max-width: 720px)').matches ?? false;
  }

  function prefersReducedProjectMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  function cancelProjectWheelMotion() {
    projectWheelMotionToken += 1;

    if (projectWheelMotionRafId) {
      cancelAnimationFrame(projectWheelMotionRafId);
      projectWheelMotionRafId = 0;
    }
  }

  function settleProjectWheelAt(rotation) {
    const normalizedRotation = normalizeProjectWheelDelta(rotation);

    projectWheelMotionRafId = 0;
    projectWheelRotation = Math.abs(normalizedRotation) < 0.001 ? 0 : normalizedRotation;
  }

  function animateProjectWheelTo(targetRotation, duration = 360) {
    cancelProjectWheelMotion();

    const motionToken = projectWheelMotionToken;
    const startRotation = projectWheelRotation;
    const delta = targetRotation - startRotation;

    if (prefersReducedProjectMotion() || Math.abs(delta) < 0.001) {
      settleProjectWheelAt(targetRotation);
      return;
    }

    const startedAt = performance.now();

    const step = (timestamp) => {
      if (motionToken !== projectWheelMotionToken) {
        return;
      }

      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      projectWheelRotation = startRotation + delta * eased;

      if (progress < 1) {
        projectWheelMotionRafId = requestAnimationFrame(step);
        return;
      }

      settleProjectWheelAt(targetRotation);
    };

    projectWheelMotionRafId = requestAnimationFrame(step);
  }

  function snapProjectWheel() {
    const target = Math.round(projectWheelRotation / projectWheelStep) * projectWheelStep;
    animateProjectWheelTo(target, 320);
  }

  async function selectWorkCategory(category) {
    if (category === activeWorkCategory) {
      return;
    }

    cancelProjectWheelMotion();
    projectWheelDragging = false;
    projectWheelRotation = 0;
    activeWorkCategory = category;
    await tick();
    setupWorkScrollScene();
  }

  function handleProjectWheelPointerDown(event) {
    if (
      visibleProjects.length < 2 ||
      usesCompactProjectRail() ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }

    projectWheelDragging = true;
    projectWheelDidDrag = false;
    projectWheelSuppressClick = false;
    projectWheelPointerId = event.pointerId;
    projectWheelStartX = event.clientX;
    projectWheelStartY = event.clientY;
    projectWheelLastAngle = getProjectWheelPointerAngle(event);
  }

  function handleProjectWheelPointerMove(event) {
    if (!projectWheelDragging || event.pointerId !== projectWheelPointerId) {
      return;
    }

    const currentAngle = getProjectWheelPointerAngle(event);
    const distance = Math.hypot(
      event.clientX - projectWheelStartX,
      event.clientY - projectWheelStartY
    );

    if (!projectWheelDidDrag && distance < PROJECT_WHEEL_DRAG_THRESHOLD) {
      return;
    }

    if (!projectWheelDidDrag) {
      cancelProjectWheelMotion();
      projectWheelDidDrag = true;
      projectWheel?.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();

    const angleDelta = normalizeProjectWheelDelta(currentAngle - projectWheelLastAngle);

    projectWheelRotation += angleDelta;
    projectWheelLastAngle = currentAngle;
  }

  function finishProjectWheelDrag(event) {
    if (!projectWheelDragging || event.pointerId !== projectWheelPointerId) {
      return;
    }

    const didDrag = projectWheelDidDrag;
    projectWheelDragging = false;
    projectWheelPointerId = null;
    if (projectWheel?.hasPointerCapture?.(event.pointerId)) {
      projectWheel.releasePointerCapture(event.pointerId);
    }
    projectWheelSuppressClick = didDrag;

    if (didDrag) {
      snapProjectWheel();
      window.setTimeout(() => {
        projectWheelSuppressClick = false;
      }, 160);
    }
  }

  function handleProjectCardClick(event) {
    if (!projectWheelSuppressClick) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    projectWheelSuppressClick = false;
  }

  function handleProjectWheelKeydown(event) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (visibleProjects.length < 2) {
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const currentSlot = Math.round(projectWheelRotation / projectWheelStep);
      animateProjectWheelTo((currentSlot + direction) * projectWheelStep);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      animateProjectWheelTo(0);
    }
  }

  function preventProjectWheelNativeDrag(event) {
    event.preventDefault();
  }

  function updateActiveSection() {
    if (workState === 'work-pinned') {
      activeSection = 'work';
      return;
    }

    const workRect = projectStage?.getBoundingClientRect();
    const contactRect = contactSection?.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;

    const contactActivationLine = usesCompactProjectRail() ? 0.34 : 0.64;

    if (contactRect && contactRect.top <= viewportHeight * contactActivationLine) {
      activeSection = 'contact';
      return;
    }

    if (
      workRect &&
      workRect.top <= viewportHeight * 0.62 &&
      workRect.bottom >= viewportHeight * 0.38
    ) {
      activeSection = 'work';
      return;
    }

    activeSection = 'about';
  }

  function backgroundPath(index) {
    return `${assetBase}/Background/${padFrame(index + 2)}.webp`;
  }

  function characterPath(index) {
    return `${assetBase}/Walking/${padFrame(index + 1)}.webp`;
  }

  function finalIntroPath(index) {
    return `${assetBase}/FinalIntro/${padFrame(index + 1)}.webp`;
  }

  function laserPathForFrame(frame) {
    return `${assetBase}/Laserpointer/${padFrame(frame)}.webp`;
  }

  function loadImage(src, trackProgress = true) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.decoding = 'async';
      image.onload = async () => {
        try {
          await image.decode?.();
        } catch {
          // Some browsers reject decode after load for cached images; the image is still usable.
        }

        if (trackProgress) {
          loadedCount += 1;
        }
        resolve(image);
      };
      image.onerror = () => reject(new Error(`Unable to preload ${src}`));
      image.src = src;
    });
  }

  function preloadInitialFrames() {
    return Promise.all([
      loadImage(backgroundPath(0)),
      loadImage(characterPath(0)),
      loadImage(finalIntroPath(0))
    ]);
  }

  async function preloadFrameSequence(images, frameCount, pathForFrame) {
    let nextIndex = 1;
    const workerCount = Math.min(FRAME_LOAD_CONCURRENCY, frameCount - 1);

    await Promise.all(Array.from({ length: workerCount }, async () => {
      while (nextIndex < frameCount) {
        const index = nextIndex;
        nextIndex += 1;

        try {
          images[index] = await loadImage(pathForFrame(index), false);
        } catch {
          // The nearest loaded frame remains available as a visual fallback.
        }
      }
    }));
  }

  function ensureIntroAssets() {
    if (!introAssetsPromise) {
      introAssetsPromise = preloadFrameSequence(
        finalIntroImages,
        FINAL_INTRO_FRAME_COUNT,
        finalIntroPath
      );
    }

    return introAssetsPromise;
  }

  function ensureWalkingAssets() {
    if (!walkingAssetsPromise) {
      walkingAssetsPromise = Promise.all([
        preloadFrameSequence(backgroundImages, BACKGROUND_FRAME_COUNT, backgroundPath),
        preloadFrameSequence(characterImages, CHARACTER_FRAME_COUNT, characterPath)
      ]);
    }

    return walkingAssetsPromise;
  }

  function ensureLaserAssets() {
    if (laserAssetsReady) {
      return Promise.resolve(true);
    }

    if (!laserAssetsPromise) {
      laserAssetsPromise = Promise.all(
        LASER_FRAME_NUMBERS.map((frame) => loadImage(laserPathForFrame(frame), false))
      ).then(() => {
        laserAssetsReady = true;
        return true;
      }).catch(() => {
        laserAssetsPromise = null;
        return false;
      });
    }

    return laserAssetsPromise;
  }

  function isFinePointerDevice() {
    return window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;
  }

  function setLaserCursor(active) {
    laserCursorVisible = active && isFinePointerDevice();
    document.body.classList.toggle('laser-cursor-active', laserCursorVisible);
  }

  function clearLaserSequence() {
    laserSequenceToken += 1;

    if (laserSequenceTimer) {
      window.clearTimeout(laserSequenceTimer);
      laserSequenceTimer = 0;
    }
  }

  function clearLaserScrollLockTimer() {
    if (laserLockTimer) {
      window.clearTimeout(laserLockTimer);
      laserLockTimer = 0;
    }
  }

  function cancelLaserPointerFrame() {
    if (laserPointerRafId) {
      cancelAnimationFrame(laserPointerRafId);
      laserPointerRafId = 0;
    }
  }

  function hideLaserpointer() {
    clearLaserSequence();
    cancelLaserPointerFrame();
    laserVisible = false;
    laserInteractive = false;
    laserPhase = 'idle';
    laserScrollLockedUntil = 0;
    laserLockedScrollY = 0;
    clearLaserScrollLockTimer();
    laserFrameNumber = 12;
    laserDotX = -120;
    laserDotY = -120;
    laserLastDotX = -120;
    laserLastDotY = -120;
    laserTailAngle = 0;
    laserTailLength = 34;
    setLaserCursor(false);
  }

  function finishLaserOutro() {
    const targetSection = pendingNavSection;

    clearLaserSequence();
    cancelLaserPointerFrame();
    laserInteractive = false;
    laserVisible = false;
    laserPhase = 'outro-complete';
    laserScrollLockedUntil = 0;
    laserLockedScrollY = 0;
    clearLaserScrollLockTimer();
    setLaserCursor(false);
    workState = 'walking';
    activeUntil = performance.now() + SCROLL_IDLE_TAIL_MS;
    lastScrollY = window.scrollY || window.pageYOffset || 0;
    lenis?.start?.();
    ScrollTrigger.update();
    if (!rafId) {
      lastFrameTime = 0;
      rafId = requestAnimationFrame(renderLoop);
    }

    if (targetSection) {
      pendingNavSection = null;
      navJumpInProgress = true;
      requestAnimationFrame(() => {
        navigateToPortfolioSection(targetSection, true);
        ScrollTrigger.update();
        requestAnimationFrame(() => {
          navJumpInProgress = false;
        });
      });
    }
  }

  function playLaserSequence(frames, frameDuration, onComplete) {
    clearLaserSequence();

    const token = laserSequenceToken;
    let index = 0;

    const step = () => {
      if (token !== laserSequenceToken) {
        return;
      }

      laserFrameNumber = frames[index];
      index += 1;

      if (index >= frames.length) {
        laserSequenceTimer = 0;
        onComplete?.();
        return;
      }

      laserSequenceTimer = window.setTimeout(step, frameDuration);
    };

    step();
  }

  function startLaserIntro() {
    if (
      pendingNavSection ||
      navJumpInProgress ||
      laserPhase === 'intro' ||
      laserPhase === 'pointer'
    ) {
      return;
    }

    if (!laserAssetsReady) {
      ensureLaserAssets().then((assetsReady) => {
        if (assetsReady && workState === 'work-pinned' && !laserVisible) {
          startLaserIntro();
        }
      });
      return;
    }

    laserVisible = true;
    laserInteractive = false;
    laserPhase = 'intro';
    clearLaserScrollLockTimer();
    laserLockedScrollY = 0;
    laserScrollLockedUntil = 0;
    laserFrameNumber = LASER_INTRO_FRAMES[0];
    setLaserCursor(false);

    playLaserSequence(LASER_INTRO_FRAMES, LASER_INTRO_FRAME_MS, () => {
      if (laserPhase === 'intro') {
        activateLaserPointer();
      }
    });
  }

  function activateLaserPointer() {
    clearLaserSequence();
    laserVisible = true;
    laserPhase = 'pointer';
    laserFrameNumber = laserFrameNumber < 13 || laserFrameNumber > 24 ? 12 : laserFrameNumber;

    if (!isFinePointerDevice()) {
      laserInteractive = false;
      setLaserCursor(false);
      return;
    }

    laserInteractive = true;
    setLaserCursor(true);

    if (!laserMouseX && !laserMouseY) {
      laserMouseX = window.innerWidth / 2;
      laserMouseY = window.innerHeight / 2;
      laserDotX = laserMouseX;
      laserDotY = laserMouseY;
      laserLastDotX = laserMouseX;
      laserLastDotY = laserMouseY;
    }

    scheduleLaserPointerFrame();
  }

  function startLaserOutro(lockAtCurrentPosition = false) {
    if (laserPhase === 'outro' || laserPhase === 'outro-complete') {
      return;
    }

    clearLaserSequence();
    cancelLaserPointerFrame();
    laserVisible = true;
    laserInteractive = false;
    laserPhase = 'outro';
    setLaserCursor(false);

    if (lockAtCurrentPosition) {
      laserLockedScrollY = window.scrollY || window.pageYOffset || 0;
      laserScrollLockedUntil = Number.POSITIVE_INFINITY;
      lastScrollY = laserLockedScrollY;
      lenis?.stop?.();
      hardScrollTo(laserLockedScrollY);
    } else {
      laserLockedScrollY = 0;
      laserScrollLockedUntil = 0;
    }

    playLaserSequence(LASER_OUTRO_FRAMES, LASER_OUTRO_FRAME_MS, finishLaserOutro);
  }

  function startLaserIntroOnBackscroll(currentScrollY) {
    if (
      navJumpInProgress ||
      scrollDirection >= 0 ||
      !introComplete ||
      laserVisible ||
      laserPhase === 'intro' ||
      isLaserScrollLocked()
    ) {
      return;
    }

    const trigger = ScrollTrigger.getById('work-stage');

    if (!trigger || currentScrollY > trigger.end || currentScrollY < trigger.start) {
      return;
    }

    activeSection = 'work';
    workState = 'work-pinned';
    startLaserIntro();
  }

  function handleWorkStageUpdate(self) {
    if (!laserVisible) {
      return;
    }

    if (self.direction > 0 && self.progress >= LASER_OUTRO_START) {
      startLaserOutro(true);
      return;
    }

    if (
      self.progress >= LASER_POINTER_START &&
      self.progress < LASER_OUTRO_START &&
      laserPhase !== 'intro' &&
      laserPhase !== 'pointer'
    ) {
      if (self.direction < 0 && laserPhase === 'outro-complete') {
        startLaserIntro();
        return;
      }

      activateLaserPointer();
      return;
    }

    if (
      (laserPhase === 'outro' || laserPhase === 'outro-complete') &&
      self.direction < 0 &&
      self.progress < LASER_OUTRO_START
    ) {
      startLaserIntro();
    }
  }

  function getLaserAnchor() {
    const rect = laserCharacter?.getBoundingClientRect();

    if (!rect) {
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.58
      };
    }

    return {
      x: rect.left + rect.width * 0.5,
      y: rect.top + rect.height * 0.42
    };
  }

  function getLaserFrameForMousePosition(mouseX, mouseY) {
    const anchor = getLaserAnchor();
    const dx = mouseX - anchor.x;
    const dy = mouseY - anchor.y;

    if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
      return laserFrameNumber;
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (angle >= -20 && angle < 20) return 15;
    if (angle >= 20 && angle < 50) return 14;
    if (angle >= 50 && angle < 82) return 13;
    if (angle >= 82 && angle < 112) return 24;
    if (angle >= 112 && angle < 145) return 23;
    if (angle >= 145 || angle < -160) return 22;
    if (angle >= -160 && angle < -130) return 21;
    if (angle >= -130 && angle < -100) return 20;
    if (angle >= -100 && angle < -72) return 19;
    if (angle >= -72 && angle < -48) return 18;
    if (angle >= -48 && angle < -28) return 17;

    return 16;
  }

  function updateLaserPointerFrame() {
    laserPointerRafId = 0;

    if (!laserInteractive || laserPhase !== 'pointer') {
      return;
    }

    const nextFrame = getLaserFrameForMousePosition(laserMouseX, laserMouseY);
    const now = performance.now();

    if (nextFrame !== laserFrameNumber && now < laserHoldUntil) {
      scheduleLaserPointerFrame();
      return;
    }

    if (nextFrame !== laserFrameNumber) {
      laserFrameNumber = nextFrame;
      laserHoldUntil = now + LASER_POINTER_HOLD_MS;
    }
  }

  function scheduleLaserPointerFrame() {
    if (laserPointerRafId) {
      return;
    }

    laserPointerRafId = requestAnimationFrame(updateLaserPointerFrame);
  }

  function handleLaserPointerMove(event) {
    if (!laserVisible) {
      return;
    }

    laserMouseX = event.clientX;
    laserMouseY = event.clientY;

    if (!laserInteractive) {
      return;
    }

    const previousX = laserDotX > -100 ? laserDotX : event.clientX;
    const previousY = laserDotY > -100 ? laserDotY : event.clientY;
    const deltaX = event.clientX - previousX;
    const deltaY = event.clientY - previousY;
    const distance = Math.hypot(deltaX, deltaY);

    laserLastDotX = previousX;
    laserLastDotY = previousY;

    if (distance > 0.5) {
      laserTailAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      laserTailLength = Math.min(150, Math.max(34, distance * 3.4));
    } else {
      laserTailLength = 34;
    }

    laserDotX = event.clientX;
    laserDotY = event.clientY;
    scheduleLaserPointerFrame();
  }

  function isLaserScrollLocked() {
    return workState === 'work-pinned' && laserPhase === 'outro';
  }

  function getLoadedFrame(images, requestedIndex) {
    if (images[requestedIndex]) {
      return { image: images[requestedIndex], index: requestedIndex };
    }

    for (let distance = 1; distance < images.length; distance += 1) {
      const previousIndex = requestedIndex - distance;
      const nextIndex = requestedIndex + distance;

      if (previousIndex >= 0 && images[previousIndex]) {
        return { image: images[previousIndex], index: previousIndex };
      }

      if (nextIndex < images.length && images[nextIndex]) {
        return { image: images[nextIndex], index: nextIndex };
      }
    }

    return null;
  }

  function getMaxScroll() {
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      viewport?.offsetHeight ?? 0
    );

    return Math.max(documentHeight - window.innerHeight, 1);
  }

  function getCurrentScrollProgress() {
    const maxScroll = getMaxScroll();
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const clampedScroll = Math.min(Math.max(scrollY, 0), maxScroll);

    return clampedScroll / maxScroll;
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

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (
      lastViewportWidth &&
      lastViewportHeight &&
      (Math.abs(width - lastViewportWidth) > 16 || Math.abs(height - lastViewportHeight) > 16)
    ) {
      ScrollTrigger.refresh();
    }

    lastViewportWidth = width;
    lastViewportHeight = height;
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

    drawCharacterAtY(context, image, bounds, targetX, targetY, targetWidth, targetHeight);
  }

  function drawCharacterAtY(context, image, bounds, targetX, targetY, targetWidth, targetHeight) {
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

  function getIntroTargetY(frameIndex, height) {
    const baseY = height - height * CHARACTER_HEIGHT_RATIO;

    if (frameIndex >= INTRO_DROP_END_FRAME) {
      return baseY;
    }

    const dropProgress = frameIndex / INTRO_DROP_END_FRAME;
    const easedProgress = 1 - Math.pow(1 - dropProgress, 3);

    return INTRO_NAV_CONTACT_Y + (baseY - INTRO_NAV_CONTACT_Y) * easedProgress;
  }

  function drawIntroFrame(introIndex) {
    if (!ready || !backgroundContext || !characterContext) {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const safeIntroIndex = positiveModulo(introIndex, FINAL_INTRO_FRAME_COUNT);
    const backgroundFrame = getLoadedFrame(backgroundImages, 0);
    const introFrame = getLoadedFrame(finalIntroImages, safeIntroIndex);

    if (!backgroundFrame || !introFrame) {
      return;
    }

    introFrameIndex = safeIntroIndex;
    scrollProgress = 0;
    backgroundContext.clearRect(0, 0, width, height);
    characterContext.clearRect(0, 0, width, height);
    drawImageCover(backgroundContext, backgroundFrame.image, width, height);

    const bounds = finalIntroBounds[introFrame.index];
    const targetHeight = height * CHARACTER_HEIGHT_RATIO;
    const targetWidth = targetHeight * (bounds.sw / bounds.sh);
    const targetX = (width - targetWidth) / 2;
    const targetY = getIntroTargetY(safeIntroIndex, height);

    drawCharacterAtY(
      characterContext,
      introFrame.image,
      bounds,
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
    const backgroundFrame = getLoadedFrame(backgroundImages, backgroundFrameIndex);
    const characterFrame = getLoadedFrame(characterImages, characterFrameIndex);

    if (!backgroundFrame || !characterFrame) {
      return;
    }

    frameIndex = characterFrameIndex;
    scrollProgress = clampedScroll / maxScroll;
    updateActiveSection();

    backgroundContext.clearRect(0, 0, width, height);
    characterContext.clearRect(0, 0, width, height);

    drawImageCover(backgroundContext, backgroundFrame.image, width, height);
    drawCharacterBottomAnchored(
      characterContext,
      characterFrame.image,
      characterBounds[characterFrame.index],
      width,
      height
    );
  }

  function renderStaticFrame() {
    const maxScroll = getMaxScroll();
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const clampedScroll = Math.min(Math.max(scrollY, 0), maxScroll);
    scrollProgress = clampedScroll / maxScroll;
    updateActiveSection();

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

  function finishIntroPlayback() {
    const targetSection = pendingNavSection;

    ensureWalkingAssets();
    introComplete = true;
    introRafId = 0;
    introLastFrameTime = 0;
    introFrameCursor = FINAL_INTRO_FRAME_COUNT - 1;
    introTargetFrame = FINAL_INTRO_FRAME_COUNT - 1;
    walkingUnlockedAt = performance.now() + INTRO_TO_WALK_PAUSE_MS;
    introScrollAccumulator = 0;
    frameCursor = 0;
    lastScrollY = 0;
    activeUntil = 0;

    drawFrame(0, 0);
    lenisActivationTimer = window.setTimeout(() => {
      setupSmoothScroll();

      if (targetSection) {
        pendingNavSection = null;
        requestAnimationFrame(() => navigateToPortfolioSection(targetSection));
      }
    }, INTRO_TO_WALK_PAUSE_MS);
  }

  function renderIntroTowardTarget(timestamp) {
    if (!introLastFrameTime) {
      introLastFrameTime = timestamp;
    }

    const deltaSeconds = Math.min((timestamp - introLastFrameTime) / 1000, 0.06);
    introLastFrameTime = timestamp;

    const distance = introTargetFrame - introFrameCursor;
    const step = INTRO_SMOOTH_FPS * deltaSeconds;

    if (Math.abs(distance) <= step) {
      introFrameCursor = introTargetFrame;
    } else {
      introFrameCursor += Math.sign(distance) * step;
    }

    const nextFrame = Math.min(
      Math.round(introFrameCursor),
      FINAL_INTRO_FRAME_COUNT - 1
    );

    if (nextFrame !== introFrameIndex) {
      drawIntroFrame(nextFrame);
    }

    if (introFrameIndex >= FINAL_INTRO_FRAME_COUNT - 1) {
      finishIntroPlayback();
      return;
    }

    if (introFrameCursor === introTargetFrame) {
      introRafId = 0;
      introLastFrameTime = 0;
      return;
    }

    introRafId = requestAnimationFrame(renderIntroTowardTarget);
  }

  function stepIntroByScroll(delta) {
    if (introComplete || delta <= 0) {
      return;
    }

    introScrollAccumulator += delta;
    introTargetFrame = Math.min(
      Math.floor(introScrollAccumulator / INTRO_SCROLL_PIXELS_PER_FRAME),
      FINAL_INTRO_FRAME_COUNT - 1
    );

    if (!introRafId) {
      introRafId = requestAnimationFrame(renderIntroTowardTarget);
    }
  }

  function hardScrollTo(y) {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    root.style.scrollBehavior = previousScrollBehavior;
  }

  function navigateToPortfolioSection(section, immediate = false) {
    if (section === 'about') {
      if (immediate || !lenis) {
        hardScrollTo(0);
        lastScrollY = 0;
        activeSection = 'about';
        requestStaticRender();
        return;
      }

      lenis.scrollTo(0, { duration: 0.9 });
      return;
    }

    if (section === 'contact') {
      const contactY = contactSection
        ? contactSection.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0)
        : 0;

      if (immediate || !lenis) {
        hardScrollTo(contactY);
        lastScrollY = contactY;
        activeSection = 'contact';
        requestStaticRender();
        return;
      }

      lenis.scrollTo(contactY, { duration: 0.9 });
      return;
    }

    const trigger = ScrollTrigger.getById('work-stage');
    const workY = trigger?.start ?? (projectScene
      ? projectScene.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0)
      : projectStage?.offsetTop ?? 0);

    if (immediate || !lenis) {
      hardScrollTo(workY + 8);
      lastScrollY = workY + 8;
      ScrollTrigger.update();
      return;
    }

    lenis.scrollTo(workY + 8, { duration: 0.95 });
  }

  function resumeWorkPanel() {
    ScrollTrigger.refresh();
    const trigger = ScrollTrigger.getById('work-stage');

    if (!trigger) {
      navigateToPortfolioSection('work', true);
      return;
    }

    const workY = trigger.start + WORK_PIN_DISTANCE * 0.5;
    hardScrollTo(workY);
    lastScrollY = workY;
    ScrollTrigger.update();
    hideLaserpointer();
    workState = 'work-pinned';
    activeSection = 'work';
    laserFrameNumber = 12;
    laserVisible = true;
    laserScrollLockedUntil = 0;
    laserLockedScrollY = 0;
    lenis?.start?.();
    activateLaserPointer();
    requestStaticRender();
    history.replaceState(history.state, '', '/#selected-work');
  }

  function keepPageAtTop() {
    hardScrollTo(0);
    lastScrollY = 0;
  }

  function setupWorkScrollScene() {
    if (!projectScene || !projectStage || typeof window === 'undefined') {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    workTimeline?.kill();
    workMatchMedia?.revert();

    workMatchMedia = gsap.matchMedia();
    workMatchMedia.add('(min-width: 900px)', () => {
      const cards = Array.from(projectStage.querySelectorAll('.project-wheel .project-card'));

      gsap.set(cards, { autoAlpha: 0.96, '--work-y': '8px' });

      workTimeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          id: 'work-stage',
          trigger: projectScene,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          invalidateOnRefresh: true,
          preventOverlaps: true,
          onEnter: () => {
            activeSection = 'work';
            workState = 'work-pinned';
            startLaserIntro();
          },
          onEnterBack: () => {
            activeSection = 'work';
            workState = 'work-pinned';
            startLaserIntro();
          },
          onLeave: () => {
            if (laserVisible && laserPhase !== 'outro-complete') {
              startLaserOutro(true);
              return;
            }
            workState = 'walking';
            updateActiveSection();
          },
          onLeaveBack: () => {
            if (laserVisible && laserPhase !== 'outro') {
              startLaserOutro();
            }
            workState = 'walking';
            updateActiveSection();
          },
          onUpdate: handleWorkStageUpdate
        }
      });

      workTimeline
        .addLabel('approach', 0)
        .to(cards, { autoAlpha: 1, '--work-y': '0px', stagger: 0.035, duration: 0.24 }, 0.03)
        .addLabel('present', 0.48)
        .to({}, { duration: 0.42 })
        .addLabel('release', 0.9);

      return () => {
        workTimeline?.kill();
        workTimeline = null;
      };
    });

    workMatchMedia.add('(max-width: 720px)', () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const getHorizontalTravel = () =>
        projectWheel ? Math.max(0, projectWheel.scrollWidth - projectWheel.clientWidth) : 0;

      const sizeMobileWorkScene = () => {
        const travel = reducedMotion ? 0 : getHorizontalTravel();
        projectScene.style.height = `${window.innerHeight + travel}px`;
        return travel;
      };

      sizeMobileWorkScene();

      const mobileWorkTrigger = ScrollTrigger.create({
        id: 'work-stage-mobile',
        trigger: projectScene,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onRefresh: sizeMobileWorkScene,
        onEnter: () => {
          activeSection = 'work';
          workState = 'work-pinned';
        },
        onEnterBack: () => {
          activeSection = 'work';
          workState = 'work-pinned';
        },
        onUpdate: (self) => {
          if (!projectWheel || reducedMotion) {
            return;
          }

          projectWheel.scrollLeft = getHorizontalTravel() * self.progress;
        },
        onLeave: () => {
          workState = 'walking';
          updateActiveSection();
        },
        onLeaveBack: () => {
          workState = 'walking';
          updateActiveSection();
        }
      });

      return () => {
        mobileWorkTrigger.kill();
        projectScene.style.removeProperty('height');
        if (projectWheel) {
          projectWheel.scrollLeft = 0;
        }
      };
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  function setupNarrativeScrollScenes() {
    if (!aboutSection || !contactSection || typeof window === 'undefined') {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    storyTimeline?.kill();
    contactTimeline?.kill();
    ScrollTrigger.getById('about-walk')?.kill();
    ScrollTrigger.getById('contact-walk')?.kill();

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const panelHoldDuration = window.innerWidth <= 720 ? 1.35 : 0.9;
    const panels = Array.from(aboutSection.querySelectorAll('[data-about-panel]'));
    const contactLayers = Array.from(contactSection.querySelectorAll('[data-contact-layer]'));

    if (reducedMotion || panels.length === 0) {
      gsap.set([...panels, ...contactLayers], { clearProps: 'all' });
      return;
    }

    gsap.set(panels, {
      autoAlpha: 0,
      y: 72,
      scale: 0.965,
      filter: 'blur(12px)'
    });
    gsap.set(panels[0], {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)'
    });

    storyTimeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'about-walk',
        trigger: aboutSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.72,
        invalidateOnRefresh: true
      }
    });

    panels.forEach((panel, index) => {
      const direction = index % 2 === 0 ? -1 : 1;

      storyTimeline.to(panel, { autoAlpha: 1, duration: panelHoldDuration });

      if (index < panels.length - 1) {
        storyTimeline
          .to(panel, {
            autoAlpha: 0,
            x: direction * 64,
            y: -54,
            scale: 0.98,
            filter: 'blur(10px)',
            duration: 0.24
          })
          .fromTo(
            panels[index + 1],
            {
              autoAlpha: 0,
              x: direction * -80,
              y: 72,
              scale: 0.965,
              filter: 'blur(12px)'
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 0.32
            },
            '<0.06'
          );
      } else {
        storyTimeline.to(panel, {
          autoAlpha: 0,
          y: -48,
          filter: 'blur(8px)',
          duration: 0.25
        });
      }
    });

    gsap.set(contactLayers, {
      autoAlpha: 0,
      y: 70,
      filter: 'blur(10px)'
    });

    contactTimeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'contact-walk',
        trigger: contactSection,
        start: 'top 78%',
        end: 'bottom bottom',
        scrub: 0.72,
        invalidateOnRefresh: true,
        onEnter: () => {
          activeSection = 'contact';
        }
      }
    });

    contactLayers.forEach((layer, index) => {
      contactTimeline.fromTo(
        layer,
        {
          autoAlpha: 0,
          y: 70 + index * 8,
          x: index % 2 === 0 ? -24 : 24,
          filter: 'blur(10px)'
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          filter: 'blur(0px)',
          duration: index === 0 ? 0.32 : 0.5
        },
        index === 0 ? 0 : '>-0.16'
      );
    });

    contactTimeline.to(contactLayers, { autoAlpha: 1, duration: 0.5 });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  function setupSmoothScroll() {
    if (lenis || typeof window === 'undefined') {
      return;
    }

    lenis = new Lenis({
      duration: 1.12,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.15,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time))
    });

    lenis.on('scroll', ScrollTrigger.update);

    lenisTicker = (time) => {
      lenis?.raf(time * 1000);
    };

    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();
  }

  function destroyScrollSystems() {
    if (lenisActivationTimer) {
      window.clearTimeout(lenisActivationTimer);
      lenisActivationTimer = 0;
    }

    if (lenisTicker) {
      gsap.ticker.remove(lenisTicker);
      lenisTicker = null;
    }

    lenis?.destroy();
    lenis = null;
    workTimeline?.kill();
    workTimeline = null;
    storyTimeline?.kill();
    storyTimeline = null;
    contactTimeline?.kill();
    contactTimeline = null;
    workMatchMedia?.revert();
    workMatchMedia = null;
    ScrollTrigger.getById('work-stage')?.kill();
    ScrollTrigger.getById('about-walk')?.kill();
    ScrollTrigger.getById('contact-walk')?.kill();
    clearLaserScrollLockTimer();
    hideLaserpointer();
  }

  function preventIntroScroll() {
    if (!introComplete) {
      keepPageAtTop();
    }
  }

  function handleWheel(event) {
    if (introComplete && isLaserScrollLocked()) {
      event.preventDefault();
      return;
    }

    if (introComplete) {
      if (performance.now() < walkingUnlockedAt) {
        event.preventDefault();
        keepPageAtTop();
        return;
      }
    }

    if (introComplete) {
      return;
    }

    event.preventDefault();
    preventIntroScroll();
    stepIntroByScroll(Math.abs(event.deltaY || event.deltaX || 0));
  }

  function handleTouchStart(event) {
    touchStartY = event.touches?.[0]?.clientY ?? 0;
  }

  function handleTouchMove(event) {
    const currentY = event.touches?.[0]?.clientY ?? touchStartY;
    const delta = touchStartY - currentY;

    touchStartY = currentY;

    if (introComplete && isLaserScrollLocked()) {
      event.preventDefault();
      return;
    }

    if (introComplete) {
      if (performance.now() < walkingUnlockedAt) {
        event.preventDefault();
        keepPageAtTop();
        return;
      }

      return;
    }

    event.preventDefault();
    preventIntroScroll();
    stepIntroByScroll(Math.abs(delta));
  }

  function handleIntroKeydown(event) {
    const scrollKeys = new Set([
      ' ',
      'ArrowDown',
      'ArrowUp',
      'PageDown',
      'PageUp',
      'Home',
      'End'
    ]);

    if (!scrollKeys.has(event.key)) {
      return;
    }

    if (introComplete && isLaserScrollLocked()) {
      event.preventDefault();
      return;
    }

    if (introComplete) {
      if (performance.now() < walkingUnlockedAt) {
        event.preventDefault();
        keepPageAtTop();
        return;
      }

      return;
    }

    event.preventDefault();
    preventIntroScroll();
    stepIntroByScroll(120);
  }

  function handleNavClick(event, section) {
    if (!introComplete) {
      event.preventDefault();
      pendingNavSection = section;

      if (section === 'work') {
        ensureLaserAssets();
        ensureWalkingAssets();
      }
      introScrollAccumulator = FINAL_INTRO_FRAME_COUNT * INTRO_SCROLL_PIXELS_PER_FRAME;
      introTargetFrame = FINAL_INTRO_FRAME_COUNT - 1;

      if (!introRafId) {
        introRafId = requestAnimationFrame(renderIntroTowardTarget);
      }

      return;
    }

    event.preventDefault();

    if (!lenis) {
      navigateToPortfolioSection(section, true);
      return;
    }

    if (section !== 'work' && laserVisible) {
      hideLaserpointer();
      workState = 'walking';
    }

    navigateToPortfolioSection(section);
  }

  function handleScroll() {
    if (!introComplete) {
      preventIntroScroll();
      return;
    }

    if (isLaserScrollLocked()) {
      hardScrollTo(laserLockedScrollY);
      lastScrollY = laserLockedScrollY;
      return;
    }

    if (performance.now() < walkingUnlockedAt) {
      keepPageAtTop();
      return;
    }

    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const delta = currentScrollY - lastScrollY;

    if (delta !== 0) {
      scrollDirection = delta > 0 ? 1 : -1;
    }

    lastScrollY = currentScrollY;
    startLaserIntroOnBackscroll(currentScrollY);
    activeUntil = performance.now() + SCROLL_IDLE_TAIL_MS;

    if (rafId) {
      return;
    }

    rafId = requestAnimationFrame(renderLoop);
  }

  function requestStaticRender() {
    if (!introComplete) {
      drawIntroFrame(introFrameIndex);
      return;
    }

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
    const loadingStartedAt = performance.now();
    const previousScrollRestoration = history.scrollRestoration;
    const shouldResumeWork = new URLSearchParams(window.location.search).get('section') === 'work';

    history.scrollRestoration = 'manual';
    hardScrollTo(0);
    lastScrollY = 0;

    preloadInitialFrames()
      .then(async ([initialBackground, initialCharacter, initialIntro]) => {
        if (!mounted) {
          return;
        }

        const minimumLoaderTime = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 240
          : MINIMUM_LOADER_MS;
        const remainingLoaderTime = Math.max(0, minimumLoaderTime - (performance.now() - loadingStartedAt));

        if (remainingLoaderTime > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, remainingLoaderTime));
        }

        if (!mounted) {
          return;
        }

        backgroundImages[0] = initialBackground;
        characterImages[0] = initialCharacter;
        finalIntroImages[0] = initialIntro;
        hardScrollTo(0);
        lastScrollY = 0;
        ready = true;
        ensureIntroAssets();

        await tick();

        if (!mounted) {
          return;
        }

        introComplete = shouldResumeWork;
        introFrameIndex = shouldResumeWork ? FINAL_INTRO_FRAME_COUNT - 1 : 0;
        introFrameCursor = introFrameIndex;
        introTargetFrame = introFrameIndex;
        introScrollAccumulator = 0;
        walkingUnlockedAt = 0;
        resizeCanvases();
        if (shouldResumeWork) {
          frameCursor = 0;
          drawFrame(0, 0);
        } else {
          drawIntroFrame(0);
        }
        setupWorkScrollScene();
        setupNarrativeScrollScenes();
        if (shouldResumeWork) {
          setupSmoothScroll();
          ensureWalkingAssets();
          ensureLaserAssets().then(() => {
            requestAnimationFrame(() => requestAnimationFrame(resumeWorkPanel));
          });
        }
        window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
        window.addEventListener('keydown', handleIntroKeydown, { capture: true });
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
      history.scrollRestoration = previousScrollRestoration;
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('keydown', handleIntroKeydown, { capture: true });
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvases);

      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      if (introRafId) {
        cancelAnimationFrame(introRafId);
      }

      clearLaserSequence();
      cancelLaserPointerFrame();
      cancelProjectWheelMotion();
      document.body.classList.remove('laser-cursor-active');

      destroyScrollSystems();
    };
  });
</script>

<svelte:window
  onpointermove={handleLaserPointerMove}
  onpointerup={finishProjectWheelDrag}
  onpointercancel={finishProjectWheelDrag}
/>

{#if !ready}
  <section class="loading-shell" aria-live="polite" aria-busy="true" transition:fade>
    <div class="loading-panel">
      <div class="loading-signal" style={`--load-angle: ${Math.max(percentLoaded, 2) * 3.6}deg;`} aria-hidden="true">
        <span class="loading-orbit loading-orbit-one"></span>
        <span class="loading-orbit loading-orbit-two"></span>
        <span class="loading-sweep"></span>
        <span class="loading-core">M</span>
        <span class="loading-comet"></span>
      </div>
      <div class="loading-copy">
        <p class="kicker">Mocadau / assembling the world</p>
        <h1>Ideas are<br />coming into orbit.</h1>
      </div>
      <div class="progress-track" aria-hidden="true">
        <span style={`width: ${percentLoaded}%`}></span>
      </div>
      <p class="loading-meta">
        {#if loadError}
          {loadError}
        {:else}
          <span>Loading scenes &amp; motion</span>
          <strong>{String(percentLoaded).padStart(2, '0')}%</strong>
        {/if}
      </p>
    </div>
  </section>
{:else}
  <section
    class="portfolio"
    bind:this={viewport}
    aria-label="Interactive portfolio"
  >
    <div class="canvas-stage">
      <canvas
        bind:this={backgroundCanvas}
        class="background-canvas"
        id="background-canvas"
        aria-hidden="true"
      ></canvas>

      <canvas
        bind:this={characterCanvas}
        class="character-canvas"
        class:character-canvas-muted={laserVisible}
        id="character-canvas"
        aria-hidden="true"
      ></canvas>
    </div>

    <nav class="site-nav" class:contact-mode={activeSection === 'contact'} aria-label="Portfolio navigation">
      <div class="nav-links liquid-glass-strong">
        <a
          class:active-nav={activeSection === 'about'}
          href="#portfolio-title"
          onclick={(event) => handleNavClick(event, 'about')}
        >
          About
        </a>
        <a
          class:active-nav={activeSection === 'work'}
          href="#selected-work"
          onclick={(event) => handleNavClick(event, 'work')}
        >
          Work
        </a>
        <a
          class:active-nav={activeSection === 'contact'}
          href="#contact"
          onclick={(event) => handleNavClick(event, 'contact')}
        >
          Contact
        </a>
      </div>
    </nav>

    <main class="content-layer">
      <section class="intro" aria-labelledby="portfolio-title">
        <p class="kicker">Hello, I'm Maurice</p>
        <h1 id="portfolio-title" class="intro-written-title" aria-label={introTitle}>
          <span aria-hidden="true">
            {#each introWords as item}
              <span class="intro-word">
                {#each Array.from(item.word) as character, characterIndex}
                  <span
                    class="intro-glyph"
                    style={`--glyph-index: ${item.start + characterIndex};`}
                  >{character}</span>
                {/each}
              </span>
            {/each}
            <span class="intro-pen" aria-hidden="true"></span>
          </span>
        </h1>
        <p>
          I design and build websites, interactive prototypes, and AI-assisted ideas.
          <br />
          Available for commissions · Bachelor&rsquo;s degree expected October 2026.
        </p>
      </section>

      <section
        id="about"
        class="about-sequence"
        bind:this={aboutSection}
        aria-label="About Maurice"
      >
        <div class="about-sequence-stage">
          <div class="about-worlds">
            {#each aboutPanels as panel, index}
              <article
                class={`about-world about-world-${index + 1} about-world-${panel.align}`}
                data-about-panel
              >
                <div class="about-world-copy">
                  <span class="about-world-number">0{index + 1}</span>
                  <p class="kicker">{panel.kicker}</p>
                  <h2>{panel.title}</h2>
                  {#if panel.body}<p>{panel.body}</p>{/if}
                </div>

                {#if index === 0}
                  <div class="about-visual about-identity-map" aria-hidden="true">
                    <span class="identity-word identity-word-one">Curious</span>
                    <span class="identity-word identity-word-two">Open</span>
                    <span class="identity-word identity-word-three">Hands-on</span>
                    <i class="identity-ring identity-ring-one"></i>
                    <i class="identity-ring identity-ring-two"></i>
                    <span class="curiosity-core">Why not?</span>
                  </div>
                {:else if index === 1}
                  <ol class="about-visual process-score" aria-label="Design process">
                    <li><span>01</span><strong>Make a rough version</strong><i></i></li>
                    <li><span>02</span><strong>Test it early</strong><i></i></li>
                    <li><span>03</span><strong>Learn what works</strong><i></i></li>
                    <li><span>04</span><strong>Push it further</strong></li>
                  </ol>
                {:else}
                  <div class="about-visual direction-poster" aria-hidden="true">
                    <span>AI</span>
                    <span>Design</span>
                    <span>Code</span>
                    <span>Motion</span>
                    <small>One toolset. More directions.</small>
                  </div>
                {/if}
              </article>
            {/each}
          </div>

          <div class="about-sequence-progress" aria-hidden="true">
            {#each aboutPanels as _, index}<span>{String(index + 1).padStart(2, '0')}</span>{/each}
          </div>
        </div>
      </section>

      <div class="work-anchor" aria-hidden="true"></div>

      <div class="project-scroll-scene" bind:this={projectScene}>
        <section
          id="selected-work"
          class="project-stage"
          class:work-is-locked={workState === 'work-pinned'}
          class:laser-cursor-active={laserCursorVisible}
          bind:this={projectStage}
          data-work-state={workState}
          data-laser-phase={laserPhase}
          aria-label="Selected work"
          style={`--laser-x: ${laserDotX}px; --laser-y: ${laserDotY}px; --laser-angle: ${laserTailAngle}deg; --laser-tail: ${laserTailLength}px;`}
        >
        <div
          bind:this={laserCharacter}
          class="laserpointer-character"
          class:laserpointer-visible={laserVisible}
          aria-hidden="true"
        >
          {#if laserAssetsReady}
            {#each LASER_FRAME_NUMBERS as frame}
              <img
                class="laserpointer-frame"
                class:laserpointer-frame-active={laserFrameNumber === frame}
                src={laserPathForFrame(frame)}
                alt=""
                loading="eager"
                decoding="async"
              />
            {/each}
          {/if}
        </div>

        {#if laserCursorVisible}
          <span class="laser-cursor-dot" aria-hidden="true"></span>
        {/if}

        <div class="work-category-switch" role="group" aria-label="Filter selected work">
          {#each workCategories as category}
            <button
              type="button"
              class:work-category-active={activeWorkCategory === category.id}
              aria-pressed={activeWorkCategory === category.id}
              onclick={() => selectWorkCategory(category.id)}
            >
              {category.label}
            </button>
          {/each}
        </div>

        {#if visibleProjects.length > 0}
          <p id="project-wheel-instructions" class="visually-hidden">
            Drag the project wheel to rotate it, or focus the wheel and use the left and right arrow keys.
          </p>

        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <div
          bind:this={projectWheel}
          class="project-wheel"
          class:project-wheel-dragging={projectWheelDragging}
          class:project-wheel-single={visibleProjects.length < 2}
          role="region"
          aria-roledescription="rotating project gallery"
          aria-label="Project wheel"
          aria-describedby="project-wheel-instructions"
          tabindex="0"
          onpointerdown={handleProjectWheelPointerDown}
          onpointermove={handleProjectWheelPointerMove}
          onkeydown={handleProjectWheelKeydown}
          ondragstart={preventProjectWheelNativeDrag}
        >
          <div class="project-orbit-guide" aria-hidden="true"></div>

          <div class="project-focus-slot">
            {#key projectWheelFocusIndex}
              <div class="project-focus-reveal">
                <svelte:element
                  this={projectWheelFocusProject.href ? 'a' : 'article'}
                  class={`project-card project-card-active ${projectWheelFocusProject.href ? 'project-card-clickable' : ''} liquid-glass`}
                  href={projectWheelFocusProject.href}
                  target={projectWheelFocusProject.target}
                  rel={projectWheelFocusProject.target === '_blank' ? 'noreferrer' : undefined}
                  aria-label={projectWheelFocusProject.href ? `Open ${projectWheelFocusProject.title}` : undefined}
                  aria-current="true"
                  role={projectWheelFocusProject.href ? undefined : 'group'}
                  style={`--mx: 50%; --my: 18%; --rx: 0deg; --ry: 0deg; --target-x: ${projectWheelFocusProject.pointerTarget.x}%; --target-y: ${projectWheelFocusProject.pointerTarget.y}%;`}
                  onclick={handleProjectCardClick}
                  onpointermove={handleLiquidPointerMove}
                  onpointerleave={handleLiquidPointerLeave}
                >
              <div
                class="project-thumb"
                class:project-thumb-contain={projectWheelFocusProject.thumbnailFit === 'contain'}
              >
              {#if projectWheelFocusProject.thumbnail}
                  <img
                    class:pixel-thumb={projectWheelFocusProject.pixelThumbnail}
                    src={projectWheelFocusProject.thumbnail}
                    alt=""
                    loading="eager"
                    decoding="async"
                    draggable="false"
                  />
                {:else if projectWheelFocusProject.monogram}
                  <span>{projectWheelFocusProject.monogram}</span>
                {:else if projectWheelFocusProject.icon === 'liquid'}
                  <svg class="project-symbol" viewBox="0 0 64 64" aria-hidden="true">
                    <circle cx="32" cy="32" r="17" />
                    <circle cx="32" cy="32" r="7" />
                    <path d="M8 33c8-11 16-16 24-16s16 5 24 16c-8 10-16 15-24 15S16 43 8 33Z" />
                  </svg>
                {:else}
                  <svg class="project-symbol" viewBox="0 0 64 64" aria-hidden="true">
                    <path d="M18 9h22l8 8v38H18Z" />
                    <path d="M40 9v10h8M25 30h16M25 38h16M25 46h10" />
                  </svg>
                {/if}
              </div>

              <div class="project-card-content">
                <div class="project-title-row">
                  <h3>{projectWheelFocusProject.title}</h3>
                  <span
                    class="project-status"
                    class:project-status-live={projectWheelFocusProject.status === 'Live'}
                    class:project-status-muted={!projectWheelFocusProject.href}
                  >
                    <span class="project-status-dot" aria-hidden="true"></span>
                    {projectWheelFocusProject.status}
                  </span>
                </div>
                <p class="project-summary">{projectWheelFocusProject.description}</p>
                <div class="project-detail">
                  <div class="project-detail-inner">
                    <p>{projectWheelFocusProject.longDescription}</p>
                    <div class="project-detail-footer">
                      <span class="project-focus-label">In focus</span>
                      <span>Click anywhere to open</span>
                    </div>
                  </div>
                </div>
                <ul aria-label={`${projectWheelFocusProject.title} tags`}>
                  {#each projectWheelFocusProject.tags as tag}
                    <li>{tag}</li>
                  {/each}
                </ul>
              </div>
                </svelte:element>
              </div>
            {/key}
          </div>

          {#each visibleProjects as project, index (project.title)}
            <div
              class="project-slot"
              class:project-slot-focused={index === projectWheelFocusIndex}
              style={projectWheelSlotStyles[index]}
            >
              <div class="project-float">
                <svelte:element
                  this={project.href ? 'a' : 'article'}
                  class={`project-card ${project.href ? 'project-card-clickable' : ''} liquid-glass`}
                  href={project.href}
                  target={project.target}
                  rel={project.target === '_blank' ? 'noreferrer' : undefined}
                  aria-label={project.href ? `Open ${project.title}` : undefined}
                  role={project.href ? undefined : 'group'}
                  style={`--mx: 50%; --my: 18%; --rx: 0deg; --ry: 0deg; --target-x: ${project.pointerTarget.x}%; --target-y: ${project.pointerTarget.y}%;`}
                  onclick={handleProjectCardClick}
                  onpointermove={handleLiquidPointerMove}
                  onpointerleave={handleLiquidPointerLeave}
                >
                  <div
                    class="project-thumb"
                    class:project-thumb-contain={project.thumbnailFit === 'contain'}
                  >
                    {#if project.thumbnail}
                      <img
                        class:pixel-thumb={project.pixelThumbnail}
                        src={project.thumbnail}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                      />
                    {:else if project.monogram}
                      <span>{project.monogram}</span>
                    {:else if project.icon === 'liquid'}
                      <svg class="project-symbol" viewBox="0 0 64 64" aria-hidden="true">
                        <circle cx="32" cy="32" r="17" />
                        <circle cx="32" cy="32" r="7" />
                        <path d="M8 33c8-11 16-16 24-16s16 5 24 16c-8 10-16 15-24 15S16 43 8 33Z" />
                      </svg>
                    {:else}
                      <svg class="project-symbol" viewBox="0 0 64 64" aria-hidden="true">
                        <path d="M18 9h22l8 8v38H18Z" />
                        <path d="M40 9v10h8M25 30h16M25 38h16M25 46h10" />
                      </svg>
                    {/if}
                  </div>

                  <div class="project-card-content">
                    <div class="project-title-row">
                      <h3>{project.title}</h3>
                      <span
                        class="project-status"
                        class:project-status-live={project.status === 'Live'}
                        class:project-status-muted={!project.href}
                      >
                        <span class="project-status-dot" aria-hidden="true"></span>
                        {project.status}
                      </span>
                    </div>
                    <p class="project-summary">{project.description}</p>
                    <ul aria-label={`${project.title} tags`}>
                      {#each project.tags as tag}
                        <li>{tag}</li>
                      {/each}
                    </ul>
                  </div>
                </svelte:element>
              </div>
            </div>
          {/each}
          </div>
        {/if}
        </section>
      </div>

      <section
        id="contact"
        class="contact-walk"
        bind:this={contactSection}
        aria-labelledby="contact-title"
      >
        <div class="contact-walk-stage">
          <div class="contact-editorial-shell">
            <div class="contact-masthead" data-contact-layer>
              <span>Contact</span>
              <span>Germany — Worldwide</span>
            </div>

            <div class="contact-editorial-heading" data-contact-layer>
              <p>I am available for commissions. Tell me the rough version of your idea and we can shape, design, and build the rest together.</p>
              <h2 id="contact-title">Walk in<br /><em>with an idea.</em></h2>
            </div>

            <a
              class="contact-editorial-email"
              data-contact-layer
              href={`mailto:${emailAddress}?subject=Let%27s%20make%20something`}
            >
              <span>Write me</span>
              <strong>{emailAddress}</strong>
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M7 25 25 7M11 7h14v14" />
              </svg>
            </a>

            <div class="contact-editorial-links" data-contact-layer>
              <button type="button" class:copied={emailCopied} onclick={copyEmail}>
                <span>{emailCopied ? 'Copied — ready to paste' : 'Copy email'}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="8" y="8" width="11" height="11" rx="2" />
                  <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                </svg>
              </button>
              <a href="https://instagram.com/mocadau" target="_blank" rel="noreferrer">
                <span>Instagram</span>
                <strong>@mocadau ↗</strong>
              </a>
              <p>Interaction design<br />Motion &amp; creative technology</p>
            </div>

            <footer class="contact-editorial-footer" data-contact-layer>
              <span>© {new Date().getFullYear()} Mocadau</span>
              <span>Made with curiosity in Germany</span>
            </footer>
          </div>
        </div>
      </section>
    </main>
  </section>
{/if}

<style>
  :global(html) {
    background: #05070a;
    overflow-anchor: none;
    scroll-behavior: auto;
  }

  :global(body) {
    margin: 0;
    color: #f5f1e8;
    background: #05070a;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
  }

  :global(body.laser-cursor-active),
  :global(body.laser-cursor-active *) {
    cursor: none !important;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .loading-shell {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: clamp(20px, 5vw, 64px);
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 42%, rgba(224, 190, 115, 0.14), transparent 28%),
      radial-gradient(circle at 18% 85%, rgba(91, 133, 171, 0.12), transparent 30%),
      #05070a;
  }

  .loading-panel {
    position: relative;
    display: grid;
    width: min(920px, 100%);
    grid-template-columns: minmax(230px, 0.72fr) minmax(280px, 1fr);
    gap: clamp(30px, 7vw, 88px);
    align-items: center;
    padding: clamp(28px, 6vw, 72px);
    border: 1px solid rgba(255, 249, 237, 0.14);
    border-radius: clamp(28px, 5vw, 58px);
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.075), transparent 48%),
      rgba(9, 14, 20, 0.72);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 40px 120px rgba(0, 0, 0, 0.46);
    backdrop-filter: blur(30px) saturate(1.2);
  }

  .loading-signal {
    position: relative;
    width: min(32vw, 280px);
    aspect-ratio: 1;
    justify-self: center;
    border-radius: 50%;
  }

  .loading-orbit,
  .loading-sweep,
  .loading-comet,
  .loading-core {
    position: absolute;
  }

  .loading-orbit {
    inset: 8%;
    border: 1px solid rgba(255, 249, 237, 0.18);
    border-radius: 47% 53% 50% 50%;
  }

  .loading-orbit-one {
    animation: loaderOrbit 3.8s linear infinite;
  }

  .loading-orbit-two {
    inset: 22%;
    border-color: rgba(224, 190, 115, 0.34);
    transform: rotate(62deg);
    animation: loaderOrbitReverse 2.8s linear infinite;
  }

  .loading-sweep {
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(from -90deg, #e0be73 var(--load-angle), rgba(255, 255, 255, 0.06) 0);
    mask: radial-gradient(circle, transparent 67%, #000 68% 70%, transparent 71%);
    -webkit-mask: radial-gradient(circle, transparent 67%, #000 68% 70%, transparent 71%);
    filter: drop-shadow(0 0 12px rgba(224, 190, 115, 0.34));
    transition: background 220ms ease;
  }

  .loading-core {
    inset: 35%;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 249, 237, 0.22);
    border-radius: 46% 54% 51% 49%;
    color: #05070a;
    background: #fff9ed;
    box-shadow: 0 0 44px rgba(255, 249, 237, 0.18);
    font-size: clamp(1.2rem, 3vw, 2rem);
    font-weight: 950;
    animation: loaderPulse 1.8s ease-in-out infinite alternate;
  }

  .loading-comet {
    top: 50%;
    left: 50%;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #ff3b25;
    box-shadow: -18px 0 20px rgba(255, 59, 37, 0.42), 0 0 20px #ff3b25;
    animation: loaderComet 1.35s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }

  .loading-copy {
    align-self: center;
  }

  .loading-panel h1 {
    margin: 12px 0 0;
    color: #fff9ed;
    font-size: clamp(2.5rem, 6.5vw, 5.6rem);
    line-height: 0.86;
    letter-spacing: -0.055em;
    text-wrap: balance;
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
    grid-column: 1 / -1;
    height: 2px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
  }

  .progress-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #ff3b25, #e0be73 54%, #fff9ed);
    box-shadow: 0 0 18px rgba(224, 190, 115, 0.55);
    transition: width 260ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .loading-meta {
    display: flex;
    grid-column: 1 / -1;
    align-items: center;
    justify-content: space-between;
    margin: -12px 0 0;
    color: rgba(245, 241, 232, 0.74);
    font-size: 0.76rem;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .loading-meta strong {
    color: #fff9ed;
    font-size: 1rem;
  }

  @keyframes loaderOrbit {
    to { transform: rotate(360deg); }
  }

  @keyframes loaderOrbitReverse {
    to { transform: rotate(-298deg); }
  }

  @keyframes loaderPulse {
    to { transform: scale(1.08) rotate(4deg); }
  }

  @keyframes loaderComet {
    from { transform: rotate(0deg) translateX(clamp(82px, 12vw, 124px)) rotate(0deg); }
    to { transform: rotate(360deg) translateX(clamp(82px, 12vw, 124px)) rotate(-360deg); }
  }

  .liquid-glass,
  .liquid-glass-strong {
    position: relative;
    overflow: hidden;
    border: none;
    background:
      radial-gradient(circle at var(--mx, 50%) var(--my, 18%), rgba(255, 255, 255, 0.34), transparent 34%),
      linear-gradient(135deg, rgba(218, 235, 248, 0.2), rgba(92, 128, 158, 0.08)),
      rgba(10, 18, 26, 0.34);
    background-blend-mode: screen, normal, normal;
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.24),
      inset 0 -1px 0 rgba(255, 255, 255, 0.08),
      0 18px 48px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
  }

  .liquid-glass-strong {
    background-color: rgba(8, 14, 20, 0.42);
    backdrop-filter: blur(30px) saturate(1.5);
    -webkit-backdrop-filter: blur(30px) saturate(1.5);
    box-shadow:
      4px 4px 4px rgba(0, 0, 0, 0.05),
      inset 0 1px 1px rgba(255, 255, 255, 0.15),
      0 22px 58px rgba(0, 0, 0, 0.26);
  }

  .liquid-glass::before,
  .liquid-glass-strong::before {
    position: absolute;
    inset: 0;
    padding: 1.4px;
    border-radius: inherit;
    content: "";
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.45) 0%,
      rgba(255, 255, 255, 0.15) 20%,
      rgba(255, 255, 255, 0) 40%,
      rgba(255, 255, 255, 0) 60%,
      rgba(255, 255, 255, 0.15) 80%,
      rgba(255, 255, 255, 0.45) 100%
    );
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    pointer-events: none;
  }

  .liquid-glass-strong::before {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0) 40%,
      rgba(255, 255, 255, 0) 60%,
      rgba(255, 255, 255, 0.2) 80%,
      rgba(255, 255, 255, 0.5) 100%
    );
  }

  .liquid-glass::after,
  .liquid-glass-strong::after {
    position: absolute;
    inset: -35%;
    content: "";
    background:
      radial-gradient(circle at var(--mx, 50%) var(--my, 18%), rgba(255, 255, 255, 0.28), transparent 18%),
      linear-gradient(115deg, transparent 24%, rgba(255, 255, 255, 0.16) 46%, transparent 68%);
    opacity: 0.18;
    transform: translate3d(0, 0, 0);
    transition: opacity 220ms ease;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  .liquid-glass:hover::after,
  .liquid-glass:focus-visible::after,
  .liquid-glass:focus-within::after,
  .liquid-glass-strong:hover::after,
  .liquid-glass-strong:focus-visible::after,
  .liquid-glass-strong:focus-within::after {
    opacity: 1;
  }

  .portfolio {
    position: relative;
    min-height: 100vh;
    isolation: isolate;
    background: transparent;
  }

  .canvas-stage {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
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
    z-index: 5;
    transition: opacity 140ms ease;
  }

  .character-canvas-muted {
    opacity: 0;
  }

  .site-nav {
    position: fixed;
    top: max(18px, env(safe-area-inset-top));
    left: 50%;
    z-index: 80;
    display: flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    max-width: calc(100vw - 24px);
    gap: 0;
    transform: translateX(-50%);
    pointer-events: auto;
  }

  .brand-mark,
  .nav-links a {
    color: #fff9ed;
    text-decoration: none;
  }

  .brand-mark {
    display: inline-flex;
    min-height: 42px;
    align-items: center;
    padding: 0 15px;
    border-radius: 999px;
    font-size: 0.88rem;
    font-weight: 900;
    letter-spacing: 0.02em;
  }

  .nav-links {
    display: inline-flex;
    gap: 6px;
    padding: 5px;
    border-radius: 999px;
  }

  .nav-links a {
    display: inline-flex;
    min-height: 32px;
    align-items: center;
    padding: 0 12px;
    border-radius: 999px;
    color: rgba(255, 249, 237, 0.82);
    font-size: 0.78rem;
    font-weight: 800;
    transition:
      color 180ms ease,
      background-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
  }

  .nav-links a:hover {
    color: #0a0c10;
    background: #e0be73;
  }

  .nav-links a.active-nav {
    color: #0a0c10;
    background: rgba(255, 249, 237, 0.92);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.36),
      0 10px 24px rgba(255, 249, 237, 0.16);
    transform: scale(1.05);
  }

  .site-nav.contact-mode .nav-links {
    color: #151515;
    background: rgba(241, 236, 223, 0.82);
    box-shadow:
      inset 0 0 0 1px rgba(21, 21, 21, 0.14),
      0 12px 36px rgba(21, 21, 21, 0.1);
  }

  .site-nav.contact-mode .nav-links a {
    color: rgba(21, 21, 21, 0.72);
  }

  .site-nav.contact-mode .nav-links a.active-nav {
    color: #f1ecdf;
    background: #151515;
    box-shadow: none;
  }

  .content-layer {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    padding: max(96px, calc(env(safe-area-inset-top) + 28px)) clamp(18px, 4vw, 64px) 56px;
    pointer-events: none;
  }

  .content-layer :where(a, button, article) {
    pointer-events: auto;
  }

  .work-anchor {
    position: relative;
    top: -96px;
    width: 1px;
    height: 1px;
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

  .intro-written-title > span {
    display: block;
  }

  .intro-word {
    display: inline-block;
    margin-right: 0.22em;
    white-space: nowrap;
  }

  .intro-glyph {
    display: inline-block;
    opacity: 0;
    filter: blur(8px);
    transform: translateY(0.24em) rotate(2deg);
    animation: writeIntroGlyph 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: calc(780ms + var(--glyph-index) * 34ms);
  }

  .intro-pen {
    display: inline-block;
    width: 0.055em;
    height: 0.78em;
    margin-left: -0.08em;
    border-radius: 999px;
    background: #e0be73;
    box-shadow: 0 0 18px rgba(224, 190, 115, 0.7);
    opacity: 0;
    vertical-align: -0.04em;
    animation:
      introPenArrive 1ms linear 2.55s forwards,
      introPenBlink 720ms steps(1, end) 2.55s 5;
  }

  @keyframes writeIntroGlyph {
    68% {
      opacity: 1;
      filter: blur(0);
      transform: translateY(-0.035em) rotate(-0.35deg);
    }

    100% {
      opacity: 1;
      filter: blur(0);
      transform: none;
    }
  }

  @keyframes introPenArrive {
    to { opacity: 1; }
  }

  @keyframes introPenBlink {
    50% { opacity: 0; }
  }

  .intro p:not(.kicker) {
    max-width: 560px;
    margin: 0;
    color: rgba(245, 241, 232, 0.78);
    font-size: clamp(1rem, 2vw, 1.2rem);
    line-height: 1.7;
  }

  .about-sequence {
    display: grid;
    padding: 12vh 0 14vh;
    margin-inline: calc(clamp(18px, 4vw, 64px) * -1);
  }

  .about-world {
    position: relative;
    display: grid;
    min-height: 76vh;
    grid-template-columns: minmax(54px, 0.16fr) minmax(280px, 0.76fr) minmax(380px, 1.08fr);
    gap: clamp(22px, 5vw, 76px);
    align-items: center;
    padding: clamp(70px, 9vw, 128px) clamp(20px, 7vw, 110px);
    overflow: hidden;
    pointer-events: auto;
  }

  .about-world-1 {
    color: #131313;
    background: #efe7d5;
  }

  .about-world-2 {
    color: #111;
    background: #f15a3b;
  }

  .about-world-3 {
    color: #f5f0e6;
    background: #111317;
  }

  .about-world-number {
    align-self: start;
    color: currentColor;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1rem, 1.8vw, 1.5rem);
    font-style: italic;
    opacity: 0.5;
  }

  .about-world-copy {
    position: relative;
    z-index: 2;
  }

  .about-world-copy .kicker {
    color: currentColor;
    opacity: 0.58;
  }

  .about-world-copy h2 {
    max-width: 9ch;
    margin: 12px 0 24px;
    color: currentColor;
    font-size: clamp(3rem, 6.6vw, 7.2rem);
    line-height: 0.84;
    letter-spacing: -0.065em;
    text-wrap: balance;
  }

  .about-world-copy > p:last-child {
    max-width: 40ch;
    margin: 0;
    color: currentColor;
    font-size: clamp(1rem, 1.35vw, 1.2rem);
    line-height: 1.6;
    opacity: 0.74;
  }

  .about-visual {
    position: relative;
    min-width: 0;
  }

  .about-identity-map {
    width: min(42vw, 560px);
    aspect-ratio: 1;
    justify-self: center;
  }

  .identity-ring,
  .curiosity-core,
  .identity-word {
    position: absolute;
  }

  .identity-ring {
    border: 1px solid rgba(19, 19, 19, 0.25);
    border-radius: 50%;
  }

  .identity-ring-one {
    inset: 4%;
    animation: identityOrbit 18s linear infinite;
  }

  .identity-ring-two {
    inset: 22%;
    border-style: dashed;
    animation: identityOrbit 13s linear reverse infinite;
  }

  .curiosity-core {
    inset: 33%;
    display: grid;
    place-items: center;
    border: 2px solid #131313;
    border-radius: 45% 55% 48% 52%;
    font-size: clamp(2.4rem, 7vw, 6.4rem);
    letter-spacing: -0.08em;
    transform: rotate(-8deg);
  }

  .identity-word {
    z-index: 2;
    padding: 8px 12px;
    border: 1px solid currentColor;
    border-radius: 999px;
    background: #efe7d5;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(0.8rem, 1.5vw, 1.05rem);
    font-style: italic;
  }

  .identity-word-one { top: 4%; left: 42%; }
  .identity-word-two { right: 0; bottom: 24%; }
  .identity-word-three { bottom: 3%; left: 16%; }

  .process-score {
    display: grid;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .process-score li {
    display: grid;
    min-height: 94px;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    gap: 16px;
    align-items: center;
    border-bottom: 2px solid rgba(17, 17, 17, 0.8);
  }

  .process-score li:first-child {
    border-top: 2px solid rgba(17, 17, 17, 0.8);
  }

  .process-score span {
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 0.66rem;
    opacity: 0.56;
  }

  .process-score strong {
    font-size: clamp(1.35rem, 3.2vw, 3.1rem);
    letter-spacing: -0.045em;
  }

  .process-score i {
    width: 12px;
    height: 12px;
    border: 2px solid currentColor;
    border-radius: 50%;
    transition: background 180ms ease, transform 180ms ease;
  }

  .process-score li:hover i {
    background: currentColor;
    transform: scale(1.35);
  }

  .direction-poster {
    display: grid;
    justify-items: start;
    transform: rotate(-3deg);
  }

  .direction-poster > span {
    padding: 0.02em 0.12em 0.09em;
    color: #111317;
    background: #dff35b;
    font-size: clamp(4rem, 9vw, 10rem);
    font-weight: 950;
    line-height: 0.78;
    letter-spacing: -0.08em;
    text-transform: uppercase;
  }

  .direction-poster > span:nth-child(2) {
    margin-left: 13%;
    color: #f5f0e6;
    background: #f15a3b;
  }

  .direction-poster > span:nth-child(3) {
    margin-left: 3%;
    background: #efe7d5;
  }

  .direction-poster small {
    margin: 24px 0 0 9%;
    color: rgba(245, 240, 230, 0.56);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  @keyframes identityOrbit {
    to { transform: rotate(360deg); }
  }

  @supports (animation-timeline: view()) {
    .about-world-copy > *,
    .process-score > *,
    .direction-poster > *,
    .about-identity-map > :not(.identity-ring) {
      animation: aboutElementReveal both;
      animation-timeline: view();
      animation-range: entry 4% cover 38%;
    }

    .about-world-copy > *:nth-child(2),
    .process-score > *:nth-child(2),
    .direction-poster > *:nth-child(2),
    .about-identity-map > :not(.identity-ring):nth-child(2) {
      animation-range: entry 9% cover 43%;
    }

    .about-world-copy > *:nth-child(3),
    .process-score > *:nth-child(3),
    .direction-poster > *:nth-child(3),
    .about-identity-map > :not(.identity-ring):nth-child(3) {
      animation-range: entry 14% cover 48%;
    }
  }

  @keyframes aboutElementReveal {
    from { opacity: 0; transform: translateY(42px); }
    to { opacity: 1; }
  }

  .project-scroll-scene {
    position: relative;
    height: calc(100vh + 1400px);
    pointer-events: none;
  }

  .project-stage {
    position: sticky;
    top: 0;
    box-sizing: border-box;
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
    padding-block: 0;
    pointer-events: none;
  }

  .work-category-switch {
    position: absolute;
    top: clamp(66px, 8vh, 78px);
    right: auto;
    left: calc(50% - clamp(230px, 16.5vw, 300px));
    z-index: 24;
    display: inline-flex;
    gap: 3px;
    padding: 3px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 999px;
    background:
      radial-gradient(circle at 24% 0%, rgba(255, 255, 255, 0.2), transparent 38%),
      rgba(10, 18, 26, 0.42);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24), 0 12px 34px rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    pointer-events: auto;
  }

  .work-category-switch button {
    min-height: 30px;
    padding: 0 11px;
    border: 0;
    border-radius: 999px;
    color: #fffdf7;
    background: transparent;
    font: inherit;
    font-size: 0.62rem;
    font-weight: 820;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: color 180ms ease, background 180ms ease, transform 180ms ease;
  }

  .work-category-switch button:hover,
  .work-category-switch button:focus-visible {
    background: rgba(255, 255, 255, 0.12);
  }

  .work-category-switch button:focus-visible {
    outline: 2px solid #fff1c4;
    outline-offset: 2px;
  }

  .work-category-switch .work-category-active {
    color: #12171d;
    background: #fff9ed;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .project-stage.work-is-locked .project-card {
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.16),
      0 24px 70px rgba(0, 0, 0, 0.24);
  }

  .project-stage.laser-cursor-active,
  .project-stage.laser-cursor-active * {
    cursor: none !important;
  }

  .laserpointer-character {
    position: absolute;
    bottom: clamp(-42px, -2vh, 0px);
    left: 50%;
    z-index: 2;
    width: min(50vw, 680px);
    height: clamp(460px, 78vh, 860px);
    filter: none;
    opacity: 0;
    pointer-events: none;
    user-select: none;
    transform: translateX(-50%);
    transition: opacity 80ms linear;
  }

  .laserpointer-character.laserpointer-visible {
    opacity: 1;
  }

  .laserpointer-frame {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0;
    transform: translateZ(0);
    user-select: none;
    pointer-events: none;
    backface-visibility: hidden;
  }

  .laserpointer-frame-active {
    opacity: 1;
  }

  .laser-cursor-dot {
    position: fixed;
    top: var(--laser-y);
    left: var(--laser-x);
    z-index: 60;
    width: 14px;
    height: 14px;
    border: 0;
    border-radius: 999px;
    background: #ff0700;
    box-shadow:
      0 0 10px rgba(255, 7, 0, 0.95),
      0 0 28px rgba(255, 7, 0, 0.58);
    pointer-events: none;
    transform: translate(-50%, -50%);
    mix-blend-mode: normal;
    animation: laserLiquidDot 920ms ease-in-out infinite alternate;
  }

  .laser-cursor-dot::before {
    position: absolute;
    top: 50%;
    left: 50%;
    content: "";
    pointer-events: none;
  }

  .laser-cursor-dot::before {
    width: var(--laser-tail, 34px);
    height: 4px;
    border-radius: 999px;
    background:
      linear-gradient(90deg, transparent 0%, rgba(255, 7, 0, 0.08) 10%, rgba(255, 7, 0, 0.55) 46%, rgba(255, 7, 0, 0.95) 100%);
    box-shadow:
      0 0 8px rgba(255, 7, 0, 0.84),
      0 0 26px rgba(255, 7, 0, 0.5);
    transform:
      translate(-100%, -50%)
      rotate(var(--laser-angle, 0deg));
    transform-origin: right center;
  }

  @keyframes laserLiquidDot {
    0% {
      border-radius: 48% 52% 54% 46%;
      transform: translate(-50%, -50%) scale(1, 1);
    }

    55% {
      border-radius: 56% 44% 46% 54%;
      transform: translate(-50%, -50%) scale(1.12, 0.92);
    }

    100% {
      border-radius: 44% 56% 52% 48%;
      transform: translate(-50%, -50%) scale(0.94, 1.08);
    }
  }

  .project-wheel {
    position: absolute;
    inset: 0;
    cursor: grab;
    outline: none;
    pointer-events: auto;
    touch-action: none;
    user-select: none;
  }

  .project-wheel::after {
    position: absolute;
    right: 22px;
    bottom: 20px;
    padding: 7px 10px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 999px;
    color: rgba(255, 249, 237, 0.62);
    content: "drag to rotate";
    background: rgba(8, 13, 18, 0.3);
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    opacity: 0.7;
    backdrop-filter: blur(12px);
    transition: opacity 180ms ease;
    pointer-events: none;
  }

  .project-wheel:hover::after,
  .project-wheel:focus-visible::after,
  .project-wheel-dragging::after {
    opacity: 1;
  }

  .project-wheel-single {
    cursor: default;
  }

  .project-wheel-single::after,
  .project-wheel-single .project-orbit-guide {
    display: none;
  }

  .project-wheel:focus-visible {
    outline: 2px solid rgba(255, 241, 196, 0.72);
    outline-offset: -4px;
    box-shadow: inset 0 0 0 2px rgba(255, 241, 196, 0.46);
  }

  .project-wheel-dragging,
  .project-wheel-dragging .project-card {
    cursor: grabbing;
  }

  .project-orbit-guide {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 75%;
    height: 68%;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 50%;
    opacity: 0.18;
    transform: translate(-50%, -50%);
    transition:
      border-color 220ms ease,
      opacity 220ms ease;
    pointer-events: none;
  }

  .project-orbit-guide::before,
  .project-orbit-guide::after {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    content: "";
    background: rgba(255, 241, 196, 0.72);
    box-shadow: 0 0 14px rgba(255, 241, 196, 0.38);
  }

  .project-orbit-guide::before {
    top: 50%;
    left: -3px;
  }

  .project-orbit-guide::after {
    top: 50%;
    right: -3px;
  }

  .project-wheel:hover .project-orbit-guide,
  .project-wheel:focus-visible .project-orbit-guide,
  .project-wheel-dragging .project-orbit-guide {
    border-color: rgba(255, 255, 255, 0.16);
    opacity: 0.42;
  }

  .project-slot {
    position: absolute;
    top: var(--slot-top);
    left: var(--slot-left);
    z-index: var(--slot-layer);
    width: clamp(300px, 21vw, 390px);
    opacity: var(--slot-opacity);
    transform: translate(-50%, -50%) scale(var(--slot-scale));
    transform-origin: center;
    will-change: top, left, transform, width;
    pointer-events: none;
  }

  .project-focus-slot {
    position: absolute;
    top: 16%;
    left: 50%;
    z-index: 12;
    width: clamp(460px, 33vw, 600px);
    transform: translate(-50%, -50%) translateY(88px);
    pointer-events: auto;
  }

  .project-focus-reveal {
    width: 100%;
    transform-origin: top center;
    animation: projectFocusUnfold 480ms cubic-bezier(0.16, 1, 0.3, 1) both;
    will-change: clip-path, transform;
  }

  .project-focus-reveal > .project-card {
    height: 220px;
  }

  .project-float {
    width: 100%;
    animation: projectCardFloat 5.8s ease-in-out var(--float-delay) infinite;
    pointer-events: auto;
  }

  .project-slot-focused .project-float {
    visibility: hidden;
  }

  @keyframes projectFocusUnfold {
    0% {
      clip-path: inset(0 0 56% 0 round 32px);
      transform: translateY(-3px) scaleX(0.92) scaleY(0.72);
    }

    62% {
      clip-path: inset(0 0 0 0 round 32px);
      transform: translateY(0) scaleX(1.012) scaleY(1.02);
    }

    100% {
      clip-path: inset(0 0 0 0 round 32px);
      transform: translateY(0) scaleX(1) scaleY(1);
    }
  }

  .project-wheel-dragging .project-float,
  .project-float:hover,
  .project-float:focus-within,
  .project-wheel-dragging .project-thumb,
  .project-wheel-dragging .project-card-content,
  .project-float:hover .project-thumb,
  .project-float:hover .project-card-content,
  .project-float:focus-within .project-thumb,
  .project-float:focus-within .project-card-content {
    animation-play-state: paused;
  }

  @keyframes projectCardFloat {
    0%,
    100% {
      filter: drop-shadow(0 14px 18px rgba(3, 8, 13, 0.08));
    }

    50% {
      filter: drop-shadow(0 20px 26px rgba(3, 8, 13, 0.16));
    }
  }

  @keyframes projectCardInnerFloat {
    0%,
    100% {
      transform: translate3d(0, -1px, 0);
    }

    50% {
      transform: translate3d(0, 2px, 0);
    }
  }

  .project-card {
    position: relative;
    display: grid;
    width: 100%;
    min-height: 118px;
    grid-template-columns: 94px minmax(0, 1fr);
    gap: 12px;
    padding: 10px;
    border-radius: 30px;
    color: #fff;
    isolation: isolate;
    overflow: hidden;
    text-decoration: none;
    background:
      radial-gradient(circle at var(--mx, 50%) var(--my, 18%), rgba(255, 255, 255, 0.28), transparent 34%),
      linear-gradient(135deg, rgba(201, 220, 238, 0.34), rgba(102, 139, 172, 0.2)),
      rgba(12, 22, 31, 0.48);
    background-blend-mode: screen, normal, normal;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.28),
      inset 0 -1px 0 rgba(255, 255, 255, 0.08),
      0 18px 42px rgba(3, 8, 13, 0.22);
    backdrop-filter: blur(22px) saturate(1.22);
    -webkit-backdrop-filter: blur(22px) saturate(1.22);
    transform:
      translate3d(var(--work-x, 0px), var(--work-y, 0px), 0)
      perspective(900px)
      rotateX(var(--rx, 0deg))
      rotateY(var(--ry, 0deg))
      scale(1);
    transform-style: preserve-3d;
    transition:
      box-shadow 240ms ease,
      background 240ms ease,
      transform 240ms ease;
    will-change: transform;
  }

  .project-card-active {
    min-height: 220px;
    grid-template-columns: 160px minmax(0, 1fr);
    gap: 16px;
    padding: 12px;
    border-radius: 32px;
    background:
      radial-gradient(circle at var(--mx, 50%) var(--my, 18%), rgba(255, 255, 255, 0.34), transparent 36%),
      linear-gradient(135deg, rgba(216, 231, 244, 0.42), rgba(103, 139, 172, 0.24)),
      rgba(12, 22, 31, 0.54);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.36),
      inset 0 -1px 0 rgba(255, 255, 255, 0.1),
      0 30px 74px rgba(3, 8, 13, 0.32);
    transition:
      min-height 520ms cubic-bezier(0.16, 1, 0.3, 1),
      grid-template-columns 520ms cubic-bezier(0.16, 1, 0.3, 1),
      padding 520ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 240ms ease,
      background 240ms ease,
      transform 240ms ease;
  }

  .project-card::before {
    padding: 1px;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.78),
      rgba(255, 255, 255, 0.14) 38%,
      rgba(223, 240, 255, 0.3) 72%,
      rgba(255, 255, 255, 0.48)
    );
  }

  .project-card::after {
    inset: 0;
    background:
      radial-gradient(circle at var(--mx, 50%) var(--my, 18%), rgba(255, 255, 255, 0.32), transparent 25%),
      linear-gradient(112deg, transparent 18%, rgba(255, 255, 255, 0.12) 46%, transparent 68%);
    opacity: 0.16;
    mix-blend-mode: screen;
  }

  .project-card-clickable {
    cursor: pointer;
  }

  .project-card:hover,
  .project-card:focus-visible {
    z-index: 6;
    background:
      radial-gradient(circle at var(--mx, 50%) var(--my, 18%), rgba(255, 255, 255, 0.34), transparent 34%),
      linear-gradient(135deg, rgba(218, 232, 246, 0.43), rgba(118, 154, 187, 0.27)),
      rgba(12, 22, 31, 0.38);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.34),
      inset 0 -1px 0 rgba(255, 255, 255, 0.1),
      0 26px 66px rgba(3, 8, 13, 0.32);
    transform:
      translate3d(var(--work-x, 0px), calc(var(--work-y, 0px) - 3px), 0)
      perspective(900px)
      rotateX(var(--rx, 0deg))
      rotateY(var(--ry, 0deg))
      scale(1.025);
  }

  .project-card:hover::after,
  .project-card:focus-visible::after {
    opacity: 0.5;
  }

  .project-wheel-dragging .project-card,
  .project-wheel-dragging .project-card:hover {
    transform:
      translate3d(var(--work-x, 0px), var(--work-y, 0px), 0)
      perspective(900px)
      rotateX(0deg)
      rotateY(0deg)
      scale(1);
  }

  .project-card > * {
    position: relative;
    z-index: 1;
  }

  .project-thumb {
    display: grid;
    width: 94px;
    min-height: 98px;
    place-items: center;
    align-self: stretch;
    border-radius: 22px;
    overflow: hidden;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.14)),
      rgba(235, 242, 248, 0.24);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.22),
      0 10px 24px rgba(4, 10, 16, 0.16);
    animation: projectCardInnerFloat 5.8s ease-in-out var(--float-delay) infinite;
  }

  .project-thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(0.86) contrast(1.04) brightness(0.94);
    transform: scale(1.015);
    transition:
      filter 360ms ease,
      transform 520ms cubic-bezier(0.2, 0.75, 0.2, 1);
  }

  .project-thumb-contain img {
    box-sizing: border-box;
    padding: 9px;
    object-fit: contain;
    transform: none;
  }

  .project-card:hover .project-thumb-contain img,
  .project-card:focus-visible .project-thumb-contain img {
    transform: scale(1.035);
  }

  .project-symbol {
    width: 58%;
    height: 58%;
    fill: none;
    stroke: rgba(255, 253, 247, 0.88);
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 8px 16px rgba(3, 8, 13, 0.22));
  }

  .project-card:hover .project-thumb img,
  .project-card:focus-visible .project-thumb img {
    filter: saturate(1) contrast(1.04) brightness(1);
    transform: scale(1.07);
  }

  .project-thumb img.pixel-thumb {
    width: 78%;
    height: 78%;
    object-fit: contain;
    image-rendering: pixelated;
    filter: drop-shadow(0 9px 14px rgba(0, 0, 0, 0.38));
  }

  .project-thumb span {
    color: rgba(255, 249, 237, 0.72);
    font-size: 2.1rem;
    font-weight: 900;
    letter-spacing: -0.08em;
  }

  .project-card-content {
    display: grid;
    min-width: 0;
    grid-template-rows: auto 1fr auto;
    gap: 7px;
    padding: 4px 4px 3px 0;
    animation: projectCardInnerFloat 5.8s ease-in-out var(--float-delay) infinite;
  }

  .project-card-active .project-card-content {
    grid-template-rows: auto auto auto 1fr;
    gap: 8px;
    padding: 7px 7px 5px 0;
    transition: padding 520ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-card-active .project-thumb {
    width: 160px;
    min-height: 196px;
    transition:
      width 520ms cubic-bezier(0.16, 1, 0.3, 1),
      min-height 520ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-title-row {
    display: flex;
    min-width: 0;
    align-items: flex-start;
    justify-content: space-between;
    gap: 7px;
  }

  .project-card h3 {
    min-width: 0;
    margin: 0;
    color: #fff;
    font-size: clamp(0.96rem, 1.12vw, 1.18rem);
    line-height: 1.02;
    letter-spacing: -0.025em;
    text-wrap: balance;
  }

  .project-card p {
    margin: 0;
    color: #fff;
    font-size: 0.7rem;
    line-height: 1.38;
  }

  .project-summary {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .project-detail {
    display: grid;
    min-height: 0;
    grid-template-rows: 0fr;
    opacity: 0;
  }

  .project-detail-inner {
    min-height: 0;
    overflow: hidden;
  }

  .project-card-active .project-detail {
    grid-template-rows: 1fr;
    opacity: 1;
    transition:
      grid-template-rows 460ms cubic-bezier(0.16, 1, 0.3, 1) 90ms,
      opacity 180ms ease 90ms;
  }

  .project-detail p {
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
    color: #fff;
    font-size: 0.7rem;
    line-height: 1.42;
  }

  .project-detail-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 9px;
    color: #fff;
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .project-focus-label {
    color: #fff1c4;
  }

  .project-focus-label::before {
    display: inline-block;
    width: 5px;
    height: 5px;
    margin-right: 6px;
    border-radius: 50%;
    content: "";
    background: #fff1c4;
    box-shadow: 0 0 12px rgba(255, 241, 196, 0.7);
    vertical-align: 1px;
  }

  .project-status {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    min-height: 20px;
    gap: 5px;
    padding: 0 7px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 999px;
    color: #fff;
    background: rgba(7, 13, 18, 0.28);
    font-size: 0.52rem;
    font-weight: 800;
    white-space: nowrap;
  }

  .project-status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #e5c88c;
    box-shadow: 0 0 10px rgba(229, 200, 140, 0.5);
  }

  .project-status-live .project-status-dot {
    background: #baf58b;
    box-shadow: 0 0 10px rgba(186, 245, 139, 0.6);
  }

  .project-status-muted {
    color: rgba(255, 253, 247, 0.62);
  }

  .project-status-muted .project-status-dot {
    background: rgba(255, 253, 247, 0.42);
    box-shadow: none;
  }

  .project-card ul {
    display: flex;
    flex-wrap: wrap;
    column-gap: 12px;
    row-gap: 5px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .project-card li {
    display: inline-flex;
    min-height: auto;
    align-items: center;
    gap: 5px;
    padding: 0;
    border: 0;
    border-radius: 0;
    color: #fff;
    background: transparent;
    box-shadow: none;
    font-size: 0.53rem;
    font-weight: 780;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .project-card li::before {
    width: 4px;
    height: 4px;
    flex: none;
    border-radius: 50%;
    content: "";
    background: #e0be73;
    box-shadow: 0 0 9px rgba(224, 190, 115, 0.48);
    transform: none;
  }

  .project-card li:nth-child(2)::before {
    background: #9ac8ed;
    box-shadow: 0 0 9px rgba(154, 200, 237, 0.46);
  }

  .project-card li:nth-child(3)::before {
    background: #ff8d76;
    box-shadow: 0 0 9px rgba(255, 141, 118, 0.44);
  }

  .project-card:focus-visible,
  .contact-chip:focus-visible {
    outline: 3px solid rgba(255, 241, 196, 0.82);
    outline-offset: 4px;
  }

  .contact-stop {
    display: flex;
    min-height: 78vh;
    align-items: center;
    justify-content: flex-start;
  }

  .about-finale {
    position: relative;
    min-height: 108vh;
    align-items: flex-start;
    padding: clamp(82px, 11vh, 120px) 0 clamp(72px, 10vh, 110px);
    margin: 0 0 -56px;
    overflow: hidden;
    color: #fff9ed;
    background: transparent;
    pointer-events: auto;
  }

  .about-finale::before,
  .about-finale::after {
    position: absolute;
    content: "";
    pointer-events: none;
  }

  .about-finale::before {
    inset: 0 auto auto 50%;
    width: min(780px, 72vw);
    height: min(780px, 72vw);
    background:
      radial-gradient(circle, rgba(255, 241, 196, 0.12), transparent 68%);
    transform: translate(-50%, 2vh);
  }

  .about-finale::after {
    display: none;
  }

  .about-finale-shell {
    position: relative;
    z-index: 1;
    display: grid;
    width: min(1180px, 100%);
    grid-template-columns: minmax(300px, 0.88fr) minmax(430px, 1.12fr);
    gap: clamp(28px, 5vw, 72px);
    align-items: start;
    margin: 0 auto;
  }

  .about-finale-intro {
    position: sticky;
    top: 104px;
    display: grid;
    max-width: none;
    gap: 18px;
    margin: 0;
    padding: clamp(24px, 4vw, 42px);
    border-radius: 24px;
    background:
      radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.18), transparent 32%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.025)),
      rgba(255, 255, 255, 0.055);
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.18),
      0 28px 80px rgba(0, 0, 0, 0.26);
    backdrop-filter: blur(22px) saturate(1.35);
    -webkit-backdrop-filter: blur(22px) saturate(1.35);
  }

  .about-finale-intro .kicker {
    color: #e0be73;
  }

  .about-finale-intro h2 {
    max-width: 10ch;
    margin: 0;
    color: #fff9ed;
    font-size: clamp(2.8rem, 5.8vw, 5.8rem);
    line-height: 0.9;
    text-wrap: balance;
  }

  .about-finale-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    align-items: stretch;
  }

  .about-finale-card {
    position: relative;
    min-height: 0;
    grid-column: 1 !important;
    grid-template-columns: 46px minmax(0, 1fr);
    column-gap: 16px;
    padding: 18px 20px;
    border: none;
    border-radius: 24px;
    color: #fff9ed;
    background:
      radial-gradient(circle at var(--mx, 50%) var(--my, 18%), rgba(255, 255, 255, 0.2), transparent 30%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.025)),
      rgba(255, 255, 255, 0.055);
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.16),
      0 22px 62px rgba(0, 0, 0, 0.22);
    backdrop-filter: blur(20px) saturate(1.35);
    -webkit-backdrop-filter: blur(20px) saturate(1.35);
    transform: none;
    transition:
      transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
      border-color 240ms ease,
      box-shadow 240ms ease;
  }

  .about-finale-card:nth-child(1),
  .about-finale-card:nth-child(4) {
    grid-column: span 5;
  }

  .about-finale-card:nth-child(2),
  .about-finale-card:nth-child(5) {
    grid-column: span 7;
  }

  .about-finale-card:nth-child(3),
  .about-finale-card:nth-child(6) {
    grid-column: span 6;
  }

  .about-finale-card::before {
    display: none;
  }

  .about-finale-card:hover {
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.22),
      0 30px 82px rgba(0, 0, 0, 0.3);
    transform: translateX(6px);
  }

  .about-finale-number {
    display: inline-flex;
    width: 38px;
    min-width: 38px;
    min-height: 30px;
    grid-row: 1 / span 3;
    align-items: center;
    justify-content: center;
    margin: 0;
    border: 1px solid rgba(255, 249, 237, 0.22);
    border-radius: 999px;
    color: #e0be73;
    font-size: 0.86rem;
    font-weight: 950;
  }

  .about-finale-label {
    grid-column: 2;
    margin: 0 0 5px;
    color: rgba(255, 249, 237, 0.54);
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .about-finale-card h3 {
    max-width: none;
    grid-column: 2;
    margin: 0 0 8px;
    color: #fff9ed;
    font-size: clamp(1.35rem, 2.2vw, 2rem);
    line-height: 1;
    text-wrap: balance;
  }

  .about-finale-card p:last-child {
    max-width: 58ch;
    grid-column: 2;
    margin: 0;
    color: rgba(255, 249, 237, 0.72);
    font-size: clamp(0.88rem, 1.1vw, 0.98rem);
    line-height: 1.5;
  }

  .liquid-contact {
    position: relative;
    width: min(680px, 100%);
    padding: clamp(24px, 4vw, 42px);
    border-radius: 24px;
    color: #fff9ed;
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
    border-radius: 999px;
    color: #fff9ed;
    font: inherit;
    font-size: 0.92rem;
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background-color 180ms ease;
  }

  .contact-chip:hover {
    transform: translateY(-2px);
  }

  .contact-chip-bright {
    border: 1px solid rgba(255, 249, 237, 0.18);
    color: #fff9ed;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.035)),
      rgba(255, 255, 255, 0.06);
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.16),
      0 16px 34px rgba(0, 0, 0, 0.22);
    backdrop-filter: blur(18px) saturate(1.35);
    -webkit-backdrop-filter: blur(18px) saturate(1.35);
  }

  .contact-chip-bright:hover {
    border-color: rgba(224, 190, 115, 0.42);
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.055)),
      rgba(255, 255, 255, 0.1);
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

  .contact-studio {
    position: relative;
    min-height: max(100vh, 780px);
    align-items: center;
    padding: clamp(110px, 15vh, 170px) clamp(18px, 4vw, 64px) clamp(54px, 8vh, 92px);
    margin: 0 clamp(-64px, -4vw, -18px) -56px;
    overflow: hidden;
    color: #fff9ed;
    background:
      radial-gradient(circle at 76% 22%, rgba(255, 76, 48, 0.15), transparent 27%),
      radial-gradient(circle at 14% 76%, rgba(88, 139, 181, 0.16), transparent 30%),
      linear-gradient(145deg, rgba(11, 17, 24, 0.72), rgba(4, 7, 10, 0.94));
    isolation: isolate;
    pointer-events: auto;
  }

  .contact-studio::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    content: "";
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 78%, transparent);
  }

  .contact-orbit {
    position: absolute;
    top: 5%;
    right: -9%;
    z-index: -1;
    width: min(58vw, 760px);
    aspect-ratio: 1;
    border: 1px solid rgba(255, 249, 237, 0.09);
    border-radius: 50%;
    animation: contactOrbitTurn 22s linear infinite;
  }

  .contact-orbit::before,
  .contact-orbit::after,
  .contact-orbit span {
    position: absolute;
    border-radius: 50%;
    content: "";
  }

  .contact-orbit::before {
    inset: 17%;
    border: 1px dashed rgba(224, 190, 115, 0.16);
  }

  .contact-orbit::after {
    inset: 36%;
    border: 1px solid rgba(255, 76, 48, 0.2);
  }

  .contact-orbit span:nth-child(1) {
    top: 49%;
    left: -5px;
    width: 10px;
    height: 10px;
    background: #ff4c30;
    box-shadow: 0 0 24px #ff4c30;
  }

  .contact-orbit span:nth-child(2) {
    top: 14%;
    right: 19%;
    width: 7px;
    height: 7px;
    background: #e0be73;
    box-shadow: 0 0 18px rgba(224, 190, 115, 0.8);
  }

  .contact-orbit span:nth-child(3) {
    right: 34%;
    bottom: 11%;
    width: 5px;
    height: 5px;
    background: #fff9ed;
  }

  .contact-shell {
    display: grid;
    width: min(1240px, 100%);
    gap: clamp(46px, 8vh, 90px);
    margin: 0 auto;
  }

  .contact-heading {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(240px, 0.36fr);
    align-items: end;
    gap: 28px;
  }

  .contact-eyebrow {
    display: flex;
    grid-column: 1 / -1;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 249, 237, 0.14);
  }

  .availability {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 249, 237, 0.7);
    font-size: 0.74rem;
    font-weight: 760;
  }

  .availability i,
  .location-pulse {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #a6ee83;
    box-shadow: 0 0 0 5px rgba(166, 238, 131, 0.09), 0 0 16px rgba(166, 238, 131, 0.55);
    animation: availabilityPulse 1.8s ease-in-out infinite;
  }

  .contact-heading h2 {
    max-width: 12ch;
    margin: 0;
    color: #fff9ed;
    font-size: clamp(3.6rem, 8.2vw, 8.4rem);
    line-height: 0.82;
    letter-spacing: -0.065em;
    text-wrap: balance;
  }

  .contact-console {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.22fr) minmax(320px, 0.78fr);
    gap: 12px;
  }

  .contact-primary {
    position: relative;
    display: grid;
    min-height: 270px;
    align-content: end;
    gap: 10px;
    padding: clamp(26px, 4vw, 48px);
    border-radius: 34px;
    overflow: hidden;
    color: #101317;
    background: #fff9ed;
    text-decoration: none;
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
    transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), background 240ms ease;
  }

  .contact-primary::before {
    position: absolute;
    top: -45%;
    right: -12%;
    width: 54%;
    aspect-ratio: 1;
    border: 1px solid rgba(16, 19, 23, 0.15);
    border-radius: 50%;
    content: "";
    box-shadow: 0 0 0 34px rgba(16, 19, 23, 0.025), 0 0 0 68px rgba(16, 19, 23, 0.02);
    transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .contact-primary strong {
    max-width: calc(100% - 70px);
    overflow: hidden;
    font-size: clamp(1.25rem, 3vw, 2.7rem);
    letter-spacing: -0.045em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .contact-primary svg {
    position: absolute;
    top: 32px;
    right: 32px;
    width: 42px;
    height: 42px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.7;
    transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .contact-primary:hover,
  .contact-primary:focus-visible {
    background: #e0be73;
    transform: translateY(-6px) rotate(-0.4deg);
  }

  .contact-primary:hover::before,
  .contact-primary:focus-visible::before {
    transform: scale(1.18);
  }

  .contact-primary:hover svg,
  .contact-primary:focus-visible svg {
    transform: translate(4px, -4px);
  }

  .contact-secondary {
    display: grid;
    gap: 8px;
  }

  .contact-secondary > * {
    display: grid;
    min-height: 80px;
    grid-template-columns: 38px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding: 18px 20px;
    border: 1px solid rgba(255, 249, 237, 0.12);
    border-radius: 22px;
    color: #fff9ed;
    background: rgba(255, 255, 255, 0.055);
    font: inherit;
    font-size: 0.94rem;
    font-weight: 760;
    text-align: left;
    text-decoration: none;
    backdrop-filter: blur(18px) saturate(1.25);
    transition: transform 220ms ease, border-color 220ms ease, background 220ms ease;
  }

  .contact-secondary svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.7;
  }

  .contact-index {
    color: rgba(255, 249, 237, 0.36);
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 0.64rem;
    letter-spacing: 0.08em;
  }

  .contact-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 249, 237, 0.1);
    color: rgba(255, 249, 237, 0.42);
    font-size: 0.68rem;
    font-weight: 760;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .contact-footer strong {
    margin-left: auto;
    color: rgba(255, 249, 237, 0.68);
  }

  @keyframes contactOrbitTurn {
    to { transform: rotate(360deg); }
  }

  @keyframes availabilityPulse {
    50% { opacity: 0.62; transform: scale(0.76); }
  }

  .contact-editorial {
    position: relative;
    display: block;
    min-height: 100vh;
    padding: clamp(88px, 11vw, 150px) clamp(20px, 7vw, 110px) 38px;
    margin: 0 calc(clamp(18px, 4vw, 64px) * -1) -56px;
    overflow: hidden;
    color: #151515;
    background: #f1ecdf;
    pointer-events: auto;
  }

  .contact-editorial-shell {
    display: grid;
    width: min(1240px, 100%);
    gap: clamp(42px, 7vw, 88px);
    margin: 0 auto;
  }

  .contact-masthead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 12px 0;
    border-top: 2px solid currentColor;
    border-bottom: 1px solid rgba(21, 21, 21, 0.26);
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .contact-editorial-heading {
    display: grid;
    grid-template-columns: minmax(190px, 0.34fr) minmax(0, 1fr);
    gap: clamp(28px, 7vw, 110px);
    align-items: end;
  }

  .contact-editorial-heading > p {
    max-width: 31ch;
    margin: 0 0 10px;
    font-size: clamp(0.95rem, 1.3vw, 1.15rem);
    line-height: 1.6;
  }

  .contact-editorial-heading h2 {
    margin: 0;
    color: #151515;
    font-size: clamp(4rem, 9.8vw, 10rem);
    line-height: 0.78;
    letter-spacing: -0.075em;
  }

  .contact-editorial-heading h2 em {
    color: #f15a3b;
    font-family: Georgia, "Times New Roman", serif;
    font-weight: 400;
    letter-spacing: -0.055em;
  }

  .contact-editorial-email {
    display: grid;
    min-height: 142px;
    grid-template-columns: 140px minmax(0, 1fr) auto;
    gap: 24px;
    align-items: center;
    padding: 20px 0;
    border-top: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    color: #151515;
    text-decoration: none;
    transition: padding 280ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease;
  }

  .contact-editorial-email > span {
    font-size: 0.72rem;
    font-weight: 850;
    letter-spacing: 0.11em;
    text-transform: uppercase;
  }

  .contact-editorial-email strong {
    overflow: hidden;
    font-size: clamp(1.45rem, 4vw, 4.4rem);
    letter-spacing: -0.055em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .contact-editorial-email svg {
    width: clamp(38px, 5vw, 66px);
    height: clamp(38px, 5vw, 66px);
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.4;
    transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .contact-editorial-email:hover,
  .contact-editorial-email:focus-visible {
    padding-inline: 20px;
    color: #f1ecdf;
    background: #151515;
  }

  .contact-editorial-email:hover svg,
  .contact-editorial-email:focus-visible svg {
    transform: translate(5px, -5px);
  }

  .contact-editorial-links {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    background: rgba(21, 21, 21, 0.3);
  }

  .contact-editorial-links > * {
    display: grid;
    min-height: 118px;
    align-content: space-between;
    gap: 12px;
    padding: 20px;
    border: 0;
    color: #151515;
    background: #f1ecdf;
    font: inherit;
    font-size: 0.88rem;
    line-height: 1.45;
    text-align: left;
    text-decoration: none;
  }

  .contact-editorial-links button {
    cursor: pointer;
  }

  .contact-editorial-links :is(button, a) {
    transition: color 180ms ease, background 180ms ease;
  }

  .contact-editorial-links :is(button, a):hover,
  .contact-editorial-links :is(button, a):focus-visible {
    color: #f1ecdf;
    background: #f15a3b;
  }

  .contact-editorial-links button.copied {
    color: #f1ecdf;
    background: #151515;
  }

  .contact-editorial-links svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.6;
  }

  .contact-editorial-links a strong {
    font-size: 1.25rem;
  }

  .contact-editorial-links > p {
    margin: 0;
  }

  .contact-editorial-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding-top: 18px;
    border-top: 1px solid rgba(21, 21, 21, 0.3);
    font-size: 0.68rem;
    font-weight: 780;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* Walking narrative: the canvas remains the world; content moves through it. */
  .about-sequence {
    position: relative;
    display: block;
    height: 540vh;
    padding: 0;
    margin-inline: calc(clamp(18px, 4vw, 64px) * -1);
    pointer-events: none;
  }

  .about-sequence-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
    isolation: isolate;
  }

  .contact-walk-stage::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    content: "";
    background:
      linear-gradient(90deg, rgba(4, 7, 10, 0.5), transparent 34%, transparent 66%, rgba(4, 7, 10, 0.44)),
      linear-gradient(180deg, rgba(4, 7, 10, 0.16), transparent 28%, transparent 68%, rgba(4, 7, 10, 0.38));
    pointer-events: none;
  }

  .about-worlds {
    position: absolute;
    inset: 0;
  }

  .about-world {
    position: absolute;
    inset: 0;
    display: grid;
    min-height: 100vh;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(30px, 7vw, 100px);
    align-items: center;
    padding: max(94px, calc(env(safe-area-inset-top) + 74px)) clamp(24px, 6vw, 92px) max(70px, env(safe-area-inset-bottom));
    overflow: hidden;
    color: #fff9ed;
    background: transparent;
    pointer-events: none;
    will-change: transform, opacity, filter;
  }

  .about-world-1,
  .about-world-2,
  .about-world-3 {
    color: #fff9ed;
    background: transparent;
  }

  .about-world-left .about-world-copy {
    grid-column: 1;
    justify-self: start;
  }

  .about-world-right .about-world-copy {
    grid-column: 2;
    justify-self: end;
  }

  .about-world-copy {
    position: relative;
    z-index: 4;
    width: min(390px, 34vw);
    box-sizing: border-box;
    padding: 0;
    border: 0;
    border-radius: 0;
    color: #fff;
    background: transparent;
    box-shadow: none;
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.98),
      0 8px 28px rgba(0, 0, 0, 0.92);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    pointer-events: auto;
  }

  .about-world-number {
    position: absolute;
    top: 2px;
    right: 0;
    color: #fff;
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 0.66rem;
    font-style: normal;
    font-weight: 800;
    letter-spacing: 0.12em;
    opacity: 1;
  }

  .about-world-copy .kicker {
    color: #fff;
    opacity: 1;
  }

  .about-world-copy h2 {
    max-width: 11ch;
    margin: 14px 0 16px;
    color: #fff;
    font-size: clamp(2.2rem, 3.8vw, 4.2rem);
    line-height: 0.9;
    letter-spacing: -0.058em;
  }

  .about-world-copy > p:last-child {
    max-width: 38ch;
    color: #fff;
    font-size: clamp(0.92rem, 1.15vw, 1.08rem);
    font-weight: 620;
    opacity: 1;
  }

  .about-visual {
    position: absolute;
    z-index: 2;
    width: min(25vw, 320px);
    color: #fff9ed;
    opacity: 0.88;
  }

  .about-world-left .about-visual {
    top: 50%;
    right: clamp(24px, 7vw, 112px);
    transform: translateY(-50%);
  }

  .about-world-right .about-visual {
    top: 50%;
    left: clamp(24px, 7vw, 112px);
    transform: translateY(-50%);
  }

  .about-identity-map {
    justify-self: auto;
    aspect-ratio: 1;
  }

  .identity-ring {
    border-color: rgba(255, 249, 237, 0.34);
  }

  .curiosity-core {
    position: absolute;
    inset: 31%;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 249, 237, 0.68);
    border-radius: 50%;
    border-color: rgba(255, 249, 237, 0.8);
    color: #fff9ed;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1rem, 2vw, 1.65rem);
    font-style: italic;
    text-shadow: 0 12px 38px rgba(0, 0, 0, 0.34);
    transform: rotate(-7deg);
  }

  .identity-word {
    color: #fff9ed;
    background: transparent;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.82);
    backdrop-filter: none;
  }

  .process-score {
    box-sizing: border-box;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.8);
    backdrop-filter: none;
  }

  .process-score li,
  .process-score li:first-child {
    min-height: 70px;
    border-color: rgba(255, 249, 237, 0.3);
  }

  .process-score span,
  .process-score strong {
    color: #fff;
    opacity: 1;
  }

  .process-score strong {
    font-size: clamp(1rem, 2.1vw, 2rem);
  }

  .direction-poster {
    justify-items: start;
    filter: drop-shadow(0 20px 38px rgba(0, 0, 0, 0.28));
  }

  .direction-poster > span {
    padding: 0;
    color: transparent;
    background: transparent;
    font-size: clamp(1.8rem, 3.4vw, 3.6rem);
    line-height: 0.94;
    -webkit-text-stroke: 1px rgba(255, 249, 237, 0.78);
    text-shadow: none;
  }

  .direction-poster > span:first-child {
    color: #e0be73;
    font-size: clamp(3.6rem, 7vw, 7.4rem);
    -webkit-text-stroke: 0;
  }

  .direction-poster > span:nth-child(2),
  .direction-poster > span:nth-child(3),
  .direction-poster > span:nth-child(4) {
    margin-left: 0;
    color: transparent;
    background: transparent;
  }

  .direction-poster > span:nth-child(3) {
    margin-left: 20%;
  }

  .direction-poster > span:nth-child(4) {
    margin-left: 8%;
  }

  .direction-poster small {
    color: #fff;
  }

  .about-sequence-progress {
    position: absolute;
    right: clamp(24px, 5vw, 78px);
    bottom: max(28px, env(safe-area-inset-bottom));
    left: clamp(24px, 5vw, 78px);
    z-index: 8;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .about-sequence-progress span {
    padding-top: 8px;
    border-top: 1px solid rgba(255, 249, 237, 0.25);
    color: #fff;
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 0.58rem;
  }

  .contact-walk {
    position: relative;
    height: 220vh;
    margin: 0 calc(clamp(18px, 4vw, 64px) * -1) -56px;
    color: #fff9ed;
    pointer-events: none;
  }

  .contact-walk-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
    isolation: isolate;
  }

  .contact-walk-stage::before {
    content: none;
    background: none;
  }

  .contact-editorial-shell {
    position: relative;
    z-index: 3;
    display: grid;
    width: min(1340px, 100%);
    height: 100%;
    box-sizing: border-box;
    grid-template-columns: minmax(280px, 0.8fr) minmax(420px, 1.2fr);
    grid-template-rows: auto 1fr auto auto;
    grid-template-areas:
      "mast mast"
      "heading email"
      "links links"
      "footer footer";
    gap: clamp(18px, 3vw, 42px) clamp(34px, 7vw, 110px);
    align-items: center;
    padding: max(92px, calc(env(safe-area-inset-top) + 76px)) clamp(24px, 6vw, 92px) max(26px, env(safe-area-inset-bottom));
    margin: 0 auto;
  }

  .contact-masthead {
    grid-area: mast;
    color: #fff;
    border-top-color: rgba(255, 249, 237, 0.72);
    border-bottom-color: rgba(255, 249, 237, 0.18);
  }

  .contact-editorial-heading {
    display: grid;
    grid-area: heading;
    grid-template-columns: 1fr;
    gap: 22px;
    align-self: center;
  }

  .contact-editorial-heading > p {
    max-width: 30ch;
    margin: 0;
    color: #fff;
    font-weight: 560;
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.96),
      0 8px 24px rgba(0, 0, 0, 0.86);
  }

  .contact-editorial-heading h2 {
    color: #fff9ed;
    font-size: clamp(3.6rem, 6.5vw, 7.2rem);
    line-height: 0.82;
  }

  .contact-editorial-heading h2 em {
    color: #e0be73;
  }

  .contact-editorial-email {
    grid-area: email;
    width: min(100%, 620px);
    min-height: 170px;
    box-sizing: border-box;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-self: end;
    justify-self: end;
    padding: clamp(22px, 3vw, 38px);
    border: 1px solid rgba(255, 249, 237, 0.24);
    border-radius: clamp(26px, 3vw, 42px);
    color: #fff9ed;
    background: transparent;
    box-shadow: none;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.82);
    pointer-events: auto;
  }

  .contact-editorial-email > span {
    grid-column: 1 / -1;
    color: #e0be73;
  }

  .contact-editorial-email strong {
    font-size: clamp(1rem, 2.2vw, 2rem);
  }

  .contact-editorial-email:hover,
  .contact-editorial-email:focus-visible {
    padding-inline: clamp(22px, 3vw, 38px);
    color: #101317;
    background: #fff9ed;
  }

  .contact-editorial-links {
    display: grid;
    grid-area: links;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    background: transparent;
    pointer-events: auto;
  }

  .contact-editorial-links > * {
    min-height: 86px;
    padding: 16px 18px;
    border: 1px solid rgba(255, 249, 237, 0.18);
    border-radius: 18px;
    color: #fff9ed;
    background: transparent;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.82);
    backdrop-filter: none;
  }

  .contact-editorial-links :is(button, a):hover,
  .contact-editorial-links :is(button, a):focus-visible {
    color: #101317;
    background: #e0be73;
  }

  .contact-editorial-footer {
    grid-area: footer;
    color: #fff;
    border-top-color: rgba(255, 249, 237, 0.2);
  }

  .site-nav.contact-mode .nav-links {
    color: #fff9ed;
    background: rgba(5, 9, 13, 0.54);
    box-shadow:
      inset 0 0 0 1px rgba(255, 249, 237, 0.16),
      0 12px 36px rgba(0, 0, 0, 0.18);
  }

  .site-nav.contact-mode .nav-links a {
    color: #fff;
  }

  .site-nav.contact-mode .nav-links a.active-nav {
    color: #0a0c10;
    background: rgba(255, 249, 237, 0.94);
  }

  @media (max-width: 720px) {
    .loading-panel {
      grid-template-columns: 1fr;
      gap: 26px;
      padding: 30px 24px;
      border-radius: 34px;
    }

    .loading-signal {
      width: min(58vw, 230px);
    }

    .loading-copy {
      text-align: center;
    }

    .loading-panel h1 {
      font-size: clamp(2.7rem, 14vw, 4.5rem);
    }

    .site-nav {
      top: max(12px, env(safe-area-inset-top));
      width: max-content;
      max-width: calc(100vw - 24px);
      gap: 0;
    }

    .nav-links {
      gap: 2px;
    }

    .nav-links a {
      min-height: 30px;
      padding: 0 9px;
      font-size: 0.72rem;
    }

    .content-layer {
      padding-inline: 16px;
    }

    .intro {
      align-content: start;
      padding-top: 16vh;
    }

    .about-sequence {
      gap: 0;
      padding: 8vh 0 10vh;
      margin-inline: -16px;
    }

    .about-world {
      min-height: auto;
      grid-template-columns: 1fr;
      gap: 34px;
      padding: 82px 20px;
    }

    .about-world-number {
      position: absolute;
      top: 22px;
      right: 20px;
    }

    .about-world-copy h2 {
      font-size: clamp(3.35rem, 15vw, 5.2rem);
    }

    .about-identity-map {
      width: min(86vw, 430px);
    }

    .process-score li {
      min-height: 82px;
    }

    .direction-poster {
      margin-top: 22px;
    }

    .direction-poster > span {
      font-size: clamp(3.7rem, 21vw, 6.4rem);
    }

    .project-stage {
      position: sticky;
      top: 0;
      height: 100svh;
      min-height: 100svh;
      overflow: hidden;
      padding-block: 10vh 4vh;
    }

    .work-category-switch {
      position: relative;
      top: auto;
      right: auto;
      left: auto;
      display: flex;
      width: max-content;
      max-width: calc(100% - 32px);
      margin: 0 16px 12px;
    }

    .work-category-switch button {
      min-height: 32px;
      padding-inline: 11px;
      font-size: 0.61rem;
    }

    .project-scroll-scene {
      height: 100svh;
    }

    .laserpointer-character,
    .laser-cursor-dot {
      display: none;
    }

    .project-wheel {
      position: relative;
      inset: auto;
      display: flex;
      width: calc(100% + 32px);
      gap: 14px;
      padding: 12px 16px 30px;
      margin-inline: -16px;
      overflow-x: auto;
      scroll-padding-inline: 16px;
      scroll-snap-type: x proximity;
      scrollbar-width: none;
      touch-action: auto;
    }

    .project-wheel::-webkit-scrollbar {
      display: none;
    }

    .project-wheel::after {
      right: 24px;
      bottom: 0;
      content: "scroll to explore";
    }

    .project-orbit-guide {
      display: none;
    }

    .project-slot {
      position: relative;
      top: auto !important;
      left: auto !important;
      z-index: auto;
      width: min(84vw, 350px);
      flex: 0 0 min(84vw, 350px);
      opacity: 1;
      transform: none;
      scroll-snap-align: center;
      pointer-events: auto;
    }

    .project-focus-slot {
      display: none;
    }

    .project-slot-focused .project-float {
      visibility: visible;
    }

    .project-card,
    .project-card-active {
      min-height: 132px;
      grid-template-columns: 88px minmax(0, 1fr);
      gap: 11px;
      padding: 10px;
      border-radius: 28px;
    }

    .project-thumb,
    .project-card-active .project-thumb {
      width: 88px;
      min-height: 108px;
      border-radius: 20px;
    }

    .project-card-content,
    .project-card-active .project-card-content {
      gap: 8px;
      padding: 5px 3px 4px 0;
    }

    .project-card-active .project-detail {
      display: none;
    }

    .project-card h3 {
      font-size: 1.04rem;
    }

    .project-card p {
      font-size: 0.73rem;
      line-height: 1.4;
    }

    .project-card li {
      font-size: 0.51rem;
    }

    .project-card:hover,
    .project-card:focus-visible {
      transform: translate3d(0, -2px, 0) scale(1.01);
    }

    .contact-stop {
      align-items: center;
      justify-content: flex-start;
      min-height: 76vh;
    }

    .contact-studio {
      min-height: 100vh;
      padding: 104px 16px 46px;
      margin: 0 -16px -56px;
    }

    .contact-orbit {
      top: 4%;
      right: -42%;
      width: 106vw;
      opacity: 0.72;
    }

    .contact-shell {
      gap: 44px;
    }

    .contact-heading,
    .contact-console {
      grid-template-columns: 1fr;
    }

    .contact-eyebrow {
      align-items: flex-start;
      flex-direction: column;
    }

    .contact-heading h2 {
      font-size: clamp(3.7rem, 18vw, 6.2rem);
    }

    .contact-primary {
      min-height: 220px;
      border-radius: 28px;
    }

    .contact-primary strong {
      max-width: 100%;
      font-size: clamp(1rem, 5vw, 1.45rem);
    }

    .contact-secondary > * {
      grid-template-columns: 32px minmax(0, 1fr) auto;
      padding-inline: 16px;
    }

    .contact-footer strong {
      width: 100%;
      margin: 12px 0 0;
    }

    .contact-editorial {
      display: block;
      min-height: 100vh;
      padding: 94px 16px 32px;
      margin: 0 -16px -56px;
    }

    .contact-editorial-shell {
      gap: 46px;
    }

    .contact-editorial-heading {
      grid-template-columns: 1fr;
    }

    .contact-editorial-heading h2 {
      font-size: clamp(4rem, 19vw, 6.5rem);
    }

    .contact-editorial-heading > p {
      max-width: 29ch;
    }

    .contact-editorial-email {
      min-height: 150px;
      grid-template-columns: 1fr auto;
      gap: 14px;
    }

    .contact-editorial-email > span {
      grid-column: 1 / -1;
    }

    .contact-editorial-email strong {
      font-size: clamp(1rem, 4.6vw, 1.35rem);
    }

    .contact-editorial-email svg {
      width: 38px;
      height: 38px;
    }

    .contact-editorial-links {
      grid-template-columns: 1fr;
    }

    .contact-editorial-links > * {
      min-height: 94px;
    }

    .contact-editorial-footer {
      align-items: flex-start;
      flex-direction: column;
    }

    .about-finale {
      min-height: auto;
      padding: 72px 16px 96px;
      margin: 0 -16px -56px;
    }

    .about-finale::before,
    .about-finale::after {
      display: none;
    }

    .about-finale-intro {
      position: relative;
      top: auto;
      gap: 14px;
      margin-bottom: 34px;
    }

    .about-finale-shell {
      display: block;
    }

    .about-finale-intro h2 {
      max-width: 9ch;
      font-size: clamp(3rem, 18vw, 5.7rem);
    }

    .about-finale-grid {
      grid-template-columns: 1fr;
    }

    .about-finale-card,
    .about-finale-card:nth-child(1),
    .about-finale-card:nth-child(2),
    .about-finale-card:nth-child(3),
    .about-finale-card:nth-child(4),
    .about-finale-card:nth-child(5),
    .about-finale-card:nth-child(6) {
      grid-column: 1;
      min-height: auto;
      transform: none;
    }

    .about-finale-card:hover {
      transform: translateY(-4px);
    }
  }

  @media (min-width: 900px) and (max-height: 980px) {
    .project-slot {
      width: clamp(292px, 20vw, 380px);
    }

    .project-focus-slot {
      width: clamp(460px, 32vw, 580px);
    }

    .project-card:not(.project-card-active) {
      min-height: 122px;
      grid-template-columns: 94px minmax(0, 1fr);
      gap: 10px;
      padding: 9px;
      border-radius: 27px;
    }

    .project-card:not(.project-card-active) .project-thumb {
      width: 94px;
      min-height: 102px;
      border-radius: 20px;
    }

    .project-card:not(.project-card-active) .project-thumb img {
      width: 100%;
      height: 100%;
    }

    .project-card:not(.project-card-active) .project-thumb img.pixel-thumb {
      width: 76%;
      height: 76%;
    }

    .project-status {
      min-height: 18px;
      padding: 0 6px;
      font-size: 0.48rem;
    }

    .project-card:not(.project-card-active) .project-card-content {
      gap: 5px;
      padding: 3px 2px 2px 0;
    }

    .project-card:not(.project-card-active) h3 {
      font-size: clamp(0.9rem, 1vw, 1.04rem);
    }

    .project-card:not(.project-card-active) p {
      font-size: 0.65rem;
      line-height: 1.34;
    }

    .project-card:not(.project-card-active) ul {
      column-gap: 9px;
      row-gap: 4px;
    }

    .project-card:not(.project-card-active) li {
      padding: 0;
      font-size: 0.47rem;
    }

    .laserpointer-character {
      width: min(46vw, 580px);
      height: clamp(420px, 74vh, 760px);
    }
  }

  @media (max-width: 720px) {
    .about-sequence {
      height: 600vh;
      margin-inline: -16px;
    }

    .about-world {
      display: flex;
      min-height: 100vh;
      align-items: flex-end;
      padding: 96px 20px max(72px, calc(env(safe-area-inset-bottom) + 50px));
    }

    .about-world-left .about-world-copy,
    .about-world-right .about-world-copy {
      width: min(82vw, 320px);
      max-width: none;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .about-world-left .about-world-copy {
      margin: 0 auto 0 0;
    }

    .about-world-right .about-world-copy {
      margin: 0 0 0 auto;
    }

    .about-world-copy h2 {
      max-width: 12ch;
      margin: 12px 0 14px;
      font-size: clamp(2rem, 9.2vw, 3rem);
    }

    .about-world-copy > p:last-child {
      font-size: 0.9rem;
      line-height: 1.58;
    }

    .about-world-number {
      top: 2px;
      right: 0;
    }

    .about-visual {
      display: none;
    }

    .about-sequence-progress {
      right: 16px;
      bottom: max(16px, env(safe-area-inset-bottom));
      left: 16px;
    }

    .contact-walk {
      height: 150vh;
      margin-inline: -16px;
    }

    .contact-editorial-shell {
      width: 100%;
      height: 100%;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto auto;
      grid-template-areas:
        "mast"
        "heading"
        "email"
        "links"
        "footer";
      gap: 12px;
      align-content: space-between;
      padding: max(72px, calc(env(safe-area-inset-top) + 58px)) 16px max(16px, env(safe-area-inset-bottom));
    }

    .contact-masthead {
      padding: 8px 0;
      font-size: 0.56rem;
    }

    .contact-editorial-heading {
      gap: 12px;
      align-self: end;
    }

    .contact-editorial-heading > p {
      max-width: 28ch;
      font-size: 0.84rem;
      line-height: 1.5;
    }

    .contact-editorial-heading h2 {
      font-size: clamp(3rem, 14vw, 4.6rem);
    }

    .contact-editorial-email {
      width: 100%;
      min-height: 112px;
      gap: 10px;
      padding: 18px;
      border-radius: 24px;
    }

    .contact-editorial-email:hover,
    .contact-editorial-email:focus-visible {
      padding-inline: 18px;
    }

    .contact-editorial-email > span {
      font-size: 0.6rem;
    }

    .contact-editorial-email strong {
      font-size: clamp(0.88rem, 4vw, 1.05rem);
    }

    .contact-editorial-email svg {
      width: 32px;
      height: 32px;
    }

    .contact-editorial-links {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }

    .contact-editorial-links > * {
      min-height: 64px;
      padding: 11px 12px;
      border-radius: 14px;
      font-size: 0.72rem;
    }

    .contact-editorial-links > p {
      grid-column: 1 / -1;
      min-height: 48px;
    }

    .contact-editorial-links a strong {
      font-size: 0.92rem;
    }

    .contact-editorial-footer {
      align-items: center;
      flex-direction: row;
      font-size: 0.52rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(html) {
      scroll-behavior: auto;
    }

    .about-sequence,
    .contact-walk {
      height: auto;
    }

    .about-sequence-stage,
    .contact-walk-stage {
      position: relative;
      height: auto;
      min-height: 100vh;
      overflow: visible;
    }

    .about-worlds {
      position: relative;
    }

    .about-world {
      position: relative;
      min-height: 100vh;
      opacity: 1 !important;
      visibility: visible !important;
      filter: none !important;
      transform: none !important;
    }

    [data-contact-layer] {
      opacity: 1 !important;
      visibility: visible !important;
      filter: none !important;
      transform: none !important;
    }

    .project-card,
    .project-slot,
    .project-detail,
    .project-float,
    .project-orbit-guide,
    .project-wheel::after,
    .contact-chip,
    .about-finale-card,
    .progress-track span,
    .contact-editorial-email,
    .contact-editorial-email svg,
    .contact-editorial-links :is(button, a) {
      transition: none;
    }

    .project-float,
    .project-focus-reveal,
    .project-thumb,
    .project-card-content,
    .loading-orbit,
    .loading-core,
    .loading-comet,
    .contact-orbit,
    .availability i,
    .location-pulse,
    .intro-glyph,
    .intro-pen,
    .identity-ring,
    .about-world-copy > *,
    .about-visual > * {
      animation: none;
    }

    .intro-glyph {
      opacity: 1;
      filter: none;
      transform: none;
    }

    .intro-pen {
      display: none;
    }

    .project-focus-reveal {
      clip-path: none;
      transform: none;
    }

    .about-finale-card,
    .about-finale-card:hover {
      transform: none;
    }
  }
</style>
