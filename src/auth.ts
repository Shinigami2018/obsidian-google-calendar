import * as http from 'http';
import { requestUrl, Notice } from 'obsidian';
import type { GoogleAccount } from './settings';

const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email';

export async function authenticateAccount(clientId: string, clientSecret: string): Promise<GoogleAccount> {
    return new Promise((resolve, reject) => {
        const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
            try {
                const url = new URL(req.url || '', `http://${req.headers.host}`);
                if (url.pathname === '/callback') {
                    const code = url.searchParams.get('code');
                    if (!code) throw new Error('No authorization code found');

                    const tokenResponse = await requestUrl({
                        url: 'https://oauth2.googleapis.com/token',
                        method: 'POST',
                        contentType: 'application/x-www-form-urlencoded',
                        body: new URLSearchParams({
                            code,
                            client_id: clientId,
                            client_secret: clientSecret,
                            redirect_uri: REDIRECT_URI,
                            grant_type: 'authorization_code'
                        }).toString()
                    });

                    if (tokenResponse.status !== 200) {
                        throw new Error(`Failed to exchange token: ${tokenResponse.text}`);
                    }

                    const tokens = tokenResponse.json;
                    
                    const userInfoResponse = await requestUrl({
                        url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
                        headers: {
                            Authorization: `Bearer ${tokens.access_token}`
                        }
                    });

                    if (userInfoResponse.status !== 200) {
                        throw new Error(`Failed to get user info: ${userInfoResponse.text}`);
                    }

                    const userInfo = userInfoResponse.json;

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end('<h1>Authentication Successful!</h1><p>You can close this window and return to Obsidian.</p>');
                    
                    server.close();
                    
                    resolve({
                        id: userInfo.id,
                        email: userInfo.email,
                        refreshToken: tokens.refresh_token
                    });
                }
            } catch (e: any) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`<h1>Authentication Failed</h1><p>${e.message}</p>`);
                server.close();
                reject(e);
            }
        });

        server.listen(3000, () => {
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPE)}&access_type=offline&prompt=consent`;
            window.open(authUrl);
        });

        setTimeout(() => {
            server.close();
            reject(new Error('Authentication timed out.'));
        }, 120000);
    });
}
