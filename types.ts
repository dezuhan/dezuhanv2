export interface Project {
    id: number;
    title: string;
    description: string; // Short description for card
    content?: string; // Long description for detail page
    tech: string[];
    link: string;
    image: string; // Cover image
    gallery?: string[]; // Additional images
    year?: string;
    role?: string;
    client?: string;
    featured?: boolean;
}

export interface ArchiveItem {
    id: number;
    year: string;        // e.g. "2025"
    date: string;        // e.g. "Jan - Present"
    role: string;
    company: string;
    type: string;        // Employment type (Freelance, Full-time, etc)
    location?: string;   // e.g. "Surabaya, Indonesia"
    details?: string[];  // Bullet points of work
    skills?: string;     // e.g. "Adobe Illustrator, Photoshop"
}

export interface SocialLink {
    platform: string;
    url: string;
}

export interface ProfileData {
    bio: string;
    email: string;
    phone: string;
    socials: SocialLink[];
}

export enum Section {
    HOME = 'home',
    WORK = 'work',
    ARCHIVE = 'archive',
    ABOUT = 'about',
    CONTACT = 'contact'
}