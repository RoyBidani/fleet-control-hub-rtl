# Fleet Control Hub - Deployment Guide

## Overview
This guide helps you deploy the Fleet Control Hub application with DynamoDB integration.

## Prerequisites
- Node.js (v16 or higher)
- npm
- AWS Account with DynamoDB access
- AWS CLI configured (optional but recommended)

## Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/Toms422/fleet-control-hub-rtl.git
cd fleet-control-hub-rtl
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your AWS credentials
```

### 3. Deploy
```bash
./deploy.sh
```

## Detailed Setup

### AWS Configuration
1. Create an AWS account if you don't have one
2. Create an IAM user with DynamoDB permissions
3. Get your Access Key ID and Secret Access Key
4. Update the `.env` file with your credentials

Required IAM permissions for DynamoDB:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:CreateTable",
                "dynamodb:DeleteTable",
                "dynamodb:DescribeTable",
                "dynamodb:ListTables",
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Scan",
                "dynamodb:Query"
            ],
            "Resource": "*"
        }
    ]
}
```

### DynamoDB Setup
1. Create the required tables:
```bash
node scripts/setup-dynamodb.js
```

2. (Optional) Seed with sample data:
```bash
node scripts/seed-data.js
```

### Starting the Application
```bash
# Option 1: Direct start
./start.sh

# Option 2: Using systemd (if available)
sudo systemctl start fleet-control-hub

# Option 3: Development mode
npm run dev
```

### Stopping the Application
```bash
# Option 1: Direct stop
./stop.sh

# Option 2: Using systemd
sudo systemctl stop fleet-control-hub
```

## Application Structure

### DynamoDB Tables
- `fleet-vehicles`: Vehicle information
- `fleet-maintenance`: Maintenance records
- `fleet-reports`: Generated reports
- `fleet-users`: User management
- `fleet-calendar`: Calendar events
- `fleet-history`: Audit trail

### Key Features
- **Vehicle Management**: Add, edit, and track vehicles
- **Maintenance Tracking**: Schedule and track maintenance
- **Calendar Integration**: Schedule events and reminders
- **Reporting**: Generate fleet reports
- **History Tracking**: Audit trail of all changes

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**
   - Ensure `.env` file has correct AWS credentials
   - Check IAM permissions for DynamoDB access

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes: `pkill -f "node server.js"`

3. **Build Errors**
   - Run `npm install` again
   - Check Node.js version (should be 16+)

4. **DynamoDB Connection Issues**
   - Verify AWS region in `.env`
   - Check internet connectivity
   - Validate AWS credentials

### Logs
- Application logs: Check console output
- System logs: `sudo journalctl -u fleet-control-hub`

## Development

### Local Development
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Configuration

### Environment Variables
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Application Configuration
VITE_APP_NAME=Fleet Control Hub
VITE_API_URL=http://localhost:3000/api
PORT=3000
NODE_ENV=production
```

### Customization
- Update `src/lib/dynamodb.ts` for database schema changes
- Modify `src/components/` for UI changes
- Update `scripts/` for setup customization

## Security

### Best Practices
1. Use IAM roles instead of hardcoded credentials in production
2. Enable DynamoDB encryption at rest
3. Use HTTPS in production
4. Implement proper authentication
5. Regular security updates

### Production Considerations
1. Use environment-specific configurations
2. Set up monitoring and alerting
3. Configure backup strategies
4. Implement proper logging
5. Use a reverse proxy (nginx/apache)

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review AWS DynamoDB documentation
3. Create an issue in the GitHub repository

## License
This project is licensed under the MIT License.