import { useEffect, useState } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';

import { db } from '../firebase-config';

function App() {
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState({});
  const playersCollectionRef = collection(db, 'players');

  useEffect(() => {
    const getPlayers = async () => {
      const data = await getDocs(playersCollectionRef);
      setPlayers(
        data.docs.map(doc => ({ ...doc.data(), id: doc.id })),
        () => {
          console.log(this, players)
        }
        // setCurrentPlayer()
      );
    }
    
    getPlayers();
  }, []);

  const nextPlayer = () => {
    setCurrentPlayer(prev => {
      return players.filter((p, i) => players[i-1] === currentPlayer)[0];
    })
  }

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
        Currently Bidding for:
        {currentPlayer && (
          <div key={currentPlayer?.id}>
            {currentPlayer?.ign} - {currentPlayer?.name}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
