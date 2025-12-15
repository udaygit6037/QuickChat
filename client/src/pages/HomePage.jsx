// import React, { useState } from 'react';
// import Sidebar from '../components/Sidebar';
// import ChatContainer from '../components/ChatContainer.jsx';
// import RightSidebar from '../components/RightSidebar.jsx';
// import { messagesDummyData } from '../assets/assets.js';

// const HomePage = () => {
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState(messagesDummyData);

//   // Determine the column span class for the ChatContainer
//   // When selectedUser is NULL, the ChatContainer spans 2 columns (the chat area + the right sidebar area).
//   const chatContainerSpanClass = selectedUser ? '' : 'md:col-span-2';

//   return (
//     <div className="w-full h-screen sm:px-[5%] sm:py-[3%] bg-black/5">
//       <div
//         // Always define the 3-column grid structure at md and xl breakpoints.
//         className={`grid h-full rounded-2xl overflow-hidden border-2 border-gray-600 
//           md:grid-cols-[1fr_2fr_1fr] xl:grid-cols-[1fr_3fr_1fr]
//         `}
//       >
//         {/* Sidebar (Always takes the first column) */}
//         <Sidebar />

//         {/* Chat Container (Conditionally spans two columns) */}
//         <ChatContainer className={chatContainerSpanClass} />

//         {/* Right Sidebar (Conditionally rendered in the third column) */}
//         {selectedUser && <RightSidebar selectedUser={selectedUser} messages={messages} />}
//       </div>
//     </div>
//   );
// };

// export default HomePage;
// File 4: HomePage.jsx

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer.jsx';
import RightSidebar from '../components/RightSidebar.jsx';
import { messagesDummyData } from '../assets/assets.js';
// 👈 Import the useChat hook
import { useChat } from '../../context/ChatContext.jsx'; 


const HomePage = () => {
  // ❌ REMOVE: const [selectedUser, setSelectedUser] = useState(null);
  // ❌ REMOVE: const [messages, setMessages] = useState(messagesDummyData);

  // ✅ USE CONTEXT: Get selectedUser from the global state
  const { selectedUser, messages } = useChat(); 
   // Note: If messagesDummyData is only needed for the initial load of the context, 
   // you don't need the local [messages, setMessages] here. Assuming 'messages' 
   // comes from the context now.

  // Determine the column span class for the ChatContainer
  const chatContainerSpanClass = selectedUser ? '' : 'md:col-span-2';

  return (
    <div className="w-full h-screen sm:px-[5%] sm:py-[3%] bg-black/5">
      <div
        // Always define the 3-column grid structure at md and xl breakpoints.
        className={`grid h-full rounded-2xl overflow-hidden border-2 border-gray-600 
          md:grid-cols-[1fr_2fr_1fr] xl:grid-cols-[1fr_3fr_1fr]
        `}
      >
        {/* Sidebar (Always takes the first column) */}
        <Sidebar />

        {/* Chat Container (Conditionally spans two columns) */}
        {/* NOTE: ChatContainer doesn't need to be passed props since it uses context */}
        <ChatContainer className={chatContainerSpanClass} /> 

        {/* Right Sidebar (Conditionally rendered in the third column) */}
        {/* The condition now checks the context's selectedUser */}
        {selectedUser && <RightSidebar selectedUser={selectedUser} messages={messages} />}
      </div>
    </div>
  );
};

export default HomePage;