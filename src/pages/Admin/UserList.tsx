import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../app/store';
import PaginationControls from '../../components/ui/PaginationControls';
import { blockUser, getAllUsers } from '../../features/admin/adminSlice';
import { User } from '../../types/userTypes';


const UserList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, isError, message } = useSelector((state: RootState) => state.adminAuth);

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [sortField, setSortField] = useState<'name' | 'email'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await dispatch(getAllUsers()).unwrap();
      } catch (error) {
        toast.error('Error fetching users', {
          className: 'toast-custom',
        });
      }
    };

    fetchUsers();

    if (isError) {
      toast.error(message, {
        className: 'toast-custom',
      });
    }
  }, [dispatch, isError, message]);

  useEffect(() => {
    if (users) {
      let sorted = [...users];
      sorted.sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      const filtered = sorted.filter(
        user =>
          user.name.toLowerCase().includes(filterText.toLowerCase()) ||
          user.email.toLowerCase().includes(filterText.toLowerCase())
      );

      setFilteredUsers(filtered);
    }
  }, [users, sortField, sortDirection, filterText]);

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      await dispatch(blockUser(userId)).unwrap();
      const message = isBlocked
        ? 'User unblocked successfully!'
        : 'User blocked successfully!';

      toast.success(message, {
        className: 'toast-custom',
      });
      await dispatch(getAllUsers()).unwrap();
    } catch (error) {
      toast.error('Failed to update user: ' + error, {
        className: 'toast-custom',
      });
    }
  };

  const handleSort = (field: 'name' | 'email') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <>
      <h1 className="text-black text-4xl font-bold mb-5">User List</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter users..."
          className="px-4 py-2 border rounded"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th
                className="py-3 px-5 bg-gray-200 border-b text-left text-gray-800 font-semibold cursor-pointer"
                onClick={() => handleSort('name')}
              >
                User Name {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="py-3 px-5 bg-gray-200 border-b text-left text-gray-800 font-semibold cursor-pointer"
                onClick={() => handleSort('email')}
              >
                Email {sortField === 'email' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-3 px-5 bg-gray-200 border-b text-left text-gray-800 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((u: User) => (
                <tr key={u._id} className="hover:bg-gray-100">
                  <td className="py-3 px-5 border-b">{u.name}</td>
                  <td className="py-3 px-5 border-b">{u.email}</td>
                  <td className="py-3 px-5 border-b">
                    <button
                      className={`py-1 px-3 rounded text-white ${u.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                      onClick={() => {
                        if (u._id) {
                          handleBlockUser(u._id, u.isBlocked);
                        } else {
                          console.error('User ID is undefined');
                        }
                      }}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-3 px-5 border-b">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default UserList;

