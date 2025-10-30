import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';

const GoogleMeetCard = ({ enquiryId, showTitle = true }) => {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchGoogleMeet();
  }, [enquiryId]);

  const fetchGoogleMeet = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/google-meet/enquiry/${enquiryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMeeting(data.meeting);
      } else {
        setError(data.message || 'No Google Meet found');
      }
    } catch (err) {
      setError('Failed to fetch Google Meet details');
      console.error('Google Meet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = () => {
    if (meeting?.meet_url) {
      window.open(meeting.meet_url, '_blank');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {showTitle && (
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="ml-2 text-lg font-semibold text-gray-900">Google Meet</h3>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Meeting Title</h4>
          <p className="text-sm text-gray-900">{meeting.title}</p>
        </div>

        {meeting.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Description</h4>
            <p className="text-sm text-gray-900">{meeting.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Start Time</h4>
            <p className="text-sm text-gray-900">{formatDate(meeting.start_time)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Duration</h4>
            <p className="text-sm text-gray-900">{meeting.duration} minutes</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">Participants</h4>
          <div className="text-sm text-gray-900">
            {meeting.client && <p>Client: {meeting.client.name}</p>}
            {meeting.inspector && <p>Inspector: {meeting.inspector.name}</p>}
            {meeting.creator && <p>Created by: {meeting.creator.name}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${meeting.is_active ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-600">
              {meeting.is_active ? 'Active' : 'Ended'}
            </span>
          </div>

          <button
            onClick={joinMeeting}
            disabled={!meeting.is_active}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              meeting.is_active
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {meeting.is_active ? 'Join Meeting' : 'Meeting Ended'}
          </button>
        </div>

        {meeting.meet_url && (
          <div className="mt-2">
            <h4 className="text-sm font-medium text-gray-700">Meeting URL</h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={meeting.meet_url}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
              />
              <button
                onClick={() => navigator.clipboard.writeText(meeting.meet_url)}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMeetCard;
