import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../app/store';
import Spinner from '../../components/Spinner';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CardContent from '../../components/ui/CardContent';
import PaginationControls from '../../components/ui/PaginationControls';
import { Booking } from '../../types/bookingTypes';

const API_URL = 'http://localhost:3000/manager/';

export default function Reservations() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [sortBy, setSortBy] = useState<string>('all');

  const { manager } = useSelector((state: RootState) => state.managerAuth);
  const token = manager?.token;

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await axios.get(`${API_URL}listRequests`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          withCredentials: true,
        });
        setReservations(response.data);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [manager]);

  const totalPages = Math.ceil(reservations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = reservations.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDetailsClick = useCallback(
    (bookingId: string) => {
      navigate(`/manager/reservations/${bookingId}`);
    },
    [navigate]
  );

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-red-600">Failed to load reservations. Please try again.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-5">Cancellation Requests</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <select
          className="p-2 border rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="all">All Requests</option>
          <option value="checkInDate">Sort by Check-in Date</option>
          <option value="checkOutDate">Sort by Check-out Date</option>
          <option value="totalPrice">Sort by Total Price</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentReservations.length > 0 ? (
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
                      variant="primary"
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
          <p>No Requests found.</p>
        )}
      </div>

      {reservations.length > itemsPerPage && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
