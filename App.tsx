import React, { useState, useEffect, useRef } from 'react';
import { Project, ArchiveItem } from './types';
import { DEFAULT_PROJECTS, DEFAULT_BIO, DEFAULT_ARCHIVE } from './database';
import { ProjectDetail } from './components/ProjectDetail';
import { Moon, Sun, X, Menu, Pen, RotateCcw, Check, Circle } from 'lucide-react';

// --- Components ---

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <span className="font-mono text-xs tracking-wider opacity-60">
            {time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
    );
};

// Reusable Footer Component
const Footer: React.FC<{ className?: string }> = ({ className = '' }) => (
    <footer className={`p-6 md:p-8 flex justify-between items-end text-[10px] md:text-xs font-mono uppercase tracking-widest z-40 ${className}`}>
        <div>
            <p className="opacity-50">© 2025 Dezuhan</p>
            <p>Dezuhan</p>
        </div>
        
        <div className="text-right flex items-start gap-8 md:gap-12">
            <div className="flex flex-col gap-1">
                <a href="https://instagram.com/dezuhan" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 opacity-50 transition-opacity">Instagram</a>
                <a href="https://linkedin.com/in/dzuhan" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 opacity-50 transition-opacity">LinkedIn</a>
                <a href="https://behance.net/dezuhan" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 opacity-50 transition-opacity">Behance</a>
                <a href="https://github.com/dezuhan" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 opacity-50 transition-opacity">GitHub</a>
            </div>
            <div className="flex flex-col gap-1 text-right">
                <a href="mailto:dezuhan.contact@gmail.com" className="hover:opacity-100 opacity-50 transition-opacity">dezuhan.contact@gmail.com</a>
                <p className="opacity-50">(+62) 851 5621 6653</p>
            </div>
        </div>
    </footer>
);

