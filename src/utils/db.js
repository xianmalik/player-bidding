import { collection, getDocs } from 'firebase/firestore';

import { db } from '../firebase-config';

const playersCollectionRef = collection(db, 'players');

const getPlayers = async () => {
    const data = await getDocs(playersCollectionRef);
    return data.docs.map(doc => ({ ...doc.data(), id: doc.id }))
}


export {
    getPlayers
}
