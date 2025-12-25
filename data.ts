import { Project, ArchiveItem } from './types';

export const DEFAULT_PROJECTS: Project[] = [
    {
        id: 1,
        title: "Urban Solitude",
        description: "Exploring the silence within the chaos of metropolitan life.",
        content: "Urban Solitude is a photographic series that investigates the paradoxical relationship between high-density living and individual isolation. Shot over six months in Tokyo and Seoul, the project utilizes high-contrast monochrome processing to strip away the distraction of color, focusing purely on form, light, and the human figure as a solitary element in a geometric landscape.\n\nThe series was exhibited at the Kyotographie International Photography Festival and featured in several minimalist design publications.",
        tech: ["Photography", "Digital Processing", "Lightroom"],
        link: "#",
        image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1974&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1444723121867-26bbe3907fa6?q=80&w=2072&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=1974&auto=format&fit=crop"
        ],
        year: "2023",
        role: "Photographer / Art Director",
        client: "Personal Project",
        featured: true
    },
    {
        id: 2,
        title: "Abstract Form",
        description: "Geometry and fluid dynamics via custom GLSL shaders.",
        content: "This project explores the intersection of mathematics and visual art using WebGL. By writing custom GLSL shaders, we created a real-time rendering engine that simulates fluid dynamics within rigid geometric constraints. The result is a mesmerizing, interactive visualizer that reacts to user input and audio frequencies.\n\nDeveloped using Three.js and React Three Fiber, keeping performance at 60fps even on mobile devices.",
        tech: ["WebGL", "Three.js", "GLSL", "React"],
        link: "#",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1614730341194-75c607400070?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop"
        ],
        year: "2024",
        role: "Creative Developer",
        client: "Studio Experiment",
        featured: true
    },
    {
        id: 3,
        title: "Neon Genesis",
        description: "Cyberpunk aesthetic study for e-commerce.",
        content: "A UI/UX case study reimagining the e-commerce experience for a streetwear brand heavily influenced by cyberpunk culture. The interface eschews traditional white-space minimalism for a dense, information-rich layout inspired by HUD displays.\n\nKey features include holographic hover effects, glitched text transitions, and a navigation system that mimics terminal commands.",
        tech: ["UI/UX", "React", "Framer Motion"],
        link: "#",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1535378437321-6a8fd74f9c07?q=80&w=1974&auto=format&fit=crop"
        ],
        year: "2022",
        role: "Lead Designer",
        client: "TechWear Co.",
        featured: true
    },
    {
        id: 4,
        title: "Echo AI Interface",
        description: "Voice-driven interaction patterns for AI.",
        content: "Echo is a concept for a headless, voice-first operating system. The visual interface is minimal, only appearing when necessary to supplement the audio feedback. The challenge was to design a visual language that felt 'alive' without being anthropomorphic.\n\nBuilt as a prototype using the Gemini API for natural language processing and Nuxt for the frontend.",
        tech: ["Gemini API", "Nuxt", "Web Speech API"],
        link: "#",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop",
        gallery: [],
        year: "2025",
        role: "Frontend Engineer",
        client: "Research",
    },
    {
        id: 5,
        title: "Mono Dashboard",
        description: "Minimalist analytics platform.",
        content: "A dashboard designed for data scientists who need clarity above all else. 'Mono' restricts the color palette to grayscale, using only a single highlight color to denote critical alerts. This reduction in visual noise helps reduce cognitive load during long sessions of data analysis.\n\nImplemented with Next.js and D3.js for high-performance data visualization.",
        tech: ["Next.js", "D3.js", "Tailwind"],
        link: "#",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
        ],
        year: "2023",
        role: "Product Designer",
        client: "FinTech Inc",
    }
];

