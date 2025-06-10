import React from 'react';

const FinalWeightCard = ({ 
  packageWeight,
  className
}) => {
  return (
    <div className={`mt-6 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-xs transition-all hover:shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center mb-1">
            <ScaleIcon className="w-5 h-5 mr-2 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">
              {packageWeight} kg
            </h3>
          </div>
          <p className="text-sm text-green-700 pl-7">
            Final Package Weight
          </p>
        </div>
       </div>
      

    </div>
  );
};

// Sub-component for the scale icon
const ScaleIcon = ({ className = '' }) => (
  <svg 
    className={className}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={1.5} 
      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" 
    />
  </svg>
);

// Sub-component for the info icon
const InfoIcon = ({ className = '' }) => (
  <svg 
    className={className}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
);



export default FinalWeightCard;