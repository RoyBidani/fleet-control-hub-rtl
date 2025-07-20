import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VehicleDetailsSidebar from '@/components/VehicleDetailsSidebar';

const VehicleDetailsPage = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleVehicleChange = (newVehicleId: string) => {
    navigate(`/vehicle/${newVehicleId}`);
  };

  if (!vehicleId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">רכב לא נמצא</h3>
          <p className="text-gray-600 mb-4">מזהה הרכב לא תקין</p>
          <button onClick={handleBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            חזרה לדף הבית
          </button>
        </div>
      </div>
    );
  }

  return (
    <VehicleDetailsSidebar 
      vehicleId={vehicleId} 
      onBack={handleBack}
      showBackButton={false}
      onVehicleChange={handleVehicleChange}
    />
  );
};

export default VehicleDetailsPage;