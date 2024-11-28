import React from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ResetPassword from '../components/modals/ResetPasswordModal'
import Layout from '../layouts/Layout'
import ManagerLogin from '../pages/Manager/ManagerLogin'
import Account from '../pages/User/Account'
import BookingDetails from '../pages/User/BookingDetails'
import ChatInterface from '../pages/User/Chat'
import Home from '../pages/User/Home'
import HotelDetails from '../pages/User/HotelDetails'
import Login from '../pages/User/Login'
import Order from '../pages/User/Order'
import Register from '../pages/User/Register'
import Search from '../pages/User/Search'

const UserRouter = () => {
  const { user } = useSelector((state: any) => state.auth || localStorage.getItem('user'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={ <Login/> } />
        <Route path='/register' element={ <Register/> } />
        <Route path='/' element= { <Layout/> }>
          <Route index element={<Home/>} />
          <Route path='/user/:subpage?' element={user ? <Account/> : <Navigate to="/login" />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/hotel/:hotelId" element={<HotelDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/booking" element={<Order />} />
          <Route path="/booking/:bookingId" element={<BookingDetails />} />
          <Route path="/chat" element={<ChatInterface bookingId= '6734231bb88edbf6e938a041' recipientId= '6734231bb88edbf6e938a041' recipientName= 'string' />} />

        </Route>

        <Route path='/manager/login' element={<ManagerLogin/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default UserRouter;
