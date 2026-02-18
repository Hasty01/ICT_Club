
export enum UserRole {
  ADMIN = 'admin',
  BOARD = 'board',
  MEMBER = 'member'
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  skills: string[];
  joined_at: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url?: string;
  created_by: string;
  attendee_count: number;
  max_attendees?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  status: 'active' | 'completed' | 'on-hold';
  lead_id: string;
  created_at: string;
  members: string[]; // User IDs
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  file_type: 'pdf' | 'video' | 'link';
  uploaded_by: string;
  created_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
}
