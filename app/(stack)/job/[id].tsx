import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Linking,
  Platform,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../src/api/client";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
// MapView import - using try/catch to handle missing native module
let MapView: any = null;
let Marker: any = null;
try {
  const maps = require("expo-maps");
  MapView = maps.ExpoMap || maps.default;
} catch (e) {
  // Map module not available - will show placeholder instead
  console.warn("Map module not available:", e);
}
import { useEnquiryCheckIn } from "../../../src/api/hooks/useEnquiry";
import { useAuth } from "../../../src/contexts/AuthContext";
import { HapticPressable } from "../../../src/components/HapticPressable";
import {
  HapticType,
  hapticSuccess,
  hapticError,
} from "../../../src/utils/haptics";
import { FONTS } from "../../../src/config/fonts";

const WEBSITE_IMAGE_URL = "https://erpbeta.enspek.com";

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  console.log("JobDetailsScreen rendered with new map implementation");

  const [bidAmount, setBidAmount] = useState("");
  const [bidCurrency, setBidCurrency] = useState("USD");
  const [bidDates, setBidDates] = useState<string[]>([]);
  const [bidAmountType, setBidAmountType] = useState("daily");
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{ agora?: string | null }>({});
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkinsLoading, setCheckinsLoading] = useState(false);
  const [checkins, setCheckins] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showLocationLoading, setShowLocationLoading] = useState(false);

  // Check-in modal states
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null);
  const [checkInPhotoFile, setCheckInPhotoFile] = useState<any>(null);
  const [checkInNote, setCheckInNote] = useState("");
  const [fetchedLocation, setFetchedLocation] = useState<{
    address?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);
  const [isLocationFetched, setIsLocationFetched] = useState(false);

  // Inspection document upload states
  const [flashReportFile, setFlashReportFile] = useState<any>(null);
  const [flashReportName, setFlashReportName] = useState("");
  const [inspectionDocFile, setInspectionDocFile] = useState<any>(null);
  const [inspectionDocName, setInspectionDocName] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [isUploadingInspection, setIsUploadingInspection] = useState(false);
  const [inspectionDocs, setInspectionDocs] = useState<any[]>([]);
  const [flashReports, setFlashReports] = useState<any[]>([]);
  const [isConfirmingProceed, setIsConfirmingProceed] = useState(false);

  const checkInMutation = useEnquiryCheckIn();

  // Parse availability dates from DD/MM/YYYY format
  const parseAvailabilityDates = useCallback((availability: string | null | undefined): Date[] => {
    if (!availability) return [];
    
    try {
      // Split by comma and parse each date
      const dateStrings = availability.split(',').map(s => s.trim()).filter(Boolean);
      return dateStrings
        .map(dateStr => {
          // Try DD/MM/YYYY format first (most common)
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) return date;
          }
          
          // Try YYYY-MM-DD format
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) return date;
          }
          
          // Try full date string format (e.g., "November 6, 2025")
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) return date;
          
          return null;
        })
        .filter((date): date is Date => date !== null);
    } catch (e) {
      console.error('Error parsing availability dates:', e);
      return [];
    }
  }, []);


  // Check if user has already checked in today
  const hasCheckedInToday = useCallback((): boolean => {
    if (!checkins || checkins.length === 0) return false;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return checkins.some((checkin: any) => {
      if (!checkin.created_at && !checkin.date) return false;
      
      // Parse the check-in date
      const checkInDateStr = checkin.created_at || checkin.date;
      let checkInDate: Date;
      
      try {
        checkInDate = new Date(checkInDateStr);
        if (isNaN(checkInDate.getTime())) return false;
      } catch {
        return false;
      }
      
      const checkInDateOnly = checkInDate.toISOString().split('T')[0];
      return checkInDateOnly === todayStr;
    });
  }, [checkins]);


  // Check if bid form is valid
  const isBidFormValid = React.useMemo(() => {
    return (
      bidAmount.trim() !== "" &&
      !isNaN(Number(bidAmount)) &&
      Number(bidAmount) > 0 &&
      selectedDates.length > 0
    );
  }, [bidAmount, selectedDates]);

  // Auto-scroll to Submit Your Bid section when bid button is clicked
  const scrollToBidSection = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDates((prev) => {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const isAlreadySelected = prev.some(
          (date) => date.toISOString().split("T")[0] === dateStr
        );

        if (isAlreadySelected) {
          // Remove if already selected
          return prev.filter(
            (date) => date.toISOString().split("T")[0] !== dateStr
          );
        } else {
          // Add if not selected
          return [...prev, selectedDate].sort(
            (a, b) => a.getTime() - b.getTime()
          );
        }
      });
    }
  }, []);

  // Remove selected date
  const removeDate = useCallback((dateToRemove: Date) => {
    setSelectedDates((prev) =>
      prev.filter(
        (date) =>
          date.toISOString().split("T")[0] !==
          dateToRemove.toISOString().split("T")[0]
      )
    );
  }, []);

  // Calendar utility functions
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const endingDayOfWeek = lastDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Add empty cells after the last day to complete the week
    // If the month ends on Saturday (6), we don't need to add any
    // Otherwise, add cells until we reach Saturday
    const remainingDays = 6 - endingDayOfWeek;
    for (let i = 0; i < remainingDays; i++) {
      days.push(null);
    }

    console.log('📅 Calendar Debug:', {
      month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalDays: days.length,
      startingDayOfWeek,
      endingDayOfWeek,
      daysInMonth,
      firstFewDays: days.slice(0, 10).map(d => d ? d.getDate() : 'null'),
      lastFewDays: days.slice(-10).map(d => d ? d.getDate() : 'null'),
    });

    return days;
  }, []);

  const isDateSelected = useCallback((date: Date, selectedDates: Date[]) => {
    return selectedDates.some(
      (selectedDate) =>
        selectedDate.toISOString().split("T")[0] ===
        date.toISOString().split("T")[0]
    );
  }, []);

  const toggleDateSelection = useCallback((date: Date) => {
    setTempSelectedDates((prev) => {
      const isSelected = prev.some(
        (selectedDate) =>
          selectedDate.toISOString().split("T")[0] ===
          date.toISOString().split("T")[0]
      );

      if (isSelected) {
        return prev.filter(
          (selectedDate) =>
            selectedDate.toISOString().split("T")[0] !==
            date.toISOString().split("T")[0]
        );
      } else {
        return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
      }
    });
  }, []);

  const saveSelectedDates = useCallback(() => {
    setSelectedDates(tempSelectedDates);
    setShowDatePicker(false);
  }, [tempSelectedDates]);

  const openDatePicker = useCallback(() => {
    setTempSelectedDates([...selectedDates]);
    setShowDatePicker(true);
  }, [selectedDates]);

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
    { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  ];

  // Fetch job details
  const {
    data: jobData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["job-details", id],
    queryFn: async () => {
      console.log("Fetching job details for ID:", id);
      const response = await apiClient.post("/get-single-enquiry", {
        id: Number(id),
      });
      console.log("API Response:", JSON.stringify(response.data, null, 2));
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch video conferencing info (Agora only)
  const fetchVideoInfo = useCallback(async () => {
    try {
      setVideoLoading(true);
      const res = await apiClient.get(`/agora-video/enquiry/${id}`);
      const agoraLink = res?.data?.data?.participants?.joinee_link || null;
      setVideoInfo({ agora: agoraLink });
    } catch (e) {
      setVideoInfo({ agora: null });
    } finally {
      setVideoLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchVideoInfo();
  }, [id, fetchVideoInfo]);

  const fetchCheckIns = useCallback(async () => {
    try {
      setCheckinsLoading(true);
      // Prefer the single enquiry response which typically includes checkIns
      const res = await apiClient.post("/get-single-enquiry", {
        id: Number(id),
      });
      const list =
        res?.data?.checkIns ||
        res?.data?.data?.checkIns ||
        res?.data?.enquiry?.checkIns ||
        [];
      setCheckins(Array.isArray(list) ? list : []);
    } catch (e) {
      setCheckins([]);
    } finally {
      setCheckinsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchCheckIns();
  }, [id, fetchCheckIns]);

  // Seed from initial jobData if available
  useEffect(() => {
    const list =
      jobData?.checkIns ||
      jobData?.data?.checkIns ||
      jobData?.enquiry?.checkIns;
    if (Array.isArray(list) && list.length) {
      setCheckins(list);
    }

    // Load inspection documents and flash reports
    const inspDocs =
      jobData?.inspection_docs ||
      jobData?.data?.inspection_docs ||
      jobData?.enquiry?.inspection_docs;
    if (Array.isArray(inspDocs)) {
      setInspectionDocs(inspDocs);
    }

    const flashReps =
      jobData?.flash_reports ||
      jobData?.data?.flash_reports ||
      jobData?.enquiry?.flash_reports;
    if (Array.isArray(flashReps)) {
      setFlashReports(flashReps);
    }
  }, [jobData]);

  // Check if today is an available check-in date (defined after jobData query)
  const isTodayAvailableForCheckIn = useCallback((): boolean => {
    if (!jobData) return false;
    
    // First check bid availability dates
    let availability = jobData?.my_bid?.availability || jobData?.accepted_bid?.availability;
    let availableDates: Date[] = [];
    
    if (availability) {
      availableDates = parseAvailabilityDates(availability);
    }
    
    // If no availability dates from bid, check estimated inspection dates as fallback
    if (availableDates.length === 0) {
      const estDates = jobData?.enquiry?.est_inspection_date || 
                       jobData?.est_inspection_date || 
                       jobData?.inspection_dates || 
                       jobData?.est_dates;
      if (estDates) {
        availableDates = parseAvailabilityDates(estDates);
      }
    }
    
    if (availableDates.length === 0) return false;
    
    // Get today's date in local timezone, normalized to midnight
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    const todayNormalized = new Date(todayYear, todayMonth, todayDay);
    
    // Check if today matches any available date
    return availableDates.some(date => {
      const availableDate = new Date(date);
      const availableYear = availableDate.getFullYear();
      const availableMonth = availableDate.getMonth();
      const availableDay = availableDate.getDate();
      const availableNormalized = new Date(availableYear, availableMonth, availableDay);
      
      return availableNormalized.getTime() === todayNormalized.getTime();
    });
  }, [jobData, parseAvailabilityDates]);

  // Check if user has already bid on this job
  const hasUserBid = jobData?.already_bidded || jobData?.my_bid;
  const userBidStatus = jobData?.my_bid?.status || jobData?.my_bid_status;

  // Determine if check-in button should be enabled
  const canCheckIn = React.useMemo(() => {
    if (!hasUserBid || (String(userBidStatus).toLowerCase() !== 'accepted' && String(userBidStatus) !== '2')) {
      return false;
    }
    
    const todayIsAvailable = isTodayAvailableForCheckIn();
    const alreadyCheckedIn = hasCheckedInToday();
    
    return todayIsAvailable && !alreadyCheckedIn;
  }, [hasUserBid, userBidStatus, isTodayAvailableForCheckIn, hasCheckedInToday, jobData]);

  // Get check-in status message
  const getCheckInStatusMessage = useCallback((): string | null => {
    if (!hasUserBid || (String(userBidStatus).toLowerCase() !== 'accepted' && String(userBidStatus) !== '2')) {
      return null;
    }

    if (hasCheckedInToday()) {
      return 'Already checked in today';
    }

    // First check bid availability dates
    let availability = jobData?.my_bid?.availability || jobData?.accepted_bid?.availability;
    let availableDates: Date[] = [];
    
    if (availability) {
      availableDates = parseAvailabilityDates(availability);
    }
    
    // If no availability dates from bid, check estimated inspection dates as fallback
    if (availableDates.length === 0) {
      const estDates = jobData?.enquiry?.est_inspection_date || 
                       jobData?.est_inspection_date || 
                       jobData?.inspection_dates || 
                       jobData?.est_dates;
      if (estDates) {
        availableDates = parseAvailabilityDates(estDates);
      }
    }

    if (availableDates.length === 0) {
      return 'No check-in dates available';
    }

    // Get today's date in local timezone, normalized to midnight
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    const todayNormalized = new Date(todayYear, todayMonth, todayDay);
    
    // Find the next available date
    const sortedDates = availableDates.sort((a, b) => a.getTime() - b.getTime());
    const nextDate = sortedDates.find(date => {
      const availableDate = new Date(date);
      const availableYear = availableDate.getFullYear();
      const availableMonth = availableDate.getMonth();
      const availableDay = availableDate.getDate();
      const availableNormalized = new Date(availableYear, availableMonth, availableDay);
      return availableNormalized.getTime() >= todayNormalized.getTime();
    });

    if (!nextDate) {
      return 'No upcoming check-in dates';
    }

    const nextDateStr = nextDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `Check-in available on ${nextDateStr}`;
  }, [hasUserBid, userBidStatus, hasCheckedInToday, jobData, parseAvailabilityDates]);

  // Bid mutation
  const bidMutation = useMutation({
    mutationFn: async (bidData: any) => {
      const response = await apiClient.post("/bid-for-enquiry", bidData);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("✅ Bid submitted successfully:", data);
      console.log("🔄 Invalidating queries for job ID:", id);

      Alert.alert("Success", "Your bid has been submitted successfully!");

      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["my-bids"] });
      queryClient.invalidateQueries({ queryKey: ["nearby-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["bid-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job-details", id] });

      // Force refetch nearby jobs and bid jobs
      queryClient.refetchQueries({ queryKey: ["nearby-jobs"] });
      queryClient.refetchQueries({ queryKey: ["bid-jobs"] });

      console.log("🔄 Queries invalidated, navigating back...");
      router.back();
    },
    onError: (error: any) => {
      console.error("Bid submission error:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to submit bid"
      );
    },
  });

  const handleSubmitBid = useCallback(async () => {
    if (!isBidFormValid) {
      Alert.alert("Required Details", "Please fill required details first");
      // Auto-scroll to bid section when form is invalid
      scrollToBidSection();
      return;
    }

    setIsSubmittingBid(true);

    try {
      // Format dates in local timezone to avoid timezone shift issues
      const formattedDates = selectedDates.map((date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      });

      console.log('📅 Submitting bid with dates:', {
        selectedDates,
        formattedDates,
      });

      await bidMutation.mutateAsync({
        id: Number(id),
        amount: Number(bidAmount),
        dates: formattedDates,
        currencies: bidCurrency,
        amount_type: bidAmountType,
      });
    } catch (error) {
      console.error("Bid submission error:", error);
    } finally {
      setIsSubmittingBid(false);
    }
  }, [
    isBidFormValid,
    bidAmount,
    selectedDates,
    bidCurrency,
    bidAmountType,
    id,
    bidMutation,
    scrollToBidSection,
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !jobData?.success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to load job</Text>
          <Text style={styles.errorMessage}>
            {error?.message || "Failed to fetch job details"}
          </Text>
          <HapticPressable
            style={styles.retryButton}
            onPress={() => router.back()}
            hapticType={HapticType.Medium}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </HapticPressable>
        </View>
      </SafeAreaView>
    );
  }

  const job = jobData?.enquiry || jobData?.data || jobData;

  // Debug logging for job details
  console.log("🔍 Job Details Debug:", {
    jobId: job?.id,
    jobStatus: job?.status,
    jobData: jobData,
    hasUserBid: jobData?.already_bidded || jobData?.my_bid,
    userBidStatus: jobData?.my_bid?.status || jobData?.my_bid_status,
  });

  // Special debug for RFI105
  if (job?.id === 105 || job?.id === "105") {
    console.log("🔍 RFI105 Special Debug:", {
      jobId: job?.id,
      jobStatus: job?.status,
      statusType: typeof job?.status,
      statusString: String(job?.status),
      statusNumber: parseInt(String(job?.status)),
      jobTitle: job?.job_title || job?.title,
      fullJobData: job,
      fullResponseData: jobData,
    });
  }

  // Special debug for RFI270
  if (job?.id === 270 || job?.id === "270") {
    console.log("🔍 RFI270 Special Debug:", {
      jobId: job?.id,
      jobStatus: job?.status,
      statusType: typeof job?.status,
      statusString: String(job?.status),
      statusNumber: parseInt(String(job?.status)),
      jobTitle: job?.job_title || job?.title,
      fullJobData: job,
      fullResponseData: jobData,
    });
  }

  // Additional bid information
  const userBidAmount = jobData?.my_bid?.amount || jobData?.my_bid_amount;
  const userBidCurrency =
    jobData?.my_bid?.currencies || jobData?.my_bid_currency;

  // Function to get currency symbol
  const getCurrencySymbol = (currencyCode: string) => {
    const currencyMap: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      AED: "د.إ",
      SAR: "﷼",
    };
    return currencyMap[currencyCode] || "$";
  };

  // Status helper functions
  const getStatusColor = (status: string | number | null | undefined) => {
    // Handle null/undefined status - treat as Active (green background)
    if (status === null || status === undefined) {
      console.log(
        "🔍 Color Debug - Null/undefined status, defaulting to Active green"
      );
      return "#10B981"; // Light green for active status
    }

    const statusStr = String(status).toLowerCase();

    // Use API-based status determination - only consider explicitly completed/finished as completed
    if (statusStr === "completed" || statusStr === "finished") {
      return "#10B981"; // Light green for completed
    }

    switch (statusStr) {
      case "0":
      case "active":
        return "#10B981"; // Light green for active status
      case "1":
      case "pending":
        return "#F59E0B";
      case "2":
      case "accepted":
        return "#10B981";
      case "3":
      case "rejected":
        return "#EF4444";
      case "4":
      case "cancelled":
        return "#6B7280";
      case "5":
        return "#10B981"; // Status 5 is active, not completed
      case "6":
      case "in_progress":
        return "#3B82F6";
      default:
        return "#10B981"; // Default to active green for unknown status
    }
  };

  // Open check-in modal and fetch location
  const handleCheckInPress = async () => {
    // Validate check-in eligibility
    if (!canCheckIn) {
      const message = getCheckInStatusMessage();
      Alert.alert('Check-in Unavailable', message || 'Check-in is not available at this time.');
      return;
    }

    try {
      setIsCheckingIn(true);
      setShowLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Location permission is needed to check in."
        );
        setIsCheckingIn(false);
        setShowLocationLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      let addressText = "";
      try {
        const geo = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        if (geo && geo.length > 0) {
          const g = geo[0];
          addressText = [
            g.name,
            g.street,
            g.city,
            g.region,
            g.postalCode,
            g.country,
          ]
            .filter(Boolean)
            .join(", ");
        }
      } catch {}

      setFetchedLocation({
        address: addressText,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setIsLocationFetched(true);
      setShowLocationLoading(false);
      setShowCheckInModal(true);
    } catch (e: any) {
      setShowLocationLoading(false);
      Alert.alert("Location Error", e?.message || "Unable to fetch location.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Handle photo upload
  const handleCheckInPhotoUpload = async () => {
    try {
      // Request camera permissions
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera permission is needed to take a check-in photo."
        );
        return;
      }

      // Directly launch camera without showing options
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCheckInPhoto(result.assets[0].uri);
        setCheckInPhotoFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to open camera. Please try again.");
    }
  };

  // Submit check-in with photo
  const handleSubmitCheckIn = async () => {
    try {
      if (!checkInPhoto && !checkInPhotoFile) {
        Alert.alert("Photo Required", "Please add a check-in photo");
        return;
      }

      if (!fetchedLocation || !fetchedLocation.address) {
        Alert.alert("Location Required", "Please fetch location first");
        return;
      }

      setIsCheckingIn(true);

      // Get auth token from context
      const authToken = user?.auth_token;

      // Get master_log_id
      const masterLogId =
        job?.enquiry?.master_logs?.[0]?.id ||
        jobData?.enquiry?.master_logs?.[0]?.id ||
        job?.master_logs?.[0]?.id ||
        jobData?.master_logs?.[0]?.id ||
        jobData?.my_bid?.master_log_id ||
        jobData?.data?.enquiry?.master_logs?.[0]?.id ||
        jobData?.data?.master_logs?.[0]?.id;

      // Create FormData
      const formData = new FormData();
      if (authToken) {
        formData.append("token", authToken);
      }
      formData.append("enquiry_log_id", String(id));
      if (masterLogId) {
        formData.append("master_log_id", String(masterLogId));
      }
      formData.append("address", fetchedLocation.address);
      formData.append("latitude", String(fetchedLocation.latitude));
      formData.append("longitude", String(fetchedLocation.longitude));

      if (checkInPhotoFile) {
        // For React Native, FormData accepts file objects with uri, type, and name
        // @ts-ignore - React Native FormData accepts objects with uri
        formData.append("imageAndroid", {
          uri: checkInPhotoFile.uri,
          type: checkInPhotoFile.type || "image/jpeg",
          name: checkInPhotoFile.fileName || "checkin.jpg",
        });
        // Also append as 'image' for compatibility with API
        // @ts-ignore
        formData.append("image", {
          uri: checkInPhotoFile.uri,
          type: checkInPhotoFile.type || "image/jpeg",
          name: checkInPhotoFile.fileName || "checkin.jpg",
        });
      }

      if (checkInNote) {
        formData.append("note", checkInNote);
      }

      await checkInMutation.mutateAsync(formData);

      // Reset form
      setCheckInNote("");
      setFetchedLocation(null);
      setIsLocationFetched(false);
      setCheckInPhoto(null);
      setCheckInPhotoFile(null);
      setShowCheckInModal(false);

      Alert.alert("Success", "Checked in successfully");
      fetchCheckIns();
      queryClient.invalidateQueries({ queryKey: ["job-details", id] });
    } catch (e: any) {
      console.error("Check-in error:", e);
      Alert.alert(
        "Check-in failed",
        e?.response?.data?.message ||
          "Unable to complete check-in. Please try again."
      );
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Handle flash report file upload
  const handleFlashReportUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        setFlashReportFile(file);
        setFlashReportName(file.name || "flash_report");
      }
    } catch (error) {
      console.error("Error picking flash report:", error);
      Alert.alert("Error", "Failed to pick flash report");
    }
  };

  // Handle inspection document file upload
  const handleInspectionDocUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        setInspectionDocFile(file);
        setInspectionDocName(file.name || "inspection_doc");
      }
    } catch (error) {
      console.error("Error picking inspection document:", error);
      Alert.alert("Error", "Failed to pick inspection document");
    }
  };

  // Submit inspection data (flash report + inspection document + note)
  const handleSubmitInspectionData = async () => {
    try {
      if (!flashReportFile && !inspectionDocFile && !reportNote) {
        Alert.alert("Required", "Please add at least one file or note");
        return;
      }

      setIsUploadingInspection(true);

      const authToken = user?.auth_token;
      const masterLogId =
        job?.enquiry?.master_logs?.[0]?.id ||
        jobData?.enquiry?.master_logs?.[0]?.id ||
        job?.master_logs?.[0]?.id ||
        jobData?.master_logs?.[0]?.id;

      const formData = new FormData();
      if (authToken) {
        formData.append("token", authToken);
      }
      formData.append("enquiry_log_id", String(id));
      if (masterLogId) {
        formData.append("master_log_id", String(masterLogId));
      }

      if (flashReportFile) {
        // @ts-ignore - React Native FormData
        formData.append("flash_report", {
          uri: flashReportFile.uri,
          type: flashReportFile.mimeType || "application/pdf",
          name: flashReportFile.name || "flash_report.pdf",
        });
      }

      if (inspectionDocFile) {
        // @ts-ignore - React Native FormData
        formData.append("insp_doc", {
          uri: inspectionDocFile.uri,
          type: inspectionDocFile.mimeType || "application/pdf",
          name: inspectionDocFile.name || "inspection_doc.pdf",
        });
      }

      if (reportNote) {
        formData.append("note", reportNote);
      }

      const response = await apiClient.post(
        "/upload-inspection-data",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        Alert.alert(
          "Success",
          "Inspection documents and note submitted successfully"
        );

        // Reset form
        setFlashReportFile(null);
        setFlashReportName("");
        setInspectionDocFile(null);
        setInspectionDocName("");
        setReportNote("");

        // Refetch job details to update the lists
        queryClient.invalidateQueries({ queryKey: ["job-details", id] });
      }
    } catch (e: any) {
      console.error("Inspection upload error:", e);
      Alert.alert(
        "Upload failed",
        e?.response?.data?.message ||
          "Unable to upload inspection data. Please try again."
      );
    } finally {
      setIsUploadingInspection(false);
    }
  };

  // Delete inspection document
  const handleDeleteInspectionDoc = async (docId: number) => {
    try {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this document?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const authToken = user?.auth_token;
                await apiClient.post("/delete-inspection-doc", {
                  token: authToken,
                  id: docId,
                });

                Alert.alert("Success", "Document deleted successfully");
                queryClient.invalidateQueries({ queryKey: ["job-details", id] });
              } catch (error) {
                console.error("Delete error:", error);
                Alert.alert("Error", "Failed to delete document");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Delete document error:", error);
    }
  };

  // Confirm proceed with accepted bid
  const handleConfirmProceed = async () => {
    try {
      setIsConfirmingProceed(true);

      const authToken = user?.auth_token;
      const bidId = jobData?.my_bid?.id;

      if (!bidId) {
        Alert.alert("Error", "Bid ID not found");
        return;
      }

      const response = await apiClient.post("/confirm-proceed", {
        token: authToken,
        id: bidId,
      });

      if (response.data.success) {
        Alert.alert("Success", "Confirmed to proceed with the job");
        queryClient.invalidateQueries({ queryKey: ["job-details", id] });
      }
    } catch (e: any) {
      console.error("Confirm proceed error:", e);
      Alert.alert(
        "Failed",
        e?.response?.data?.message || "Unable to confirm proceed. Please try again."
      );
    } finally {
      setIsConfirmingProceed(false);
    }
  };

  // Open file in browser (for downloads)
  const openFileOnBrowser = (fileUrl: string) => {
    try {
      const fullUrl = fileUrl.startsWith("http")
        ? fileUrl
        : `${WEBSITE_IMAGE_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
      Linking.openURL(fullUrl);
    } catch (error) {
      console.error("Error opening file:", error);
      Alert.alert("Error", "Failed to open file");
    }
  };

  const getStatusText = (status: string | number | null | undefined) => {
    console.log(
      "🔍 Status Debug - Raw status:",
      status,
      "Type:",
      typeof status
    );

    // Handle null/undefined status - treat as Active (open for bidding)
    if (status === null || status === undefined) {
      console.log(
        "🔍 Status Debug - Null/undefined status, defaulting to Active"
      );
      return "Active";
    }

    const statusStr = String(status).toLowerCase();
    console.log("🔍 Status Debug - Status string:", statusStr);

    // Use API-based status determination - only consider explicitly completed/finished as completed
    if (statusStr === "completed" || statusStr === "finished") {
      return "Completed";
    }

    // Map numeric statuses based on API logic
    switch (statusStr) {
      case "0":
        return "Active";
      case "1":
        return "Pending";
      case "2":
        return "Accepted";
      case "3":
        return "Rejected";
      case "4":
        return "Cancelled";
      case "5":
        return "Active"; // Status 5 is not completed based on user feedback
      case "6":
        return "In Progress";
      default:
        return "Active"; // Default to Active for any unknown status
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <HapticPressable
          style={styles.backButton}
          onPress={() => router.back()}
          hapticType={HapticType.Light}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </HapticPressable>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.headerRight}>
          {hasUserBid &&
            (String(userBidStatus).toLowerCase() === "accepted" ||
              String(userBidStatus) === "2") && (
              <HapticPressable
                style={styles.checkInButton}
                onPress={handleCheckInPress}
                disabled={isCheckingIn}
                hapticType={HapticType.Medium}
              >
                <Ionicons name="log-in-outline" size={18} color="#065F46" />
                <Text style={styles.checkInButtonText}>
                  {isCheckingIn ? "Checking in…" : "Check-in"}
                </Text>
              </HapticPressable>
            )}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <View style={styles.jobHeaderTop}>
            <Text style={styles.jobTitle}>
              {job?.job_title || job?.title || "Inspection Job"}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(job?.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(job?.status) },
                ]}
              >
                {getStatusText(job?.status)}
              </Text>
            </View>
          </View>

          {/* RFI Number and Stat Badges - Same Row */}
          <View style={styles.rfiRow}>
            <Text style={styles.jobId}>RFI{String(job?.id ?? "")}</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.statusBadge, styles.statBadge]}>
                <Text style={styles.statBadgeText}>
                  My Bid:{" "}
                  {userBidAmount
                    ? `${getCurrencySymbol(
                        userBidCurrency || "USD"
                      )}${userBidAmount}`
                    : "No Bids"}
                </Text>
              </View>
              <View style={[styles.statusBadge, styles.statBadge]}>
                <Text style={styles.statBadgeText}>
                  Views:{" "}
                  {job?.viewers_count ||
                    job?.views_count ||
                    job?.enquiry_views ||
                    job?.views ||
                    job?.view_count ||
                    job?.total_views ||
                    jobData?.enquiry?.viewers_count ||
                    jobData?.enquiry?.views_count ||
                    jobData?.enquiry?.views ||
                    jobData?.views_count ||
                    "0"}
                </Text>
              </View>
              {hasUserBid && (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(userBidStatus) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(userBidStatus) },
                    ]}
                  >
                    {getStatusText(userBidStatus)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Job Information */}
        <View style={[styles.section, styles.firstSection]}>
          <Text style={styles.sectionTitle}>Job Information</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>
                {job?.category?.name ||
                  job?.category_name ||
                  job?.category ||
                  "N/A"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Commodity</Text>
              <Text style={styles.infoValue}>
                {job?.commodity?.name ||
                  job?.commodity_name ||
                  job?.commodity ||
                  "N/A"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>
                {job?.country?.name || job?.country_name || "N/A"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vendor</Text>
              <Text style={styles.infoValue}>
                {job?.vendor || job?.supplier_name || "N/A"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {job?.vendor_location || job?.supplier_location || "N/A"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>No of Visits</Text>
              <Text style={styles.infoValue}>
                {job?.no_of_visits ||
                  job?.visits ||
                  job?.number_of_visits ||
                  "N/A"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Posted Date</Text>
              <Text style={styles.infoValue}>
                {job?.created_at ? formatDate(job.created_at) : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationHeader}>
              <Ionicons name="location-outline" size={20} color="#3B82F6" />
              <Text style={styles.locationTitle}>
                {job?.vendor_location ||
                  job?.supplier_location ||
                  job?.location ||
                  "Job Location"}
              </Text>
            </View>
            
            {(() => {
              // Validate coordinates - ensure they are valid numbers (matching React logic)
              const validLatitude =
                job?.latitude && !isNaN(parseFloat(String(job.latitude)))
                  ? parseFloat(String(job.latitude))
                  : job?.country?.latitude;
              const validLongitude =
                job?.longitude && !isNaN(parseFloat(String(job.longitude)))
                  ? parseFloat(String(job.longitude))
                  : job?.country?.longitude;

              // Check if we have valid coordinates (not null, not 0, and within valid ranges)
              const hasValidCoordinates =
                validLatitude !== null &&
                validLongitude !== null &&
                validLatitude !== 0 &&
                validLongitude !== 0 &&
                validLatitude >= -90 &&
                validLatitude <= 90 &&
                validLongitude >= -180 &&
                validLongitude <= 180;

              if (!hasValidCoordinates) {
                // Show placeholder when coordinates are invalid (matching React behavior)
                return (
                  <View style={styles.mapContainer}>
                    <View style={styles.mapPlaceholder}>
                      <Ionicons name="map-outline" size={48} color="#6B7280" />
                      <Text style={styles.mapPlaceholderText}>Map Viewee {job.latitude}</Text>
                      <Text style={styles.mapPlaceholderSubtext}>
                        {job?.vendor_location ||
                          job?.supplier_location ||
                          "Location details will be provided upon job acceptance"}
                      </Text>
                    </View>
                  </View>
                );
              }

              // OpenStreetMap URLs (matching React implementation)
              const osmViewUrl = `https://www.openstreetmap.org/?mlat=${validLatitude}&mlon=${validLongitude}#map=15/${validLatitude}/${validLongitude}`;
              const osmDirectionUrl = `https://www.openstreetmap.org/directions?from=&to=${validLatitude}%2C${validLongitude}#map=15/${validLatitude}/${validLongitude}`;

              return (
                <>
                  {/* Embedded Map with Marker (matching React Leaflet implementation) */}
                  <View style={styles.mapContainer}>
                    <Pressable
                      onPress={() => {
                        // Open in full map view when tapped
                        Linking.openURL(osmViewUrl);
                      }}
                      style={styles.embeddedMap}
                    >
                      {MapView ? (
                        <MapView
                          style={styles.embeddedMap}
                          initialCameraPosition={{
                            latitude: validLatitude,
                            longitude: validLongitude,
                            zoom: 15,
                          }}
                          scrollEnabled={false}
                          zoomEnabled={false}
                          pitchEnabled={false}
                          rotateEnabled={false}
                          markers={[
                            {
                              latitude: validLatitude,
                              longitude: validLongitude,
                              title: job?.vendor_location || job?.supplier_location || "Location",
                              description: `${validLatitude}, ${validLongitude}`,
                            },
                          ]}
                        />
                      ) : (
                        <View style={[styles.embeddedMap, { backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center" }]}>
                          <Ionicons name="map-outline" size={48} color="#6B7280" />
                          <Text style={{ marginTop: 8, color: "#6B7280" }}>Map View</Text>
                        </View>
                      )}
                      {/* Overlay tap hint */}
                      <View style={styles.mapOverlay}>
                        <Text style={styles.mapOverlayText}>Tap to open in full map</Text>
                      </View>
                    </Pressable>
                  </View>
                  
                  {/* Get Directions Button */}
                  <HapticPressable
                    style={styles.directionsButton}
                    onPress={() => {
                      Linking.openURL(osmDirectionUrl);
                    }}
                    hapticType={HapticType.Medium}
                  >
                    <Ionicons name="navigate-outline" size={16} color="#3B82F6" />
                    <Text style={styles.directionsButtonText}>Get Directions</Text>
                  </HapticPressable>
                </>
              );
            })()}
          </View>
        </View>

        {/* Scope & Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope & Requirements</Text>
          <Text style={styles.scopeText}>
            {job?.enquiry_scope ||
              job?.scope ||
              job?.description ||
              job?.note ||
              "No scope details provided"}
          </Text>
        </View>

        {/* Inspection Dates */}
        {(() => {
          const raw =
            job?.est_inspection_date || job?.inspection_dates || job?.est_dates;
          if (!raw) return null;
          let dates: string[] = [];
          if (Array.isArray(raw)) dates = raw as string[];
          else if (typeof raw === "string") {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) dates = parsed;
              else
                dates = raw
                  .split(/[,;|]/)
                  .map((s) => s.trim())
                  .filter(Boolean);
            } catch {
              dates = raw
                .split(/[,;|]/)
                .map((s) => s.trim())
                .filter(Boolean);
            }
          }
          const normalize = (s: string) => {
            const d = new Date(s);
            if (!isNaN(d.getTime())) return s;
            const n = s.includes("/") ? s.split("/").reverse().join("-") : s;
            return n;
          };
          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estimated Inspection Date</Text>
              <View style={styles.dateChipWrap}>
                {(dates.length ? dates : [String(raw)])?.map((d, i) => (
                  <View key={i} style={styles.dateChip}>
                    <Text style={styles.dateChipText}>
                      {formatDate(normalize(String(d)))}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}

        {/* Additional Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Requirements</Text>
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsText}>
              {job?.note ||
                job?.additional_requirements ||
                job?.special_requirements ||
                job?.requirements ||
                job?.additional_note ||
                job?.enquiry?.note ||
                job?.enquiry?.additional_requirements ||
                "No additional requirements specified"}
            </Text>
            {job?.required_documents && (
              <View style={styles.documentsContainer}>
                <Text style={styles.documentsTitle}>Required Documents:</Text>
                {Array.isArray(job.required_documents) ? (
                  job.required_documents.map((doc: string, index: number) => (
                    <View key={index} style={styles.documentItem}>
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color="#3B82F6"
                      />
                      <Text style={styles.documentText}>{doc}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.documentItem}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#3B82F6"
                    />
                    <Text style={styles.documentText}>
                      {job.required_documents}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Input Documents (Download) - only for accepted bids */}
        {hasUserBid &&
          (String(userBidStatus).toLowerCase() === "accepted" ||
            String(userBidStatus) === "2") && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Download Assignment Instructions</Text>
                </View>
                {job?.enquiry?.master_logs?.[0]?.assignment_instruction ||
                job?.master_logs?.[0]?.assignment_instruction ? (
                  <HapticPressable
                    style={styles.downloadAssignmentButton}
                    onPress={() =>
                      openFileOnBrowser(
                        job?.enquiry?.master_logs?.[0]?.assignment_instruction ||
                          job?.master_logs?.[0]?.assignment_instruction
                      )
                    }
                    hapticType={HapticType.Medium}
                  >
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.downloadAssignmentText}>
                      Download Assignment Instruction
                    </Text>
                  </HapticPressable>
                ) : (
                  <View style={styles.videoEmpty}>
                    <Ionicons
                      name="document-text-outline"
                      size={36}
                      color="#9CA3AF"
                    />
                    <Text style={styles.videoEmptyTitle}>
                      No assignment instructions available yet
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Input Documents</Text>
                </View>
                <View style={styles.documentsContainer}>
                  {(() => {
                    const docs =
                      job?.output_docs ||
                      jobData?.output_docs ||
                      jobData?.data?.output_docs ||
                      job?.input_documents ||
                      job?.input_docs ||
                      job?.documents ||
                      jobData?.input_documents;
                    let list: any[] = [];
                    if (Array.isArray(docs)) list = docs;
                    else if (typeof docs === "string")
                      list = docs
                        .split(/[\,\n]/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                    else list = [];
                    return list.length > 0 ? (
                      list.map((doc, idx) => {
                        const url =
                          typeof doc === "string"
                            ? doc
                            : doc?.url || doc?.file || "";
                        const finalUrl = /^https?:\/\//i.test(url)
                          ? url
                          : `https://erpbeta.enspek.com/${String(
                              url || ""
                            ).replace(/^\//, "")}`;
                        const uploadedRaw =
                          doc?.created_at || doc?.createdAt || doc?.date || "";
                        const uploaded = uploadedRaw
                          ? formatDate(String(uploadedRaw))
                          : "";
                        return (
                          <View key={idx} style={styles.documentRow}>
                            <View>
                              <Text style={styles.documentMetaLabel}>
                                Upload Date:
                              </Text>
                              <Text style={styles.documentMetaValue}>
                                {uploaded || "N/A"}
                              </Text>
                            </View>
                            <HapticPressable
                              style={styles.downloadButton}
                              onPress={() => openFileOnBrowser(finalUrl)}
                              hapticType={HapticType.Light}
                            >
                              <Ionicons
                                name="download-outline"
                                size={16}
                                color="#FFFFFF"
                              />
                              <Text style={styles.downloadButtonText}>
                                Download
                              </Text>
                            </HapticPressable>
                          </View>
                        );
                      })
                    ) : (
                      <View style={styles.videoEmpty}>
                        <Ionicons
                          name="document-text-outline"
                          size={36}
                          color="#9CA3AF"
                        />
                        <Text style={styles.videoEmptyTitle}>
                          No input documents available
                        </Text>
                      </View>
                    );
                  })()}
                </View>
              </View>
            </>
          )}

        {/* Video Conferencing */}
        {hasUserBid && (
          <View style={styles.section}>
            <View style={styles.videoHeader}>
              <Text style={styles.sectionTitle}>Video Conferencing</Text>
              <HapticPressable
                style={styles.refreshButton}
                onPress={fetchVideoInfo}
                disabled={videoLoading}
                hapticType={HapticType.Light}
              >
                <Text style={styles.refreshText}>Refresh</Text>
              </HapticPressable>
            </View>
            <View style={{ gap: 12 }}>
              <HapticPressable
                style={styles.videoButton}
                onPress={async () => {
                  try {
                    const join = videoInfo.agora;
                    if (join) return Linking.openURL(join);
                    Alert.alert("Video call", "No join link available yet");
                  } catch (e: any) {
                    Alert.alert(
                      "Video call",
                      e?.response?.data?.message || "Failed to load meeting"
                    );
                  }
                }}
                hapticType={HapticType.Medium}
              >
                <Ionicons name="videocam-outline" size={18} color="#1D4ED8" />
                <Text style={styles.videoButtonText}>Open Video Call</Text>
              </HapticPressable>
              {!videoInfo.agora && !videoLoading && (
                <View style={styles.videoEmpty}>
                  <Ionicons
                    name="videocam-off-outline"
                    size={48}
                    color="#9CA3AF"
                  />
                  <Text style={styles.videoEmptyTitle}>
                    No active video calls available
                  </Text>
                  <Text style={styles.videoEmptySubtitle}>
                    Video calls will appear here when scheduled for this
                    inspection
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Check-ins - only for accepted bids */}
        {(String(userBidStatus).toLowerCase() === "accepted" ||
          String(userBidStatus) === "2") && (
            <>
              <View style={styles.section}>
                <View style={styles.videoHeader}>
                  <Text style={styles.sectionTitle}>Check-ins</Text>
                  <HapticPressable
                    style={styles.refreshButton}
                    onPress={fetchCheckIns}
                    disabled={checkinsLoading}
                    hapticType={HapticType.Light}
                  >
                    <Text style={styles.refreshText}>Refresh</Text>
                  </HapticPressable>
                </View>
                {checkinsLoading ? (
                  <View style={styles.videoEmpty}>
                    <ActivityIndicator />
                  </View>
                ) : checkins.length === 0 ? (
                  <View style={styles.videoEmpty}>
                    <Ionicons name="location-outline" size={36} color="#9CA3AF" />
                    <Text style={styles.videoEmptyTitle}>No check-ins found</Text>
                  </View>
                ) : (
                  <View style={styles.checkinsList}>
                    {checkins.map((ci: any, idx: number) => (
                      <View key={idx} style={styles.checkinItem}>
                        <View style={styles.checkinIconWrap}>
                          <Ionicons name="pin-outline" size={16} color="#2563EB" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.checkinAddress} numberOfLines={2}>
                            {ci.address || `${ci.latitude}, ${ci.longitude}`}
                          </Text>
                          <Text style={styles.checkinMeta}>
                            {ci.created_at || ci.time || ""}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Inspection Document Upload Section - Only show if BOTH assignment instructions AND output docs exist */}
              {(job?.enquiry?.master_logs?.[0]?.assignment_instruction ||
                job?.master_logs?.[0]?.assignment_instruction) &&
              (() => {
                const docs =
                  job?.output_docs ||
                  jobData?.output_docs ||
                  jobData?.data?.output_docs;
                return Array.isArray(docs) && docs.length > 0;
              })() ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Upload Inspection Data</Text>

                  {/* Inspection Document Upload */}
                  <View style={styles.inspectionUploadSection}>
                    <Text style={styles.inputLabel}>Inspection Document</Text>
                    {inspectionDocName ? (
                      <View style={styles.selectedFileContainer}>
                        <Text style={styles.selectedFileName} numberOfLines={1}>
                          {inspectionDocName}
                        </Text>
                        <HapticPressable
                          style={styles.removeFileButton}
                          onPress={() => {
                            setInspectionDocFile(null);
                            setInspectionDocName("");
                          }}
                          hapticType={HapticType.Light}
                        >
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </HapticPressable>
                      </View>
                    ) : null}
                    <HapticPressable
                      style={styles.filePickerButton}
                      onPress={handleInspectionDocUpload}
                      hapticType={HapticType.Medium}
                    >
                      <Ionicons name="cloud-upload-outline" size={24} color="#6B7280" />
                      <Text style={styles.filePickerText}>
                        {inspectionDocName ? "Change Document" : "Choose Inspection Document"}
                      </Text>
                    </HapticPressable>
                  </View>

                  {/* Flash Report Upload */}
                  <View style={styles.inspectionUploadSection}>
                    <Text style={styles.inputLabel}>Inspection Report</Text>
                    {flashReportName ? (
                      <View style={styles.selectedFileContainer}>
                        <Text style={styles.selectedFileName} numberOfLines={1}>
                          {flashReportName}
                        </Text>
                        <HapticPressable
                          style={styles.removeFileButton}
                          onPress={() => {
                            setFlashReportFile(null);
                            setFlashReportName("");
                          }}
                          hapticType={HapticType.Light}
                        >
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </HapticPressable>
                      </View>
                    ) : null}
                    <HapticPressable
                      style={styles.filePickerButton}
                      onPress={handleFlashReportUpload}
                      hapticType={HapticType.Medium}
                    >
                      <Ionicons name="cloud-upload-outline" size={24} color="#6B7280" />
                      <Text style={styles.filePickerText}>
                        {flashReportName ? "Change Report" : "Choose Inspection Report"}
                      </Text>
                    </HapticPressable>
                  </View>

                  {/* Report Note */}
                  <View style={styles.inspectionUploadSection}>
                    <Text style={styles.inputLabel}>Report Note</Text>
                    <TextInput
                      style={styles.reportNoteInput}
                      value={reportNote}
                      onChangeText={setReportNote}
                      placeholder="Enter report note"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Submit Button */}
                  <HapticPressable
                    style={[
                      styles.submitInspectionButton,
                      (!flashReportFile && !inspectionDocFile && !reportNote) &&
                        styles.submitInspectionButtonDisabled,
                    ]}
                    onPress={handleSubmitInspectionData}
                    disabled={
                      isUploadingInspection ||
                      (!flashReportFile && !inspectionDocFile && !reportNote)
                    }
                    hapticType={HapticType.Medium}
                  >
                    {isUploadingInspection ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitInspectionButtonText}>
                        {inspectionDocs.length > 0 || flashReports.length > 0
                          ? "Update Inspection"
                          : "Submit Inspection"}
                      </Text>
                    )}
                  </HapticPressable>
                </View>
              ) : null}

              {/* Uploaded Inspection Documents */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Uploaded Inspection Documents</Text>
                {inspectionDocs.length > 0 ? (
                  inspectionDocs.map((doc: any, index: number) => (
                    <View key={index} style={styles.uploadedDocumentItem}>
                      <View style={styles.uploadedDocumentInfo}>
                        <Text style={styles.uploadedDocumentIndex}>
                          {index + 1}) Document
                        </Text>
                        <Text style={styles.uploadedDocumentDate}>
                          Upload Date: {formatDate(doc.created_at)}
                        </Text>
                      </View>
                      <View style={styles.uploadedDocumentActions}>
                        <HapticPressable
                          style={styles.downloadButton}
                          onPress={() => openFileOnBrowser(doc.file)}
                          hapticType={HapticType.Light}
                        >
                          <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                          <Text style={styles.downloadButtonText}>Download</Text>
                        </HapticPressable>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.videoEmpty}>
                    <Ionicons name="document-outline" size={36} color="#9CA3AF" />
                    <Text style={styles.videoEmptyTitle}>
                      You haven't uploaded any inspection documents
                    </Text>
                  </View>
                )}
              </View>

              {/* Uploaded Flash Reports */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Uploaded Inspection Reports</Text>
                {flashReports.length > 0 ? (
                  flashReports.map((report: any, index: number) => (
                    <View key={index} style={styles.uploadedDocumentItem}>
                      <View style={styles.uploadedDocumentInfo}>
                        <Text style={styles.uploadedDocumentIndex}>
                          {index + 1}) Report
                        </Text>
                        <Text style={styles.uploadedDocumentDate}>
                          Upload Date: {formatDate(report.created_at)}
                        </Text>
                      </View>
                      <View style={styles.uploadedDocumentActions}>
                        <HapticPressable
                          style={styles.downloadButton}
                          onPress={() => openFileOnBrowser(report.file)}
                          hapticType={HapticType.Light}
                        >
                          <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                          <Text style={styles.downloadButtonText}>Download</Text>
                        </HapticPressable>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.videoEmpty}>
                    <Ionicons name="document-text-outline" size={36} color="#9CA3AF" />
                    <Text style={styles.videoEmptyTitle}>
                      You haven't uploaded any inspection reports
                    </Text>
                  </View>
                )}
              </View>

              {/* Inspection Report Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Inspection Report Notes</Text>
                <TextInput
                  style={styles.reportNoteInput}
                  value={
                    job?.enquiry?.master_logs?.[0]?.flash_note ||
                    job?.master_logs?.[0]?.flash_note ||
                    ""
                  }
                  editable={false}
                  placeholder="Notes not added"
                  placeholderTextColor="#9CA3AF"
                  multiline
                />
              </View>
            </>
          )}

        {/* Accepted Bid Notice - Only show if assignment instructions or output docs are missing */}
        {hasUserBid &&
          (String(userBidStatus).toLowerCase() === "accepted" ||
            String(userBidStatus) === "2") &&
          (!(job?.enquiry?.master_logs?.[0]?.assignment_instruction ||
            job?.master_logs?.[0]?.assignment_instruction) ||
           !(() => {
             const docs =
               job?.output_docs ||
               jobData?.output_docs ||
               jobData?.data?.output_docs;
             return Array.isArray(docs) && docs.length > 0;
           })()) && (
            <View style={[styles.section, { backgroundColor: "#ECFDF5" }]}>
              <Text style={[styles.sectionTitle, { color: "#065F46" }]}>
                Bid Accepted
              </Text>
              <Text style={{ color: "#065F46", fontSize: 16, lineHeight: 22 }}>
                Your bid has been accepted. You will receive the output documents
                and assignment instructions for review shortly.
              </Text>
            </View>
          )}

        {/* Bidding Section - Only show if user hasn't bid yet */}
        {!hasUserBid && (
          <View
            style={[styles.section, styles.lastSection, styles.biddingSection]}
          >
            <Text style={styles.sectionTitle}>Submit Your Bid</Text>

            {/* Bid Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bid Amount *</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  placeholder="Enter your bid amount"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
                <HapticPressable
                  style={styles.currencySelector}
                  onPress={() => setShowCurrencyModal(true)}
                  hapticType={HapticType.Light}
                >
                  <Text style={styles.currencyText}>{bidCurrency}</Text>
                  <Ionicons name="chevron-down" size={16} color="#6B7280" />
                </HapticPressable>
              </View>
            </View>

            {/* Amount Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount Type</Text>
              <View style={styles.amountTypeContainer}>
                <HapticPressable
                  style={[
                    styles.amountTypeButton,
                    bidAmountType === "daily" && styles.amountTypeButtonActive,
                  ]}
                  onPress={() => setBidAmountType("daily")}
                  hapticType={HapticType.Selection}
                >
                  <Text
                    style={[
                      styles.amountTypeText,
                      bidAmountType === "daily" && styles.amountTypeTextActive,
                    ]}
                  >
                    Daily
                  </Text>
                </HapticPressable>
                <HapticPressable
                  style={[
                    styles.amountTypeButton,
                    bidAmountType === "hourly" && styles.amountTypeButtonActive,
                  ]}
                  onPress={() => setBidAmountType("hourly")}
                  hapticType={HapticType.Selection}
                >
                  <Text
                    style={[
                      styles.amountTypeText,
                      bidAmountType === "hourly" && styles.amountTypeTextActive,
                    ]}
                  >
                    Hourly
                  </Text>
                </HapticPressable>
                <HapticPressable
                  style={[
                    styles.amountTypeButton,
                    bidAmountType === "monthly" &&
                      styles.amountTypeButtonActive,
                  ]}
                  onPress={() => setBidAmountType("monthly")}
                  hapticType={HapticType.Selection}
                >
                  <Text
                    style={[
                      styles.amountTypeText,
                      bidAmountType === "monthly" &&
                        styles.amountTypeTextActive,
                    ]}
                  >
                    Monthly
                  </Text>
                </HapticPressable>
                <HapticPressable
                  style={[
                    styles.amountTypeButton,
                    bidAmountType === "project" &&
                      styles.amountTypeButtonActive,
                  ]}
                  onPress={() => setBidAmountType("project")}
                  hapticType={HapticType.Selection}
                >
                  <Text
                    style={[
                      styles.amountTypeText,
                      bidAmountType === "project" &&
                        styles.amountTypeTextActive,
                    ]}
                  >
                    For Project
                  </Text>
                </HapticPressable>
              </View>
            </View>

            {/* Choose Dates */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Choose Dates *</Text>
              <Text style={styles.inputHelper}>
                Select multiple dates you're available for this inspection
              </Text>

              {/* Date Picker Button */}
              <HapticPressable
                style={styles.datePickerButton}
                onPress={openDatePicker}
                hapticType={HapticType.Medium}
              >
                <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                <Text style={styles.datePickerButtonText}>
                  {selectedDates.length > 0
                    ? `Selected ${selectedDates.length} date${
                        selectedDates.length > 1 ? "s" : ""
                      }`
                    : "Select Dates"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </HapticPressable>

              {/* Selected Dates Display */}
              {selectedDates.length > 0 && (
                <View style={styles.selectedDatesContainer}>
                  {selectedDates.map((date, index) => (
                    <View key={index} style={styles.selectedDateItem}>
                      <Text style={styles.selectedDateText}>
                        {date.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                      <HapticPressable
                        style={styles.removeDateButton}
                        onPress={() => removeDate(date)}
                        hapticType={HapticType.Light}
                      >
                        <Ionicons name="close" size={16} color="#EF4444" />
                      </HapticPressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Status Message - Show when user has bid */}
      {hasUserBid && (
        <View style={styles.footerStatusContainer}>
          <View style={styles.footerStatusContent}>
            {String(userBidStatus).toLowerCase() === "accepted" ||
            String(userBidStatus) === "2" ? (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#059669"
                />
                <Text style={[styles.footerStatusText, { color: "#065F46" }]}>
                  Your bid has been approved
                </Text>
              </>
            ) : String(userBidStatus).toLowerCase() === "rejected" ||
              String(userBidStatus) === "3" ? (
              <>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color="#EF4444"
                />
                <Text style={[styles.footerStatusText, { color: "#DC2626" }]}>
                  Your bid has been rejected
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="time-outline" size={20} color="#F59E0B" />
                <Text style={styles.footerStatusText}>
                  Your bid is waiting for approval
                </Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Sticky Submit Bid Button - Only show if user hasn't bid yet */}
      {!hasUserBid && (
        <View style={styles.stickyButtonContainer}>
          <HapticPressable
            style={[
              styles.submitButton,
              (isSubmittingBid || hasUserBid) && styles.submitButtonDisabled,
            ]}
            onPress={hasUserBid ? undefined : handleSubmitBid}
            disabled={isSubmittingBid || hasUserBid}
            hapticType={HapticType.Medium}
          >
            {isSubmittingBid ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : hasUserBid ? (
              <Text style={styles.submitButtonText}>Already Bid</Text>
            ) : (
              <Text style={styles.submitButtonText}>Bid Now</Text>
            )}
          </HapticPressable>
        </View>
      )}

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <HapticPressable
                onPress={() => setShowCurrencyModal(false)}
                hapticType={HapticType.Light}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </HapticPressable>
            </View>
            <ScrollView style={styles.currencyList}>
              {currencies.map((currency) => (
                <HapticPressable
                  key={currency.code}
                  style={[
                    styles.currencyItem,
                    bidCurrency === currency.code &&
                      styles.currencyItemSelected,
                  ]}
                  onPress={() => {
                    setBidCurrency(currency.code);
                    setShowCurrencyModal(false);
                  }}
                  hapticType={HapticType.Selection}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyCode}>{currency.code}</Text>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                  </View>
                  <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                  {bidCurrency === currency.code && (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  )}
                </HapticPressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Check-in Modal */}
      <Modal
        visible={showCheckInModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCheckInModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={styles.checkInModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Check In Details</Text>
                <HapticPressable
                  onPress={() => setShowCheckInModal(false)}
                  hapticType={HapticType.Light}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </HapticPressable>
              </View>

                <ScrollView 
                  style={styles.checkInModalScroll} 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.checkInModalScrollContent}
                >
                  {/* Location Display */}
                  {isLocationFetched && fetchedLocation?.address && (
                    <View style={styles.checkInSection}>
                      <Text style={styles.checkInLabel}>Current Location:</Text>
                      <Text style={styles.checkInLocationText}>{fetchedLocation.address}</Text>
                    </View>
                  )}

                  {/* Check-in Note */}
                  <View style={styles.checkInSection}>
                    <Text style={styles.checkInLabel}>Enter Check In Note (Optional)</Text>
                    <TextInput
                      style={styles.checkInNoteInput}
                      value={checkInNote}
                      onChangeText={setCheckInNote}
                      placeholder="Enter Check In Note (Optional)"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Photo Upload */}
                  <View style={styles.checkInSection}>
                    <Text style={styles.checkInLabel}>Upload Check In Photo</Text>
                    
                    {checkInPhoto && (
                      <View style={styles.photoPreviewContainer}>
                        <Image source={{ uri: checkInPhoto }} style={styles.photoPreview} />
                        <HapticPressable
                          style={styles.removePhotoButton}
                          onPress={() => {
                            setCheckInPhoto(null);
                            setCheckInPhotoFile(null);
                          }}
                          hapticType={HapticType.Light}
                        >
                          <Ionicons name="close-circle" size={24} color="#EF4444" />
                        </HapticPressable>
                      </View>
                    )}

                    <HapticPressable
                      style={styles.uploadPhotoButton}
                      onPress={handleCheckInPhotoUpload}
                      hapticType={HapticType.Medium}
                    >
                      <Ionicons name="camera-outline" size={24} color="#15416E" />
                      <Text style={styles.uploadPhotoButtonText}>
                        {checkInPhoto ? 'Change Photo' : 'Take Photo'}
                      </Text>
                    </HapticPressable>
                  </View>

                  {/* Submit Button - Only show when photo is uploaded */}
                  {(checkInPhoto || checkInPhotoFile) && (
                    <HapticPressable
                      style={[styles.submitCheckInButton, isCheckingIn && styles.submitCheckInButtonDisabled]}
                      onPress={handleSubmitCheckIn}
                      disabled={isCheckingIn}
                      hapticType={HapticType.Medium}
                    >
                      {isCheckingIn ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.submitCheckInButtonText}>Submit Check In</Text>
                      )}
                    </HapticPressable>
                  )}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

      {/* Calendar Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModalContent}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Select Available Dates</Text>
                <HapticPressable
                  onPress={() => setShowDatePicker(false)}
                  hapticType={HapticType.Light}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </HapticPressable>
              </View>

              <View style={styles.calendarContainer}>
                {/* Month Navigation */}
                <View style={styles.monthNavigation}>
                  <HapticPressable
                    style={styles.monthNavButton}
                    onPress={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                    hapticType={HapticType.Light}
                  >
                    <Ionicons name="chevron-back" size={20} color="#3B82F6" />
                  </HapticPressable>

                  <Text style={styles.monthYearText}>
                    {currentMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>

                  <HapticPressable
                    style={styles.monthNavButton}
                    onPress={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                    hapticType={HapticType.Light}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#3B82F6"
                    />
                  </HapticPressable>
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                  {/* Day Headers */}
                  <View style={styles.dayHeaders}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <Text key={day} style={styles.dayHeader}>
                          {day}
                        </Text>
                      )
                    )}
                  </View>

                  {/* Calendar Days */}
                  <View style={styles.calendarDays}>
                    {getDaysInMonth(currentMonth).map((date, index) => (
                      <HapticPressable
                        key={index}
                        style={[
                          styles.calendarDay,
                          date &&
                            isDateSelected(date, tempSelectedDates) &&
                            styles.calendarDaySelected,
                          date &&
                            date < new Date() &&
                            styles.calendarDayDisabled,
                        ]}
                        onPress={() =>
                          date &&
                          date >= new Date() &&
                          toggleDateSelection(date)
                        }
                        disabled={!date || date < new Date()}
                        hapticType={HapticType.Selection}
                      >
                        {date && (
                          <Text
                            style={[
                              styles.calendarDayText,
                              isDateSelected(date, tempSelectedDates) &&
                                styles.calendarDayTextSelected,
                              date < new Date() &&
                                styles.calendarDayTextDisabled,
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                        )}
                      </HapticPressable>
                    ))}
                  </View>
                </View>

                {/* Selected Dates Summary */}
                {tempSelectedDates.length > 0 && (
                  <View style={styles.selectedDatesSummary}>
                    <Text style={styles.selectedDatesTitle}>
                      Selected Dates ({tempSelectedDates.length}):
                    </Text>
                    <View style={styles.selectedDatesList}>
                      {tempSelectedDates.map((date, index) => (
                        <Text
                          key={index}
                          style={styles.calendarSelectedDateItem}
                        >
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.calendarActions}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    style={styles.saveButton}
                    onPress={saveSelectedDates}
                  >
                    <Text style={styles.saveButtonText}>Save Dates</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Location Loading Overlay */}
      <Modal
        visible={showLocationLoading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.locationLoadingOverlay}>
          <View style={styles.locationLoadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.locationLoadingTitle}>Fetching Your Location</Text>
            <Text style={styles.locationLoadingSubtitle}>
              Make sure you are nearest to the inspection location for approval
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontFamily: FONTS.regular,
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: FONTS.semiBold,
    color: "#FFFFFF",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: "#1F2937",
  },
  headerRight: {
    minWidth: 40,
    alignItems: "flex-end",
  },
  checkInButtonContainer: {
    alignItems: 'flex-end',
  },
  checkInButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  checkInButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  checkInButtonText: {
    fontFamily: FONTS.bold,
    color: "#065F46",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for sticky button
  },
  jobHeader: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  jobHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: "#1F2937",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  jobId: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: "#6B7280",
  },
  rfiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 4, // Small gap between badges
  },
  statBadge: {
    backgroundColor: "#3B82F620", // Blue with 20% opacity
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statBadgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: "#3B82F6", // Blue text
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: "#E5E7EB80",
  },
  firstSection: {
    marginTop: 0, // Remove top margin from first section
  },
  lastSection: {
    borderBottomWidth: 0, // Remove border from last section
  },
  biddingSection: {
    backgroundColor: "#F0F9FF", // Very light blue background
  },
  sectionTitle: {
    fontSize: 18,
    color: "#1F2937",
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  infoValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: "#1F2937",
    flex: 2,
    textAlign: "right",
  },
  scopeText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  dateText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: "#1F2937",
  },
  dateChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateChip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  dateChipText: {
    fontFamily: FONTS.semiBold,
    color: "#1F2937",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 8,
  },
  inputHelper: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  amountInput: {
    fontFamily: FONTS.regular,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#E5E7EB",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  currencyText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: "#1F2937",
  },
  amountTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  amountTypeButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  amountTypeButtonActive: {
    backgroundColor: "#10B981",
  },
  amountTypeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: "#6B7280",
  },
  amountTypeTextActive: {
    fontFamily: FONTS.bold,
    color: "#FFFFFF",
    fontSize: 16,
  },
  datesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateButtonActive: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  dateButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: "#6B7280",
  },
  dateButtonTextActive: {
    color: "#047857",
  },
  noDatesText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  notesInput: {
    fontFamily: FONTS.regular,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    textAlignVertical: "top",
  },
  stickyButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    fontFamily: FONTS.bold,
    color: "#FFFFFF",
    fontSize: 16,
  },
  locationContainer: {
    gap: 16,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: "#1F2937",
  },
  mapContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  map: {
    height: 200,
    width: "100%",
  },
  mapWrapper: {
    height: 200,
    width: "100%",
  },
  mapCoordinates: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  coordinatesText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: "#047857",
    textAlign: "center",
  },
  mapPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mapPlaceholderText: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 4,
  },
  mapPlaceholderSubtext: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#D1FAE5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  directionsButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: "#047857",
  },
  embeddedMap: {
    height: 200,
    width: "100%",
    borderRadius: 12,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  mapOverlayText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  requirementsContainer: {
    gap: 16,
  },
  requirementsText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  documentsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  documentsTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  documentText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  documentMetaLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: "#6B7280",
  },
  documentMetaValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: "#1F2937",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  downloadButtonText: {
    fontFamily: FONTS.bold,
    color: "#FFFFFF",
    fontSize: 14,
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  refreshButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshText: {
    fontFamily: FONTS.bold,
    color: "#1D4ED8",
  },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 12,
    borderRadius: 12,
  },
  videoButtonText: {
    fontFamily: FONTS.bold,
    color: "#1D4ED8",
  },
  videoButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 12,
  },
  videoButtonTextSecondary: {
    fontFamily: FONTS.bold,
    color: "#1F2937",
  },
  videoEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  videoEmptyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  videoEmptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  checkinsList: {
    gap: 10,
  },
  checkinItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  checkinIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkinAddress: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: "#1F2937",
  },
  checkinMeta: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: "#1F2937",
  },
  currencyList: {
    maxHeight: 400,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  currencyItemSelected: {
    backgroundColor: "#D1FAE5",
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: "#1F2937",
  },
  currencyName: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  currencySymbol: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: "#1F2937",
    marginRight: 12,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  datePickerButtonText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: "#1F2937",
    flex: 1,
    marginLeft: 12,
  },
  selectedDatesContainer: {
    marginTop: 12,
    gap: 8,
  },
  selectedDateItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedDateText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: "#1F2937",
  },
  removeDateButton: {
    padding: 4,
    marginLeft: 8,
  },
  datePickerInfo: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginVertical: 16,
  },
  addDateButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  addDateButtonText: {
    fontFamily: FONTS.semiBold,
    color: "#FFFFFF",
    fontSize: 16,
  },
  datePickerContainer: {
    padding: 20,
  },
  dateInputContainer: {
    marginVertical: 16,
  },
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateInputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    width: 60,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  quickDateButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickDateButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  calendarModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 20,
    maxHeight: "80%",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  calendarContainer: {
    padding: 20,
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  calendarGrid: {
    marginBottom: 20,
  },
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeader: {
    width: "14.2%",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    paddingVertical: 8,
  },
  calendarDays: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.2%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  calendarDaySelected: {
    backgroundColor: "#3B82F6",
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 16,
    color: "#1F2937",
  },
  calendarDayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  calendarDayTextDisabled: {
    color: "#9CA3AF",
  },
  selectedDatesSummary: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedDatesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  selectedDatesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  calendarSelectedDateItem: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  calendarActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  footerStatusContainer: {
    backgroundColor: "#FEF3C7",
    borderTopWidth: 1,
    borderTopColor: "#F59E0B",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  footerStatusContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerStatusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    textAlign: "center",
  },
  checkInModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  checkInModalScroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  checkInModalScrollContent: {
    paddingBottom: 20,
  },
  checkInSection: {
    marginBottom: 20,
  },
  checkInLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  checkInLocationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 4,
  },
  checkInNoteInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    minHeight: 80,
    textAlignVertical: "top",
  },
  photoPreviewContainer: {
    position: "relative",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  photoPreview: {
    width: 128,
    height: 128,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  uploadPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#15416E",
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  uploadPhotoButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#15416E",
  },
  submitCheckInButton: {
    backgroundColor: "#15416E",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitCheckInButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitCheckInButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  downloadAssignmentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  downloadAssignmentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  inspectionUploadSection: {
    marginBottom: 16,
  },
  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  filePickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  selectedFileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedFileName: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },
  removeFileButton: {
    padding: 4,
  },
  reportNoteInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: 8,
  },
  submitInspectionButton: {
    backgroundColor: "#15416E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitInspectionButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitInspectionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  uploadedDocumentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  uploadedDocumentInfo: {
    flex: 1,
  },
  uploadedDocumentIndex: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
  },
  uploadedDocumentDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  uploadedDocumentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteDocButton: {
    padding: 8,
  },
  confirmProceedButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  confirmProceedButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  locationLoadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationLoadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  locationLoadingTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: "#1F2937",
    marginTop: 20,
    textAlign: "center",
  },
  locationLoadingSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
    lineHeight: 22,
  },
});
