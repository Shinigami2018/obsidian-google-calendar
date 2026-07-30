import * as React from 'react';

export const EventModal = ({ event, onClose, onEdit, onDelete }: { event: any, onClose: () => void, onEdit: () => void, onDelete: () => void }) => {
    if (!event) return null;

    const startTime = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
    const endTime = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);
    const isAllDay = !event.start.dateTime;

    const formatDate = (date: Date) => date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="gcal-modal-overlay" onClick={onClose}>
            <div className="gcal-modal-content" onClick={e => e.stopPropagation()} style={{ borderTop: `4px solid ${event.calendarColor}` }}>
                <button className="gcal-modal-close" onClick={onClose}>×</button>
                <h2>{event.summary || '(No Title)'}</h2>
                <div className="gcal-modal-time">
                    {isAllDay ? (
                        <span>{formatDate(startTime)} (All Day)</span>
                    ) : (
                        <span>{formatDate(startTime)} {formatTime(startTime)} - {formatTime(endTime)}</span>
                    )}
                </div>
                {event.location && (
                    <div className="gcal-modal-location">
                        <strong>Location:</strong> {event.location}
                    </div>
                )}
                {event.description && (
                    <div className="gcal-modal-description" dangerouslySetInnerHTML={{ __html: event.description }} />
                )}
                <div className="gcal-modal-actions">
                    <button className="gcal-btn-edit" onClick={onEdit}>Edit</button>
                    <button className="gcal-btn-delete" onClick={onDelete}>Delete</button>
                </div>
            </div>
        </div>
    );
};
