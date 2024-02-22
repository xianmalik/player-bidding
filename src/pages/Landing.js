import { useEffect, useState } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';

import { db } from '../firebase-config';

function App() {
  const [players, setPlayers] = useState([]);
  const playersCollectionRef = collection(db, 'players');

  const createPlayer = async () => {
    await addDoc(playersCollectionRef, { ign: "", name: "", isCaptain: false, rank: "emerald" })
  }

  useEffect(() => {
    const getPlayers = async () => {
      const data = await getDocs(playersCollectionRef);
      setPlayers(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }

    getPlayers();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        Player Bidding
      </header>
      <div>
        {players.map(player => (
          <div key={player.id}>
            {player.ign} - {player.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
