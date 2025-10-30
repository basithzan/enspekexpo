import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export function useViewEnquiry(enquiryId: number | string) {
  return useQuery({
    queryKey: ['enquiry', enquiryId],
    queryFn: async () => {
      const response = await apiClient.post('/get-single-enquiry', {
        id: enquiryId,
      });
      return response.data;
    },
    enabled: !!enquiryId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useBidForEnquiry() {
  return useMutation({
    mutationFn: async ({ id, amount, dates, currencies, amount_type }: { id: number | string; amount?: number | string; dates?: any; currencies?: any; amount_type?: any; }) => {
      const response = await apiClient.post('/bid-for-enquiry', {
        id,
        amount,
        dates,
        currencies,
        amount_type,
      });
      return response.data;
    },
  });
}

export function useConfirmProceed() {
  return useMutation({
    mutationFn: async ({ accepted_bid }: { accepted_bid: number | string }) => {
      const response = await apiClient.post('/proceed-inspection', {
        accepted_bid,
      });
      return response.data;
    },
  });
}

export function useUploadReportNote() {
  return useMutation({
    mutationFn: async ({ id, note }: { id: number | string; note: string }) => {
      const response = await apiClient.post('/upload-report-note', { id, note });
      return response.data;
    },
  });
}

export function useUploadFlashReport() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post('/upload-flash-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  });
}

export function useUploadInspectionData() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post('/upload-inspection-data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  });
}

export function useDeleteInspectionDoc() {
  return useMutation({
    mutationFn: async ({ id }: { id: number | string }) => {
      const response = await apiClient.post('/delete-inspection-doc', { id });
      return response.data;
    },
  });
}

export function useEnquiryCheckIn() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post('/add-enquiry-check-in', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  });
}

export function useEnquiryInvoices(enquiryId: number | string) {
  return useQuery({
    queryKey: ['enquiry-invoices', enquiryId],
    queryFn: async () => {
      const response = await apiClient.get(`/enquiry-invoices/${enquiryId}`);
      return response.data;
    },
    enabled: !!enquiryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async ({ amount, currency, description, invoice_id, master_log_id }: { amount: number; currency: string; description?: string; invoice_id?: number | string; master_log_id?: number | string; }) => {
      const response = await apiClient.post('/create-payment-intent', {
        amount,
        currency,
        description,
        invoice_id,
        master_log_id,
      });
      return response.data;
    },
  });
}


