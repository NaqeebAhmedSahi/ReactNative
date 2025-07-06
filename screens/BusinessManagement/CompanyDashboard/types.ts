import { RevenueRecord, PayrollDeadline } from '../../types';

export interface BusinessDashboardProps {
  companyId: string;
}

export interface RevenueInputState {
  year: number;
  month: number;
  amount: string;
}

export interface DashboardTabsProps {
  companyId: string;
  loading: boolean;
  revenueRecords: RevenueRecord[];
  payrollDeadlines: PayrollDeadline[];
  attendanceData: any;
  revenueInput: RevenueInputState;
  setRevenueInput: React.Dispatch<React.SetStateAction<RevenueInputState>>;
  handleAddRevenue: () => Promise<void>;
  navigation: any;
}