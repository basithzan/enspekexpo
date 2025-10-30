import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPaymentIntent, clearPaymentIntentSuccess } from '../../../store/client/clientSlice';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCardIcon, DocumentTextIcon, CalendarIcon, CurrencyDollarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import moment from 'moment';

// Payment Form Component
const PaymentForm = ({ clientSecret, onSuccess, onCancel, invoice, masterLogId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();
  const client = useSelector((state) => state.client.auth_client);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        toast.error(`Payment failed: ${error.message}`);
      } else if (paymentIntent.status === 'succeeded') {
        // Call confirmPayment API to update invoice status
        try {
          const confirmResponse = await fetch('http://bc.test/api/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${client?.user.auth_token}`,
            },
            body: JSON.stringify({
              payment_intent_id: paymentIntent.id,
              invoice_id: invoice.id,
              master_log_id: masterLogId,
              amount: invoice.amount,
              description: `Payment for Invoice ${invoice.invoice_number}`,
            }),
          });

          const confirmResult = await confirmResponse.json();

          if (confirmResult.success) {
            toast.success('Payment successful! Invoice has been marked as paid.');
            onSuccess();
          } else {
            toast.error('Payment processed but failed to update invoice status.');
            console.error('Confirm payment error:', confirmResult);
          }
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError);
          toast.error('Payment processed but failed to update invoice status.');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : `Pay $${clientSecret ? 'Amount' : '0.00'}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const InvoiceCard = ({ invoice, enquiryId, masterLogId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  const dispatch = useDispatch();
  const client = useSelector((state) => state.client.auth_client);
  const payment_intent_loading = useSelector((state) => state.client.payment_intent_loading);
  const payment_intent_success = useSelector((state) => state.client.payment_intent_success);

  useEffect(() => {
    // Initialize Stripe with the actual publishable key from the API
    const initializeStripe = async () => {
      try {
        // Fetch Stripe configuration from the API
        const response = await fetch('http://bc.test/api/stripe-config');
        const config = await response.json();

        if (config.success && config.stripe_publishable_key) {
          const stripeInstance = await loadStripe(config.stripe_publishable_key);
          setStripe(stripeInstance);
        } else {
          console.error('Failed to get Stripe configuration');
          // Fallback to placeholder key for development
          const stripeInstance = await loadStripe('pk_test_51234567890abcdefghijklmnopqrstuvwxyz');
          setStripe(stripeInstance);
        }
      } catch (error) {
        console.error('Error initializing Stripe:', error);
        // Fallback to placeholder key for development
        const stripeInstance = await loadStripe('pk_test_51234567890abcdefghijklmnopqrstuvwxyz');
        setStripe(stripeInstance);
      }
    };
    initializeStripe();
  }, []);

  useEffect(() => {
    if (payment_intent_success) {
      dispatch(clearPaymentIntentSuccess());
      setIsProcessing(false);
    }
  }, [payment_intent_success, dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePayNow = async () => {
    if (!stripe) {
      toast.error('Stripe is not loaded. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const result = await dispatch(createPaymentIntent({
        amount: invoice.amount,
        currency: 'usd',
        description: `Payment for Invoice ${invoice.invoice_number}`,
        invoiceId: invoice.id,
        masterLogId: masterLogId,
        token: client?.user.auth_token
      }));

      if (result.payload.success) {
        const { client_secret } = result.payload;
        setClientSecret(client_secret);
        setShowPaymentModal(true);
        toast.success('Payment form loaded successfully');
      } else {
        toast.error('Failed to create payment intent. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred during payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'sent':
        return 'Sent';
      case 'paid':
        return 'Paid';
      case 'draft':
        return 'Draft';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Invoice {invoice.invoice_number}
            </h3>
            <p className="text-sm text-gray-600">
              {invoice.description || 'Inspection Services'}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
          {getStatusText(invoice.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Subtotal */}
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(invoice.subtotal !== undefined ? invoice.subtotal : invoice.amount)}
            </p>
          </div>
        </div>

        {/* Tax Information */}
        {(invoice.tax_percentage !== undefined && invoice.tax_percentage > 0) && (
          <>
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Tax ({invoice.tax_percentage}%)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(invoice.tax_amount || 0)}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Total Amount */}
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(invoice.total_amount !== undefined ? invoice.total_amount : invoice.amount)}
            </p>
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="text-sm font-medium text-gray-900">
              {invoice.due_date ? formatDate(invoice.due_date) : 'No due date'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p>Issue Date: {formatDate(invoice.issue_date)}</p>
        </div>

        {invoice.status === 'sent' && (
          <button
            onClick={handlePayNow}
            disabled={isProcessing || payment_intent_loading}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            <CreditCardIcon className="w-5 h-5" />
            <span>
              {isProcessing || payment_intent_loading ? 'Processing...' : 'Pay Now'}
            </span>
          </button>
        )}
      </div>

      {invoice.status === 'paid' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-green-800 font-medium">
              This invoice has been paid successfully.
            </p>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Complete Payment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Invoice:</span>
                  <span className="font-medium">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-semibold text-lg">{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </div>

            {stripe && clientSecret && (
              <Elements stripe={stripe} options={{ clientSecret }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  invoice={invoice}
                  masterLogId={masterLogId}
                  onSuccess={() => {
                    setShowPaymentModal(false);
                    setClientSecret('');
                    window.location.reload();
                  }}
                  onCancel={() => {
                    setShowPaymentModal(false);
                    setClientSecret('');
                  }}
                />
              </Elements>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceCard;
