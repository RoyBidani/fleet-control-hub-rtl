
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Download, Car, Wrench, TrendingUp, Calendar, FileText, BarChart3, Filter, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface ReportsProps {
  onBack: () => void;
}

const Reports: React.FC<ReportsProps> = ({ onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [vehicleType, setVehicleType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [detailedViewData, setDetailedViewData] = useState<any>(null);
  const [detailedViewTitle, setDetailedViewTitle] = useState('');

  // Sample vehicle data
  const vehicles = [
    { id: 'V001', plateNumber: '123-45-678', model: 'Toyota Camry', type: 'sedan' },
    { id: 'V002', plateNumber: '234-56-789', model: 'Ford Transit', type: 'van' },
    { id: 'V003', plateNumber: '345-67-890', model: 'Hyundai Tucson', type: 'suv' },
    { id: 'V004', plateNumber: '456-78-901', model: 'Nissan Sentra', type: 'sedan' },
  ];

  const vehicleTypes = [
    { value: 'all', label: 'כל הסוגים' },
    { value: 'sedan', label: 'סדאן' },
    { value: 'van', label: 'טנדר' },
    { value: 'suv', label: 'רכב שטח' },
    { value: 'truck', label: 'משאית' },
  ];

  // Filter data based on current filters
  const getFilteredVehicles = () => {
    return vehicles.filter(vehicle => {
      const matchesSearch = searchTerm === '' || 
        vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesVehicle = selectedVehicle === 'all' || vehicle.id === selectedVehicle;
      const matchesType = vehicleType === 'all' || vehicle.type === vehicleType;
      
      return matchesSearch && matchesVehicle && matchesType;
    });
  };

  const filteredVehicles = getFilteredVehicles();

  // Sample data for charts (filtered)
  const vehicleStatusData = [
    { name: 'תקין', value: filteredVehicles.filter(v => v.plateNumber !== '234-56-789').length, color: '#10b981' },
    { name: 'דורש טיפול', value: filteredVehicles.filter(v => v.plateNumber === '234-56-789').length, color: '#f59e0b' },
  ];

  const maintenanceByMonth = [
    { month: 'ינואר', count: selectedVehicle === 'all' ? 5 : 2 },
    { month: 'פברואר', count: selectedVehicle === 'all' ? 3 : 1 },
    { month: 'מרץ', count: selectedVehicle === 'all' ? 8 : 3 },
    { month: 'אפריל', count: selectedVehicle === 'all' ? 6 : 2 },
    { month: 'מאי', count: selectedVehicle === 'all' ? 4 : 1 },
    { month: 'יוני', count: selectedVehicle === 'all' ? 7 : 2 },
  ];

  const vehicleUsage = filteredVehicles.map((vehicle, index) => ({
    vehicle: vehicle.plateNumber,
    kilometers: [15000, 12500, 18000, 9800][index % 4] || 10000
  }));

  const costAnalysis = [
    { month: 'ינואר', maintenance: selectedVehicle === 'all' ? 2500 : 1200, fuel: selectedVehicle === 'all' ? 4800 : 2400 },
    { month: 'פברואר', maintenance: selectedVehicle === 'all' ? 1800 : 900, fuel: selectedVehicle === 'all' ? 4200 : 2100 },
    { month: 'מרץ', maintenance: selectedVehicle === 'all' ? 3200 : 1600, fuel: selectedVehicle === 'all' ? 5100 : 2550 },
    { month: 'אפריל', maintenance: selectedVehicle === 'all' ? 2100 : 1050, fuel: selectedVehicle === 'all' ? 4600 : 2300 },
    { month: 'מאי', maintenance: selectedVehicle === 'all' ? 1500 : 750, fuel: selectedVehicle === 'all' ? 4300 : 2150 },
    { month: 'יוני', maintenance: selectedVehicle === 'all' ? 2800 : 1400, fuel: selectedVehicle === 'all' ? 4900 : 2450 },
  ];

  const quickStats = [
    {
      title: 'סה"כ רכבים',
      value: filteredVehicles.length.toString(),
      change: '+0%',
      icon: Car,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'תחזוקות החודש',
      value: (selectedVehicle === 'all' ? 12 : 3).toString(),
      change: '+25%',
      icon: Wrench,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'סה"כ ק"מ',
      value: vehicleUsage.reduce((sum, v) => sum + v.kilometers, 0).toLocaleString(),
      change: '+12%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'עלות חודשית',
      value: '₪' + costAnalysis.reduce((sum, month) => sum + month.maintenance + month.fuel, 0).toLocaleString(),
      change: '-8%',
      icon: BarChart3,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
  ];

  const recentReports = [
    {
      id: '1',
      title: 'דוח תחזוקה חודשי',
      date: '2025-01-01',
      type: 'maintenance',
      status: 'completed'
    },
    {
      id: '2',
      title: 'דוח שימוש ברכבים',
      date: '2025-01-01',
      type: 'usage',
      status: 'completed'
    },
    {
      id: '3',
      title: 'דוח עלויות',
      date: '2024-12-31',
      type: 'financial',
      status: 'completed'
    },
  ];

  const handleReportClick = (report: any) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  const exportToPDF = async () => {
    try {
      // Create a comprehensive report data structure
      const reportData = {
        title: 'דוח מערכת ניהול צי רכבים',
        date: new Date().toLocaleDateString('he-IL'),
        quickStats,
        vehicleStatusData,
        maintenanceByMonth,
        vehicleUsage,
        costAnalysis,
        filters: {
          selectedVehicle: selectedVehicle !== 'all' ? vehicles.find(v => v.id === selectedVehicle)?.plateNumber : 'כל הרכבים',
          vehicleType: vehicleTypes.find(t => t.value === vehicleType)?.label,
          searchTerm
        }
      };

      // Convert to downloadable format
      const jsonData = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `fleet-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const exportToCSV = () => {
    try {
      let csvContent = 'סוג נתון,ערך\n';
      
      // Add quick stats
      quickStats.forEach(stat => {
        csvContent += `"${stat.title}","${stat.value}"\n`;
      });
      
      csvContent += '\nמצב רכבים,כמות\n';
      vehicleStatusData.forEach(item => {
        csvContent += `"${item.name}","${item.value}"\n`;
      });
      
      csvContent += '\nחודש,תחזוקות\n';
      maintenanceByMonth.forEach(item => {
        csvContent += `"${item.month}","${item.count}"\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `fleet-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                חזרה
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">דוחות ונתונים</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4" />
                יצוא JSON
              </Button>
              <Button 
                onClick={exportToCSV}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                יצוא CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Detailed View Dialog */}
      <Dialog open={showDetailedView} onOpenChange={setShowDetailedView}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailedViewTitle}</DialogTitle>
          </DialogHeader>
          {detailedViewData && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      {Object.keys(detailedViewData[0] || {}).map(key => (
                        <th key={key} className="border border-gray-300 px-4 py-2 text-right font-medium">
                          {key === 'name' ? 'שם' :
                           key === 'model' ? 'דגם' :
                           key === 'type' ? 'סוג' :
                           key === 'plateNumber' ? 'מספר רכב' :
                           key === 'month' ? 'חודש' :
                           key === 'count' ? 'כמות' :
                           key === 'vehicle' ? 'רכב' :
                           key === 'kilometers' ? 'קילומטרים' :
                           key === 'maintenance' ? 'תחזוקה' :
                           key === 'fuel' ? 'דלק' :
                           key === 'status' ? 'סטטוס' :
                           key === 'percentage' ? 'אחוז' :
                           key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailedViewData.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(item).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-right">
                            {typeof value === 'number' ? value.toLocaleString() : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  onClick={() => {
                    const csvContent = [
                      Object.keys(detailedViewData[0]).join(','),
                      ...detailedViewData.map((row: any) => Object.values(row).join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${detailedViewTitle.replace(/\s+/g, '-')}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  ייצא לקובץ CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailedView(false)}
                >
                  סגור
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Details Dialog */}
      <Dialog open={showReportDetails} onOpenChange={setShowReportDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>פרטי הדוח</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">שם הדוח:</span>
                  <p className="text-sm">{selectedReport.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">תאריך יצירה:</span>
                  <p className="text-sm">{selectedReport.date}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">סוג דוח:</span>
                  <p className="text-sm">{
                    selectedReport.type === 'maintenance' ? 'תחזוקה' :
                    selectedReport.type === 'usage' ? 'שימוש' :
                    selectedReport.type === 'financial' ? 'כספי' : 'כללי'
                  }</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">סטטוס:</span>
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    {selectedReport.status === 'completed' ? 'הושלם' : 'בתהליך'}
                  </Badge>
                </div>
              </div>

              {/* Report Content */}
              <div className="mt-6">
                <span className="text-sm font-medium text-gray-700">תוכן הדוח:</span>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  {selectedReport.type === 'maintenance' && (
                    <div>
                      <h4 className="font-semibold mb-3">דוח תחזוקה חודשי</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• סה"כ פעולות תחזוקה שבוצעו: 12</li>
                        <li>• עלות כוללת: ₪15,400</li>
                        <li>• רכבים שטופלו: 8 מתוך 12</li>
                        <li>• פעולות מתוכננות לחודש הבא: 6</li>
                        <li>• זמן השבתה ממוצע: 2.5 ימים</li>
                      </ul>
                    </div>
                  )}
                  
                  {selectedReport.type === 'usage' && (
                    <div>
                      <h4 className="font-semibold mb-3">דוח שימוש ברכבים</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• סה"כ קילומטרים: 55,300 ק"מ</li>
                        <li>• ממוצע ק"מ לרכב: 4,608 ק"מ</li>
                        <li>• רכב בשימוש מרבי: רכב 123-45-678 (18,000 ק"מ)</li>
                        <li>• רכב בשימוש מינימלי: רכב 456-78-901 (9,800 ק"מ)</li>
                        <li>• ימי שימוש: 28 מתוך 30</li>
                      </ul>
                    </div>
                  )}
                  
                  {selectedReport.type === 'financial' && (
                    <div>
                      <h4 className="font-semibold mb-3">דוח עלויות</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• עלות תחזוקה: ₪15,400</li>
                        <li>• עלות דלק: ₪28,600</li>
                        <li>• ביטוח: ₪8,200</li>
                        <li>• עלויות נוספות: ₪3,100</li>
                        <li>• <strong>סה"כ עלויות: ₪55,300</strong></li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      const reportJson = JSON.stringify(selectedReport, null, 2);
                      const blob = new Blob([reportJson], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `report-${selectedReport.id}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    הורד דוח JSON
                  </Button>
                  <Button 
                    onClick={() => {
                      const csvContent = `נתון,ערך\n"שם הדוח","${selectedReport.title}"\n"תאריך","${selectedReport.date}"\n"סוג","${selectedReport.type}"\n"סטטוס","${selectedReport.status}"`;
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `report-${selectedReport.id}.csv`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    הורד דוח CSV
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReportDetails(false)}
                >
                  סגור
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              מסננים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  חיפוש לפי מספר רכב
                </label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="חפש לפי מספר רכב..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  רכב ספציפי
                </label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר רכב" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הרכבים</SelectItem>
                    {vehicles
                      .filter(vehicle => 
                        vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.plateNumber} - {vehicle.model}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סוג רכב
                </label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג רכב" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(selectedVehicle !== 'all' || vehicleType !== 'all' || searchTerm) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">מסננים פעילים:</span>
                    {selectedVehicle !== 'all' && (
                      <Badge variant="outline">
                        רכב: {vehicles.find(v => v.id === selectedVehicle)?.plateNumber}
                      </Badge>
                    )}
                    {vehicleType !== 'all' && (
                      <Badge variant="outline">
                        סוג: {vehicleTypes.find(t => t.value === vehicleType)?.label}
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge variant="outline">
                        חיפוש: {searchTerm}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedVehicle('all');
                      setVehicleType('all');
                      setSearchTerm('');
                    }}
                  >
                    נקה מסננים
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card 
              key={stat.title} 
              className="hover:shadow-lg transition-shadow cursor-pointer hover:scale-105"
              onClick={() => {
                let data = [];
                let title = '';
                
                switch(stat.title) {
                  case 'סה"כ רכבים':
                    data = filteredVehicles.map(v => ({ name: v.plateNumber, model: v.model, type: v.type }));
                    title = 'פרטי כל הרכבים';
                    break;
                  case 'תחזוקות החודש':
                    data = maintenanceByMonth;
                    title = 'פירוט תחזוקות לפי חודש';
                    break;
                  case 'סה"כ ק"מ':
                    data = vehicleUsage;
                    title = 'שימוש בקילומטרים לפי רכב';
                    break;
                  case 'עלות חודשית':
                    data = costAnalysis;
                    title = 'פירוט עלויות לפי חודש';
                    break;
                }
                
                setDetailedViewData(data);
                setDetailedViewTitle(title);
                setShowDetailedView(true);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} מהחודש הקודם
                    </p>
                    <p className="text-xs text-blue-600 mt-1">לחץ לפרטים</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for different report sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
            <TabsTrigger value="maintenance">תחזוקה</TabsTrigger>
            <TabsTrigger value="usage">שימוש</TabsTrigger>
            <TabsTrigger value="financial">כספים</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vehicle Status Chart */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setDetailedViewData(vehicleStatusData.map(item => ({
                    status: item.name,
                    count: item.value,
                    percentage: ((item.value / vehicleStatusData.reduce((sum, v) => sum + v.value, 0)) * 100).toFixed(1) + '%'
                  })));
                  setDetailedViewTitle('פירוט סטטוס רכבים');
                  setShowDetailedView(true);
                }}
              >
                <CardHeader>
                  <CardTitle>סטטוס רכבים</CardTitle>
                  <CardDescription>התפלגות מצב הרכבים בצי - לחץ לפרטים</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={vehicleStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {vehicleStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle>דוחות אחרונים</CardTitle>
                  <CardDescription>דוחות שנוצרו לאחרונה</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.map(report => (
                      <div 
                        key={report.id} 
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all"
                        onClick={() => handleReportClick(report)}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">{report.title}</p>
                            <p className="text-sm text-gray-500">{report.date}</p>
                            <p className="text-xs text-blue-600">לחץ לצפייה בפרטים</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          הושלם
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>תחזוקות לפי חודש</CardTitle>
                <CardDescription>מספר פעולות התחזוקה שבוצעו בכל חודש</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={maintenanceByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>שימוש ברכבים</CardTitle>
                <CardDescription>מספר הקילומטרים שנסעו עם כל רכב</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={vehicleUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vehicle" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="kilometers" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ניתוח עלויות</CardTitle>
                <CardDescription>השוואת עלויות תחזוקה ודלק לפי חודשים</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={costAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="maintenance" stroke="#8884d8" name="תחזוקה" />
                    <Line type="monotone" dataKey="fuel" stroke="#82ca9d" name="דלק" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
