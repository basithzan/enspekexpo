import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export function useRequestInspection() {
  return useMutation({
    mutationFn: async (formData: any) => {
      const response = await apiClient.post('/request-new-inspection', formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    },
  });
}

export function useEditInspection() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post('/edit-inspection', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  });
}

export function useUploadRfiFile() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // axios will automatically detect FormData and set Content-Type with boundary
      const response = await apiClient.post('/upload-rfi-file', formData);
      return response.data;
    },
  });
}

export function useInspectorRatings(inspectorId: number | string | null) {
  return useQuery({
    queryKey: ['inspector-ratings', inspectorId],
    queryFn: async () => {
      const response = await apiClient.get(`/inspector-ratings/${inspectorId}`);
      return response.data;
    },
    enabled: !!inspectorId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSubmitInspectorRating() {
  return useMutation({
    mutationFn: async ({ inspector_id, enquiry_id, rating, review }: { inspector_id: number | string; enquiry_id: number | string; rating: number; review?: string; }) => {
      const response = await apiClient.post('/rate-inspector', {
        inspector_id,
        enquiry_id,
        rating,
        review,
      });
      return response.data;
    },
  });
}

export function useConfirmInspectorSelection() {
  return useMutation({
    mutationFn: async ({ accepted_inspector_id }: { accepted_inspector_id: number | string }) => {
      const response = await apiClient.post('/confirm-inspector', {
        accepted_inspector_id,
      });
      return response.data;
    },
  });
}


