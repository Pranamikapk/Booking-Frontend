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

export const createBooking = createAsyncThunk<Booking, BookingData, { rejectValue: string }>(
  "booking/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No token found");
      }
      const response = await axios.post("/booking", bookingData, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
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
        'Accept': 'application/json',
        'Authorization' : `Bearer ${token}`
      }});
      console.log('Response headers:', response.headers);
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

export const bookingDetails = createAsyncThunk<Booking[], {bookingId : string}, { rejectValue: string }>(
  "booking/bookingDetails",
  async ({bookingId}, { rejectWithValue }) => {
    console.log("Received bookingId:", bookingId); 

    try {
      const response = await axios.get(`${API_URL}booking/${bookingId}`, {
        headers: {
        'Accept': 'application/json'
      }});
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
        }
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
  async (bookingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().managerAuth.manager?.token;
      const response = await axios.get(`${API_URL}manager/reservations/${bookingId}`, {
        headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }});
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

export const handleCancelBooking = createAsyncThunk<
  BookingData[],
  { bookingId: string; reason: string },
  { state: RootState, rejectValue: string }
>(
  "booking/cancelRequest",
  async ({ bookingId, reason }, { getState ,rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const response = await fetch(`${API_URL}cancelRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId, reason }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Cancellation request submitted successfully:', result);
        return result;
      } else {
        console.error('Failed to submit cancellation request:', response.statusText);
        return rejectWithValue('Failed to submit cancellation request');
      }
    } catch (error) {
      console.error('Error submitting cancellation request:', error);
      return rejectWithValue('Error submitting cancellation request');
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
        console.log("Bookings updated in state:", state.bookings);
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
      .addCase(handleCancelBooking.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(handleCancelBooking.fulfilled, (state, action: PayloadAction<BookingData[]>) => {
        state.isLoading = false;
        state.bookings = action.payload;
        state.isError = null;
        console.log(action.payload);
        
      })
      .addCase(handleCancelBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload as string;
      });
  },
});

export const { selectBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
