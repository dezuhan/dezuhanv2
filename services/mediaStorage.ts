import { Buffer } from "buffer";

// Configuration for the External Media Repository
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MEDIA_OWNER = process.env.MEDIA_REPO_OWNER;
const MEDIA_REPO = process.env.MEDIA_REPO_NAME;
const MEDIA_BRANCH = process.env.MEDIA_REPO_BRANCH || 'main';

const BASE_API_URL = 'https://api.github.com';

/**
 * Uploads a file to a dedicated GitHub Media Repository and returns a jsDelivr CDN URL.
 * 
 * @param fileBuffer - The buffer of the file to upload
 * @param originalFilename - The original name of the file
 * @param folder - Optional folder path inside the repo (default: 'uploads')
 * @returns Promise<string> - The jsDelivr CDN URL
 */
export async function uploadToExternalRepo(
    fileBuffer: Buffer, 
    originalFilename: string, 
    folder: string = 'uploads'
): Promise<string> {
    
    // 1. Validation
    if (!GITHUB_TOKEN || !MEDIA_OWNER || !MEDIA_REPO) {
        throw new Error("Media Repository Configuration is missing (MEDIA_REPO_OWNER, MEDIA_REPO_NAME)");
    }

    // 2. Prepare Path & Content
    // Sanitize filename: remove spaces/special chars to avoid URL issues
    const sanitizedParams = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Generate unique ID to prevent overwrites
    const uniqueId = Date.now().toString(36);
    const path = `${folder}/${uniqueId}-${sanitizedParams}`;
    
    // GitHub API requires content to be Base64 encoded
    const contentBase64 = fileBuffer.toString('base64');

    // 3. Construct GitHub API URL
    const apiUrl = `${BASE_API_URL}/repos/${MEDIA_OWNER}/${MEDIA_REPO}/contents/${path}`;

    // 4. Perform Upload (PUT Request)
    const body = {
        message: `Upload media: ${originalFilename}`,
        content: contentBase64,
        branch: MEDIA_BRANCH
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) { /* ignore */ }
            
            throw new Error(`GitHub Media Upload Failed (${response.status}): ${errorMessage}`);
        }

        // 5. Return jsDelivr CDN URL
        // Format: https://cdn.jsdelivr.net/gh/user/repo@version/file
        const cdnUrl = `https://cdn.jsdelivr.net/gh/${MEDIA_OWNER}/${MEDIA_REPO}@${MEDIA_BRANCH}/${path}`;
        
        return cdnUrl;

    } catch (error: any) {
        console.error("External Media Upload Error:", error);
        throw new Error(error.message || "Failed to upload image to external storage");
    }
}
