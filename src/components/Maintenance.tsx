
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wrench, Plus, Trash2, ArrowRight, Calendar, FileText, Car, CheckCircle, Clock, Upload, Scan } from 'lucide-react';
import { apiService, Vehicle, MaintenanceRecord } from '../services/api';

interface MaintenanceProps {
  onBack: () => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ onBack }) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: '',
    date: '',
    notes: '',
    cost: '',
    tasks: '',
    receiptImage: null as File | string | null
  });

  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [showRecordDetails, setShowRecordDetails] = useState(false);

  const serviceTypes = [
    'שירות שמן',
    'בדיקת צמיגים',
    'בדיקת בלמים',
    'בדיקת מזגן',
    'בדיקת רדיאטור',
    'בדיקת סוללה',
    'בדיקת אורות',
    'בדיקת מגבים',
    'טעינת גז',
    'החלפת פילטרים',
    'בדיקת מנוע',
    'אחר'
  ];

  useEffect(() => {
    console.log('Maintenance component mounted');
    setMounted(true);
    loadData();
    
    return () => {
      console.log('Maintenance component unmounted');
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading maintenance data...');
      
      const [vehicleData, maintenanceData] = await Promise.all([
        apiService.getVehicles(),
        apiService.getMaintenanceRecords()
      ]);
      
      console.log('Vehicle data:', vehicleData);
      console.log('Maintenance data:', maintenanceData);
      
      setVehicles(vehicleData || []);
      setMaintenanceRecords(maintenanceData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setAlert({ type: 'error', message: 'שגיאה בטעינת הנתונים' });
      setTimeout(() => setAlert(null), 5000);
      
      // Set empty arrays to prevent the component from crashing
      setVehicles([]);
      setMaintenanceRecords([]);
    } finally {
      setLoading(false);
    }
  };


  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploadedFile = await apiService.uploadPhoto(file, formData.vehicleId || 'temp');
        setFormData({...formData, receiptImage: uploadedFile.filename});
        setAlert({ type: 'success', message: 'קובץ הקבלה הועלה בהצלחה!' });
        setTimeout(() => setAlert(null), 3000);
      } catch (error) {
        console.error('Error uploading receipt:', error);
        setAlert({ type: 'error', message: 'שגיאה בהעלאת קובץ הקבלה' });
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  const startBarcodeScanning = async () => {
    try {
      setShowBarcodeScanner(true);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      // For now, use a simple prompt as a fallback
      const scannedCode = prompt('אנא הזן את הברקוד שסרקתם:');
      if (scannedCode) {
        // Find vehicle by barcode
        const vehicle = vehicles.find(v => v.barcode === scannedCode);
        if (vehicle) {
          setFormData({...formData, vehicleId: vehicle.id});
          setAlert({ type: 'success', message: `רכב נמצא: ${vehicle.plateNumber}` });
          setTimeout(() => setAlert(null), 3000);
        } else {
          setAlert({ type: 'error', message: 'ברקוד לא נמצא במערכת' });
          setTimeout(() => setAlert(null), 3000);
        }
      }
      
      // Stop camera
      stream.getTracks().forEach(track => track.stop());
      setShowBarcodeScanner(false);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setAlert({ type: 'error', message: 'לא ניתן לגשת למצלמה. אנא בחר רכב מהרשימה.' });
      setTimeout(() => setAlert(null), 3000);
      setShowBarcodeScanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    if (!selectedVehicle) {
      setAlert({ type: 'error', message: 'אנא בחרו רכב' });
      return;
    }

    try {
      setLoading(true);

      // Parse tasks from text input
      const tasks = formData.tasks
        .split('\n')
        .filter(task => task.trim())
        .map(task => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          description: task.trim(),
          completed: false
        }));

      const newRecord = {
        vehicleId: formData.vehicleId,
        vehiclePlateNumber: selectedVehicle.plateNumber,
        serviceType: formData.serviceType,
        date: formData.date,
        notes: formData.notes,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        completed: false,
        tasks: tasks,
        receiptImage: typeof formData.receiptImage === 'string' ? formData.receiptImage : formData.receiptImage?.name
      };

      await apiService.createMaintenanceRecord(newRecord);
      await loadData();
      setAlert({ type: 'success', message: 'פעולת התחזוקה נוספה בהצלחה!' });

      setFormData({
        vehicleId: '',
        serviceType: '',
        date: '',
        notes: '',
        cost: '',
        tasks: '',
        receiptImage: null
      });
      setShowAddForm(false);

      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      setAlert({ type: 'error', message: 'שגיאה בשמירת פעולת התחזוקה' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceCompletion = async (recordId: string) => {
    try {
      const record = maintenanceRecords.find(r => r.id === recordId);
      if (!record) return;
      
      await apiService.updateMaintenanceRecord(recordId, { completed: !record.completed });
      await loadData();
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      setAlert({ type: 'error', message: 'שגיאה בעדכון סטטוס התחזוקה' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const toggleTaskCompletion = async (recordId: string, taskId: string) => {
    try {
      const record = maintenanceRecords.find(r => r.id === recordId);
      if (!record) return;
      
      const updatedTasks = record.tasks.map(task =>
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      );
      
      await apiService.updateMaintenanceRecord(recordId, { tasks: updatedTasks });
      await loadData();
    } catch (error) {
      console.error('Error updating task:', error);
      setAlert({ type: 'error', message: 'שגיאה בעדכון המשימה' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (confirm('האם אתם בטוחים שברצונכם למחוק את רשומת התחזוקה?')) {
      try {
        await apiService.deleteMaintenanceRecord(recordId);
        await loadData();
        setAlert({ type: 'success', message: 'רשומת התחזוקה נמחקה בהצלחה!' });
        setTimeout(() => setAlert(null), 3000);
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
        setAlert({ type: 'error', message: 'שגיאה במחיקת רשומת התחזוקה' });
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      vehicleId: '',
      serviceType: '',
      date: '',
      notes: '',
      cost: '',
      tasks: '',
      receiptImage: null
    });
  };

  const handleRecordClick = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setShowRecordDetails(true);
  };

  const getTotalCost = () => {
    return maintenanceRecords
      .filter(record => record.cost)
      .reduce((total, record) => total + (record.cost || 0), 0);
  };

  const getCompletionStats = () => {
    const total = maintenanceRecords.length;
    const completed = maintenanceRecords.filter(r => r && r.completed).length;
    const openTasks = maintenanceRecords
      .flatMap(r => r && r.tasks ? r.tasks : [])
      .filter(t => t && !t.completed).length;
    
    return { total, completed, open: total - completed, openTasks };
  };

  const stats = getCompletionStats();

  // Debug: Force render a simple test first
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">טוען עמוד תחזוקה...</h1>
          <p className="text-gray-600">מערכת התחזוקה בטעינה</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                חזרה לדף הבית
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Wrench className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">ניהול תחזוקה</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Maintenance Record Details Dialog */}
      <Dialog open={showRecordDetails} onOpenChange={setShowRecordDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>פרטי פעולת תחזוקה</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">רכב:</span>
                  <p className="text-sm">{selectedRecord.vehiclePlateNumber}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">סוג פעולה:</span>
                  <p className="text-sm">{selectedRecord.serviceType}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">תאריך:</span>
                  <p className="text-sm">{selectedRecord.date}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">עלות:</span>
                  <p className="text-sm">{selectedRecord.cost ? `₪${selectedRecord.cost.toLocaleString()}` : 'לא צוין'}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">סטטוס:</span>
                <Badge className={selectedRecord.completed ? 'bg-green-100 text-green-800 ml-2' : 'bg-yellow-100 text-yellow-800 ml-2'}>
                  {selectedRecord.completed ? 'הושלם' : 'בתהליך'}
                </Badge>
              </div>
              
              {selectedRecord.tasks && selectedRecord.tasks.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">משימות:</span>
                  <div className="mt-2 space-y-1">
                    {selectedRecord.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={task.completed} readOnly />
                        <span className={task.completed ? 'line-through text-gray-500' : ''}>
                          {task.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedRecord.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">הערות:</span>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{selectedRecord.notes}</p>
                </div>
              )}
              
              {selectedRecord.receiptImage && (
                <div>
                  <span className="text-sm font-medium text-gray-700">קבלה:</span>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      {(selectedRecord.receiptImage.endsWith('.html') || selectedRecord.receiptImage.endsWith('.txt') || selectedRecord.receiptImage.endsWith('.json')) ? (
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-20 bg-gray-100 border rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                               onClick={() => window.open(`/api/photos/${selectedRecord.receiptImage}`, '_blank')}>
                            <div className="text-center">
                              <FileText className="w-8 h-8 text-gray-500 mx-auto mb-1" />
                              <span className="text-xs text-gray-600">קבלה</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            לחץ לצפייה
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <img 
                            src={`/api/photos/${selectedRecord.receiptImage}`} 
                            alt="Receipt" 
                            className="w-32 h-32 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => window.open(`/api/photos/${selectedRecord.receiptImage}`, '_blank')}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-32 h-32 bg-gray-100 border rounded-lg items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors hidden"
                               onClick={() => window.open(`/api/photos/${selectedRecord.receiptImage}`, '_blank')}>
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-1" />
                              <span className="text-xs text-gray-600">תמונה לא נמצאה</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            לחץ לצפייה
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRecordDetails(false)}
                >
                  סגור
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="fleet-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">סה"כ פעולות</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Wrench className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="fleet-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">הושלמו</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="fleet-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">פתוחות</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.open}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="fleet-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">עלות כוללת</p>
                  <p className="text-2xl font-bold text-gray-900">₪{getTotalCost().toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Maintenance Button */}
        {!showAddForm && (
          <div className="mb-6">
            <Button 
              onClick={() => setShowAddForm(true)}
              className="fleet-btn fleet-secondary text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              הוסף פעולת תחזוקה
            </Button>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <Card className="mb-8 fleet-card fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                הוספת פעולת תחזוקה חדשה
              </CardTitle>
              <CardDescription>
                הזינו את פרטי פעולת התחזוקה והמשימות הנדרשות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">רכב</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.vehicleId} 
                        onValueChange={(value) => setFormData({...formData, vehicleId: value})}
                      >
                        <SelectTrigger className="text-right flex-1">
                          <SelectValue placeholder="בחרו רכב או סרקו ברקוד" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map(vehicle => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.plateNumber} - {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={startBarcodeScanning}
                        className="flex items-center gap-2 px-4"
                        disabled={showBarcodeScanner}
                      >
                        {showBarcodeScanner ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            סורק...
                          </>
                        ) : (
                          <>
                            <Scan className="w-4 h-4" />
                            סרוק
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">סוג פעולה/שירות</Label>
                    <Select 
                      value={formData.serviceType} 
                      onValueChange={(value) => setFormData({...formData, serviceType: value})}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="בחרו סוג שירות" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">תאריך ביצוע</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cost">עלות (₪)</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                      placeholder="0.00"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="receiptImage" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      תמונת קבלה
                    </Label>
                    <Input
                      id="receiptImage"
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="text-right"
                    />
                    {formData.receiptImage && (
                      <p className="text-sm text-green-600">
                        נבחר קובץ: {typeof formData.receiptImage === 'string' ? formData.receiptImage : formData.receiptImage.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="tasks">משימות (כל משימה בשורה נפרדת)</Label>
                    <Textarea
                      id="tasks"
                      value={formData.tasks}
                      onChange={(e) => setFormData({...formData, tasks: e.target.value})}
                      placeholder="החלפת שמן&#10;בדיקת צמיגים&#10;ניקוי רדיאטור"
                      className="text-right"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">הערות</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="פרטים נוספים על פעולת התחזוקה..."
                      className="text-right"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="fleet-btn fleet-secondary text-white" disabled={loading}>
                    {loading ? 'מעבד...' : 'הוסף פעולת תחזוקה'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                    ביטול
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Maintenance Records List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">היסטוריית תחזוקה ({maintenanceRecords.length})</h3>
          
          {maintenanceRecords.length === 0 ? (
            <Card className="fleet-card text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">אין רשומות תחזוקה במערכת</p>
              <p className="text-sm text-gray-500">הוסיפו פעולת תחזוקה כדי להתחיל</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {maintenanceRecords.map((record, index) => (
                <Card 
                  key={record.id} 
                  className={`fleet-card slide-in-right cursor-pointer hover:shadow-lg transition-shadow ${record.completed ? 'bg-green-50 border-green-200' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleRecordClick(record)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Car className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-lg">{record.vehiclePlateNumber}</h4>
                          <Badge variant="secondary">{record.serviceType}</Badge>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={record.completed}
                              onCheckedChange={() => toggleMaintenanceCompletion(record.id)}
                            />
                            <span className="text-sm">הושלם</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {record.date}
                          </span>
                          {record.cost && (
                            <span className="font-medium text-green-600">
                              ₪{record.cost.toLocaleString()}
                            </span>
                          )}
                          {record.receiptImage && (
                            <div className="flex items-center gap-2">
                              {(record.receiptImage.endsWith('.html') || record.receiptImage.endsWith('.txt') || record.receiptImage.endsWith('.json')) ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-100 border rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         window.open(`/api/photos/${record.receiptImage}`, '_blank');
                                       }}>
                                    <FileText className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Upload className="w-3 h-3" />
                                    יש קבלה
                                  </Badge>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={`/api/photos/${record.receiptImage}`} 
                                    alt="Receipt thumbnail" 
                                    className="w-8 h-8 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`/api/photos/${record.receiptImage}`, '_blank');
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="w-8 h-8 bg-gray-100 border rounded items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors hidden"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         window.open(`/api/photos/${record.receiptImage}`, '_blank');
                                       }}>
                                    <Upload className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Upload className="w-3 h-3" />
                                    יש קבלה
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Tasks */}
                        {record.tasks && record.tasks.length > 0 && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium mb-2">משימות:</h5>
                            <div className="space-y-2">
                              {record.tasks.map(task => (
                                <div key={task.id} className="flex items-center gap-2">
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTaskCompletion(record.id, task.id)}
                                  />
                                  <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                    {task.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.notes && (
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {record.notes}
                          </p>
                        )}
                        
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 text-center">
                            לחץ על הכרטיס לצפייה בפרטים המלאים
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecordClick(record);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          פרטים
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(record.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          מחק
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
