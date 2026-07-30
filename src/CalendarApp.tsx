import * as React from 'react';
import { useEffect, useState } from 'react';
import type GoogleCalendarPlugin from './main';
import { GoogleCalendarAPI } from './api';
import { MonthView } from './MonthView';
import { EventModal } from './EventModal';
import { EventFormModal } from './EventFormModal';
import { Notice } from 'obsidian';

export const CalendarApp = ({ plugin }: { plugin: GoogleCalendarPlugin }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [calendars, setCalendars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [formEvent, setFormEvent] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            let allEvents: any[] = [];
            let allCals: any[] = [];
            
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const timeMin = new Date(year, month - 1, 20).toISOString(); // Fetch previous month buffer
            const timeMax = new Date(year, month + 1, 10).toISOString(); // Fetch next month buffer

            for (const account of plugin.settings.accounts) {
                const api = new GoogleCalendarAPI(
                    plugin.settings.clientId,
                    plugin.settings.clientSecret,
                    account.refreshToken
                );

                const cals = await api.getCalendars();
                for (const cal of cals) {
                    if (cal.accessRole === 'writer' || cal.accessRole === 'owner') {
                        allCals.push({ ...cal, accountId: account.id, accountEmail: account.email });
                    }
                    if (cal.selected) {
                        const calEvents = await api.getEvents(cal.id, timeMin, timeMax);
                        const coloredEvents = calEvents.map((e: any) => ({
                            ...e,
                            calendarColor: cal.backgroundColor,
                            calendarId: cal.id,
                            accountId: account.id
                        }));
                        allEvents = allEvents.concat(coloredEvents);
                    }
                }
            }
            
            allCals.sort((a, b) => {
                if (a.primary) return -1;
                if (b.primary) return 1;
                return 0;
            });
            
            setCalendars(allCals);
            setEvents(allEvents);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [plugin, currentMonth]);

    const handleSaveEvent = async (data: any, calendarId: string) => {
        const cal = calendars.find(c => c.id === calendarId);
        if (!cal) throw new Error("Calendar not found");
        
        const account = plugin.settings.accounts.find(a => a.id === cal.accountId);
        if (!account) throw new Error("Account not found");

        const api = new GoogleCalendarAPI(
            plugin.settings.clientId,
            plugin.settings.clientSecret,
            account.refreshToken
        );

        if (formEvent && formEvent.id) {
            const updated = await api.updateEvent(calendarId, formEvent.id, data);
            new Notice('Event updated successfully');
            setEvents(prev => prev.map(e => e.id === formEvent.id ? { ...updated, calendarColor: cal.backgroundColor, calendarId, accountId: account.id } : e));
        } else {
            const created = await api.createEvent(calendarId, data);
            new Notice('Event created successfully');
            setEvents(prev => [...prev, { ...created, calendarColor: cal.backgroundColor, calendarId, accountId: account.id }]);
        }
        
        // Refresh from server in background to ensure consistency
        setTimeout(() => fetchEvents(), 2000);
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;
        if (!confirm('Are you sure you want to delete this event?')) return;

        const account = plugin.settings.accounts.find(a => a.id === selectedEvent.accountId);
        if (!account) return;

        const api = new GoogleCalendarAPI(
            plugin.settings.clientId,
            plugin.settings.clientSecret,
            account.refreshToken
        );

        try {
            await api.deleteEvent(selectedEvent.calendarId, selectedEvent.id);
            new Notice('Event deleted');
            setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
            setSelectedEvent(null);
            
            // Refresh from server in background
            setTimeout(() => fetchEvents(), 2000);
        } catch (err: any) {
            new Notice('Failed to delete: ' + err.message);
        }
    };

    const changeMonth = (offset: number) => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + offset);
        setCurrentMonth(next);
    };

    return (
        <div className="gcal-app">
            <div className="gcal-toolbar">
                <button onClick={() => changeMonth(-1)}>← Prev</button>
                <h2>{currentMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}</h2>
                <div className="gcal-toolbar-right">
                    <button onClick={() => changeMonth(1)}>Next →</button>
                    <button className="gcal-btn-primary" onClick={() => { setFormEvent(null); setShowForm(true); }}>+ Add Event</button>
                </div>
            </div>
            
            {error && <div className="gcal-error">Error: {error}</div>}
            
            <div className={`gcal-content ${loading ? 'gcal-is-loading' : ''}`}>
                <MonthView 
                    currentMonth={currentMonth} 
                    events={events} 
                    onEventClick={e => setSelectedEvent(e)}
                    onDayClick={(date) => {
                        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        setFormEvent({ start: { date: dateString }, end: { date: dateString } });
                        setShowForm(true);
                    }}
                />
            </div>

            {selectedEvent && (
                <EventModal 
                    event={selectedEvent} 
                    onClose={() => setSelectedEvent(null)}
                    onEdit={() => {
                        setFormEvent(selectedEvent);
                        setSelectedEvent(null);
                        setShowForm(true);
                    }}
                    onDelete={handleDeleteEvent}
                />
            )}

            {showForm && (
                <EventFormModal 
                    event={formEvent}
                    calendars={calendars}
                    onClose={() => setShowForm(false)}
                    onSave={handleSaveEvent}
                />
            )}
        </div>
    );
};
