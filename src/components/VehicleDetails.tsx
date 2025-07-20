import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Car, Calendar, Wrench, FileText, QrCode, Share2, MapPin, Clock, DollarSign, Camera, Upload, X, Image } from 'lucide-react';
import { apiService } from '../services/api';
import QRCode from 'qrcode';

interface VehicleDetailsProps {
  vehicleId: string;
  onBack: () => void;
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

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ vehicleId, onBack }) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [photos, setPhotos] = useState<Array<{
    id: string;
    filename: string;
    url: string;
    uploadDate: string;
    description?: string;
    maintenanceId?: string;
    maintenanceAction?: string;
  }>>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedMaintenanceRecord, setSelectedMaintenanceRecord] = useState<MaintenanceRecord | null>(null);
  const [showMaintenanceDetails, setShowMaintenanceDetails] = useState(false);

  useEffect(() => {
    loadVehicleDetails();
  }, [vehicleId]);

  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      const [vehicleData, maintenanceData, vehiclePhotos] = await Promise.all([
        apiService.getVehicles(),
        apiService.getMaintenanceRecords(),
        apiService.getVehiclePhotos(vehicleId).catch(() => [])
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
      setPhotos(vehiclePhotos);
    } catch (error) {
      console.error('Error loading vehicle details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'תקין': return 'bg-green-100 text-green-800';
      case 'דורש טיפול': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const shareVehicleDetails = async () => {
    const vehicleUrl = `${window.location.origin}/vehicle/${vehicleId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `פרטי רכב ${vehicle?.plateNumber}`,
          text: `צפה בפרטי רכב ${vehicle?.plateNumber} - ${vehicle?.model}`,
          url: vehicleUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(vehicleUrl);
      alert('הקישור הועתק ללוח');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        apiService.uploadPhoto(file, vehicleId)
      );
      
      await Promise.all(uploadPromises);
      await loadVehicleDetails(); // Reload to get updated photos
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('שגיאה בהעלאת התמונות');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תמונה זו?')) return;
    
    try {
      await apiService.deletePhoto(photoId);
      await loadVehicleDetails(); // Reload to get updated photos
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('שגיאה במחיקת התמונה');
    }
  };

  const handleMaintenanceRecordClick = (record: MaintenanceRecord) => {
    setSelectedMaintenanceRecord(record);
    setShowMaintenanceDetails(true);
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
          <Button onClick={onBack}>חזרה</Button>
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
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                חזרה
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">פרטי רכב - {vehicle.plateNumber}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={shareVehicleDetails} className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                שתף
              </Button>
              <Badge className={getStatusColor(vehicle.maintenanceStatus)}>
                {vehicle.maintenanceStatus}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Maintenance Record Details Dialog */}
      <Dialog open={showMaintenanceDetails} onOpenChange={setShowMaintenanceDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>פרטי פעולת תחזוקה</DialogTitle>
          </DialogHeader>
          {selectedMaintenanceRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">רכב:</span>
                  <p className="text-sm">{selectedMaintenanceRecord.vehiclePlateNumber}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">סוג פעולה:</span>
                  <p className="text-sm">{selectedMaintenanceRecord.serviceType}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">תאריך:</span>
                  <p className="text-sm">{new Date(selectedMaintenanceRecord.date).toLocaleDateString('he-IL')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">עלות:</span>
                  <p className="text-sm">{selectedMaintenanceRecord.cost ? `₪${selectedMaintenanceRecord.cost.toLocaleString()}` : 'לא צוין'}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">סטטוס:</span>
                <Badge className={selectedMaintenanceRecord.completed ? 'bg-green-100 text-green-800 ml-2' : 'bg-yellow-100 text-yellow-800 ml-2'}>
                  {selectedMaintenanceRecord.completed ? 'הושלם' : 'בתהליך'}
                </Badge>
              </div>
              
              {selectedMaintenanceRecord.tasks && selectedMaintenanceRecord.tasks.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">משימות:</span>
                  <div className="mt-2 space-y-1">
                    {selectedMaintenanceRecord.tasks.map(task => (
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
              
              {selectedMaintenanceRecord.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">הערות:</span>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{selectedMaintenanceRecord.notes}</p>
                </div>
              )}
              
              {selectedMaintenanceRecord.receiptImage && (
                <div>
                  <span className="text-sm font-medium text-gray-700">קבלה:</span>
                  <div className="mt-2">
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Upload className="w-3 h-3" />
                      {selectedMaintenanceRecord.receiptImage}
                    </Badge>
                  </div>
                </div>
              )}
              
              {selectedMaintenanceRecord.photos && selectedMaintenanceRecord.photos.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">תמונות ({selectedMaintenanceRecord.photos.length}):</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {selectedMaintenanceRecord.photos.map((photo, index) => (
                      <div key={index} className="relative bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={photo.url} 
                          alt={photo.filename}
                          className="w-full h-24 object-cover"
                        />
                        <div className="p-1">
                          <span className="text-xs text-gray-600">{photo.filename}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowMaintenanceDetails(false)}
                >
                  סגור
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vehicle Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Vehicle Info */}
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
                  {vehicle.vin && (
                    <div>
                      <p className="text-sm text-gray-600">מספר שלדה</p>
                      <p className="font-semibold">{vehicle.vin}</p>
                    </div>
                  )}
                  {vehicle.mileage && (
                    <div>
                      <p className="text-sm text-gray-600">קילומטראז'</p>
                      <p className="font-semibold">{vehicle.mileage.toLocaleString()} ק"מ</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code */}
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
                      סרוק לצפייה בפרטי הרכב
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Photos Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                צילומים
              </CardTitle>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploading}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          מעלה...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          העלה תמונות
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {photos.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">אין תמונות עדיין</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative bg-white border rounded-lg overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {new Date(photo.uploadDate).toLocaleDateString('he-IL')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      {photo.maintenanceAction && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Wrench className="w-3 h-3" />
                          {photo.maintenanceAction}
                        </div>
                      )}
                      {photo.description && (
                        <p className="text-xs text-gray-600 mt-1">{photo.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              היסטוריית טיפולים
            </CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceRecords.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">אין רישומי טיפול עדיין</p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceRecords.map((record) => (
                  <div 
                    key={record.id} 
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all"
                    onClick={() => handleMaintenanceRecordClick(record)}
                  >
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
                      <p className="text-gray-700 bg-gray-50 p-3 rounded mb-3">
                        {record.notes}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                      לחץ לצפייה בפרטים המלאים
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleDetails;