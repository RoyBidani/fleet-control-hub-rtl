import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  CreateTableCommand, 
  DeleteTableCommand, 
  ListTablesCommand,
  DescribeTableCommand,
  waitUntilTableExists 
} from '@aws-sdk/client-dynamodb';

const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const TABLE_DEFINITIONS = [
  {
    TableName: 'fleet-vehicles',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'fleet-maintenance',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'vehicleId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'vehicleId-index',
        KeySchema: [
          { AttributeName: 'vehicleId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ]
  },
  {
    TableName: 'fleet-reports',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'fleet-users',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'fleet-calendar',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'fleet-history',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
];

async function listTables() {
  try {
    const command = new ListTablesCommand({});
    const response = await dynamoDBClient.send(command);
    return response.TableNames || [];
  } catch (error) {
    console.error('Error listing tables:', error);
    return [];
  }
}

async function createTable(tableDefinition) {
  try {
    console.log(`Creating table: ${tableDefinition.TableName}`);
    const command = new CreateTableCommand(tableDefinition);
    await dynamoDBClient.send(command);
    
    // Wait for table to be active
    await waitUntilTableExists(
      { client: dynamoDBClient, maxWaitTime: 60 },
      { TableName: tableDefinition.TableName }
    );
    
    console.log(`✅ Table ${tableDefinition.TableName} created successfully`);
  } catch (error) {
    console.error(`❌ Error creating table ${tableDefinition.TableName}:`, error);
  }
}

async function deleteTable(tableName) {
  try {
    console.log(`Deleting table: ${tableName}`);
    const command = new DeleteTableCommand({ TableName: tableName });
    await dynamoDBClient.send(command);
    console.log(`✅ Table ${tableName} deleted successfully`);
  } catch (error) {
    console.error(`❌ Error deleting table ${tableName}:`, error);
  }
}

async function setupTables() {
  console.log('🚀 Setting up DynamoDB tables for Fleet Control Hub...\n');
  
  // List existing tables
  const existingTables = await listTables();
  console.log('Existing tables:', existingTables);
  
  // Create tables
  for (const tableDefinition of TABLE_DEFINITIONS) {
    if (existingTables.includes(tableDefinition.TableName)) {
      console.log(`⚠️  Table ${tableDefinition.TableName} already exists, skipping...`);
    } else {
      await createTable(tableDefinition);
    }
  }
  
  console.log('\n✅ DynamoDB setup complete!');
}

async function cleanupTables() {
  console.log('🧹 Cleaning up DynamoDB tables...\n');
  
  const existingTables = await listTables();
  
  for (const tableDefinition of TABLE_DEFINITIONS) {
    if (existingTables.includes(tableDefinition.TableName)) {
      await deleteTable(tableDefinition.TableName);
    }
  }
  
  console.log('\n✅ Cleanup complete!');
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--cleanup')) {
  cleanupTables();
} else {
  setupTables();
}