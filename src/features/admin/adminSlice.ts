import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';
import { Admin, AdminState } from '../../types/adminTypes';
import { Hotel } from '../../types/hotelTypes';
import { Manager } from '../../types/managerTypes';
import { User } from '../../types/userTypes';

const safeJSONParse = (item: string | null): any => {
    try {
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return null;
    }
};

const storedAdmin = safeJSONParse(localStorage.getItem('admin'));
const admin: Admin | null = storedAdmin && storedAdmin !== "undefined" ? storedAdmin : null;

const initialState: AdminState = {
    admin: admin ? admin : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
    users: [],
    managers: [],
    hotels: []
};

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/admin/`;

const adminService = {
    login: async (adminData: { email: string; password: string }) => {
        const response = await axios.post(API_URL + 'login', adminData);
        if (response.data) {
            localStorage.setItem('admin', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('admin');
    },

    getAllUsers: async (token: string) => {
        const config = {
            headers: { authorization: `Bearer ${token}` }
        };
        const response = await axios.get(API_URL + 'users', config);
        return response.data;
    },

    getAllManagers: async (token: string) => {
        const config = {
            headers: { authorization: `Bearer ${token}` }
        };
        const response = await axios.get(API_URL + 'managers', config);
        return response.data;
    },

    blockUser: async (userId: string, token: string) => {
        const config = {
            headers: { authorization: `Bearer ${token}` }
        };
        const response = await axios.post(API_URL + 'userBlock', { userId }, config);
        return response.data;
    },

    getHotels: async (token: string) => {
        const config = {
            headers: { authorization: `Bearer ${token}` }
        };
        const response = await axios.get(API_URL + 'hotels', config);
        return response.data;
    },

    approveHotels: async (hotelId: string, status: boolean, token: string) => {
        const config = {
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        };
        const response = await axios.post(`${API_URL}approve/${hotelId}`, { status }, config);
        return response.data;
    },

    listUnlistHotel: async (hotelId: string, status: boolean, token: string) => {
        const config = {
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        };
        const response = await axios.post(`${API_URL}listUnlist/${hotelId}`, { status }, config);
        return response.data;
    }
};

export const login = createAsyncThunk<Admin, { email: string; password: string }, { rejectValue: string }>(
    "adminAuth/login",
    async (admin, thunkAPI) => {
        try {
            const response = await adminService.login(admin);
            localStorage.setItem('admin', JSON.stringify(response));
            localStorage.setItem('token', response.token);
            return response;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const logout = createAsyncThunk(
    "adminAuth/logout",
    async () => {
        adminService.logout();
    }
);

export const getAllUsers = createAsyncThunk<User[], void, { state: RootState; rejectValue: string }>(
    "adminAuth/users",
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.admin?.token;
            if (!token) {
                return thunkAPI.rejectWithValue("User not authenticated");
            }
            const response = await adminService.getAllUsers(token);
            return response;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getAllManagers = createAsyncThunk<Manager[], void, { state: RootState; rejectValue: string }>(
    'adminAuth/getAllManagers',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.admin?.token;
            if (!token) {
                return thunkAPI.rejectWithValue('User not authenticated');
            }
            const response = await adminService.getAllManagers(token);
            return response;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const blockUser = createAsyncThunk<User, string, { state: RootState; rejectValue: string }>(
    "adminAuth/userBlock",
    async (userId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.admin?.token || localStorage.getItem('token');
            if (!token) {
                return thunkAPI.rejectWithValue('User not authenticated');
            }
            return await adminService.blockUser(userId, token);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getHotel = createAsyncThunk(
    "adminAuth/hotelList",
    async ({ token }: { token: string }, thunkAPI) => {
        try {
            const data = await adminService.getHotels(token);
            return data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const approveHotel = createAsyncThunk<Hotel, { hotelId: string; status: boolean }, { state: RootState; rejectValue: string }>(
    "adminAuth/approve",
    async ({ hotelId, status }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.admin?.token || localStorage.getItem('token');
            if (!token) {
                return thunkAPI.rejectWithValue('User not authenticated');
            }
            return await adminService.approveHotels(hotelId, status, token);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const listUnlistHotel = createAsyncThunk<Hotel, { hotelId: string; status: boolean }, { state: RootState; rejectValue: string }>(
    "adminAuth/listUnlistHotel",
    async ({ hotelId, status }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.admin?.token || localStorage.getItem('token');
            if (!token) {
                return thunkAPI.rejectWithValue('User not authenticated');
            }
            return await adminService.listUnlistHotel(hotelId, status, token);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Admin slice for managing state
export const adminSlice = createSlice({
    name: 'adminAuth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<Admin>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.admin = action.payload;
            })
            .addCase(login.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || '';
                state.admin = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.admin = null;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
            })
            .addCase(getAllUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.users = action.payload;
            })
            .addCase(getAllUsers.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || '';
                state.users = [];
            })
            .addCase(getAllManagers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllManagers.fulfilled, (state, action: PayloadAction<Manager[]>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.managers = action.payload;
            })
            .addCase(getAllManagers.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || '';
                state.managers = [];
            })
            .addCase(blockUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(blockUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.users = state.users.filter((user) => user._id !== action.payload._id);
            })
            .addCase(blockUser.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || '';
            })
            .addCase(getHotel.fulfilled, (state, action: PayloadAction<Hotel[]>) => {
                state.hotels = action.payload;
            })
            .addCase(approveHotel.fulfilled, (state, action: PayloadAction<Hotel>) => {
                state.hotels = state.hotels.map((hotel) =>
                    hotel._id === action.payload._id ? action.payload : hotel
                );
            })
            .addCase(listUnlistHotel.fulfilled, (state, action: PayloadAction<Hotel>) => {
                state.hotels = state.hotels.map((hotel) =>
                    hotel._id === action.payload._id ? action.payload : hotel
                );
            });
    }
});

export const { reset } = adminSlice.actions;
export default adminSlice.reducer;
