import { Project } from '../types';

export const DEFAULT_PROJECTS: Project[] = [
    {
        "id": 10,
        "title": "New Project",
        "description": "",
        "content": "",
        "tech": [],
        "link": "",
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
        "year": "2025",
        "role": "Designer",
        "client": "Client Name"
    },
    {
        "id": 9,
        "title": "New Project",
        "description": "",
        "content": "",
        "tech": [],
        "link": "",
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
        "year": "2025",
        "role": "Designer",
        "client": "Client Name"
    },
    {
        "id": 8,
        "title": "New Project",
        "description": "",
        "content": "",
        "tech": [],
        "link": "",
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
        "year": "2025",
        "role": "Designer",
        "client": "Client Name"
    },
    {
        "id": 7,
        "title": "New Project",
        "description": "",
        "content": "",
        "tech": [],
        "link": "",
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
        "year": "2025",
        "role": "Designer",
        "client": "Client Name"
    },
    {
        "id": 6,
        "title": "New Project",
        "description": "",
        "content": "",
        "tech": [],
        "link": "",
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
        "year": "2025",
        "role": "Designer",
        "client": "Client Name"
    },
    {
        "id": 1,
        "title": "Coba COmmit",
        "description": "Exploring the silence within the chaos of metropolitan life.",
        "content": "Urban Solitude is a photographic series that investigates the paradoxical relationship between high-density living and individual isolation. Shot over six months in Tokyo and Seoul, the project utilizes high-contrast monochrome processing to strip away the distraction of color, focusing purely on form, light, and the human figure as a solitary element in a geometric landscape.\n\nThe series was exhibited at the Kyotographie International Photography Festival and featured in several minimalist design publications.",
        "tech": [
            "Photography",
            "Digital Processing",
            "Lightroom"
        ],
        "link": "#",
        "image": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1974&auto=format&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1444723121867-26bbe3907fa6?q=80&w=2072&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=1974&auto=format&fit=crop"
        ],
        "year": "2023",
        "role": "Photographer / Art Director",
        "client": "Personal Project",
        "featured": true
    },
    {
        "id": 2,
        "title": "Abstract Form",
        "description": "Geometry and fluid dynamics via custom GLSL shaders.",
        "content": "This project explores the intersection of mathematics and visual art using WebGL. By writing custom GLSL shaders, we created a real-time rendering engine that simulates fluid dynamics within rigid geometric constraints. The result is a mesmerizing, interactive visualizer that reacts to user input and audio frequencies.\n\nDeveloped using Three.js and React Three Fiber, keeping performance at 60fps even on mobile devices.",
        "tech": [
            "WebGL",
            "Three.js",
            "GLSL",
            "React"
        ],
        "link": "#",
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1614730341194-75c607400070?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop"
        ],
        "year": "2024",
        "role": "Creative Developer",
        "client": "Studio Experiment",
        "featured": true
    },
    {
        "id": 3,
        "title": "Neon Genesis",
        "description": "Cyberpunk aesthetic study for e-commerce.",
        "content": "A UI/UX case study reimagining the e-commerce experience for a streetwear brand heavily influenced by cyberpunk culture. The interface eschews traditional white-space minimalism for a dense, information-rich layout inspired by HUD displays.\n\nKey features include holographic hover effects, glitched text transitions, and a navigation system that mimics terminal commands.",
        "tech": [
            "UI/UX",
            "React",
            "Framer Motion"
        ],
        "link": "#",
        "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1535378437321-6a8fd74f9c07?q=80&w=1974&auto=format&fit=crop"
        ],
        "year": "2022",
        "role": "Lead Designer",
        "client": "TechWear Co.",
        "featured": true
    },
    {
        "id": 4,
        "title": "Echo AI Interface",
        "description": "Voice-driven interaction patterns for AI.",
        "content": "Echo is a concept for a headless, voice-first operating system. The visual interface is minimal, only appearing when necessary to supplement the audio feedback. The challenge was to design a visual language that felt 'alive' without being anthropomorphic.\n\nBuilt as a prototype using the Gemini API for natural language processing and Nuxt for the frontend.",
        "tech": [
            "Gemini API",
            "Nuxt",
            "Web Speech API"
        ],
        "link": "#",
        "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop",
        "gallery": [],
        "year": "2025",
        "role": "Frontend Engineer",
        "client": "Research"
    },
    {
        "id": 5,
        "title": "Mono Dashboard",
        "description": "Minimalist analytics platform.",
        "content": "A dashboard designed for data scientists who need clarity above all else. 'Mono' restricts the color palette to grayscale, using only a single highlight color to denote critical alerts. This reduction in visual noise helps reduce cognitive load during long sessions of data analysis.\n\nImplemented with Next.js and D3.js for high-performance data visualization.",
        "tech": [
            "Next.js",
            "D3.js",
            "Tailwind"
        ],
        "link": "#",
        "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
        ],
        "year": "2023",
        "role": "Product Designer",
        "client": "FinTech Inc"
    }
];