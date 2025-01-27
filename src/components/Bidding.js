// 'use client'
// import React, { useEffect, useState } from 'react';
// import { User, Card, Skeleton, Button, ButtonGroup, Slider, Divider } from "@nextui-org/react";

// import { addDoc, collection, getDocs } from 'firebase/firestore';


// import { getPlayers } from '../utils/db';

// function App() {
//   const [players, setPlayers] = useState([]);
//   const [currentPlayer, setCurrentPlayer] = useState({});
//   const [currentBid, setCurrentBid] = useState(10);
//   const [bidValue, setBidValue] = useState(10);

//   const handleBid = (value) => {
//     if (isNaN(Number(value))) return;
//     setBidValue(value);
//   };
  

//   useEffect(() => {
//     try {
//       getPlayers().then(data => {
//         setPlayers(data);
//         setCurrentPlayer(data[0]);
//       });
//     } catch {}
//   }, []);

//   const nextPlayer = () => {
//     setCurrentPlayer(players.filter((p, i) => players[i-1] === currentPlayer)[0]);
//   }

//   return (
//     <div className="min-h-screen py-10 text-center -mt-4">
//       <div className="grid grid-cols-3">
//         <div className="">
//           <User   
//             name="Delusional"
//             description="TOP / MID"
//             avatarProps={{
//               src: "https://i.pravatar.cc/150?u=a04258114e29026702d"
//             }}
//           />
//         </div>
//         {currentPlayer ? (
//           <Card className="px-12 py-6">
//             <h2 className="text-xl font-bold mb-2">Currently Bidding for: {currentPlayer?.ign}</h2>
//             <div className="mb-4">
//               Current Bid: {currentBid}
//             </div>
//             <ButtonGroup className="mb-6">
//               <Button color="success" variant="shadow" onClick={() => handleBid(currentBid + 10)}>+10</Button>
//               <Divider orientation="vertical" />
//               <Button color="success" variant="shadow" onClick={() => handleBid(currentBid + 50)}>+50</Button>
//               <Divider orientation="vertical" />
//               <Button color="success" variant="shadow" onClick={() => handleBid(currentBid + 100)}>+100</Button>
//             </ButtonGroup>
//             <div className="flex gap-5">
//               <Slider   
//                 label="Select a Bid Value" 
//                 showTooltip={true}
//                 size="sm"
//                 step={10} 
//                 maxValue={1000} 
//                 minValue={currentBid}
//                 aria-label="Bid Value"
//                 color={"success"}
//                 defaultValue={currentBid + 10}
//                 value={bidValue}
//                 onChange={(val) => handleBid(val)}
//                 className="max-w-md"
//                 renderValue={({children, ...props}) => (
//                   <output {...props}>
//                     <input
//                       className="px-0.5 py-1 w-14 text-right text-small font-medium bg-default-100 outline-none transition-colors rounded-small border-medium border-transparent hover:border-primary focus:border-primary"
//                       type="number"
//                       aria-label="Temperature value"
//                       value={bidValue}
//                       onChange={() => handleBid(bidValue)}
//                     />
//                   </output>
//                   )}
//               />
//               <Button size={"lg"} color="success" variant="shadow" onClick={() => handleBid(bidValue)}>SUBMIT</Button>
//             </div>
//             <div className="mt-4 text-xl">
//               You're bidding for: {bidValue}
//             </div>
//           </Card>
//           ) : (
//             <Card className="w-[200px] space-y-5 p-4" radius="lg">
//               <Skeleton className="rounded-lg">
//                 <div className="h-24 rounded-lg bg-default-300"></div>
//               </Skeleton>
//               <div className="space-y-3">
//                 <Skeleton className="w-3/5 rounded-lg">
//                   <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
//                 </Skeleton>
//                 <Skeleton className="w-4/5 rounded-lg">
//                   <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
//                 </Skeleton>
//                 <Skeleton className="w-2/5 rounded-lg">  
//                   <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
//                 </Skeleton>
//               </div>
//             </Card>
//           )}
//       </div>
      
//     </div>
//   );
// }

// export default App;
