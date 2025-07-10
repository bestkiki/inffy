import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { User, Language, ScheduleEvent as ScheduleEventType } from '../types';
import { translations } from '../translations';
import { PlusIcon } from './icons/PlusIcon';
import ScheduleEventModal from './ScheduleEventModal';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SchedulePageProps {
  user: User;
  language: Language;
}

const ScheduleItemCard: React.FC<{
    event: ScheduleEventType, 
    onEdit: (event: ScheduleEventType) => void,
    t: any,
    language: Language
}> = ({ event, onEdit, t, language }) => {

    const formatDate = () => {
        const date = new Date(event.start);
        const day = date.getDate();
        const month = date.toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US', { month: 'short' });
        const weekday = date.toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US', { weekday: 'short' });
        return { day, month, weekday };
    };

    const formatTime = () => {
        if (event.allDay) return t.allDayLabel;
        const startTime = new Date(event.start).toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        if (event.end) {
             const endTime = new Date(event.end).toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
             return `${startTime} - ${endTime}`;
        }
        return startTime;
    }
    
    const { day, month, weekday } = formatDate();

    return (
        <div className="bg-white rounded-xl shadow-md flex items-start p-4 gap-4 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex-shrink-0 text-center w-16">
                 <div className="text-sm font-semibold text-red-500">{weekday}</div>
                 <div className="text-3xl font-bold text-slate-800">{day}</div>
                 <div className="text-sm font-semibold text-slate-500">{month}</div>
            </div>
            <div className={`w-1 flex-shrink-0 h-auto self-stretch rounded-full`} style={{ backgroundColor: event.color }}></div>
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-slate-800">{event.title}</h4>
                <p className="text-sm text-slate-500 font-medium">{formatTime()}</p>
                {event.description && <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{event.description}</p>}
            </div>
            <div className="flex-shrink-0">
                <button onClick={() => onEdit(event)} className="p-2 text-slate-500 hover:text-brand-primary rounded-full transition-colors">
                    <PencilIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

const SchedulePage: React.FC<SchedulePageProps> = ({ user, language }) => {
  const t = translations[language];
  const [events, setEvents] = useState<ScheduleEventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEventType | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const unsubscribe = db.collection('scheduleEvents')
      .where('userId', '==', user.uid)
      .onSnapshot(snapshot => {
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ScheduleEventType[];
        setEvents(eventsData);
        setIsLoading(false);
      }, err => {
        console.error("Error fetching schedule events:", err);
        setError(t.eventLoadError);
        setIsLoading(false);
      });
    
    return () => unsubscribe();
  }, [user.uid, t.eventLoadError]);

  const handleModalSuccess = (message: string) => {
    setNotification({ type: 'success', message });
    setIsModalOpen(false);
    setSelectedEvent(null);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleEditEvent = (event: ScheduleEventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  
  const handleAddNewEvent = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm(t.confirmDeleteEvent)) return;
     try {
      await db.collection('scheduleEvents').doc(eventId).delete();
      handleModalSuccess(t.eventDeletedSuccess);
    } catch (err) {
      console.error("Error deleting event:", err);
      setNotification({ type: 'error', message: t.eventDeleteError });
      setTimeout(() => setNotification(null), 4000);
    }
  }

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    // Set time to 00:00:00 to compare dates correctly
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const upcoming = events
      .filter(e => new Date(e.start) >= today)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    const past = events
      .filter(e => new Date(e.start) < today)
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  const renderEmptyState = (title: string, description: string) => (
    <div className="text-center py-12 px-6 bg-slate-50 rounded-lg">
      <CalendarIcon className="w-16 h-16 mx-auto text-slate-300" />
      <h3 className="mt-4 text-xl font-bold text-slate-700">{title}</h3>
      <p className="mt-2 text-slate-500">{description}</p>
    </div>
  );

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
        <header className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800">{t.scheduleManagement}</h2>
          <button
            onClick={handleAddNewEvent}
            className="flex items-center gap-2 py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t.addNewEvent}</span>
          </button>
        </header>

        {notification && (
          <div className={`p-4 rounded-lg flex items-center ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.type === 'success' ? <CheckIcon className="w-6 h-6 mr-3"/> : <XCircleIcon className="w-6 h-6 mr-3"/>}
            <span className="font-semibold">{notification.message}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
          </div>
        ) : error ? (
           <div className="text-center py-20 bg-white rounded-2xl">
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-400" />
            <h3 className="mt-4 text-2xl font-bold text-slate-800">{t.error}</h3>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-700 mb-4">{t.upcomingEvents}</h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <ScheduleItemCard key={event.id} event={event} onEdit={handleEditEvent} t={t} language={language}/>
                  ))}
                </div>
              ) : (
                renderEmptyState(t.noUpcomingEvents, t.noUpcomingEventsDesc)
              )}
            </div>

            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-700">{t.pastEvents}</h3>
                    <button onClick={() => setShowPast(!showPast)} className="text-sm font-semibold text-brand-primary hover:underline">
                        {showPast ? t.hidePastEvents : t.showPastEvents}
                    </button>
                </div>
              {showPast && (
                pastEvents.length > 0 ? (
                  <div className="space-y-3 animate-fade-in">
                    {pastEvents.map(event => (
                       <ScheduleItemCard key={event.id} event={event} onEdit={handleEditEvent} t={t} language={language}/>
                    ))}
                  </div>
                ) : (
                  renderEmptyState(t.noPastEvents, "")
                )
              )}
            </div>
          </div>
        )}
      </div>

      <ScheduleEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
        user={user}
        eventToEdit={selectedEvent}
        selectedDate={null} // Pass null as we handle date inside the component now
        onSuccess={handleModalSuccess}
        onDelete={handleDeleteEvent}
      />
    </>
  );
};

export default SchedulePage;