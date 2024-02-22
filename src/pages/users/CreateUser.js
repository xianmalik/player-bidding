import { useState } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';

import { db } from '../../firebase-config';

export default function CreateUser () {
  const [name, setName] = useState('');
  const [ign, setIgn] = useState('');
  const [rank, setRank] = useState('');
  const [isCaptain, setIsCaptain] = useState(false);

  const playersCollectionRef = collection(db, 'players');

  const createPlayer = async () => {
    await addDoc(playersCollectionRef, { ign, name, isCaptain, rank });
  }

  const handleSubmit = () => {
    try {
      createPlayer();
    } catch {
      console.log('error');
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        Player Bidding
      </header>
      <div>
        {name} / {ign} / {rank} / {`${isCaptain}`}
      </div>
      <div>
        <form onSubmit={() => handleSubmit()}>
          <input name="name" placeholder='Name' onChange={(e) => setName(e.target.value)} />
          <input name="ign" placeholder='IGN' onChange={(e) => setIgn(e.target.value)}  />
          <input name="rank" placeholder='Rank' onChange={(e) => setRank(e.target.value)}  />
          <input type="checkbox" name="isCaptain" onChange={(e) => setIsCaptain(e.target.checked)}  />
          <button type='submit'>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
