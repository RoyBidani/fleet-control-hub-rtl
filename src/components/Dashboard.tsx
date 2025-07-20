
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Settings, FileText, Calendar, LogOut, Users, Wrench, BarChart3, Clock, History } from 'lucide-react';
import { apiService } from '../services/api';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLogout }) => {
  const [vehicleStats, setVehicleStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    inMaintenance: 0
  });
  const [maintenanceStats, setMaintenanceStats] = useState({
    thisMonth: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([
    {
      id: 'vehicles',
      title: 'ניהול רכבים',
      description: 'הוספה, עריכה ומחיקה של רכבים',
      icon: Car,
      color: 'from-blue-500 to-blue-600',
      stats: `רכבים פעילים`
    },
    {
      id: 'maintenance',
      title: 'תחזוקה',
      description: 'ניהול פעולות תחזוקה ושירות',
      icon: Wrench,
      color: 'from-green-500 to-green-600',
      stats: `פעולות החודש`
    },
    {
      id: 'reports',
      title: 'דוחות',
      description: 'צפייה בדוחות ונתונים סטטיסטיים',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      stats: 'עדכון אחרון: היום'
    },
    {
      id: 'calendar',
      title: 'לוח שנה',
      description: 'תכנון תחזוקה ונסיעות',
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      stats: `אירועים בסך הכל`
    },
    {
      id: 'history',
      title: 'היסטוריית טפסים',
      description: 'צפייה בטפסים ציבוריים שנשלחו',
      icon: History,
      color: 'from-teal-500 to-teal-600',
      stats: 'טפסים חדשים'
    }
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [vehicles, maintenanceRecords, publicReports] = await Promise.all([
        apiService.getVehicles(),
        apiService.getMaintenanceRecords(),
        apiService.getPublicReports()
      ]);
      
      // Calculate vehicle stats
      const total = vehicles.length;
      const inMaintenance = vehicles.filter(v => v.maintenanceStatus === 'דורש טיפול').length;
      const available = total - inMaintenance;
      
      setVehicleStats({
        totalVehicles: total,
        availableVehicles: available,
        inMaintenance: inMaintenance
      });
      
      // Calculate maintenance stats
      const currentDate = new Date();
      const thisMonthRecords = maintenanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate.getMonth() === currentDate.getMonth() && 
               recordDate.getFullYear() === currentDate.getFullYear();
      });
      
      setMaintenanceStats({
        thisMonth: thisMonthRecords.length,
        total: maintenanceRecords.length
      });

      // Update the reports count in the menu items
      const newReportsCount = publicReports.filter(r => r.status === 'new' || !r.status).length;
      setMenuItems(prev => prev.map(item => {
        switch (item.id) {
          case 'vehicles':
            return { ...item, stats: `${total} רכבים פעילים` };
          case 'maintenance':
            return { ...item, stats: `${thisMonthRecords.length} פעולות החודש` };
          case 'calendar':
            return { ...item, stats: `${maintenanceRecords.length} אירועים בסך הכל` };
          case 'history':
            return { ...item, stats: `${newReportsCount} טפסים חדשים` };
          default:
            return item;
        }
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('loginTime');
    onLogout();
  };


  const quickStats = [
    { 
      label: 'סה"כ רכבים', 
      value: vehicleStats.totalVehicles.toString(), 
      icon: Car, 
      color: 'text-blue-600',
      action: () => onNavigate('vehicles')
    },
    { 
      label: 'רכבים זמינים', 
      value: vehicleStats.availableVehicles.toString(), 
      icon: Users, 
      color: 'text-green-600',
      action: () => onNavigate('vehicles')
    },
    { 
      label: 'בתחזוקה', 
      value: vehicleStats.inMaintenance.toString(), 
      icon: Settings, 
      color: 'text-orange-600',
      action: () => onNavigate('maintenance')
    },
    { 
      label: 'תחזוקות החודש', 
      value: maintenanceStats.thisMonth.toString(), 
      icon: Clock, 
      color: 'text-purple-600',
      action: () => onNavigate('maintenance')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">מערכת ניהול צי רכבים</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              התנתקות
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ברוכים הבאים למערכת</h2>
          <p className="text-gray-600">נהלו את הצי שלכם בקלות ויעילות</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card 
              key={stat.label} 
              className={`fleet-card scale-in hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105`} 
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={stat.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-blue-600 mt-1">לחץ לפרטים</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card 
              key={item.id} 
              className={`fleet-card cursor-pointer group slide-in-right hover:shadow-xl transition-all duration-300`}
              style={{ animationDelay: `${index * 0.15}s` }}
              onClick={() => onNavigate(item.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.stats}</span>
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <span className="text-xs text-gray-600 group-hover:text-blue-600">←</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Public Form Access */}
        <Card className="mt-8 fleet-card fade-in bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <FileText className="w-5 h-5" />
              טופס ציבורי לדיווח
            </CardTitle>
            <CardDescription className="text-green-700">
              טופס נגיש לכלל הנהגים לדיווח על מצב הרכב
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onNavigate('public-form')}
              className="fleet-btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            >
              פתח טופס דיווח ציבורי
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
