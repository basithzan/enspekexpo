import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClientRequests } from '../../../src/api/hooks/useClient';
import { useAuth } from '../../../src/contexts/AuthContext';
import { HapticPressable } from '../../../src/components/HapticPressable';
import { HapticType } from '../../../src/utils/haptics';


export default function ClientHome(){
  const router = useRouter();
  const { logout, user, isAuthenticated } = useAuth();
  const { data, isLoading, isFetching, refetch } = useClientRequests();
  const requests = useMemo(()=> (data?.data || data?.requests || data?.enquiries || []), [data]);
  const insets = useSafeAreaInsets();

  // Role-based access control
  if (!isAuthenticated) {
    return <Redirect href="/role-selection" />;
  }

  if (user?.type !== 'client') {
    return <Redirect href="/role-selection" />;
  }

  const onCreateRFI = useCallback((prefillKey?: string)=>{
    router.push({ pathname: '/(tabs)/client/create-rfi', params: prefillKey ? { type: prefillKey } : {} as any });
  },[router]);

  const openRfi = useCallback((id: string|number)=>{ router.push({ pathname: '/(stack)/rfi/[id]', params: { id: String(id) } }); },[router]);


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <Image 
            source={{ uri: 'https://enspek.com/assets/images/logo/logo-ek.png' }} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.appBarRight}>
          <View style={styles.locationContainer}>
            <View style={styles.locationIcon}>
              <Text style={styles.locationIconText}>📍</Text>
            </View>
            <Text style={styles.locationText}>
              {user?.client_details?.country?.name || user?.country?.name || 'Location'}
            </Text>
          </View>
          <Text style={styles.subtitle}>Welcome back, {user?.name || 'Client'}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={!!isFetching} onRefresh={refetch} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
      >
        <View style={styles.content}>
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <HapticPressable 
              onPress={()=>onCreateRFI()} 
              style={styles.actionButton}
              hapticType={HapticType.Medium}
            >
              <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Request for Inspection</Text>
            </HapticPressable>
            
            <HapticPressable 
              onPress={()=>router.push('/(tabs)/client/upload-rfi')} 
              style={styles.actionButton}
              hapticType={HapticType.Medium}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Upload RFI</Text>
            </HapticPressable>
          </View>

          {/* My Requests Section */}
          <View style={styles.rfiSection}>
            <SectionHeader title='My Requests' actionLabel='View all' onAction={()=>router.push('/(tabs)/client/my-rfis')} />
            {isLoading ? (
              <SkeletonList />
            ) : requests?.length ? (
              <View>
                {requests.map((item: any) => (
                  <RfiCard 
                    key={item.id ?? item.rfi_id ?? Math.random()} 
                    item={item} 
                    onPress={()=>openRfi(item.id ?? item.rfi_id)} 
                  />
                ))}
              </View>
            ) : (
              <ZeroState onPrimary={()=>onCreateRFI()} />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


function SectionHeader({ title, actionLabel, onAction }:{ title:string; actionLabel?:string; onAction?:()=>void }){
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <HapticPressable onPress={onAction} hapticType={HapticType.Light}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </HapticPressable>
      ) : null}
    </View>
  );
}

function RfiCard({ item, onPress }:{ item:any; onPress:()=>void }){
  const status = item?.status || 'Open';
  return (
    <HapticPressable onPress={onPress} style={styles.rfiCard} hapticType={HapticType.Light}>
      <Text style={styles.rfiTitle}>{item?.job_title || item?.title || 'Inspection Request'}</Text>
      <Text style={styles.rfiDescription} numberOfLines={2}>{item?.enquiry_scope || item?.desc || 'Scope details not provided.'}</Text>
      <View style={styles.rfiFooter}>
        <StatusPill value={status} />
        <Text style={styles.rfiId}>#{String(item?.id ?? item?.rfi_id ?? '')}</Text>
      </View>
    </HapticPressable>
  );
}

function StatusPill({ value }:{ value:string }){
  const map: Record<string, string> = { Open: '#3B82F6', 'In-Progress': '#F59E0B', Completed: '#10B981', Closed: '#6B7280' };
  const color = map[value] || '#3B82F6';
  return (<View style={styles.statusPill}><Text style={[styles.statusText, { color }]}>{value}</Text></View>);
}

function SkeletonList(){
  return (
    <View>
      {Array.from({ length: 4 }).map((_,i)=> (<View key={i} style={styles.skeletonCard}>
        <View style={styles.skeletonLine1}/>
        <View style={styles.skeletonLine2}/>
        <View style={styles.skeletonLine3}/>
      </View>))}
    </View>
  );
}

function ZeroState({ onPrimary }:{ onPrimary:()=>void }){
  return (
    <View style={styles.zeroState}>
      <Text style={styles.zeroStateTitle}>No RFIs yet</Text>
      <Text style={styles.zeroStateDescription}>Create your first inspection request to get bids from qualified inspectors.</Text>
      <HapticPressable onPress={onPrimary} style={styles.primaryButton} hapticType={HapticType.Medium}>
        <Text style={styles.primaryButtonText}>Create RFI</Text>
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingTop: 20,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  appBarLeft: {
    alignItems: 'flex-start',
  },
  appBarRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 16,
  },
  logo: {
    width: 104,
    height: 60,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationIconText: {
    fontSize: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  subtitle: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  actionButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  rfiSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  rfiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rfiTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rfiDescription: {
    color: '#6B7280',
    marginBottom: 8,
  },
  rfiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusText: {
    fontWeight: '600',
  },
  rfiId: {
    color: '#6B7280',
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skeletonLine1: {
    height: 16,
    width: '50%',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLine2: {
    height: 16,
    width: '80%',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLine3: {
    height: 16,
    width: '66%',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  zeroState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  zeroStateTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  zeroStateDescription: {
    color: '#6B7280',
    marginBottom: 16,
  },
});