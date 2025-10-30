import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { WEBSITE_API_URL } from "../../config/api";

const initialState = {
  token: null,
  error: null,
  auth_loading: false,
  auth_inspector: [],
  nearby_jobs: [],
  my_bids: [],
  single_job: [],
  inspector_loading: false,
  bid_success:false,
  upload_success:false,
  note_upload_success:false,
};

export const loginInspector = createAsyncThunk(
  "auth/loginInspector",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + "/inspector-login", {
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




export const registerInspector = createAsyncThunk(
  "auth/registerInspector",
  async ({ formData }) => {
    try {
      const response = await axios.post(WEBSITE_API_URL +"/inspector-register", formData, {
      
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data);
    }
  }
);


export const updateInspectorData = createAsyncThunk(
  "auth/updateInspectorData",
  async (token, thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + "/update-inspector-data", {
        token: token,
      });
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);
export const updateInspectorProfile = createAsyncThunk(
  "auth/updateInspectorProfile",
  async ({ formData, token },thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL +"/update-inspector-profile", formData, {
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



//save experiences and other multi fields
export const saveInspectorProfile = createAsyncThunk(
  "auth/saveInspectorProfile",
  async ({ formData, token },thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL +"/save-inspector-profile-data", formData, {
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

export const getNearByJobs = createAsyncThunk(
  "auth/getNearByJobs",
  async (token, thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + "/get-nearby-jobs", {
        token: token,
      });
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getMyBids = createAsyncThunk(
  "auth/getMyBids",
  async (token, thunkAPI) => {
    try {
      const response = await axios.post(WEBSITE_API_URL + "/get-my-bids", {
        token: token,
      });
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const viewSingleEnquiry = createAsyncThunk(
  "auth/viewSingleEnquiry",
  async ({token, id, thunkAPI}) => {
    try {
      const response = await axios.post(
        WEBSITE_API_URL + "/get-single-enquiry",
        {
          token: token,
          id: id,
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const bidEnquiry = createAsyncThunk(
  "auth/bidEnquiry",
  async ({token,id, inputs,dates, currencies,amount_type,thunkAPI}) => {
    try {
      const response = await axios.post(
        WEBSITE_API_URL + "/bid-for-enquiry",
        {
          token: token,
          id: id,
          amount:inputs?.amount,
          dates:dates,
          currencies:currencies,
          amount_type:amount_type,
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const confirmProceed = createAsyncThunk(
  "auth/confirmProceed",
  async ({token,id,thunkAPI}) => {
    try {
      const response = await axios.post(
        WEBSITE_API_URL + "/proceed-inspection",
        {
          token: token,
          accepted_bid: id,
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const submitReportNote = createAsyncThunk(
  "auth/submitReportNote",
  async ({token,id,note,thunkAPI}) => {
    try {
      const response = await axios.post(
        WEBSITE_API_URL + "/upload-report-note",
        {
          token: token,
          id: id,
          note:note
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const uploadFlashReport = createAsyncThunk(
  "auth/uploadFlashReport",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        WEBSITE_API_URL + "/upload-flash-report",
          formData
      );
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const uploadInspectionData = createAsyncThunk(
  "auth/uploadInspectionData",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${WEBSITE_API_URL}/upload-inspection-data`,
        formData
      );
      return response.data;
    } catch (err) {
      console.error(err);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);


export const deleteInspectionDoc = createAsyncThunk(
  "auth/deleteInspectionDoc",
  async ({token, id, thunkAPI}) => {
    try {
      const response = await axios.post(
        WEBSITE_API_URL + "/delete-inspection-doc",
        {
          token: token,
          id: id,
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);


export const saveCheckInEnquiry = createAsyncThunk(
  "auth/saveCheckInEnquiry",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        WEBSITE_API_URL + "/add-enquiry-check-in",
          formData
      );
      return response.data;
    } catch (err) {
      console.log(err);

      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const inspectorSlice = createSlice({
  name: "inspector",
  initialState: initialState,
  reducers: {
    logoutInspector: (state) => {
      state.auth_inspector = [];
    },
    emptyBidStatus: (state) => {
      state.bid_success = false;
    },
    emptyUploadSuccess: (state) => {
      state.upload_success = false;
    },
    emptyNoteUploadSuccess: (state) => {
      state.note_upload_success = false;
    },

    setInspectorReduxData: (state, { payload }) => {
      state.auth_inspector = payload;
    },
  },
  extraReducers: {
    [loginInspector.pending]: (state, { payload }) => {
      state.auth_loading = true;
    },
    [loginInspector.fulfilled]: (state, { payload }) => {
      state.auth_loading = false;
      state.auth_inspector = payload;
    },
    [loginInspector.rejected]: (state, { payload }) => {
      state.auth_loading = false;

      state.error = true;
    },


    [registerInspector.pending]: (state, { payload }) => {
      state.auth_loading = true;
    },
    [registerInspector.fulfilled]: (state, { payload }) => {
      state.auth_loading = false;
      state.auth_inspector = payload;
    },
    [registerInspector.rejected]: (state, { payload }) => {
      state.auth_loading = false;

      state.error = true;
    },
    [updateInspectorProfile.pending]: (state, { payload }) => {
      state.inspector_loading = true;
    },
    [updateInspectorProfile.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
      state.auth_inspector = payload;
    },
    [updateInspectorProfile.rejected]: (state, { payload }) => {
      state.inspector_loading = false;

      state.error = true;
    },

    
    
    [updateInspectorData.pending]: (state, { payload }) => {
      state.auth_loading = true;
    },
    [updateInspectorData.fulfilled]: (state, { payload }) => {
      state.auth_loading = false;
      state.auth_inspector = payload;
    },
    [updateInspectorData.rejected]: (state, { payload }) => {
      state.auth_loading = false;

      state.error = true;
    },


        
    [saveInspectorProfile.pending]: (state, { payload }) => {
      state.inspector_loading = true;
    },
    [saveInspectorProfile.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
    },
    [saveInspectorProfile.rejected]: (state, { payload }) => {
      state.inspector_loading = false;

      state.error = true;
    },
    


    [getNearByJobs.pending]: (state, { payload }) => {
      state.inspector_loading = true;
    },
    [getNearByJobs.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
      state.nearby_jobs = payload;
    },
    [getNearByJobs.rejected]: (state, { payload }) => {
      state.inspector_loading = false;

      state.error = true;
    },

    [getMyBids.pending]: (state, { payload }) => {
      state.inspector_loading = true;
    },
    [getMyBids.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
      state.my_bids = payload;
    },
    [getMyBids.rejected]: (state, { payload }) => {
      state.inspector_loading = false;

      state.error = true;
    },

    [viewSingleEnquiry.pending]: (state, { payload }) => {
      state.inspector_loading = true;
    },
    [viewSingleEnquiry.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
      state.single_job = payload;
    },
    [viewSingleEnquiry.rejected]: (state, { payload }) => {
      state.inspector_loading = false;

      state.error = true;
    },


    [deleteInspectionDoc.pending]: (state, { payload }) => {
      state.inspector_loading = true;
    },
    [deleteInspectionDoc.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
    },
    [deleteInspectionDoc.rejected]: (state, { payload }) => {
      state.inspector_loading = false;

      state.error = true;
    },

    [bidEnquiry.pending]: (state, { payload }) => {
      state.inspector_loading = true;
    },
    [bidEnquiry.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
      state.single_job = payload;
      state.bid_success =true
    },
    [bidEnquiry.rejected]: (state, { payload }) => {
      state.inspector_loading = false;

      state.error = true;
    },

    [confirmProceed.pending]: (state, { payload }) => {
      state.inspector_loading = true;
    },
    [confirmProceed.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
 
    },
    [confirmProceed.rejected]: (state, { payload }) => {
      state.inspector_loading = false;

      state.error = true;
    },


    [uploadFlashReport.pending]: (state, { payload }) => {
      state.inspector_loading = true;
      state.upload_success = false;

    },
    [uploadFlashReport.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
      state.single_job = payload;
      state.upload_success = true;
    },
    [uploadFlashReport.rejected]: (state, { payload }) => {
      state.inspector_loading = false;
      state.upload_success = false;

      state.error = true;
    },


    [uploadInspectionData.pending]: (state, { payload }) => {
      state.inspector_loading = true;
      state.upload_success = false;

    },
    [uploadInspectionData.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
      // state.single_job = payload;
      state.upload_success = true;
    },
    [uploadInspectionData.rejected]: (state, { payload }) => {
      state.inspector_loading = false;
      state.upload_success = false;

      state.error = true;
    },
    [submitReportNote.pending]: (state, { payload }) => {
      state.inspector_loading = true;
      state.note_upload_success = false;

    },
    [submitReportNote.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
      state.note_upload_success = true;
    },
    [submitReportNote.rejected]: (state, { payload }) => {
      state.inspector_loading = false;
      state.note_upload_success = false;

      state.error = true;
    },

    [saveCheckInEnquiry.pending]: (state, { payload }) => {
      state.inspector_loading = true;
      // state.upload_success = false;

    },
    [saveCheckInEnquiry.fulfilled]: (state, { payload }) => {
      state.inspector_loading = false;
      // state.upload_success = true;
    },
    [saveCheckInEnquiry.rejected]: (state, { payload }) => {
      state.inspector_loading = false;
      // state.upload_success = false;

      state.error = true;
    },
    
  },
});
export const { clearAlert ,emptyBidStatus,logoutInspector,emptyUploadSuccess,emptyNoteUploadSuccess,setInspectorReduxData} = inspectorSlice.actions;
export default inspectorSlice.reducer;
