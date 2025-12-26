"use server";

import { Buffer } from "buffer";
import { uploadToExternalRepo } from "../services/mediaStorage";

// Main App Config
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const APP_OWNER = process.env.GITHUB_OWNER;
const APP_REPO = process.env.GITHUB_REPO;
const APP_BRANCH = process.env.GITHUB_BRANCH || 'main';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// External Media Repo Config (Defaults to App config if not set, but cleaner to separate)
const MEDIA_OWNER = process.env.MEDIA_REPO_OWNER || APP_OWNER;
const MEDIA_REPO = process.env.MEDIA_REPO_NAME || APP_REPO;
const MEDIA_BRANCH = process.env.MEDIA_REPO_BRANCH || 'main';

const BASE_URL = 'https://api.github.com';

const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
};

// --- Authentication ---

export async function loginAdmin(password: string) {
    if (!ADMIN_PASSWORD) {
        throw new Error("ADMIN_PASSWORD not set in .env");
    }
    return password === ADMIN_PASSWORD;
}

// --- GitHub Operations (For Code/Data Files) ---

export async function getGitHubFile(path: string) {
    if (!GITHUB_TOKEN || !APP_OWNER || !APP_REPO) {
        throw new Error("GitHub Configuration missing in .env");
    }

    const url = `${BASE_URL}/repos/${APP_OWNER}/${APP_REPO}/contents/${path}?ref=${APP_BRANCH}`;
    
    try {
        const response = await fetch(url, { 
            headers,
            cache: 'no-store'
        });
        
        if (!response.ok) {
            console.error(`GitHub Fetch Error: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch ${path}`);
        }

        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        
        return {
            content,
            sha: data.sha
        };
    } catch (error: any) {
        console.error("Server Action Error:", error);
        throw new Error(error.message || "Failed to fetch file");
    }
}

export async function updateGitHubFile(path: string, content: string, sha: string, message: string) {
    if (!GITHUB_TOKEN || !APP_OWNER || !APP_REPO) {
        throw new Error("GitHub Configuration missing in .env");
    }

    const url = `${BASE_URL}/repos/${APP_OWNER}/${APP_REPO}/contents/${path}`;
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

    const body = {
        message,
        content: encodedContent,
        sha,
        branch: APP_BRANCH
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to update ${path}: ${errorData.message}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Update Error:", error);
        throw new Error(error.message || "Failed to update file");
    }
}

// --- Media Management (Targeting External Media Repo) ---

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) throw new Error("No file provided");

    try {
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Call the Modular Service
        // We can organize images by year or just put them in 'uploads'
        const cdnUrl = await uploadToExternalRepo(buffer, file.name, 'uploads');
        
        return { success: true, url: cdnUrl };

    } catch (error: any) {
        console.error("Upload Action Error:", error);
        throw new Error(error.message || "Failed to upload image");
    }
}

export async function getMediaFiles() {
    if (!GITHUB_TOKEN || !MEDIA_OWNER || !MEDIA_REPO) {
        throw new Error("Media Repository Configuration missing");
    }

    // List files from the 'uploads' folder in the MEDIA REPO
    const path = `uploads`;
    const url = `${BASE_URL}/repos/${MEDIA_OWNER}/${MEDIA_REPO}/contents/${path}?ref=${MEDIA_BRANCH}`;

    try {
        const response = await fetch(url, { headers, cache: 'no-store' });
        
        if (response.status === 404) {
            return []; // Folder doesn't exist yet
        }

        if (!response.ok) {
            throw new Error(`Failed to list media files from external repo`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
            return [];
        }

        // Map response to include the CDN URL
        return data.map((file: any) => ({
            name: file.name,
            path: file.path,
            sha: file.sha,
            // Construct jsDelivr URL for viewing
            url: `https://cdn.jsdelivr.net/gh/${MEDIA_OWNER}/${MEDIA_REPO}@${MEDIA_BRANCH}/${file.path}`
        }));

    } catch (error: any) {
        console.error("Get Media Error:", error);
        // Don't crash dashboard if media repo is empty or config is wrong, just return empty
        return [];
    }
}

export async function deleteImage(path: string) {
     if (!GITHUB_TOKEN || !MEDIA_OWNER || !MEDIA_REPO) {
        throw new Error("Media Repository Configuration missing");
    }

    // 1. Get SHA from Media Repo
    const getUrl = `${BASE_URL}/repos/${MEDIA_OWNER}/${MEDIA_REPO}/contents/${path}?ref=${MEDIA_BRANCH}`;
    let sha = '';
    
    try {
        const getRes = await fetch(getUrl, { headers, cache: 'no-store' });
        if (!getRes.ok) throw new Error("File not found");
        const data = await getRes.json();
        sha = data.sha;
    } catch (e) {
        throw new Error("Could not find file metadata for deletion");
    }

    // 2. Delete from Media Repo
    const deleteUrl = `${BASE_URL}/repos/${MEDIA_OWNER}/${MEDIA_REPO}/contents/${path}`;
    const body = {
        message: `Delete media: ${path.split('/').pop()}`,
        sha: sha,
        branch: MEDIA_BRANCH
    };

    try {
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message);
        }

        return { success: true };
    } catch (error: any) {
         console.error("Delete Error:", error);
         throw new Error(error.message || "Failed to delete file");
    }
}