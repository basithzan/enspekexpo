import React, { useState, useEffect } from 'react';
import GoogleMeetCard from './GoogleMeetCard';

const GoogleMeetList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGoogleMeets();
  }, []);

  const fetchGoogleMeets = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/google-meet/user/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMeetings(data.meetings);
      } else {
        setError(data.message || 'Failed to fetch meetings');
      }
    } catch (err) {
      setError('Failed to fetch Google Meet details');
      console.error('Google Meet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Google Meets</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Google Meets</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Google Meets</h2>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Google Meets</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't been invited to any Google Meet sessions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">My Google Meets</h2>
        <button
          onClick={fetchGoogleMeets}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${meeting.is_active ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Date:</span> {formatDate(meeting.start_time)}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {meeting.duration} minutes
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Participants:</span>
                  {meeting.client && <span className="ml-1">{meeting.client.name} (Client)</span>}
                  {meeting.inspector && <span className="ml-1">{meeting.inspector.name} (Inspector)</span>}
                  {meeting.creator && <span className="ml-1">{meeting.creator.name} (Admin)</span>}
                </div>

                {meeting.enquiry && (
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Enquiry:</span> #{meeting.enquiry.id}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => window.open(meeting.meet_url, '_blank')}
                  disabled={!meeting.is_active}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    meeting.is_active
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {meeting.is_active ? 'Join Meeting' : 'Meeting Ended'}
                </button>

                <button
                  onClick={() => navigator.clipboard.writeText(meeting.meet_url)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoogleMeetList;
