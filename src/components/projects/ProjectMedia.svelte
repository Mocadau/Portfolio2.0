<script>
  export let src = '';
  export let alt = '';
  export let caption = '';
  export let fit = 'contain';

  let loaded = false;
  let failed = false;
</script>

<figure class="project-media" class:media-loaded={loaded} class:media-failed={failed}>
  <div class="project-media-frame">
    {#if !loaded && !failed}
      <div class="media-loader" aria-hidden="true">
        <span class="media-loader-orbit"></span>
        <span class="media-loader-dot"></span>
        <strong>M</strong>
      </div>
    {/if}
    <img
      class:cover={fit === 'cover'}
      {src}
      {alt}
      loading="lazy"
      decoding="async"
      onload={() => (loaded = true)}
      onerror={() => (failed = true)}
    />
  </div>
  {#if caption}
    <figcaption>{caption}</figcaption>
  {/if}
</figure>

<style>
  .project-media {
    width: 100%;
    margin: 0;
  }

  .project-media-frame {
    position: relative;
    min-height: clamp(180px, 34vw, 520px);
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 50%, rgba(17, 17, 17, 0.06), transparent 30%),
      #f6f6f1;
  }

  .project-media img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
    opacity: 0;
    transform: scale(1.012);
    transition: opacity 480ms ease, transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .media-loaded .project-media-frame {
    min-height: 0;
  }

  .media-loaded img {
    opacity: 1;
    transform: scale(1);
  }

  .media-failed .project-media-frame {
    min-height: 180px;
  }

  .media-loader {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 74px;
    height: 74px;
    z-index: 2;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .media-loader-orbit {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(17, 17, 17, 0.18);
    border-radius: 48% 52% 50% 50%;
    animation: mediaOrbit 1.8s linear infinite;
  }

  .media-loader-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ce1010;
    box-shadow: 0 0 12px rgba(206, 16, 16, 0.38);
    animation: mediaDot 1.2s ease-in-out infinite;
  }

  .media-loader strong {
    position: absolute;
    inset: 19px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #f6f6f1;
    background: #111;
    font-size: 0.78rem;
  }

  @keyframes mediaOrbit {
    to { transform: rotate(360deg); }
  }

  @keyframes mediaDot {
    from { transform: rotate(0) translateX(36px) rotate(0); }
    to { transform: rotate(360deg) translateX(36px) rotate(-360deg); }
  }

  .project-media img.cover {
    aspect-ratio: 16 / 10;
    object-fit: cover;
  }

  @media (prefers-reduced-motion: reduce) {
    .media-loader-orbit,
    .media-loader-dot {
      animation: none;
    }

    .project-media img {
      transition: none;
    }
  }

  .project-media figcaption {
    margin-top: 10px;
    color: #686864;
    font-size: 0.88rem;
    line-height: 1.45;
  }
</style>
