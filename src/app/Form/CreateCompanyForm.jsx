"use client";

import React, { useState, useCallback, useRef } from "react";
import axios from "axios";

const CreateCompanyForm = ({fetchData}) => {
  const [formData, setFormData] = useState({
    company: "",
    singleImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.match("image.*")) {
      setFormData((prev) => ({
        ...prev,
        singleImage: file,
      }));
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.match("image.*")) {
      setFormData((prev) => ({
        ...prev,
        singleImage: file,
      }));
    }
  }, []);

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.company);
      if (formData.singleImage) {
        formDataToSend.append("singleImage", formData.singleImage);
      }

      const response = await axios.post(
        "https://server-gs-two.vercel.app/create-company",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          company: "",
          singleImage: null,
        });
        fetchData()
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create company");
      console.error("Error creating company:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      singleImage: null,
    }));
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Company created successfully! The rate structure has been
          automatically generated.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="company">
            Company Name *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Company Logo</label>
          <div
            className={`border-2 cursor-pointer border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClickUpload}
          >
            {formData.singleImage ? (
              <div
                className="flex flex-col items-center"
                onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to parent
              >
                <div className="relative w-32 h-32 mb-4">
                  <img
                    src={URL.createObjectURL(formData.singleImage)}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-md"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.singleImage.name}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
            <input
              type="file"
              id="singleImage"
              name="singleImage"
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
              ref={fileInputRef}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.company}
          className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 ${
            loading || !formData.company ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </span>
          ) : (
            "Create Company"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateCompanyForm;
