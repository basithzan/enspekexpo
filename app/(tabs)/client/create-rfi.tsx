import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Pressable, 
  TextInput,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRequestInspection, useEditInspection } from '../../../src/api/hooks/useClientActions';
import { useProfile } from '../../../src/api/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/contexts/AuthContext';
import { HapticPressable } from '../../../src/components/HapticPressable';
import { HapticType, hapticSuccess, hapticError } from '../../../src/utils/haptics';
import { useViewEnquiry } from '../../../src/api/hooks/useEnquiry';

// Dropdown options
const category_options = [
  { value: "Other", label: "Other" },
  { value: "Mech", label: "Mech" },
  { value: "E & I", label: "E & I" },
  { value: "Civil", label: "Civil" },
  { value: "NDT", label: "NDT" },
  { value: "Admin", label: "Admin" },
];

const scope_options = [
  { value: "Other", label: "Other" },
  { value: "Welding Inspection", label: "Welding Inspection" },
  { value: "Visual Inspection", label: "Visual Inspection" },
  { value: "Hydrostatic Test", label: "Hydrostatic Test" },
  { value: "Packing Inspection", label: "Packing Inspection" },
  { value: "Dimensional Inspection", label: "Dimensional Inspection" },
  { value: "Lab Test", label: "Lab Test" },
  { value: "Document Review", label: "Document Review" },
  { value: "PreInspection Meeting-PMI", label: "PreInspection Meeting-PMI" },
  { value: "Final Inspection", label: "Final Inspection" },
  { value: "Fitup Inspection", label: "Fitup Inspection" },
  { value: "Factory Acceptance Test-FAT", label: "Factory Acceptance Test-FAT" },
  { value: "Punch Closeout", label: "Punch Closeout" },
  { value: "StageWise Inspection", label: "StageWise Inspection" },
  { value: "Weld Overlay Inspection", label: "Weld Overlay Inspection" },
  { value: "Marking Inspection", label: "Marking Inspection" },
  { value: "Painting Inspection", label: "Painting Inspection" },
  { value: "Surveillance Inspection", label: "Surveillance Inspection" },
  { value: "Resident Inspection", label: "Resident Inspection" },
  { value: "Pre-Shipment Inspection", label: "Pre-Shipment Inspection" },
  { value: "PMI Test", label: "PMI Test" },
  { value: "Hardness Test", label: "Hardness Test" },
  { value: "In Process Inspection", label: "In Process Inspection" },
  { value: "Receiving Inspection", label: "Receiving Inspection" },
  { value: "Incoming Inspection", label: "Incoming Inspection" },
  { value: "Cables Testing", label: "Cables Testing" },
  { value: "Balancing Test", label: "Balancing Test" },
  { value: "Welder Qualification", label: "Welder Qualification" },
  { value: "WPQT", label: "WPQT" },
  { value: "RWPQT", label: "RWPQT" },
  { value: "REPAIR WELDING", label: "REPAIR WELDING" },
  { value: "RADIOGRAPHY", label: "RADIOGRAPHY" },
  { value: "SAMPLING OF TEST COUPONS", label: "SAMPLING OF TEST COUPONS" },
  { value: "IRN Issue", label: "IRN Issue" },
  { value: "Dry Calibration", label: "Dry Calibration" },
];

