import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Fetches all rooms from the "rooms" collection in Firestore.
 * Also ensures the 'general' room exists.
 * @returns {Promise<Array>} Array of room objects { id, name, type }
 */
export const fetchRooms = async () => {
  try {
    // 1. Ensure 'general' room exists first
    const generalRoomRef = doc(db, 'rooms', 'general');
    const generalRoomSnap = await getDoc(generalRoomRef);
    
    if (!generalRoomSnap.exists()) {
      await setDoc(generalRoomRef, {
        name: 'General Chat',
        type: 'public',
        createdAt: new Date()
      });
    }

    // 2. Fetch all rooms
    const roomsCollection = collection(db, 'rooms');
    const roomsSnapshot = await getDocs(roomsCollection);
    const roomsList = roomsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return roomsList;
  } catch (error) {
    console.error("Error fetching rooms: ", error);
    throw error;
  }
};
