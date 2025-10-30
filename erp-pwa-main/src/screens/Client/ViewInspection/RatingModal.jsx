import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitInspectorRating, clearRatingSubmissionSuccess } from '../../../store/client/clientSlice';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

const RatingModal = ({ inspector, enquiryId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const client = useSelector((state) => state.client.auth_client);
  const rating_submission_loading = useSelector((state) => state.client.rating_submission_loading);
  const rating_submission_success = useSelector((state) => state.client.rating_submission_success);

  useEffect(() => {
    if (rating_submission_success) {
      dispatch(clearRatingSubmissionSuccess());
      onSuccess && onSuccess();
      onClose();
    }
  }, [rating_submission_success, dispatch, onSuccess, onClose]);

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
    setErrors({ ...errors, rating: '' });
  };

  const handleReviewChange = (e) => {
    setReview(e.target.value);
    setErrors({ ...errors, review: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!review.trim()) {
      newErrors.review = 'Please write a review';
    } else if (review.trim().length < 10) {
      newErrors.review = 'Review must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(submitInspectorRating({
        inspectorId: inspector.id,
        enquiryId: enquiryId,
        rating: rating,
        review: review.trim(),
        token: client?.user.auth_token
      }));
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className="focus:outline-none transition-colors duration-200"
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          {i <= displayRating ? (
            <StarIcon className="w-8 h-8 text-yellow-400" />
          ) : (
            <StarIconOutline className="w-8 h-8 text-gray-300" />
          )}
        </button>
      );
    }

    return stars;
  };

  const getRatingText = (ratingValue) => {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratingTexts[ratingValue] || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Rate & Review Inspector
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Inspector Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {inspector?.name?.charAt(0) || 'I'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{inspector?.name}</h3>
                <p className="text-sm text-gray-600">{inspector?.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Rating Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate this inspector? *
              </label>
              <div className="flex items-center space-x-2 mb-2">
                {renderStars()}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600">
                  {getRatingText(rating)}
                </p>
              )}
              {errors.rating && (
                <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
              )}
            </div>

            {/* Review Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write a review *
              </label>
              <textarea
                value={review}
                onChange={handleReviewChange}
                placeholder="Share your experience with this inspector. What did they do well? What could be improved?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.review && (
                  <p className="text-red-500 text-sm">{errors.review}</p>
                )}
                <p className="text-gray-500 text-sm ml-auto">
                  {review.length}/500 characters
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                disabled={rating_submission_loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-200"
                disabled={rating_submission_loading}
              >
                {rating_submission_loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;


