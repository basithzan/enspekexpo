import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMyBids } from '../../../src/api/hooks/useInspector';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function BidsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: bidsData, isLoading, isFetching, refetch, error } = useMyBids();
  
  
  const bids = useMemo(() => {
    // Based on the API response structure: { "my_bids": [[Object], [Object], [Object]] }
    const bidsList = bidsData?.my_bids || 
                    bidsData?.data || 
                    bidsData?.bids || 
                    bidsData?.accepted_inspectors ||
                    bidsData?.enquiries ||
                    bidsData?.jobs ||
                    [];
    
    
    // Sort by date (newest first)
    return bidsList.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || a.createdAt || a.updated_at || 0);
      const dateB = new Date(b.created_at || b.createdAt || b.updated_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [bidsData]);
  
  // Role-based access control
  if (!isAuthenticated) {
    return <Redirect href="/role-selection" />;
  }

  if (user?.type !== 'inspector') {
    return <Redirect href="/role-selection" />;
  }

  const openJob = (jobId: string | number) => {
    router.push(`/(stack)/job/${jobId}`);
  };

  const getStatusText = (status: string | number | null | undefined) => {
    // Handle null/undefined status - treat as Active (open for bidding)
    if (status === null || status === undefined) return 'Active';
    const statusStr = String(status).toLowerCase();
    
    // Use API-based status determination - only consider explicitly completed/finished as completed
    if (statusStr === 'completed' || statusStr === 'finished') {
      return 'Completed';
    }
    
    switch (statusStr) {
      case '0': return 'Active';
      case '1': return 'Pending';
      case '2': return 'Accepted';
      case '3': return 'Rejected';
      case '4': return 'Cancelled';
      case '5': return 'Active'; // Status 5 is not completed based on user feedback
      case '6': return 'In Progress';
      default: return 'Active'; // Default to Active for unknown status
    }
  };

  const getStatusColor = (status: string | number | null | undefined) => {
    // Handle null/undefined status - treat as Active (green background)
    if (status === null || status === undefined) return '#10B981'; // Light green for active status
    const statusStr = String(status).toLowerCase();
    
    // Use API-based status determination - only consider explicitly completed/finished as completed
    if (statusStr === 'completed' || statusStr === 'finished') {
      return '#10B981'; // Light green for completed
    }
    
    switch (statusStr) {
      case '0':
      case 'active': return '#10B981'; // Light green for active status
      case '1':
      case 'pending': return '#F59E0B';
      case '2':
      case 'accepted': return '#10B981';
      case '3':
      case 'rejected': return '#EF4444';
      case '4':
      case 'cancelled': return '#6B7280';
      case '5': return '#10B981'; // Status 5 is active, not completed
      case '6':
      case 'in_progress': return '#3B82F6';
      default: return '#10B981'; // Default to active green for unknown status
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to find amount field
  const findAmountField = (item: any) => {
    // First check if there's an accepted_inspectors array with bid data
    if (item.accepted_inspectors && Array.isArray(item.accepted_inspectors) && item.accepted_inspectors.length > 0) {
      const acceptedInspector = item.accepted_inspectors[0];
      if (acceptedInspector.amount) {
        return acceptedInspector.amount;
      }
    }
    
    const possibleFields = [
      'amount', 'bid_amount', 'accepted_amount', 'price', 'value', 
      'cost', 'fee', 'rate', 'bid_price', 'bid_value', 'bid_cost',
      'accepted_price', 'accepted_value', 'accepted_cost'
    ];
    
    // Try the specific fields
    for (const field of possibleFields) {
      if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
        return item[field];
      }
    }
    
    return null;
  };

  // Function to find currency field
  const findCurrencyField = (item: any) => {
    // First check if there's an accepted_inspectors array with bid data
    if (item.accepted_inspectors && Array.isArray(item.accepted_inspectors) && item.accepted_inspectors.length > 0) {
      const acceptedInspector = item.accepted_inspectors[0];
      if (acceptedInspector.currencies) {
        return acceptedInspector.currencies;
      }
    }
    
    const possibleFields = [
      'currencies', 'currency', 'bid_currency', 'accepted_currency'
    ];
    
    // Try the specific fields
    for (const field of possibleFields) {
      if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
        return item[field];
      }
    }
    
    return 'USD'; // Default to USD if no currency found
  };

  // Function to get currency symbol
  const getCurrencySymbol = (currencyCode: string) => {
    const currencyMap: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'AED': 'د.إ',
      'SAR': '﷼'
    };
    return currencyMap[currencyCode] || '$';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bids</Text>
          <Text style={styles.subtitle}>Track your bid submissions and their status</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading your bids...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bids</Text>
          <Text style={styles.subtitle}>Track your bid submissions and their status</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load bids</Text>
          <Text style={styles.errorDescription}>
            There was an error loading your bids. Please try again.
          </Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bids</Text>
        <Text style={styles.subtitle}>Track your bid submissions and their status</Text>
      </View>
      
      {bids?.length > 0 ? (
        <FlashList
          data={bids}
          keyExtractor={(item: any) => String(item.id ?? Math.random())}
          renderItem={({ item }) => (
            <BidCard 
              item={item} 
              onPress={() => openJob(item.enquiry_id || item.job_id || item.id)}
              getStatusText={getStatusText}
              getStatusColor={getStatusColor}
              findAmountField={findAmountField}
              findCurrencyField={findCurrencyField}
              getCurrencySymbol={getCurrencySymbol}
            />
          )}
          estimatedItemSize={120}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
        />
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No bids yet</Text>
            <Text style={styles.emptyDescription}>
              Start bidding on jobs to see your submissions here.
            </Text>
            <Pressable 
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/inspector')}
            >
              <Text style={styles.browseButtonText}>Browse Jobs</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function BidCard({ item, onPress, getStatusText, getStatusColor, findAmountField, findCurrencyField, getCurrencySymbol }: { 
  item: any; 
  onPress: () => void; 
  getStatusText: (status: string | number) => string;
  getStatusColor: (status: string | number) => string;
  findAmountField: (item: any) => any;
  findCurrencyField: (item: any) => string;
  getCurrencySymbol: (currencyCode: string) => string;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Pressable style={styles.bidCard} onPress={onPress}>
      <View style={styles.bidHeader}>
        <View style={styles.bidTitleContainer}>
          <Text style={styles.bidTitle}>
            {item.job_title || 
             item.title || 
             item.enquiry?.job_title || 
             item.enquiry_title ||
             item.project_name ||
             'Inspection Job'}
          </Text>
          <Text style={styles.bidId}>
            RFI{item.enquiry_id || item.job_id || item.id || item.enquiry?.id}
          </Text>
        </View>
      </View>
      
      <View style={styles.bidDetails}>
        <View style={styles.bidInfo}>
          <Text style={styles.bidLabel}>Bid Amount</Text>
          <Text style={styles.bidValue}>
            {(() => {
              const amount = findAmountField(item);
              const currency = findCurrencyField(item);
              const symbol = getCurrencySymbol(currency);
              return amount ? `${symbol}${amount}` : 'N/A';
            })()}
          </Text>
        </View>
        
        <View style={styles.bidInfo}>
          <Text style={styles.bidLabel}>Job Posted On</Text>
          <Text style={styles.bidValue}>
            {(() => {
              // The job creation date is in the main item.created_at field
              // This is when the job was originally posted
              const jobDate = item?.created_at;
              
              console.log('🔍 Job Date Debug - My Bids:', {
                jobCreatedAt: item?.created_at,
                selectedJobDate: jobDate
              });
              
              return jobDate ? formatDate(jobDate) : 'N/A';
            })()}
          </Text>
        </View>
      </View>
      
      <View style={styles.bidDetails}>
        <View style={styles.bidInfo}>
          <Text style={styles.bidLabel}>Bid Placed On</Text>
          <Text style={styles.bidValue}>
            {(() => {
              // The bid creation date should be in the accepted_inspectors array
              // This is when the user actually placed their bid
              let bidDate = null;
              
              // Check if there's an accepted_inspectors array with bid data
              if (item?.accepted_inspectors && Array.isArray(item.accepted_inspectors) && item.accepted_inspectors.length > 0) {
                const acceptedInspector = item.accepted_inspectors[0];
                // Try to find bid creation date in the accepted inspector data
                bidDate = acceptedInspector.created_at || 
                         acceptedInspector.bid_created_at || 
                         acceptedInspector.bid_date ||
                         acceptedInspector.submitted_at;
              }
              
              // Fallback to updated_at if no bid-specific date found
              if (!bidDate) {
                bidDate = item?.updated_at;
              }
              
              console.log('🔍 Bid Date Debug - My Bids:', {
                acceptedInspectors: item?.accepted_inspectors,
                acceptedInspectorData: item?.accepted_inspectors?.[0],
                updatedAt: item?.updated_at,
                selectedBidDate: bidDate
              });
              
              return bidDate ? formatDate(bidDate) : 'N/A';
            })()}
          </Text>
        </View>
        
        <View style={styles.bidInfo}>
          <Text style={styles.bidLabel}>Status</Text>
          <Text style={[styles.bidValue, { color: getStatusColor(item.status || item.bid_status || item.accepted_status || (item.accepted_inspectors?.[0]?.status) || '1') }]}>
            {getStatusText(item.status || item.bid_status || item.accepted_status || (item.accepted_inspectors?.[0]?.status) || '1')}
          </Text>
        </View>
      </View>
      
      <View style={styles.bidFooter}>
        <Text style={styles.bidLocation}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          {' '}{item.vendor_location || item.location || 'Location not specified'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  browseButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bidCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bidHeader: {
    marginBottom: 12,
  },
  bidTitleContainer: {
    flex: 1,
  },
  bidTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  bidId: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  bidDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bidInfo: {
    flex: 1,
  },
  bidLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  bidValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  bidFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bidLocation: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
