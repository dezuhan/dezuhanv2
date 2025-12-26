"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Project, ArchiveItem } from '../types';
import { DEFAULT_PROJECTS, DEFAULT_ARCHIVE, PROFILE_DATA } from '../database';
import { ProjectDetail } from '../components/ProjectDetail';
import { AdminPanel } from '../components/AdminPanel';
import { Moon, Sun, X, Menu, Check } from 'lucide-react';

// --- Components ---

const Clock = () => {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) return null;

    return (
        <span className="font-mono text-xs tracking-wider opacity-60">
            {time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
    );
};

// Preloader Component (Only for Dev/AI Studio)
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Random speed increment
                return Math.min(prev + Math.floor(Math.random() * 5) + 2, 100);
            });
        }, 50);

        const timeout = setTimeout(() => {
            onComplete();
        }, 2500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center animate-fade-in">
            <div className="text-6xl md:text-8xl font-bold tracking-tighter mb-4">
                DEZUHAN
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-64 h-[1px] bg-white/20 relative overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 bottom-0 bg-white transition-all duration-100 ease-out" 
                        style={{ width: `${count}%` }}
                    />
                </div>
                <div className="font-mono text-xs opacity-50 tracking-widest">
                    SYSTEM LOADING {count}%
                </div>
            </div>
        </div>
    );
};

