import { ApexOptions } from 'apexcharts';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import Spinner from '../../components/Spinner';
import { DashboardStats } from '../../types/dashBoardTypes';

const API_URL = 'http://localhost:3000'

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/stats`);
        setStats(response.data);
        console.log(response.data);
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    loadStats();
  }, []);

  if (!stats) {
    return <div><Spinner/></div>;
  }

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    title: { text: 'Monthly Bookings', align: 'left' },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    yaxis: { title: { text: 'Number of Bookings' } },
  };

  const chartSeries = [{ name: 'Bookings', data: stats.monthlyBookings }];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Users" value={stats.totalUsers} />
        <DashboardCard title="Total Managers" value={stats.totalManagers} />
        <DashboardCard title="Total Hotels" value={stats.totalHotels} />
        <DashboardCard title="Total Bookings" value={stats.totalBookings} />
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={350} />
      </div>

      <RecentActivity activities={stats.recentActivity} />
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value }) => (
  <div className="bg-white shadow-md rounded-lg p-6">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold">{value.toLocaleString()}</p>
  </div>
);

interface RecentActivityProps {
  activities: Array<{
    activity: string;
    date: string;
    user: string;
  }>;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => (
  <section className="bg-white shadow-md rounded-lg p-6">
    <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities.map((activity, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">{activity.activity}</td>
              <td className="px-6 py-4 whitespace-nowrap">{activity.date}</td>
              <td className="px-6 py-4 whitespace-nowrap">{activity.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default AdminDashboard;

