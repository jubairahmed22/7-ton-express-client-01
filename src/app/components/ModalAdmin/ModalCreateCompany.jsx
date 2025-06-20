"use client";
import React, { useEffect, useState } from "react";
import CreateCompanyForm from "../../Form/CreateCompanyForm";
import AllCompanyList from "../../components/Table/AllCompanyList";

const ModalCreateCompany = ({ isOpen, onClose, title, children, fetchData }) => {
  const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      if (isOpen) {
        setIsVisible(true);
      } else {
        const timer = setTimeout(() => setIsVisible(false), 300);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);
  
  if (!isVisible) return null;
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-[80%] h-[80%] flex flex-col overflow-hidden border border-gray-100 transform transition-all duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 cursor-pointer rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6 text-gray-500 hover:text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-2 gap-5 p-5">
           <div className="w-full">
             <CreateCompanyForm fetchData={fetchData}></CreateCompanyForm>
          </div>
           <div className="w-full">
             <AllCompanyList></AllCompanyList>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCreateCompany;