const commodity_options = [
  { value: "Other", label: "Other" },
  { value: "Indirect Fired Bath Heater", label: "Indirect Fired Bath Heater" },
  { value: '72" Inch Butterfly Valve', label: '72" Inch Butterfly Valve' },
  { value: "Anchor Flange", label: "Anchor Flange" },
  { value: "Ball Valves", label: "Ball Valves" },
  { value: "BLAST RESISITANT MODULE", label: "BLAST RESISITANT MODULE" },
  { value: "Cables", label: "Cables" },
  { value: "Cans", label: "Cans" },
  { value: "Casing", label: "Casing" },
  { value: "Cladded Line Pipes", label: "Cladded Line Pipes" },
  { value: "CLARIFIER SCRAPER MECHANISM", label: "CLARIFIER SCRAPER MECHANISM" },
  { value: "CONTROL & POWER PANEL", label: "CONTROL & POWER PANEL" },
  { value: "CS Pipes", label: "CS Pipes" },
  { value: "Cylinder Assembly", label: "Cylinder Assembly" },
  { value: "DEPROPANIZER CONDENSER", label: "DEPROPANIZER CONDENSER" },
  { value: "Ductile Pipes", label: "Ductile Pipes" },
  { value: "Electrical Accessories", label: "Electrical Accessories" },
  { value: "Filter Vessel", label: "Filter Vessel" },
  { value: "Flanges", label: "Flanges" },
  { value: "Flow Control Valves", label: "Flow Control Valves" },
  { value: "FPSO", label: "FPSO" },
  { value: "Fuel Oil/ Hot Vacuum Residue Exchanger", label: "Fuel Oil/ Hot Vacuum Residue Exchanger" },
  { value: "Gear", label: "Gear" },
  { value: "Grating for structural Steel", label: "Grating for structural Steel" },
  { value: "GRP Pipes and Fittings", label: "GRP Pipes and Fittings" },
  { value: "GRP Spool, Fittings, Lamination kits and consumable items", label: "GRP Spool, Fittings, Lamination kits and consumable items" },
  { value: "GRP spools & pipes", label: "GRP spools & pipes" },
  { value: "HDPE Pipes", label: "HDPE Pipes" },
  { value: "HDPE Pipes and Fitting", label: "HDPE Pipes and Fitting" },
  { value: "Heat Exchangers", label: "Heat Exchangers" },
  { value: "HVAC Dampers", label: "HVAC Dampers" },
  { value: "HVAC Equipment & Ducts", label: "HVAC Equipment & Ducts" },
  { value: "INTERNAL FBE COATING", label: "INTERNAL FBE COATING" },
  { value: "IPHONES", label: "IPHONES" },
  { value: "LSP Panels", label: "LSP Panels" },
  { value: "Micro Bubble Generator Skid", label: "Micro Bubble Generator Skid" },
  { value: "Module Fabrication", label: "Module Fabrication" },
  { value: "Motor", label: "Motor" },
  { value: "Multiport Flow Selector", label: "Multiport Flow Selector" },
  { value: "NH3 Reactor", label: "NH3 Reactor" },
  { value: "Oil Package- LP Crude Preheater", label: "Oil Package- LP Crude Preheater" },
  { value: "Panels", label: "Panels" },
  { value: "PDB Panel", label: "PDB Panel" },
  { value: "Pig Launcher and Pig Receiver", label: "Pig Launcher and Pig Receiver" },
  { value: "Pipes", label: "Pipes" },
  { value: "PIPING FITTING, FLANGES & STUD BOLTS", label: "PIPING FITTING, FLANGES & STUD BOLTS" },
  { value: "Piping Spools", label: "Piping Spools" },
  { value: "Plate Heat Exchanger", label: "Plate Heat Exchanger" },
  { value: "Plates", label: "Plates" },
  { value: "POWER TRANSFORMER", label: "POWER TRANSFORMER" },
  { value: "Pumps", label: "Pumps" },
  { value: "QOC Valve", label: "QOC Valve" },
  { value: "Raw Material Inspection", label: "Raw Material Inspection" },
  { value: "Roof Top for HVAC Package", label: "Roof Top for HVAC Package" },
  { value: "Rotor Shaft", label: "Rotor Shaft" },
  { value: "SHELTER CLADDING AND ACCESSORIES FOR OC2 SCOPE", label: "SHELTER CLADDING AND ACCESSORIES FOR OC2 SCOPE" },
  { value: "Skids and Pump", label: "Skids and Pump" },
  { value: "Spools", label: "Spools" },
  { value: "Storage Tanks", label: "Storage Tanks" },
  { value: "Structural Fabrication", label: "Structural Fabrication" },
  { value: "Structural Steel", label: "Structural Steel" },
  { value: "SURGE DRUM and STRIPPING COLUMN", label: "SURGE DRUM and STRIPPING COLUMN" },
  { value: "Telecommunication system", label: "Telecommunication system" },
  { value: "Test Sleeve", label: "Test Sleeve" },
  { value: "Tube Bundle Heat Exchanger", label: "Tube Bundle Heat Exchanger" },
  { value: "ULTRASONIC FLOWMETER", label: "ULTRASONIC FLOWMETER" },
  { value: "UPS", label: "UPS" },
  { value: "Valves", label: "Valves" },
  { value: "Welded Pipes", label: "Welded Pipes" },
];

