import { ApexOptions } from 'apexcharts';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import Spinner from '../../components/Spinner';
import { ManagerDashboardStats } from '../../types/dashBoardTypes';

const API_URL = 'http://localhost:3000'

const ManagerDashboard: React.FC = () => {
  const manager = useSelector((state: RootState)=> state.managerAuth.manager)
  const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [chartOptions, setChartOptions] = useState<ApexOptions>({
    chart: {
      type: 'area',
      height: 350,
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    title: { text: 'Monthly Revenue', align: 'left' },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    yaxis: { 
      title: { text: 'Revenue (₹)' },
      min: 0,
    },
  });
  const [chartSeries, setChartSeries] = useState<ApexAxisChartSeries>([
    { name: 'Revenue', data: [] }
  ]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = manager?.token
        const response = await axios.get<ManagerDashboardStats>(`${API_URL}/manager/stats`,   {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,  
        })
        setStats(response.data);
        console.log(response.data);
        
        updateChartData(response.data.monthlyRevenue);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    loadStats();
  }, []);

  const updateChartData = (monthlyRevenue: number[]) => {
    setChartSeries([{ name: 'Revenue', data: monthlyRevenue }]);
    setChartOptions(prevOptions => ({
      ...prevOptions,
      yaxis: {
        ...prevOptions.yaxis,
        max: Math.max(...monthlyRevenue, 1) + 1000,
      },
    }));
  };

  if (!stats) {
    return <div><Spinner/></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Hotels" value={stats.totalHotels} />
        <DashboardCard title="Total Bookings" value={stats.totalBookings} />
        <DashboardCard title="Total Revenue" value={stats.totalRevenue} prefix="₹" />
        <DashboardCard title="Occupancy Rate" value={stats.occupancyRate} suffix="%" />
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <ReactApexChart 
          options={chartOptions} 
          series={chartSeries} 
          type="area" 
          height={350} 
        />
      </div>

      <RecentBookings bookings={stats.recentBookings} />
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, prefix, suffix }) => (
  <div className="bg-white shadow-md rounded-lg p-6">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold">
      {prefix}{value.toLocaleString()}{suffix}
    </p>
  </div>
);

interface RecentBookingsProps {
  bookings: Array<{
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }>;
}

const RecentBookings: React.FC<RecentBookingsProps> = ({ bookings }) => (
  <section className="bg-white shadow-md rounded-lg p-6">
    <h2 className="text-2xl font-semibold mb-4">Recent Bookings</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-6 py-4 whitespace-nowrap">{booking.guestName}</td>
              <td className="px-6 py-4 whitespace-nowrap">{booking.checkIn}</td>
              <td className="px-6 py-4 whitespace-nowrap">{booking.checkOut}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default ManagerDashboard;

