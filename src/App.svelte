<script>
  import { onMount } from 'svelte';
  import Portfolio from '../Portfolio.svelte';

  const loadPerform = () => import('./pages/Perform.svelte');
  const loadMigrants = () => import('./pages/Migrants.svelte');
  const loadAlignspace = () => import('./pages/Alignspace.svelte');
  const siteUrl = 'https://mocadau.com';
  const socialImage = `${siteUrl}/portfolio-assets/Background/02.webp`;

  const routeLoaders = {
    '/pokemon-case': () => import('./pages/Pokemon.svelte'),
    '/perform': loadPerform,
    '/PerForm': loadPerform,
    '/migrants': loadMigrants,
    '/GlobalMigrants': loadMigrants,
    '/alignspace': loadAlignspace,
    '/Alignspace': loadAlignspace
  };

  const defaultMeta = {
    title: 'Maurice Cadau — Interaction Designer & Creative Technologist',
    description:
      'Portfolio of Maurice Cadau, an interaction designer and creative technologist building websites, AI-assisted concepts, and interactive digital experiences.',
    canonical: '/'
  };

  const routeMeta = {
    '/pokemon-case': {
      title: 'Catch Pokémon — Maurice Cadau',
      description: 'An AI-assisted interactive travel diary that turns Maurice Cadau’s semester abroad into a playful Pokémon map experience.',
      canonical: '/pokemon-case'
    },
    '/perform': {
      title: 'PerForm — Maurice Cadau',
      description: 'A VR fitness case study using body tracking and real-time feedback to support safer, more precise exercise.',
      canonical: '/perform'
    },
    '/PerForm': {
      title: 'PerForm — Maurice Cadau',
      description: 'A VR fitness case study using body tracking and real-time feedback to support safer, more precise exercise.',
      canonical: '/perform'
    },
    '/migrants': {
      title: 'Global Missing Migrants — Maurice Cadau',
      description: 'An interactive 3D data-visualization case study revealing migration routes, incidents, and patterns on a global globe.',
      canonical: '/migrants'
    },
    '/GlobalMigrants': {
      title: 'Global Missing Migrants — Maurice Cadau',
      description: 'An interactive 3D data-visualization case study revealing migration routes, incidents, and patterns on a global globe.',
      canonical: '/migrants'
    },
    '/alignspace': {
      title: 'Alignspace — Maurice Cadau',
      description: 'A UX case study for a flexible workspace platform combining personalized booking, team visibility, and service support.',
      canonical: '/alignspace'
    },
    '/Alignspace': {
      title: 'Alignspace — Maurice Cadau',
      description: 'A UX case study for a flexible workspace platform combining personalized booking, team visibility, and service support.',
      canonical: '/alignspace'
    }
  };

  let path = typeof window === 'undefined' ? '/' : window.location.pathname;
  let CurrentPage = routeLoaders[path] ? null : Portfolio;
  let routeLoadToken = 0;

  $: pageMeta = routeMeta[path] ?? defaultMeta;
  $: canonicalUrl = `${siteUrl}${pageMeta.canonical}`;
  $: loadRoute(path);

  async function loadRoute(nextPath) {
    const loader = routeLoaders[nextPath];
    const token = ++routeLoadToken;

    if (!loader) {
      CurrentPage = Portfolio;
      return;
    }

    CurrentPage = null;
    const module = await loader();

    if (token === routeLoadToken) {
      CurrentPage = module.default;
    }
  }

  function navigateTo(url) {
    window.history.pushState({}, '', url);
    path = window.location.pathname;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleDocumentClick(event) {
    if (event.defaultPrevented) {
      return;
    }

    const anchor = event.target.closest?.('a[href]');

    if (
      !anchor ||
      anchor.target ||
      anchor.hasAttribute('data-full-navigation') ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const url = new URL(anchor.href, window.location.origin);

    if (url.origin !== window.location.origin) {
      return;
    }

    if (url.pathname === '/pokemon/' || url.pathname.startsWith('/pokemon/')) {
      return;
    }

    if (url.pathname === '/' || routeLoaders[url.pathname]) {
      event.preventDefault();
      navigateTo(url.pathname + url.search + url.hash);
    }
  }

  onMount(() => {
    const syncPath = () => {
      path = window.location.pathname;
    };

    window.addEventListener('popstate', syncPath);
    document.addEventListener('click', handleDocumentClick);

    return () => {
      window.removeEventListener('popstate', syncPath);
      document.removeEventListener('click', handleDocumentClick);
    };
  });
</script>

<svelte:head>
  <title>{pageMeta.title}</title>
  <meta name="description" content={pageMeta.description} />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:title" content={pageMeta.title} />
  <meta property="og:description" content={pageMeta.description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={socialImage} />
  <meta name="twitter:title" content={pageMeta.title} />
  <meta name="twitter:description" content={pageMeta.description} />
  <meta name="twitter:image" content={socialImage} />
</svelte:head>

{#if CurrentPage}
  <svelte:component this={CurrentPage} />
{:else}
  <div class="route-loader" role="status" aria-label="Loading project"></div>
{/if}

<style>
  .route-loader {
    position: fixed;
    inset: 0;
    background: #05070a;
  }

  .route-loader::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 26px;
    height: 26px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: #d9ff72;
    border-radius: 50%;
    content: "";
    transform: translate(-50%, -50%);
    animation: routeSpin 700ms linear infinite;
  }

  @keyframes routeSpin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
</style>
