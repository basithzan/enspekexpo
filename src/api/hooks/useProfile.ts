import { useState } from 'react';
import { apiClient } from '../client';
import { useAuth } from '../../contexts/AuthContext';

export const useProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateProfile = async (profileData: any) => {
    try {
      setLoading(true);

      // Prepare data based on user type
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        company_name: profileData.company_name,
        country_id: profileData.country_id,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        postal_code: profileData.postal_code,
        website: profileData.website,
        linkedin: profileData.linkedin,
        bio: profileData.bio,
      };

      // Add inspector-specific fields if user is inspector
      if (user?.type === 'inspector') {
        Object.assign(updateData, {
          specialization: profileData.specialization,
          experience_years: profileData.experience_years,
          certifications: profileData.certifications,
          languages: profileData.languages,
          availability: profileData.availability,
          hourly_rate: profileData.hourly_rate,
          currency: profileData.currency,
        });
      }

      // Choose the appropriate API endpoint
      const endpoint = user?.type === 'client' ? '/edit-client-data' : '/update-inspector-data';
      
      const response = await apiClient.post(endpoint, updateData);

      if (response.data.success) {
        // Update local user data
        await updateUser({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          company_name: profileData.company_name,
          country_id: profileData.country_id,
        });

        return { success: true, data: response.data };
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update profile'
      };
    } finally {
      setLoading(false);
    }
  };

  const getCountries = async () => {
    try {
      const response = await apiClient.post('/get-all-countries');
      if (response.data.success) {
        return { success: true, data: response.data.countries || [] };
      } else {
        throw new Error(response.data.message || 'Failed to load countries');
      }
    } catch (error: any) {
      console.error('Failed to load countries:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to load countries'
      };
    }
  };

  return {
    updateProfile,
    getCountries,
    loading,
  };
};


