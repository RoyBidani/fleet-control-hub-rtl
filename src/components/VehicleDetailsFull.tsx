import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Car, Calendar, Wrench, FileText, QrCode, Share2, MapPin, Clock, DollarSign, Plus, Image, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
import QRCode from 'qrcode';

interface VehicleDetailsFullProps {
  vehicleId: string;
  onBack: () => void;
  showBackButton?: boolean;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  barcode: string;
  maintenanceStatus: 'תקין' | 'דורש טיפול';
  addedDate: string;
  make?: string;
  year?: number;
  vin?: string;
  mileage?: number;
  lastService?: string;
  nextService?: string;
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlateNumber: string;
  serviceType: string;
  date: string;
  notes: string;
  cost?: number;
  addedDate: string;
  completed: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'maintenance' | 'inspection' | 'other';
  vehicleId?: string;
  description?: string;
}

interface PublicReport {
  id: string;
  barcode: string;
  images: string[];
  mileage: string;
  feature: string;
  date: string;
  time: string;
  driverName: string;
  notes: string;
  status: string;
}

const VehicleDetailsFull: React.FC<VehicleDetailsFullProps> = ({ vehicleId, onBack, showBackButton = true }) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  // Report form state
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportForm, setReportForm] = useState({
    driverName: '',
    mileage: '',
    feature: '',
    notes: '',
    images: [] as File[]
  });

  // Event form state
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    type: 'maintenance' as 'maintenance' | 'inspection' | 'other',
    description: ''
  });

  useEffect(() => {
    loadVehicleDetails();
  }, [vehicleId]);

  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      const [vehicleData, maintenanceData] = await Promise.all([
        apiService.getVehicles(),
        apiService.getMaintenanceRecords()
      ]);

      const foundVehicle = vehicleData.find(v => v.id === vehicleId);
      if (foundVehicle) {
        setVehicle(foundVehicle);
        
        // Generate QR code for vehicle details page
        const vehicleUrl = `${window.location.origin}/vehicle/${vehicleId}`;
        const qrCode = await QRCode.toDataURL(vehicleUrl);
        setQrCodeUrl(qrCode);
      }

      const vehicleMaintenanceRecords = maintenanceData.filter(record => record.vehicleId === vehicleId);
      setMaintenanceRecords(vehicleMaintenanceRecords);
    } catch (error) {
      console.error('Error loading vehicle details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!vehicle) return;
    
    try {
      const reportData = {
        barcode: vehicle.barcode,
        images: reportForm.images.map(file => file.name),
        mileage: reportForm.mileage,
        feature: reportForm.feature,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        driverName: reportForm.driverName,
        notes: reportForm.notes,
        status: 'new'
      };

      await apiService.createPublicReport(reportData);
      
      setShowReportDialog(false);
      setReportForm({
        driverName: '',
        mileage: '',
        feature: '',
        notes: '',
        images: []
      });
      
      alert('הדוח נשלח בהצלחה!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('שגיאה בשליחת הדוח');
    }
  };

  const handleSubmitEvent = async () => {
    if (!vehicle) return;
    
    try {
      const eventData = {
        title: eventForm.title,
        date: `${eventForm.date}T${eventForm.time}:00.000Z`,
        type: eventForm.type,
        vehicleId: vehicle.id,
        description: eventForm.description
      };

      await apiService.createCalendarEvent(eventData);
      
      setShowEventDialog(false);
      setEventForm({
        title: '',
        date: '',
        time: '',
        type: 'maintenance',
        description: ''
      });
      
      alert('האירוע נוצר בהצלחה!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('שגיאה ביצירת האירוע');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReportForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'תקין': return 'bg-green-100 text-green-800';
      case 'דורש טיפול': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען פרטי רכב...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">רכב לא נמצא</h3>
          <p className="text-gray-600 mb-4">הרכב המבוקש לא נמצא במערכת</p>
          {showBackButton && <Button onClick={onBack}>חזרה</Button>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  חזרה
                </Button>
              )}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">רכב {vehicle.plateNumber}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(vehicle.maintenanceStatus)}>
                {vehicle.maintenanceStatus}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white p-6 h-auto flex flex-col items-center gap-2">
                <AlertTriangle className="w-8 h-8" />
                <span className="text-lg font-semibold">דווח תקלה</span>
                <span className="text-sm opacity-90">דווח על בעיה ברכב</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>דיווח תקלה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="driverName">שם הנהג</Label>
                  <Input
                    id="driverName"
                    value={reportForm.driverName}
                    onChange={(e) => setReportForm({...reportForm, driverName: e.target.value})}
                    placeholder="הכנס שם מלא"
                  />
                </div>
                <div>
                  <Label htmlFor="mileage">מד קילומטראז'</Label>
                  <Input
                    id="mileage"
                    value={reportForm.mileage}
                    onChange={(e) => setReportForm({...reportForm, mileage: e.target.value})}
                    placeholder="למשל: 25000"
                  />
                </div>
                <div>
                  <Label htmlFor="feature">סוג הבעיה</Label>
                  <Select value={reportForm.feature} onValueChange={(value) => setReportForm({...reportForm, feature: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג בעיה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="תקלה במנוע">תקלה במנוע</SelectItem>
                      <SelectItem value="בעיה בבלמים">בעיה בבלמים</SelectItem>
                      <SelectItem value="תקלה חשמלית">תקלה חשמלית</SelectItem>
                      <SelectItem value="נזק חיצוני">נזק חיצוני</SelectItem>
                      <SelectItem value="בעיה בצמיגים">בעיה בצמיגים</SelectItem>
                      <SelectItem value="אחר">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">תיאור הבעיה</Label>
                  <Textarea
                    id="notes"
                    value={reportForm.notes}
                    onChange={(e) => setReportForm({...reportForm, notes: e.target.value})}
                    placeholder="תאר את הבעיה בפירוט"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="images">צרף תמונות</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {reportForm.images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {reportForm.images.length} תמונות נצרפו
                      </p>
                    </div>
                  )}
                </div>
                <Button onClick={handleSubmitReport} className="w-full">
                  שלח דיווח
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white p-6 h-auto flex flex-col items-center gap-2">
                <Calendar className="w-8 h-8" />
                <span className="text-lg font-semibold">קבע תור</span>
                <span className="text-sm opacity-90">קבע תור לתחזוקה</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>קבע תור לתחזוקה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventTitle">כותרת</Label>
                  <Input
                    id="eventTitle"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    placeholder="למשל: החלפת שמן"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">תאריך</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">שעה</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="eventType">סוג</Label>
                  <Select value={eventForm.type} onValueChange={(value) => setEventForm({...eventForm, type: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג אירוע" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">תחזוקה</SelectItem>
                      <SelectItem value="inspection">בדיקה</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="eventDescription">תיאור</Label>
                  <Textarea
                    id="eventDescription"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    placeholder="תיאור התחזוקה הנדרשת"
                    rows={3}
                  />
                </div>
                <Button onClick={handleSubmitEvent} className="w-full">
                  קבע תור
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            className="p-6 h-auto flex flex-col items-center gap-2"
            onClick={() => window.open(`https://wa.me/?text=פרטי רכב ${vehicle.plateNumber}: ${window.location.href}`, '_blank')}
          >
            <Share2 className="w-8 h-8" />
            <span className="text-lg font-semibold">שתף</span>
            <span className="text-sm opacity-90">שתף פרטי רכב</span>
          </Button>
        </div>

        {/* Vehicle Details */}
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      מידע כללי
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">מספר רכב</p>
                        <p className="font-semibold text-lg">{vehicle.plateNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">דגם</p>
                        <p className="font-semibold">{vehicle.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ברקוד</p>
                        <p className="font-semibold">{vehicle.barcode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">תאריך הוספה</p>
                        <p className="font-semibold">{new Date(vehicle.addedDate).toLocaleDateString('he-IL')}</p>
                      </div>
                      {vehicle.make && (
                        <div>
                          <p className="text-sm text-gray-600">יצרן</p>
                          <p className="font-semibold">{vehicle.make}</p>
                        </div>
                      )}
                      {vehicle.year && (
                        <div>
                          <p className="text-sm text-gray-600">שנת ייצור</p>
                          <p className="font-semibold">{vehicle.year}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      QR Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    {qrCodeUrl && (
                      <div>
                        <img 
                          src={qrCodeUrl} 
                          alt="Vehicle QR Code" 
                          className="mx-auto mb-4 border rounded-lg"
                          style={{ maxWidth: '200px' }}
                        />
                        <p className="text-sm text-gray-600">
                          שתף קישור לפרטי הרכב
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

          {/* Maintenance History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                היסטוריית תחזוקה
              </CardTitle>
            </CardHeader>
            <CardContent>
              {maintenanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">אין רישומי תחזוקה עדיין</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{record.serviceType}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(record.date).toLocaleDateString('he-IL')}
                            </div>
                            {record.cost && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ₪{record.cost.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={record.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {record.completed ? 'הושלם' : 'בתהליך'}
                        </Badge>
                      </div>
                      {record.notes && (
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsFull;