export type Role = 'admin' | 'staff' | 'resident';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
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

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'other';
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
  createdAt: string;
  updatedAt: string;
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

export type NotificationType = 'allocation' | 'maintenance' | 'invoice' | 'system';

// Named AppNotification (not Notification) to avoid colliding with the
// browser's built-in Notification API type.
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
