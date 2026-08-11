<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import whiteboardBackground from '../../assets/Project_background.avif';

  export let accent = '#ce1010';
  export let image = whiteboardBackground;
  export let overlayImage = '';
  export let overlayWide = false;
  export let paperColor = '#fff';

  let scene;
  let zoomLayer;
  let zoomWash;
  let zoomCue;
  let imageReady = false;

  onMount(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (reduceMotion.matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.05,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      timeline
        .fromTo(
          zoomLayer,
          { scale: 1, yPercent: 0, filter: 'brightness(1) saturate(1) blur(0px)' },
          {
            scale: () => (window.innerWidth < 760 ? 15 : 17.2),
            transformOrigin: '50% 53%',
            yPercent: -1.5,
            filter: 'brightness(1.08) saturate(0.9) blur(1.2px)',
            ease: 'power2.inOut',
            duration: 1
          },
          0
        )
        .to(zoomCue, { autoAlpha: 0, y: -14, ease: 'power2.out', duration: 0.2 }, 0.04)
        .fromTo(
          zoomWash,
          { autoAlpha: 0 },
          { autoAlpha: 1, ease: 'power2.inOut', duration: 0.1 },
          0.9
        );
    }, scene);

    return () => context.revert();
  });
</script>

<section
  class="project-zoom-scene"
  bind:this={scene}
  style={`--accent: ${accent}; --paper-color: ${paperColor};`}
>
  <div class="project-zoom-stage">
    <div class="project-zoom-layer" bind:this={zoomLayer}>
      <img
        src={image || whiteboardBackground}
        alt=""
        class="project-zoom-image"
        class:project-zoom-image-ready={imageReady}
        decoding="async"
        onload={() => (imageReady = true)}
      />
      {#if overlayImage}
        <img
          class="project-zoom-overlay"
          class:project-zoom-overlay-wide={overlayWide}
          src={overlayImage}
          alt=""
          decoding="async"
        />
      {/if}
    </div>
    <div class="project-zoom-wash" bind:this={zoomWash} aria-hidden="true"></div>
    <div class="zoom-scroll-cue" bind:this={zoomCue} aria-hidden="true">
      <span>Enter the case study</span>
      <i></i>
    </div>
  </div>
</section>

<slot />

<style>
  .project-zoom-scene {
    height: 220vh;
    background: var(--paper-color);
    margin-bottom: -1px;
  }

  .project-zoom-stage {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    isolation: isolate;
    background: var(--paper-color);
  }

  .project-zoom-layer {
    position: absolute;
    inset: 0;
    transform-origin: 50% 50%;
    will-change: transform;
  }

  .project-zoom-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    opacity: 0;
    transform: scale(1.018);
    transition: opacity 520ms ease, transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-zoom-image-ready {
    opacity: 1;
    transform: scale(1);
  }

  .project-zoom-overlay {
    position: absolute;
    top: 45%;
    left: 50%;
    z-index: 1;
    width: min(29vw, 560px);
    height: min(35vh, 400px);
    object-fit: contain;
    filter: drop-shadow(0 16px 18px rgba(33, 29, 8, 0.2));
    transform: translate(-50%, -50%);
    transform-origin: center;
    pointer-events: none;
  }

  .project-zoom-overlay-wide {
    width: min(41vw, 800px);
    height: min(39vh, 450px);
    border-radius: clamp(3px, 0.45vw, 9px);
    filter: drop-shadow(0 16px 22px rgba(12, 18, 28, 0.28));
  }

  .project-zoom-wash {
    position: absolute;
    inset: 0;
    z-index: 2;
    background:
      radial-gradient(circle at 50% 53%, color-mix(in srgb, var(--paper-color) 84%, #fff), var(--paper-color) 68%);
    opacity: 0;
    pointer-events: none;
  }

  .zoom-scroll-cue {
    position: absolute;
    right: clamp(20px, 4vw, 54px);
    bottom: clamp(22px, 4vh, 42px);
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.64rem;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  }

  .zoom-scroll-cue i {
    position: relative;
    display: block;
    width: 42px;
    height: 1px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.28);
  }

  .zoom-scroll-cue i::after {
    position: absolute;
    inset: 0;
    content: "";
    background: #fff;
    animation: cueTravel 1.7s ease-in-out infinite;
    transform: translateX(-110%);
  }

  @keyframes cueTravel {
    65%, 100% { transform: translateX(110%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .project-zoom-scene {
      height: 100vh;
    }

    .project-zoom-stage {
      position: relative;
    }

    .zoom-scroll-cue {
      display: none;
    }

    .project-zoom-image {
      transition: none;
    }
  }

  @media (max-width: 760px) {
    .project-zoom-scene {
      height: 198vh;
    }

    .project-zoom-image {
      object-position: 50% 50%;
    }

    .project-zoom-overlay-wide {
      width: min(72vw, 620px);
      height: min(34vh, 320px);
    }
  }
</style>
