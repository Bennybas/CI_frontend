import React from 'react';
import { RiseLoader } from 'react-spinners';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <RiseLoader color="#004567" loading={true} size={12} />
    </div>
  );
};

export default LoadingSpinner;