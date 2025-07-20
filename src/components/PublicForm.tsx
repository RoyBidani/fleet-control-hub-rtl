
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Camera, QrCode, ArrowRight, CheckCircle, Gauge, X, Scan, Car } from 'lucide-react';
import { apiService } from '../services/api';

interface PublicFormProps {
  onBack: () => void;
}

const PublicForm: React.FC<PublicFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    barcode: '',
    images: [] as File[],
    mileage: '',
    feature: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    driverName: '',
    notes: ''
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showVehicleSelection, setShowVehicleSelection] = useState(false);

  React.useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const vehiclesList = await apiService.getVehicles();
      setVehicles(vehiclesList);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...formData.images, ...files];
    setFormData({...formData, images: newImages});
    
    // Create previews for new images
    const newPreviews = [...imagePreviews];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newPreviews.push(event.target?.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({...formData, images: newImages});
    setImagePreviews(newPreviews);
  };

  const startQrScanning = async () => {
    try {
      setShowQrScanner(true);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      // For now, use a simple prompt as a fallback
      // In a real implementation, you would integrate a QR scanner library
      const scannedCode = prompt('אנא הזן את הברקוד שסרקתם:');
      if (scannedCode) {
        setFormData({...formData, barcode: scannedCode});
        setAlert({ type: 'success', message: 'ברקוד נקלט בהצלחה!' });
        setTimeout(() => setAlert(null), 3000);
      }
      
      // Stop camera
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      // If camera access fails, show vehicle selection dialog
      setShowVehicleSelection(true);
    } finally {
      setShowQrScanner(false);
    }
  };

  const handleVehicleSelect = (vehicle: any) => {
    setFormData({...formData, barcode: vehicle.barcode});
    setShowVehicleSelection(false);
    setAlert({ type: 'success', message: `רכב נבחר: ${vehicle.plateNumber}` });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newReport = {
        barcode: formData.barcode,
        images: formData.images.map(img => img.name),
        mileage: formData.mileage,
        feature: formData.feature,
        date: formData.date,
        time: formData.time,
        driverName: formData.driverName,
        notes: formData.notes,
        status: 'new'
      };
      
      await apiService.createPublicReport(newReport);
      setAlert({ type: 'success', message: 'הדיווח נשלח בהצלחה! תודה על התרומה לבטיחות הצי.' });
      
      // Reset form
      setFormData({
        barcode: '',
        images: [],
        mileage: '',
        feature: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        driverName: '',
        notes: ''
      });
      setImagePreviews([]);

      setTimeout(() => setAlert(null), 5000);
    } catch (error) {
      console.error('Error submitting report:', error);
      setAlert({ type: 'error', message: 'שגיאה בשליחת הדיווח' });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    'נסיעה רגילה',
    'הסעת אורחים',
    'משלוח דחוף',
    'פרויקט מיוחד',
    'אימון נהיגה',
    'תחזוקה שוטפת',
    'אחר'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                חזרה לדף הבית
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">טופס דיווח ציבורי</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Vehicle Selection Dialog */}
      <Dialog open={showVehicleSelection} onOpenChange={setShowVehicleSelection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>בחר רכב</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              לא ניתן לגשת למצלמה לסריקת ברקוד. אנא בחר את הרכב מהרשימה:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{vehicle.plateNumber}</p>
                      <p className="text-sm text-gray-600">{vehicle.model}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {vehicle.barcode}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowVehicleSelection(false)}
                className="flex-1"
              >
                ביטול
              </Button>
              <Button 
                onClick={() => {
                  const manualCode = prompt('אנא הזן את הברקוד ידנית:');
                  if (manualCode) {
                    setFormData({...formData, barcode: manualCode});
                    setShowVehicleSelection(false);
                    setAlert({ type: 'success', message: 'ברקוד נקלט בהצלחה!' });
                    setTimeout(() => setAlert(null), 3000);
                  }
                }}
                className="flex-1"
              >
                הזן ידנית
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <Card className="fleet-card fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">דיווח מצב רכב</CardTitle>
            <CardDescription className="text-lg">
              טופס זה מיועד לכלל הנהגים לדיווח על מצב הרכב לפני/אחרי השימוש
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Identification */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  זיהוי רכב
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="barcode">ברקוד רכב *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      placeholder="סרקו או הזינו את הברקוד"
                      required
                      className="text-right flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={startQrScanning}
                      className="flex items-center gap-2 px-3"
                      disabled={showQrScanner}
                    >
                      <Scan className="w-4 h-4" />
                      {showQrScanner ? 'סורק...' : 'סרוק'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowVehicleSelection(true)}
                      className="flex items-center gap-2 px-3"
                    >
                      <Car className="w-4 h-4" />
                      בחר
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    ניתן למצוא את הברקוד על לוח המכוונים או על מפתח הרכב, או ללחוץ על "סרוק QR" לסריקה
                  </p>
                </div>
              </div>

              {/* Vehicle Photos */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  צילומי רכב
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="images">צלמו את הרכב (ניתן להעלות מספר תמונות)</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="text-right"
                  />
                  
                  {/* Display selected images with previews */}
                  {formData.images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-green-600">תמונות שנבחרו:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative bg-white rounded-lg border overflow-hidden">
                            {imagePreviews[index] && (
                              <div className="aspect-video bg-gray-100">
                                <img 
                                  src={imagePreviews[index]} 
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 truncate">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeImage(index)}
                                  className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-600">
                    צלמו את הרכב מזוויות שונות לתיעוד מצבו הנוכחי
                  </p>
                </div>
              </div>

              {/* Mileage and Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mileage" className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    מד מרחק (ק"מ) *
                  </Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                    placeholder="123456"
                    required
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feature">תכונה/פרויקט/נסיעה *</Label>
                  <select
                    id="feature"
                    value={formData.feature}
                    onChange={(e) => setFormData({...formData, feature: e.target.value})}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md text-right"
                  >
                    <option value="">בחרו סוג נסיעה</option>
                    {features.map(feature => (
                      <option key={feature} value={feature}>{feature}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">תאריך *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">שעה *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverName">שם נהג *</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                  placeholder="הזינו את שמכם המלא"
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">הערות ובעיות שזוהו</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="תארו כל בעיה או ליקוי שזיהיתם ברכב..."
                  className="text-right"
                  rows={4}
                />
                <p className="text-xs text-gray-600">
                  אנא דווחו על כל דבר חריג שהבחנתם בו: רעשים, נוריות אזהרה, בעיות בהיגוי וכו'
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  type="submit" 
                  className="w-full fleet-btn fleet-secondary text-white py-3 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="spinner"></div>
                      שולח דיווח...
                    </div>
                  ) : (
                    'שלח דיווח'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6 fleet-card bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h4 className="font-semibold text-blue-800 mb-3">חשוב לדעת:</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• דיווח זה עוזר לנו לשמור על בטיחות הצי ולתכנן תחזוקה מונעת</li>
              <li>• אנא דווחו על כל בעיה או ליקוי, גם קטן</li>
              <li>• ניתן להעלות מספר תמונות לתיעוד טוב יותר</li>
              <li>• הדיווח נשמר במערכת ומתבצע עליו מעקב</li>
              <li>• במקרה חירום או בעיה חמורה, צרו קשר מיידי עם המוקד</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicForm;
