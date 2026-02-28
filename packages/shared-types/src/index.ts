// User and Authentication types
export interface User {
  id: string;
  username?: string;
  email: string;
  role: 'admin' | 'user';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
}

export interface DashboardKpi {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}

export interface DashboardChannel {
  label: string;
  value: number;
}

export interface DashboardCampaign {
  name: string;
  spend: string;
  roas: string;
}

export interface DashboardData {
  welcomeMessage: string;
  kpiCards: DashboardKpi[];
  revenueSeries: number[];
  channelBreakdown: DashboardChannel[];
  topCampaigns: DashboardCampaign[];
}

export interface DashboardRequest {
  user: {
    email: string;
    name?: string | null;
  };
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
