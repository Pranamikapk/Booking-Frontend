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
  
  