<script>
  import ProjectZoomIntro from './ProjectZoomIntro.svelte';
  import ProjectMedia from './ProjectMedia.svelte';
  import ProjectVideo from './ProjectVideo.svelte';

  export let project;

  let launching = false;

  function handleLaunch(event, block) {
    if (!block.animate) {
      return;
    }

    event.preventDefault();

    if (launching) {
      return;
    }

    launching = true;
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 80 : 720;

    window.setTimeout(() => {
      window.location.assign(block.href);
    }, delay);
  }
</script>

{#if launching}
  <div
    class="project-launch-transition"
    role="status"
    aria-live="polite"
    style={`--accent: ${project.accent};`}
  >
    <span aria-hidden="true"><i></i><i></i><i></i></span>
    <strong>Loading {project.title}</strong>
  </div>
{/if}

<a
  class="home-link"
  href="/?section=work"
  aria-label="Back to work"
  data-full-navigation
  style={`--accent: ${project.accent};`}
>
  <span class="home-link-icon">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m14.5 5-7 7 7 7" />
      <path d="M8 12h10" />
    </svg>
  </span>
  <span class="home-link-copy"><small>Return to portfolio</small><strong>Selected work</strong></span>
</a>

<ProjectZoomIntro
  accent={project.accent}
  image={project.zoomImage}
  overlayImage={project.zoomOverlay ?? ''}
  overlayWide={project.zoomOverlayWide ?? false}
  paperColor={project.paperColor}
>
  <article class="case-page" style={`--accent: ${project.accent}; --paper-color: ${project.paperColor ?? '#fff'};`}>
    <header class="case-header">
      <div class="case-title">
        <p>{project.kicker}</p>
        <h1>{project.title}</h1>
        <span>{project.year}</span>
      </div>
    </header>

    {#if project.meta?.length}
      <section class="case-meta" aria-label={`${project.title} project details`}>
        {#each project.meta as item}
          <div>
            <h2>{item.label}</h2>
            {#each item.values as value}
              <p>{value}</p>
            {/each}
          </div>
        {/each}
      </section>
    {/if}

    {#if project.hero}
      <section class="case-hero">
        {#if project.hero.type === 'youtube'}
          <ProjectVideo youtubeId={project.hero.id} title={project.hero.title} />
        {:else}
          <ProjectMedia src={project.hero.src} alt={project.hero.alt} fit={project.hero.fit ?? 'contain'} />
        {/if}
      </section>
    {/if}

    <main class="case-content">
      {#each project.sections as section}
        <section class="case-section" class:case-section-wide={!section.title}>
          {#if section.title}
            <div class="section-heading">
              <h2>{section.title}</h2>
            </div>
          {/if}
          <div class={`section-body ${section.layout ?? ''}`}>
            {#each section.blocks as block}
              {#if block.type === 'text'}
                <div class="text-block">
                  {#if block.title}<h3>{block.title}</h3>{/if}
                  {#if block.subtitle}<p class="subtitle">{block.subtitle}</p>{/if}
                  {#each block.paragraphs as paragraph}
                    <p>{paragraph}</p>
                  {/each}
                </div>
              {:else if block.type === 'image'}
                <ProjectMedia src={block.src} alt={block.alt} caption={block.caption ?? ''} fit={block.fit ?? 'contain'} />
              {:else if block.type === 'mosaic'}
                <div class="mosaic">
                  {#each block.images as image}
                    <ProjectMedia src={image.src} alt={image.alt} />
                  {/each}
                </div>
              {:else if block.type === 'stats'}
                <div class="stats-grid">
                  {#each block.items as item}
                    <div class="stat-card">
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  {/each}
                </div>
              {:else if block.type === 'steps'}
                <div class="steps-grid">
                  {#each block.items as item}
                    <div class="step-card">
                      <h3>{item.title}</h3>
                      <ProjectMedia src={item.src} alt={item.alt} caption={item.caption} />
                    </div>
                  {/each}
                </div>
              {:else if block.type === 'findings'}
                <div class="findings-list">
                  {#each block.items as item}
                    <p>{item}</p>
                  {/each}
                </div>
              {:else if block.type === 'action'}
                <a
                  class="launch-card"
                  class:launch-card-active={launching}
                  href={block.href}
                  target={block.newTab ? '_blank' : undefined}
                  rel={block.newTab ? 'noreferrer' : undefined}
                  data-full-navigation
                  onclick={(event) => handleLaunch(event, block)}
                >
                  {#if block.eyebrow}<span>{block.eyebrow}</span>{/if}
                  {#if block.title}<h3>{block.title}</h3>{/if}
                  {#if block.text}<p>{block.text}</p>{/if}
                  <strong>{block.label}<i aria-hidden="true">↗</i></strong>
                </a>
              {/if}
            {/each}
          </div>
        </section>
      {/each}
    </main>

    {#if !project.hideNavigation && (project.previous || project.next)}
      <nav class="case-nav" aria-label="Project navigation">
        {#if project.previous}
          <a href={project.previous.href}>
            <span>Previous</span>
            <strong>{project.previous.title}</strong>
          </a>
        {/if}
        {#if project.next}
          <a href={project.next.href}>
            <span>Next</span>
            <strong>{project.next.title}</strong>
          </a>
        {/if}
      </nav>
    {/if}
  </article>
</ProjectZoomIntro>

<style>
  :global(html) {
    background: #05070a;
  }

  :global(body) {
    margin: 0;
    background: #05070a;
    color: #111;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
  }

  .case-page {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    color: #111;
    background:
      linear-gradient(
        180deg,
        var(--paper-color) 0,
        color-mix(in srgb, var(--paper-color) 78%, #fff) 180px,
        #fff 680px
      );
  }

  .case-header {
    position: relative;
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr) 120px;
    align-items: start;
    max-width: 1320px;
    margin: 0 auto;
    padding: clamp(12px, 2vw, 28px) clamp(22px, 5vw, 64px) clamp(62px, 8vw, 112px);
  }

  .home-link {
    position: fixed;
    top: clamp(14px, 2vw, 28px);
    left: clamp(14px, 2vw, 28px);
    z-index: 30;
    display: inline-flex;
    min-height: 58px;
    align-items: center;
    gap: 11px;
    padding: 7px 15px 7px 7px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 18px;
    color: #fff;
    background: rgba(7, 10, 14, 0.82);
    box-shadow: 0 16px 44px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    text-decoration: none;
    backdrop-filter: blur(18px) saturate(1.3);
    transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms ease, box-shadow 180ms ease;
  }

  .home-link-icon {
    display: grid;
    width: 42px;
    height: 42px;
    flex: none;
    place-items: center;
    border-radius: 13px;
    color: #101317;
    background: var(--accent);
    transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .home-link svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .home-link-copy {
    display: grid;
    gap: 1px;
    padding-right: 2px;
  }

  .home-link-copy small {
    color: rgba(255, 255, 255, 0.54);
    font-size: 0.58rem;
    font-weight: 760;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .home-link-copy strong {
    font-size: 0.78rem;
    font-weight: 880;
  }

  .home-link:hover,
  .home-link:focus-visible {
    background: rgba(7, 10, 14, 0.94);
    box-shadow: 0 20px 54px rgba(0, 0, 0, 0.34), 0 0 0 2px color-mix(in srgb, var(--accent) 46%, transparent);
    transform: translateX(-4px);
  }

  .home-link:hover .home-link-icon,
  .home-link:focus-visible .home-link-icon {
    transform: translateX(-3px);
  }

  .case-title {
    text-align: center;
  }

  .case-title p {
    margin: 0 0 14px;
    color: var(--accent);
    font-size: 0.82rem;
    font-weight: 950;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .case-title h1 {
    margin: 0;
    color: #111;
    font-size: clamp(3.1rem, 8vw, 8.5rem);
    line-height: 0.88;
    letter-spacing: 0;
  }

  .case-title span {
    display: inline-block;
    margin-top: 22px;
    color: #555;
    font-weight: 700;
  }

  .case-meta {
    display: grid;
    grid-template-columns: repeat(5, minmax(140px, 1fr));
    gap: clamp(18px, 3vw, 36px);
    max-width: 1320px;
    margin: 0 auto clamp(46px, 8vw, 92px);
    padding: 0 clamp(22px, 5vw, 64px);
  }

  .case-meta h2 {
    margin: 0 0 14px;
    color: #6b6b66;
    font-size: 0.84rem;
    font-weight: 950;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .case-meta p {
    margin: 0 0 8px;
    color: #20201d;
    font-size: clamp(1rem, 1.3vw, 1.18rem);
    line-height: 1.35;
  }

  .case-hero {
    max-width: 1180px;
    margin: 0 auto clamp(72px, 10vw, 130px);
    padding: 0 clamp(22px, 5vw, 64px);
  }

  .case-content {
    max-width: 1320px;
    margin: 0 auto;
    padding: 0 clamp(22px, 5vw, 64px) clamp(80px, 12vw, 150px);
  }

  .case-section {
    display: grid;
    grid-template-columns: minmax(180px, 0.45fr) minmax(0, 1fr);
    gap: clamp(28px, 6vw, 88px);
    padding: clamp(48px, 8vw, 96px) 0;
    border-top: 1px solid rgba(17, 17, 17, 0.14);
  }

  .case-section-wide {
    grid-template-columns: minmax(0, 1fr);
  }

  .section-heading h2 {
    position: sticky;
    top: 24px;
    margin: 0;
    color: #111;
    font-size: clamp(1.35rem, 2vw, 2.1rem);
    line-height: 1;
  }

  .section-body {
    display: grid;
    gap: clamp(24px, 4vw, 48px);
  }

  .section-body.two-column {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }

  .text-block {
    max-width: 780px;
  }

  .text-block h3 {
    margin: 0 0 12px;
    color: #111;
    font-size: clamp(1.15rem, 1.6vw, 1.5rem);
  }

  .text-block p {
    margin: 0 0 18px;
    color: #222;
    font-size: clamp(1.08rem, 1.55vw, 1.38rem);
    line-height: 1.72;
  }

  .text-block .subtitle {
    color: #111;
    font-weight: 650;
  }

  .mosaic {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    align-items: start;
  }

  .mosaic :global(.project-media:first-child) {
    grid-row: span 2;
  }

  .stats-grid,
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .stat-card,
  .step-card,
  .findings-list p {
    border: 1px solid rgba(17, 17, 17, 0.16);
    background: #fff;
    padding: clamp(18px, 2vw, 28px);
  }

  .launch-card {
    position: relative;
    display: grid;
    min-height: 320px;
    align-content: end;
    gap: 12px;
    padding: clamp(26px, 5vw, 64px);
    overflow: hidden;
    color: #f8fbff;
    background:
      radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--accent) 34%, transparent), transparent 30%),
      linear-gradient(135deg, #23303e, #101822 72%);
    text-decoration: none;
    box-shadow: 0 28px 70px rgba(13, 21, 29, 0.2);
    transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 260ms ease;
  }

  .launch-card::after {
    position: absolute;
    top: 30px;
    right: 34px;
    width: 86px;
    height: 86px;
    border: 1px solid color-mix(in srgb, var(--accent) 74%, #fff);
    border-radius: 50%;
    content: "";
    box-shadow: 0 0 0 18px color-mix(in srgb, var(--accent) 7%, transparent);
  }

  .launch-card > * {
    position: relative;
    z-index: 1;
  }

  .launch-card > span {
    color: var(--accent);
    font-size: 0.68rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .launch-card h3,
  .launch-card p {
    margin: 0;
  }

  .launch-card h3 {
    max-width: 13ch;
    color: #fff;
    font-size: clamp(2.3rem, 5.5vw, 5.6rem);
    line-height: 0.92;
    letter-spacing: -0.045em;
  }

  .launch-card p {
    max-width: 44ch;
    color: rgba(248, 251, 255, 0.74);
    font-size: clamp(0.96rem, 1.25vw, 1.15rem);
    line-height: 1.45;
  }

  .launch-card strong {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: clamp(1rem, 1.7vw, 1.3rem);
  }

  .launch-card i {
    color: var(--accent);
    font-size: 1.8em;
    font-style: normal;
    transition: transform 220ms ease;
  }

  .launch-card:hover,
  .launch-card:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 70%, #fff);
    outline-offset: 5px;
    box-shadow: 0 34px 84px rgba(13, 21, 29, 0.28);
    transform: translateY(-5px);
  }

  .launch-card:hover i,
  .launch-card:focus-visible i {
    transform: translate(4px, -4px);
  }

  .launch-card-active {
    pointer-events: none;
  }

  .project-launch-transition {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 24px;
    color: #f8fbff;
    background:
      radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent, #d9ff72) 18%, transparent), transparent 34%),
      rgba(6, 10, 15, 0.94);
    backdrop-filter: blur(18px) saturate(1.25);
    animation: launchFadeIn 220ms ease both;
  }

  .project-launch-transition > span {
    position: relative;
    width: 86px;
    height: 86px;
  }

  .project-launch-transition i {
    position: absolute;
    inset: 0;
    border: 1px solid color-mix(in srgb, var(--accent, #d9ff72) 72%, #fff);
    border-radius: 42% 58% 54% 46%;
    animation: launchLiquid 900ms ease-in-out infinite alternate;
  }

  .project-launch-transition i:nth-child(2) {
    inset: 13px;
    animation-delay: -300ms;
    animation-direction: alternate-reverse;
  }

  .project-launch-transition i:nth-child(3) {
    inset: 27px;
    background: var(--accent, #d9ff72);
    border: 0;
    box-shadow: 0 0 34px color-mix(in srgb, var(--accent, #d9ff72) 54%, transparent);
    animation-delay: -560ms;
  }

  .project-launch-transition strong {
    font-size: 0.72rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  @keyframes launchFadeIn {
    from { opacity: 0; }
  }

  @keyframes launchLiquid {
    to { border-radius: 58% 42% 47% 53%; transform: rotate(130deg) scale(1.06); }
  }

  .stat-card strong {
    display: block;
    color: var(--accent);
    font-size: clamp(2.4rem, 5vw, 4.8rem);
    line-height: 0.9;
  }

  .stat-card span {
    display: block;
    margin-top: 14px;
    color: #222;
    font-weight: 700;
    line-height: 1.35;
  }

  .step-card h3 {
    margin: 0 0 18px;
    font-size: 1.05rem;
  }

  .findings-list {
    display: grid;
    gap: 14px;
  }

  .findings-list p {
    margin: 0;
    color: #222;
    font-size: clamp(1rem, 1.25vw, 1.18rem);
    line-height: 1.48;
  }

  .case-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1px;
    background: rgba(17, 17, 17, 0.16);
  }

  .case-nav a {
    display: grid;
    min-height: 180px;
    align-content: center;
    padding: clamp(26px, 5vw, 64px);
    color: #111;
    background: #fff;
    text-decoration: none;
    transition: background 180ms ease;
  }

  .case-nav a:hover,
  .case-nav a:focus-visible {
    background: color-mix(in srgb, var(--accent) 18%, #fff);
  }

  .case-nav span {
    color: #6b6b66;
    font-size: 0.8rem;
    font-weight: 950;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .case-nav strong {
    margin-top: 8px;
    font-size: clamp(1.8rem, 4vw, 4rem);
    line-height: 0.95;
  }

  @media (max-width: 900px) {
    .case-header {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .case-title {
      text-align: left;
    }

    .case-meta {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .case-section,
    .section-body.two-column,
    .stats-grid,
    .steps-grid,
    .case-nav {
      grid-template-columns: 1fr;
    }

    .section-heading h2 {
      position: static;
    }
  }

  @media (max-width: 560px) {
    .case-meta,
    .mosaic {
      grid-template-columns: 1fr;
    }
  }
</style>
