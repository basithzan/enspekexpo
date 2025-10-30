import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getInspectorRatings } from '../../../store/client/clientSlice';

const ReviewsModal = ({ inspector, ratings, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const client = useSelector((state) => state.client.auth_client);
  const inspector_ratings = useSelector((state) => state.client.inspector_ratings);
  const inspector_ratings_loading = useSelector((state) => state.client.inspector_ratings_loading);

  const reviewsPerPage = 5;

  useEffect(() => {
    if (inspector_ratings && inspector_ratings.ratings) {
      setReviews(inspector_ratings.ratings);
    }
  }, [inspector_ratings]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400 text-sm">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400 text-sm">☆</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 text-sm">☆</span>
      );
    }

    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';

    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return 'Invalid date';
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b ${
            i === currentPage
              ? 'bg-blue-50 text-blue-600 border-blue-500'
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
        >
          Next
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-4">
        <div className="flex">{pages}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-t-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Reviews for {inspector.name}
            </h2>
            <p className="text-sm text-gray-600">
              {inspector_ratings && inspector_ratings.inspector && (
                <>
                  {renderStars(inspector_ratings.inspector.average_rating)}
                  <span className="ml-2">
                    {inspector_ratings.inspector.average_rating.toFixed(1)} out of 5
                    ({inspector_ratings.inspector.total_ratings || 0} reviews)
                  </span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {inspector_ratings_loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading reviews...</span>
            </div>
          ) : currentReviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews available for this inspector.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentReviews.map((review, index) => (
                <div key={review.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {review.client?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.client?.name || 'Anonymous Client'}
                        </p>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500 ml-1">
                            {formatDate(review.rated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {review.feedback && (
                    <p className="text-gray-700 mt-2 leading-relaxed">
                      {review.feedback}
                    </p>
                  )}

                  {review.inspector_feedback && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-1">Inspector Response:</p>
                      <p className="text-gray-700 text-sm">{review.inspector_feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!inspector_ratings_loading && currentReviews.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsModal;
