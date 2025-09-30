import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Booking, BookingRequest } from '../../types/booking';
import { Layout } from '../Layout/Layout';

const StudentBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'book'>('upcoming');
  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [bookingForm, setBookingForm] = useState<BookingRequest>({
    tutor_id: '',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    notes: ''
  });

  // Load student's bookings
  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tutor:profiles!bookings_tutor_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          ),
          course:courses(
            id,
            title,
            subject
          )
        `)
        .eq('student_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load available tutors
  const loadAvailableTutors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .eq('role', 'tutor')
        .eq('is_active', true);

      if (error) throw error;
      setAvailableTutors(data || []);
    } catch (error) {
      console.error('Error loading tutors:', error);
    }
  };

  useEffect(() => {
    loadBookings();
    if (activeTab === 'book') {
      loadAvailableTutors();
    }
  }, [user, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle booking creation
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          tutor_id: bookingForm.tutor_id,
          course_id: bookingForm.course_id || null,
          title: bookingForm.title,
          description: bookingForm.description,
          start_time: bookingForm.start_time,
          end_time: bookingForm.end_time,
          notes: bookingForm.notes,
          status: 'scheduled'
        });

      if (error) throw error;

      // Reset form and reload bookings
      setBookingForm({
        tutor_id: '',
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        notes: ''
      });
      setActiveTab('upcoming');
      loadBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  // Filter bookings by status and date
  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'scheduled' && 
    new Date(booking.start_time) > new Date()
  );

  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || 
    booking.status === 'cancelled' ||
    new Date(booking.start_time) < new Date()
  );

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your tutoring sessions and appointments</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming Sessions ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past Sessions ({pastBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'book'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Book New Session
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
                <p className="text-gray-500 mb-4">You don't have any scheduled tutoring sessions.</p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Book a Session
                </button>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{booking.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Tutor:</span>
                          <span className="ml-2 text-gray-600">
                            {booking.tutor?.first_name} {booking.tutor?.last_name}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Date & Time:</span>
                          <span className="ml-2 text-gray-600">{formatDateTime(booking.start_time)}</span>
                        </div>
                        {booking.course && (
                          <div>
                            <span className="font-medium text-gray-700">Course:</span>
                            <span className="ml-2 text-gray-600">{booking.course.title}</span>
                          </div>
                        )}
                        {booking.meeting_link && (
                          <div>
                            <span className="font-medium text-gray-700">Meeting Link:</span>
                            <a 
                              href={booking.meeting_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              Join Session
                            </a>
                          </div>
                        )}
                      </div>
                      {booking.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <span className="font-medium text-gray-700">Notes:</span>
                          <p className="text-gray-600 mt-1">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="space-y-4">
            {pastBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No past sessions</h3>
                <p className="text-gray-500">Your completed and cancelled sessions will appear here.</p>
              </div>
            ) : (
              pastBookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{booking.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Tutor:</span>
                          <span className="ml-2 text-gray-600">
                            {booking.tutor?.first_name} {booking.tutor?.last_name}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Date & Time:</span>
                          <span className="ml-2 text-gray-600">{formatDateTime(booking.start_time)}</span>
                        </div>
                        {booking.course && (
                          <div>
                            <span className="font-medium text-gray-700">Course:</span>
                            <span className="ml-2 text-gray-600">{booking.course.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'book' && (
          <div className="max-w-2xl">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book a New Session</h3>
              
              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Tutor
                  </label>
                  <select
                    value={bookingForm.tutor_id}
                    onChange={(e) => setBookingForm({ ...bookingForm, tutor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a tutor...</option>
                    {availableTutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.first_name} {tutor.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={bookingForm.title}
                    onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Math Tutoring Session"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="What topics would you like to cover?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={bookingForm.start_time}
                      onChange={(e) => setBookingForm({ ...bookingForm, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={bookingForm.end_time}
                      onChange={(e) => setBookingForm({ ...bookingForm, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Any special requirements or preferences?"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Book Session
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upcoming')}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentBookings;