// Reusable Footer Component
const Footer: React.FC<{ className?: string, onOpenAdmin?: () => void }> = ({ className = '', onOpenAdmin }) => {
    return (
        <footer className={`p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-end text-[10px] md:text-xs font-mono uppercase tracking-widest z-40 gap-8 md:gap-0 ${className}`}>
            <div className="order-2 md:order-1">
                <p className="opacity-50">© 2025 Dezuhan</p>
                <p>Creative Designer</p>
                {onOpenAdmin && (
                    <button 
                        onClick={onOpenAdmin}
                        className="text-red-500 hover:text-red-400 hover:underline transition-colors mt-4 block font-bold text-xs text-left"
                    >
                        [ ● ACCESS ADMIN ]
                    </button>
                )}
            </div>
            
            {/* Right Side: Links & Contact */}
            <div className="order-1 md:order-2 w-full md:w-auto flex flex-row md:flex-row items-start gap-8 md:gap-12 text-left">
                <div className="flex flex-col gap-1">
                    {PROFILE_DATA.socials.map((social, idx) => (
                        <a 
                            key={idx}
                            href={social.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:opacity-100 opacity-50 transition-opacity"
                        >
                            {social.platform}
                        </a>
                    ))}
                </div>
                <div className="flex flex-col gap-1">
                    <a href={`mailto:${PROFILE_DATA.email}`} className="hover:opacity-100 opacity-50 transition-opacity">{PROFILE_DATA.email}</a>
                    <p className="opacity-50">{PROFILE_DATA.phone}</p>
                </div>
            </div>
        </footer>
    );
};

// --- Main App ---

export default function Home() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [activeIndex, setActiveIndex] = useState(0); 
    const [view, setView] = useState<'home' | 'work' | 'archive' | 'about' | 'detail'>('home');
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Admin State
    const [showAdmin, setShowAdmin] = useState(false);
    
    // Preloader State
    const [isLoading, setIsLoading] = useState(true);

    // Archive Expansion State
    const [expandedArchiveId, setExpandedArchiveId] = useState<number | null>(null);

    // Content State - Directly from database files
    const [projects] = useState<Project[]>(DEFAULT_PROJECTS);
    const [archive] = useState<ArchiveItem[]>(DEFAULT_ARCHIVE);
    const [profile] = useState(PROFILE_DATA);

    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef(0);

    // Drag state
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const [cursorStyle, setCursorStyle] = useState('cursor-default');

    // Initialize Theme & Check Environment for Preloader
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Check if we are in AI Studio / Localhost
        if (typeof window !== 'undefined') {
            const isProduction = window.location.hostname === 'dezuhan.vercel.app';
            if (isProduction) {
                // Skip preloader in production if desired, or set to true to always show
                setIsLoading(false); 
            }
            // If NOT production (AI Studio), isLoading remains true initially
        }
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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
            if (now - lastScrollTime.current < 400) return;

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
             if (view !== 'home') return;
             if (e.key === 'ArrowRight') setActiveIndex(prev => prev + 1);
             if (e.key === 'ArrowLeft') setActiveIndex(prev => prev - 1);
         };
         window.addEventListener('keydown', handleKey);
         return () => window.removeEventListener('keydown', handleKey);
    }, [view]);

    // Handle Drag/Swipe (Mouse)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (view !== 'home') return;
        
        isDragging.current = true;
        startX.current = e.clientX;
        setCursorStyle('cursor-grabbing');
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || view !== 'home') return;
        
        const currentX = e.clientX;
        const diff = startX.current - currentX;
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

    // Handle Swipe (Touch) - New Addition
    const handleTouchStart = (e: React.TouchEvent) => {
        if (view !== 'home') return;
        isDragging.current = true;
        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current || view !== 'home') return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;

        const diffX = startX.current - currentX;
        const diffY = startY.current - currentY;
        
        // If the swipe is primarily vertical, we ignore it for the carousel
        // This allows the browser's default behavior (refresh/scroll) to take precedence if allowed by CSS
        if (Math.abs(diffY) > Math.abs(diffX)) return;

        const dragThreshold = 50; // Lower threshold for mobile

        if (Math.abs(diffX) > dragThreshold) {
             const direction = diffX > 0 ? 1 : -1;
             setActiveIndex(prev => prev + direction);
             startX.current = currentX; 
             startY.current = currentY;
        }
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
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
                
                const translateX = offset * 160; 
                const translateZ = Math.abs(offset) * -300; 
                const rotateY = offset * -15;
                const opacity = Math.max(0.2, 1 - Math.abs(offset) * 0.4);
                const zIndex = 100 - Math.abs(offset);
                const isActive = offset === 0;

                return (
                    <div 
                        key={virtualIndex}
                        onClick={() => isActive && handleProjectClick(project.id)}
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
                            <h3 className="text-xl md:text-2xl font-bold tracking-tight select-none">{project.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 select-none">{project.tech.join(" / ")}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderGrid = () => (
        <div className="w-full animate-fade-in flex flex-col min-h-screen">
             <div className="flex-1 w-full px-6 md:px-12 pt-32 pb-32">
                {/* Updated Border */}
                <div className="mb-24 border-b border-neutral-200 dark:border-neutral-800 pb-6">
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
            {/* Updated Border */}
            <Footer className="border-t border-neutral-200 dark:border-neutral-800" onOpenAdmin={() => setShowAdmin(true)} />
        </div>
    );

    const renderArchive = () => (
        <div className="w-full animate-fade-in flex flex-col min-h-screen">
             <div className="flex-1 w-full px-6 md:px-12 pt-32 pb-32">
                <div className="w-full mx-auto">
                    <div className="mb-24">
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight">Archive</h2>
                        <p className="text-sm opacity-50 mt-4 font-mono">All experience & roles since 2022</p>
                    </div>

                    <div className="w-full">
                        {/* Updated Border & Background Fix */}
                        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-mono tracking-widest text-neutral-500 sticky top-24 bg-[#f4f4f5] dark:bg-[#09090b] z-10">
                            <div className="col-span-2">Date</div>
                            <div className="col-span-6">Role / Company</div>
                            <div className="col-span-4 text-right">Location / Type</div>
                        </div>

                        <div className="flex flex-col">
                            {archive.map((item) => {
                                const isExpanded = expandedArchiveId === item.id;
                                return (
                                    <div 
                                        key={item.id}
                                        /* Updated Border */
                                        className={`group flex flex-col border-b border-neutral-200 dark:border-neutral-800 transition-all duration-500 ${isExpanded ? 'bg-black/5 dark:bg-white/5 pb-6 rounded-lg my-2 border-transparent' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
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

                                        <div 
                                            className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-2 md:px-0 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="hidden md:block col-span-2"></div>
                                            {/* Updated Border */}
                                            <div className="col-span-12 md:col-span-10 border-t border-neutral-200 dark:border-neutral-800 pt-4">
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
            {/* Updated Border */}
            <Footer className="border-t border-neutral-200 dark:border-neutral-800" onOpenAdmin={() => setShowAdmin(true)} />
        </div>
    );

    const renderAbout = () => (
        <div className="w-full animate-fade-in flex flex-col min-h-screen">
            <div className="flex-1 w-full px-6 md:px-12 pt-32 pb-32">
                 <div className="max-w-7xl mx-auto">
                    <div className="mb-24">
                        <h2 className="text-4xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-8 whitespace-pre-line">
                            {profile.bio}
                        </h2>
                    </div>

                    {/* Updated Border */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24 text-base pt-12 border-t border-neutral-200 dark:border-neutral-800">
                        <div>
                            <h3 className="font-mono uppercase tracking-widest opacity-40 mb-6 text-sm">Contact</h3>
                            <ul className="space-y-4 opacity-80 text-lg">
                                <li><a href={`mailto:${profile.email}`} className="hover:underline">{profile.email}</a></li>
                                <li>{profile.phone}</li>
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

            {/* Updated Border */}
            <Footer className="border-t border-neutral-200 dark:border-neutral-800" onOpenAdmin={() => setShowAdmin(true)} />
        </div>
    );

    const handleMobileLink = (targetView: 'home' | 'work' | 'archive' | 'about') => {
        setView(targetView);
        setIsMenuOpen(false);
    };

    if (isLoading) {
        return <Preloader onComplete={() => setIsLoading(false)} />;
    }

    return (
        <div className={`min-h-screen flex flex-col relative transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            
            {/* Header */}
            {/* Updated: Changed items-start to items-center for vertical centering */}
            <header className={`fixed top-0 left-0 right-0 z-40 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center pointer-events-none transition-opacity duration-300 ${view === 'detail' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex flex-col gap-1 z-50 pointer-events-auto">
                    <button 
                        onClick={() => setView('home')} 
                        className="text-sm font-bold tracking-widest uppercase text-left hover:opacity-70 transition-opacity mt-auto mb-auto"
                    >
                        Dezuhan
                    </button>
                </div>

                {/* Desktop Nav */}
                {/* Updated: Changed items-start to items-center */}
                <nav className="hidden md:flex items-center gap-8 md:gap-12 z-50 pointer-events-auto">
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
                        {/* Admin Trigger (Desktop) */}
                        <button 
                            onClick={() => setShowAdmin(true)}
                            className="hover:opacity-50 transition-opacity text-red-500 font-bold text-xs flex items-center gap-2"
                            title="Admin Access"
                        >
                             <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            ADMIN
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
                    {/* Updated: Changed items-start to items-center */}
                    <div className="flex justify-between items-center mb-12">
                        <div className="text-sm font-bold tracking-widest uppercase mt-auto mb-auto">
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
                        <div className="flex gap-4 items-center">
                             {/* Admin Trigger (Mobile) */}
                            <button 
                                onClick={() => { setShowAdmin(true); setIsMenuOpen(false); }}
                                className="text-xs font-bold tracking-widest uppercase text-red-500"
                            >
                                [ ● ADMIN ]
                            </button>
                            <div className="w-[1px] h-3 bg-current opacity-20"></div>
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
                ${view === 'home' ? 'h-screen overflow-hidden fixed inset-0 touch-pan-y' : 'min-h-screen overflow-y-auto relative'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {view === 'home' && renderCarousel()}
                {view === 'work' && renderGrid()}
                {view === 'archive' && renderArchive()}
                {view === 'about' && renderAbout()}

            </main>

            {view === 'home' && (
                <Footer className="fixed bottom-0 left-0 right-0 pointer-events-none [&>*]:pointer-events-auto" onOpenAdmin={() => setShowAdmin(true)} />
            )}

            {view === 'detail' && selectedProjectId && (
                <ProjectDetail 
                    project={projects.find(p => p.id === selectedProjectId)!}
                    onBack={() => setView('work')} // Default back to work logic
                />
            )}

            {/* Admin Overlay */}
            {showAdmin && (
                <AdminPanel onClose={() => setShowAdmin(false)} />
            )}

            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>
        </div>
    );
}