<script>
  import ProjectCasePage from '../components/projects/ProjectCasePage.svelte';
  import intro from '../assets/PerForm/intro.png';
  import processOne from '../assets/PerForm/process1.png';
  import processTwo from '../assets/PerForm/process2.png';
  import stepOne from '../assets/PerForm/step1.png';
  import stepTwo from '../assets/PerForm/step2.png';
  import stepThree from '../assets/PerForm/step3.png';
  import resultOne from '../assets/PerForm/result1.png';
  import resultTwo from '../assets/PerForm/result2.png';
  import resultThree from '../assets/PerForm/result3.png';
  import resultFour from '../assets/PerForm/result4.png';
  import resultFive from '../assets/PerForm/result5.png';
  import resultSix from '../assets/PerForm/result6.png';
  import analysis from '../assets/PerForm/analysis.png';
  import zoomImage from '../assets/ProjectTitles/PerForm_Title.avif';

  const project = {
    title: 'PerForm',
    kicker: 'Invention Design',
    year: '2024',
    accent: '#ce1010',
    zoomImage,
    paperColor: '#d4d0cf',
    meta: [
      { label: 'Team', values: ['Helen Frank', 'Annalena Stein', 'Jasmina Kramer', 'Maurice Cadau'] },
      { label: 'Role', values: ['Concept & Research', 'UI/UX Design', 'Video & Sound Design'] },
      { label: 'Duration', values: ['One Semester'] },
      { label: 'Lecturer', values: ['David Oswald'] },
      { label: 'Course', values: ['Invention Design 2'] }
    ],
    hero: {
      type: 'youtube',
      id: 'W8jN416JFbI',
      title: 'PerForm - VR Fitness Experience'
    },
    sections: [
      {
        title: 'Introduction',
        layout: 'two-column',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'The desire to increase the safety and effectiveness of fitness exercises. Beginners in particular often perform incorrect movements, which can lead to injuries or ineffective training.',
              'The goal of our project is a VR fitness app that uses body tracking and real-time feedback to help users perform exercises precisely and correctly by visualizing postural errors and providing step-by-step instructions.'
            ]
          },
          { type: 'image', src: intro, alt: 'VR fitness concept' }
        ]
      },
      {
        title: 'Process',
        layout: 'two-column',
        blocks: [
          { type: 'image', src: processTwo, alt: 'PerForm process steps' },
          { type: 'image', src: processOne, alt: 'PerForm process visualization' }
        ]
      },
      {
        title: 'Steps',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Step 1: Detection',
                src: stepOne,
                alt: 'Step 1 detection',
                caption: 'The user attempts the exercise. When the system detects incorrect posture, visual cues appear and the video pauses.'
              },
              {
                title: 'Step 2: Correction',
                src: stepTwo,
                alt: 'Step 2 correction',
                caption: 'The user adjusts their posture using the visual guidance provided by the system.'
              },
              {
                title: 'Step 3: Confirmation',
                src: stepThree,
                alt: 'Step 3 confirmation',
                caption: 'Once the user achieves correct form, the video resumes and progresses to the next movement.'
              }
            ]
          }
        ]
      },
      {
        title: 'User Research',
        blocks: [
          {
            type: 'stats',
            items: [
              { value: '78%', label: 'have used videos as exercise guides' },
              { value: '67%', label: 'had positive experiences with personal trainers' },
              { value: '22%', label: 'had no prior trainer experience' }
            ]
          }
        ]
      },
      {
        title: 'Key Findings',
        blocks: [
          {
            type: 'findings',
            items: [
              'Visual demonstration proves most effective - verbal instructions alone often fall short.',
              'Most users lack initial body awareness, making targeted corrections essential.',
              'Slow, controlled executions at the beginning improve the later performance.'
            ]
          }
        ]
      },
      {
        title: 'Result',
        layout: 'two-column',
        blocks: [
          { type: 'image', src: resultOne, alt: 'PerForm home screen', caption: 'Home' },
          { type: 'image', src: resultTwo, alt: 'Choose exercise screen', caption: 'Choose exercise' },
          { type: 'image', src: resultThree, alt: 'Video based training screen', caption: 'Video-based training' },
          { type: 'image', src: resultFour, alt: 'Training feedback screen', caption: 'During video-based training' },
          { type: 'image', src: resultFive, alt: 'PerForm point of view screen one', caption: 'POV' },
          { type: 'image', src: resultSix, alt: 'PerForm point of view screen two', caption: 'POV' }
        ]
      },
      {
        title: 'Analysis',
        blocks: [
          { type: 'image', src: analysis, alt: 'PerForm analysis' }
        ]
      }
    ],
    previous: { title: 'Catch Pokémon', href: '/pokemon-case' },
    next: { title: 'Global Missing Migrants', href: '/migrants' }
  };
</script>

<ProjectCasePage {project} />