export const DEFAULT_ARCHIVE: ArchiveItem[] = [
    { 
        id: 1, 
        year: "2025", 
        date: "Jan - Present",
        role: "Graphic Designer", 
        company: "AidaCreative", 
        type: "Freelance",
        location: "Surabaya, Jawa Timur, Indonesia",
        details: [
            "Make logo and brand guideline",
            "Responsible for creating social media designs according to the brief given"
        ],
        skills: "Design, Graphic Design, Layout Design, Logo Design"
    },
    { 
        id: 2, 
        year: "2025", 
        date: "Jan - Present",
        role: "Creative Director", 
        company: "HIMADEGA UNESA", 
        type: "Part Time",
        location: "Surabaya, Jawa Timur, Indonesia",
        details: [
            "Become team leader and creative director.",
            "Directing and leading team members to achieve goals in the entrepreneurship department.",
            "Participated in the executor to combine 3 illustrators into 1 consistent style.",
            "Assist in content guidance from social media content plan to execution design.",
            "Guiding and building a tracker work system through the notion platform for all members.",
            "Establish Standard Operating Procedures (SOP).",
            "Increased turnover by 80% from previous release."
        ],
        skills: "Team Leadership, Leadership, Team Building, Motion Graphics"
    },
    { 
        id: 3, 
        year: "2025", 
        date: "Jul - Dec",
        role: "Graphic Design Internship", 
        company: "Akai Idea Factory", 
        type: "Internship",
        location: "Surabaya, Jawa Timur, Indonesia",
        details: [
            "Yasma Natura Maklon project participation",
            "Reny Swalayanku project participation"
        ],
        skills: "Graphic Design, Artificial Intelligence (AI), Layout, Copywriting"
    },
    { 
        id: 4, 
        year: "2025", 
        date: "May 2025",
        role: "Freelance Graphic Designer", 
        company: "Searah Creative Agency", 
        type: "Freelance",
        location: "Surabaya, Jawa Timur, Indonesia",
        details: [
            "Make Presentation Deck"
        ],
        skills: "Canva, Figma, Layout Design"
    },
    { 
        id: 5, 
        year: "2024", 
        date: "Feb 2024 - Sep 2025",
        role: "Graphic Designer", 
        company: "Ares Laboratory", 
        type: "Freelance",
        location: "Surabaya, Jawa Timur, Indonesia",
        details: [
            "Creating Instagram content (feeds and stories).",
            "Create a logo for a client's business.",
            "Editing simple video for skincare brand.",
            "Become a model photographer with a skincare brand."
        ],
        skills: "Desain Grafis, Adobe Photoshop, Video Editing, Product Photography"
    },
    { 
        id: 6, 
        year: "2024", 
        date: "Sep - Present",
        role: "Graphic Designer", 
        company: "Kawan Ayu", 
        type: "Freelance",
        location: "Surabaya, Jawa Timur, Indonesia",
        details: [
            "Make a feed and story for @kawanayu.id"
        ],
        skills: "Adobe Illustrator, Adobe Photoshop, Computer Graphics"
    },
    { 
        id: 7, 
        year: "2024", 
        date: "Jul 2024 - Feb 2025",
        role: "Graphic Designer", 
        company: "Arti Karya Studio", 
        type: "Contract",
        location: "Surabaya, Jawa Timur, Indonesia",
        details: [],
        skills: "Adobe Illustrator, Adobe Photoshop, Figma, Graphic Design"
    },
    { 
        id: 8, 
        year: "2024", 
        date: "Sep - Dec",
        role: "Desainer Grafis", 
        company: "Sambut Pilada", 
        type: "Freelance",
        details: ["Make feed and story for @sambutpilkada"],
        skills: "Design, Desain Grafis, Graphic Design, Figma"
    },
    { 
        id: 9, 
        year: "2024", 
        date: "Jul - Sep",
        role: "Graphic Designer", 
        company: "Platform Progreskita", 
        type: "Internship",
        location: "Indonesia",
        details: [
            "Become the team leader of the Graphic Design division",
            "Create Instagram feeds and stories",
            "Collaborate with the copywriting team",
            "Coordinate design division team members"
        ],
        skills: "Team Leadership, Graphic Design, Layout Design"
    },
    { 
        id: 10, 
        year: "2024", 
        date: "Jun - Sep",
        role: "Graphic Designer", 
        company: "HIPMI PT ITS", 
        type: "Freelance",
        location: "Surabaya, Jawa Timur, Indonesia",
        details: [
            "Visualization of brief content into infographic designs",
            "Collaboration with copywriters"
        ]
    },
    { 
        id: 11, 
        year: "2024", 
        date: "Jun - Sep",
        role: "Graphic Designer", 
        company: "IKA ITS", 
        type: "Freelance",
        details: [
             "Visualization of brief content into infographic designs",
             "Collaboration with copywriters"
        ]
    },
    { 
        id: 12, 
        year: "2024", 
        date: "Jul - Aug",
        role: "Magazine Editor", 
        company: "Ilustrasee", 
        type: "Internship",
        details: [
            "Create magazine publication design layouts",
            "Collaborate with the content writing team"
        ],
        skills: "Layout Design, Adobe Illustrator, Graphic Design"
    },
    { 
        id: 13, 
        year: "2023", 
        date: "Feb 2023 - Mar 2024",
        role: "Graphic Designer", 
        company: "AIDACREATIVES", 
        type: "Part Time",
        location: "Surabaya, Jawa Timur",
        details: [
            "Creating Instagram content (feeds and stories).",
            "Collaborate in teams using notion software.",
            "Combines various software in meeting design needs like canva and adobe products."
        ],
        skills: "Adobe Photoshop, Layout, Canva, Product Photography"
    },
    { 
        id: 14, 
        year: "2023", 
        date: "Dec 2022 - Dec 2023",
        role: "Graphic Designer", 
        company: "PT. Mitra Mapan Mulia", 
        type: "Freelance",
        details: [
            "Visualizing Instagram feed designs",
            "Presenting t-shirt designs, banners and more"
        ],
        skills: "Adobe Photoshop, Layout, Canva, Adobe Illustrator"
    },
    { 
        id: 15, 
        year: "2023", 
        date: "Feb - May",
        role: "Volunteer Graphic Designer", 
        company: "SMKN 12 Surabaya", 
        type: "Volunteer",
        details: [
            "Responsible for creating feed + story content and templates for Instagram",
            "Make a lanyard necklace design that sold out a total of 130 lanyards"
        ],
        skills: "Adobe Photoshop, Layout, Computer Graphics, Logo Design"
    },
    { 
        id: 16, 
        year: "2022", 
        date: "Jan - Jul",
        role: "Production Staff", 
        company: "Silverbox Concept", 
        type: "Internship",
        location: "Surabaya, Jawa Timur",
        details: [
            "Helping the production process of custom boxes such as cutting cartons, installing fabrics, making box frames to delivering goods."
        ]
    }
];

export const DEFAULT_BIO = `Hi, I'm Dzuhan. Based in East Java, I am a Graphic Designer who loves mixing traditional design principles with modern tech. Over the past two years, I’ve worked with various brands to sharpen their visual identity, from social media marketing at Aida Creatives to product photography and layout design.

My approach is highly systematic. I don’t just design; I organize. When leading a creative team for an organization project, I proved this by building SOPs and Notion systems that tripled our department's revenue. I bring this same level of structured thinking to every project I touch.

Right now, I’m exploring the future of design by developing web tools for creatives using AI Studio.`;