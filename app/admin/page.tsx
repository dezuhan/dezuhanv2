"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Project, ArchiveItem, ProfileData, SocialLink } from '../../types';
import { getGitHubFile, updateGitHubFile, loginAdmin, uploadImage, getMediaFiles, deleteImage } from '../actions';
import { Save, Plus, Trash2, ArrowLeft, LogOut, Layout, Archive, FileText, Lock, Loader2, GripVertical, ChevronUp, ChevronDown, Link as LinkIcon, Mail, Phone, User, Upload, Image as ImageIcon, Copy, X } from 'lucide-react';
import Link from 'next/link';

// --- Types ---
type Tab = 'projects' | 'archive' | 'profile' | 'media';

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

const parseProfileFile = (content: string): ProfileData => {
    try {
        const jsonPart = content.split('export const PROFILE_DATA')[1];
        const cleanJson = jsonPart.substring(jsonPart.indexOf('=') + 1).trim().replace(/;\s*$/, '');
        // We need to type cast because Function constructor returns any
        return new Function('return ' + cleanJson)(); 
    } catch (e) {
        console.error("Error parsing profile file", e);
        // Return default fallback
        return { bio: "", email: "", phone: "", socials: [] };
    }
};

const serializeProfileFile = (profile: ProfileData) => {
    return `import { ProfileData } from '../types';

export const PROFILE_DATA: ProfileData = ${JSON.stringify(profile, null, 4)};`;
};

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('projects');
    
    // Data State
    const [projects, setProjects] = useState<Project[]>([]);
    const [archive, setArchive] = useState<ArchiveItem[]>([]);
    const [profile, setProfile] = useState<ProfileData>({ bio: "", email: "", phone: "", socials: [] });
    
    // Media State
    const [mediaFiles, setMediaFiles] = useState<{name: string, url: string, path: string}[]>([]);
    const [isMediaLoading, setIsMediaLoading] = useState(false);

    // Drag & Drop State
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadCallback, setUploadCallback] = useState<((urls: string[]) => void) | null>(null);

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

    // Load media when tab changes to media
    useEffect(() => {
        if (isAuthenticated && activeTab === 'media') {
            refreshMedia();
        }
    }, [activeTab, isAuthenticated]);

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

            // Load Profile (Bio)
            const bioFile = await getGitHubFile('database/bio.ts');
            setProfile(parseProfileFile(bioFile.content));

            // Store SHAs
            setShas({
                projects: projFile.sha,
                archive: archFile.sha,
                bio: bioFile.sha
            });

        } catch (error: any) {
            console.error(error);
            showMessage(error.message || "Failed to load data.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshMedia = async () => {
        setIsMediaLoading(true);
        try {
            const files = await getMediaFiles();
            setMediaFiles(files);
        } catch (error) {
            console.error(error);
            showMessage("Failed to load media library", "error");
        } finally {
            setIsMediaLoading(false);
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
            } else if (activeTab === 'profile') {
                const content = serializeProfileFile(profile);
                await updateGitHubFile('database/bio.ts', content, shas.bio, 'Update profile via Admin CMS');
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

    // --- Upload Logic ---

    const triggerUpload = (callback?: (urls: string[]) => void) => {
        setUploadCallback(() => callback || null);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const uploadedUrls: string[] = [];
        let errors = 0;

        try {
            // Upload files in parallel
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                try {
                    const result = await uploadImage(formData);
                    if (result.success && result.url) {
                        return result.url;
                    }
                } catch (err) {
                    console.error("Upload Error for file " + file.name, err);
                    errors++;
                }
                return null;
            });

            const results = await Promise.all(uploadPromises);
            results.forEach(url => {
                if (url) uploadedUrls.push(url);
            });

            if (uploadedUrls.length > 0) {
                showMessage(`Uploaded ${uploadedUrls.length} image(s)${errors > 0 ? `, ${errors} failed` : ''}.`);
                
                // If there's a specific callback (e.g., adding to project gallery)
                if (uploadCallback) {
                    uploadCallback(uploadedUrls);
                } 
                // If we are on media tab, simply refresh
                if (activeTab === 'media') {
                    refreshMedia();
                }
            } else {
                showMessage("Failed to upload images", "error");
            }

        } catch (error: any) {
            console.error(error);
            showMessage(`Upload Critical Error: ${error.message}`, 'error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            setUploadCallback(null);
        }
    };

    const handleDeleteMedia = async (path: string) => {
        if (!confirm("Are you sure you want to permanently delete this file? This cannot be undone and may break links on your site.")) return;

        try {
            await deleteImage(path);
            showMessage("File deleted successfully");
            refreshMedia();
        } catch (error: any) {
            showMessage(`Delete failed: ${error.message}`, "error");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showMessage("URL Copied to clipboard!");
    };

    // --- Reorder Logic (Buttons & Drag) ---

    const moveItem = (type: 'projects' | 'archive' | 'socials', index: number, direction: 'up' | 'down') => {
        if (type === 'socials') {
            const list = [...profile.socials];
            if (direction === 'up') {
                if (index === 0) return;
                [list[index - 1], list[index]] = [list[index], list[index - 1]];
            } else {
                if (index === list.length - 1) return;
                [list[index], list[index + 1]] = [list[index + 1], list[index]];
            }
            setProfile(prev => ({...prev, socials: list}));
            return;
        }

        const list = type === 'projects' ? [...projects] : [...archive];
        if (direction === 'up') {
            if (index === 0) return;
            [list[index - 1], list[index]] = [list[index], list[index - 1]];
        } else {
            if (index === list.length - 1) return;
            [list[index], list[index + 1]] = [list[index + 1], list[index]];
        }

        if (type === 'projects') setProjects(list as Project[]);
        else setArchive(list as ArchiveItem[]);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (e: React.DragEvent, index: number, type: 'projects' | 'archive') => {
        if (dragItem.current === null || dragItem.current === index) return;

        if (type === 'projects') {
            const newProjects = [...projects];
            const draggedItemContent = newProjects[dragItem.current];
            newProjects.splice(dragItem.current, 1);
            newProjects.splice(index, 0, draggedItemContent);
            setProjects(newProjects);
            dragItem.current = index;
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

    // Profile / Bio
    const updateProfile = (field: keyof ProfileData, value: any) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const addSocial = () => {
        setProfile(prev => ({
            ...prev,
            socials: [...prev.socials, { platform: "New Platform", url: "https://" }]
        }));
    };

    const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
        const newSocials = [...profile.socials];
        newSocials[index] = { ...newSocials[index], [field]: value };
        setProfile(prev => ({ ...prev, socials: newSocials }));
    };

    const deleteSocial = (index: number) => {
        const newSocials = profile.socials.filter((_, i) => i !== index);
        setProfile(prev => ({ ...prev, socials: newSocials }));
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
            
            {/* Shared Hidden File Input - Updated to Multiple */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                multiple
                onChange={handleFileChange}
            />

            {/* Global Upload Overlay */}
            {isUploading && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-white" size={32} />
                        <p className="text-sm font-mono">Uploading Images...</p>
                    </div>
                </div>
            )}
            
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
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'profile' ? 'bg-white text-black font-medium' : 'hover:bg-neutral-800 text-neutral-400'}`}
                    >
                        <User size={18} /> Profile
                    </button>
                    <button 
                        onClick={() => setActiveTab('media')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'media' ? 'bg-white text-black font-medium' : 'hover:bg-neutral-800 text-neutral-400'}`}
                    >
                        <ImageIcon size={18} /> Media
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
                        {activeTab !== 'media' && (
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-white hover:bg-neutral-200 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                                {isSaving ? 'Committing...' : 'Commit Changes'}
                            </button>
                        )}
                        {activeTab === 'media' && (
                             <button 
                                onClick={() => triggerUpload()}
                                className="bg-white hover:bg-neutral-200 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Upload size={18} /> Upload Images
                            </button>
                        )}
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
                                    {/* Control Column */}
                                    <div className="w-10 bg-neutral-950 border-r border-neutral-800 flex flex-col items-center shrink-0">
                                        <button 
                                            type="button"
                                            onClick={() => moveItem('projects', index, 'up')}
                                            disabled={index === 0}
                                            className="w-full h-8 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        
                                        <div className="flex-1 w-full flex items-center justify-center cursor-move hover:bg-neutral-800 text-neutral-600 hover:text-neutral-400 transition-colors">
                                            <GripVertical size={16} />
                                        </div>

                                        <button 
                                            type="button"
                                            onClick={() => moveItem('projects', index, 'down')}
                                            disabled={index === projects.length - 1}
                                            className="w-full h-8 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 flex-1 relative">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => deleteProject(project.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            {/* Image Preview & Upload */}
                                            <div className="lg:col-span-3">
                                                <div className="aspect-[4/3] bg-neutral-950 rounded overflow-hidden mb-2 group/image relative">
                                                    <img src={project.image} className="w-full h-full object-cover" alt="Preview" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity">
                                                        <ImageIcon className="text-white/50" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text"
                                                        value={project.image}
                                                        onChange={e => updateProject(project.id, 'image', e.target.value)}
                                                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-neutral-400 font-mono"
                                                        placeholder="Cover Image URL"
                                                    />
                                                    <button 
                                                        onClick={() => triggerUpload((urls) => updateProject(project.id, 'image', urls[0]))}
                                                        className="bg-neutral-800 hover:bg-white hover:text-black text-white p-2 rounded transition-colors"
                                                        title="Upload Image"
                                                    >
                                                        <Upload size={14} />
                                                    </button>
                                                </div>
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
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className={labelStyle}>Gallery Images (New lines or comma separated)</label>
                                                        <button 
                                                            onClick={() => triggerUpload((urls) => {
                                                                const currentGallery = project.gallery || [];
                                                                updateProject(project.id, 'gallery', [...currentGallery, ...urls]);
                                                            })}
                                                            className="text-[10px] flex items-center gap-1 bg-neutral-800 hover:bg-white hover:text-black px-2 py-0.5 rounded transition-colors"
                                                        >
                                                            <Upload size={10} /> Quick Upload & Append
                                                        </button>
                                                    </div>
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
                                    {/* Control Column */}
                                    <div className="w-10 bg-neutral-950 border-r border-neutral-800 flex flex-col items-center shrink-0">
                                        <button 
                                            type="button"
                                            onClick={() => moveItem('archive', index, 'up')}
                                            disabled={index === 0}
                                            className="w-full h-8 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        
                                        <div className="flex-1 w-full flex items-center justify-center cursor-move hover:bg-neutral-800 text-neutral-600 hover:text-neutral-400 transition-colors">
                                            <GripVertical size={16} />
                                        </div>

                                        <button 
                                            type="button"
                                            onClick={() => moveItem('archive', index, 'down')}
                                            disabled={index === archive.length - 1}
                                            className="w-full h-8 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
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

                    {/* --- PROFILE / BIO EDITOR --- */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Contact Info Card */}
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <FileText size={18} /> Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className={labelStyle}>Email Address</label>
                                        <div className="relative">
                                            <Mail size={14} className="absolute left-3 top-3.5 text-neutral-500" />
                                            <input 
                                                value={profile.email}
                                                onChange={e => updateProfile('email', e.target.value)}
                                                className={`${inputStyle} pl-9`} 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Phone Number</label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-3 top-3.5 text-neutral-500" />
                                            <input 
                                                value={profile.phone}
                                                onChange={e => updateProfile('phone', e.target.value)}
                                                className={`${inputStyle} pl-9`} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={`${labelStyle} mb-2 block`}>Bio Text</label>
                                    <textarea 
                                        value={profile.bio}
                                        onChange={e => updateProfile('bio', e.target.value)}
                                        className="w-full h-[200px] bg-neutral-950 border border-neutral-800 rounded-lg p-6 text-lg leading-relaxed text-neutral-200 focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Social Media Card */}
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <LinkIcon size={18} /> Social Media
                                    </h3>
                                    <button 
                                        onClick={addSocial}
                                        className="text-xs bg-white text-black font-bold px-3 py-1.5 rounded hover:bg-neutral-200 flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add Link
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {profile.socials.map((social, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            {/* Reorder Buttons */}
                                            <div className="flex flex-col gap-0.5">
                                                <button onClick={() => moveItem('socials', idx, 'up')} disabled={idx === 0} className="text-neutral-600 hover:text-white disabled:opacity-20"><ChevronUp size={12}/></button>
                                                <button onClick={() => moveItem('socials', idx, 'down')} disabled={idx === profile.socials.length - 1} className="text-neutral-600 hover:text-white disabled:opacity-20"><ChevronDown size={12}/></button>
                                            </div>

                                            <div className="flex-1 grid grid-cols-12 gap-3">
                                                <div className="col-span-4">
                                                    <input 
                                                        value={social.platform}
                                                        onChange={e => updateSocial(idx, 'platform', e.target.value)}
                                                        className={inputStyle} 
                                                        placeholder="Platform Name (e.g. Instagram)"
                                                    />
                                                </div>
                                                <div className="col-span-8">
                                                    <input 
                                                        value={social.url}
                                                        onChange={e => updateSocial(idx, 'url', e.target.value)}
                                                        className={inputStyle} 
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => deleteSocial(idx)}
                                                className="p-2 text-neutral-600 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {profile.socials.length === 0 && (
                                        <p className="text-neutral-600 text-sm font-mono text-center py-4">No social links added yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MEDIA GALLERY TAB --- */}
                    {activeTab === 'media' && (
                        <div className="space-y-6">
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 min-h-[500px]">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <ImageIcon size={18} /> Media Library
                                </h3>

                                {isMediaLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                                        <Loader2 className="animate-spin mb-4" size={32} />
                                        <p>Loading files...</p>
                                    </div>
                                ) : mediaFiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-lg">
                                        <ImageIcon size={48} className="mb-4 opacity-50" />
                                        <p>No images found in database/media/image/</p>
                                        <button onClick={() => triggerUpload()} className="mt-4 text-white hover:underline">Upload your first image</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {mediaFiles.map((file, idx) => (
                                            <div key={idx} className="group relative bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden aspect-square">
                                                <img 
                                                    src={file.url} 
                                                    alt={file.name} 
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                    <button 
                                                        onClick={() => copyToClipboard(file.url)}
                                                        className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-neutral-200"
                                                    >
                                                        <Copy size={12} /> Copy URL
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteMedia(file.path)}
                                                        className="bg-red-500/20 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-red-500 hover:text-white"
                                                    >
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1">
                                                    <p className="text-[10px] font-mono text-center truncate px-2 text-neutral-400">{file.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}