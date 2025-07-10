import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { Language, User, ScheduleEvent, UserType } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ScheduleEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: User;
  eventToEdit: ScheduleEvent | null;
  selectedDate: string | null;
  onSuccess: (message: string) => void;
  onDelete: (eventId: string) => void;
}

const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({ isOpen, onClose, language, user, eventToEdit, selectedDate, onSuccess, onDelete }) => {
  const t = translations[language];

  const initialState = {
    title: '',
    startDate: selectedDate || new Date().toISOString().split('T')[0],
    endDate: '',
    allDay: true,
    description: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (eventToEdit) {
            setFormData({
                title: eventToEdit.title,
                startDate: eventToEdit.start.split('T')[0],
                endDate: eventToEdit.end ? eventToEdit.end.split('T')[0] : '',
                allDay: eventToEdit.allDay,
                description: eventToEdit.description || '',
            });
        } else {
            setFormData(initialState);
        }
    }
  }, [eventToEdit, selectedDate, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox';
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setError("Title is required.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const eventData = {
      userId: user.uid,
      title: formData.title,
      start: formData.startDate,
      end: formData.endDate || null,
      allDay: formData.allDay,
      description: formData.description,
      color: user.type === UserType.COMPANY ? '#6d28d9' : '#8b5cf6',
      createdAt: eventToEdit?.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      if (eventToEdit) {
        await db.collection('scheduleEvents').doc(eventToEdit.id).update(eventData);
        onSuccess(t.eventSavedSuccess);
      } else {
        await db.collection('scheduleEvents').add(eventData);
        onSuccess(t.eventSavedSuccess);
      }
    } catch (err) {
      console.error("Error saving event:", err);
      setError(t.eventSaveError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
      if(eventToEdit) {
        onDelete(eventToEdit.id);
      }
  }


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">{eventToEdit ? t.editEvent : t.addNewEvent}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 space-y-4 overflow-y-auto">
          {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">{t.eventTitleLabel}</label>
            <input id="title" name="title" type="text" value={formData.title} onChange={handleInputChange} placeholder={t.eventTitlePlaceholder} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">{t.startDateLabel}</label>
              <input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" />
            </div>
             <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">{t.endDateLabel}</label>
              <input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" />
            </div>
          </div>
          
          <div className="flex items-center">
            <input id="allDay" name="allDay" type="checkbox" checked={formData.allDay} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-secondary" />
            <label htmlFor="allDay" className="ml-2 block text-sm text-slate-900">{t.allDayLabel}</label>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">{t.eventDescriptionLabel}</label>
            <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleInputChange} placeholder={t.eventDescriptionPlaceholder} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"></textarea>
          </div>
        </div>

        <footer className="p-6 border-t bg-slate-50 rounded-b-2xl mt-auto flex justify-between items-center">
          <div>
            {eventToEdit && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="p-2 text-slate-500 hover:text-red-500 rounded-full transition-colors disabled:text-slate-300"
                aria-label={t.deleteEvent}
              >
                <TrashIcon className="w-6 h-6" />
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-6 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
            >
              {t.cancel}
            </button>
            <button type="submit" disabled={isLoading} className="w-28 flex justify-center py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:bg-slate-400">
              {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t.saveChanges}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
};

export default ScheduleEventModal;