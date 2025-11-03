import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useViewEnquiry, useEnquiryInvoices } from '../../../src/api/hooks/useEnquiry';
import { useAuth } from '../../../src/contexts/AuthContext';
import { HapticPressable } from '@/components/HapticPressable';
import { HapticType } from '@/utils/haptics';

export default function RfiDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const { data: enquiryData, isLoading, refetch } = useViewEnquiry(id as string);
  const { data: invoicesData } = useEnquiryInvoices(id as string);
  
  const singleJob = enquiryData?.data || enquiryData;
  const checkIns = singleJob?.checkIns || [];
  const invoices = invoicesData?.data || invoicesData || [];
  
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <HapticPressable onPress={() => router.back()} style={styles.backButton} hapticType={HapticType.Light}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </HapticPressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {singleJob?.enquiry?.job_title || 'RFI Details'}
        </Text>
        <View style={styles.headerRight} />
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
              {singleJob?.enquiry?.country?.name || 'N/A'}
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
                
                {invoice.amount && (
                  <Text style={styles.invoiceAmount}>
                    Amount: {invoice.currency || 'USD'} {invoice.amount}
                  </Text>
                )}
                
                {invoice.created_at && (
                  <Text style={styles.invoiceDate}>
                    Date: {formatDate(invoice.created_at)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Shortlisted Inspectors */}
        {singleJob?.shortlisted_inspectors && singleJob.shortlisted_inspectors.length > 0 && !singleJob?.accepted_bid && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Shortlisted Inspectors</Text>
            
            {singleJob.shortlisted_inspectors.map((item: any, idx: number) => (
              <View key={idx} style={styles.inspectorCard}>
                {item?.inspector?.profile_pic && (
                  <Image 
                    source={{ uri: item.inspector.profile_pic }} 
                    style={styles.inspectorAvatar}
                  />
                )}
                <View style={styles.inspectorInfo}>
                  <Text style={styles.inspectorName}>
                    {item?.inspector?.name || 'N/A'}
                  </Text>
                  {item?.inspector?.email && (
                    <Text style={styles.inspectorEmail}>
                      {item.inspector.email}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#121214',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2D30',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  headerRight: {
    width: 40,
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
    color: '#9CA3AF',
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
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
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
  backButtonText: {
    marginTop: 24,
    color: '#3B82F6',
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
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
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#121214',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2D30',
  },
  cardTitle: {
    fontSize: 20,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#F5F7FA',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#9CA3AF',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#F5F7FA',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#F5F7FA',
  },
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    backgroundColor: '#16181A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2D30',
  },
  dateChipText: {
    color: '#F5F7FA',
    fontSize: 14,
fontFamily: 'Montserrat',
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
    backgroundColor: '#16181A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2D30',
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
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#F5F7FA',
    marginBottom: 4,
  },
  checkInDate: {
    fontSize: 12,
fontFamily: 'Montserrat',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  checkInTime: {
    fontSize: 12,
fontFamily: 'Montserrat',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  checkInAddress: {
    fontSize: 12,
fontFamily: 'Montserrat',
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 4,
  },
  checkInNote: {
    fontSize: 12,
fontFamily: 'Montserrat',
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  inspectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16181A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  inspectorName: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#F5F7FA',
    marginBottom: 4,
  },
  inspectorEmail: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  inspectorPhone: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#9CA3AF',
  },
  availabilitySection: {
    marginTop: 16,
  },
  availabilityLabel: {
    fontSize: 14,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  invoiceItem: {
    backgroundColor: '#16181A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2D30',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceTitle: {
    fontSize: 16,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#F5F7FA',
  },
  invoiceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  invoiceStatusText: {
    fontSize: 12,
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
  invoiceAmount: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#F5F7FA',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 12,
fontFamily: 'Montserrat',
    color: '#9CA3AF',
  },
});
