import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { WEBSITE_API_URL } from "../../config/api";

const initialState = {
    token: null,
    error: null,
    auth_loading: false,
    auth_client: [],
    client_loading:false,
    client_requests:[],
    client_alerts:[],
    request_success:true,
    countries:[],
    inspector_ratings: [],
    inspector_ratings_loading: false,
    rating_submission_loading: false,
    rating_submission_success: false,
    enquiry_invoices: [],
    enquiry_invoices_loading: false,
    payment_intent_loading: false,
    payment_intent_success: false,
};


export const loginClient = createAsyncThunk(
    "auth/loginClient",
    async (userData, thunkAPI) => {
      try {
        const response = await axios.post(WEBSITE_API_URL + "/client-login", {
          email: userData.email,
          password: userData.password,
        });
        return response.data;
      } catch (err) {
        console.log(err);

        return thunkAPI.rejectWithValue(err.response.data);
      }
    }
  );


export const registerClient = createAsyncThunk(
  "auth/registerUser",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + "/client-register", {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        company_name : userData.company_name,
        country_id : userData.country_id,
      });
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getClientRequests = createAsyncThunk(
  "auth/getClientRequests",
  async (token, thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + "/get-client-requests", {
        token: token,
      });
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const requestNewInspection = createAsyncThunk(
  "auth/requestNewInspection",
  async ({ formData, token }) => {
    try {
      const response = await axios.post(WEBSITE_API_URL +"/request-new-inspection", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data);
    }
  }
);

export const editInspection = createAsyncThunk(
  "auth/editInspection",
  async ({ formData, token }) => {
    try {
      const response = await axios.post(WEBSITE_API_URL +"/edit-inspection", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data);
    }
  }
);

export const getInspectorRatings = createAsyncThunk(
  "auth/getInspectorRatings",
  async ({ inspectorId, token }) => {
    try {
      const response = await axios.get(WEBSITE_API_URL + `/inspector-ratings/${inspectorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data);
    }
  }
);

export const submitInspectorRating = createAsyncThunk(
  "auth/submitInspectorRating",
  async ({ inspectorId, enquiryId, rating, review, token }) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + `/rate-inspector`, {
        inspector_id: inspectorId,
        enquiry_id: enquiryId,
        rating: rating,
        review: review,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data);
    }
  }
);

export const getEnquiryInvoices = createAsyncThunk(
  "auth/getEnquiryInvoices",
  async ({ enquiryId, token }) => {
    try {
      const response = await axios.get(WEBSITE_API_URL + `/enquiry-invoices/${enquiryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data);
    }
  }
);

export const confirmInspectorSelection = createAsyncThunk(
  "auth/confirmInspectorSelection",
  async ({ acceptedInspectorId, token }) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + "/confirm-inspector", {
        accepted_inspector_id: acceptedInspectorId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || error.message);
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  "auth/createPaymentIntent",
  async ({ amount, currency, description, invoiceId, masterLogId, token }) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + `/create-payment-intent`, {
        amount: amount,
        currency: currency,
        description: description,
        invoice_id: invoiceId,
        master_log_id: masterLogId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data);
    }
  }
);


export const uploadRfiFile = createAsyncThunk(
  "auth/uploadRfiFile",
  async ({ formData, token }) => {
    try {
      const response = await axios.post(WEBSITE_API_URL +"/upload-rfi-file", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data);
    }
  }
);


export const getClientAlerts = createAsyncThunk(
  "auth/getClientAlerts",
  async (token, thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + "/get-client-alerts", {
        token: token,
      });
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);


export const getAllCountries = createAsyncThunk(
  "auth/getAllCountries",
  async (token, thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + "/get-all-countries", {
        token: token,
      });
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);



export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ formData, token },thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL +"/edit-client-data", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

//
// export const requestNewInspection = createAsyncThunk(
//   "auth/requestNewInspection",
//   async ({token, formData, thunkAPI}) => {
//     try {
//       const response = await axios.post(
//         WEBSITE_API_URL + "/bid-for-enquiry",
//         {
//           token: token,
//           id: id,
//           amount:inputs?.amount,
//           date:inputs?.date
//         }
//       );
//       return response.data;
//     } catch (err) {
//       console.log(err);

