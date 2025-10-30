import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export function useNearbyJobs() {
  return useQuery({
    queryKey: ['nearby-jobs'],
    queryFn: async () => {
      console.log('🔄 Fetching nearby jobs...');
      const response = await apiClient.post('/get-nearby-jobs', {
        include_bid_jobs: true, // Try to include jobs user has already bid on
        show_all: true // Try to show all available jobs
      });
      console.log('📡 Nearby jobs API response:', response.data);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

export function useMyBids() {
  return useQuery({
    queryKey: ['my-bids'],
    queryFn: async () => {
      console.log('🔄 Fetching my bids...');
      try {
        // Try multiple possible endpoints
        const endpoints = [
          '/get-my-bids',
          '/get-inspector-bids', 
          '/get-accepted-inspectors',
          '/get-my-accepted-jobs'
        ];
        
        let response;
        let lastError;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`🔄 Trying endpoint: ${endpoint}`);
            response = await apiClient.post(endpoint);
            console.log(`📡 ${endpoint} API response:`, response.data);
            if (response.data && (response.data.success !== false)) {
              console.log(`✅ Success with endpoint: ${endpoint}`);
              return response.data;
            }
          } catch (error) {
            console.log(`❌ ${endpoint} failed:`, error.message);
            lastError = error;
            continue;
          }
        }
        
        // If all endpoints fail, throw the last error
        throw lastError || new Error('All bid endpoints failed');
      } catch (error) {
        console.error('❌ My Bids API error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Reduce retries since we're trying multiple endpoints
    retryDelay: 1000,
  });
}

export function useInspectorProfile() {
  return useQuery({
    queryKey: ['inspector-profile'],
    queryFn: async () => {
      const response = await apiClient.post('/get-inspector-profile');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useInspectorRatings() {
  return useQuery({
    queryKey: ['inspector-ratings'],
    queryFn: async () => {
      const response = await apiClient.get('/inspector-profile-ratings');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useInspectorStats() {
  return useQuery({
    queryKey: ['inspector-stats'],
    queryFn: async () => {
      console.log('🔄 Fetching inspector statistics...');
      try {
        // 1) Prefer the same source the old PWA uses for counts
        try {
          const profileRes = await apiClient.post('/update-inspector-data');
          const user = profileRes?.data?.user || profileRes?.data?.data || profileRes?.data;
          if (user && (user.completedCount !== undefined || user.acceptedCount !== undefined)) {
            const stats = {
              success: true,
              completed_count: Number(user.completedCount || 0),
              rejected_count: Number(user.rejectedCount || 0),
              work_in_progress_count: Number(user.acceptedCount || 0),
              bids_count: Number(user.appliedCount || 0),
              total_completed: Number(user.completedCount || 0),
              total_rejected: Number(user.rejectedCount || 0),
              total_jobs: Number(user.acceptedCount || 0),
              total_bids: Number(user.appliedCount || 0),
              stats: {
                completed: Number(user.completedCount || 0),
                rejected: Number(user.rejectedCount || 0),
                workInProgress: Number(user.acceptedCount || 0),
                bids: Number(user.appliedCount || 0),
                totalCompleted: Number(user.completedCount || 0),
                totalRejected: Number(user.rejectedCount || 0),
                totalJobs: Number(user.acceptedCount || 0),
                totalBids: Number(user.appliedCount || 0),
              }
            };
            console.log('✅ Stats from update-inspector-data:', stats);
            return stats;
          }
        } catch (primaryErr) {
          console.log('❌ update-inspector-data failed for stats, falling back...', (primaryErr as any)?.message);
        }

        // Try multiple possible endpoints for statistics
        const endpoints = [
          '/get-inspector-stats',
          '/get-inspector-dashboard',
          '/get-inspector-kpi',
          '/get-inspector-summary'
        ];
        
        let response;
        let lastError;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`🔄 Trying stats endpoint: ${endpoint}`);
            response = await apiClient.post(endpoint);
            console.log(`📡 ${endpoint} API response:`, response.data);
            if (response.data && (response.data.success !== false)) {
              console.log(`✅ Success with stats endpoint: ${endpoint}`);
              return response.data;
            }
          } catch (error) {
            console.log(`❌ ${endpoint} failed:`, error.message);
            lastError = error;
            continue;
          }
        }
        
        // If all endpoints fail, try to calculate stats from existing data
        console.log('🔄 All stats endpoints failed, calculating from existing data...');
        return await calculateStatsFromExistingData();
      } catch (error) {
        console.error('❌ Inspector Stats API error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
}

async function calculateStatsFromExistingData() {
  try {
    console.log('🔄 Calculating stats from existing data...');
    
    // Fetch nearby jobs and bids data
    const [nearbyJobsResponse, bidsResponse] = await Promise.all([
      apiClient.post('/get-nearby-jobs', {
        include_bid_jobs: true,
        show_all: true
      }),
      apiClient.post('/get-my-bids')
    ]);
    
    const nearbyJobs = nearbyJobsResponse.data?.data || nearbyJobsResponse.data?.nearby_jobs || [];
    const bids = bidsResponse.data?.my_bids || bidsResponse.data?.data || bidsResponse.data?.bids || [];
    
    console.log('🔍 Raw data for stats calculation:', {
      nearbyJobs: nearbyJobs.length,
      bids: bids.length,
      nearbyJobsData: nearbyJobs.slice(0, 2), // First 2 jobs for debugging
      bidsData: bids.slice(0, 2) // First 2 bids for debugging
    });
    
    // Calculate statistics
    const stats = {
      success: true,
      completed_count: 0,
      rejected_count: 0,
      work_in_progress_count: 0,
      bids_count: bids.length,
      total_completed: 0,
      total_rejected: 0,
      total_jobs: bids.length, // Total jobs = jobs you bid on
      total_bids: bids.length,
      stats: {
        completed: 0,
        rejected: 0,
        workInProgress: 0,
        bids: bids.length,
        totalCompleted: 0,
        totalRejected: 0,
        totalJobs: bids.length, // Total jobs = jobs you bid on
        totalBids: bids.length
      }
    };
    
    // Work in Progress = Jobs you've bid on (from bids data)
    stats.work_in_progress_count = bids.length;
    stats.stats.workInProgress = bids.length;
    
    console.log('🔄 Work in Progress calculation:', {
      bidsList: bids.map((bid: any) => ({ id: bid.id, title: bid.job_title })),
      workInProgressCount: stats.work_in_progress_count
    });
    
    // Count jobs by status (for completed/rejected from nearby jobs)
    nearbyJobs.forEach((job: any) => {
      const status = job.status;
      const statusStr = String(status).toLowerCase();
      const statusNum = parseInt(String(status));
      
      console.log('🔍 Job status analysis:', {
        jobId: job.id,
        status: status,
        statusStr: statusStr,
        statusNum: statusNum,
        jobTitle: job.job_title || job.title
      });
      
      // Only count as completed if explicitly "completed" or "finished" (very strict)
      // Note: Status "5" is not completed based on user feedback
      if (statusStr === 'completed' || statusStr === 'finished') {
        stats.completed_count++;
        stats.total_completed++;
        stats.stats.completed++;
        stats.stats.totalCompleted++;
        console.log('✅ Found completed job:', job.id, 'Status:', status);
      } 
      // Only count as rejected if explicitly rejected or declined
      else if (statusStr === 'rejected' || statusStr === 'declined' || statusNum === 3) {
        stats.rejected_count++;
        stats.total_rejected++;
        stats.stats.rejected++;
        stats.stats.totalRejected++;
        console.log('❌ Found rejected job:', job.id, 'Status:', status);
      }
      // For any other status, don't count as completed unless explicitly so
      else {
        console.log('❓ Unknown status for job:', job.id, 'Status:', status, 'StatusStr:', statusStr, 'StatusNum:', statusNum);
      }
    });
    
    console.log('📊 Final calculated stats:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error calculating stats from existing data:', error);
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
