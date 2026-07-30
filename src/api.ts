import { requestUrl } from 'obsidian';

export class GoogleCalendarAPI {
    private clientId: string;
    private clientSecret: string;
    private refreshToken: string;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor(clientId: string, clientSecret: string, refreshToken: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
    }

    private async ensureAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return;
        }

        const response = await requestUrl({
            url: 'https://oauth2.googleapis.com/token',
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: this.refreshToken,
                grant_type: 'refresh_token'
            }).toString()
        });

        if (response.status !== 200) {
            throw new Error(`Failed to refresh token: ${response.text}`);
        }

        const data = response.json;
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
    }

    private async fetchApi(path: string, params: Record<string, string> = {}, options: { method?: string; body?: string; contentType?: string } = {}) {
        await this.ensureAccessToken();
        
        const url = new URL(`https://www.googleapis.com/calendar/v3${path}`);
        Object.entries(params).forEach(([k, v]: [string, string]) => url.searchParams.append(k, v));

        const requestParams: any = {
            url: url.toString(),
            method: options.method || 'GET',
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            }
        };

        if (options.body) {
            requestParams.body = options.body;
        }
        if (options.contentType) {
            requestParams.contentType = options.contentType;
        }

        const response = await requestUrl(requestParams);

        if (response.status >= 300) {
            throw new Error(`API error: ${response.text}`);
        }

        return response.text ? response.json : null;
    }

    async getCalendars() {
        const data = await this.fetchApi('/users/me/calendarList');
        return data.items;
    }

    async getEvents(calendarId: string, timeMin: string, timeMax: string) {
        const data = await this.fetchApi(`/calendars/${encodeURIComponent(calendarId)}/events`, {
            timeMin,
            timeMax,
            singleEvents: 'true',
            orderBy: 'startTime'
        });
        return data.items;
    }

    async createEvent(calendarId: string, eventData: any) {
        return await this.fetchApi(`/calendars/${encodeURIComponent(calendarId)}/events`, {}, {
            method: 'POST',
            body: JSON.stringify(eventData),
            contentType: 'application/json'
        });
    }

    async updateEvent(calendarId: string, eventId: string, eventData: any) {
        return await this.fetchApi(`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {}, {
            method: 'PUT',
            body: JSON.stringify(eventData),
            contentType: 'application/json'
        });
    }

    async deleteEvent(calendarId: string, eventId: string) {
        return await this.fetchApi(`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {}, {
            method: 'DELETE'
        });
    }
}
