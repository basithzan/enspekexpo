import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  Image,
  Modal,
  Alert,
  TextInput,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useViewEnquiry, useEnquiryInvoices, useCreatePaymentIntent } from '../../../src/api/hooks/useEnquiry';
import { useInspectorRatings, useConfirmInspectorSelection } from '../../../src/api/hooks/useClientActions';
import { useAuth } from '../../../src/contexts/AuthContext';
import { HapticPressable } from '@/components/HapticPressable';
import { HapticType } from '@/utils/haptics';

export default function RfiDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const { data: enquiryData, isLoading, refetch } = useViewEnquiry(id as string);
  const { data: invoicesData } = useEnquiryInvoices(id as string);
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const confirmInspectorMutation = useConfirmInspectorSelection();
  
  const [isRefreshingReports, setIsRefreshingReports] = useState(false);

  const inspectionReports = useMemo(() => {
    const reports =
      singleJob?.flash_reports ||
      singleJob?.enquiry?.flash_reports ||
      singleJob?.enquiry?.master_logs?.[0]?.flash_reports ||
      singleJob?.enquiry?.master_logs?.[0]?.inspection_reports ||
      [];

    return Array.isArray(reports) ? reports : [];
  }, [singleJob]);

  const refreshInspectionReports = async () => {
    if (isRefreshingReports) return;
    setIsRefreshingReports(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing inspection reports:', error);
    } finally {
      setIsRefreshingReports(false);
    }
  };
  
  const singleJob = enquiryData?.data || enquiryData;
  const checkIns = singleJob?.checkIns || [];
  const invoices = invoicesData?.data || invoicesData || [];
  
  // Reviews modal state
  const [showReviews, setShowReviews] = useState(false);
  const [selectedInspectorIdForReviews, setSelectedInspectorIdForReviews] = useState<number | string | null>(null);
  const inspector = singleJob?.accepted_bid?.inspector;
  // Use selected inspector ID for reviews, or fall back to assigned inspector ID
  const inspectorIdForReviews = selectedInspectorIdForReviews || inspector?.id || inspector?.inspector_id;
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { data: ratingsData, isLoading: isLoadingRatings, error: ratingsError } = useInspectorRatings(
    showReviews && selectedInspectorIdForReviews ? selectedInspectorIdForReviews : null
  );
  
  // Debug: Log the ratings data structure
  useEffect(() => {
    if (showReviews && ratingsData) {
      console.log('Ratings Data:', JSON.stringify(ratingsData, null, 2));
      console.log('Ratings Array Check:', Array.isArray(ratingsData));
      console.log('Ratings Data Keys:', ratingsData ? Object.keys(ratingsData) : 'No data');
    }
    if (ratingsError) {
      console.error('Ratings Error:', ratingsError);
    }
    console.log('Show Reviews:', showReviews, 'Inspector ID:', selectedInspectorIdForReviews, 'Loading:', isLoadingRatings);
  }, [showReviews, ratingsData, ratingsError, selectedInspectorIdForReviews, isLoadingRatings]);
  
  // Try multiple possible data structures
  const ratings = useMemo(() => {
    if (!ratingsData) {
      console.log('No ratingsData');
      return [];
    }
    
    // Try different possible structures
    if (Array.isArray(ratingsData)) {
      console.log('Ratings is direct array, length:', ratingsData.length);
      return ratingsData;
    }
    if (ratingsData?.ratings && Array.isArray(ratingsData.ratings)) {
      console.log('Found ratingsData.ratings, length:', ratingsData.ratings.length);
      return ratingsData.ratings;
    }
    if (ratingsData?.data?.ratings && Array.isArray(ratingsData.data.ratings)) {
      console.log('Found ratingsData.data.ratings, length:', ratingsData.data.ratings.length);
      return ratingsData.data.ratings;
    }
    if (ratingsData?.data && Array.isArray(ratingsData.data)) {
      console.log('Found ratingsData.data, length:', ratingsData.data.length);
      return ratingsData.data;
    }
    
    console.log('No ratings found, returning empty array');
    return [];
  }, [ratingsData]);
  
  const getStatusColor = (status: any) => {
    const statusStr = String(status).toLowerCase();
    const statusNum = parseInt(String(status));
    
    if (statusStr === 'completed' || statusNum === 5) {
      return { bg: '#FEF2F2', text: '#991B1B', label: 'Inspection Completed' };
    } else if (statusStr === 'bid accepted' || statusNum === 2) {
      return { bg: '#ECFDF5', text: '#065F46', label: 'Bid Accepted' };
    } else if (statusStr === 'bid rejected' || statusNum === 3) {
      return { bg: '#FEF2F2', text: '#991B1B', label: 'Bid Rejected' };
    } else if (statusStr === 'inspection proceeded' || statusNum === 6) {
      return { bg: '#FFFBEB', text: '#92400E', label: 'Inspection Proceeded' };
    } else {
      return { bg: '#FFFBEB', text: '#92400E', label: 'Pending Bid' };
    }
  };
  
  const statusInfo = getStatusColor(singleJob?.my_bid?.status || singleJob?.enquiry?.status);
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading RFI details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!singleJob) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>RFI not found</Text>
          <HapticPressable style={styles.backButton} onPress={() => router.back()} hapticType={HapticType.Medium}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </HapticPressable>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${day}-${month}-${year} ${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  const parseDates = (dateString: string) => {
    if (!dateString) return [];
    return dateString.split(',').map(d => d.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <HapticPressable onPress={() => router.back()} style={styles.backButton} hapticType={HapticType.Light}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </HapticPressable>
        <Text style={styles.headerTitle}>RFI Details</Text>
        <View style={styles.headerRight}>
          {/* Edit button - only show if enquiry can be edited */}
          {singleJob?.enquiry && singleJob.enquiry.status !== 0 && singleJob.enquiry.status !== 1 && (
            <HapticPressable
              style={styles.editButton}
              onPress={() => router.push(`/(tabs)/client/create-rfi?id=${id}`)}
              hapticType={HapticType.Medium}
            >
              <Ionicons name="create-outline" size={18} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit</Text>
            </HapticPressable>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        {singleJob?.my_bid && (
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              Status: {statusInfo.label}
            </Text>
          </View>
        )}

        {/* Job Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Job Title:</Text>
            <Text style={styles.infoValue}>{singleJob?.enquiry?.job_title || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created Date:</Text>
            <Text style={styles.infoValue}>
              {singleJob?.enquiry?.created_at ? formatDate(singleJob.enquiry.created_at) : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>RFI Number:</Text>
            <Text style={styles.infoValue}>
              RFI{singleJob?.enquiry?.id || singleJob?.enquiry?.enquiry_no || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Job Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Scope of Inspection:</Text>
            <Text style={styles.detailValue}>
              {singleJob?.enquiry?.enquiry_scope || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>
              {singleJob?.enquiry?.category || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Commodity:</Text>
            <Text style={styles.detailValue}>
              {singleJob?.enquiry?.commodity || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Country:</Text>
            <Text style={styles.detailValue}>
              {singleJob?.enquiry?.country?.name || 
               singleJob?.enquiry?.country_name || 
               singleJob?.country?.name || 
               singleJob?.country_name || 
               'N/A'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Supplier Name:</Text>
            <Text style={styles.detailValue}>
              {singleJob?.enquiry?.vendor || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Supplier Location:</Text>
            <Text style={styles.detailValue}>
              {singleJob?.enquiry?.vendor_location || 'N/A'}
            </Text>
          </View>
          
          {singleJob?.enquiry?.note && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Additional Note:</Text>
              <Text style={styles.detailValue}>{singleJob.enquiry.note}</Text>
            </View>
          )}
        </View>

        {/* Estimated Inspection Dates */}
        {singleJob?.enquiry?.est_inspection_date && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Estimated Inspection Dates</Text>
            <View style={styles.datesContainer}>
              {parseDates(singleJob.enquiry.est_inspection_date).map((date, idx) => (
                <View key={idx} style={styles.dateChip}>
                  <Text style={styles.dateChipText}>{date}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Assigned Inspector */}
        {singleJob?.accepted_bid && singleJob?.accepted_bid?.inspector && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assigned Inspector</Text>
            
            <View style={styles.inspectorCard}>
              {singleJob.accepted_bid.inspector.profile_pic && (
                <Image 
                  source={{ uri: singleJob.accepted_bid.inspector.profile_pic }} 
                  style={styles.inspectorAvatar}
                />
              )}
              <View style={styles.inspectorInfo}>
                <Text style={styles.inspectorName}>
                  {singleJob.accepted_bid.inspector.name || 'N/A'}
                </Text>
                {singleJob.accepted_bid.inspector.email && (
                  <Text style={styles.inspectorEmail}>
                    {singleJob.accepted_bid.inspector.email}
                  </Text>
                )}
                {singleJob.accepted_bid.inspector.phone && (
                  <Text style={styles.inspectorPhone}>
                    {singleJob.accepted_bid.inspector.phone}
                  </Text>
                )}
                {(singleJob.accepted_bid.inspector.country?.name || 
                  singleJob.accepted_bid.inspector.country_name || 
                  singleJob.accepted_bid.inspector.country) && (
                  <Text style={styles.inspectorPhone}>
                    {singleJob.accepted_bid.inspector.country?.name || 
                     singleJob.accepted_bid.inspector.country_name || 
                     singleJob.accepted_bid.inspector.country}
                  </Text>
                )}
                
                {/* Show Reviews Button */}
                {(inspector?.id || inspector?.inspector_id) && (
                  <HapticPressable
                    style={styles.showReviewsButton}
                    onPress={() => {
                      const assignedInspectorId = inspector?.id || inspector?.inspector_id;
                      console.log('Show Reviews clicked, Inspector ID:', assignedInspectorId);
                      setSelectedInspectorIdForReviews(assignedInspectorId);
                      setShowReviews(true);
                    }}
                    hapticType={HapticType.Medium}
                  >
                    <Ionicons name="star-outline" size={14} color="#3B82F6" />
                    <Text style={styles.showReviewsButtonText}>Show Reviews</Text>
                  </HapticPressable>
                )}
              </View>
            </View>

            {/* Inspector Availability Dates */}
            {singleJob?.accepted_bid?.availability && (
              <View style={styles.availabilitySection}>
                <Text style={styles.availabilityLabel}>Check In Dates:</Text>
                <View style={styles.datesContainer}>
                  {parseDates(singleJob.accepted_bid.availability).map((date, idx) => (
                    <View key={idx} style={styles.dateChip}>
                      <Text style={styles.dateChipText}>{date}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Check-ins Section */}
        {checkIns.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Check Ins</Text>
              <HapticPressable onPress={() => refetch()} style={styles.refreshButton} hapticType={HapticType.Light}>
                <Ionicons name="refresh" size={20} color="#3B82F6" />
              </HapticPressable>
            </View>
            
            {checkIns.map((item: any, index: number) => (
              <View key={index} style={styles.checkInItem}>
                <View style={styles.checkInHeader}>
                  <View style={styles.checkInNumber}>
                    <Text style={styles.checkInNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.checkInContent}>
                    <Text style={styles.checkInInspectorName}>
                      Inspector: {item?.inspector?.name || 'N/A'}
                    </Text>
                    <Text style={styles.checkInDate}>
                      Date: {item.created_at ? formatDate(item.created_at) : 'N/A'}
                    </Text>
                    <Text style={styles.checkInTime}>
                      Time: {item.created_at ? formatDateTime(item.created_at) : 'N/A'}
                      {singleJob?.accepted_bid?.inspector?.timezone && 
                        ` (${singleJob.accepted_bid.inspector.timezone})`
                      }
                    </Text>
                    <Text style={styles.checkInAddress} numberOfLines={2}>
                      Address: {item.address || 'N/A'}
                    </Text>
                    {item?.note && (
                      <Text style={styles.checkInNote}>
                        Note: {item.note}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Invoices Section */}
        {invoices.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Invoices</Text>
            
            {invoices.map((invoice: any, index: number) => (
              <View key={index} style={styles.invoiceItem}>
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceTitle}>
                    Invoice #{invoice.invoice_number || invoice.id || index + 1}
                  </Text>
                  {invoice.status && (
                    <View style={[
                      styles.invoiceStatus,
                      { backgroundColor: invoice.status === 'paid' ? '#ECFDF5' : '#FFFBEB' }
                    ]}>
                      <Text style={[
                        styles.invoiceStatusText,
                        { color: invoice.status === 'paid' ? '#065F46' : '#92400E' }
                      ]}>
                        {invoice.status.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Invoice Details Grid */}
                <View style={styles.invoiceDetailsGrid}>
                  {/* Subtotal */}
                  {(invoice.subtotal !== undefined || invoice.amount) && (
                    <View style={styles.invoiceDetailItem}>
                      <Text style={styles.invoiceDetailLabel}>Subtotal</Text>
                      <Text style={styles.invoiceDetailValue}>
                        {invoice.currency || 'USD'} {invoice.subtotal !== undefined ? invoice.subtotal : invoice.amount}
                      </Text>
                    </View>
                  )}
                  
                  {/* Tax (if applicable) */}
                  {invoice.tax_percentage !== undefined && invoice.tax_percentage > 0 && (
                    <View style={styles.invoiceDetailItem}>
                      <Text style={styles.invoiceDetailLabel}>Tax ({invoice.tax_percentage}%)</Text>
                      <Text style={styles.invoiceDetailValue}>
                        {invoice.currency || 'USD'} {invoice.tax_amount || 0}
                      </Text>
                    </View>
                  )}
                  
                  {/* Total Amount */}
                  {(invoice.total_amount !== undefined || invoice.amount) && (
                    <View style={styles.invoiceDetailItem}>
                      <Text style={styles.invoiceDetailLabel}>Total Amount</Text>
                      <Text style={[styles.invoiceDetailValue, styles.invoiceTotalAmount]}>
                        {invoice.currency || 'USD'} {invoice.total_amount !== undefined ? invoice.total_amount : invoice.amount}
                      </Text>
                    </View>
                  )}
                  
                  {/* Due Date */}
                  {invoice.due_date && (
                    <View style={styles.invoiceDetailItem}>
                      <Text style={styles.invoiceDetailLabel}>Due Date</Text>
                      <View style={styles.dueDateContainer}>
                        <Text style={styles.invoiceDetailValue}>
                          {formatDate(invoice.due_date)}
                        </Text>
                        {/* Late Days Label for Unpaid Invoices */}
                        {invoice.status && invoice.status !== 'paid' && invoice.due_date && (() => {
                          const dueDate = new Date(invoice.due_date);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          dueDate.setHours(0, 0, 0, 0);
                          const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                          if (daysLate > 0) {
                            return (
                              <View style={styles.lateDaysBadge}>
                                <Text style={styles.lateDaysText}>
                                  {daysLate} {daysLate === 1 ? 'day' : 'days'} late
                                </Text>
                              </View>
                            );
                          }
                          return null;
                        })()}
                      </View>
                    </View>
                  )}
                  
                  {/* Issue Date */}
                  {(invoice.issue_date || invoice.created_at) && (
                    <View style={styles.invoiceDetailItem}>
                      <Text style={styles.invoiceDetailLabel}>Issue Date</Text>
                      <Text style={styles.invoiceDetailValue}>
                        {formatDate(invoice.issue_date || invoice.created_at)}
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Paid/Not Paid Status Message */}
                {invoice.status === 'paid' && (
                  <View style={styles.invoicePaidMessage}>
                    <View style={styles.invoicePaidIndicator} />
                    <Text style={styles.invoicePaidText}>
                      This invoice has been paid successfully.
                    </Text>
                  </View>
                )}
                {invoice.status && invoice.status !== 'paid' && (
                  <View style={styles.invoiceUnpaidMessage}>
                    <Text style={styles.invoiceUnpaidText}>
                      This invoice is {invoice.status === 'sent' ? 'pending payment' : invoice.status}.
                    </Text>
                  </View>
                )}
                
                {/* Pay Now Button for Sent Invoices */}
                {invoice.status === 'sent' && (
                  <HapticPressable
                    style={[
                      styles.payNowButton,
                      createPaymentIntentMutation.isPending && styles.payNowButtonDisabled
                    ]}
                    onPress={async () => {
                      try {
                        const amount = invoice.total_amount || invoice.amount;
                        const result = await createPaymentIntentMutation.mutateAsync({
                          amount: amount,
                          currency: (invoice.currency || 'USD').toLowerCase(),
                          description: `Payment for Invoice ${invoice.invoice_number || invoice.id}`,
                          invoice_id: invoice.id,
                          master_log_id: singleJob?.accepted_bid?.master_log_id || singleJob?.id,
                        });
                        
                        console.log('Payment Intent Creation Result:', JSON.stringify(result, null, 2));
                        if (result.success && result.client_secret) {
                          setClientSecret(result.client_secret);
                          // Payment intent ID might be in different fields
                          const intentId = result.payment_intent_id || result.payment_intent?.id || result.id || '';
                          setPaymentIntentId(intentId);
                          setSelectedInvoice(invoice);
                          setShowPaymentModal(true);
                        } else {
                          Alert.alert('Error', result.message || 'Failed to create payment intent');
                        }
                      } catch (error: any) {
                        Alert.alert(
                          'Error',
                          error?.response?.data?.message || 'Failed to create payment intent. Please try again.'
                        );
                      }
                    }}
                    disabled={createPaymentIntentMutation.isPending}
                    hapticType={HapticType.Medium}
                  >
                    {createPaymentIntentMutation.isPending ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.payNowButtonText}>Pay Now</Text>
                      </>
                    )}
                  </HapticPressable>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Inspection Reports Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Inspection Reports</Text>
            <HapticPressable 
              onPress={refreshInspectionReports} 
              style={styles.refreshButton} 
              hapticType={HapticType.Light}
              disabled={isRefreshingReports}
            >
              {isRefreshingReports ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Ionicons name="refresh" size={20} color="#3B82F6" />
              )}
            </HapticPressable>
          </View>
          
          {isRefreshingReports && inspectionReports.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : inspectionReports.length === 0 ? (
            <Text style={styles.noReportsText}>No inspection reports available</Text>
          ) : (
            <View style={styles.reportsList}>
              {inspectionReports.map((report) => (
                <View key={report.id} style={styles.reportItem}>
                  <View style={styles.reportHeader}>
                    <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportTitle} numberOfLines={2}>
                        {report.report_title || report.file_name || `Report #${report.id}`}
                      </Text>
                      {/* <Text style={styles.reportDate}>
                        {(report.created_at)}
                      </Text> */}
                    </View>
                  </View>
                  <HapticPressable
                    style={styles.downloadButton}
                    onPress={() => {
                      // Open the report in browser or handle download
                      // You might want to use Linking.openURL for this
                      try {
                        const { Linking } = require('react-native');
                        const reportUrl = `https://erpbeta.enspek.com/${report.file_path}`;
                        Linking.openURL(reportUrl);
                      } catch (error) {
                        Alert.alert('Error', 'Unable to open the report');
                      }
                    }}
                    hapticType={HapticType.Medium}
                  >
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.downloadButtonText}>Download</Text>
                  </HapticPressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Shortlisted Inspectors */}
        {singleJob?.shortlisted_inspectors && singleJob.shortlisted_inspectors.length > 0 && !singleJob?.accepted_bid && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Shortlisted Inspectors</Text>
            
            {singleJob.shortlisted_inspectors.map((item: any, idx: number) => {
              // Use item.id (shortlisted inspector entry ID) as per web version
              // This is the ID of the shortlisted inspector entry, not the inspector user ID
              const shortlistedInspectorId = item?.id;
              const inspectorUserId = item?.inspector?.id;
              return (
                <View key={idx} style={styles.shortlistedInspectorContainer}>
                  <View style={styles.inspectorCard}>
                    {item?.inspector?.profile_pic && (
                      <Image 
                        source={{ uri: item.inspector.profile_pic }} 
                        style={styles.inspectorAvatar}
                      />
                    )}
                    <View style={styles.inspectorInfo}>
                      <View style={styles.inspectorInfoHeader}>
                        <View style={styles.inspectorInfoText}>
                          <Text style={styles.inspectorName}>
                            {item?.inspector?.name || 'N/A'}
                          </Text>
                          {item?.inspector?.email && (
                            <Text style={styles.inspectorEmail}>
                              {item.inspector.email}
                            </Text>
                          )}
                        </View>
                        
                        {/* Action Buttons - Top Right */}
                        <View style={styles.shortlistedInspectorActions}>
                          {/* Show Reviews Button */}
                          {inspectorUserId && (
                            <HapticPressable
                              style={styles.showReviewsButton}
                              onPress={() => {
                                setSelectedInspectorIdForReviews(inspectorUserId);
                                setShowReviews(true);
                              }}
                              hapticType={HapticType.Medium}
                            >
                              <Ionicons name="star-outline" size={14} color="#3B82F6" />
                              <Text style={styles.showReviewsButtonText}>Reviews</Text>
                            </HapticPressable>
                          )}
                          
                          {/* Confirm Inspector Button */}
                          <HapticPressable
                            style={[
                              styles.confirmInspectorButton,
                              confirmInspectorMutation.isPending && styles.confirmInspectorButtonDisabled
                            ]}
                            onPress={async () => {
                              if (!shortlistedInspectorId) {
                                Alert.alert('Error', 'Inspector ID is missing');
                                return;
                              }
                              
                              // Ensure ID is a number
                              const inspectorIdToSend = Number(shortlistedInspectorId);
                              if (isNaN(inspectorIdToSend)) {
                                Alert.alert('Error', 'Invalid inspector ID');
                                return;
                              }
                              
                              // Log for debugging
                              console.log('Confirming inspector with ID:', inspectorIdToSend);
                              console.log('Shortlisted inspector item:', JSON.stringify(item, null, 2));
                              
                              try {
                                await confirmInspectorMutation.mutateAsync({
                                  accepted_inspector_id: inspectorIdToSend,
                                });
                                Alert.alert(
                                  'Success',
                                  'Inspector confirmed successfully!',
                                  [
                                    {
                                      text: 'OK',
                                      onPress: () => {
                                        refetch();
                                      },
                                    },
                                  ]
                                );
                              } catch (error: any) {
                                console.error('Confirm inspector error:', error);
                                console.error('Error response:', error?.response?.data);
                                const errorMessage = error?.response?.data?.message || 
                                                   error?.response?.data?.error || 
                                                   error?.message || 
                                                   'Failed to confirm inspector. Please try again.';
                                Alert.alert(
                                  'Error',
                                  errorMessage
                                );
                              }
                            }}
                            disabled={confirmInspectorMutation.isPending}
                            hapticType={HapticType.Medium}
                          >
                            {confirmInspectorMutation.isPending ? (
                              <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                              <>
                                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                                <Text style={styles.confirmInspectorButtonText}>Confirm</Text>
                              </>
                            )}
                          </HapticPressable>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Reviews Modal */}
      <Modal
        visible={showReviews}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowReviews(false);
          setSelectedInspectorIdForReviews(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Inspector Reviews</Text>
              <HapticPressable
                onPress={() => {
                  setShowReviews(false);
                  setSelectedInspectorIdForReviews(null);
                }}
                style={styles.modalCloseButton}
                hapticType={HapticType.Light}
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </HapticPressable>
            </View>

            <ScrollView 
              style={styles.modalScrollView} 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {isLoadingRatings ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={styles.modalLoadingText}>Loading reviews...</Text>
                </View>
              ) : ratingsError ? (
                <View style={styles.modalEmptyContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                  <Text style={styles.modalEmptyText}>
                    Error loading reviews. Please try again.
                  </Text>
                  <Text style={[styles.modalEmptyText, { fontSize: 12, marginTop: 8 }]}>
                    {ratingsError?.message || 'Unknown error'}
                  </Text>
                </View>
              ) : ratings.length === 0 ? (
                <View style={styles.modalEmptyContainer}>
                  <Ionicons name="star-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.modalEmptyText}>No reviews available for this inspector.</Text>
                  <Text style={[styles.modalEmptyText, { fontSize: 12, marginTop: 8 }]}>
                    Ratings length: {ratings.length}, Data keys: {ratingsData ? Object.keys(ratingsData).join(', ') : 'none'}
                  </Text>
                </View>
              ) : (
                <View style={styles.reviewsList}>
                  <Text style={{ padding: 16, fontSize: 12, color: '#6B7280' }}>
                    Showing {ratings.length} review{ratings.length !== 1 ? 's' : ''}
                  </Text>
                  {ratings.map((review: any, index: number) => {
                    console.log('Rendering review:', index, review);
                    return (
                    <View key={review.id || index} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewAvatar}>
                          <Text style={styles.reviewAvatarText}>
                            {(review.client?.name || review.client_name || 'C').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.reviewInfo}>
                          <Text style={styles.reviewClientName}>
                            {review.client?.name || review.client_name || 'Anonymous Client'}
                          </Text>
                          <View style={styles.reviewRatingRow}>
                            {renderStars(review.rating || 0)}
                            <Text style={styles.reviewDate}>
                              {review.rated_at || review.created_at ? formatDate(review.rated_at || review.created_at) : 'N/A'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {(review.feedback || review.review) && (
                        <Text style={styles.reviewFeedback}>{review.feedback || review.review}</Text>
                      )}
                    </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowPaymentModal(false);
          setClientSecret('');
          setPaymentIntentId('');
          setSelectedInvoice(null);
          setCardNumber('');
          setCardExpiry('');
          setCardCVC('');
          setCardholderName('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <HapticPressable
                onPress={() => {
                  setShowPaymentModal(false);
                  setClientSecret('');
                  setPaymentIntentId('');
                  setSelectedInvoice(null);
                  setCardNumber('');
                  setCardExpiry('');
                  setCardCVC('');
                  setCardholderName('');
                }}
                style={styles.modalCloseButton}
                hapticType={HapticType.Light}
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </HapticPressable>
            </View>

            <ScrollView style={styles.paymentModalScrollView} showsVerticalScrollIndicator={true}>
              {/* Invoice Summary */}
              {selectedInvoice && (
                <View style={styles.paymentInvoiceSummary}>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentSummaryLabel}>Invoice:</Text>
                    <Text style={styles.paymentSummaryValue}>
                      #{selectedInvoice.invoice_number || selectedInvoice.id}
                    </Text>
                  </View>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentSummaryLabel}>Amount:</Text>
                    <Text style={styles.paymentSummaryAmount}>
                      {selectedInvoice.currency || 'USD'} {selectedInvoice.total_amount || selectedInvoice.amount}
                    </Text>
                  </View>
                </View>
              )}

              {/* Payment Form */}
              <View style={styles.paymentForm}>
                <Text style={styles.paymentFormTitle}>Card Information</Text>
                
                {/* Cardholder Name */}
                <View style={styles.paymentInputGroup}>
                  <Text style={styles.paymentInputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={cardholderName}
                    onChangeText={setCardholderName}
                    placeholder="John Doe"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Card Number */}
                <View style={styles.paymentInputGroup}>
                  <Text style={styles.paymentInputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={cardNumber}
                    onChangeText={(text) => {
                      // Format card number with spaces
                      const formatted = text.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardNumber(formatted);
                    }}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                {/* Expiry and CVC */}
                <View style={styles.paymentRow}>
                  <View style={[styles.paymentInputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.paymentInputLabel}>Expiry Date</Text>
                    <TextInput
                      style={styles.paymentInput}
                      value={cardExpiry}
                      onChangeText={(text) => {
                        // Format expiry as MM/YY
                        let formatted = text.replace(/\D/g, '');
                        if (formatted.length >= 2) {
                          formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
                        }
                        setCardExpiry(formatted);
                      }}
                      placeholder="MM/YY"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>

                  <View style={[styles.paymentInputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.paymentInputLabel}>CVC</Text>
                    <TextInput
                      style={styles.paymentInput}
                      value={cardCVC}
                      onChangeText={(text) => {
                        setCardCVC(text.replace(/\D/g, '').substring(0, 4));
                      }}
                      placeholder="123"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>

                {/* Submit Payment Button */}
                <HapticPressable
                  style={[
                    styles.submitPaymentButton,
                    isProcessingPayment && styles.submitPaymentButtonDisabled
                  ]}
                  onPress={async () => {
                    if (!cardNumber || !cardExpiry || !cardCVC || !cardholderName) {
                      Alert.alert('Error', 'Please fill in all card details');
                      return;
                    }

                    setIsProcessingPayment(true);
                    try {
                      // Call confirm payment API
                      const { apiClient } = await import('../../../src/api/client');
                      
                      // Extract payment intent ID from client secret if needed
                      // Client secret format: pi_xxx_secret_xxx, payment intent ID is pi_xxx
                      let intentId = paymentIntentId;
                      if (!intentId && clientSecret) {
                        // Try to extract payment intent ID from client secret
                        // Stripe client secret format: pi_xxxxx_secret_xxxxx
                        const parts = clientSecret.split('_secret_');
                        if (parts.length > 0) {
                          intentId = parts[0]; // This is the payment intent ID
                        } else {
                          // Try regex match as fallback
                          const match = clientSecret.match(/^(pi_[a-zA-Z0-9]+)/);
                          if (match) {
                            intentId = match[1];
                          } else {
                            intentId = clientSecret;
                          }
                        }
                      }
                      
                      console.log('Payment Intent ID Extraction:', {
                        originalPaymentIntentId: paymentIntentId,
                        clientSecret: clientSecret,
                        extractedIntentId: intentId
                      });
                      
                      // Ensure amount is a number
                      const amount = parseFloat(String(selectedInvoice?.total_amount || selectedInvoice?.amount || 0));
                      
                      // Validate required fields
                      if (!intentId) {
                        Alert.alert('Error', 'Payment intent ID is missing. Please try again.');
                        setIsProcessingPayment(false);
                        return;
                      }
                      
                      if (!selectedInvoice?.id) {
                        Alert.alert('Error', 'Invoice ID is missing. Please try again.');
                        setIsProcessingPayment(false);
                        return;
                      }
                      
                      const masterLogId = singleJob?.accepted_bid?.master_log_id || singleJob?.id;
                      if (!masterLogId) {
                        Alert.alert('Error', 'Master log ID is missing. Please try again.');
                        setIsProcessingPayment(false);
                        return;
                      }
                      
                      // Build request payload - ensure all IDs are numbers
                      const requestPayload: any = {
                        payment_intent_id: intentId,
                        invoice_id: Number(selectedInvoice.id),
                        master_log_id: Number(masterLogId),
                        amount: amount,
                      };
                      
                      // Add description if provided
                      if (selectedInvoice?.invoice_number || selectedInvoice?.id) {
                        requestPayload.description = `Payment for Invoice ${selectedInvoice?.invoice_number || selectedInvoice?.id}`;
                      }
                      
                      // Remove any undefined or null values
                      Object.keys(requestPayload).forEach(key => {
                        if (requestPayload[key] === undefined || requestPayload[key] === null) {
                          delete requestPayload[key];
                        }
                      });
                      
                      console.log('Confirm Payment Request:', JSON.stringify(requestPayload, null, 2));
                      console.log('Client Secret:', clientSecret);
                      console.log('Payment Intent ID:', intentId);
                      
                      const response = await apiClient.post('/confirm-payment', requestPayload);
                      
                      console.log('Confirm Payment Response:', JSON.stringify(response.data, null, 2));

                      if (response.data.success) {
                        Alert.alert(
                          'Success',
                          'Payment successful! Invoice has been marked as paid.',
                          [
                            {
                              text: 'OK',
                              onPress: () => {
                                setShowPaymentModal(false);
                                setClientSecret('');
                                setPaymentIntentId('');
                                setSelectedInvoice(null);
                                setCardNumber('');
                                setCardExpiry('');
                                setCardCVC('');
                                setCardholderName('');
                                // Refresh invoice data
                                refetch();
                              },
                            },
                          ]
                        );
                      } else {
                        const errorMsg = response.data.message || response.data.error || 'Payment failed. Please try again.';
                        console.error('Payment confirmation failed:', response.data);
                        Alert.alert('Error', errorMsg);
                      }
                    } catch (error: any) {
                      console.error('Payment error:', error);
                      console.error('Payment error response:', error?.response?.data);
                      console.error('Payment error status:', error?.response?.status);
                      
                      let errorMsg = 'Payment failed. Please try again.';
                      
                      if (error?.response?.data) {
                        // Check for validation errors
                        if (error.response.data.errors) {
                          const validationErrors = Object.entries(error.response.data.errors)
                            .map(([field, messages]: [string, any]) => {
                              const msg = Array.isArray(messages) ? messages.join(', ') : messages;
                              return `${field}: ${msg}`;
                            })
                            .join('\n');
                          errorMsg = `Validation failed:\n${validationErrors}`;
                        } else if (error.response.data.message) {
                          errorMsg = error.response.data.message;
                        } else if (error.response.data.error) {
                          errorMsg = error.response.data.error;
                        }
                      } else if (error?.message) {
                        errorMsg = error.message;
                      }
                      
                      Alert.alert('Error', errorMsg);
                    } finally {
                      setIsProcessingPayment(false);
                    }
                  }}
                  disabled={isProcessingPayment}
                  hapticType={HapticType.Medium}
                >
                  {isProcessingPayment ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.submitPaymentButtonText}>Complete Payment</Text>
                    </>
                  )}
                </HapticPressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Ionicons key={i} name="star" size={16} color="#FBBF24" />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Ionicons key="half" name="star-half" size={16} color="#FBBF24" />
    );
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#D1D5DB" />
    );
  }

  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {stars}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '600',
  },
  backButtonText: {
    marginTop: 24,
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateChipText: {
    color: '#1F2937',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
  },
  checkInItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkInHeader: {
    flexDirection: 'row',
  },
  checkInNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkInNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
  checkInContent: {
    flex: 1,
  },
  checkInInspectorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  checkInDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  checkInTime: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  checkInAddress: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  checkInNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  inspectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inspectorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  inspectorInfo: {
    flex: 1,
  },
  inspectorInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inspectorInfoText: {
    flex: 1,
    marginRight: 8,
  },
  inspectorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  inspectorEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  inspectorPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  availabilitySection: {
    marginTop: 16,
  },
  availabilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  invoiceItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  invoiceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  invoiceStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceAmount: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  invoiceDetailsGrid: {
    marginTop: 12,
    gap: 12,
  },
  invoiceDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  invoiceDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  invoiceDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  invoiceTotalAmount: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },
  invoicePaidMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 12,
  },
  invoicePaidIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  invoicePaidText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  invoiceUnpaidMessage: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 12,
  },
  invoiceUnpaidText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  lateDaysBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginLeft: 8,
  },
  lateDaysText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  payNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  payNowButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  payNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  showReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  showReviewsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  modalEmptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEmptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  reviewsList: {
    padding: 16,
  },
  reviewItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewFeedback: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
  },
  paymentModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '50%',
  },
  paymentModalScrollView: {
    flex: 1,
  },
  paymentInvoiceSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentSummaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  paymentSummaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  paymentSummaryAmount: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '700',
  },
  paymentForm: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  paymentFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  paymentInputGroup: {
    marginBottom: 16,
  },
  paymentInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  paymentInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 0,
  },
  submitPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  submitPaymentButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  submitPaymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shortlistedInspectorContainer: {
    marginBottom: 16,
  },
  shortlistedInspectorActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  confirmInspectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  confirmInspectorButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  confirmInspectorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noReportsText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  reportsList: {
    gap: 12,
  },
  reportItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

});
