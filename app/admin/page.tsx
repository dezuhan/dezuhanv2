"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Project, ArchiveItem } from '../../types';
import { getGitHubFile, updateGitHubFile, loginAdmin } from '../actions';
import { Save, Plus, Trash2, ArrowLeft, LogOut, Layout, Archive, FileText, Lock, Loader2, GripVertical } from 'lucide-react';
import Link from 'next/link';

// --- Types ---
type Tab = 'projects' | 'archive' | 'bio';

// --- Parsers & Serializers ---
const parseProjectFile = (content: string): Project[] => {
    try {
        const jsonPart = content.split('export const DEFAULT_PROJECTS')[1];
        const cleanJson = jsonPart.substring(jsonPart.indexOf('=') + 1).trim().replace(/;\s*$/, '');
        return new Function('return ' + cleanJson)();
    } catch (e) {
        console.error("Error parsing projects file", e);
        return [];
    }
};

const serializeProjectFile = (projects: Project[]) => {
    return `import { Project } from '../types';

export const DEFAULT_PROJECTS: Project[] = ${JSON.stringify(projects, null, 4)};`;
};

const parseArchiveFile = (content: string): ArchiveItem[] => {
    try {
        const jsonPart = content.split('export const DEFAULT_ARCHIVE')[1];
        const cleanJson = jsonPart.substring(jsonPart.indexOf('=') + 1).trim().replace(/;\s*$/, '');
        return new Function('return ' + cleanJson)();
    } catch (e) {
        console.error("Error parsing archive file", e);
        return [];
    }
};

const serializeArchiveFile = (archive: ArchiveItem[]) => {
    return `import { ArchiveItem } from '../types';

export const DEFAULT_ARCHIVE: ArchiveItem[] = ${JSON.stringify(archive, null, 4)};`;
};

