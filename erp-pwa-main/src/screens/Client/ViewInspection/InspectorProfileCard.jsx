import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getInspectorRatings } from '../../../store/client/clientSlice';
import ReviewsModal from './ReviewsModal';
import RatingModal from './RatingModal';
import { getImageUrl, getInitials } from '../../../utils/avatarUtils.jsx';

const InspectorProfileCard = ({ inspector, enquiryId, isCompleted }) => {
  const [showReviews, setShowReviews] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const dispatch = useDispatch();
  const client = useSelector((state) => state.client.auth_client);
  const inspector_ratings = useSelector((state) => state.client.inspector_ratings);
  const inspector_ratings_loading = useSelector((state) => state.client.inspector_ratings_loading);

  const handleShowReviews = () => {
    if (!inspector || !inspector.id) {
      console.error('Inspector data is missing');
      return;
    }

    if (!inspector_ratings || !inspector_ratings.ratings || inspector_ratings.ratings.length === 0) {
      // Fetch ratings if not already loaded
      dispatch(getInspectorRatings({
        inspectorId: inspector.id,
        token: client?.user.auth_token
      }));
    }
    setShowReviews(true);
  };

  const handleRatingSuccess = () => {
    // Refresh inspector ratings after successful submission
    if (inspector && inspector.id) {
      dispatch(getInspectorRatings({
        inspectorId: inspector.id,
        token: client?.user.auth_token
      }));
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400 text-lg">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400 text-lg">☆</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 text-lg">☆</span>
      );
    }

    return stars;
  };

  // Early return if inspector data is not available
  if (!inspector) {
    return (
      <div className="border border-[#E2E8F0] rounded-lg px-4 py-4 bg-white shadow-sm">
        <div className="text-center text-gray-500">
          Inspector information not available
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border border-[#E2E8F0] rounded-lg px-4 py-4 bg-white shadow-sm">
        <div className="flex items-start space-x-4">
          {/* Inspector Avatar */}
          <div className="flex-shrink-0">
            {getImageUrl(inspector.profile) ? (
              <img
                src={getImageUrl(inspector.profile)}
                alt={inspector.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  // Hide the image and show initials instead
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-16 h-16 rounded-full border-2 border-gray-200 bg-blue-500 flex items-center justify-center text-white text-lg font-semibold"
              style={{ display: getImageUrl(inspector.profile) ? 'none' : 'flex' }}
            >
              {getInitials(inspector.name)}
            </div>
          </div>

          {/* Inspector Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {inspector.name}
              </h3>
              {inspector && inspector.average_rating && (
                <div className="flex items-center space-x-1">
                  {renderStars(inspector.average_rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    ({inspector.total_ratings || 0})
                  </span>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="mt-2 space-y-1">
              {inspector.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-4 h-4 mr-2">📧</span>
                  <span className="truncate">{inspector.email}</span>
                </div>
              )}

              {inspector.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-4 h-4 mr-2">📞</span>
                  <span>{inspector.phone}</span>
                </div>
              )}

              {inspector.country && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-4 h-4 mr-2">🌍</span>
                  <span>{inspector.country.name}</span>
                </div>
              )}
            </div>

            {/* Company Name if available */}
            {inspector.company_name && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">Company: </span>
                <span className="text-sm font-medium text-gray-700">
                  {inspector.company_name}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleShowReviews}
                disabled={inspector_ratings_loading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                {inspector_ratings_loading ? 'Loading...' : 'Show Reviews'}
              </button>
              {isCompleted && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Rate Inspector
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Modal */}
      {showReviews && (
        <ReviewsModal
          inspector={inspector}
          ratings={inspector_ratings}
          onClose={() => setShowReviews(false)}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          inspector={inspector}
          enquiryId={enquiryId}
          onClose={() => setShowRatingModal(false)}
          onSuccess={handleRatingSuccess}
        />
      )}
    </>
  );
};

export default InspectorProfileCard;
