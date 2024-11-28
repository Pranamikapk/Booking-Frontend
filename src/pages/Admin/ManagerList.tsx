import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../app/store';
import PaginationControls from '../../components/ui/PaginationControls';
import { blockUser, getAllManagers } from '../../features/admin/adminSlice';
import { User } from '../../types/userTypes';

const ManagerList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { managers, isError, message } = useSelector((state: RootState) => state.adminAuth);

  const [filteredManagers, setFilteredManagers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [managersPerPage] = useState(5);
  const [sortField, setSortField] = useState<'name' | 'email'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        await dispatch(getAllManagers()).unwrap();
      } catch (error) {
        toast.error('Error fetching managers', { className: 'toast-custom' });
      }
    };

    fetchManagers();

    if (isError) {
      toast.error(message, { className: 'toast-custom' });
    }
  }, [dispatch, isError, message]);

  useEffect(() => {
    if (managers) {
      let sorted = [...managers];
      sorted.sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      const filtered = sorted.filter(
        manager =>
          manager.name.toLowerCase().includes(filterText.toLowerCase()) ||
          manager.email.toLowerCase().includes(filterText.toLowerCase())
      );

      setFilteredManagers(filtered);
    }
  }, [managers, sortField, sortDirection, filterText]);

  const handleBlockUser = async (managerId: string, isBlocked: boolean) => {
    try {
      await dispatch(blockUser(managerId)).unwrap();
      const message = isBlocked
        ? 'Manager unblocked successfully!'
        : 'Manager blocked successfully!';
      toast.success(message, { className: 'toast-custom' });
      await dispatch(getAllManagers()).unwrap();
    } catch (error) {
      toast.error('Failed to update manager: ' + error, { className: 'toast-custom' });
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

  const indexOfLastManager = currentPage * managersPerPage;
  const indexOfFirstManager = indexOfLastManager - managersPerPage;
  const currentManagers = filteredManagers.slice(indexOfFirstManager, indexOfLastManager);
  const totalPages = Math.ceil(filteredManagers.length / managersPerPage);

  return (
    <>
      <h1 className="text-black text-4xl font-bold mb-5">Manager List</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter managers..."
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
                Manager Name {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
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
            {currentManagers.length > 0 ? (
              currentManagers.map((manager) => (
                <tr key={manager._id} className="hover:bg-gray-100">
                  <td className="py-3 px-5 border-b">{manager.name}</td>
                  <td className="py-3 px-5 border-b">{manager.email}</td>
                  <td className="py-3 px-5 border-b">
                    <button
                      className={`py-1 px-3 rounded text-white ${manager.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                      onClick={() => handleBlockUser(manager._id, manager.isBlocked)}
                    >
                      {manager.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-3 px-5 border-b">
                  No managers found
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

export default ManagerList;
