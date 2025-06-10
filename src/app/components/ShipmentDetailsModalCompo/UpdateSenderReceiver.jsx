"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import SenderInfo from "./SenderInfo";
import ReceiverInfo from "./ReceiverInfo";
import CalculationModal from "./CalculationModal";

const UpdateSenderReceiver = ({ shipment }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatePrice, setUpdatePrice] = useState(0);
  const [formData, setFormData] = useState({
    sender: {
      fullName: shipment?.sender?.fullName || "",
      email: shipment?.sender?.email || "",
      phone: shipment?.sender?.phone || "",
      address: shipment?.sender?.address || "",
      country: shipment?.sender?.country || "Bangladesh",
      countryCode: shipment?.sender?.countryCode || "BD",
      districtState: shipment?.sender?.districtState || "",
      pickupDateRange: {
        start: shipment?.sender?.pickupDateRange?.start
          ? new Date(shipment.sender.pickupDateRange.start)
          : null,
        end: shipment?.sender?.pickupDateRange?.end
          ? new Date(shipment.sender.pickupDateRange.end)
          : null,
      },
    },
    receiver: {
      fullName: shipment?.receiver?.fullName || "",
      email: shipment?.receiver?.email || "",
      phone: shipment?.receiver?.phone || "",
      address: shipment?.receiver?.address || "",
      country: shipment?.receiver?.country || "",
      countryCode: shipment?.receiver?.countryCode || "",
      stateCity: shipment?.receiver?.stateCity || "",
      zipCode: shipment?.receiver?.zipCode || "",
    },
    shipmentDetails: {
      goodsType: shipment?.shipmentDetails?.goodsType || [],
      company: shipment?.shipmentDetails?.company || "",
      price: shipment?.shipmentDetails?.price || 0,
      packageWeight: shipment?.shipmentDetails?.packageWeight || 0,
      totalWeight: shipment?.shipmentDetails?.totalWeight || 0,
      parcelType: shipment?.shipmentDetails?.parcelType || "",
      weightDetails: shipment?.shipmentDetails?.weightDetails || [],
    },
  });

  const [errors, setErrors] = useState({});
  const [missingFields, setMissingFields] = useState([]);
  const [receiverCountry, setReceiverCountry] = useState(
    shipment?.receiver?.countryCode || ""
  );
  const [receiverCountryName, setReceiverCountryName] = useState(
    shipment?.receiver?.country || ""
  );

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://server-7tons.vercel.app/api/countryList");
        const data = await response.json();
        if (data.success) {
          setCountries(data.data);
          // If we have a receiver country in shipment data, set it
          if (shipment?.receiver?.countryCode) {
            const receiverCountryData = data.data.find(
              (country) => country.code === shipment.receiver.countryCode
            );
            if (receiverCountryData) {
              setReceiverCountry(receiverCountryData.code);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, [shipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.includes(".") ? name.split(".") : [name];

    if (parent === "sender" || parent === "receiver") {
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCountryChange = (e, type) => {
    const selectedCountry = countries.find(
      (country) => country.name === e.target.value
    );

    if (selectedCountry) {
      setFormData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
        },
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "sender.fullName",
      "sender.email",
      "sender.phone",
      "sender.address",
      "sender.country",
      "sender.districtState",
      "receiver.fullName",
      "receiver.phone",
      "receiver.address",
      "receiver.country",
      "receiver.stateCity",
      "receiver.zipCode",
      "sender.pickupDateRange.start",
      "sender.pickupDateRange.end",
    ];

    // Check missing fields
    const missing = requiredFields.filter((field) => {
      const [parent, child, grandchild] = field.split(".");
      if (grandchild) {
        return !formData[parent][child][grandchild];
      }
      return !formData[parent][child];
    });
    setMissingFields(missing);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.sender.email && !emailRegex.test(formData.sender.email)) {
      newErrors.senderEmail = "Invalid email format";
    }
    if (formData.receiver.email && !emailRegex.test(formData.receiver.email)) {
      newErrors.receiverEmail = "Invalid email format";
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (formData.sender.phone && !phoneRegex.test(formData.sender.phone)) {
      newErrors.senderPhone = "Phone must be 10-15 digits";
    }
    if (formData.receiver.phone && !phoneRegex.test(formData.receiver.phone)) {
      newErrors.receiverPhone = "Phone must be 10-15 digits";
    }

    // Zip code validation
    if (formData.receiver.zipCode && isNaN(formData.receiver.zipCode)) {
      newErrors.receiverZipCode = "Zip code must be a number";
    }

    // Date validation
    if (
      formData.sender.pickupDateRange.start &&
      formData.sender.pickupDateRange.end &&
      new Date(formData.sender.pickupDateRange.end) <
        new Date(formData.sender.pickupDateRange.start)
    ) {
      newErrors.endDate = "End date cannot be before start date";
    }

    setErrors(newErrors);
    return missing.length === 0 && Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://server-7tons.vercel.app/api/update-inter-shipment/${shipment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            sender: {
              ...formData.sender,
              pickupDateRange: {
                start: formData.sender.pickupDateRange.start?.toISOString(),
                end: formData.sender.pickupDateRange.end?.toISOString(),
              },
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Shipment updated successfully!`);
      } else {
        console.error("Error updating shipment:", data.error);
        alert(data.error || "Failed to update shipment");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      sender: {
        ...prev.sender,
        pickupDateRange: {
          start: date,
          end:
            prev.sender.pickupDateRange.end &&
            date &&
            prev.sender.pickupDateRange.end < date
              ? null
              : prev.sender.pickupDateRange.end,
        },
      },
    }));
  };

  const handleEndDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      sender: {
        ...prev.sender,
        pickupDateRange: {
          ...prev.sender.pickupDateRange,
          end: date,
        },
      },
    }));
  };

  const handleReceiverCountryChange = (e) => {
    const selectedCountry = countries.find(
      (country) => country.code === e.target.value
    );

    if (selectedCountry) {
      setReceiverCountry(selectedCountry.code);
      setReceiverCountryName(selectedCountry.name);
      setFormData((prev) => ({
        ...prev,
        receiver: {
          ...prev.receiver,
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
        },
      }));
    }
  };

  return (
    <div>
      <div className="p-5 gap-6 flex justify-center items-center flex-col fontPoppins">
        <div className="flex justify-start w-full">
          <h1 className="fontPoppins font-semibold text-gray-600 text-2xl">
            Update International Shipment
          </h1>
        </div>
        <div className="w-full bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          {/* Header */}
          <div className="w-full h-16 border-b border-gray-200 flex flex-row bg-gray-50">
            <div className="w-full flex justify-start items-center px-6 font-semibold text-gray-700 border-r border-gray-200">
              <h1 className="text-lg">Sender Information</h1>
            </div>
            <div className="w-full flex justify-start items-center px-6 font-semibold text-gray-700">
              <h1 className="text-lg">Receiver Information</h1>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Error Messages */}
            {missingFields.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 border-l-4 border-red-500">
                <p className="font-semibold flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Please fill in all required fields:
                </p>
                <ul className="list-disc pl-7 mt-2 space-y-1">
                  {missingFields.map((field) => (
                    <li key={field} className="text-sm">
                      {field
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .replace("sender.", "Sender ")
                        .replace("receiver.", "Receiver ")
                        .replace("pickupDateRange.", "Pickup Date Range ")
                        .replace("start", "Start Date")
                        .replace("end", "End Date")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sender and Receiver Information */}
            <div className="flex flex-col gap-5">
              <div className="w-full grid grid-cols-2 md:grid-cols-2 divide-x divide-gray-200">
              {/* Sender Column */}
              <SenderInfo
                formData={formData}
                handleChange={handleChange}
                handleCountryChange={handleCountryChange}
                handleStartDateChange={handleStartDateChange}
                handleEndDateChange={handleEndDateChange}
                countries={countries}
                missingFields={missingFields}
                errors={errors}
              />

              {/* Receiver Column */}
              <ReceiverInfo
                formData={formData}
                handleChange={handleChange}
                receiverCountry={receiverCountry}
                handleReceiverCountryChange={handleReceiverCountryChange}
                countries={countries}
                missingFields={missingFields}
                errors={errors}
              />
            </div>
            <CalculationModal
                receiverCountry={receiverCountry}
                receiverCountryName={receiverCountryName}
                setFormData={setFormData}
                formData={formData}
            />
            </div>

            {/* Submit Button */}
            <div className="p-6 bg-gray-50 flex justify-start">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 cursor-pointer bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Shipment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateSenderReceiver;
