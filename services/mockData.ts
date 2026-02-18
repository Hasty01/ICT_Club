
import { UserRole, UserProfile, ClubEvent, Project, Resource } from '../types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    email: 'admin@ictclub.com',
    full_name: 'Alex Rivera',
    role: UserRole.ADMIN,
    avatar_url: 'https://picsum.photos/seed/admin/200',
    bio: 'Club President and Full-Stack Engineer. Passionate about community and building cool things.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Leadership'],
    joined_at: '2023-01-15'
  },
  {
    id: '2',
    email: 'sarah@ictclub.com',
    full_name: 'Sarah Chen',
    role: UserRole.BOARD,
    avatar_url: 'https://picsum.photos/seed/sarah/200',
    bio: 'UI/UX Enthusiast. Managing club events and visual identity.',
    skills: ['Figma', 'React Native', 'Branding'],
    joined_at: '2023-02-10'
  },
  {
    id: '3',
    email: 'member@ictclub.com',
    full_name: 'Jordan Smith',
    role: UserRole.MEMBER,
    avatar_url: 'https://picsum.photos/seed/jordan/200',
    bio: 'Freshman looking to learn web development.',
    skills: ['HTML', 'CSS', 'Python'],
    joined_at: '2024-09-01'
  }
];

export const MOCK_EVENTS: ClubEvent[] = [
  {
    id: 'e1',
    title: 'Modern Web Workshop',
    description: 'Learn Next.js 15 and Server Components in this hands-on session.',
    date: '2024-11-20T14:00:00',
    location: 'Lab 4B / Zoom',
    image_url: 'https://picsum.photos/seed/web/800/400',
    created_by: '1',
    attendee_count: 45,
    max_attendees: 60
  },
  {
    id: 'e2',
    title: 'Hackathon 2024 Prep',
    description: 'Team formation and brainstorming session for the upcoming regional hackathon.',
    date: '2024-12-05T10:00:00',
    location: 'Student Center Lounge',
    image_url: 'https://picsum.photos/seed/hack/800/400',
    created_by: '2',
    attendee_count: 12,
    max_attendees: 100
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Club Management Platform',
    description: 'An open-source portal for clubs to manage members, events, and resources.',
    tech_stack: ['TypeScript', 'React', 'Supabase'],
    status: 'active',
    lead_id: '1',
    created_at: '2024-03-01',
    members: ['1', '2', '3']
  },
  {
    id: 'p2',
    title: 'Campus Food App',
    description: 'Real-time queue tracking for campus cafeterias.',
    tech_stack: ['React Native', 'Firebase'],
    status: 'on-hold',
    lead_id: '2',
    created_at: '2024-05-15',
    members: ['2']
  }
];

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'r1',
    title: 'Introduction to Git',
    description: 'A comprehensive guide for beginners to start with version control.',
    category: 'Workshops',
    file_url: 'https://www.example.com/git-guide.pdf',
    file_type: 'pdf',
    uploaded_by: '1',
    created_at: '2024-01-20'
  },
  {
    id: 'r2',
    title: 'React Performance Tips',
    description: 'Masterclass video on optimizing React applications.',
    category: 'Development',
    file_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    file_type: 'video',
    uploaded_by: '2',
    created_at: '2024-06-12'
  }
];