//       return thunkAPI.rejectWithValue(err.response.data);
//     }
//   }
// );
const clientSlice = createSlice({
  name: "client",
  initialState: initialState,
  reducers: {
    logoutClient: (state) => {
      state.auth_client = [];
    },

    clearRequestSuccess: (state) => {
      state.request_success = false;
    },
    clearRatingSubmissionSuccess: (state) => {
      state.rating_submission_success = false;
    },
    clearPaymentIntentSuccess: (state) => {
      state.payment_intent_success = false;
    },
    setClientReduxData: (state, { payload }) => {
      state.auth_client = payload;
    },
  },
  extraReducers: {
    [loginClient.pending]: (state, { payload }) => {
        state.auth_loading = true;
      },
      [loginClient.fulfilled]: (state, { payload }) => {
        state.auth_loading = false;
        state.auth_client = payload;
      },
      [loginClient.rejected]: (state, { payload }) => {
        state.auth_loading = false;

        state.error = true;
      },
      [registerClient.pending]: (state, { payload }) => {
        state.auth_loading = true;
      },
      [registerClient.fulfilled]: (state, { payload }) => {
        state.auth_loading = false;
        state.auth_client = payload;
      },
      [registerClient.rejected]: (state, { payload }) => {
        state.auth_loading = false;

        state.error = true;
      },

      [getClientRequests.pending]: (state, { payload }) => {
        state.client_loading = true;
      },
      [getClientRequests.fulfilled]: (state, { payload }) => {
        state.client_loading = false;
        state.client_requests = payload;
      },
      [getClientRequests.rejected]: (state, { payload }) => {
        state.client_loading = false;

        state.error = true;
      },

      [getClientAlerts.pending]: (state, { payload }) => {
        state.client_loading = true;
      },
      [getClientAlerts.fulfilled]: (state, { payload }) => {
        state.client_loading = false;
        state.client_alerts = payload;
      },
      [getClientAlerts.rejected]: (state, { payload }) => {
        state.client_loading = false;

        state.error = true;
      },


      [requestNewInspection.pending]: (state, { payload }) => {
        state.client_loading = true;
      },
      [requestNewInspection.fulfilled]: (state, { payload }) => {
        state.request_success =  true;
        state.client_loading = false;

        console.log('ffkfjfj');
      },
      [requestNewInspection.rejected]: (state, { payload }) => {
        state.client_loading = false;
        state.request_success =  false;
        console.log('jedcijaefnjkn');

        state.error = true;
      },

      [editInspection.pending]: (state, { payload }) => {
        state.client_loading = true;
      },
      [editInspection.fulfilled]: (state, { payload }) => {
        state.request_success =  true;
        state.client_loading = false;

        console.log('edit inspection success');
      },
      [editInspection.rejected]: (state, { payload }) => {
        state.client_loading = false;
        state.request_success =  false;
        console.log('edit inspection failed');

        state.error = true;
      },

      [uploadRfiFile.pending]: (state, { payload }) => {
        state.client_loading = true;
      },
      [uploadRfiFile.fulfilled]: (state, { payload }) => {
        state.request_success =  true;
        state.client_loading = false;

        console.log('ffkfjfj');
      },
      [uploadRfiFile.rejected]: (state, { payload }) => {
        state.client_loading = false;
        state.request_success =  false;
        console.log('jedcijaefnjkn');

        state.error = true;
      },



      [getAllCountries.pending]: (state, { payload }) => {
        state.client_loading = true;
      },
      [getAllCountries.fulfilled]: (state, { payload }) => {
        state.client_loading = false;
        state.countries = payload;
      },
      [getAllCountries.rejected]: (state, { payload }) => {
        state.client_loading = false;

        state.error = true;
      },
      [updateProfile.pending]: (state, { payload }) => {
        state.client_loading = true;
      },
      [updateProfile.fulfilled]: (state, { payload }) => {
        state.client_loading = false;
        state.auth_client = payload;

      },
      [updateProfile.rejected]: (state, { payload }) => {
        state.client_loading = false;

        state.error = true;
      },

      [getInspectorRatings.pending]: (state, { payload }) => {
        state.inspector_ratings_loading = true;
      },
      [getInspectorRatings.fulfilled]: (state, { payload }) => {
        state.inspector_ratings_loading = false;
        state.inspector_ratings = payload;
      },
      [getInspectorRatings.rejected]: (state, { payload }) => {
        state.inspector_ratings_loading = false;
        state.error = true;
      },

      [submitInspectorRating.pending]: (state, { payload }) => {
        state.rating_submission_loading = true;
      },
      [submitInspectorRating.fulfilled]: (state, { payload }) => {
        state.rating_submission_loading = false;
        state.rating_submission_success = true;
      },
      [submitInspectorRating.rejected]: (state, { payload }) => {
        state.rating_submission_loading = false;
        state.error = true;
      },

      [getEnquiryInvoices.pending]: (state, { payload }) => {
        state.enquiry_invoices_loading = true;
      },
      [getEnquiryInvoices.fulfilled]: (state, { payload }) => {
        state.enquiry_invoices_loading = false;
        state.enquiry_invoices = payload.data || [];
      },
      [getEnquiryInvoices.rejected]: (state, { payload }) => {
        state.enquiry_invoices_loading = false;
        state.error = true;
      },

      [confirmInspectorSelection.pending]: (state) => {
        state.client_loading = true;
      },
      [confirmInspectorSelection.fulfilled]: (state, { payload }) => {
        state.client_loading = false;
      },
      [confirmInspectorSelection.rejected]: (state) => {
        state.client_loading = false;
        state.error = true;
      },

      [createPaymentIntent.pending]: (state, { payload }) => {
        state.payment_intent_loading = true;
      },
      [createPaymentIntent.fulfilled]: (state, { payload }) => {
        state.payment_intent_loading = false;
        state.payment_intent_success = true;
      },
      [createPaymentIntent.rejected]: (state, { payload }) => {
        state.payment_intent_loading = false;
        state.error = true;
      },


  },
});
export const { clearAlert ,clearRequestSuccess, clearRatingSubmissionSuccess, clearPaymentIntentSuccess, logoutClient,setClientReduxData} = clientSlice.actions;
export default clientSlice.reducer;
