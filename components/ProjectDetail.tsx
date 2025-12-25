import React from 'react';
import { Project } from '../types';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface ProjectDetailProps {
    project: Project;
    onBack: () => void;
    isStudioMode: boolean;
    onUpdate: (id: number, field: keyof Project, value: any) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, isStudioMode, onUpdate }) => {
    
    // Helper for input fields in studio mode
    const renderEditableText = (
        field: keyof Project, 
        value: string | undefined, 
        className: string, 
        placeholder: string,
        multiline: boolean = false
    ) => {
        if (!isStudioMode) {
            return <div className={className}>{value}</div>;
        }

        if (multiline) {
            return (
                <textarea
                    value={value || ''}
                    onChange={(e) => onUpdate(project.id, field, e.target.value)}
                    className={`${className} bg-white/5 border border-dashed border-red-500/50 p-2 rounded focus:outline-none focus:border-red-500 min-h-[150px] resize-y`}
                    placeholder={placeholder}
                />
            );
        }

        return (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onUpdate(project.id, field, e.target.value)}
                className={`${className} bg-white/5 border-b border-dashed border-red-500/50 focus:outline-none focus:border-red-500`}
                placeholder={placeholder}
            />
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-background dark:bg-black overflow-y-auto animate-fade-in">
            {/* Top Navigation */}
            <div className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-50 bg-gradient-to-b from-background/90 to-transparent dark:from-black/90 backdrop-blur-sm pointer-events-none">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity pointer-events-auto"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
            </div>

            <div className="max-w-5xl mx-auto pt-32 pb-24 px-6 md:px-12">
                
                {/* 1. Header Section */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex-1">
                        {renderEditableText('title', project.title, "text-4xl md:text-6xl font-bold tracking-tight mb-2", "Project Title")}
                        {renderEditableText('client', project.client, "text-lg opacity-60 font-mono", "Client Name")}
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-mono uppercase tracking-widest opacity-40 block mb-1">Year</span>
                        {renderEditableText('year', project.year, "text-sm font-bold", "2024")}
                    </div>
                </div>

                {/* 2. Hero Image */}
                <div className="w-full mb-16 rounded-sm overflow-hidden shadow-sm">
                    <img src={project.image} alt={project.title} className="w-full h-auto object-cover" />
                </div>

                {/* 3. Text Info Grid (About & Credits) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24 border-b border-current border-opacity-10 pb-16">
                    {/* Description Column */}
                    <div className="md:col-span-8">
                        <h3 className="text-xs font-mono uppercase tracking-widest opacity-40 mb-6">About the project</h3>
                        {renderEditableText('content', project.content || project.description, "text-lg md:text-xl leading-relaxed opacity-90 whitespace-pre-line font-light", "Long content description...", true)}
                        
                        {project.link && (
                             <div className="mt-8">
                                <a href={project.link} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:underline opacity-80 hover:opacity-100">
                                    Visit Live Site <ExternalLink size={14} />
                                </a>
                             </div>
                         )}
                    </div>

                    {/* Credits/Metadata Column */}
                    <div className="md:col-span-4 space-y-8">
                        <div>
                            <h3 className="text-xs font-mono uppercase tracking-widest opacity-40 mb-2">Role</h3>
                            {renderEditableText('role', project.role, "text-sm font-medium", "Role")}
                        </div>
                        <div>
                            <h3 className="text-xs font-mono uppercase tracking-widest opacity-40 mb-2">Tech Stack</h3>
                             <div className="flex flex-wrap gap-x-2 gap-y-1">
                                 {isStudioMode ? (
                                    <input 
                                        value={project.tech.join(", ")}
                                        onChange={(e) => onUpdate(project.id, 'tech', e.target.value.split(",").map(s => s.trim()))}
                                        className="w-full bg-white/5 p-2 text-sm border-dashed border border-red-500/50"
                                    />
                                 ) : (
                                     project.tech.map((t, i) => (
                                         <span key={i} className="text-sm opacity-80">
                                             {t}{i < project.tech.length - 1 ? ',' : ''}
                                         </span>
                                     ))
                                 )}
                             </div>
                        </div>
                    </div>
                </div>

                {/* 4. Vertical Gallery Stack */}
                {project.gallery && project.gallery.length > 0 && (
                    <div className="flex flex-col gap-8 md:gap-16">
                        {project.gallery.map((img, idx) => (
                            <div key={idx} className="w-full bg-gray-100 dark:bg-gray-800">
                                <img 
                                    src={img} 
                                    alt={`${project.title} - view ${idx + 1}`} 
                                    className="w-full h-auto object-cover" 
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Footer Navigation within Detail */}
                <div className="mt-32 pt-12 border-t border-current border-opacity-10 flex justify-center">
                    <button 
                        onClick={onBack}
                        className="text-xs font-mono uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                    >
                        Back to Work
                    </button>
                </div>

            </div>
        </div>
    );
};