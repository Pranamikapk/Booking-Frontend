import { configureStore } from '@reduxjs/toolkit'
import adminSlice from '../features/admin/adminSlice'
import bookingSlice from '../features/booking/bookingSlice'
import hotelHomeSlice from '../features/home/hotels'
import notificationSlice from '../features/home/notificationSlice'
import hotelSlice from '../features/hotel/hotelSlice'
import managerSlice from '../features/manager/managerSlice'
import authSlice from '../features/user/authSlice'
export const store = configureStore({
  reducer: {
    auth: authSlice,
    adminAuth: adminSlice,
    managerAuth: managerSlice,
    hotelAuth: hotelSlice,
    hotel: hotelHomeSlice,
    booking: bookingSlice,
    notifications: notificationSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
