// import axios from 'axios';
// import { ManagerData, ManagerResponse } from '../../types/managerTypes';

// const API_URL = 'http://localhost:3000/manager/';

// const normalizeManagerResponse = (data: any): ManagerResponse => {
//     const {
//         _id,
//         name,
//         email,
//         token, 
//     } = data._doc || data;

//     return { _id, name, email, token };
// };

// const setLocalStorageManager = (manager: ManagerResponse): void => {
//     localStorage.setItem('manager', JSON.stringify(manager));
// };

// const register = async (managerData: ManagerData): Promise<ManagerResponse> => {
//     const response = await axios.post<ManagerResponse>(`${API_URL}register`, managerData);
//     const normalizedData = normalizeManagerResponse(response.data);
//     setLocalStorageManager(normalizedData);
//     return normalizedData;
// };

// const login = async (managerData: ManagerData): Promise<ManagerResponse> => {
//     const response = await axios.post<ManagerResponse>(`${API_URL}login`, managerData);
//     const normalizedData = normalizeManagerResponse(response.data);
//     setLocalStorageManager(normalizedData);
//     return normalizedData;
// };

// const googleLogin = async (managerData: ManagerData): Promise<ManagerResponse> => {
//     const response = await axios.post<ManagerResponse>(`${API_URL}api/auth/google-login`, managerData);
//     const normalizedData = normalizeManagerResponse(response.data);
//     setLocalStorageManager(normalizedData);
//     return normalizedData;
// };

// const updateProfile = async (managerData: ManagerData, token: string): Promise<ManagerResponse> => {
//     const response = await axios.put<ManagerResponse>(
//         `${API_URL}account`,
//         managerData,
//         {
//             headers: { Authorization: `Bearer ${token}` },
//         }
//     );
//     const normalizedData = normalizeManagerResponse(response.data);
//     setLocalStorageManager({ ...normalizedData, token });
//     return normalizedData;
// };

// const logout = (): void => {
//     localStorage.removeItem('manager');
// };

// const managerService = {
//     register,
//     login,
//     googleLogin,
//     updateProfile,
//     logout,
// };

// export default managerService;
