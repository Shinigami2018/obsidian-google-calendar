import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import type GoogleCalendarPlugin from './main';

export interface GoogleAccount {
    id: string;
    email: string;
    refreshToken: string;
}

export interface GoogleCalendarPluginSettings {
    clientId: string;
    clientSecret: string;
    accounts: GoogleAccount[];
}

export const DEFAULT_SETTINGS: GoogleCalendarPluginSettings = {
    clientId: '',
    clientSecret: '',
    accounts: []
}

export class GoogleCalendarSettingTab extends PluginSettingTab {
    plugin: GoogleCalendarPlugin;

    constructor(app: App, plugin: GoogleCalendarPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();

        containerEl.createEl('h2', {text: 'Google Calendar Dashboard Settings'});

        const instructions = containerEl.createEl('div');
        instructions.style.marginBottom = '20px';
        instructions.style.padding = '10px 15px';
        instructions.style.backgroundColor = 'var(--background-secondary)';
        instructions.style.borderRadius = '4px';
        
        instructions.createEl('span', {text: 'Need help finding your Client ID and Secret? '});
        const readmeLink = instructions.createEl('a', {
            text: 'Read the setup guide on GitHub',
            href: 'https://github.com/Shinigami2018/obsidian-google-calendar'
        });
        readmeLink.setAttr('target', '_blank');

        const starP = instructions.createEl('p');
        starP.style.marginTop = '10px';
        starP.style.color = 'var(--text-muted)';
        starP.style.fontSize = '0.9em';
        starP.innerText = '⭐ If you find this plugin helpful, it would greatly help me if you starred the project on GitHub!';

        new Setting(containerEl)
            .setName('Google Cloud Client ID')
            .setDesc('Your OAuth 2.0 Client ID for desktop applications.')
            .addText(text => text
                .setPlaceholder('Enter your client ID')
                .setValue(this.plugin.settings.clientId)
                .onChange(async (value) => {
                    this.plugin.settings.clientId = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Google Cloud Client Secret')
            .setDesc('Your OAuth 2.0 Client Secret.')
            .addText(text => text
                .setPlaceholder('Enter your client secret')
                .setValue(this.plugin.settings.clientSecret)
                .onChange(async (value) => {
                    this.plugin.settings.clientSecret = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', {text: 'Accounts'});

        if (this.plugin.settings.accounts.length === 0) {
            containerEl.createEl('p', {text: 'No accounts added yet.'});
        } else {
            this.plugin.settings.accounts.forEach((acc, index) => {
                new Setting(containerEl)
                    .setName(acc.email)
                    .setDesc('Authenticated Google Account')
                    .addButton(button => button
                        .setButtonText('Remove')
                        .setWarning()
                        .onClick(async () => {
                            this.plugin.settings.accounts.splice(index, 1);
                            await this.plugin.saveSettings();
                            this.display();
                        }));
            });
        }

        new Setting(containerEl)
            .setName('Add New Account')
            .setDesc('Authenticate a new Google account.')
            .addButton(button => button
                .setButtonText('Add Account')
                .setCta()
                .onClick(async () => {
                    if (!this.plugin.settings.clientId || !this.plugin.settings.clientSecret) {
                        new Notice('Please enter Client ID and Client Secret first.');
                        return;
                    }
                    button.setButtonText('Authenticating...');
                    try {
                        await this.plugin.authenticateNewAccount();
                    } catch (e: any) {
                        console.error(e);
                        new Notice('Failed to authenticate: ' + e.message);
                    }
                    this.display();
                }));
    }
}
