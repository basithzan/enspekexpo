import React, { useState, useEffect } from 'react';
import TwilioVideoCard from './TwilioVideoCard';

const TwilioVideoList = () => {
  const [videoCalls, setVideoCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTwilioVideoCalls();
  }, []);

  const fetchTwilioVideoCalls = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/twilio-video/user/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setVideoCalls(data.data);
      } else {
        setError(data.message || 'Failed to fetch video calls');
      }
    } catch (err) {
      setError('Failed to fetch Twilio Video call details');
      console.error('Twilio Video fetch error:', err);
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

  const joinVideoCall = async (roomSid) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/twilio-video/${roomSid}/join`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Open Twilio Video room in new tab
        const videoUrl = `/twilio-video-room?roomSid=${roomSid}&accessToken=${data.data.access_token}`;
        window.open(videoUrl, '_blank');
      } else {
        alert(data.message || 'Failed to join video call');
      }
    } catch (err) {
      console.error('Error joining video call:', err);
      alert('Failed to join video call');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Twilio Video Calls</h2>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Twilio Video Calls</h2>
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

  if (videoCalls.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Twilio Video Calls</h2>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Twilio Video Calls</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't been invited to any Twilio Video calls yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">My Twilio Video Calls</h2>
        <button
          onClick={fetchTwilioVideoCalls}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {/* {videoCalls.map((videoCall) => (
          <div key={videoCall.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    videoCall.status === 'active' ? 'bg-green-400' :
                    videoCall.status === 'completed' ? 'bg-blue-400' :
                    'bg-red-400'
                  }`}></div>
                  <h3 className="text-lg font-medium text-gray-900">{videoCall.title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Date:</span> {formatDate(videoCall.start_time)}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {videoCall.duration} minutes
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Participants:</span>
                  {videoCall.client && <span className="ml-1">{videoCall.client.name} (Client)</span>}
                  {videoCall.inspector && <span className="ml-1">{videoCall.inspector.name} (Inspector)</span>}
                  {videoCall.creator && <span className="ml-1">{videoCall.creator.name} (Admin)</span>}
                </div>

                {videoCall.enquiry && (
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Enquiry:</span> #{videoCall.enquiry.id}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => joinVideoCall(videoCall.room_sid)}
                  disabled={videoCall.status !== 'active'}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    videoCall.status === 'active'
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {videoCall.status === 'active' ? 'Join Video Call' : 'Call Ended'}
                </button>

                <button
                  onClick={() => navigator.clipboard.writeText(videoCall.room_sid)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Copy Room ID
                </button>
              </div>
            </div>
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default TwilioVideoList;
