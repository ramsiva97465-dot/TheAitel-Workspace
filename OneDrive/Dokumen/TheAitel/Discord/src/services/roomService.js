import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Fetches all rooms from the "rooms" collection in Firestore.
 * @returns {Promise<Array>} Array of room objects { id, name, type }
 */
export const fetchRooms = async () => {
  try {
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
