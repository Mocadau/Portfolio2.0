<script>
  import ProjectCasePage from '../components/projects/ProjectCasePage.svelte';
  import datasets from '../assets/Migrants/Datasets.png';
  import colorNames from '../assets/Migrants/ColorNames.png';
  import colorMappingOne from '../assets/Migrants/ColorMappingExample1.png';
  import colorMappingTwo from '../assets/Migrants/ColorMappingExample2.png';
  import globeOverview from '../assets/Migrants/GlobeOverview.png';
  import infoCard from '../assets/Migrants/InfoCardExample.png';
  import timeSlider from '../assets/Migrants/TimeSlider.png';
  import filterOptions from '../assets/Migrants/FilterOptions.png';
  import zoomImage from '../assets/ProjectTitles/Migration_Title.avif';

  const project = {
    title: 'Global Missing Migrants',
    kicker: 'Data Visualization',
    year: '2024',
    accent: '#ce1010',
    zoomImage,
    paperColor: '#cfcecc',
    meta: [
      { label: 'Team', values: ['Franz Anhaupl', 'Helen Frank', 'Lisa-Marie Rapp', 'Maurice Cadau'] },
      { label: 'Role', values: ['Concept & Research', 'UI/UX Design', 'Illustration', 'Video & Sound Design'] },
      { label: 'Duration', values: ['Two weeks'] },
      { label: 'Lecturer', values: ['Franklin Hernandez'] },
      { label: 'Course', values: ['3-dim. Grundlagen im medialen Raum'] }
    ],
    hero: {
      type: 'youtube',
      id: '9C-4w9QFXig',
      title: 'Global Missing Migrants - Data visualization'
    },
    sections: [
      {
        title: 'Introduction',
        blocks: [
          {
            type: 'text',
            subtitle: 'An interactive 3D globe that visualizes global migration routes, risk zones, and key patterns - bringing human stories behind the statistics to the surface.',
            paragraphs: [
              'We worked with the Missing Migrants dataset to uncover patterns in global migration crises. Some visuals confirmed our assumptions; others challenged them. Mapping the data onto a globe revealed surprising, often overlooked narratives.'
            ]
          }
        ]
      },
      {
        title: 'Dataset',
        layout: 'two-column',
        blocks: [
          {
            type: 'text',
            paragraphs: ['Quick overview of our dataset Missing Migrants 2014-2023.']
          },
          { type: 'image', src: datasets, alt: 'Dataset overview' }
        ]
      },
      {
        title: 'Color Mapping',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'We used a clear color system to distinguish data points: gray marks inactive or unselected states. Active incidents are shown using a color gradient and varying dot sizes to convey severity and impact.'
            ]
          },
          {
            type: 'mosaic',
            images: [
              { src: colorNames, alt: 'Color names' },
              { src: colorMappingOne, alt: 'Color mapping example one' },
              { src: colorMappingTwo, alt: 'Color mapping example two' }
            ]
          }
        ]
      },
      {
        title: 'Features',
        layout: 'two-column',
        blocks: [
          {
            type: 'text',
            title: 'Globe Overview',
            paragraphs: ['The 3D globe view displays all incidents with pins. Red dots scale in size and brightness to show intensity, providing an immediate visual understanding of critical areas.']
          },
          { type: 'image', src: globeOverview, alt: 'Globe overview' },
          {
            type: 'text',
            title: 'Infocard',
            paragraphs: ['Expandable info cards give detailed context about each event. An integrated speaker button plays an AI-generated voice reading the text aloud.']
          },
          { type: 'image', src: infoCard, alt: 'Info card example' },
          {
            type: 'text',
            title: 'Time Slider',
            paragraphs: ['A dynamic timeline lets users explore how migration patterns evolved over the years. The slider updates the globe view in real-time, showing changes in routes and hotspots.']
          },
          { type: 'image', src: timeSlider, alt: 'Time slider' },
          {
            type: 'text',
            title: 'Filter Options',
            paragraphs: ['Advanced filtering lets users sort incidents by multiple criteria including time period, cause of death, and gender. This granular control helps uncover specific patterns in the data.']
          },
          { type: 'image', src: filterOptions, alt: 'Filter options' }
        ]
      },
      {
        title: 'Reflections',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'This project was a deep dive into both the technical side of 3D visualization and the responsibility that comes with working on real-world data. Building with Three.js sharpened our skills in interactive design, while engaging with the dataset taught us how to extract and communicate meaningful insights.',
              'Using the globe and time slider, we uncovered migration hotspots like the Mexican border, the Darien Gap, and the Mediterranean Sea - regions where risk and tragedy converge. Some patterns aligned with what we expected; others surprised us and shifted our understanding.',
              'More than anything, this project reminded us that behind every data point is a human story. It reinforced the importance of visibility, empathy, and design\'s role in raising awareness around urgent global issues like forced migration.'
            ]
          }
        ]
      }
    ],
    previous: { title: 'PerForm', href: '/perform' },
    next: { title: 'Alignspace', href: '/alignspace' }
  };
</script>

<ProjectCasePage {project} />