const parseBioFile = (content: string): string => {
    const match = content.match(/export const DEFAULT_BIO\s*=\s*[`'"]([\s\S]*?)[`'"];/);
    return match ? match[1] : "";
};

const serializeBioFile = (bio: string) => {
    return `export const DEFAULT_BIO = \`${bio}\`;`;
};

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('projects');
    
    // Data State
    const [projects, setProjects] = useState<Project[]>([]);
    const [archive, setArchive] = useState<ArchiveItem[]>([]);
    const [bio, setBio] = useState<string>("");

    // Drag & Drop State
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // File SHA Tracking
    const [shas, setShas] = useState({ projects: '', archive: '', bio: '' });

    // Notification State
    const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    // Initial Auth Check
    useEffect(() => {
        const auth = sessionStorage.getItem('dezuhan_admin_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            loadData();
        }
    }, []);

    const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load Projects
            const projFile = await getGitHubFile('database/projects.ts');
            setProjects(parseProjectFile(projFile.content));
            
            // Load Archive
            const archFile = await getGitHubFile('database/archive.ts');
            setArchive(parseArchiveFile(archFile.content));

            // Load Bio
            const bioFile = await getGitHubFile('database/bio.ts');
            setBio(parseBioFile(bioFile.content));

            // Store SHAs
            setShas({
                projects: projFile.sha,
                archive: archFile.sha,
                bio: bioFile.sha
            });

        } catch (error: any) {
            console.error(error);
            showMessage(error.message || "Failed to load data.", 'error');
            // If fetching fails due to missing env, we might want to logout or show config error
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const password = formData.get('password') as string;

        try {
            const valid = await loginAdmin(password);
            if (valid) {
                setIsAuthenticated(true);
                sessionStorage.setItem('dezuhan_admin_auth', 'true');
                loadData();
            } else {
                alert("Incorrect Password");
            }
        } catch (e) {
            alert("Error: .env is probably not configured on server.");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('dezuhan_admin_auth');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === 'projects') {
                const content = serializeProjectFile(projects);
                await updateGitHubFile('database/projects.ts', content, shas.projects, 'Update projects via Admin CMS');
            } else if (activeTab === 'archive') {
                const content = serializeArchiveFile(archive);
                await updateGitHubFile('database/archive.ts', content, shas.archive, 'Update archive via Admin CMS');
            } else if (activeTab === 'bio') {
                const content = serializeBioFile(bio);
                await updateGitHubFile('database/bio.ts', content, shas.bio, 'Update bio via Admin CMS');
            }

            showMessage("Changes committed to GitHub! Deployment should start shortly.");
            await loadData(); // Refresh SHAs

        } catch (error: any) {
            console.error(error);
            showMessage(`Save Failed: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Drag and Drop Logic ---

    const handleDragStart = (e: React.DragEvent, index: number) => {
        dragItem.current = index;
        // visual effect only
        e.dataTransfer.effectAllowed = "move";
        // Ghost image usually handles itself, but we can style the row being dragged via state if needed
        // For now, we rely on the `dragging` class or style
    };

    const handleDragEnter = (e: React.DragEvent, index: number, type: 'projects' | 'archive') => {
        // Prevent sorting if we aren't dragging anything or dragging over the same item
        if (dragItem.current === null || dragItem.current === index) return;

        if (type === 'projects') {
            const newProjects = [...projects];
            const draggedItemContent = newProjects[dragItem.current];
            
            // Remove from old pos
            newProjects.splice(dragItem.current, 1);
            // Insert at new pos
            newProjects.splice(index, 0, draggedItemContent);
            
            setProjects(newProjects);
            dragItem.current = index; // Update the reference to the new position
        } 
        else if (type === 'archive') {
            const newArchive = [...archive];
            const draggedItemContent = newArchive[dragItem.current];
            
            newArchive.splice(dragItem.current, 1);
            newArchive.splice(index, 0, draggedItemContent);
            
            setArchive(newArchive);
            dragItem.current = index;
        }
    };

    const handleDragEnd = () => {
        dragItem.current = null;
        dragOverItem.current = null;
    };

    // --- CRUD Logic ---

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

    // Style constants
    const labelStyle = "text-[10px] font-mono uppercase text-neutral-500 mb-1 block tracking-wider";
    const inputStyle = "w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-sm text-white focus:outline-none focus:border-neutral-500 transition-colors";

    // --- Renders ---

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="w-full max-w-md bg-neutral-800 p-8 rounded-xl border border-neutral-700 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <Lock size={48} className="text-white/20" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-center tracking-tight">Admin Access</h1>
                    <p className="text-neutral-500 text-center text-sm mb-8">Enter password to manage content.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <input name="password" type="password" required className={inputStyle} placeholder="••••••••" autoFocus />
                        </div>
                        <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded hover:bg-neutral-200 transition-colors mt-2">
                            Login
                        </button>
                        <Link href="/" className="block text-center text-xs text-neutral-500 hover:text-white mt-4">
                            ← Back to Main Site
                        </Link>
                    </div>
                </form>
            </div>
        );
    }

    if (isLoading) {
         return (
            <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm font-mono opacity-50">Syncing with Repository...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col md:flex-row font-sans">
            
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col gap-8 shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white mb-1">Dezuhan CMS</h1>
                    <div className="flex items-center gap-2 text-xs text-green-500 font-mono">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Online Mode
                    </div>
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
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-white hover:bg-neutral-200 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                            {isSaving ? 'Committing...' : 'Commit Changes'}
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

                            {projects.map((project, index) => (
                                <div 
                                    key={project.id} 
                                    className="bg-neutral-900 border border-neutral-800 rounded-xl flex overflow-hidden group transition-all duration-200 hover:border-neutral-600"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnter={(e) => handleDragEnter(e, index, 'projects')}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    {/* Drag Handle */}
                                    <div className="w-8 bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center cursor-move transition-colors shrink-0">
                                        <GripVertical size={16} className="text-neutral-500" />
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 flex-1 relative">
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

                            {archive.map((item, index) => (
                                <div 
                                    key={item.id} 
                                    className="bg-neutral-900 border border-neutral-800 rounded-lg flex overflow-hidden group transition-all duration-200 hover:border-neutral-600"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnter={(e) => handleDragEnter(e, index, 'archive')}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    {/* Drag Handle */}
                                    <div className="w-8 bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center cursor-move transition-colors shrink-0">
                                        <GripVertical size={16} className="text-neutral-500" />
                                    </div>

                                    <div className="p-6 flex-1 relative flex flex-col gap-4">
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