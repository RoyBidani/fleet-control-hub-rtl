import { dynamoDBService } from '../src/lib/dynamodb.js';

// Sample vehicles data
const sampleVehicles = [
  {
    make: 'Ford',
    model: 'Transit',
    year: 2022,
    vin: '1FTBW2CM0NKA12345',
    licensePlate: 'FLT-001',
    status: 'active',
    mileage: 25000,
    lastService: '2024-01-15',
    nextService: '2024-07-15'
  },
  {
    make: 'Chevrolet',
    model: 'Silverado',
    year: 2021,
    vin: '1GCRYDED5MZ123456',
    licensePlate: 'FLT-002',
    status: 'active',
    mileage: 35000,
    lastService: '2024-02-20',
    nextService: '2024-08-20'
  },
  {
    make: 'Mercedes',
    model: 'Sprinter',
    year: 2023,
    vin: 'WD3PE8CC3NP123456',
    licensePlate: 'FLT-003',
    status: 'maintenance',
    mileage: 15000,
    lastService: '2024-03-10',
    nextService: '2024-09-10'
  },
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '4T1C11AK5LU123456',
    licensePlate: 'FLT-004',
    status: 'active',
    mileage: 45000,
    lastService: '2024-01-05',
    nextService: '2024-07-05'
  },
  {
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    vin: '19XFC2F50KE123456',
    licensePlate: 'FLT-005',
    status: 'retired',
    mileage: 85000,
    lastService: '2023-12-01',
    nextService: '2024-06-01'
  }
];

// Sample maintenance records
const sampleMaintenanceRecords = [
  {
    vehicleId: '', // Will be set dynamically
    type: 'Oil Change',
    description: 'Regular oil change and filter replacement',
    cost: 75.50,
    date: '2024-01-15',
    mechanic: 'John Smith',
    status: 'completed'
  },
  {
    vehicleId: '', // Will be set dynamically
    type: 'Tire Rotation',
    description: 'Rotate tires and check pressure',
    cost: 45.00,
    date: '2024-02-20',
    mechanic: 'Jane Doe',
    status: 'completed'
  },
  {
    vehicleId: '', // Will be set dynamically
    type: 'Brake Inspection',
    description: 'Inspect brake pads and rotors',
    cost: 120.00,
    date: '2024-07-15',
    mechanic: 'Mike Johnson',
    status: 'scheduled'
  }
];

// Sample calendar events
const sampleCalendarEvents = [
  {
    title: 'Fleet Safety Meeting',
    date: '2024-07-15',
    time: '10:00',
    type: 'meeting',
    description: 'Monthly safety meeting for all drivers'
  },
  {
    title: 'Vehicle FLT-001 Inspection',
    date: '2024-07-20',
    time: '14:00',
    type: 'inspection',
    vehicleId: '', // Will be set dynamically
    description: 'Annual safety inspection'
  },
  {
    title: 'Maintenance Training',
    date: '2024-07-25',
    time: '09:00',
    type: 'other',
    description: 'Training session for new maintenance procedures'
  }
];

async function seedData() {
  console.log('🌱 Seeding sample data...\n');
  
  try {
    // Create vehicles and store their IDs
    console.log('Creating vehicles...');
    const createdVehicles = [];
    for (const vehicle of sampleVehicles) {
      const created = await dynamoDBService.createVehicle(vehicle);
      createdVehicles.push(created);
      console.log(`✅ Created vehicle: ${created.make} ${created.model} (${created.licensePlate})`);
    }
    
    // Create maintenance records
    console.log('\nCreating maintenance records...');
    for (let i = 0; i < sampleMaintenanceRecords.length; i++) {
      const record = { 
        ...sampleMaintenanceRecords[i], 
        vehicleId: createdVehicles[i % createdVehicles.length].id 
      };
      const created = await dynamoDBService.createMaintenanceRecord(record);
      console.log(`✅ Created maintenance record: ${created.type} for vehicle ${record.vehicleId}`);
    }
    
    // Create calendar events
    console.log('\nCreating calendar events...');
    for (let i = 0; i < sampleCalendarEvents.length; i++) {
      const event = { ...sampleCalendarEvents[i] };
      if (event.vehicleId === '') {
        event.vehicleId = createdVehicles[0].id; // Assign to first vehicle
      }
      const created = await dynamoDBService.createCalendarEvent(event);
      console.log(`✅ Created calendar event: ${created.title}`);
    }
    
    // Create sample reports
    console.log('\nCreating sample reports...');
    const sampleReports = [
      {
        type: 'maintenance',
        title: 'Monthly Maintenance Report',
        data: {
          totalCost: 240.50,
          completedServices: 2,
          scheduledServices: 1,
          vehicleCount: createdVehicles.length
        },
        createdBy: 'admin'
      },
      {
        type: 'vehicle',
        title: 'Fleet Status Report',
        data: {
          activeVehicles: createdVehicles.filter(v => v.status === 'active').length,
          maintenanceVehicles: createdVehicles.filter(v => v.status === 'maintenance').length,
          retiredVehicles: createdVehicles.filter(v => v.status === 'retired').length,
          totalVehicles: createdVehicles.length
        },
        createdBy: 'admin'
      }
    ];
    
    for (const report of sampleReports) {
      const created = await dynamoDBService.createReport(report);
      console.log(`✅ Created report: ${created.title}`);
    }
    
    // Create history records
    console.log('\nCreating history records...');
    for (const vehicle of createdVehicles) {
      const historyRecord = {
        entityType: 'vehicle',
        entityId: vehicle.id,
        action: 'created',
        changes: vehicle,
        performedBy: 'system'
      };
      await dynamoDBService.createHistoryRecord(historyRecord);
    }
    console.log(`✅ Created ${createdVehicles.length} history records`);
    
    console.log('\n🎉 Sample data seeding complete!');
    console.log(`Created ${createdVehicles.length} vehicles, ${sampleMaintenanceRecords.length} maintenance records, ${sampleCalendarEvents.length} calendar events, and ${sampleReports.length} reports.`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();