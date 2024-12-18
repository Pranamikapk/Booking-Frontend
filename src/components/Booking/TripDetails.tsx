import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_URL = 'http://localhost:3000/'; 

export const TripDetails = ({ checkIn, checkOut, rooms, guests, amenities, hotelId }) => {
  const location = useLocation();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}${hotelId}/availability`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ checkIn, checkOut }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsAvailable(data.isAvailable);
          console.log("IsAvalable:",data.isAvailable);
          
        } else {
          console.error("Error checking availability");
          setIsAvailable(false);
        }
      } catch (error) {
        console.error("Error:", error);
        setIsAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [checkIn, checkOut, hotelId]);

  return (
    <div className="container mx-auto p-6 max-w-lg shadow-lg rounded-lg space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Trip Details</h2>

      {loading ? (
        <div className="text-center">
          <div className="loader" role="status">
            <svg
              className="animate-spin h-5 w-5 text-gray-500 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
          <p>Checking availability...</p>
        </div>
      ) : !isAvailable ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Dates Not Available!</strong>
          <span className="block sm:inline"> Please select different dates.</span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Dates</h3>
              <p className="text-sm text-gray-600">
                {checkIn} - {checkOut}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Guests</h3>
              <p className="text-sm text-gray-600">
                {guests} guest(s) & {rooms} rooms
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">Amenities</h3>
            <ul className="text-sm text-gray-600 grid grid-cols-2 gap-2">
              {amenities.map((amenity, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-green-500"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
