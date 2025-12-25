
interface GitHubConfig {
    token: string;
    owner: string;
    repo: string;
    branch?: string;
}

interface FileData {
    content: string;
    sha: string;
}

export class GitHubService {
    private baseUrl = 'https://api.github.com';
    private config: GitHubConfig;

    constructor(config: GitHubConfig) {
        this.config = { branch: 'main', ...config };
    }

    private get headers() {
        return {
            'Authorization': `token ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        };
    }

    async getFile(path: string): Promise<FileData> {
        const url = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`;
        
        const response = await fetch(url, { headers: this.headers });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
        }

        const data = await response.json();
        // GitHub API returns content in Base64
        const content = new TextDecoder().decode(Uint8Array.from(atob(data.content), c => c.charCodeAt(0)));
        
        return {
            content,
            sha: data.sha
        };
    }

    async updateFile(path: string, content: string, sha: string, message: string): Promise<void> {
        const url = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
        
        // Encode content to Base64 to handle UTF-8 characters correctly
        const encodedContent = btoa(unescape(encodeURIComponent(content)));

        const body = {
            message,
            content: encodedContent,
            sha,
            branch: this.config.branch
        };

        const response = await fetch(url, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to update ${path}: ${errorData.message}`);
        }
    }
}
