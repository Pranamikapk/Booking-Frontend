import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';
import { Manager, ManagerData } from '../../types/managerTypes';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/manager/`;

const normalizeManagerResponse = (data: any): Manager => {
    const { 
        _id, 
        name, 
        email, 
        token, 
        isBlocked = false, 
        isVerified = false, 
        isApproved = false, 
        phone = '', 
        licence = '', 
        wallet = 0, 
        hotels = [] 
    } = data._doc || data;
    return { _id, name, email, token, isBlocked, isVerified, isApproved, phone, licence, wallet, hotels };
};

const setLocalStorageManager = (manager: Manager): void => {
    localStorage.setItem('manager', JSON.stringify(manager));
};

const register = async (managerData: ManagerData): Promise<Manager> => {
    const response = await axios.post<Manager>(`${API_URL}register`, managerData);
    const normalizedData = normalizeManagerResponse(response.data);
    setLocalStorageManager(normalizedData);
    return normalizedData;
};

const login = async (managerData: ManagerData): Promise<Manager> => {
    const response = await axios.post<Manager>(`${API_URL}login`, managerData);
    const normalizedData = normalizeManagerResponse(response.data);
    console.log("normalizedData: ",normalizedData);
    
    setLocalStorageManager(normalizedData);
    return normalizedData;
};

const googleLogin = async (managerData: ManagerData): Promise<Manager> => {
    const response = await axios.post<Manager>(`${API_URL}api/auth/google-login`, managerData);
    const normalizedData = normalizeManagerResponse(response.data);
    setLocalStorageManager(normalizedData);
    return normalizedData;
};

const updateProfile = async (managerData: ManagerData, token: string): Promise<Manager> => {
    const response = await axios.put<Manager>(
        `${API_URL}account`,
        managerData,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    const normalizedData = normalizeManagerResponse(response.data);
    setLocalStorageManager(normalizedData);
    return normalizedData;
};

const logout = (): void => {
    localStorage.removeItem('manager');
};

interface ManagerState {
    manager: Manager | null;
    isError: boolean;
    isSuccess: boolean;
    isLoading: boolean;
    message: string;
}

const manager = localStorage.getItem('manager') 
    ? JSON.parse(localStorage.getItem('manager')!)
    : null;

const initialState: ManagerState = {
    manager: manager,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
};

export const registerThunk = createAsyncThunk<Manager, ManagerData, { rejectValue: string }>(
    'managerAuth/register',
    async (managerData, thunkAPI) => {
        try {
            return await register(managerData);
        } catch (error: any) {
            console.error('Axios Error:', error.response);
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const loginThunk = createAsyncThunk<Manager, ManagerData, { rejectValue: string }>(
    'managerAuth/login',
    async (managerData, thunkAPI) => {
        try {
            return await login(managerData);
        } catch (error: any) {
            console.error('Axios Error:', error.response);
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const googleLoginThunk = createAsyncThunk<Manager, ManagerData, { rejectValue: string }>(
    'managerAuth/googleLogin',
    async (googleManagerData, thunkAPI) => {
        try {
            return await googleLogin(googleManagerData);
        } catch (error: any) {
            console.error('Axios Error:', error.response);
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const logoutThunk = createAsyncThunk<void, void>(
    'managerAuth/logout',
    async () => {
        logout();
    }
);

export const updateProfileThunk = createAsyncThunk<Manager, ManagerData, { rejectValue: string }>(
    'managerAuth/updateProfile',
    async (managerData, thunkAPI) => {
        try {
            const token = (thunkAPI.getState() as RootState).managerAuth.manager?.token;
            if (!token) {
                return thunkAPI.rejectWithValue('No Token found');
            }
            return await updateProfile(managerData, token);
        } catch (error: any) {
            console.error('Axios Error:', error.response);
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const managerSlice = createSlice({
    name: 'managerAuth',
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
            .addCase(registerThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(registerThunk.fulfilled, (state, action: PayloadAction<Manager>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.manager = action.payload;
            })
            .addCase(registerThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || '';
                state.manager = null;
            })
            .addCase(loginThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginThunk.fulfilled, (state, action: PayloadAction<Manager>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.manager = action.payload;
            })
            .addCase(loginThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || '';
                state.manager = null;
            })
            .addCase(googleLoginThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(googleLoginThunk.fulfilled, (state, action: PayloadAction<Manager>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.manager = action.payload;
            })
            .addCase(googleLoginThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || '';
                state.manager = null;
            })
            .addCase(updateProfileThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateProfileThunk.fulfilled, (state, action: PayloadAction<Manager>) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.manager = action.payload;
            })
            .addCase(updateProfileThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || '';
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.manager = null;
            });
    }
});

export const { reset } = managerSlice.actions;
export default managerSlice.reducer;