export default function CreateRfi() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { getCountries } = useProfile();
  const requestMutation = useRequestInspection();
  const editMutation = useEditInspection();
  const { user } = useAuth();
  
  // Check if we're in edit mode
  const isEditMode = !!params.id;
  
  // Fetch existing enquiry data if in edit mode
  const { data: enquiryData, isLoading: isLoadingEnquiry } = useViewEnquiry(
    isEditMode ? (params.id as string) : ''
  );

  // Form state
  const [jobName, setJobName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierLocation, setSupplierLocation] = useState('');
  const [category, setCategory] = useState<any>(null);
  const [categoryOther, setCategoryOther] = useState('');
  const [scope, setScope] = useState<any>(null);
  const [scopeOther, setScopeOther] = useState('');
  const [commodity, setCommodity] = useState<any>(null);
  const [commodityOther, setCommodityOther] = useState('');
  const [country, setCountry] = useState<any>(null);
  const [additionalNote, setAdditionalNote] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  
  // UI state
  const [showCategoryOther, setShowCategoryOther] = useState(false);
  const [showScopeOther, setShowScopeOther] = useState(false);
  const [showCommodityOther, setShowCommodityOther] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState<{
    category?: boolean;
    scope?: boolean;
    commodity?: boolean;
    country?: boolean;
  }>({});
  const [countries, setCountries] = useState<any[]>([]);
  const [dateError, setDateError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Pre-fill form when in edit mode and enquiry data is loaded
  useEffect(() => {
    if (isEditMode && enquiryData && countries.length > 0) {
      const singleJob = enquiryData?.data || enquiryData;
      const enquiry = singleJob?.enquiry || singleJob;
      
      if (enquiry) {
        // Set basic fields
        setJobName(enquiry.job_title || '');
        setSupplierName(enquiry.vendor || '');
        setSupplierLocation(enquiry.vendor_location || '');
        setAdditionalNote(enquiry.note || '');

        // Set category
        const categoryOption = category_options.find(opt => opt.value === enquiry.category);
        if (categoryOption) {
          setCategory(categoryOption);
          if (categoryOption.value === 'Other') {
            setShowCategoryOther(true);
            setCategoryOther(enquiry.category);
          }
        } else if (enquiry.category) {
          // If category is not in predefined options, treat as "Other"
          setCategory({ value: 'Other', label: 'Other' });
          setShowCategoryOther(true);
          setCategoryOther(enquiry.category);
        }

        // Set scope
        const scopeOption = scope_options.find(opt => opt.value === enquiry.enquiry_scope);
        if (scopeOption) {
          setScope(scopeOption);
          if (scopeOption.value === 'Other') {
            setShowScopeOther(true);
            setScopeOther(enquiry.enquiry_scope);
          }
        } else if (enquiry.enquiry_scope) {
          // If scope is not in predefined options, treat as "Other"
          setScope({ value: 'Other', label: 'Other' });
          setShowScopeOther(true);
          setScopeOther(enquiry.enquiry_scope);
        }

        // Set commodity
        const commodityOption = commodity_options.find(opt => opt.value === enquiry.commodity);
        if (commodityOption) {
          setCommodity(commodityOption);
          if (commodityOption.value === 'Other') {
            setShowCommodityOther(true);
            setCommodityOther(enquiry.commodity);
          }
        } else if (enquiry.commodity) {
          // If commodity is not in predefined options, treat as "Other"
          setCommodity({ value: 'Other', label: 'Other' });
          setShowCommodityOther(true);
          setCommodityOther(enquiry.commodity);
        }

        // Set country
        const countryId = enquiry.country_id || enquiry.country?.id;
        if (countryId) {
          const countryOption = countries.find(c => c.value === String(countryId));
          if (countryOption) {
            setCountry(countryOption);
          }
        }

        // Parse and set dates
        if (enquiry.est_inspection_date) {
          const dateStrings = enquiry.est_inspection_date.split(',').map(d => d.trim());
          const parsedDates: Date[] = [];
          
          dateStrings.forEach(dateStr => {
            // Try multiple date formats
            // Format 1: DD/MM/YYYY
            const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (ddmmyyyy) {
              const day = parseInt(ddmmyyyy[1]);
              const month = parseInt(ddmmyyyy[2]) - 1;
              const year = parseInt(ddmmyyyy[3]);
              const date = new Date(year, month, day);
              if (!isNaN(date.getTime())) {
                parsedDates.push(date);
              }
            } else {
              // Try ISO format or other formats
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                parsedDates.push(date);
              }
            }
          });
          
          if (parsedDates.length > 0) {
            setSelectedDates(parsedDates);
            setTempSelectedDates(parsedDates);
          }
        }
      }
    }
  }, [isEditMode, enquiryData, countries]);

  const loadCountries = async () => {
    try {
      const result = await getCountries();
      if (result.success) {
        const rawList = Array.isArray(result.data) ? result.data : [];
        const formatted = rawList.map((c: any) => ({
          value: String(c.id || c.country_id || ''),
          label: c.name || c.country_name || '',
        })).filter((c: any) => c.value && c.label);
        setCountries(formatted);
      }
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!jobName.trim()) {
      newErrors.jobName = 'Job title is required';
    }
    if (!supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required';
    }
    if (!supplierLocation.trim()) {
      newErrors.supplierLocation = 'Supplier location is required';
    }
    if (!category) {
      newErrors.category = 'Category is required';
    }
    if (category?.value === 'Other' && !categoryOther.trim()) {
      newErrors.categoryOther = 'Other category is required';
    }
    if (!scope) {
      newErrors.scope = 'Scope is required';
    }
    if (scope?.value === 'Other' && !scopeOther.trim()) {
      newErrors.scopeOther = 'Other scope is required';
    }
    if (!commodity) {
      newErrors.commodity = 'Commodity is required';
    }
    if (commodity?.value === 'Other' && !commodityOther.trim()) {
      newErrors.commodityOther = 'Other commodity is required';
    }
    if (!country) {
      newErrors.country = 'Country is required';
    }
    if (selectedDates.length === 0) {
      setDateError(true);
      newErrors.dates = 'Please select at least one date';
    } else {
      setDateError(false);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      hapticError();
      return;
    }

    const formattedDates = selectedDates.map(formatDate).sort();

    if (isEditMode) {
      // Edit mode - use FormData for edit endpoint
      // const formData = new FormData();
      // formData.append('id', params.id as string);
      // formData.append('enquiry_id', params.id as string);
      // formData.append('job_name', jobName);
      // formData.append('supplier_name', supplierName);
      // formData.append('supplier_location', supplierLocation);
      // formData.append('category', category?.value === 'Other' ? categoryOther : category?.value || '');
      // formData.append('scope', scope?.value === 'Other' ? scopeOther : scope?.value || '');
      // formData.append('commodity', commodity?.value === 'Other' ? commodityOther : commodity?.value || '');
      // formData.append('country', String(country?.value || ''));
      // formData.append('dates', formattedDates.join(','));
      // if (additionalNote) {
      //   formData.append('additional_note', additionalNote);
      // }

      const formData = {
        job_name: jobName,
        supplier_name: supplierName,
        enquiry_id : params.id,
        supplier_location: supplierLocation,
        category: category?.value === 'Other' ? categoryOther : category?.value,
        scope: scope?.value === 'Other' ? scopeOther : scope?.value,
        commodity: commodity?.value === 'Other' ? commodityOther : commodity?.value,
        country: Number(country?.value),
        dates: formattedDates,
        additional_note: additionalNote || undefined,
      };


      try {
        await editMutation.mutateAsync(formData);
        hapticSuccess();
        
        Alert.alert(
          'Success',
          'Your inspection request has been successfully updated.',
          [
            {
              text: 'OK',
              onPress: () => {
                queryClient.invalidateQueries({ queryKey: ['client-requests'] });
                queryClient.invalidateQueries({ queryKey: ['enquiry', params.id] });
                router.back();
              },
            },
          ]
        );
      } catch (error: any) {
        hapticError();
        Alert.alert(
          'Error',
          error?.response?.data?.message || 'Failed to update request. Please try again.'
        );
      }
    } else {
      // Create mode - use JSON for create endpoint
      const formData = {
        job_name: jobName,
        supplier_name: supplierName,
        supplier_location: supplierLocation,
        category: category?.value === 'Other' ? categoryOther : category?.value,
        scope: scope?.value === 'Other' ? scopeOther : scope?.value,
        commodity: commodity?.value === 'Other' ? commodityOther : commodity?.value,
        country: Number(country?.value),
        dates: formattedDates,
        additional_note: additionalNote || undefined,
      };

      try {
        await requestMutation.mutateAsync(formData);
        hapticSuccess();
        
        Alert.alert(
          'Success',
          'Your inspection request has been successfully submitted.',
          [
            {
              text: 'OK',
              onPress: () => {
                queryClient.invalidateQueries({ queryKey: ['client-requests'] });
                router.back();
              },
            },
          ]
        );
      } catch (error: any) {
        hapticError();
        Alert.alert(
          'Error',
          error?.response?.data?.message || 'Failed to submit request. Please try again.'
        );
      }
    }
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

  const isDateSelected = (date: Date) => {
    return tempSelectedDates.some(selectedDate => 
      formatDate(selectedDate) === formatDate(date)
    );
  };

  const toggleDateSelection = (date: Date) => {
    setTempSelectedDates(prev => {
      const isSelected = prev.some(selectedDate => 
        formatDate(selectedDate) === formatDate(date)
      );
      
      if (isSelected) {
        return prev.filter(selectedDate => 
          formatDate(selectedDate) !== formatDate(date)
        );
      } else {
        return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
      }
    });
  };

  const openDatePicker = () => {
    setTempSelectedDates([...selectedDates]);
    setShowDatePicker(true);
  };

  const saveSelectedDates = () => {
    setSelectedDates(tempSelectedDates);
    setShowDatePicker(false);
    setDateError(false);
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

  const removeDate = (dateToRemove: Date) => {
    setSelectedDates(selectedDates.filter(d => formatDate(d) !== formatDate(dateToRemove)));
  };

  const renderDropdown = (
    items: any[],
    selected: any,
    onSelect: (item: any) => void,
    placeholder: string,
    dropdownKey: string,
    error?: string
  ) => {
    const isOpen = showDropdown[dropdownKey as keyof typeof showDropdown];
    
    return (
      <View style={[styles.dropdownContainer, isOpen && styles.dropdownContainerOpen]}>
        <Pressable
          style={[styles.dropdown, error && styles.dropdownError]}
          onPress={() => {
            // Close all dropdowns first, then toggle this one
            const newState: any = {};
            Object.keys(showDropdown).forEach(key => {
              newState[key] = false;
            });
            setShowDropdown({ ...newState, [dropdownKey]: !isOpen });
          }}
        >
          <Text style={[styles.dropdownText, !selected && styles.dropdownPlaceholder]}>
            {selected?.label || placeholder}
          </Text>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
        </Pressable>
        {isOpen && (
          <View style={styles.dropdownList}>
              <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
                {items.map((item, index) => (
                  <Pressable
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      onSelect(item);
                      setShowDropdown({});
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  // Show loading state when fetching enquiry data in edit mode
  if (isEditMode && isLoadingEnquiry) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading RFI details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit RFI' : 'Request for Inspection'}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => {
          // Close all dropdowns when user starts scrolling
          setShowDropdown({});
        }}
        scrollEventThrottle={16}
      >
        {/* Job Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter Job Title *</Text>
          <TextInput
            style={[styles.input, errors.jobName && styles.inputError]}
            value={jobName}
            onChangeText={(text) => {
              setJobName(text);
              if (errors.jobName) setErrors({ ...errors, jobName: '' });
            }}
            placeholder="Job Title"
            placeholderTextColor="#9CA3AF"
          />
          {errors.jobName && <Text style={styles.errorText}>{errors.jobName}</Text>}
        </View>

        {/* Supplier Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter Supplier Name *</Text>
          <TextInput
            style={[styles.input, errors.supplierName && styles.inputError]}
            value={supplierName}
            onChangeText={(text) => {
              setSupplierName(text);
              if (errors.supplierName) setErrors({ ...errors, supplierName: '' });
            }}
            placeholder="Supplier Name"
            placeholderTextColor="#9CA3AF"
          />
          {errors.supplierName && <Text style={styles.errorText}>{errors.supplierName}</Text>}
        </View>

        {/* Supplier Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter Supplier Location *</Text>
          <TextInput
            style={[styles.input, errors.supplierLocation && styles.inputError]}
            value={supplierLocation}
            onChangeText={(text) => {
              setSupplierLocation(text);
              if (errors.supplierLocation) setErrors({ ...errors, supplierLocation: '' });
            }}
            placeholder="Supplier Location"
            placeholderTextColor="#9CA3AF"
          />
          {errors.supplierLocation && <Text style={styles.errorText}>{errors.supplierLocation}</Text>}
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Choose Category *</Text>
          {renderDropdown(
            category_options,
            category,
            (item) => {
              setCategory(item);
              setShowCategoryOther(item.value === 'Other');
              if (errors.category) setErrors({ ...errors, category: '' });
            },
            'Category',
            'category',
            errors.category
          )}
        </View>

        {/* Category Other */}
        {showCategoryOther && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter Other Category name *</Text>
            <TextInput
              style={[styles.input, errors.categoryOther && styles.inputError]}
              value={categoryOther}
              onChangeText={(text) => {
                setCategoryOther(text);
                if (errors.categoryOther) setErrors({ ...errors, categoryOther: '' });
              }}
              placeholder="Other Category name"
              placeholderTextColor="#9CA3AF"
            />
            {errors.categoryOther && <Text style={styles.errorText}>{errors.categoryOther}</Text>}
          </View>
        )}

        {/* Scope */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Choose Scope of Inspection *</Text>
          {renderDropdown(
            scope_options,
            scope,
            (item) => {
              setScope(item);
              setShowScopeOther(item.value === 'Other');
              if (errors.scope) setErrors({ ...errors, scope: '' });
            },
            'Scope of Inspection',
            'scope',
            errors.scope
          )}
        </View>

        {/* Scope Other */}
        {showScopeOther && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter Other Scope of Inspection *</Text>
            <TextInput
              style={[styles.input, errors.scopeOther && styles.inputError]}
              value={scopeOther}
              onChangeText={(text) => {
                setScopeOther(text);
                if (errors.scopeOther) setErrors({ ...errors, scopeOther: '' });
              }}
              placeholder="Other Scope of Inspection"
              placeholderTextColor="#9CA3AF"
            />
            {errors.scopeOther && <Text style={styles.errorText}>{errors.scopeOther}</Text>}
          </View>
        )}

        {/* Commodity */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Choose Commodity *</Text>
          {renderDropdown(
            commodity_options,
            commodity,
            (item) => {
              setCommodity(item);
              setShowCommodityOther(item.value === 'Other');
              if (errors.commodity) setErrors({ ...errors, commodity: '' });
            },
            'Commodity',
            'commodity',
            errors.commodity
          )}
        </View>

        {/* Commodity Other */}
        {showCommodityOther && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter Other Commodity *</Text>
            <TextInput
              style={[styles.input, errors.commodityOther && styles.inputError]}
              value={commodityOther}
              onChangeText={(text) => {
                setCommodityOther(text);
                if (errors.commodityOther) setErrors({ ...errors, commodityOther: '' });
              }}
              placeholder="Other Commodity"
              placeholderTextColor="#9CA3AF"
            />
            {errors.commodityOther && <Text style={styles.errorText}>{errors.commodityOther}</Text>}
          </View>
        )}

        {/* Country */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Choose Country *</Text>
          {renderDropdown(
            countries,
            country,
            (item) => {
              setCountry(item);
              if (errors.country) setErrors({ ...errors, country: '' });
            },
            'Country',
            'country',
            errors.country
          )}
        </View>

        {/* Dates */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Dates *</Text>
          <Pressable
            style={[styles.datePickerButton, dateError && styles.inputError]}
            onPress={openDatePicker}
          >
            <Text style={styles.datePickerText}>
              {selectedDates.length > 0 
                ? `${selectedDates.length} date(s) selected`
                : 'Select inspection dates'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          </Pressable>
          
          {selectedDates.length > 0 && (
            <View style={styles.selectedDatesContainer}>
              {selectedDates.map((date, index) => (
                <View key={index} style={styles.dateChip}>
                  <Text style={styles.dateChipText}>
                    {formatDate(date)}
                  </Text>
                  <Pressable onPress={() => removeDate(date)}>
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          
          {dateError && <Text style={styles.errorText}>Please select at least one date</Text>}
        </View>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Dates</Text>
                <Pressable onPress={() => setShowDatePicker(false)}>
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
                  const isSelected = isDateSelected(day);
                  const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                  
                  return (
                    <Pressable
                      key={index}
                      style={[
                        styles.calendarDay,
                        isSelected && styles.calendarDaySelected,
                        isPast && styles.calendarDayDisabled
                      ]}
                      onPress={() => !isPast && toggleDateSelection(day)}
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

              <View style={styles.modalFooter}>
                <HapticPressable
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowDatePicker(false)}
                  hapticType={HapticType.Light}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </HapticPressable>
                <HapticPressable
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={saveSelectedDates}
                  hapticType={HapticType.Medium}
                >
                  <Text style={styles.modalButtonSaveText}>Save</Text>
                </HapticPressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Additional Note */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter Additional Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={additionalNote}
            onChangeText={setAdditionalNote}
            placeholder="Additional Note"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitButtonContainer}>
        <HapticPressable
          style={[
            styles.submitButton,
            (requestMutation.isPending || editMutation.isPending) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={requestMutation.isPending || editMutation.isPending}
          hapticType={HapticType.Medium}
        >
          {(requestMutation.isPending || editMutation.isPending) ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update Request' : 'Request for Inspection'}
            </Text>
          )}
        </HapticPressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
fontFamily: 'Montserrat',
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
fontFamily: 'Montserrat',
    marginTop: 4,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 10,
  },
  dropdownContainerOpen: {
    zIndex: 9999,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  dropdownError: {
    borderColor: '#EF4444',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
fontFamily: 'Montserrat',
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
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 20,
    zIndex: 9999,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#1F2937',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  datePickerText: {
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    color: '#1F2937',
  },
  selectedDatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateChipText: {
    fontSize: 14,
fontFamily: 'Montserrat',
    color: '#1F2937',
  },
  submitButtonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
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
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtonCancelText: {
    color: '#1F2937',
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
  modalButtonSave: {
    backgroundColor: '#3B82F6',
  },
  modalButtonSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
fontFamily: 'Montserrat',
fontFamily: 'Montserrat',
    fontWeight: '600',
  },
});
