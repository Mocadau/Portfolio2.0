<script>
  import ProjectCasePage from '../components/projects/ProjectCasePage.svelte';
  import whiteboardRoom from '../assets/Project_background.avif';
  import catchPokemonTitle from '../assets/Pokemon/CatchPokemonTitle.jpg';
  import pokemonInterface from '../assets/Pokemon/PokemonUI.png';

  const project = {
    title: 'Catch Pokémon',
    kicker: 'University Project',
    year: '2026',
    accent: '#d9ff72',
    zoomImage: whiteboardRoom,
    zoomOverlay: catchPokemonTitle,
    zoomOverlayWide: true,
    paperColor: '#d7dde3',
    meta: [
      { label: 'Team', values: ['Maurice Cadau'] },
      { label: 'Role', values: ['Concept & Research', 'UI/UX Design', 'Video Creation'] },
      { label: 'Duration', values: ['One Semester (Warsaw)'] },
      { label: 'Lecturer', values: ['dr hab. Piechota Jan'] },
      { label: 'Course', values: ['Basics on digital design 1'] }
    ],
    hero: {
      type: 'image',
      src: pokemonInterface,
      alt: 'Interactive travel map with Pokémon encounters and a collectible archive'
    },
    sections: [
      {
        title: 'Starting Point',
        blocks: [
          {
            type: 'text',
            title: 'A visual travel diary turned into an interactive map',
            paragraphs: [
              'During my semester abroad, I documented my journeys through a series of images. I wanted visitors to understand where I had stayed and what I had experienced without presenting the material as a conventional photo gallery.',
              'The goal was to transform those memories into an interactive map that gives an overview of the places I visited and invites people to discover them through a playful Pokémon-inspired system.'
            ]
          }
        ]
      },
      {
        title: 'AI Visual Direction',
        blocks: [
          {
            type: 'text',
            title: 'Generating a coherent world',
            paragraphs: [
              'I generated and refined the visual material with Nano Banana Pro and Seedream 4.5. The AI-assisted workflow helped me establish one visual world across the Pokémon characters, Poké Ball animations, and 2D pixel Pokémon.',
              'The work went beyond generating individual images: I iterated on prompts, selected the strongest outputs, corrected inconsistencies, and assembled the assets into one coherent visual language.'
            ]
          }
        ]
      },
      {
        title: 'Interaction',
        blocks: [
          {
            type: 'text',
            title: 'Discovering the journey through play',
            paragraphs: [
              'The images became encounters placed along the route. Map markers, escape sequences, and a collection archive turn the travel diary into a small interactive discovery experience.',
              'Visitors can follow the route, unlock the documented stops, and see the semester abroad as a connected journey.'
            ]
          }
        ]
      },
      {
        title: 'Result',
        blocks: [
          {
            type: 'action',
            eyebrow: 'Live experience',
            title: 'Explore the journey',
            text: 'Follow the route, discover the encounters, and unlock the visual archive.',
            label: 'Launch Catch Pokémon',
            href: '/pokemon/',
            animate: true
          }
        ]
      }
    ],
    hideNavigation: true
  };
</script>

<ProjectCasePage {project} />
