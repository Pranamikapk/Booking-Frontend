import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../app/store';
import Spinner from '../../components/Spinner';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CardContent from '../../components/ui/CardContent';
import Modal from '../../components/ui/Modal';
import { approveCancellation, rejectCancellation, reservationDetails } from '../../features/booking/bookingSlice';
import { Booking } from '../../types/bookingTypes';
let API_URL = 'http://localhost:3000'

const ReservationDetails: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState)=>state.managerAuth.manager?.token)
  const { bookings, isLoading, isError } = useSelector((state: RootState) => state.booking);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState('');
  const [cancellationRequest, setCancellationRequest] = useState<{ reason: string; status: string } | null>(null);

console.log(booking);  

  useEffect(() => {
    if (bookingId) {
      dispatch(reservationDetails({ bookingId: bookingId }));
    }
  }, [dispatch, bookingId]);

  useEffect(() => {
    if (bookings && bookings.length > 0) {
      const selectedBooking = bookings.find((b) => b._id === bookingId) || null;
      setBooking(selectedBooking);
      setCancellationRequest(selectedBooking?.cancellationRequest || null);
    }
  }, [bookings,bookingId]);

  const handleImageClick = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleApproveCancellation = async () => {
    if (!booking || !booking._id) return;
    try {
      await dispatch(approveCancellation({ bookingId: booking._id, token })).unwrap();
      toast.success('Cancellation approved successfully',{
        className: 'toast-custom',
      });
    } catch (err : any) {
      toast.error('Failed to approve cancellation');
    }
  };

  const handleRejectCancellation = async () => {
    if (!booking || !booking._id) return;
    try {
      await dispatch(rejectCancellation({ bookingId: booking._id, token })).unwrap();
      toast.success('Cancellation rejected successfully');
    } catch (err) {
      toast.error('Failed to reject cancellation');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent>
            <p className="text-red-500">Error: Unable to fetch booking details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent>
            <p>No booking found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Reservation Details</h1>
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <tbody>
                <tr className="bg-gray-100">
                  <th colSpan={2} className="px-4 py-2 text-left text-lg font-semibold">Guest Information</th>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Name</td>
                  <td className="border px-4 py-2">{booking.userCredentials?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Email</td>
                  <td className="border px-4 py-2">{booking.userCredentials?.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Phone</td>
                  <td className="border px-4 py-2">{booking.userCredentials?.phone || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Id Submitted</td>
                  <td className="border px-4 py-2">{booking.userCredentials?.idType || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Id Image</td>
                  <td className="border px-4 py-2">
                  {booking.userCredentials?.idPhoto ? (
                    <img
                      src={booking.userCredentials?.idPhoto}
                      alt="ID Document"
                      className="w-32 h-32 cursor-pointer border"
                      onClick={() => handleImageClick(booking.userCredentials?.idPhoto || '')}
                    />
                  ) : (
                    'No ID Photo'
                  )}
                  </td>
                </tr>
                
                <tr className="bg-gray-100">
                  <th colSpan={2} className="px-4 py-2 text-left text-lg font-semibold">Booking Information</th>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Check-in</td>
                  <td className="border px-4 py-2">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Check-out</td>
                  <td className="border px-4 py-2">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Guests</td>
                  <td className="border px-4 py-2">{booking.guests}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Total Price</td>
                  <td className="border px-4 py-2">₹{booking.totalPrice}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Status</td>
                  <td className="border px-4 py-2">{booking.status}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Amount Paid</td>
                  <td className="border px-4 py-2">₹{booking.amountPaid}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Remaining Amount</td>
                  <td className="border px-4 py-2">₹{booking.remainingAmount}</td>
                </tr>
                
                <tr className="bg-gray-100">
                  <th colSpan={2} className="px-4 py-2 text-left text-lg font-semibold">Hotel Information</th>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Hotel Name</td>
                  <td className="border px-4 py-2">{booking.hotel?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Address</td>
                  <td className="border px-4 py-2">
                    {booking.hotel?.address?.postalCode}, {booking.hotel?.address?.city}, {booking.hotel?.address?.state}, {booking.hotel?.address?.country}
                  </td>
                </tr>
                
                <tr className="bg-gray-100">
                  <th colSpan={2} className="px-4 py-2 text-left text-lg font-semibold">Room Information</th>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Property Type</td>
                  <td className="border px-4 py-2">{booking.hotel?.propertyType || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Place Type</td>
                  <td className="border px-4 py-2">{booking.hotel?.placeType || 'N/A'}</td>
                </tr>
                
                {booking.cancellationRequest && (
                  <>
                    <tr className="bg-gray-100">
                      <th colSpan={2} className="px-4 py-2 text-left text-lg font-semibold">Cancellation Request</th>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2 font-medium">Reason</td>
                      <td className="border px-4 py-2">{booking.cancellationRequest.reason || 'No reason provided'}</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2 font-medium">Status</td>
                      <td className="border px-4 py-2">{booking.cancellationRequest.status || 'No reason provided'}</td>
                    </tr>
                    {booking.status === 'Cancelled' && (
                      <tr>
                        <td className="border px-4 py-2 font-medium">Refund Amount</td>
                        <td className="border px-4 py-2">₹{booking.amountPaid || 0}</td>
                      </tr>
                    )}
                    {booking.status === 'Cancellation_pending' && (
                      <tr>
                        <td colSpan={2} className="border px-4 py-2">
                          <div className="flex justify-end space-x-4">
                            <Button onClick={handleApproveCancellation}>Approve</Button>
                            <Button variant="danger" onClick={handleRejectCancellation}>Reject</Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => window.history.back()}>
              Back
            </Button>
            <Button variant="primary" onClick={() => window.print()}>
              Print Booking
            </Button>
          </div>
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <img src={currentImage} alt="ID Document Full Size" style={{ width: '100%' }} />
          </Modal>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservationDetails;