import React from "react";

const TotalShipmentCard = ({weightInputs, totalWeight}) => {
  return (
    <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-xs transition-all hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center mb-1">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
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
            <h3 className="text-lg font-semibold text-blue-900">
              {totalWeight.toFixed(2)} kg
            </h3>
          </div>
          <p className="text-sm text-blue-700 pl-7">Total shipment weight</p>
        </div>

        <div className="bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-inner">
          <p className="text-xs font-medium text-blue-600">
            {weightInputs.length} package{weightInputs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TotalShipmentCard;
