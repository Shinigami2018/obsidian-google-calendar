import * as React from 'react';

const getContrastColor = (hexcolor: string) => {
    if (!hexcolor) return '#ffffff';
    let hex = hexcolor.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    if (hex.length !== 6) return '#ffffff';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000000' : '#ffffff';
};

export const MonthView = ({ currentMonth, events, onEventClick, onDayClick }: {  currentMonth: Date, events: any[], onEventClick: (event: any) => void, onDayClick: (date: Date) => void }) => {
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
                    const nextDay = new Date(day);
                    nextDay.setDate(nextDay.getDate() + 1);
                    nextDay.setHours(0,0,0,0);

                    const dayEvents = events.filter(e => {
                        let eStart, eEnd;
                        if (e.start.dateTime) {
                            eStart = new Date(e.start.dateTime);
                            eEnd = new Date(e.end.dateTime);
                        } else {
                            const [sYear, sMonth, sDay] = e.start.date.split('-').map(Number);
                            eStart = new Date(sYear, sMonth - 1, sDay);
                            
                            const [eYear, eMonth, eDay] = e.end.date.split('-').map(Number);
                            eEnd = new Date(eYear, eMonth - 1, eDay);
                        }
                        
                        const overlaps = eStart < nextDay && eEnd > dayStart;
                        const isZeroDuration = eStart.getTime() === eEnd.getTime();
                        const fallsOnDay = eStart >= dayStart && eStart < nextDay;

                        return overlaps || (isZeroDuration && fallsOnDay);
                    });

                    dayEvents.sort((a, b) => {
                        const isAllDayA = !a.start.dateTime;
                        const isAllDayB = !b.start.dateTime;
                        if (isAllDayA && !isAllDayB) return -1;
                        if (!isAllDayA && isAllDayB) return 1;
                        
                        const timeA = new Date(a.start.dateTime || a.start.date).getTime();
                        const timeB = new Date(b.start.dateTime || b.start.date).getTime();
                        return timeA - timeB;
                    });

                    return (
                        <div key={i} className={`gcal-month-cell ${isCurrentMonth ? '' : 'gcal-other-month'} ${isToday ? 'gcal-today' : ''}`} onClick={() => onDayClick(day)}>
                            <div className="gcal-month-cell-header">
                                <span className="gcal-day-number">{day.getDate()}</span>
                            </div>
                            <div className="gcal-month-cell-events">
                                {dayEvents.map((e, index) => {
                                    const isAllDay = !e.start.dateTime;
                                    return (
                                        <div key={`${e.id}-${index}`} className={`gcal-event-pill ${isAllDay ? 'gcal-all-day' : ''}`} style={{ backgroundColor: e.calendarColor || 'var(--interactive-accent)', color: getContrastColor(e.calendarColor || '') }} onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}>
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
