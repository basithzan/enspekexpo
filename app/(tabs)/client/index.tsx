import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useRouter, Redirect } from 'expo-router';
import { useClientRequests, useClientStats } from '../../../src/api/hooks/useClient';
import { useAuth } from '../../../src/contexts/AuthContext';

// --- Services (Enspek offerings) for quick template RFIs ---
const SERVICES = [
  { key: 'PIM', label: 'PIM' },
  { key: 'DOC_REVIEW', label: 'Docs Review & Approval' },
  { key: 'WPS_PQR', label: 'WPS/PQR & Welder Qual.' },
  { key: 'MAT_REC', label: 'Material Receiving Insp.' },
  { key: 'CONS_REC', label: 'Consumable Insp.' },
  { key: 'MARK_CUT', label: 'Marking & Cutting' },
  { key: 'FIT_UP', label: 'Fit-up as per Drawings' },
  { key: 'WELD_INSP', label: 'Welding & Visual' },
  { key: 'NDT', label: 'NDT (PT/MT/UT/RT/PAUT)' },
  { key: 'FINAL_DIM', label: 'Final Visual & Dim.' },
  { key: 'FINAL_RELEASE', label: 'Final Release' },
  { key: 'DOSSIER', label: 'Dossier / MRB' }
];

export default function ClientHome(){
  const router = useRouter();
  const { logout, user, isAuthenticated } = useAuth();
  const { data, isLoading, isFetching, refetch } = useClientRequests();
  const { data: statsData, isLoading: statsLoading } = useClientStats();
  const requests = useMemo(()=> (data?.data || data?.requests || []), [data]);
  
  // Calculate stats from existing data as fallback
  const calculatedStats = useMemo(() => {
    if (statsData && statsData.success) {
      return statsData;
    }
    
    // Fallback: calculate from existing data
    const requestsList = data?.data || data?.requests || data?.enquiries || [];
    
    console.log('🔄 Calculating fallback client stats from existing data:', {
      requestsCount: requestsList.length,
      sampleRequest: requestsList[0]
    });
    
    const stats = {
      success: true,
      completed_count: 0,
      rejected_count: 0,
      work_in_progress_count: 0,
      bids_count: 0,
      total_completed: 0,
      total_rejected: 0,
      total_jobs: requestsList.length,
      total_bids: 0,
      stats: {
        completed: 0,
        rejected: 0,
        workInProgress: 0,
        bids: 0,
        totalCompleted: 0,
        totalRejected: 0,
        totalJobs: requestsList.length,
        totalBids: 0
      }
    };
    
    // Count requests by status
    requestsList.forEach((request: any) => {
      const status = request.status;
      const statusStr = String(status).toLowerCase();
      const statusNum = parseInt(String(status));
      
      console.log('🔍 Fallback client request status analysis:', {
        requestId: request.id,
        status: status,
        statusStr: statusStr,
        statusNum: statusNum,
        requestTitle: request.job_title || request.title
      });
      
      // Only count as completed if explicitly completed or finished
      if (statusStr === 'completed' || statusStr === 'finished' || statusNum === 5) {
        stats.completed_count++;
        stats.total_completed++;
        stats.stats.completed++;
        stats.stats.totalCompleted++;
        console.log('✅ Found completed client request:', request.id, 'Status:', status);
      } 
      // Only count as rejected if explicitly rejected or declined
      else if (statusStr === 'rejected' || statusStr === 'declined' || statusNum === 3) {
        stats.rejected_count++;
        stats.total_rejected++;
        stats.stats.rejected++;
        stats.stats.totalRejected++;
        console.log('❌ Found rejected client request:', request.id, 'Status:', status);
      } 
      // Count as work in progress for active/in-progress statuses
      else if (statusStr === 'in-progress' || statusStr === 'active' || statusStr === 'ongoing' || 
               statusStr === 'in_progress' || statusNum === 6 || statusNum === 2) {
        stats.work_in_progress_count++;
        stats.stats.workInProgress++;
        console.log('🔄 Found work in progress client request:', request.id, 'Status:', status);
      }
      // Count pending/open as work in progress (but not completed)
      else if (statusStr === 'pending' || statusStr === 'open' || statusNum === 1 || statusNum === 0) {
        stats.work_in_progress_count++;
        stats.stats.workInProgress++;
        console.log('⏳ Found pending/open client request (counting as work in progress):', request.id, 'Status:', status);
      }
      // For any other status, don't count as completed unless explicitly so
      else {
        console.log('❓ Unknown status for client request:', request.id, 'Status:', status, 'StatusStr:', statusStr, 'StatusNum:', statusNum);
      }
    });
    
    console.log('📊 Fallback calculated client stats:', stats);
    return stats;
  }, [statsData, data]);
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

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  }, [logout]);

  const kpi = useMemo(()=>({
    completed: (calculatedStats?.completed_count ?? calculatedStats?.stats?.completed) ?? 0,
    rejected: (calculatedStats?.rejected_count ?? calculatedStats?.stats?.rejected) ?? 0,
    workInProgress: (calculatedStats?.work_in_progress_count ?? calculatedStats?.stats?.workInProgress) ?? 0,
    bids: (calculatedStats?.bids_count ?? calculatedStats?.stats?.bids) ?? 0,
    totalCompleted: (calculatedStats?.total_completed ?? calculatedStats?.stats?.totalCompleted) ?? 0,
    totalRejected: (calculatedStats?.total_rejected ?? calculatedStats?.stats?.totalRejected) ?? 0,
    totalJobs: (calculatedStats?.total_jobs ?? calculatedStats?.stats?.totalJobs) ?? 0,
    totalBids: (calculatedStats?.total_bids ?? calculatedStats?.stats?.totalBids) ?? 0
  }),[calculatedStats]);

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
          <Text style={styles.subtitle}>Welcome back, {user?.name || 'Client'}</Text>
        </View>
        <View style={styles.appBarActions}>
          <Pressable style={styles.notificationButton}>
            <Text style={styles.buttonText}>Notifications</Text>
          </Pressable>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>

    <ScrollView 
      style={styles.scrollView}
      refreshControl={<RefreshControl refreshing={!!isFetching} onRefresh={refetch} />}
      contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
    >
      <View style={styles.content}>

        {/* Hero CTA */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Create a new inspection request</Text>
          <Text style={styles.heroDescription}>Share scope, location, date & documents. Inspectors will bid, you choose the best.</Text>
          <Pressable onPress={()=>onCreateRFI()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>New RFI</Text>
          </Pressable>
        </View>

        {/* KPIs */}
        <View style={styles.kpiGrid}>
          <DetailedKpi 
            title="Completed" 
            value={kpi.completed} 
            subtitle="Completed Jobs" 
            total={`Total Completed: ${kpi.totalCompleted}`}
          />
          <DetailedKpi 
            title="Rejected" 
            value={kpi.rejected} 
            subtitle="Jobs" 
            total={`Total Rejected: ${kpi.totalRejected}`}
          />
          <DetailedKpi 
            title="Work in progress" 
            value={kpi.workInProgress} 
            subtitle="Jobs" 
            total={`Total Jobs: ${kpi.totalJobs}`}
          />
          <DetailedKpi 
            title="Bids" 
            value={kpi.bids} 
            subtitle="Bids" 
            total={`Total Bid: ${kpi.totalBids}`}
          />
        </View>

        {/* Services Chips */}
        <View>
          <Text style={styles.sectionTitle}>Popular services</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
            <View style={styles.servicesContainer}>
              {SERVICES.map(s=> (
                <Pressable key={s.key} onPress={()=>onCreateRFI(s.key)} style={styles.serviceChip}>
                  <Text style={styles.serviceChipText}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Active RFIs */}
        <View style={styles.rfiSection}>
          <SectionHeader title='Your RFIs' actionLabel='View all' onAction={()=>router.push('/(tabs)/client/my-rfis')} />
          {isLoading ? (
            <SkeletonList />
          ) : requests?.length ? (
            <FlashList
              data={requests.slice(0,5)}
              keyExtractor={(i:any)=> String(i.id ?? i.rfi_id ?? Math.random())}
              renderItem={({item})=> <RfiCard item={item} onPress={()=>openRfi(item.id ?? item.rfi_id)} />}
            />
          ) : (
            <ZeroState onPrimary={()=>onCreateRFI()} />
          )}
        </View>

        {/* Help & Docs */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need help?</Text>
          <Text style={styles.helpDescription}>Chat with support or review your uploaded dossiers and invoices.</Text>
          <View style={styles.helpButtons}>
            <Pressable onPress={()=>router.push('/(tabs)/client/my-rfis')} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>My RFIs</Text>
            </Pressable>
            <Pressable onPress={()=>router.push('/(stack)/rfi/[id]')} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>View Reports</Text>
            </Pressable>
          </View>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Kpi({ title, value, tone }: { title: string; value: number; tone?: 'default'|'warning' }){
  const bg = tone==='warning' ? '#FEF2F2' : '#FFFFFF';
  return (
    <View style={[styles.kpiCard, { backgroundColor: bg }]}>
      <Text style={styles.kpiLabel}>{title}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

function DetailedKpi({ title, value, subtitle, total }: { 
  title: string; 
  value: number; 
  subtitle: string; 
  total: string; 
}){
  return (
    <View style={styles.detailedKpiCard}>
      <Text style={styles.detailedKpiTitle}>{title}</Text>
      <Text style={styles.detailedKpiValue}>{value}</Text>
      <Text style={styles.detailedKpiSubtitle}>{subtitle}</Text>
      <Text style={styles.detailedKpiTotal}>{total}</Text>
    </View>
  );
}

function SectionHeader({ title, actionLabel, onAction }:{ title:string; actionLabel?:string; onAction?:()=>void }){
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction}><Text style={styles.actionText}>{actionLabel}</Text></Pressable>
      ) : null}
    </View>
  );
}

function RfiCard({ item, onPress }:{ item:any; onPress:()=>void }){
  const status = item?.status || 'Open';
  return (
    <Pressable onPress={onPress} style={styles.rfiCard}>
      <Text style={styles.rfiTitle}>{item?.job_title || item?.title || 'Inspection Request'}</Text>
      <Text style={styles.rfiDescription} numberOfLines={2}>{item?.enquiry_scope || item?.desc || 'Scope details not provided.'}</Text>
      <View style={styles.rfiFooter}>
        <StatusPill value={status} />
        <Text style={styles.rfiId}>#{String(item?.id ?? item?.rfi_id ?? '')}</Text>
      </View>
    </Pressable>
  );
}

function StatusPill({ value }:{ value:string }){
  const map: Record<string, string> = { Open: '#3B82F6', 'In-Progress': '#F59E0B', Completed: '#10B981', Closed: '#6B7280' };
  const color = map[value] || '#3B82F6';
  return (<View style={[styles.statusPill, { borderColor: '#2A2D30' }]}><Text style={[styles.statusText, { color }]}>{value}</Text></View>);
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
      <Pressable onPress={onPrimary} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Create RFI</Text></Pressable>
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
    paddingTop: 0,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  appBarLeft: {
    alignItems: 'flex-start',
  },
  appBarRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  logo: {
    width: 104,
    height: 60,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#000000',
    fontWeight: 'bold',
  },
  notificationButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    color: '#374151',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTitle: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroDescription: {
    color: '#6B7280',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  kpiValue: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailedKpiCard: {
    width: '48%',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailedKpiTitle: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailedKpiValue: {
    color: '#1E40AF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailedKpiSubtitle: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailedKpiTotal: {
    color: '#6B7280',
    fontSize: 10,
  },
  sectionTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  servicesScroll: {
    marginLeft: -4,
  },
  servicesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  serviceChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceChipText: {
    color: '#374151',
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
    backgroundColor: '#121214',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2D30',
  },
  rfiTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rfiDescription: {
    color: '#A8B0B9',
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
    backgroundColor: '#16181A',
    borderWidth: 1,
  },
  statusText: {
    fontWeight: '600',
  },
  rfiId: {
    color: '#A8B0B9',
  },
  skeletonCard: {
    backgroundColor: '#121214',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2D30',
  },
  skeletonLine1: {
    height: 16,
    width: '50%',
    backgroundColor: '#16181A',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLine2: {
    height: 16,
    width: '80%',
    backgroundColor: '#16181A',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLine3: {
    height: 16,
    width: '66%',
    backgroundColor: '#16181A',
    borderRadius: 4,
  },
  zeroState: {
    backgroundColor: '#121214',
    borderRadius: 16,
    padding: 24,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#2A2D30',
  },
  zeroStateTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  zeroStateDescription: {
    color: '#A8B0B9',
    marginBottom: 16,
  },
  helpCard: {
    backgroundColor: '#121214',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2A2D30',
  },
  helpTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpDescription: {
    color: '#A8B0B9',
    marginBottom: 12,
  },
  helpButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#16181A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2D30',
  },
  secondaryButtonText: {
    color: '#F5F7FA',
  },
});