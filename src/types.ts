export interface TripItem {
  id: string;
  text: string;
  checkedBy: string[];
}

export interface TripCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  custom: boolean;
  items: TripItem[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
  note?: string;
}

export interface JoinRequest {
  id: string;
  userName: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: string;
}

export interface TripPlan {
  destination: string;
  startDate: string;
  endDate: string;
  members: string[];
  tripType: string;
  weather: string;
  notes: string;
  createdBy: string;
  isPrivate: boolean;
}

export interface TripData {
  id: string;
  plan: TripPlan;
  members: string[];
  code: string;
  categories: TripCategory[];
  expenses: Expense[];
  transfers: Transfer[];
  joinRequests: JoinRequest[];
  createdAt: any;
  createdBy: string;
}
