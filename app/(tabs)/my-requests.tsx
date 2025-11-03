import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClientRequests } from '../../src/api/hooks/useClient';
import { useAuth } from '../../src/contexts/AuthContext';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: '0', label: 'Awarded' },
  { value: '1', label: 'Voided' },
  { value: '2', label: 'Rejected' },
  { value: '3', label: 'In Process' },
  { value: '4', label: 'No Response' },
  { value: '5', label: 'Proposed' },
  { value: '6', label: 'Cancelled' },
];

export default function MyRequests() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data, isLoading, isFetching, refetch } = useClientRequests();

  const [searchInput, setSearchInput] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const requests = useMemo(
    () => data?.data || data?.requests || data?.enquiries || [],
    [data]
  );

  // Role-based access control
  if (!isAuthenticated) {
    return <Redirect href="/role-selection" />;
  }

  if (user?.type !== 'client') {
    return <Redirect href="/role-selection" />;
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

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const handleDateSelect = (date: Date, isFromDate: boolean) => {
    const dateStr = formatDateForInput(date);
    if (isFromDate) {
      setFromDate(dateStr);
      setShowFromDatePicker(false);
    } else {
      setToDate(dateStr);
      setShowToDatePicker(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderDatePicker = (isFromDate: boolean, visible: boolean, onClose: () => void) => {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContent}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>
                Select {isFromDate ? 'From' : 'To'} Date
              </Text>
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </Pressable>
            </View>
            
            <View style={styles.calendarHeader}>
              <Pressable onPress={() => navigateMonth('prev')}>
                <Ionicons name="chevron-back" size={24} color="#3B82F6" />
              </Pressable>
              <Text style={styles.monthText}>
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <Pressable onPress={() => navigateMonth('next')}>
                <Ionicons name="chevron-forward" size={24} color="#3B82F6" />
              </Pressable>
            </View>

            <View style={styles.calendarGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <View key={day} style={styles.calendarDayHeader}>
                  <Text style={styles.calendarDayHeaderText}>{day}</Text>
                </View>
              ))}
              {getDaysInMonth(currentMonth).map((day, index) => {
                if (!day) {
                  return <View key={index} style={styles.calendarDay} />;
                }
                const dateStr = formatDateForInput(day);
                const isSelected = isFromDate ? fromDate === dateStr : toDate === dateStr;
                const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                
                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.calendarDay,
                      isSelected && styles.calendarDaySelected,
                      isPast && styles.calendarDayDisabled
                    ]}
                    onPress={() => !isPast && handleDateSelect(day, isFromDate)}
                    disabled={isPast}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      isSelected && styles.calendarDayTextSelected,
                      isPast && styles.calendarDayTextDisabled
                    ]}>
                      {day.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const searchFilteredData = useMemo(() => {
    if (!searchInput.trim()) return requests;
    const searchLower = searchInput.toLowerCase();
    return requests.filter(
      (item: any) =>
        item?.enquiry_no?.toLowerCase().includes(searchLower) ||
        item?.vendor?.toLowerCase().includes(searchLower) ||
        item?.job_title?.toLowerCase().includes(searchLower) ||
        item?.category?.toLowerCase().includes(searchLower) ||
        item?.country?.name?.toLowerCase().includes(searchLower)
    );
  }, [requests, searchInput]);

  const dateFilteredData = useMemo(() => {
    if (!fromDate && !toDate) return searchFilteredData;
    return searchFilteredData.filter((item: any) => {
      const createdAtDate = new Date(item.created_at).toISOString().split('T')[0];
      return (
        (!fromDate || createdAtDate >= fromDate) &&
        (!toDate || createdAtDate <= toDate)
      );
    });
  }, [searchFilteredData, fromDate, toDate]);

  const statusFilteredData = useMemo(() => {
    if (!statusFilter) return dateFilteredData;
    return dateFilteredData.filter(
      (item: any) => String(item.status) === statusFilter
    );
  }, [dateFilteredData, statusFilter]);

  const getStatusInfo = (status: number, isCompleted?: boolean) => {
    if (isCompleted) {
      return { name: 'Completed', color: '#10B981', bgColor: '#10B981' };
    }

    switch (status) {
      case 0:
        return { name: 'Awarded', color: '#F59E0B', bgColor: '#F59E0B' };
      case 1:
        return { name: 'Voided', color: '#F59E0B', bgColor: '#F59E0B' };
      case 2:
        return { name: 'Rejected', color: '#EF4444', bgColor: '#EF4444' };
      case 3:
        return { name: 'In Process', color: '#EF4444', bgColor: '#EF4444' };
      case 4:
        return { name: 'No Response', color: '#EF4444', bgColor: '#EF4444' };
      case 5:
        return { name: 'Proposed', color: '#10B981', bgColor: '#10B981' };
      case 6:
        return { name: 'Cancelled', color: '#EF4444', bgColor: '#EF4444' };
      default:
        return { name: 'Pending', color: '#F59E0B', bgColor: '#F59E0B' };
    }
  };

  const handleRequestPress = (id: number | string) => {
    router.push(`/(stack)/rfi/${id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>My Requests</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={!!isFetching} onRefresh={refetch} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search enquiry..."
            placeholderTextColor="#9CA3AF"
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter request by date & status</Text>
          <View style={styles.filterRow}>
            <Pressable
              style={styles.dateInputContainer}
              onPress={() => setShowFromDatePicker(true)}
            >
              <Text style={[styles.dateInputText, !fromDate && styles.dateInputPlaceholder]}>
                {fromDate || 'From date'}
              </Text>
              {fromDate ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setFromDate('');
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={18} color="#6B7280" />
                </Pressable>
              ) : (
                <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
              )}
            </Pressable>

            <Pressable
              style={styles.dateInputContainer}
              onPress={() => setShowToDatePicker(true)}
            >
              <Text style={[styles.dateInputText, !toDate && styles.dateInputPlaceholder]}>
                {toDate || 'To date'}
              </Text>
              {toDate ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setToDate('');
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={18} color="#6B7280" />
                </Pressable>
              ) : (
                <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
              )}
            </Pressable>

            <View style={styles.dropdownContainer}>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !statusFilter && styles.dropdownPlaceholder,
                  ]}
                >
                  {STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label ||
                    'Status'}
                </Text>
                <Ionicons
                  name={showStatusDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
              {showStatusDropdown && (
                <View style={styles.dropdownList}>
                  {STATUS_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setStatusFilter(option.value);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Date Pickers */}
        {renderDatePicker(true, showFromDatePicker, () => setShowFromDatePicker(false))}
        {renderDatePicker(false, showToDatePicker, () => setShowToDatePicker(false))}

        <View style={styles.divider} />

        {/* Requests List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : statusFilteredData.length > 0 ? (
          <View style={styles.requestsList}>
            {statusFilteredData.map((item: any) => {
              const statusInfo = getStatusInfo(
                parseInt(item.status),
                item.is_completed
              );
              return (
                <Pressable
                  key={item.id}
                  style={styles.requestCard}
                  onPress={() => handleRequestPress(item.id)}
                >
                  <View style={styles.requestHeader}>
                    <View style={styles.requestTitleContainer}>
                      <Text style={styles.categoryText}>
                        Category: {item.category || 'N/A'}
                      </Text>
                      <Text style={styles.requestTitle} numberOfLines={2}>
                        {item.job_title || 'Untitled Request'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusInfo.bgColor },
                      ]}
                    >
                      <Text style={styles.statusText}>{statusInfo.name}</Text>
                    </View>
                  </View>

                  <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color="#64748B" />
                      <Text style={styles.detailText}>
                        {item?.country?.name || 'Location N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color="#64748B" />
                      <Text style={styles.detailText}>
                        {formatDate(item.created_at)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rfiBadge}>
                    <Text style={styles.rfiText}>
                      RFI No: RFI{item.id}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No requests found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchInput || fromDate || toDate || statusFilter
                ? 'Try adjusting your filters or search terms'
                : 'Create your first inspection request to get started'}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#1F2937',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
fontFamily: 'Montserrat',
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dateInputText: {
    flex: 1,
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#1F2937',
  },
  dateInputPlaceholder: {
    color: '#9CA3AF',
  },
  clearButton: {
    padding: 4,
  },
  dropdownContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#1F2937',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#1F2937',
  },
  divider: {
    height: 8,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
    borderRadius: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#6B7280',
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 12,
fontFamily: 'Montserrat',
    color: '#475569',
    marginBottom: 4,
  },
  requestTitle: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 90,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
fontFamily: 'Montserrat',
    fontWeight: '500',
    color: '#FFFFFF',
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
fontFamily: 'Montserrat',
    color: '#64748B',
    fontWeight: '300',
  },
  rfiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEDFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rfiText: {
    fontSize: 12,
fontFamily: 'Montserrat',
    color: '#15416E',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 20,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#1F2937',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthText: {
    fontSize: 18,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#1F2937',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  calendarDayHeader: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarDayHeaderText: {
    fontSize: 12,
fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calendarDaySelected: {
    backgroundColor: '#3B82F6',
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#1F2937',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarDayTextDisabled: {
    color: '#9CA3AF',
  },
});

