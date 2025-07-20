// API service layer for DynamoDB integration
export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  barcode: string;
  maintenanceStatus: 'תקין' | 'דורש טיפול';
  addedDate: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlateNumber: string;
  serviceType: string;
  date: string;
  notes: string;
  cost?: number;
  addedDate: string;
  completed: boolean;
  tasks: Array<{
    id: string;
    description: string;
    completed: boolean;
  }>;
  receiptImage?: string;
  photos?: Array<{
    id: string;
    filename: string;
    url: string;
    uploadDate: string;
    description?: string;
  }>;
}

export interface PublicReport {
  id: string;
  barcode: string;
  images: string[];
  mileage: string;
  feature: string;
  date: string;
  time: string;
  driverName: string;
  notes: string;
  submittedAt: string;
  status: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'maintenance' | 'inspection' | 'other';
  vehicleId?: string;
  description?: string;
  alertEnabled?: boolean;
  alertTime?: string;
  isRecurring?: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
}

class ApiService {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Vehicle API methods
  async getVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('/vehicles');
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'addedDate'>): Promise<Vehicle> {
    return this.request<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    });
  }

  async deleteVehicle(id: string): Promise<void> {
    return this.request<void>(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // Maintenance API methods
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return this.request<MaintenanceRecord[]>('/maintenance');
  }

  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id' | 'addedDate'>): Promise<MaintenanceRecord> {
    return this.request<MaintenanceRecord>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  async updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return this.request<MaintenanceRecord>(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
  }

  async deleteMaintenanceRecord(id: string): Promise<void> {
    return this.request<void>(`/maintenance/${id}`, {
      method: 'DELETE',
    });
  }

  // Public Reports API methods
  async getPublicReports(): Promise<PublicReport[]> {
    return this.request<PublicReport[]>('/reports');
  }

  async createPublicReport(report: Omit<PublicReport, 'id' | 'submittedAt'>): Promise<PublicReport> {
    return this.request<PublicReport>('/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  async updatePublicReport(id: string, report: Partial<PublicReport>): Promise<PublicReport> {
    return this.request<PublicReport>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(report),
    });
  }

  async deletePublicReport(id: string): Promise<void> {
    return this.request<void>(`/reports/${id}`, {
      method: 'DELETE',
    });
  }

  // Calendar API methods
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return this.request<CalendarEvent[]>('/calendar');
  }

  async createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    return this.request<CalendarEvent>('/calendar', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateCalendarEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.request<CalendarEvent>(`/calendar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    return this.request<void>(`/calendar/${id}`, {
      method: 'DELETE',
    });
  }

  // User authentication methods
  async login(username: string, password: string): Promise<{ success: boolean; user?: any }> {
    return this.request<{ success: boolean; user?: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async createUser(userData: { username: string; password: string; email: string; role: string }): Promise<any> {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Photo management methods
  async uploadPhoto(file: File, vehicleId: string, maintenanceId?: string): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('vehicleId', vehicleId);
    if (maintenanceId) {
      formData.append('maintenanceId', maintenanceId);
    }

    const response = await fetch(`${this.baseUrl}/photos/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Photo upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getVehiclePhotos(vehicleId: string): Promise<Array<{
    id: string;
    filename: string;
    url: string;
    uploadDate: string;
    description?: string;
    maintenanceId?: string;
    maintenanceAction?: string;
  }>> {
    return this.request<Array<{
      id: string;
      filename: string;
      url: string;
      uploadDate: string;
      description?: string;
      maintenanceId?: string;
      maintenanceAction?: string;
    }>>(`/photos/vehicle/${vehicleId}`);
  }

  async deletePhoto(photoId: string): Promise<void> {
    return this.request<void>(`/photos/${photoId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();