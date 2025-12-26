"use server";

import { Buffer } from "buffer";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main'; // Default to 'main' if not set
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const BASE_URL = 'https://api.github.com';

const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
};

// --- Authentication ---

export async function loginAdmin(password: string) {
    // Simple check against env variable
    if (!ADMIN_PASSWORD) {
        throw new Error("ADMIN_PASSWORD not set in .env");
    }
    return password === ADMIN_PASSWORD;
}

// --- GitHub Operations ---

export async function getGitHubFile(path: string) {
    if (!GITHUB_TOKEN || !OWNER || !REPO) {
        throw new Error("GitHub Configuration missing in .env");
    }

    // Append ref query param to fetch from specific branch
    const url = `${BASE_URL}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
    
    try {
        const response = await fetch(url, { 
            headers,
            cache: 'no-store' // Ensure we always fetch fresh data
        });
        
        if (!response.ok) {
            console.error(`GitHub Fetch Error: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch ${path}`);
        }

        const data = await response.json();
        // Decode Base64 content
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
    if (!GITHUB_TOKEN || !OWNER || !REPO) {
        throw new Error("GitHub Configuration missing in .env");
    }

    const url = `${BASE_URL}/repos/${OWNER}/${REPO}/contents/${path}`;
    
    // Encode content to Base64
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

    const body = {
        message,
        content: encodedContent,
        sha,
        branch: BRANCH // Use the configured branch
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

export async function uploadImage(formData: FormData) {
    if (!GITHUB_TOKEN || !OWNER || !REPO) {
        throw new Error("GitHub Configuration missing in .env");
    }

    const file = formData.get('file') as File;
    if (!file) throw new Error("No file provided");

    // Create a unique path: database/media/image/[timestamp]-[random]-[filename]
    // Sanitize filename and add random string to ensure uniqueness
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueId = Math.random().toString(36).substring(2, 9);
    const path = `database/media/image/${Date.now()}-${uniqueId}-${sanitizedFilename}`;
    
    // Convert file to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('base64');

    const url = `${BASE_URL}/repos/${OWNER}/${REPO}/contents/${path}`;
    
    const body = {
        message: `Upload image: ${sanitizedFilename}`,
        content: content,
        branch: BRANCH
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            // Try to parse error message safely
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Ignore json parse error
            }
            throw new Error(`GitHub Upload Failed (${response.status}): ${errorMessage}`);
        }

        // Return the Raw URL so it can be used in the app
        // Note: Raw URLs might have caching delays. 
        const publicUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
        
        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error("Upload Error:", error);
        throw new Error(error.message || "Failed to upload image");
    }
}

// --- Media Management ---

export async function getMediaFiles() {
    if (!GITHUB_TOKEN || !OWNER || !REPO) {
        throw new Error("GitHub Configuration missing in .env");
    }

    const path = `database/media/image`;
    const url = `${BASE_URL}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;

    try {
        const response = await fetch(url, { headers, cache: 'no-store' });
        
        if (response.status === 404) {
            return []; // No media folder yet
        }

        if (!response.ok) {
            throw new Error(`Failed to list media files`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
            return [];
        }

        // Map GitHub API response to useful format
        return data.map((file: any) => ({
            name: file.name,
            path: file.path,
            sha: file.sha,
            url: file.download_url || `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${file.path}`
        }));

    } catch (error: any) {
        console.error("Get Media Error:", error);
        throw new Error(error.message);
    }
}

export async function deleteImage(path: string) {
     if (!GITHUB_TOKEN || !OWNER || !REPO) {
        throw new Error("GitHub Configuration missing in .env");
    }

    // 1. Get the SHA of the file first (required for deletion)
    const getUrl = `${BASE_URL}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
    let sha = '';
    
    try {
        const getRes = await fetch(getUrl, { headers, cache: 'no-store' });
        if (!getRes.ok) throw new Error("File not found");
        const data = await getRes.json();
        sha = data.sha;
    } catch (e) {
        throw new Error("Could not find file metadata for deletion");
    }

    // 2. Delete the file
    const deleteUrl = `${BASE_URL}/repos/${OWNER}/${REPO}/contents/${path}`;
    const body = {
        message: `Delete media: ${path.split('/').pop()}`,
        sha: sha,
        branch: BRANCH
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