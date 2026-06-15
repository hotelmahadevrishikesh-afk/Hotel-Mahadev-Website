"use client"
import React, { useState, useEffect } from 'react';
import RoomInfo from './RoomInfo';
import RoomReview from './RoomReview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import QuantityManagement from './QuantityManagement';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Amenities from './Amenities';
import RoomPrice from './RoomPrice';

const EditRoom = ({ roomId }) => {
  const router = useRouter();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
//   console.log(roomData)
  useEffect(() => {
    if (roomId) {
      setLoading(true);
      fetch(`/api/room/${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(data => {
          setRoomData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } 
  }, [roomId]);

  const sectionConfig = [
    { key: 'info', label: 'Basic Info', component: (props) => <RoomInfo {...props} roomData={roomData} roomId={roomId} /> },
    { key: 'review', label: 'Create Review', component: (props) => <RoomReview {...props} roomData={roomData} roomId={roomId} /> },
    { key: 'quantity', label: 'Price', component: (props) => <RoomPrice {...props} roomData={roomData} roomId={roomId} /> },
    { key: 'amenities', label: 'Amenities', component: (props) => <Amenities {...props} roomData={roomData} roomId={roomId} /> },
  ];
  const [activeSection, setActiveSection] = useState(sectionConfig[0].key);


  return (
    <div style={{ minHeight: '85vh', background: '#fff', padding: '20px' }}>
      {loading ? (
        <div className="text-center text-lg font-semibold">Loading rooms...</div>
      ) : (
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full h-full">
          <div className="back mb-2">
            <button className='px-4 py-1 bg-gray-500 text-white rounded flex items-center' onClick={() => router.back()}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to View Rooms
            </button>
          </div>
          <div className="flex h-full">
            {/* Sidebar Tabs */}
            <TabsList className="flex flex-col gap-2 min-w-[220px] w-[220px] bg-gray-300 border-r border-gray-200 py-4 px-2 rounded-l-lg shadow-sm h-fit">
              {sectionConfig.map(section => (
                <TabsTrigger
                  key={section.key}
                  value={section.key}
                  className={
                    `text-base px-6 py-3 text-left rounded-lg transition-all font-medium
                    data-[state=active]:bg-blue-600 data-[state=active]:text-white
                    data-[state=inactive]:bg-blue-100 data-[state=inactive]:text-gray-900
                    hover:bg-blue-400 focus:outline-none w-full`
                  }
                  style={{ justifyContent: 'flex-start' }}
                >
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {/* Section Content */}
            <div className="flex-1 p-4 rounded-r-lg shadow-sm min-h-[400px]">
              {sectionConfig.map(section => (
                <TabsContent key={section.key} value={section.key} className="h-full">
                  {section.component({ roomData })}
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      )}
    </div>
  );
};

export default EditRoom;