import React from "react";

const ShippingError = ({ error, onRetry }) => {
  return (
    <div className="p-8 flex justify-center items-center">
      <div className="flex flex-col gap-6 w-full">
        <h1 className="fontPoppins font-semibold text-black text-xl mb-10">
          Shipping Configuration
        </h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong>Error: </strong> {error}
          <button
            onClick={onRetry}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingError;