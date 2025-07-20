import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

// DynamoDB configuration
const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || process.env.VITE_DYNAMODB_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

// Table names
export const TABLE_NAMES = {
  VEHICLES: 'fleet-vehicles',
  MAINTENANCE: 'fleet-maintenance',
  REPORTS: 'fleet-reports',
  USERS: 'fleet-users',
  CALENDAR: 'fleet-calendar',
  HISTORY: 'fleet-history',
};

// Vehicle interface
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'retired';
  mileage: number;
  lastService: string;
  nextService: string;
  createdAt: string;
  updatedAt: string;
}

// Maintenance record interface
export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  cost: number;
  date: string;
  mechanic: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Report interface
export interface Report {
  id: string;
  type: string;
  title: string;
  data: any;
  createdAt: string;
  createdBy: string;
}

// Calendar event interface
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'maintenance' | 'inspection' | 'meeting' | 'other';
  vehicleId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// History record interface
export interface HistoryRecord {
  id: string;
  entityType: 'vehicle' | 'maintenance' | 'report' | 'calendar';
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
  changes: any;
  performedBy: string;
  timestamp: string;
}

// DynamoDB service class
export class DynamoDBService {
  // Generic CRUD operations
  async put(tableName: string, item: any) {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    return await docClient.send(command);
  }

  async get(tableName: string, key: any) {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });
    const response = await docClient.send(command);
    return response.Item;
  }

  async update(tableName: string, key: any, updateExpression: string, expressionAttributeValues: any) {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });
    const response = await docClient.send(command);
    return response.Attributes;
  }

  async delete(tableName: string, key: any) {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });
    return await docClient.send(command);
  }

  async scan(tableName: string, filterExpression?: string, expressionAttributeValues?: any) {
    const command = new ScanCommand({
      TableName: tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    });
    const response = await docClient.send(command);
    return response.Items || [];
  }

  async query(tableName: string, keyConditionExpression: string, expressionAttributeValues: any) {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    });
    const response = await docClient.send(command);
    return response.Items || [];
  }

  // Vehicle operations
  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...vehicle,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await this.put(TABLE_NAMES.VEHICLES, newVehicle);
    return newVehicle;
  }

  async getVehicle(id: string) {
    return await this.get(TABLE_NAMES.VEHICLES, { id });
  }

  async getAllVehicles() {
    return await this.scan(TABLE_NAMES.VEHICLES);
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>) {
    const updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues = {
      ':updatedAt': new Date().toISOString(),
    };

    // Build update expression dynamically
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        updateExpression += `, ${key} = :${key}`;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    return await this.update(TABLE_NAMES.VEHICLES, { id }, updateExpression, expressionAttributeValues);
  }

  async deleteVehicle(id: string) {
    return await this.delete(TABLE_NAMES.VEHICLES, { id });
  }

  // Maintenance operations
  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newRecord: MaintenanceRecord = {
      ...record,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await this.put(TABLE_NAMES.MAINTENANCE, newRecord);
    return newRecord;
  }

  async getMaintenanceRecord(id: string) {
    return await this.get(TABLE_NAMES.MAINTENANCE, { id });
  }

  async getAllMaintenanceRecords() {
    return await this.scan(TABLE_NAMES.MAINTENANCE);
  }

  async getMaintenanceByVehicle(vehicleId: string) {
    return await this.scan(
      TABLE_NAMES.MAINTENANCE,
      'vehicleId = :vehicleId',
      { ':vehicleId': vehicleId }
    );
  }

  // Calendar operations
  async createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newEvent: CalendarEvent = {
      ...event,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await this.put(TABLE_NAMES.CALENDAR, newEvent);
    return newEvent;
  }

  async getAllCalendarEvents() {
    return await this.scan(TABLE_NAMES.CALENDAR);
  }

  // History operations
  async createHistoryRecord(record: Omit<HistoryRecord, 'id' | 'timestamp'>) {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const newRecord: HistoryRecord = {
      ...record,
      id,
      timestamp,
    };
    await this.put(TABLE_NAMES.HISTORY, newRecord);
    return newRecord;
  }

  async getAllHistoryRecords() {
    return await this.scan(TABLE_NAMES.HISTORY);
  }

  // Report operations
  async createReport(report: Omit<Report, 'id' | 'createdAt'>) {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newReport: Report = {
      ...report,
      id,
      createdAt,
    };
    await this.put(TABLE_NAMES.REPORTS, newReport);
    return newReport;
  }

  async getAllReports() {
    return await this.scan(TABLE_NAMES.REPORTS);
  }

  async updateReport(id: string, updates: Partial<Report>) {
    const updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues = {
      ':updatedAt': new Date().toISOString(),
    };

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        updateExpression += `, ${key} = :${key}`;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    return await this.update(TABLE_NAMES.REPORTS, { id }, updateExpression, expressionAttributeValues);
  }

  async deleteReport(id: string) {
    return await this.delete(TABLE_NAMES.REPORTS, { id });
  }

  // User operations
  async createUser(user: any) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newUser = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await this.put(TABLE_NAMES.USERS, newUser);
    return newUser;
  }

  async getAllUsers() {
    return await this.scan(TABLE_NAMES.USERS);
  }

  async getUser(id: string) {
    return await this.get(TABLE_NAMES.USERS, { id });
  }

  async getUserByEmail(email: string) {
    return await this.scan(
      TABLE_NAMES.USERS,
      'email = :email',
      { ':email': email }
    );
  }
}

// Export a singleton instance
export const dynamoDBService = new DynamoDBService();