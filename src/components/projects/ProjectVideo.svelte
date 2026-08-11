<script>
  export let youtubeId = '';
  export let title = 'Project video';

  let loaded = false;
</script>

<div class="project-video">
  {#if !loaded}
    <div class="video-loader" aria-hidden="true">
      <span></span>
      <strong>M</strong>
    </div>
  {/if}
  <iframe
    class:loaded
    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1`}
    title={title}
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    onload={() => (loaded = true)}
  ></iframe>
</div>

<style>
  .project-video {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: #05070a;
  }

  .project-video iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    opacity: 0;
    transition: opacity 420ms ease;
  }

  .project-video iframe.loaded {
    opacity: 1;
  }

  .video-loader {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;
    width: 74px;
    height: 74px;
    transform: translate(-50%, -50%);
  }

  .video-loader span {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-top-color: #e0be73;
    border-radius: 50%;
    animation: videoOrbit 1.1s linear infinite;
  }

  .video-loader strong {
    position: absolute;
    inset: 20px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #111;
    background: #fff9ed;
    font-size: 0.78rem;
  }

  @keyframes videoOrbit {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .video-loader span {
      animation: none;
    }

    .project-video iframe {
      transition: none;
    }
  }
</style>
