export interface DashboardStats {
    totalUsers: number;
    totalManagers: number;
    totalHotels: number;
    totalBookings: number;
    monthlyBookings: number[];
    recentActivity: Array<{
      activity: string;
      date: string;
      user: string;
    }>;
  }
  
  export interface ManagerDashboardStats {
    totalHotels: number;
    totalBookings: number;
    totalRevenue: number;
    occupancyRate: number;
    monthlyRevenue: number[];
    recentBookings: Array<{
      id: string;
      guestName: string;
      checkIn: string;
      checkOut: string;
      status: string;
    }>;
  }
  