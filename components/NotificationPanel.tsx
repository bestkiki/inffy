import React, { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { User, Language, Notification, MainContent, NotificationType } from '../types';
import { translations } from '../translations';
import { BellIcon } from './icons/BellIcon';
import { CheckIcon } from './icons/CheckIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface NotificationPanelProps {
  user: User;
  language: Language;
  onClose: () => void;
  onNavigate: (content: MainContent) => void;
}

const formatRelativeTime = (timestamp: firebase.firestore.Timestamp, lang: Language) => {
    const now = new Date();
    const past = timestamp.toDate();
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return lang === 'ko' ? `${days}일 전` : `${days}d ago`;
    if (hours > 0) return lang === 'ko' ? `${hours}시간 전` : `${hours}h ago`;
    if (minutes > 0) return lang === 'ko' ? `${minutes}분 전` : `${minutes}m ago`;
    return lang === 'ko' ? '방금 전' : 'Just now';
};


const NotificationPanel: React.FC<NotificationPanelProps> = ({ user, language, onClose, onNavigate }) => {
  const t = translations[language];
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = db.collection('notifications')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(snapshot => {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notificationsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching notifications:", error);
        setIsLoading(false);
      });
      
    return () => unsubscribe();
  }, [user.uid]);
  
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await db.collection('notifications').doc(notification.id).update({ isRead: true });
    }
    onNavigate(notification.link);
    onClose();
  };
  
  const handleMarkAllAsRead = async () => {
      const unreadNotifs = notifications.filter(n => !n.isRead);
      if(unreadNotifs.length === 0) return;

      const batch = db.batch();
      unreadNotifs.forEach(notif => {
          const docRef = db.collection('notifications').doc(notif.id);
          batch.update(docRef, { isRead: true });
      });
      try {
          await batch.commit();
      } catch (error) {
          console.error("Error marking all notifications as read:", error);
      }
  };
  
  const getNotificationMessage = (notification: Notification) => {
    const messageFn = t[`notification_${notification.type}`];
    if (typeof messageFn === 'function') {
        const message = messageFn(notification.fromName);
        // A simple way to parse and render bold text
        const parts = message.split('**');
        return parts.map((part: string, index: number) => 
            index % 2 === 1 ? <strong key={index}>{part}</strong> : <span key={index}>{part}</span>
        );
    }
    return messageFn || notification.type;
  };
  
  const getNotificationIcon = (type: NotificationType) => {
      switch(type) {
          case NotificationType.PROPOSAL_RECEIVED:
          case NotificationType.COLLABORATION_REQUEST_RECEIVED:
              return <PaperAirplaneIcon className="w-5 h-5 text-brand-primary"/>
          case NotificationType.PROPOSAL_ACCEPTED:
          case NotificationType.REQUEST_ACCEPTED:
              return <CheckIcon className="w-5 h-5 text-green-500" />
          default:
              return <BellIcon className="w-5 h-5 text-slate-500" />
      }
  }

  const hasUnread = useMemo(() => notifications.some(n => !n.isRead), [notifications]);

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-full mt-4 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-30 border flex flex-col max-h-[70vh] animate-fade-in-down">
        <header className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-slate-800">{t.notificationsTitle}</h3>
          {hasUnread && (
            <button onClick={handleMarkAllAsRead} className="text-sm font-semibold text-brand-primary hover:underline">
              {t.markAllAsRead}
            </button>
          )}
        </header>

        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <BellIcon className="w-12 h-12 mx-auto text-slate-300" />
              <p className="mt-4 font-semibold text-slate-600">{t.noNotifications}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map(notification => (
                <li key={notification.id}>
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                        <div className="relative">
                            <img src={notification.fromAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.fromName)}&background=c4b5fd&color=4c1d95`} alt={notification.fromName} className="w-10 h-10 rounded-full object-cover" />
                             {!notification.isRead && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />}
                        </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 leading-snug">{getNotificationMessage(notification)}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(notification.createdAt, language)}</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;