
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Wrench, Car, Bell, Repeat } from 'lucide-react';
import { apiService } from '../services/api';

interface CalendarProps {
  onBack: () => void;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'maintenance' | 'inspection' | 'service';
  vehicleNumber: string;
  description?: string;
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
}

const Calendar: React.FC<CalendarProps> = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showEditEventDialog, setShowEditEventDialog] = useState(false);
  const [editEvent, setEditEvent] = useState({
    id: '',
    title: '',
    date: '',
    time: '',
    type: 'maintenance' as 'maintenance' | 'inspection' | 'service',
    vehicleId: '',
    description: '',
    alertEnabled: false,
    alertTime: '15',
    isRecurring: false,
    recurrenceType: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurrenceInterval: 1,
    recurrenceEndDate: ''
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'maintenance' as 'maintenance' | 'inspection' | 'service',
    vehicleId: '',
    description: '',
    alertEnabled: false,
    alertTime: '15',
    isRecurring: false,
    recurrenceType: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurrenceInterval: 1,
    recurrenceEndDate: ''
  });

  useEffect(() => {
    loadCalendarEvents();
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

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      const [maintenanceRecords, calendarEvents] = await Promise.all([
        apiService.getMaintenanceRecords(),
        apiService.getCalendarEvents()
      ]);
      
      const maintenanceEvents: Event[] = maintenanceRecords.map(record => ({
        id: record.id,
        title: record.serviceType,
        date: new Date(record.date),
        type: 'maintenance',
        vehicleNumber: record.vehiclePlateNumber,
        description: record.notes
      }));

      const calendarEventsConverted: Event[] = calendarEvents.map(event => {
        const vehicle = vehicles.find(v => v.id === event.vehicleId);
        return {
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          type: event.type as 'maintenance' | 'inspection' | 'service',
          vehicleNumber: vehicle ? vehicle.plateNumber : 'N/A',
          description: event.description
        };
      });

      setEvents([...maintenanceEvents, ...calendarEventsConverted]);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (event: Event) => {
    const eventDate = new Date(event.date);
    setEditEvent({
      id: event.id,
      title: event.title,
      date: eventDate.toISOString().split('T')[0],
      time: eventDate.toTimeString().slice(0, 5),
      type: event.type,
      vehicleId: vehicles.find(v => v.plateNumber === event.vehicleNumber)?.id || '',
      description: event.description || '',
      alertEnabled: false,
      alertTime: '15',
      isRecurring: false,
      recurrenceType: 'weekly',
      recurrenceInterval: 1,
      recurrenceEndDate: ''
    });
    setShowEventDetails(false);
    setShowEditEventDialog(true);
  };

  const handleUpdateEvent = async () => {
    try {
      // Validate required fields
      if (!editEvent.title.trim()) {
        alert('אנא הזן כותרת לאירוע');
        return;
      }
      
      if (!editEvent.date) {
        alert('אנא בחר תאריך לאירוע');
        return;
      }
      
      if (!editEvent.vehicleId) {
        alert('אנא בחר רכב');
        return;
      }
      
      const eventData = {
        title: editEvent.title,
        date: editEvent.time ? `${editEvent.date}T${editEvent.time}:00.000Z` : `${editEvent.date}T09:00:00.000Z`,
        type: editEvent.type,
        vehicleId: editEvent.vehicleId,
        description: editEvent.description,
        alertEnabled: editEvent.alertEnabled,
        alertTime: editEvent.alertTime,
        isRecurring: editEvent.isRecurring,
        recurrenceType: editEvent.recurrenceType,
        recurrenceInterval: editEvent.recurrenceInterval,
        recurrenceEndDate: editEvent.recurrenceEndDate
      };
      
      console.log('Updating calendar event:', eventData);
      await apiService.updateCalendarEvent(editEvent.id, eventData);
      await loadCalendarEvents();
      setShowEditEventDialog(false);
      
      alert('האירוע עודכן בהצלחה!');
    } catch (error) {
      console.error('Error updating calendar event:', error);
      alert('שגיאה בעדכון האירוע: ' + error.message);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('האם אתם בטוחים שברצונכם למחוק את האירוע?')) {
      try {
        await apiService.deleteCalendarEvent(eventId);
        await loadCalendarEvents();
        setShowEventDetails(false);
        alert('האירוע נמחק בהצלחה!');
      } catch (error) {
        console.error('Error deleting calendar event:', error);
        alert('שגיאה במחיקת האירוע: ' + error.message);
      }
    }
  };

  const handleAddEvent = async () => {
    try {
      // Validate required fields
      if (!newEvent.title.trim()) {
        alert('אנא הזן כותרת לאירוע');
        return;
      }
      
      if (!newEvent.date) {
        alert('אנא בחר תאריך לאירוע');
        return;
      }
      
      if (!newEvent.vehicleId) {
        alert('אנא בחר רכב');
        return;
      }
      
      const eventData = {
        title: newEvent.title,
        date: newEvent.time ? `${newEvent.date}T${newEvent.time}:00.000Z` : `${newEvent.date}T09:00:00.000Z`,
        type: newEvent.type,
        vehicleId: newEvent.vehicleId,
        description: newEvent.description,
        alertEnabled: newEvent.alertEnabled,
        alertTime: newEvent.alertTime,
        isRecurring: newEvent.isRecurring,
        recurrenceType: newEvent.recurrenceType,
        recurrenceInterval: newEvent.recurrenceInterval,
        recurrenceEndDate: newEvent.recurrenceEndDate
      };
      
      console.log('Creating calendar event:', eventData);
      await apiService.createCalendarEvent(eventData);
      await loadCalendarEvents();
      setShowAddEventDialog(false);
      setNewEvent({
        title: '',
        date: '',
        time: '',
        type: 'maintenance',
        vehicleId: '',
        description: '',
        alertEnabled: false,
        alertTime: '15',
        isRecurring: false,
        recurrenceType: 'weekly',
        recurrenceInterval: 1,
        recurrenceEndDate: ''
      });
      
      alert('האירוע נוסף בהצלחה!');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      alert('שגיאה ביצירת האירוע: ' + error.message);
    }
  };

  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'inspection': return 'bg-red-100 text-red-800';
      case 'service': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return Wrench;
      case 'inspection': return Car;
      case 'service': return CalendarIcon;
      default: return CalendarIcon;
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div key={day} className={`h-24 border border-gray-100 p-1 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => {
              const IconComponent = getTypeIcon(event.type);
              return (
                <div
                  key={event.id}
                  className={`text-xs p-2 rounded flex flex-col gap-1 cursor-pointer hover:shadow-md hover:scale-105 transition-all ${getTypeColor(event.type)}`}
                  title={`${event.title} - ${event.description || 'אין תיאור'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <IconComponent className="w-3 h-3" />
                    <span className="truncate text-xs">{event.title}</span>
                  </div>
                  <span className="text-xs text-gray-600">{event.vehicleNumber}</span>
                </div>
              );
            })}
            {dayEvents.length > 2 && (
              <div 
                className="text-xs text-gray-500 cursor-pointer hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Show all events for this day
                  if (dayEvents.length > 0) {
                    handleEventClick(dayEvents[0]); // Show first event as example
                  }
                }}
              >
                +{dayEvents.length - 2} נוספים
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
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
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">לוח שנה</h1>
            </div>
            <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4" />
                  הוסף אירוע
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>הוספת אירוע חדש</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">כותרת</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="כותרת האירוע"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">תאריך</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">שעה</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="type">סוג</Label>
                    <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סוג אירוע" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">תחזוקה</SelectItem>
                        <SelectItem value="inspection">בדיקה</SelectItem>
                        <SelectItem value="service">שירות</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vehicle">רכב</Label>
                    <Select value={newEvent.vehicleId} onValueChange={(value) => setNewEvent({...newEvent, vehicleId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר רכב" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNumber} - {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">תיאור</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="תיאור האירוע"
                    />
                  </div>

                  {/* Alert Settings */}
                  <div className="space-y-3 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="alertEnabled"
                        checked={newEvent.alertEnabled}
                        onCheckedChange={(checked) => setNewEvent({...newEvent, alertEnabled: checked as boolean})}
                      />
                      <Label htmlFor="alertEnabled" className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        הפעל התרעה
                      </Label>
                    </div>
                    
                    {newEvent.alertEnabled && (
                      <div>
                        <Label htmlFor="alertTime">זמן התרעה (דקות לפני)</Label>
                        <Select value={newEvent.alertTime} onValueChange={(value) => setNewEvent({...newEvent, alertTime: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="בחר זמן התרעה" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 דקות</SelectItem>
                            <SelectItem value="15">15 דקות</SelectItem>
                            <SelectItem value="30">30 דקות</SelectItem>
                            <SelectItem value="60">שעה</SelectItem>
                            <SelectItem value="1440">יום</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Recurring Settings */}
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isRecurring"
                        checked={newEvent.isRecurring}
                        onCheckedChange={(checked) => setNewEvent({...newEvent, isRecurring: checked as boolean})}
                      />
                      <Label htmlFor="isRecurring" className="flex items-center gap-2">
                        <Repeat className="w-4 h-4" />
                        אירוע חוזר
                      </Label>
                    </div>
                    
                    {newEvent.isRecurring && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="recurrenceType">סוג חזרה</Label>
                          <Select value={newEvent.recurrenceType} onValueChange={(value) => setNewEvent({...newEvent, recurrenceType: value as any})}>
                            <SelectTrigger>
                              <SelectValue placeholder="בחר סוג חזרה" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">יומי</SelectItem>
                              <SelectItem value="weekly">שבועי</SelectItem>
                              <SelectItem value="monthly">חודשי</SelectItem>
                              <SelectItem value="yearly">שנתי</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="recurrenceInterval">מרווח חזרה</Label>
                          <Input
                            id="recurrenceInterval"
                            type="number"
                            min="1"
                            value={newEvent.recurrenceInterval}
                            onChange={(e) => setNewEvent({...newEvent, recurrenceInterval: parseInt(e.target.value) || 1})}
                            placeholder="כל כמה..."
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="recurrenceEndDate">תאריך סיום (אופציונלי)</Label>
                          <Input
                            id="recurrenceEndDate"
                            type="date"
                            value={newEvent.recurrenceEndDate}
                            onChange={(e) => setNewEvent({...newEvent, recurrenceEndDate: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddEvent} className="flex-1">
                      הוסף אירוע
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddEventDialog(false)}>
                      ביטול
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Edit Event Dialog */}
            <Dialog open={showEditEventDialog} onOpenChange={setShowEditEventDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>עריכת אירוע</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">כותרת</Label>
                    <Input
                      id="edit-title"
                      value={editEvent.title}
                      onChange={(e) => setEditEvent({...editEvent, title: e.target.value})}
                      placeholder="כותרת האירוע"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-date">תאריך</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={editEvent.date}
                        onChange={(e) => setEditEvent({...editEvent, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-time">שעה</Label>
                      <Input
                        id="edit-time"
                        type="time"
                        value={editEvent.time}
                        onChange={(e) => setEditEvent({...editEvent, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-type">סוג</Label>
                    <Select value={editEvent.type} onValueChange={(value) => setEditEvent({...editEvent, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סוג אירוע" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">תחזוקה</SelectItem>
                        <SelectItem value="inspection">בדיקה</SelectItem>
                        <SelectItem value="service">שירות</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-vehicle">רכב</Label>
                    <Select value={editEvent.vehicleId} onValueChange={(value) => setEditEvent({...editEvent, vehicleId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר רכב" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNumber} - {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-description">תיאור</Label>
                    <Textarea
                      id="edit-description"
                      value={editEvent.description}
                      onChange={(e) => setEditEvent({...editEvent, description: e.target.value})}
                      placeholder="תיאור האירוע"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateEvent} className="flex-1">
                      עדכן אירוע
                    </Button>
                    <Button variant="outline" onClick={() => setShowEditEventDialog(false)}>
                      ביטול
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Event Details Dialog */}
            <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>פרטי האירוע</DialogTitle>
                </DialogHeader>
                {selectedEvent && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                      <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">תאריך:</span>
                        <p className="text-sm">{selectedEvent.date.toLocaleDateString('he-IL')}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">שעה:</span>
                        <p className="text-sm">{selectedEvent.date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">סוג:</span>
                        <Badge className={`ml-2 ${getTypeColor(selectedEvent.type)}`}>
                          {selectedEvent.type === 'maintenance' ? 'תחזוקה' : 
                           selectedEvent.type === 'inspection' ? 'בדיקה' : 'שירות'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">רכב:</span>
                        <p className="text-sm">{selectedEvent.vehicleNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-2 pt-4">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleEditEvent(selectedEvent)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          ערוך
                        </Button>
                        <Button 
                          onClick={() => handleDeleteEvent(selectedEvent.id)}
                          variant="outline"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          מחק
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowEventDetails(false)}
                      >
                        סגור
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-0">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-gray-50">
              {dayNames.map(day => (
                <div key={day} className="p-4 text-center font-medium text-gray-600 border-b">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {renderCalendarDays()}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>אירועים קרובים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-4">אין אירועים קרובים</p>
              ) : (
                events
                  .filter(event => event.date >= new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map(event => {
                    const IconComponent = getTypeIcon(event.type);
                    return (
                      <div 
                        key={event.id} 
                        className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(event.type)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{event.vehicleNumber}</Badge>
                            <span className="text-sm text-gray-500">
                              {event.date.toLocaleDateString('he-IL')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
