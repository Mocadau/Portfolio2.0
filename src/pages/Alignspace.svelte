<script>
  import ProjectCasePage from '../components/projects/ProjectCasePage.svelte';
  import intro from '../assets/Alignspace/intro.png';
  import process from '../assets/Alignspace/process1.png';
  import designSystem from '../assets/Alignspace/designSystem.png';
  import overview from '../assets/Alignspace/overview.png';
  import booking from '../assets/Alignspace/booking.png';
  import communication from '../assets/Alignspace/communication.png';
  import service from '../assets/Alignspace/service.png';
  import zoomImage from '../assets/ProjectTitles/Alignspace_TItle.avif';

  const project = {
    title: 'Alignspace',
    kicker: 'UX Design',
    year: '2024',
    accent: '#3b82f6',
    zoomImage,
    paperColor: '#dddbdc',
    meta: [
      { label: 'Team', values: ['Moritz Beder', 'Maurice Cadau'] },
      { label: 'Role', values: ['UI/UX Design & Prototyping', 'User Testing', 'Video & Sound Design'] },
      { label: 'Duration', values: ['One Semester'] },
      { label: 'Lecturer', values: ['Kai Wanschura'] },
      { label: 'Course', values: ['Application Design'] }
    ],
    hero: {
      type: 'image',
      src: intro,
      alt: 'Alignspace concept',
      fit: 'contain'
    },
    sections: [
      {
        title: 'Introduction',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'Hybrid work is now part of everyday life, but finding and booking the right workspace is often still complicated. Users want flexibility, transparency, and proximity to their team. Current systems lack personalization, real-time updates, or even a clear view of where colleagues are sitting.'
            ]
          }
        ]
      },
      {
        title: 'Process',
        layout: 'two-column',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'We began with a mix of quantitative surveys and in-depth interviews with both users of co-working spaces and remote employees. These conversations revealed key pain points - from the need for social interaction and visibility of colleagues to the desire for spontaneous bookings and personalized workspaces.',
              'Based on the insights, we developed user personas, including one primary persona that guided our decisions. We then framed a series of How Might We questions, grouped them into logical categories, and translated the needs into high-level user flows.',
              'The final prototype covers key features like personalized booking, team visibility, service chat, and flexible workspace planning.'
            ]
          },
          { type: 'image', src: process, alt: 'Alignspace process' }
        ]
      },
      {
        title: 'Design System',
        blocks: [
          {
            type: 'text',
            paragraphs: [
              'Beyond the booking colors, our primary and secondary tones are designed to enhance usability and make interactions more intuitive. At the heart of the app is the booking system, structured around desks, meeting rooms, and parking spaces - each visually distinguished by its own color.'
            ]
          },
          { type: 'image', src: designSystem, alt: 'Alignspace design system' }
        ]
      },
      {
        title: 'Result',
        layout: 'two-column',
        blocks: [
          {
            type: 'text',
            title: 'Overview',
            paragraphs: ['Alignspace enables users to monitor their current and upcoming bookings through continuous visibility. The platform sends timely reminders and proactive renewal recommendations.']
          },
          { type: 'image', src: overview, alt: 'Overview interface' },
          {
            type: 'text',
            title: 'Booking',
            paragraphs: ['The core function is booking workspaces according to filters and seat neighbors. The app also supports meeting rooms, employee invitations, and parking spaces.']
          },
          { type: 'image', src: booking, alt: 'Booking interface' },
          {
            type: 'text',
            title: 'Communication',
            paragraphs: ['Alignspace offers an integrated communication tool for coordinating with employees and inviting them to meetings.']
          },
          { type: 'image', src: communication, alt: 'Communication interface' },
          {
            type: 'text',
            title: 'Service',
            paragraphs: ['The service bot is available for all kinds of problems. It analyzes the request and creates a ticket for the responsible person.']
          },
          { type: 'image', src: service, alt: 'Service interface' }
        ]
      }
    ],
    previous: { title: 'Global Missing Migrants', href: '/migrants' },
    next: null
  };
</script>

<ProjectCasePage {project} />
