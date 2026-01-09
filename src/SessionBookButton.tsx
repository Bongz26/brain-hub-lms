// SessionBookButton.tsx
import React from 'react';

interface Availability {
  id: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Props {
  tutorId: string;
  availability?: Availability[]; // Make optional if not always provided
}

const SessionBookButton: React.FC<Props> = ({ tutorId, availability }) => {
  // Example: Disable button if no availability
  const isAvailable = availability?.some(a => a.is_available) || false;

  return (
    <button
      className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
      disabled={!isAvailable}
    >
      Book Session
    </button>
  );
};

export default SessionBookButton;