import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Calendar, User, Car, Camera, MapPin, FileText, Eye, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiService } from '../services/api';

interface HistoryProps {
  onBack: () => void;
}

interface PublicFormEntry {
  id: string;
  timestamp: Date;
  driverName: string;
  barcode: string;
  distance: string;
  feature: string;
  project: string;
  trip: string;
  images?: string[];
  notes?: string;
  status: 'new' | 'reviewed' | 'processed';
}

const History: React.FC<HistoryProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [entries, setEntries] = useState<PublicFormEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<PublicFormEntry | null>(null);
  const [showEntryDetails, setShowEntryDetails] = useState(false);

  useEffect(() => {
    loadHistoryEntries();
  }, []);

  const loadHistoryEntries = async () => {
    try {
      setLoading(true);
      const reports = await apiService.getPublicReports();
      const entriesWithDates = reports.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.submittedAt || entry.timestamp),
        project: entry.feature || 'לא צוין',
        trip: entry.feature || 'לא צוין',
        images: entry.images || [],
        distance: entry.mileage || '0',
        driverName: entry.driverName || 'לא צוין'
      }));
      setEntries(entriesWithDates);
    } catch (error) {
      console.error('Error loading history entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'חדש';
      case 'reviewed': return 'נבדק';
      case 'processed': return 'טופל';
      default: return 'לא ידוע';
    }
  };

  const updateEntryStatus = async (id: string, newStatus: 'new' | 'reviewed' | 'processed') => {
    try {
      await apiService.updatePublicReport(id, { status: newStatus });
      await loadHistoryEntries();
    } catch (error) {
      console.error('Error updating entry status:', error);
    }
  };

  const handleEntryClick = (entry: PublicFormEntry) => {
    setSelectedEntry(entry);
    setShowEntryDetails(true);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      (entry.driverName && entry.driverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.barcode && entry.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.project && entry.project.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: entries.length,
    new: entries.filter(e => e.status === 'new').length,
    reviewed: entries.filter(e => e.status === 'reviewed').length,
    processed: entries.filter(e => e.status === 'processed').length,
  };

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
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">היסטוריית טפסים</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-blue-600">
                סה"כ: {entries.length} טפסים
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Entry Details Dialog */}
      <Dialog open={showEntryDetails} onOpenChange={setShowEntryDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>פרטי הדיווח</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">שם נהג:</span>
                  <p className="text-sm">{selectedEntry.driverName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">ברקוד:</span>
                  <p className="text-sm">{selectedEntry.barcode}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">תאריך:</span>
                  <p className="text-sm">{selectedEntry.timestamp.toLocaleString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">מד מרחק:</span>
                  <p className="text-sm">{selectedEntry.distance} ק"מ</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">תכונה:</span>
                  <p className="text-sm">{selectedEntry.project}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">סטטוס:</span>
                  <Badge className={`ml-2 ${getStatusColor(selectedEntry.status)}`}>
                    {getStatusText(selectedEntry.status)}
                  </Badge>
                </div>
              </div>
              
              {selectedEntry.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">הערות:</span>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{selectedEntry.notes}</p>
                </div>
              )}
              
              {selectedEntry.images && selectedEntry.images.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">תמונות ({selectedEntry.images.length}):</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {selectedEntry.images.map((imageName, index) => (
                      <div key={index} className="relative bg-gray-100 rounded-lg p-2 flex flex-col items-center justify-center min-h-20">
                        <Image className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-600 text-center break-all">{imageName}</span>
                        <div className="text-xs text-blue-600 mt-1">
                          תמונה זמינה
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * התמונות נשמרות במערכת אך טעינתן תתאפשר לאחר הגדרת אחסון מלא
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEntryDetails(false)}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('all')}>
            <CardContent className={`p-4 ${selectedStatus === 'all' ? 'bg-blue-50 border-blue-200' : ''}`}>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
                <p className="text-sm text-gray-600">כל הטפסים</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('new')}>
            <CardContent className={`p-4 ${selectedStatus === 'new' ? 'bg-blue-50 border-blue-200' : ''}`}>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{statusCounts.new}</p>
                <p className="text-sm text-gray-600">חדשים</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('reviewed')}>
            <CardContent className={`p-4 ${selectedStatus === 'reviewed' ? 'bg-blue-50 border-blue-200' : ''}`}>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.reviewed}</p>
                <p className="text-sm text-gray-600">נבדקו</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('processed')}>
            <CardContent className={`p-4 ${selectedStatus === 'processed' ? 'bg-blue-50 border-blue-200' : ''}`}>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{statusCounts.processed}</p>
                <p className="text-sm text-gray-600">טופלו</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="חיפוש לפי שם נהג, ברקוד או פרויקט..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">אין טפסים להצגה</h3>
                <p className="text-gray-600">לא נמצאו טפסים התואמים לחיפוש שלך.</p>
              </CardContent>
            </Card>
          ) : (
            filteredEntries.map(entry => (
              <Card 
                key={entry.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleEntryClick(entry)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{entry.driverName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {entry.timestamp.toLocaleString('he-IL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(entry.status)}>
                        {getStatusText(entry.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">ברקוד:</span>
                      <span className="text-sm font-medium">{entry.barcode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">מד מרחק:</span>
                      <span className="text-sm font-medium">{entry.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">תכונה:</span>
                      <span className="text-sm font-medium">{entry.project}</span>
                    </div>
                  </div>

                  {entry.notes && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">הערות:</span>
                      <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">{entry.notes}</p>
                    </div>
                  )}

                  {/* Images Display */}
                  {entry.images && entry.images.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-600 mb-2 block">תמונות שצורפו:</span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {entry.images.map((imageName, index) => (
                          <div key={index} className="relative bg-gray-100 rounded-lg p-3 flex items-center justify-center">
                            <Image className="w-8 h-8 text-gray-400" />
                            <span className="text-xs text-gray-600 mt-1 text-center">{imageName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                      {entry.status === 'new' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateEntryStatus(entry.id, 'reviewed');
                          }}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          סמן כנבדק
                        </Button>
                      )}
                      {entry.status === 'reviewed' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateEntryStatus(entry.id, 'processed');
                          }}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Eye className="w-4 h-4" />
                          סמן כטופל
                        </Button>
                      )}
                      {entry.status === 'processed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateEntryStatus(entry.id, 'reviewed');
                          }}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          סמן כנבדק
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEntryClick(entry);
                        }}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <FileText className="w-4 h-4" />
                        פרטים
                      </Button>
                    </div>
                    {entry.images && entry.images.length > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {entry.images.length} תמונות
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      לחץ על הכרטיס לצפייה בפרטים המלאים
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
