import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export function useClientRequests() {
  return useQuery({
    queryKey: ['client-requests'],
    queryFn: async () => {
      const response = await apiClient.post('/get-client-requests');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useClientAlerts() {
  return useQuery({
    queryKey: ['client-alerts'],
    queryFn: async () => {
      const response = await apiClient.post('/get-client-alerts');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePendingInvoices() {
  return useQuery({
    queryKey: ['pending-invoices'],
    queryFn: async () => {
      const response = await apiClient.get('/pending-invoices');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useClientStats() {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: async () => {
      console.log('🔄 Fetching client statistics...');
      try {
        // Try multiple possible endpoints for statistics
        const endpoints = [
          '/get-client-stats',
          '/get-client-dashboard',
          '/get-client-kpi',
          '/get-client-summary'
        ];
        
        let response;
        let lastError;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`🔄 Trying client stats endpoint: ${endpoint}`);
            response = await apiClient.post(endpoint);
            console.log(`📡 ${endpoint} API response:`, response.data);
            if (response.data && (response.data.success !== false)) {
              console.log(`✅ Success with client stats endpoint: ${endpoint}`);
              return response.data;
            }
          } catch (error) {
            console.log(`❌ ${endpoint} failed:`, error.message);
            lastError = error;
            continue;
          }
        }
        
        // If all endpoints fail, try to calculate stats from existing data
        console.log('🔄 All client stats endpoints failed, calculating from existing data...');
        return await calculateClientStatsFromExistingData();
      } catch (error) {
        console.error('❌ Client Stats API error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
}

async function calculateClientStatsFromExistingData() {
  try {
    console.log('🔄 Calculating client stats from existing data...');
    
    // Fetch client requests data
    const requestsResponse = await apiClient.post('/get-client-requests');
    const requests = requestsResponse.data?.data || requestsResponse.data?.requests || requestsResponse.data?.enquiries || [];
    
    console.log('🔍 Raw client data for stats calculation:', {
      requests: requests.length,
      requestsData: requests.slice(0, 2) // First 2 requests for debugging
    });
    
    // Calculate statistics
    const stats = {
      success: true,
      completed_count: 0,
      rejected_count: 0,
      work_in_progress_count: 0,
      bids_count: 0,
      total_completed: 0,
      total_rejected: 0,
      total_jobs: requests.length,
      total_bids: 0,
      stats: {
        completed: 0,
        rejected: 0,
        workInProgress: 0,
        bids: 0,
        totalCompleted: 0,
        totalRejected: 0,
        totalJobs: requests.length,
        totalBids: 0
      }
    };
    
    // Count requests by status - handle both string and numeric status
    requests.forEach((request: any) => {
      const status = request.status;
      const statusStr = String(status).toLowerCase();
      const statusNum = parseInt(String(status));
      
      console.log('🔍 Client request status analysis:', {
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
    
    console.log('📊 Final calculated client stats:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error calculating client stats from existing data:', error);
    // Return default stats if calculation fails
    return {
      success: true,
      completed_count: 0,
      rejected_count: 0,
      work_in_progress_count: 0,
      bids_count: 0,
      total_completed: 0,
      total_rejected: 0,
      total_jobs: 0,
      total_bids: 0,
      stats: {
        completed: 0,
        rejected: 0,
        workInProgress: 0,
        bids: 0,
        totalCompleted: 0,
        totalRejected: 0,
        totalJobs: 0,
        totalBids: 0
      }
    };
  }
}
