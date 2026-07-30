import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { CalendarApp } from './CalendarApp';
import type GoogleCalendarPlugin from './main';

export const VIEW_TYPE_CALENDAR = 'google-calendar-dashboard';

export class DashboardView extends ItemView {
    plugin: GoogleCalendarPlugin;
    root: Root | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: GoogleCalendarPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE_CALENDAR;
    }

    getDisplayText() {
        return 'Calendar Dashboard';
    }

    async onOpen() {
        const container = this.contentEl;
        container.empty();
        
        const wrapper = container.createDiv('gcal-dashboard-wrapper');
        this.root = createRoot(wrapper);
        this.root.render(React.createElement(CalendarApp, { plugin: this.plugin }));
    }

    async onClose() {
        if (this.root) {
            this.root.unmount();
        }
    }
}
