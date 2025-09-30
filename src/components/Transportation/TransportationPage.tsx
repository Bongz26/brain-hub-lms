import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Layout } from '../Layout/Layout';

interface TransportRoute {
  id: string;
  name: string;
  area: string;
  pickupPoints: string[];
  dropoffPoints: string[];
  schedule: {
    days: string[];
    morningPickup: string;
    afternoonDropoff: string;
  };
  capacity: number;
  currentBookings: number;
  price: number;
  features: string[];
}

export const TransportationPage: React.FC = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    loadTransportRoutes();
  }, [user]);

  const loadTransportRoutes = async () => {
    // Mock transportation routes
    const mockRoutes: TransportRoute[] = [
      {
        id: '1',
        name: 'Route A - Phuthaditjhaba Central',
        area: 'Phuthaditjhaba Central Area',
        pickupPoints: [
          'Phuthaditjhaba Mall',
          'Community Center',
          'Municipal Offices',
          'High School Junction'
        ],
        dropoffPoints: [
          'Brain Hub Learning Center',
          'Community Hall',
          'Sports Complex'
        ],
        schedule: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          morningPickup: '07:00 AM',
          afternoonDropoff: '05:00 PM'
        },
        capacity: 25,
        currentBookings: 18,
        price: 150,
        features: ['Air Conditioned', 'GPS Tracked', 'Qualified Driver', 'Insurance Covered']
      },
      {
        id: '2',
        name: 'Route B - Witsieshoek Area',
        area: 'Witsieshoek & Surrounding',
        pickupPoints: [
          'Witsieshoek Clinic',
          'Main Road Junction',
          'Community Hall',
          'Primary School'
        ],
        dropoffPoints: [
          'Brain Hub Learning Center',
          'Community Center'
        ],
        schedule: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          morningPickup: '06:45 AM',
          afternoonDropoff: '05:15 PM'
        },
        capacity: 20,
        currentBookings: 12,
        price: 180,
        features: ['Air Conditioned', 'GPS Tracked', 'Qualified Driver', 'Insurance Covered', 'WiFi Enabled']
      },
      {
        id: '3',
        name: 'Route C - QwaQwa Township',
        area: 'QwaQwa Township',
        pickupPoints: [
          'Township Center',
          'Market Square',
          'Secondary School',
          'Health Center'
        ],
        dropoffPoints: [
          'Brain Hub Learning Center',
          'Community Library'
        ],
        schedule: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          morningPickup: '07:15 AM',
          afternoonDropoff: '04:45 PM'
        },
        capacity: 30,
        currentBookings: 22,
        price: 140,
        features: ['GPS Tracked', 'Qualified Driver', 'Insurance Covered']
      }
    ];

    setRoutes(mockRoutes);
    setLoading(false);
  };

  const handleBookTransport = (route: TransportRoute) => {
    setSelectedRoute(route);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedRoute || !user) return;

    // In a real app, this would save to database
    alert(`🚌 Transport booking confirmed!\n\nRoute: ${selectedRoute.name}\nPickup Time: ${selectedRoute.schedule.morningPickup}\nMonthly Fee: R${selectedRoute.price}`);
    setShowBookingModal(false);
    setSelectedRoute(null);
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
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚌 Transportation Services</h1>
          <p className="text-gray-600">Safe, reliable transport to and from tutoring sessions</p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 p-6 rounded-lg">
          <div className="flex items-start">
            <div className="text-4xl mr-4">🛡️</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Safe & Secure Transportation</h3>
              <p className="text-gray-700 text-sm">
                All our vehicles are GPS-tracked, driven by qualified drivers, and fully insured. 
                Parents receive real-time updates on pickup and drop-off times.
              </p>
            </div>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map((route) => {
            const spotsLeft = route.capacity - route.currentBookings;
            const almostFull = spotsLeft <= 5;

            return (
              <div
                key={route.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Route Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <h3 className="text-2xl font-bold mb-2">{route.name}</h3>
                  <p className="text-blue-100">{route.area}</p>
                </div>

                {/* Route Details */}
                <div className="p-6 space-y-4">
                  {/* Schedule */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Schedule
                    </h4>
                    <div className="ml-7 text-sm text-gray-600">
                      <p>Days: {route.schedule.days.join(', ')}</p>
                      <p>Morning Pickup: <span className="font-medium text-gray-900">{route.schedule.morningPickup}</span></p>
                      <p>Afternoon Drop-off: <span className="font-medium text-gray-900">{route.schedule.afternoonDropoff}</span></p>
                    </div>
                  </div>

                  {/* Pickup Points */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Pickup Points
                    </h4>
                    <div className="ml-7 text-sm text-gray-600">
                      {route.pickupPoints.map((point, idx) => (
                        <p key={idx}>• {point}</p>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {route.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                        >
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">
                        Availability: <span className="font-medium text-gray-900">{route.currentBookings}/{route.capacity} seats filled</span>
                      </span>
                      {almostFull && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                          ⚠️ Almost Full
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          almostFull ? 'bg-orange-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${(route.currentBookings / route.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Fee</p>
                      <p className="text-2xl font-bold text-gray-900">R{route.price}</p>
                    </div>
                    <button
                      onClick={() => handleBookTransport(route)}
                      disabled={spotsLeft === 0}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        spotsLeft === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      {spotsLeft === 0 ? 'Route Full' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Need Custom Transportation?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-3">📞</div>
              <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-blue-600 font-medium">061 412 8252</p>
            </div>
            <div>
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-blue-600 font-medium">transport@brainhub.co.za</p>
            </div>
            <div>
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Chat with Us
              </button>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedRoute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Book Transportation - {selectedRoute.name}
                </h2>

                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route:</span>
                        <span className="font-medium text-gray-900">{selectedRoute.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Morning Pickup:</span>
                        <span className="font-medium text-gray-900">{selectedRoute.schedule.morningPickup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Afternoon Drop-off:</span>
                        <span className="font-medium text-gray-900">{selectedRoute.schedule.afternoonDropoff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days:</span>
                        <span className="font-medium text-gray-900">{selectedRoute.schedule.days.length} days/week</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-blue-200">
                        <span className="text-gray-900 font-semibold">Monthly Fee:</span>
                        <span className="text-2xl font-bold text-blue-600">R{selectedRoute.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pickup Point Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Your Pickup Point *
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Choose pickup location...</option>
                      {selectedRoute.pickupPoints.map((point, idx) => (
                        <option key={idx} value={point}>{point}</option>
                      ))}
                    </select>
                  </div>

                  {/* Drop-off Point Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Your Drop-off Point *
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Choose drop-off location...</option>
                      {selectedRoute.dropoffPoints.map((point, idx) => (
                        <option key={idx} value={point}>{point}</option>
                      ))}
                    </select>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Emergency Contact Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g., 061 412 8252"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Special Requirements (Optional)
                    </label>
                    <textarea
                      placeholder="Any special needs or instructions..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Terms */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <label className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-3" required />
                      <span className="text-sm text-gray-700">
                        I agree to the transportation terms and conditions. Payment is due on the 1st of each month.
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => {
                        setShowBookingModal(false);
                        setSelectedRoute(null);
                      }}
                      className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmBooking}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TransportationPage;
