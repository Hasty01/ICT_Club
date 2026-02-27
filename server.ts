import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import bodyParser from "body-parser";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // In-memory data for demo purposes (real backend would use a database)
  let users = [
    {
      id: '1',
      email: 'admin@ictclub.com',
      username: 'alex_rivera',
      full_name: 'Alex Rivera',
      role: 'admin',
      avatar_url: 'https://picsum.photos/seed/admin/200',
      bio: 'Club President and Full-Stack Engineer. Passionate about community and building cool things.',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Leadership'],
      joined_at: '2023-01-15',
      rating: 5
    },
    {
      id: '2',
      email: 'sarah@ictclub.com',
      username: 'sarah_chen',
      full_name: 'Sarah Chen',
      role: 'board',
      avatar_url: 'https://picsum.photos/seed/sarah/200',
      bio: 'UI/UX Enthusiast. Managing club events and visual identity.',
      skills: ['Figma', 'React Native', 'Branding'],
      joined_at: '2023-02-10',
      rating: 4.5
    },
    {
      id: '3',
      email: 'member@ictclub.com',
      username: 'jordan_smith',
      full_name: 'Jordan Smith',
      role: 'member',
      avatar_url: 'https://picsum.photos/seed/jordan/200',
      bio: 'Freshman looking to learn web development.',
      skills: ['HTML', 'CSS', 'Python'],
      joined_at: '2024-09-01',
      rating: 3.8
    }
  ];

  let events = [
    {
      id: 'e1',
      title: 'Modern Web Workshop',
      description: 'Learn Next.js 15 and Server Components in this hands-on session.',
      date: '2024-11-20T14:00:00',
      location: 'Lab 4B / Zoom',
      image_url: 'https://picsum.photos/seed/web/800/400',
      created_by: '1',
      attendee_count: 45,
      max_attendees: 60,
      attendees: ['1', '2']
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
      max_attendees: 100,
      attendees: ['2']
    },
    {
      id: 'e3',
      title: 'AI Ethics Symposium',
      description: 'A deep dive into the ethical implications of large language models.',
      date: '2024-11-24T14:00:00',
      location: 'Node 2C',
      image_url: 'https://picsum.photos/seed/ai1/800/400',
      created_by: '1',
      attendee_count: 30,
      max_attendees: 50,
      attendees: []
    }
  ];

  let projects = [
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
    },
    {
      id: 'p3',
      title: 'Autonomous Drone Swarm',
      description: 'Collaborative effort in developing localized swarm intelligence for monitoring.',
      tech_stack: ['Python', 'ROS', 'C++'],
      status: 'active',
      lead_id: '1',
      created_at: '2024-08-10',
      members: ['1']
    }
  ];

  let challenges = [
    {
      id: 'c1',
      title: 'Binary Search Master',
      description: 'Implement an optimized binary search algorithm that handles duplicates.',
      difficulty: 'medium',
      points: 50,
      deadline: '2024-12-01',
      created_at: '2024-11-01',
      created_by: '1',
      participants: ['1']
    },
    {
      id: 'c2',
      title: 'CSS Art Challenge',
      description: 'Create a realistic looking robot using only CSS shapes and gradients.',
      difficulty: 'hard',
      points: 100,
      deadline: '2024-12-15',
      created_at: '2024-11-10',
      created_by: '2',
      participants: []
    }
  ];

  let resources = [
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
    },
    {
      id: 'r3',
      title: 'Kubernetes Orchestration 101',
      description: 'Master the art of containerization and cluster management for high availability systems.',
      category: 'Development',
      file_url: 'https://kubernetes.io/docs/home/',
      file_type: 'link',
      uploaded_by: '1',
      created_at: '2024-09-05'
    }
  ];

  // API Routes
  app.get("/api/users", (req, res) => res.json(users));
  app.put("/api/users/:id", (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...req.body };
      res.json(users[index]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
  app.delete("/api/users/:id", (req, res) => {
    users = users.filter(u => u.id !== req.params.id);
    res.json({ success: true });
  });
  app.post("/api/users/:id/rate", (req, res) => {
    const { rating } = req.body;
    const user = users.find(u => u.id === req.params.id);
    if (user) {
      user.rating = rating;
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/api/events", (req, res) => res.json(events));
  app.post("/api/events", (req, res) => {
    const newEvent = { id: `e${Date.now()}`, attendees: [], attendee_count: 0, ...req.body };
    events.push(newEvent);
    res.json(newEvent);
  });
  app.post("/api/events/:id/register", (req, res) => {
    const { userId } = req.body;
    const event = events.find(e => e.id === req.params.id);
    if (event) {
      if (!event.attendees) event.attendees = [];
      if (!event.attendees.includes(userId)) {
        event.attendees.push(userId);
        event.attendee_count = (event.attendee_count || 0) + 1;
      }
      res.json(event);
    } else {
      res.status(404).json({ error: "Event not found" });
    }
  });

  app.get("/api/projects", (req, res) => res.json(projects));
  app.post("/api/projects", (req, res) => {
    const newProject = { id: `p${Date.now()}`, members: [req.body.lead_id], ...req.body };
    projects.push(newProject);
    res.json(newProject);
  });
  app.post("/api/projects/:id/join", (req, res) => {
    const { userId } = req.body;
    const project = projects.find(p => p.id === req.params.id);
    if (project) {
      if (!project.members.includes(userId)) {
        project.members.push(userId);
      }
      res.json(project);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  });

  app.get("/api/challenges", (req, res) => res.json(challenges));
  app.post("/api/challenges", (req, res) => {
    const newChallenge = { id: `c${Date.now()}`, participants: [], ...req.body };
    challenges.push(newChallenge);
    res.json(newChallenge);
  });
  app.post("/api/challenges/:id/accept", (req, res) => {
    const { userId } = req.body;
    const challenge = challenges.find(c => c.id === req.params.id);
    if (challenge) {
      if (!challenge.participants) challenge.participants = [];
      if (!challenge.participants.includes(userId)) {
        challenge.participants.push(userId);
      }
      res.json(challenge);
    } else {
      res.status(404).json({ error: "Challenge not found" });
    }
  });

  app.get("/api/resources", (req, res) => res.json(resources));
  app.post("/api/resources", (req, res) => {
    const newResource = { id: `r${Date.now()}`, ...req.body };
    resources.push(newResource);
    res.json(newResource);
  });
  app.delete("/api/resources/:id", (req, res) => {
    resources = resources.filter(r => r.id !== req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
