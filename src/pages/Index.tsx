
import React, { useState, useEffect } from 'react';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import VehicleManagement from '@/components/VehicleManagement';
import VehicleDetailsSidebar from '@/components/VehicleDetailsSidebar';
import Maintenance from '@/components/Maintenance';
import PublicForm from '@/components/PublicForm';
import Calendar from '@/components/Calendar';
import Reports from '@/components/Reports';
import History from '@/components/History';

type Page = 'login' | 'dashboard' | 'vehicles' | 'vehicle-details' | 'maintenance' | 'reports' | 'calendar' | 'history' | 'public-form';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    if (page === 'public-form') {
      setCurrentPage('public-form');
    } else if (isLoggedIn) {
      setCurrentPage(page as Page);
    } else {
      setCurrentPage('login');
    }
  };

  const handleBack = () => {
    console.log('handleBack called, currentPage:', currentPage, 'isLoggedIn:', isLoggedIn);
    
    if (currentPage === 'public-form') {
      setCurrentPage(isLoggedIn ? 'dashboard' : 'login');
    } else if (currentPage === 'vehicle-details') {
      setCurrentPage('vehicles');
      setSelectedVehicleId(null);
    } else if (isLoggedIn) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  };

  const handleNavigateToVehicleDetails = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setCurrentPage('vehicle-details');
  };

  // Render different pages based on current state
  switch (currentPage) {
    case 'login':
      return <Login onLogin={handleLogin} />;
    
    case 'dashboard':
      return <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
    
    case 'vehicles':
      return <VehicleManagement onBack={handleBack} onNavigateToVehicleDetails={handleNavigateToVehicleDetails} />;
    
    case 'vehicle-details':
      return selectedVehicleId ? (
        <VehicleDetailsSidebar 
          vehicleId={selectedVehicleId} 
          onBack={handleBack} 
          onVehicleChange={handleNavigateToVehicleDetails}
        />
      ) : (
        <VehicleManagement onBack={handleBack} onNavigateToVehicleDetails={handleNavigateToVehicleDetails} />
      );
    
    case 'maintenance':
      console.log('Rendering maintenance page');
      return <Maintenance onBack={handleBack} />;
    
    case 'reports':
      return <Reports onBack={handleBack} />;
    
    case 'calendar':
      return <Calendar onBack={handleBack} />;
    
    case 'history':
      return <History onBack={handleBack} />;
    
    case 'public-form':
      return <PublicForm onBack={handleBack} />;
    
    default:
      return <Login onLogin={handleLogin} />;
  }
};

export default Index;
