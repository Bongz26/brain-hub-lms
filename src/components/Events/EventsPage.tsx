import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Layout } from '../Layout/Layout';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'sports' | 'academic' | 'social' | 'announcement';
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  isRegistered: boolean;
  image?: string;
}

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [user, filter]);

  const loadEvents = async () => {
    if (!user) return;

    // Generate dates for 2025
    const today = new Date('2025-10-01'); // October 1, 2025 for demo
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const twoWeeks = new Date(today);
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Mock events for demonstration - 2025 with upcoming events
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Digital Learning Workshop',
        description: 'Learn about the latest educational technology tools and platforms. Perfect for students and parents wanting to maximize online learning!',
        type: 'academic',
        date: tomorrow.toISOString().split('T')[0],
        time: '02:00 PM',
        location: 'Brain Hub LMS Virtual Classroom',
        organizer: 'Brain Hub LMS Team',
        attendees: 45,
        maxAttendees: 100,
        isRegistered: false,
        image: 'https://via.placeholder.com/400x200?text=Digital+Workshop'
      },
      {
        id: '2',
        title: 'School Sports Day',
        description: 'Annual sports competition featuring various athletic events. All students are encouraged to participate!',
        type: 'sports',
        date: nextWeek.toISOString().split('T')[0],
        time: '08:00 AM',
        location: 'QwaQwa Stadium, Phuthaditjhaba',
        organizer: 'Physical Education Department',
        attendees: 145,
        maxAttendees: 200,
        isRegistered: true,
        image: 'https://via.placeholder.com/400x200?text=Sports+Day'
      },
      {
        id: '3',
        title: 'Parent-Teacher Conference',
        description: 'Quarterly meeting to discuss student progress, challenges, and upcoming term plans. Individual sessions available.',
        type: 'announcement',
        date: nextWeek.toISOString().split('T')[0],
        time: '02:00 PM',
        location: 'Phuthaditjhaba High School',
        organizer: 'School Administration',
        attendees: 112,
        maxAttendees: 150,
        isRegistered: false
      },
      {
        id: '4',
        title: 'Science Fair 2025',
        description: 'Students showcase their innovative science projects and experiments. Awards for best projects in each category!',
        type: 'academic',
        date: twoWeeks.toISOString().split('T')[0],
        time: '10:00 AM',
        location: 'Community Hall, Phuthaditjhaba',
        organizer: 'Science Department',
        attendees: 89,
        maxAttendees: 150,
        isRegistered: false,
        image: 'https://via.placeholder.com/400x200?text=Science+Fair'
      },
      {
        id: '5',
        title: 'Mathematics Olympiad',
        description: 'Inter-school mathematics competition for grades 8-12. Test your problem-solving skills!',
        type: 'academic',
        date: twoWeeks.toISOString().split('T')[0],
        time: '09:00 AM',
        location: 'Thabo Mofutsanyana Hall, QwaQwa',
        organizer: 'Mathematics Department',
        attendees: 45,
        maxAttendees: 100,
        isRegistered: true,
        image: 'https://via.placeholder.com/400x200?text=Math+Olympiad'
      },
      {
        id: '6',
        title: 'Career Guidance Day',
        description: 'Meet professionals from various industries and learn about career opportunities. Perfect for grade 11 & 12 students!',
        type: 'social',
        date: nextMonth.toISOString().split('T')[0],
        time: '09:00 AM',
        location: 'Harrismith Community Center',
        organizer: 'Student Career Services',
        attendees: 67,
        maxAttendees: 120,
        isRegistered: false,
        image: 'https://via.placeholder.com/400x200?text=Career+Day'
      },
      {
        id: '7',
        title: 'Cultural Heritage Day',
        description: 'Celebrate diversity with traditional performances, food, and cultural displays from the Free State region.',
        type: 'social',
        date: nextMonth.toISOString().split('T')[0],
        time: '11:00 AM',
        location: 'QwaQwa Community Center',
        organizer: 'Student Council',
        attendees: 178,
        maxAttendees: 250,
        isRegistered: false,
        image: 'https://via.placeholder.com/400x200?text=Cultural+Day'
      },
      {
        id: '8',
        title: 'End of Year Celebration',
        description: 'Annual awards ceremony and year-end celebration. All achievements will be recognized!',
        type: 'social',
        date: '2025-12-15',
        time: '05:00 PM',
        location: 'Phuthaditjhaba High School Auditorium',
        organizer: 'School Administration',
        attendees: 234,
        maxAttendees: 300,
        isRegistered: true,
        image: 'https://via.placeholder.com/400x200?text=Celebration'
      }
    ];

    setEvents(mockEvents);
    setLoading(false);
  };

  const handleRegister = async (eventId: string) => {
    // In a real app, this would call the API
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, isRegistered: !event.isRegistered, attendees: event.isRegistered ? event.attendees - 1 : event.attendees + 1 }
          : event
      )
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'sports':
        return 'bg-green-100 text-green-800';
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'social':
        return 'bg-purple-100 text-purple-800';
      case 'announcement':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'sports':
        return '⚽';
      case 'academic':
        return '📚';
      case 'social':
        return '🎉';
      case 'announcement':
        return '📢';
      default:
        return '📅';
    }
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    
    if (filter === 'upcoming') {
      return eventDate >= today;
    } else if (filter === 'past') {
      return eventDate < today;
    }
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">School Events</h1>
          <p className="text-gray-600">Stay updated with all school activities and events</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Event Image */}
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}

              {/* Event Content */}
              <div className="p-6">
                {/* Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                    {getEventIcon(event.type)} {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                  {event.isRegistered && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Registered
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {event.attendees} {event.maxAttendees && `/ ${event.maxAttendees}`} attendees
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleRegister(event.id)}
                  disabled={!!(event.maxAttendees && event.attendees >= event.maxAttendees && !event.isRegistered)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    event.isRegistered
                      ? 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100'
                      : event.maxAttendees && event.attendees >= event.maxAttendees
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {event.isRegistered
                    ? 'Unregister'
                    : event.maxAttendees && event.attendees >= event.maxAttendees
                    ? 'Event Full'
                    : 'Register for Event'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-24 h-24 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg">No events found</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventsPage;
