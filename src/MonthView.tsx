import * as React from 'react';

export const MonthView = ({ currentMonth, events, onEventClick, onDayClick }: { currentMonth: Date, events: any[], onEventClick: (event: any) => void, onDayClick: (date: Date) => void }) => {
    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const days = [];
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(new Date(year, month, -firstDay.getDay() + i + 1));
        }
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push(new Date(year, month + 1, i));
        }
        return days;
    };

    const days = getDaysInMonth();
    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <div className="gcal-month-grid">
            <div className="gcal-month-header-row">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="gcal-month-header-cell">{day}</div>
                ))}
            </div>
            <div className="gcal-month-body">
                {days.map((day, i) => {
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isToday = day.getTime() === today.getTime();
                    
                    const dayStart = new Date(day);
                    dayStart.setHours(0,0,0,0);
                    const dayEnd = new Date(day);
                    dayEnd.setHours(23,59,59,999);

                    const dayEvents = events.filter(e => {
                        const eStart = new Date(e.start.dateTime || e.start.date);
                        let eEnd = new Date(e.end.dateTime || e.end.date);
                        // For all-day events, the end date is exclusive, so subtract 1 ms to prevent overlapping into the next day unnecessarily
                        if (!e.end.dateTime) {
                            eEnd = new Date(eEnd.getTime() - 1);
                        }
                        return eStart <= dayEnd && eEnd >= dayStart;
                    });

                    dayEvents.sort((a, b) => new Date(a.start.dateTime || a.start.date).getTime() - new Date(b.start.dateTime || b.start.date).getTime());

                    return (
                        <div key={i} className={`gcal-month-cell ${isCurrentMonth ? '' : 'gcal-other-month'} ${isToday ? 'gcal-today' : ''}`} onClick={() => onDayClick(day)}>
                            <div className="gcal-month-cell-header">
                                <span className="gcal-day-number">{day.getDate()}</span>
                            </div>
                            <div className="gcal-month-cell-events">
                                {dayEvents.map((e, index) => {
                                    const isAllDay = !e.start.dateTime;
                                    return (
                                        <div key={`${e.id}-${index}`} className={`gcal-event-pill ${isAllDay ? 'gcal-all-day' : ''}`} style={{ backgroundColor: e.calendarColor || 'var(--interactive-accent)' }} onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}>
                                            {!isAllDay && <span className="gcal-event-pill-time">{new Date(e.start.dateTime).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</span>}
                                            <span className="gcal-event-pill-title">{e.summary || '(No Title)'}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
