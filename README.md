# Fleet Control Hub - Vehicle Fleet Management System

## 📋 Table of Contents
- [Overview](#overview)
- [System Features](#system-features)
- [System Architecture](#system-architecture)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [File Explanations](#file-explanations)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Maintenance & Updates](#maintenance--updates)

## 🚗 Overview

Fleet Control Hub is an advanced vehicle fleet management system built with React, Node.js, and DynamoDB. The system enables comprehensive vehicle management, maintenance tracking, reporting, calendar scheduling, and more.

### Technologies Used:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: AWS DynamoDB
- **UI Library**: Radix UI + Tailwind CSS
- **Charts**: Recharts
- **File Upload**: Multer
- **Proxy**: Nginx

## ✨ System Features

### 🚙 Vehicle Management
- Add, edit, and delete vehicles
- Track maintenance status for each vehicle
- Unique barcode for each vehicle
- Complete vehicle details (license plate, model, etc.)

### 🔧 Maintenance Management
- Create detailed maintenance records
- Upload receipts and images (supports PNG, JPG, SVG, HTML, TXT, PDF, JSON)
- Track individual maintenance tasks
- Completion status for each maintenance operation
- Automatic cost calculations

### 📊 Reports & Analytics
- Interactive graphical reports
- Export reports to CSV and JSON
- Real-time statistics
- Advanced filtering capabilities
- Detailed data visualization

### 📅 Calendar
- Schedule maintenance events
- Edit and delete existing events
- Set alerts and notifications
- Recurring events support
- Convenient monthly view

### 📱 Public Form
- Quick issue reporting for vehicles
- Accessible to all drivers
- Upload images of problems
- Track report status

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   React App     │    │   Node.js API   │
│   (Port 8080)   │────│   (Frontend)    │────│   (Port 3001)   │
│     Proxy       │    │     Client      │    │     Server      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Static       │    │      User       │    │   AWS DynamoDB  │
│    Files        │    │   Interface     │    │    Database     │
│   (Uploads)     │    │    (Browser)    │    │     Storage     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### System Components:

1. **Frontend (React)**: Interactive user interface
2. **Backend (Node.js)**: API server for handling requests
3. **Database (DynamoDB)**: Cloud-based data storage on AWS
4. **File Storage**: Local storage for images and receipts
5. **Nginx Proxy**: Traffic routing and security

## 🚀 Installation & Setup

### Prerequisites:
- Node.js 18+
- npm or yarn
- AWS credentials (for DynamoDB)
- Nginx (optional, for production)

### Quick Installation:

```bash
# 1. Clone the project
git clone <repository-url>
cd fleet-control-hub-rtl

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your AWS settings

# 4. Build the project
npm run build

# 5. Start the system
./start-fleet-manager.sh
```

### Manual Setup:

```bash
# Start the server on port 3001
PORT=3001 node api-server.js

# Or with PM2 (recommended for production)
pm2 start api-server.js --name fleet-manager
```

### System Access:
- **Main Application**: http://PublicIP:8080
- **Direct API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 📁 Project Structure

```
fleet-control-hub-rtl/
├── src/                          # React source code
│   ├── components/               # React components
│   │   ├── Calendar.tsx         # Calendar component
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Maintenance.tsx      # Maintenance management
│   │   ├── Reports.tsx          # Reports and analytics
│   │   ├── VehicleManagement.tsx # Vehicle management
│   │   └── ui/                  # Basic UI components
│   ├── services/                # API services
│   │   └── api.ts              # API client
│   ├── lib/                     # Helper libraries
│   │   └── dynamodb.js         # DynamoDB service
│   └── pages/                   # Main pages
├── dist/                        # Built files
├── uploads/                     # Uploaded images and receipts
├── scripts/                     # Helper scripts
├── api-server.js               # Main API server
├── start-fleet-manager.sh      # Startup script
├── fleet-manager.service       # Systemd service
├── nginx-fleet.conf           # Nginx configuration
└── package.json               # Dependencies and settings
```

## 📄 File Explanations

### Core Files

#### `api-server.js` - Main API Server
```javascript
// Express server handling all API endpoints
// Includes:
// - Authentication
// - CRUD operations for vehicles and maintenance
// - File uploads
// - Calendar management
// - Health checks
```

**Main Functions:**
- Express server configuration
- Multer setup for file handling
- API endpoint routing
- DynamoDB connection

#### `src/lib/dynamodb.js` - Database Service
```javascript
// Class for managing DynamoDB operations
// Includes:
// - Generic CRUD operations
// - Specific functions for each entity
// - Error handling
// - Data validation
```

**Tables:**
- `fleet-vehicles` - Vehicle data
- `fleet-maintenance` - Maintenance records
- `fleet-reports` - Public reports
- `fleet-users` - Users
- `fleet-calendar` - Calendar events

### Frontend Files

#### `src/components/Dashboard.tsx` - Main Dashboard
```typescript
// Main dashboard component of the application
// Features:
// - Quick statistics
// - Navigation to menus
// - Clickable boxes for details
// - Real-time information
```

#### `src/components/Maintenance.tsx` - Maintenance Management
```typescript
// Component for managing maintenance records
// Features:
// - Add new maintenance records
// - Upload receipts and images
// - Track tasks
// - Maintenance statistics
```

**Receipt Upload Process:**
1. Select file in form
2. Upload to API endpoint
3. Save filename in DB
4. Display in list

#### `src/components/Reports.tsx` - Reports & Analytics
```typescript
// Interactive reports component
// Features:
// - Dynamic charts
// - Advanced filtering
// - Data export
// - Detailed view
```

**Chart Types:**
- Pie Chart - Vehicle status distribution
- Bar Chart - Maintenance by month
- Line Chart - Cost analysis
- Usage Chart - Vehicle utilization

#### `src/components/Calendar.tsx` - Calendar
```typescript
// Calendar component for maintenance planning
// Features:
// - Monthly view
// - Add events
// - Edit existing events
// - Alerts and recurring events
```

### Configuration Files

#### `start-fleet-manager.sh` - Startup Script
```bash
#!/bin/bash
# Automated script to start the system
# Includes:
# - Check dependencies
# - Build the application
# - Start the server
# - Set environment variables
```

#### `fleet-manager.service` - Systemd Service
```ini
# Configuration file for automatic system startup
# Enables:
# - Automatic startup on boot
# - Automatic restart on crash
# - Management through systemctl
```

#### `nginx-fleet.conf` - Nginx Configuration
```nginx
# Proxy server configuration
# Includes:
# - Reverse proxy to port 3001
# - Static files serving
# - Security headers
# - File upload limits
```

## 🔗 API Reference

### Authentication Endpoints
```
POST /api/auth/login          # Login
POST /api/auth/register       # Registration
GET  /api/users              # User list
```

### Vehicle Management
```
GET    /api/vehicles         # Get all vehicles
POST   /api/vehicles         # Add new vehicle
GET    /api/vehicles/:id     # Get specific vehicle
PUT    /api/vehicles/:id     # Update vehicle
DELETE /api/vehicles/:id     # Delete vehicle
```

### Maintenance Management
```
GET    /api/maintenance      # Get all maintenance records
POST   /api/maintenance      # Add maintenance record
PUT    /api/maintenance/:id  # Update maintenance record
DELETE /api/maintenance/:id  # Delete maintenance record
```

### File Upload
```
POST   /api/photos/upload    # Upload file
GET    /api/photos/:filename # Get file
DELETE /api/photos/:id       # Delete file
```

### Calendar Management
```
GET    /api/calendar         # Get events
POST   /api/calendar         # Add event
PUT    /api/calendar/:id     # Update event
DELETE /api/calendar/:id     # Delete event
```

### Public Reports
```
GET    /api/reports          # Get public reports
POST   /api/reports          # Add public report
PUT    /api/reports/:id      # Update report
DELETE /api/reports/:id      # Delete report
```

### System
```
GET    /api/health           # System health check
POST   /api/test/sample-data # Create sample data
```

## 🔍 Troubleshooting

### Common Issues:

#### 1. Server Won't Start
```bash
# Check if port is available
sudo netstat -tulpn | grep 3001

# Check logs
tail -f server.log

# Restart
pkill -f "node api-server.js"
PORT=3001 node api-server.js
```

#### 2. DynamoDB Connection Issues
```bash
# Check AWS credentials
aws configure list

# Check internet connection
curl -I https://dynamodb.eu-central-1.amazonaws.com

# Check permissions
aws dynamodb list-tables
```

#### 3. Files Not Loading
```bash
# Check if directory exists
ls -la uploads/

# Check permissions
chmod 755 uploads/

# Check if server serves static files
curl http://localhost:3001/api/photos/test-file.txt
```

#### 4. Nginx Not Working
```bash
# Check configuration
sudo nginx -t

# Restart
sudo systemctl restart nginx

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### Health Checks:

```bash
# Check API health
curl http://localhost:3001/api/health

# Check vehicles
curl http://localhost:3001/api/vehicles

# Check maintenance
curl http://localhost:3001/api/maintenance

# Check Nginx proxy
curl http://localhost:8080/api/health
```

## 🛠️ Maintenance & Updates

### Backups:
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Backup DynamoDB (via AWS CLI)
aws dynamodb create-backup --table-name fleet-vehicles --backup-name vehicle-backup-$(date +%Y%m%d)
```

### System Updates:
```bash
# Update dependencies
npm update

# Rebuild
npm run build

# Restart
./start-fleet-manager.sh
```

### Monitoring:
```bash
# Monitor CPU and Memory
htop

# Monitor disk space
df -h

# Monitor logs
tail -f server.log

# Monitor Nginx
sudo tail -f /var/log/nginx/access.log
```

### Performance Optimization:
```bash
# Compress static files
gzip dist/*

# Optimize images
mogrify -resize 800x600 uploads/*.jpg

# Clean old files
find uploads/ -mtime +30 -delete
```

## 📊 Metrics & Statistics

The system provides advanced metrics:

- **Vehicles**: Total, available, in maintenance
- **Maintenance**: Completions, costs, downtime
- **Usage**: Kilometers, usage frequency
- **Costs**: Maintenance, fuel, insurance

## 🔐 Security

### Built-in Protections:
- Input validation on all endpoints
- File type validation for uploads
- CORS protection
- Security headers in Nginx
- Advanced error handling

### Security Recommendations:
- Change default passwords
- Set up HTTPS in production
- Regular backups
- Security updates

## 📞 Support

For questions or issues:
1. Check the troubleshooting guide
2. Review system logs
3. Open issue on GitHub
4. Contact the developer

---

**Fleet Control Hub System**
*Version: 1.0.0*  
*Last Updated: July 2025*
