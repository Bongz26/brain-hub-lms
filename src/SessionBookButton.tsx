import React from 'react';
import { supabase } from './lib/supabase';

interface Props {
  tutorId: string;
}

const SessionBookButton: React.FC<Props> = ({ tutorId }) => {
  const handleBooking = async () => {
    try {
      console.log('Booking for tutorId:', tutorId);
      const { error } = await supabase.rpc('increment_total_sessions', { tutor_id: tutorId });
      console.log('RPC Error:', error);
      if (error) throw error;
      alert('Session booked successfully!');
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Failed to book session. Please try again.');
    }
  };

  return (
    <button
      onClick={handleBooking}
      className="mt-2 block w-full text-center bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
    >
      Book Session
    </button>
  );
};

export default SessionBookButton;