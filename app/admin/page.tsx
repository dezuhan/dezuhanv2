"use client";

import React, { useState, useEffect } from 'react';
import { Project, ArchiveItem } from '../../types';
import { DEFAULT_PROJECTS } from '../../data';
import { DEFAULT_ARCHIVE } from '../../database/archive';
import { DEFAULT_BIO } from '../../database/bio';
import { Save, Plus, Trash2, ArrowLeft, LogOut, Layout, Archive, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Simple "Security"
const ADMIN_PIN = "0000"; // You can change this or make it dynamic if needed

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState("");
    const [activeTab, setActiveTab] = useState<'projects' | 'archive' | 'bio'>('projects');
    
    // Data State
    const [projects, setProjects] = useState<Project[]>([]);
    const [archive, setArchive] = useState<ArchiveItem[]>([]);
    const [bio, setBio] = useState<string>("");

    // Notification State
    const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    // Style constants to replace styled-jsx
    const labelStyle = "text-[10px] font-mono uppercase text-neutral-500 mb-1 block tracking-wider";
    const inputStyle = "w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-sm text-white focus:outline-none focus:border-neutral-500 transition-colors";

    // Initial Load
    useEffect(() => {
        // Load from LocalStorage or Fallback
        const storedProjects = localStorage.getItem('dezuhan_projects');
        const storedArchive = localStorage.getItem('dezuhan_archive');
        const storedBio = localStorage.getItem('dezuhan_bio');

        setProjects(storedProjects ? JSON.parse(storedProjects) : DEFAULT_PROJECTS);
        setArchive(storedArchive ? JSON.parse(storedArchive) : DEFAULT_ARCHIVE);
        setBio(storedBio || DEFAULT_BIO);

        // Check if previously logged in (session storage)
        if (sessionStorage.getItem('dezuhan_admin_auth') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === ADMIN_PIN) {
            setIsAuthenticated(true);
            sessionStorage.setItem('dezuhan_admin_auth', 'true');
        } else {
            alert("Incorrect PIN");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('dezuhan_admin_auth');
    };

    const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const saveData = () => {
        try {
            localStorage.setItem('dezuhan_projects', JSON.stringify(projects));
            localStorage.setItem('dezuhan_archive', JSON.stringify(archive));
            localStorage.setItem('dezuhan_bio', bio);
            showMessage("All changes saved successfully to LocalStorage!");
        } catch (err) {
            showMessage("Failed to save changes", 'error');
        }
    };

    const resetToDefaults = () => {
        if(confirm("Are you sure? This will wipe all local changes and restore defaults.")) {
            setProjects(DEFAULT_PROJECTS);
            setArchive(DEFAULT_ARCHIVE);
            setBio(DEFAULT_BIO);
            localStorage.removeItem('dezuhan_projects');
            localStorage.removeItem('dezuhan_archive');
            localStorage.removeItem('dezuhan_bio');
            showMessage("Restored to defaults");
        }
    };

    // --- CRUD Handlers ---

    // Projects
    const addProject = () => {
        const newId = Math.max(...projects.map(p => p.id), 0) + 1;
        const newProject: Project = {
            id: newId,
            title: "New Project",
            description: "",
            content: "",
            tech: [],
            link: "",
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
            year: new Date().getFullYear().toString(),
            role: "Designer",
            client: "Client Name"
        };
        setProjects([newProject, ...projects]);
    };

    const updateProject = (id: number, field: keyof Project, value: any) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const deleteProject = (id: number) => {
        if(confirm("Delete this project?")) {
            setProjects(prev => prev.filter(p => p.id !== id));
        }
    };

    // Archive
    const addArchive = () => {
        const newId = Math.max(...archive.map(a => a.id), 0) + 1;
        const newItem: ArchiveItem = {
            id: newId,
            year: new Date().getFullYear().toString(),
            date: "Jan - Present",
            role: "New Role",
            company: "Company Name",
            type: "Freelance",
            location: "Remote",
            details: [],
            skills: ""
        };
        setArchive([newItem, ...archive]);
    };

    const updateArchive = (id: number, field: keyof ArchiveItem, value: any) => {
        setArchive(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    const deleteArchive = (id: number) => {
        if(confirm("Delete this archive entry?")) {
            setArchive(prev => prev.filter(a => a.id !== id));
        }
    };


    // --- Render Logic ---

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="w-full max-w-md bg-neutral-800 p-8 rounded-xl border border-neutral-700 shadow-2xl">
                    <h1 className="text-2xl font-bold mb-6 text-center tracking-tight">Dezuhan Admin</h1>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-mono uppercase text-neutral-400">Security PIN</label>
                            <input 
                                type="password" 
                                value={pinInput}
                                onChange={e => setPinInput(e.target.value)}
                                className="bg-neutral-900 border border-neutral-700 rounded p-3 text-center text-2xl tracking-widest focus:border-white focus:outline-none transition-colors"
                                placeholder="••••"
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded hover:bg-neutral-200 transition-colors">
                            Enter Dashboard
                        </button>
                        <Link href="/" className="block text-center text-xs text-neutral-500 hover:text-white mt-4">
                            ← Back to Main Site
                        </Link>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col md:flex-row font-sans">
            
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col gap-8 shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white mb-1">Dezuhan CMS</h1>
                    <p className="text-xs text-neutral-500 font-mono">Local Storage Mode</p>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    <button 
                        onClick={() => setActiveTab('projects')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'projects' ? 'bg-white text-black font-medium' : 'hover:bg-neutral-800 text-neutral-400'}`}
                    >
                        <Layout size={18} /> Projects
                    </button>
                    <button 
                        onClick={() => setActiveTab('archive')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'archive' ? 'bg-white text-black font-medium' : 'hover:bg-neutral-800 text-neutral-400'}`}
                    >
                        <Archive size={18} /> Archive
                    </button>
                    <button 
                        onClick={() => setActiveTab('bio')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'bio' ? 'bg-white text-black font-medium' : 'hover:bg-neutral-800 text-neutral-400'}`}
                    >
                        <FileText size={18} /> Bio
                    </button>
                </nav>

                <div className="space-y-2">
                    <Link href="/" className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white px-4 py-2">
                        <ArrowLeft size={14} /> View Live Site
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 text-xs text-red-400 hover:bg-red-900/20 px-4 py-2 rounded">
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative h-screen">
                {/* Top Bar */}
                <header className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 p-4 md:p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold capitalize">{activeTab} Manager</h2>
                    <div className="flex gap-4">
                        <button onClick={resetToDefaults} className="text-xs text-neutral-500 hover:text-red-400 px-4 py-2">
                            Reset All Data
                        </button>
                        <button 
                            onClick={saveData}
                            className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20"
                        >
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </header>

                {/* Notifications */}
                {message && (
                    <div className={`fixed bottom-8 right-8 px-6 py-3 rounded shadow-xl border z-50 animate-fade-in ${message.type === 'success' ? 'bg-green-900 border-green-700 text-green-100' : 'bg-red-900 border-red-700 text-red-100'}`}>
                        {message.text}
                    </div>
                )}

                <div className="p-6 md:p-8 max-w-5xl mx-auto pb-32">
                    
                    {/* --- PROJECTS EDITOR --- */}
                    {activeTab === 'projects' && (
                        <div className="space-y-8">
                            <button onClick={addProject} className="w-full border-2 border-dashed border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900 rounded-xl p-8 flex flex-col items-center gap-2 text-neutral-500 hover:text-white transition-all">
                                <Plus size={32} />
                                <span className="font-bold">Create New Project</span>
                            </button>

                            {projects.map((project) => (
                                <div key={project.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => deleteProject(project.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* Image Preview */}
                                        <div className="lg:col-span-3">
                                            <div className="aspect-[4/3] bg-neutral-950 rounded overflow-hidden mb-2">
                                                <img src={project.image} className="w-full h-full object-cover" alt="Preview" />
                                            </div>
                                            <input 
                                                type="text"
                                                value={project.image}
                                                onChange={e => updateProject(project.id, 'image', e.target.value)}
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-neutral-400 font-mono"
                                                placeholder="Cover Image URL"
                                            />
                                        </div>

                                        {/* Form Fields */}
                                        <div className="lg:col-span-9 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className={labelStyle}>Title</label>
                                                    <input 
                                                        value={project.title}
                                                        onChange={e => updateProject(project.id, 'title', e.target.value)}
                                                        className={`${inputStyle} text-lg font-bold`} 
                                                    />
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className={labelStyle}>Client</label>
                                                    <input 
                                                        value={project.client || ''}
                                                        onChange={e => updateProject(project.id, 'client', e.target.value)}
                                                        className={inputStyle} 
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelStyle}>Role</label>
                                                    <input 
                                                        value={project.role || ''}
                                                        onChange={e => updateProject(project.id, 'role', e.target.value)}
                                                        className={inputStyle} 
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>Year</label>
                                                    <input 
                                                        value={project.year || ''}
                                                        onChange={e => updateProject(project.id, 'year', e.target.value)}
                                                        className={inputStyle} 
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Description (Short)</label>
                                                <input 
                                                    value={project.description}
                                                    onChange={e => updateProject(project.id, 'description', e.target.value)}
                                                    className={inputStyle} 
                                                />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Content (Full Detail)</label>
                                                <textarea 
                                                    value={project.content || ''}
                                                    onChange={e => updateProject(project.id, 'content', e.target.value)}
                                                    className={`${inputStyle} min-h-[100px]`} 
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelStyle}>Tech Stack (Comma Separated)</label>
                                                    <input 
                                                        value={project.tech.join(", ")}
                                                        onChange={e => updateProject(project.id, 'tech', e.target.value.split(',').map(s => s.trim()))}
                                                        className={inputStyle} 
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>Live Link</label>
                                                    <input 
                                                        value={project.link || ''}
                                                        onChange={e => updateProject(project.id, 'link', e.target.value)}
                                                        className={inputStyle} 
                                                    />
                                                </div>
                                            </div>

                                            {/* Gallery Management */}
                                            <div>
                                                <label className={labelStyle}>Gallery Images (New lines or comma separated)</label>
                                                <textarea
                                                    value={(project.gallery || []).join('\n')}
                                                    onChange={e => updateProject(project.id, 'gallery', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                                                    className={`${inputStyle} text-xs font-mono min-h-[80px]`}
                                                    placeholder="https://example.com/image1.jpg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- ARCHIVE EDITOR --- */}
                    {activeTab === 'archive' && (
                        <div className="space-y-4">
                            <button onClick={addArchive} className="w-full border-2 border-dashed border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900 rounded-xl p-6 flex items-center justify-center gap-2 text-neutral-500 hover:text-white transition-all">
                                <Plus size={24} />
                                <span className="font-bold">Add Archive Entry</span>
                            </button>

                            {archive.map((item) => (
                                <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 relative group flex flex-col gap-4">
                                     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => deleteArchive(item.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-1">
                                            <label className={labelStyle}>Date</label>
                                            <input 
                                                value={item.date}
                                                onChange={e => updateArchive(item.id, 'date', e.target.value)}
                                                className={`${inputStyle} font-mono`} 
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className={labelStyle}>Year</label>
                                            <input 
                                                value={item.year}
                                                onChange={e => updateArchive(item.id, 'year', e.target.value)}
                                                className={`${inputStyle} font-mono`} 
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className={labelStyle}>Type</label>
                                            <input 
                                                value={item.type}
                                                onChange={e => updateArchive(item.id, 'type', e.target.value)}
                                                className={inputStyle} 
                                            />
                                        </div>
                                         <div className="md:col-span-1">
                                            <label className={labelStyle}>Location</label>
                                            <input 
                                                value={item.location || ''}
                                                onChange={e => updateArchive(item.id, 'location', e.target.value)}
                                                className={inputStyle} 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelStyle}>Role</label>
                                            <input 
                                                value={item.role}
                                                onChange={e => updateArchive(item.id, 'role', e.target.value)}
                                                className={`${inputStyle} font-bold text-lg`} 
                                            />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Company</label>
                                            <input 
                                                value={item.company}
                                                onChange={e => updateArchive(item.id, 'company', e.target.value)}
                                                className={inputStyle} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelStyle}>Skills</label>
                                        <input 
                                            value={item.skills || ''}
                                            onChange={e => updateArchive(item.id, 'skills', e.target.value)}
                                            className={inputStyle} 
                                        />
                                    </div>

                                    <div>
                                        <label className={labelStyle}>Details (Bullet points, one per line)</label>
                                        <textarea 
                                            value={(item.details || []).join('\n')}
                                            onChange={e => updateArchive(item.id, 'details', e.target.value.split('\n').filter(Boolean))}
                                            className={`${inputStyle} min-h-[100px]`} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- BIO EDITOR --- */}
                    {activeTab === 'bio' && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                            <label className={`${labelStyle} mb-4 block`}>Bio Text</label>
                            <textarea 
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="w-full h-[400px] bg-neutral-950 border border-neutral-800 rounded-lg p-6 text-xl leading-relaxed text-neutral-200 focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}