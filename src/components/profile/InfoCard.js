import React from 'react';

export const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3 p-3 bg-gray-50">
    <Icon className="w-5 h-5 text-gray-500 mt-0.5" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value || 'Not specified'}</p>
    </div>
  </div>
); 