import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, GoogleCalendarPluginSettings, GoogleCalendarSettingTab } from './settings';
import { DashboardView, VIEW_TYPE_CALENDAR } from './DashboardView';
import { authenticateAccount } from './auth';

export default class GoogleCalendarPlugin extends Plugin {
    settings!: GoogleCalendarPluginSettings;

    async onload() {
        await this.loadSettings();

        this.registerView(
            VIEW_TYPE_CALENDAR,
            (leaf) => new DashboardView(leaf, this)
        );

        this.addRibbonIcon('calendar-with-checkmark', 'Open Google Calendar', () => {
            this.activateView();
        });

        this.addCommand({
            id: 'open-google-calendar-dashboard',
            name: 'Open Calendar Dashboard',
            callback: () => {
                this.activateView();
            }
        });

        this.addSettingTab(new GoogleCalendarSettingTab(this.app, this));
    }

    onunload() {
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_CALENDAR);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            // Open in central pane as requested
            leaf = workspace.getLeaf('tab');
            await leaf.setViewState({ type: VIEW_TYPE_CALENDAR, active: true });
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async authenticateNewAccount() {
        const account = await authenticateAccount(this.settings.clientId, this.settings.clientSecret);
        const existingIndex = this.settings.accounts.findIndex(a => a.email === account.email);
        if (existingIndex >= 0) {
            this.settings.accounts[existingIndex] = account; // Update refresh token
        } else {
            this.settings.accounts.push(account);
        }
        await this.saveSettings();
    }
}
