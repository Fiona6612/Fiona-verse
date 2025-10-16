export type Tab = 'home' | 'about' | 'achievements' | 'projects' | 'gallery' | 'blog';

export interface Achievement {
  id: string;
  image: string;
  caption: string;
}

export interface Project {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  tags: string[];
}

export interface GalleryItem {
  id: string;
  image: string;
  caption: string;
  frame: 'square' | 'circle' | 'polaroid';
}

export interface FamilyMember {
    id: 'paternal_grandmother' | 'paternal_grandfather' | 'father' | 'mother' | 'uncle' | 'aunt' | 'me' | 'brother1' | 'brother2' | 'sister' | 'sister2' | 'sister3';
    name: string;
    image: string | null;
}

export interface BlogPost {
    id: string;
    timestamp: number;
    title: string;
    content: string;
    imageUrl?: string;
}
