
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, Plus, Edit, Trash2, ArrowRight, CheckCircle, AlertTriangle, QrCode, Eye } from 'lucide-react';
import { apiService, Vehicle } from '../services/api';
import QRCode from 'qrcode';

interface VehicleManagementProps {
  onBack: () => void;
  onNavigateToVehicleDetails?: (vehicleId: string) => void;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ onBack, onNavigateToVehicleDetails }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    plateNumber: '',
    model: '',
    barcode: '',
    maintenanceStatus: 'תקין' as 'תקין' | 'דורש טיפול'
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehicleData = await apiService.getVehicles();
      setVehicles(vehicleData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setAlert({ type: 'error', message: 'שגיאה בטעינת הרכבים' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingVehicle) {
        // Update existing vehicle
        await apiService.updateVehicle(editingVehicle.id, formData);
        setAlert({ type: 'success', message: 'הרכב עודכן בהצלחה!' });
        setEditingVehicle(null);
      } else {
        // Add new vehicle
        const newVehicle = await apiService.createVehicle(formData);
        
        // Generate QR code for the new vehicle
        const vehicleUrl = `${window.location.origin}/vehicle/${newVehicle.id}`;
        await QRCode.toDataURL(vehicleUrl);
        
        setAlert({ type: 'success', message: 'הרכב נוסף בהצלחה! נוצר QR Code עבור הרכב.' });
      }

      // Reload vehicles from server
      await loadVehicles();
      
      setFormData({
        plateNumber: '',
        model: '',
        barcode: '',
        maintenanceStatus: 'תקין'
      });
      setShowAddForm(false);

      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setAlert({ type: 'error', message: 'שגיאה בשמירת הרכב' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      barcode: vehicle.barcode,
      maintenanceStatus: vehicle.maintenanceStatus
    });
    setShowAddForm(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (confirm('האם אתם בטוחים שברצונכם למחוק את הרכב?')) {
      try {
        setLoading(true);
        await apiService.deleteVehicle(vehicleId);
        await loadVehicles();
        setAlert({ type: 'success', message: 'הרכב נמחק בהצלחה!' });
        setTimeout(() => setAlert(null), 3000);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setAlert({ type: 'error', message: 'שגיאה במחיקת הרכב' });
        setTimeout(() => setAlert(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingVehicle(null);
    setFormData({
      plateNumber: '',
      model: '',
      barcode: '',
      maintenanceStatus: 'תקין'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
              <Car className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ניהול רכבים</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Add Vehicle Button */}
        {!showAddForm && (
          <div className="mb-6">
            <Button 
              onClick={() => setShowAddForm(true)}
              className="fleet-btn fleet-primary text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              הוסף רכב חדש
            </Button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8 fleet-card fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                {editingVehicle ? 'עריכת רכב' : 'הוספת רכב חדש'}
              </CardTitle>
              <CardDescription>
                {editingVehicle ? 'עדכנו את פרטי הרכב' : 'הזינו את פרטי הרכב החדש'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plateNumber">מספר רכב</Label>
                    <Input
                      id="plateNumber"
                      value={formData.plateNumber}
                      onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                      placeholder="123-45-678"
                      required
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">דגם</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      placeholder="טויוטה קורולה"
                      required
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="barcode">ברקוד</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      placeholder="BAR001"
                      required
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceStatus">סטטוס תחזוקה</Label>
                    <Select 
                      value={formData.maintenanceStatus} 
                      onValueChange={(value: 'תקין' | 'דורש טיפול') => 
                        setFormData({...formData, maintenanceStatus: value})
                      }
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="תקין">תקין</SelectItem>
                        <SelectItem value="דורש טיפול">דורש טיפול</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="fleet-btn fleet-primary text-white" disabled={loading}>
                    {loading ? 'מעבד...' : editingVehicle ? 'עדכן רכב' : 'הוסף רכב'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                    ביטול
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Vehicles List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">רשימת רכבים ({vehicles.length})</h3>
          
          {loading ? (
            <Card className="fleet-card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">טוען רכבים...</p>
            </Card>
          ) : vehicles.length === 0 ? (
            <Card className="fleet-card text-center py-12">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">אין רכבים במערכת</p>
              <p className="text-sm text-gray-500">הוסיפו רכב חדש כדי להתחיל</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle, index) => (
                <Card 
                  key={vehicle.id} 
                  className={`fleet-card slide-in-right`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{vehicle.plateNumber}</CardTitle>
                        <CardDescription>{vehicle.model}</CardDescription>
                      </div>
                      <Badge 
                        variant={vehicle.maintenanceStatus === 'תקין' ? 'default' : 'destructive'}
                        className="flex items-center gap-1"
                      >
                        {vehicle.maintenanceStatus === 'תקין' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {vehicle.maintenanceStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><span className="font-medium">ברקוד:</span> {vehicle.barcode}</p>
                      <p><span className="font-medium">תאריך הוספה:</span> {vehicle.addedDate}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {onNavigateToVehicleDetails && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onNavigateToVehicleDetails(vehicle.id)}
                          className="flex items-center gap-1 flex-1"
                        >
                          <Eye className="w-3 h-3" />
                          פרטים
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(vehicle)}
                        className="flex items-center gap-1 flex-1"
                      >
                        <Edit className="w-3 h-3" />
                        עריכה
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(vehicle.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        מחיקה
                      </Button>
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

export default VehicleManagement;
