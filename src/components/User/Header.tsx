import { Bell } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { AppDispatch, RootState } from '../../app/store';
import { logout, reset } from '../../features/admin/adminSlice';
import { addUnreadMessage, clearNotifications } from '../../features/home/notificationSlice';

const socket = io(`${import.meta.env.VITE_API_BASE_URL}`, { autoConnect: false });

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount, lastChatId } = useSelector((state: RootState) => state.notifications);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      socket.connect();
      console.log("Socket connected in header");
      
      socket.on('new message', (message) => {
        console.log("New message received:", message);
        if (message.sender !== user._id) {
          console.log("Dispatching addUnreadMessage");
          dispatch(addUnreadMessage({
            chatId: message.chatId,
            senderId: message.sender,
            content: message.content,
            timestamp: new Date().toISOString(),
          }));
        }
      });
    }

    return () => {
      console.log("Cleaning up socket connection");
      socket.off('new message');
      socket.disconnect();
    };
  }, [user, dispatch]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    toast.success('Logged out successfully', {
      className: 'toast-custom',
    });
    navigate('/');
  };

  const handleProfileClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to access your profile', {
        className: 'toast-custom',
      });
      navigate('/login');
    } else if (user.isBlocked) {
      toast.error('Your account is blocked.', {
        className: 'toast-custom',
      });
      navigate('/login');
      localStorage.clear();
    } else {
      setIsDropdownOpen((prev) => !prev);
    }
  };

  const handleOutsideClick = (e: Event) => {
    if (isDropdownOpen && (e.target as HTMLElement).closest('.dropdown') === null) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isDropdownOpen, user]);

  const handleNotificationClick = () => {
    if (unreadCount > 0 && lastChatId) {
      navigate(`/chat/${lastChatId}`);
      dispatch(clearNotifications());
    } else {
      toast.info('No new messages received', {
        className: 'toast-custom',
      });
    }
  };

  return (
    <div className="flex justify-between items-center py-4 px-8">
      <div className="flex items-center gap-8">
        {/* Your existing navigation links */}
      </div>

      <Link to="/" className="flex flex-col items-center">
        <img src="/images/AddHotel/SE3.png" alt="Logo" className="w-20 h-12 rounded-full" />
      </Link>
      <div className="flex items-center gap-4">
        {user && (
          <div 
            className="relative cursor-pointer" 
            onClick={handleNotificationClick}
            title={unreadCount > 0 ? "You have unread messages" : "No new messages"}
          >
            <Bell className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
        )}

        <div className="relative dropdown">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleProfileClick}>
            <div className="flex gap-2 border border-gray-300 rounded-full py-2 px-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653Zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438ZM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {user && isDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-10">
              <ul className="py-2">
                {!user.isBlocked && (
                  <>
                    <li>
                      <Link to="/user" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/user/bookings" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>
                        Bookings
                      </Link>
                    </li>
                    <li>
                      <button onClick={onLogout} className="block px-4 py-2 hover:bg-gray-100">
                        Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

