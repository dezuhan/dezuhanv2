"use server";

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