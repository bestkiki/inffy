import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { NotificationType, MainContent } from '../types';

export const createNotification = async (
    userId: string,
    type: NotificationType,
    fromName: string,
    fromAvatarUrl: string = '',
    link: MainContent,
    relatedId: string
) => {
    try {
        await db.collection('notifications').add({
            userId,
            type,
            fromName,
            fromAvatarUrl,
            link,
            relatedId,
            isRead: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};
