import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../../app/store";
import { Booking, BookingData } from "../../types/bookingTypes";

interface BookingState {
  booking: Booking | null;
  bookings: Booking[];
  isLoading: boolean;
  isError: string | null;
}

const API_URL = 'http://localhost:3000/';

export const createBooking = createAsyncThunk<Booking, BookingData, { state: RootState, rejectValue: string }>(
  "booking/createBooking",
  async (bookingData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      if (!token) {
        return rejectWithValue("No token found");
      }
      console.log("BookingData:", bookingData);
      
      const response = await axios.post(`${API_URL}booking`, bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true 
      });
      console.log('Create Booking:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating booking:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "An error occurred while creating the booking");
    }
  }
);

export const fetchBookings = createAsyncThunk<Booking[], void, { state: RootState , rejectValue: string }>(
  "booking/fetchBookings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token
      
      const response = await axios.get(`${API_URL}listBookings`, {
        headers: {
        'Authorization' : `Bearer ${token}`,
        'Accept': 'application/json',

      },
      withCredentials: true 
    });
        if (response.headers['content-type']?.includes('application/json')) {
        return response.data;
      } else {
        console.error('Expected JSON response, received:', response.headers['content-type']);
        return rejectWithValue('Expected JSON response, but received non-JSON.');
      }
    } catch (error: any) {
      console.error('Fetch failed:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bookings");
    }
  }
);

export const bookingDetails = createAsyncThunk<Booking[], {bookingId : string}, { state:RootState, rejectValue: string }>(
  "booking/bookingDetails",
  async (bookingId, {getState, rejectWithValue }) => {
    console.log("Received bookingId:", bookingId); 
    
    try {
      const token = getState().auth.user?.token
      console.log("Token:",token);

      if (!token) {
        return rejectWithValue('No token found. Please log in.');
      }
      console.log('token',token);
      
      const response = await axios.get(`${API_URL}booking/${bookingId}`, {
        headers: {
        'Accept': 'application/json',
        'Authorization' : `Bearer ${token}`
      },
      withCredentials: true 
    });
    console.log('BookingDetails:',response);
    
      if (!response.data || typeof response.data !== 'object') {
        console.error('Expected JSON object response, received:', response.data);
        return rejectWithValue('Expected JSON object response, but received non-object.');
      }
      return response.data;
    } catch (error: any) {
      console.error('Fetch failed:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bookings");
    }
  }
)

export const listReservations = createAsyncThunk<BookingState[], { managerId: string }, { state: RootState, rejectValue: string }>(
  "booking/listReservations",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().managerAuth.manager?.token;
      if (!token) {
        return rejectWithValue("No token found");
      }
      const managerId = getState().managerAuth.manager?._id; 
      const response = await axios.get(`${API_URL}manager/reservations/${managerId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true 
      });
      if (response.headers['content-type']?.includes('application/json')) {
        return response.data;
      } else {
        console.error('Expected JSON response, received:', response.headers['content-type']);
        return rejectWithValue('Expected JSON response, but received non-JSON.');
      }
    } catch (error: any) {
      console.error('Fetch failed:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bookings");
    }
  }
);

export const reservationDetails = createAsyncThunk<BookingData[], {bookingId : string}, { state: RootState, rejectValue: string }>(
  "booking/reservationDetails",
  async ({bookingId}, { getState, rejectWithValue }) => {
    try {
      const token = getState().managerAuth.manager?.token;
      const response = await axios.get(`${API_URL}manager/reservations/${bookingId}`, {
        headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true 
    });
      console.log("reservationDetails:",response);
      
      if (!response.data || typeof response.data !== 'object') {
        console.error('Expected JSON object response, received:', response.data);
        return rejectWithValue('Expected JSON object response, but received non-object.');
      }
      return response.data;

    } catch (error: any) {
      console.error('Fetch failed:', error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bookings");
    }
  }
)

export const approveCancellation = createAsyncThunk(
  'booking/approveCancellation',
  async ({ bookingId, token }: { bookingId: string; token?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}manager/cancel/${bookingId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const rejectCancellation = createAsyncThunk(
  'booking/rejectCancellation',
  async ({ bookingId, token }: { bookingId: string; token?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}manager/cancel/${bookingId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);



const initialState: BookingState = {
  booking: null,
  bookings: [],
  isLoading: false,
  isError: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    selectBooking(state, action: PayloadAction<Booking | null>) {
      state.booking = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isLoading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload ?? "An error occurred";
      })
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload ?? "An error occurred";
        console.error("Error fetching bookings:", state.isError);
      })
      .addCase(bookingDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bookingDetails.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.isLoading = false;
        state.booking = action.payload;
        console.log("BookingDetails updated in state:", state.bookings);
      })
      .addCase(bookingDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload ?? "An error occurred";
        console.error("Error fetching bookingdetails:", state.isError);
      })
      .addCase(listReservations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(listReservations.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.isLoading = false;
        state.bookings = action.payload;
        console.log("Bookings for manager updated in state:", state.bookings);
      })
      .addCase(listReservations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload ?? "An error occurred";
        console.error("Error fetching reservations:", state.isError);
      })
      .addCase(reservationDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(reservationDetails.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.isLoading = false;
        state.bookings = action.payload;
        console.log("BookingDetails updated in state:", state.bookings);
      })
      .addCase(reservationDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload ?? "An error occurred";
        console.error("Error fetching bookingdetails:", state.isError);
      })
      .addCase(approveCancellation.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(booking => booking._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(rejectCancellation.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(booking => booking._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      });
  },
});

export const { selectBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
