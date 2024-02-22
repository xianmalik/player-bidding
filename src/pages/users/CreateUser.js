import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';

import { Card, Input, Select, Avatar, SelectItem, Checkbox, Button, ScrollShadow  } from "@nextui-org/react";

import { db } from '../../firebase-config';
import { rankList, posList } from '../../utils/const';

export default function CreateUser () {
  const [name, setName] = useState('');
  const [ign, setIgn] = useState('');
  const [rank, setRank] = useState('');
  const [rankPeak, setRankPeak] = useState('');
  const [posPrimary, setPosPrimary] = useState('');
  const [posSecondary, setPosSecondary] = useState('');
  const [isCaptain, setIsCaptain] = useState(false);

  const createPlayer = async () => {
    await addDoc(
      collection(db, 'players'),
      { ign, name, isCaptain, rank, rankPeak, posPrimary, posSecondary }
    );
  }

  const handleSubmit = (e) => {
    try {
      createPlayer();
    } catch(err) {
      console.log('error', err);
    }
  }
  
  return (
    <div className="App">
      <header className="App-header">
        Player Bidding
      </header>
      <div>
        {name} / {ign} / {rank} / {rankPeak} / {posPrimary} / {posSecondary} / {`${isCaptain}`}
      </div>
      <div>
        <Card className="p-4 max-w-screen-sm mx-auto">
          <form onSubmit={(e) => {e.preventDefault(); handleSubmit()}} className="grid grid-cols-2 gap-3">
            <Input size="sm" type="text" placeholder="Name" value={name} onValueChange={setName} />
            <Input size="sm" type="text" placeholder="IGN" value={ign} onValueChange={setIgn} />
            <Select size="sm" placeholder="Rank" value={rank} onChange={(e) => setRank(e.target.value)} className="capitalize">
              {rankList.map(rank => (
                <SelectItem key={rank.value} startContent={(
                  <Avatar
                    alt={rank.value}
                    className="bg-transparent flex-shrink-0"
                    size="sm"
                    src={rank.img}
                  />
                )}>
                  {rank.name}
                </SelectItem>
              ))}
            </Select>
            <Select size="sm" placeholder="Peak Rank" value={rankPeak} onChange={(e) => setRankPeak(e.target.value)} className="capitalize">
               {rankList.map(rank => (
                 <SelectItem key={rank.value} startContent={(
                   <Avatar
                     alt={rank.value}
                     className="bg-transparent flex-shrink-0"
                     size="sm"
                     src={rank.img}
                   />
                 )}>
                  {rank.name}
                </SelectItem>
                ))}
            </Select>
            <Select size="sm" placeholder="Primary Position" value={posPrimary} onChange={(e) => setPosPrimary(e.target.value)} className="capitalize">
              {posList.map(pos => (
                <SelectItem key={pos.value} startContent={(
                  <Avatar
                    alt={pos.value}
                    className="bg-transparent flex-shrink-0"
                    size="sm"
                    src={pos.img}
                  />
                )}>
                  {pos.name}
                </SelectItem>
                ))}
            </Select>
            <Select size="sm" placeholder="Secondary Position" value={posSecondary} onChange={(e) => setPosSecondary(e.target.value)} className="capitalize">
              {posList.map(pos => (
                <SelectItem key={pos.value} startContent={(
                  <Avatar
                    alt={pos.value}
                    className="bg-transparent flex-shrink-0"
                    size="sm"
                    src={pos.img}
                  />
                )}>
                  {pos.name}
                </SelectItem>
                ))}
            </Select>
            <Checkbox name="isCaptain" value={isCaptain} onValueChange={setIsCaptain}>Is captain?</Checkbox>
            <Button type="submit" color="success" variant="shadow">Submit</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
