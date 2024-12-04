import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { AppDispatch, RootState } from '../../app/store';
import Spinner from '../../components/Spinner';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CardContent from '../../components/ui/CardContent';
import PaginationControls from '../../components/ui/PaginationControls';
import { listReservations } from '../../features/booking/bookingSlice';

interface SortOption {
  value: keyof typeof sortFunctions;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: 'checkInDateAsc', label: 'Check-in Date (Earliest First)' },
  { value: 'checkInDateDesc', label: 'Check-in Date (Latest First)' },
  { value: 'totalPriceAsc', label: 'Total Price (Low to High)' },
  { value: 'totalPriceDesc', label: 'Total Price (High to Low)' },
];

const sortFunctions = {
  checkInDateAsc: (a: any, b: any) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime(),
  checkInDateDesc: (a: any, b: any) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime(),
  totalPriceAsc: (a: any, b: any) => a.totalPrice - b.totalPrice,
  totalPriceDesc: (a: any, b: any) => b.totalPrice - a.totalPrice,
};

export default function Reservations() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState<keyof typeof sortFunctions>('checkInDateAsc');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const { bookings, isLoading, isError } = useSelector(
    (state: RootState) => state.booking
  );
  const { manager } = useSelector((state: RootState) => state.managerAuth);

  useEffect(() => {
    if (manager && manager._id) {
      dispatch(listReservations({ managerId: manager._id }))
        .unwrap()
        .then(() => console.log('Reservations fetched successfully'))
        .catch((err) => console.error('Failed to fetch reservations:', err));
    } else {
      console.error("Manager's hotel ID is not available in state");
    }
  }, [dispatch, manager]);

  const handleDetailsClick = useCallback((bookingId: string) => {
    console.log("Clicked:", bookingId);
    navigate(`/manager/reservations/${bookingId}`);
  }, [navigate]);

  if (isLoading) return <Spinner />;

  const filteredAndSortedReservations = bookings
    .filter(reservation => filterStatus === null || reservation.status === filterStatus)
    .sort(sortFunctions[sortBy]);

  const totalPages = Math.ceil(filteredAndSortedReservations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = filteredAndSortedReservations.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-5">Reservations</h1>
      
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <select
          className="p-2 border rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as keyof typeof sortFunctions)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded"
          value={filterStatus || 'all'}
          onChange={(e) => setFilterStatus(e.target.value === 'all' ? null : e.target.value)}
        >
          <option value="all">All Reservations</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Cancellation_pending">Cancellation_pending</option>
          <option value="Rejected">Rejected</option>

        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentReservations && currentReservations.length > 0 ? (
          currentReservations.map((reservation) => (
            <Card key={reservation._id} className="flex flex-col h-full">
              <CardContent className="flex-grow flex flex-col relative p-0">
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{reservation.userCredentials.name}</h3>
                    <p className="text-gray-600">Check-in: {new Date(reservation.checkInDate).toLocaleDateString()}</p>
                    <p className="text-gray-600">Check-out: {new Date(reservation.checkOutDate).toLocaleDateString()}</p>
                    <p className="text-gray-600">Guests: {reservation.guests}</p>
                    <p className="font-semibold mt-2">Total: ₹{reservation.totalPrice}</p>
                    <p className="text-gray-600">Status: {reservation.status}</p>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button 
                      variant='primary'
                      onClick={() => handleDetailsClick(reservation._id)}
                      className="w-full bg-blue-900 hover:bg-blue-600 text-white py-2 rounded-md"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No reservations found.</p>
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

