import * as React from 'react';
import { useState, useEffect } from 'react';

export const EventFormModal = ({ event, calendars, onClose, onSave }: { event?: any, calendars: any[], onClose: () => void, onSave: (data: any, calendarId: string) => Promise<void> }) => {
    const [title, setTitle] = useState(event?.summary || '');
    const [calendarId, setCalendarId] = useState(event?.calendarId || (calendars.length > 0 ? calendars[0].id : ''));
    const [isAllDay, setIsAllDay] = useState(!event || !event.start.dateTime);
    
    // Format for input type="datetime-local" is YYYY-MM-DDThh:mm
    // Format for input type="date" is YYYY-MM-DD
    const formatDateForInput = (date: Date, includeTime: boolean) => {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset*60*1000));
        return adjustedDate.toISOString().slice(0, includeTime ? 16 : 10);
    };

    const initialStart = event ? (event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date)) : new Date();
    const initialEnd = event ? (event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date)) : new Date(Date.now() + 3600000);

    const [startDate, setStartDate] = useState(formatDateForInput(initialStart, false));
    const [startTime, setStartTime] = useState(initialStart.toTimeString().slice(0, 5));
    const [endDate, setEndDate] = useState(formatDateForInput(initialEnd, false));
    const [endTime, setEndTime] = useState(initialEnd.toTimeString().slice(0, 5));

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        let startObj, endObj;
        if (isAllDay) {
            startObj = { date: startDate };
            // End date in all-day events is exclusive in Google Calendar
            const endD = new Date(endDate);
            endD.setDate(endD.getDate() + 1);
            endObj = { date: endD.toISOString().slice(0, 10) };
        } else {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            startObj = { dateTime: new Date(`${startDate}T${startTime}`).toISOString(), timeZone: tz };
            endObj = { dateTime: new Date(`${endDate}T${endTime}`).toISOString(), timeZone: tz };
        }

        const data = {
            summary: title,
            start: startObj,
            end: endObj
        };

        try {
            await onSave(data, calendarId);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to save event');
            setIsSaving(false);
        }
    };

    return (
        <div className="gcal-modal-overlay" onClick={onClose}>
            <div className="gcal-modal-content gcal-form-modal" onClick={e => e.stopPropagation()}>
                <button className="gcal-modal-close" onClick={onClose}>×</button>
                <h2>{event ? 'Edit Event' : 'New Event'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="gcal-form-group">
                        <label>Title</label>
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Add title" />
                    </div>
                    <div className="gcal-form-group">
                        <label>Calendar</label>
                        <select value={calendarId} onChange={e => setCalendarId(e.target.value)}>
                            {calendars.map(cal => (
                                <option key={cal.id} value={cal.id}>{cal.summary}</option>
                            ))}
                        </select>
                    </div>
                    <div className="gcal-form-group gcal-checkbox">
                        <label>
                            <input type="checkbox" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} />
                            All Day
                        </label>
                    </div>
                    <div className="gcal-form-group gcal-row">
                        <div className="gcal-col">
                            <label>Start Date</label>
                            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        {!isAllDay && (
                            <div className="gcal-col">
                                <label>Start Time</label>
                                <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} />
                            </div>
                        )}
                    </div>
                    <div className="gcal-form-group gcal-row">
                        <div className="gcal-col">
                            <label>End Date</label>
                            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        {!isAllDay && (
                            <div className="gcal-col">
                                <label>End Time</label>
                                <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} />
                            </div>
                        )}
                    </div>
                    <div className="gcal-modal-actions">
                        <button type="button" className="gcal-btn-edit" onClick={onClose}>Cancel</button>
                        <button type="submit" className="gcal-btn-save" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
