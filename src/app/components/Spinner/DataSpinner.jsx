import React from "react";

const DataSpinner = () => {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div
        className="inline-block h-20 w-20 animate-spin rounded-full border-8 border-solid border-blue-600 border-e-transparent align-[-0.200em]  text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </div>
  );
};

export default DataSpinner;
