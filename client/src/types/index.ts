export type Role = 'admin' | 'staff' | 'resident';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  isActive?: boolean;
}

export type RoomType = 'single' | 'double' | 'triple' | 'dormitory';

export interface Room {
  _id: string;
  roomNumber: string;
  type: RoomType;
  floor?: number;
  capacity: number;
  occupied: number;
  monthlyRent: number;
  amenities: string[];
  underMaintenance: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name?: string;
  relation?: string;
  phone?: string;
}

export interface ResidentRoom {
  _id: string;
  roomNumber: string;
  type: RoomType;
  monthlyRent?: number;
  floor?: number;
  amenities?: string[];
}

export interface Resident {
  _id: string;
  user: string;
  name: string;
  email: string;
  phone?: string;
  emergencyContact?: EmergencyContact;
  currentRoom?: ResidentRoom | null;
  preferredRoomType?: RoomType | null;
  status: 'active' | 'checked_out';
  createdAt: string;
  updatedAt: string;
}

export interface AllocationRef {
  _id: string;
  name?: string;
  roomNumber?: string;
  type?: RoomType;
  email?: string;
}

export interface Allocation {
  _id: string;
  resident: AllocationRef | string;
  room: AllocationRef | string;
  checkInDate: string;
  checkOutDate?: string | null;
  status: 'active' | 'checked_out';
  allocatedBy: AllocationRef | string;
  notes?: string;
  createdAt: string;
}

export type MaintenanceCategory = 'plumbing' | 'electrical' | 'furniture' | 'cleanliness' | 'internet' | 'other';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface StatusEvent {
  status: MaintenanceStatus;
  note?: string;
  changedAt: string;
  changedBy?: PopulatedRef | string;
}

export interface PopulatedRef {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  roomNumber?: string;
}

export interface MaintenanceTicket {
  _id: string;
  resident: PopulatedRef | string;
  room: PopulatedRef | string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo?: PopulatedRef | string | null;
  statusHistory: StatusEvent[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'razorpay' | 'other';
export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';

export interface LineItem {
  description: string;
  amount: number;
}

export interface PaymentRecord {
  status: InvoiceStatus;
  amount?: number;
  method?: PaymentMethod;
  note?: string;
  recordedAt: string;
}

export type InstallmentStatus = 'pending' | 'paid';

export interface Installment {
  amount: number;
  dueDate: string;
  status: InstallmentStatus;
  method?: PaymentMethod;
  note?: string;
  paidAt?: string | null;
}

export interface Invoice {
  _id: string;
  resident: PopulatedRef | string;
  room?: PopulatedRef | string | null;
  billingPeriod: string;
  lineItems: LineItem[];
  discount: number;
  lateFee: number;
  totalAmount: number;
  amountPaid: number;
  status: InvoiceStatus;
  dueDate: string;
  paymentHistory: PaymentRecord[];
  installments: Installment[];
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RevenueByPeriod {
  period: string;
  invoiced: number;
  collected: number;
  invoiceCount: number;
}

export interface RevenueByStatus {
  status: InvoiceStatus;
  count: number;
  amount: number;
}

export interface RevenueReport {
  byPeriod: RevenueByPeriod[];
  byStatus: RevenueByStatus[];
  totals: {
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
  };
}

export interface OccupancyByType {
  type: RoomType;
  capacity: number;
  occupied: number;
  occupancyRate: number;
}

export interface CheckInsByMonth {
  month: string;
  checkIns: number;
}

export interface OccupancyReport {
  totalRooms: number;
  totalCapacity: number;
  totalOccupied: number;
  occupancyRate: number;
  byType: OccupancyByType[];
  checkInsByMonth: CheckInsByMonth[];
}

export const EXPENSE_CATEGORIES = [
  'electricity',
  'water',
  'staff_salaries',
  'repairs_maintenance',
  'supplies',
  'other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  _id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  recordedBy: PopulatedRef | string;
  createdAt: string;
}

export interface ExpenseByCategory {
  category: ExpenseCategory;
  amount: number;
}

export interface ExpenseByMonth {
  month: string;
  amount: number;
}

export interface ExpenseReport {
  totalExpenses: number;
  byCategory: ExpenseByCategory[];
  byMonth: ExpenseByMonth[];
  netRevenue: number;
}

export type NotificationType = 'allocation' | 'maintenance' | 'invoice' | 'system' | 'room';

// Not called Notification to avoid clashing with the browser's Notification type.
export interface AppNotification {
  _id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