// --- Main App ---

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [activeIndex, setActiveIndex] = useState(0); 
    const [view, setView] = useState<'home' | 'work' | 'archive' | 'about' | 'detail'>('home');
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Archive Expansion State
    const [expandedArchiveId, setExpandedArchiveId] = useState<number | null>(null);

    // Content State (CMS Mode)
    const [isStudioMode, setIsStudioMode] = useState(false);
    const [projects, setProjects] = useState<Project[]>(() => {
        const saved = localStorage.getItem('dezuhan_projects');
        return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
    });
    const [bio, setBio] = useState<string>(() => {
        const saved = localStorage.getItem('dezuhan_bio');
        return saved ? saved : DEFAULT_BIO;
    });
    // Archive data is generally static for this demo, but could be stateful if we wanted to edit it
    const archive = DEFAULT_ARCHIVE;

    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef(0);

    // Drag state
    const isDragging = useRef(false);
    const startX = useRef(0);
    const [cursorStyle, setCursorStyle] = useState('cursor-default');

    // Initialize Theme
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem('dezuhan_projects', JSON.stringify(projects));
        localStorage.setItem('dezuhan_bio', bio);
    }, [projects, bio]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const updateProject = (id: number, field: keyof Project, value: any) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const resetContent = () => {
        if (window.confirm("Are you sure you want to reset all content to default?")) {
            setProjects(DEFAULT_PROJECTS);
            setBio(DEFAULT_BIO);
        }
    };

    const handleProjectClick = (projectId: number) => {
        if (!isDragging.current) {
            setSelectedProjectId(projectId);
            setView('detail');
        }
    };

    // Handle Wheel Scroll for Carousel (Only on Home)
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (view !== 'home') return;
            
            const now = Date.now();
            // Throttle scroll events to prevent rapid spinning
            if (now - lastScrollTime.current < 400) return;

            // Threshold to ignore minor touchpad movements
            if (Math.abs(e.deltaY) > 30 || Math.abs(e.deltaX) > 30) {
                 const direction = e.deltaY > 0 || e.deltaX > 0 ? 1 : -1;
                 setActiveIndex(prev => prev + direction);
                 lastScrollTime.current = now;
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [view]);

    // Handle Keyboard
    useEffect(() => {
         const handleKey = (e: KeyboardEvent) => {
             // Don't intercept arrow keys if editing
             if (isStudioMode && (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA')) return;
             if (view !== 'home') return; // Only scroll carousel on home
             if (e.key === 'ArrowRight') setActiveIndex(prev => prev + 1);
             if (e.key === 'ArrowLeft') setActiveIndex(prev => prev - 1);
         };
         window.addEventListener('keydown', handleKey);
         return () => window.removeEventListener('keydown', handleKey);
    }, [view, isStudioMode]);

    // Handle Drag/Swipe (Only on Home)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (view !== 'home') return;
        // Allow text selection in Studio Mode
        if (isStudioMode && (e.target as HTMLElement).closest('input, textarea')) return;
        
        isDragging.current = true;
        startX.current = e.clientX;
        setCursorStyle('cursor-grabbing');
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || view !== 'home') return;
        
        const currentX = e.clientX;
        const diff = startX.current - currentX; // Drag left (positive diff) means going to next (right) item
        
        // Increased threshold to make drag less sensitive (slower feel)
        const dragThreshold = 150; 

        if (Math.abs(diff) > dragThreshold) {
             const direction = diff > 0 ? 1 : -1;
             setActiveIndex(prev => prev + direction);
             startX.current = currentX; 
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (view !== 'home') return;
        
        const diff = Math.abs(startX.current - e.clientX);
        if (diff < 10) {
             isDragging.current = false;
        } else {
             setTimeout(() => { isDragging.current = false; }, 50);
        }
        setCursorStyle(view === 'home' ? 'cursor-grab' : 'cursor-default');
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
        if(view === 'home') setCursorStyle('cursor-grab');
    };

    // --- Carousel Render Logic ---
    const len = projects.length;
    const renderWindow = [-2, -1, 0, 1, 2];

    const renderCarousel = () => (
        <div className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center scene" ref={containerRef}>
            {renderWindow.map((offset) => {
                const virtualIndex = activeIndex + offset;
                const dataIndex = ((virtualIndex % len) + len) % len;
                const project = projects[dataIndex];
                
                // Adjusted spacing for "far apart" look based on screenshot
                const translateX = offset * 160; 
                const translateZ = Math.abs(offset) * -300; 
                const rotateY = offset * -15; // Flatter rotation
                const opacity = Math.max(0.2, 1 - Math.abs(offset) * 0.4);
                const zIndex = 100 - Math.abs(offset);
                const isActive = offset === 0;

                return (
                    <div 
                        key={virtualIndex}
                        onClick={() => isActive && handleProjectClick(project.id)}
                        // Significantly increased widths for a larger card appearance
                        className="absolute w-[85vw] md:w-[70vw] lg:w-[55vw] transition-all duration-700 ease-out flex flex-col gap-4 cursor-pointer"
                        style={{
                            transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                            zIndex: zIndex,
                            opacity: opacity,
                        }}
                    >
                        <div className="w-full aspect-[5/3] relative group overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-900 select-none">
                            <img 
                                src={project.image} 
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                draggable="false"
                            />
                            <div className={`absolute inset-0 bg-background/50 dark:bg-black/50 transition-opacity duration-500 ${isActive ? 'opacity-0' : 'opacity-100'}`} />
                            {isActive && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <div className="bg-black text-white border border-white/20 dark:bg-white dark:text-black dark:border-black/20 px-6 py-2 rounded-full uppercase text-xs font-bold tracking-widest backdrop-blur-md transition-colors">
                                        View Project
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`transition-opacity duration-500 ${isActive ? 'opacity-100 delay-200' : 'opacity-0'} flex flex-col gap-2`}>
                            {isStudioMode && isActive ? (
                                <div onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="text"
                                        value={project.title}
                                        onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                                        className="bg-transparent border-b border-current/20 focus:border-red-500 focus:outline-none text-xl md:text-2xl font-bold tracking-tight w-full"
                                        placeholder="Project Title"
                                    />
                                    <input 
                                        type="text"
                                        value={project.tech.join(" / ")}
                                        onChange={(e) => updateProject(project.id, 'tech', e.target.value.split(" / "))}
                                        className="bg-transparent border-b border-current/20 focus:border-red-500 focus:outline-none text-sm text-gray-500 dark:text-gray-400 w-full"
                                        placeholder="Tech 1 / Tech 2"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight select-none">{project.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 select-none">{project.tech.join(" / ")}</p>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // --- Grid Render Logic (Work Page) ---
    const renderGrid = () => (
        <div className="w-full animate-fade-in flex flex-col min-h-screen">
             <div className="flex-1 w-full px-6 md:px-12 pt-32 pb-32">
                <div className="mb-24 border-b border-current border-opacity-10 pb-6">
                    <h2 className="text-5xl md:text-6xl font-bold tracking-tight">Selected Work</h2>
                    <p className="text-sm opacity-50 mt-4 font-mono">2022 — Present</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
                    {projects.map((project, idx) => (
                        <div 
                            key={project.id} 
                            className="group cursor-pointer flex flex-col gap-6"
                            onClick={() => handleProjectClick(project.id)}
                        >
                            <div className="w-full aspect-[5/3] bg-gray-100 dark:bg-gray-900 overflow-hidden relative shadow-sm">
                                <img 
                                    src={project.image} 
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>
                            
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight group-hover:opacity-70 transition-opacity">{project.title}</h3>
                                    <p className="text-base opacity-50 mt-2 font-mono uppercase tracking-widest text-xs">{project.tech[0]} / {project.year || '2024'}</p>
                                </div>
                                {project.link && <div className="opacity-0 group-hover:opacity-100 transition-opacity -rotate-45 text-2xl">→</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Work Page Footer */}
            <Footer className="border-t border-current/10" />
        </div>
    );

    // --- Archive Render Logic ---
    const renderArchive = () => (
        <div className="w-full animate-fade-in flex flex-col min-h-screen">
             <div className="flex-1 w-full px-6 md:px-12 pt-32 pb-32">
                <div className="w-full mx-auto">
                    <div className="mb-24">
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight">Archive</h2>
                        <p className="text-sm opacity-50 mt-4 font-mono">All experience & roles since 2022</p>
                    </div>

                    <div className="w-full">
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-current border-opacity-20 text-[10px] uppercase font-mono tracking-widest opacity-50 sticky top-24 bg-background dark:bg-black z-10">
                            <div className="col-span-2">Date</div>
                            <div className="col-span-6">Role / Company</div>
                            <div className="col-span-4 text-right">Location / Type</div>
                        </div>

                        {/* Table Body */}
                        <div className="flex flex-col">
                            {archive.map((item) => {
                                const isExpanded = expandedArchiveId === item.id;
                                return (
                                    <div 
                                        key={item.id}
                                        className={`group flex flex-col border-b border-current border-opacity-10 transition-all duration-500 ${isExpanded ? 'bg-black/5 dark:bg-white/5 pb-6 rounded-lg my-2 border-transparent' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                    >
                                        <div 
                                            className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-6 px-2 md:px-0 cursor-pointer"
                                            onClick={() => setExpandedArchiveId(isExpanded ? null : item.id)}
                                        >
                                            <div className="col-span-12 md:col-span-2 text-sm md:text-base font-mono opacity-70">
                                                <span className="block md:hidden text-[10px] uppercase opacity-50 mb-1">Date</span>
                                                {item.date} <span className="opacity-40 text-xs ml-2">({item.year})</span>
                                            </div>
                                            <div className="col-span-12 md:col-span-6">
                                                <div className="text-lg md:text-xl font-bold tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                                                    {item.role}
                                                </div>
                                                <div className="text-sm opacity-60 mt-1">
                                                    {item.company}
                                                </div>
                                            </div>
                                            <div className="col-span-12 md:col-span-4 md:text-right flex flex-col md:items-end justify-start mt-4 md:mt-0">
                                                <span className="text-xs font-mono uppercase tracking-widest opacity-40 bg-black/5 dark:bg-white/10 px-2 py-1 rounded w-fit">
                                                    {item.type}
                                                </span>
                                                {item.location && <span className="text-xs opacity-40 mt-2">{item.location}</span>}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        <div 
                                            className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-2 md:px-0 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="hidden md:block col-span-2"></div>
                                            <div className="col-span-12 md:col-span-10 border-t border-current border-opacity-10 pt-4">
                                                {item.details && item.details.length > 0 && (
                                                    <ul className="space-y-2 mb-6">
                                                        {item.details.map((detail, idx) => (
                                                            <li key={idx} className="flex items-start gap-3 text-sm opacity-80 leading-relaxed">
                                                                <Check size={14} className="mt-1 shrink-0 opacity-50" />
                                                                <span>{detail}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                
                                                {item.skills && (
                                                    <div className="text-sm">
                                                        <span className="font-bold opacity-100 mr-2">Skills:</span>
                                                        <span className="opacity-60">{item.skills}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <Footer className="border-t border-current/10" />
        </div>
    );

    // --- About Render Logic ---
    const renderAbout = () => (
        <div className="w-full animate-fade-in flex flex-col min-h-screen">
            <div className="flex-1 w-full px-6 md:px-12 pt-32 pb-32">
                 <div className="max-w-7xl mx-auto">
                    <div className="mb-24">
                        {isStudioMode ? (
                            <div className="space-y-4">
                                <label className="text-xs font-mono uppercase opacity-50 block">Edit Bio</label>
                                <textarea 
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full h-[600px] text-4xl md:text-7xl font-medium tracking-tight leading-[1.1] bg-white/5 border border-current/20 rounded-lg p-6 focus:outline-none focus:ring-2 focus:ring-current/20 resize-none font-sans"
                                />
                            </div>
                        ) : (
                            <h2 className="text-4xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-8 whitespace-pre-line">
                                {bio}
                            </h2>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24 text-base pt-12 border-t border-current/10">
                        <div>
                            <h3 className="font-mono uppercase tracking-widest opacity-40 mb-6 text-sm">Contact</h3>
                            <ul className="space-y-4 opacity-80 text-lg">
                                <li><a href="mailto:dezuhan.contact@gmail.com" className="hover:underline">dezuhan.contact@gmail.com</a></li>
                                <li>(+62) 851 5621 6653</li>
                                <li>@dezuhan</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-mono uppercase tracking-widest opacity-40 mb-6 text-sm">Tools</h3>
                            <p className="opacity-80 leading-relaxed text-lg">
                                Adobe Illustrator, Adobe Photoshop, Affinity, Figma, Jitter, Davinci Resolve, Notion, Gemini / OpenAI
                            </p>
                        </div>
                         <div>
                            <img 
                                src="https://media.licdn.com/dms/image/v2/D5603AQFEDqzt2MjpEw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1693404642537?e=1768435200&v=beta&t=KKRjt-LtUMYsE5Pby2WMFY7SXf9xfgZxpxvyarQPRAA" 
                                alt="Dzuhan Profile" 
                                className="w-48 h-48 object-cover grayscale opacity-90 rounded-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* About Page Footer */}
            <Footer className="border-t border-current/10" />
        </div>
    );

    const handleMobileLink = (targetView: 'home' | 'work' | 'archive' | 'about') => {
        setView(targetView);
        setIsMenuOpen(false);
    };

    return (
        <div className={`min-h-screen flex flex-col relative transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-40 px-6 py-6 md:px-12 md:py-8 flex justify-between items-start pointer-events-none transition-opacity duration-300 ${view === 'detail' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex flex-col gap-1 z-50 pointer-events-auto">
                    <button 
                        onClick={() => setView('home')} 
                        className="text-sm font-bold tracking-widest uppercase text-left hover:opacity-70 transition-opacity"
                    >
                        Dezuhan
                    </button>
                    {isStudioMode && (
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold tracking-wider animate-pulse">STUDIO MODE</span>
                             <button onClick={resetContent} className="text-[10px] underline opacity-50 hover:opacity-100 flex items-center gap-1">
                                <RotateCcw size={10} /> Reset
                             </button>
                        </div>
                    )}
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-start gap-8 md:gap-12 z-50 pointer-events-auto">
                    <button 
                        onClick={() => setView('work')}
                        className={`text-xs font-bold tracking-widest uppercase hover:opacity-100 transition-opacity ${view === 'work' ? 'opacity-100' : 'opacity-40'}`}
                    >
                        Work
                    </button>
                    <button 
                        onClick={() => setView('archive')}
                        className={`text-xs font-bold tracking-widest uppercase hover:opacity-100 transition-opacity ${view === 'archive' ? 'opacity-100' : 'opacity-40'}`}
                    >
                        Archive
                    </button>
                    <button 
                        onClick={() => setView('about')}
                        className={`text-xs font-bold tracking-widest uppercase hover:opacity-100 transition-opacity ${view === 'about' ? 'opacity-100' : 'opacity-40'}`}
                    >
                        About
                    </button>
                    
                    <div className="flex items-center gap-6 pl-6 border-l border-current border-opacity-20">
                        <button 
                            onClick={() => setIsStudioMode(!isStudioMode)} 
                            className={`hover:opacity-100 transition-all ${isStudioMode ? 'text-red-500 opacity-100' : 'opacity-40'}`}
                            title="Toggle Studio Edit Mode"
                        >
                            <Pen size={14} />
                        </button>
                        <button onClick={toggleTheme} className="hover:opacity-70 transition-opacity">
                            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                        </button>
                        <Clock />
                    </div>
                </nav>

                {/* Mobile Menu Button */}
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="md:hidden z-50 pointer-events-auto p-1"
                >
                    <Menu size={24} />
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-[#f4f4f5] dark:bg-[#09090b] flex flex-col p-6 animate-fade-in">
                    <div className="flex justify-between items-start mb-12">
                        <div className="text-sm font-bold tracking-widest uppercase">
                            Dezuhan
                        </div>
                        <button onClick={() => setIsMenuOpen(false)} className="p-1">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-8 flex-1 justify-center">
                        <button 
                            onClick={() => handleMobileLink('home')}
                            className={`text-4xl font-bold tracking-tighter text-left uppercase ${view === 'home' ? 'opacity-100' : 'opacity-40'}`}
                        >
                            Home
                        </button>
                        <button 
                            onClick={() => handleMobileLink('work')}
                            className={`text-4xl font-bold tracking-tighter text-left uppercase ${view === 'work' ? 'opacity-100' : 'opacity-40'}`}
                        >
                            Work
                        </button>
                         <button 
                            onClick={() => handleMobileLink('archive')}
                            className={`text-4xl font-bold tracking-tighter text-left uppercase ${view === 'archive' ? 'opacity-100' : 'opacity-40'}`}
                        >
                            Archive
                        </button>
                        <button 
                            onClick={() => handleMobileLink('about')}
                            className={`text-4xl font-bold tracking-tighter text-left uppercase ${view === 'about' ? 'opacity-100' : 'opacity-40'}`}
                        >
                            About
                        </button>
                    </div>

                    <div className="flex justify-between items-end border-t border-current border-opacity-10 pt-6">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsStudioMode(!isStudioMode)} 
                                className={`flex items-center gap-2 text-xs font-bold tracking-widest uppercase ${isStudioMode ? 'text-red-500' : ''}`}
                            >
                                <Pen size={14} />
                                Studio
                            </button>
                            <button 
                                onClick={toggleTheme} 
                                className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
                            >
                                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                                {theme === 'light' ? 'Dark' : 'Light'}
                            </button>
                        </div>
                        <Clock />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main 
                className={`flex-1 flex items-center justify-center relative w-full perspective-container ${cursorStyle} 
                ${view === 'home' ? 'h-screen overflow-hidden fixed inset-0' : 'min-h-screen overflow-y-auto relative'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {view === 'home' && renderCarousel()}
                {view === 'work' && renderGrid()}
                {view === 'archive' && renderArchive()}
                {view === 'about' && renderAbout()}

            </main>

            {/* Footer for Home (Fixed) */}
            {view === 'home' && (
                <Footer className="fixed bottom-0 left-0 right-0 pointer-events-none [&>*]:pointer-events-auto" />
            )}

            {/* Project Detail Overlay */}
            {view === 'detail' && selectedProjectId && (
                <ProjectDetail 
                    project={projects.find(p => p.id === selectedProjectId)!}
                    onBack={() => setView('work')} // Default back to work logic
                    isStudioMode={isStudioMode}
                    onUpdate={updateProject}
                />
            )}

            {/* Background Grain/Texture (Optional) */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>
        </div>
    );
};

export default App;