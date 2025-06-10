"use client";

import { useState } from "react";
import { FiTruck, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiPackage, FiDollarSign, FiInfo } from "react-icons/fi";
import ShipmentDetailsModal from "../../components/ModalAdmin/ShipmentDetailsModal"; // Adjust the import path as needed

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusColors = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200" },
  completed: { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" },
  "in-progress": { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  cancelled: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" }
};



const ShipmentTable = ({ shipments }) => {
  const [selectedShipment, setSelectedShipment] = useState(null);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiPackage className="mr-2" /> Tracking #
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiUser className="mr-2" /> Sender
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiUser className="mr-2" /> Receiver
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiTruck className="mr-2" /> Details
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiCalendar className="mr-2" /> Dates
                </div>
              </th>
              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiInfo className="mr-2" /> Status
                </div>
              </th> */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiDollarSign className="mr-2" /> Value
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <tr key={shipment._id} className="hover:bg-gray-50 transition-colors">
                {/* Tracking Number */}
                <td onClick={() => setSelectedShipment(shipment)} className="px-6 py-4 whitespace-nowrap flex items-center cursor-pointer hover:text-blue-600">
                  <div className="flex items-center">
                    {/* <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiPackage className="h-5 w-5 text-blue-600" />
                    </div> */}
                    <div className="">
                      <div className="text-sm font-medium text-gray-900">{shipment.trackingNumber}</div>
                      <div className="text-sm text-gray-500">INTL Shipment</div>
                    </div>
                  </div>
                </td>

                {/* Sender Information */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{shipment.sender.fullName}</div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <FiMail className="mr-1.5 h-3.5 w-3.5" />
                    {shipment.sender.email}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <FiPhone className="mr-1.5 h-3.5 w-3.5" />
                    {shipment.sender.phone}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center">
                    <FiMapPin className="mr-1 h-3 w-3" />
                    {shipment.sender.country}
                  </div>
                </td>

                {/* Receiver Information */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{shipment.receiver.fullName}</div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <FiMail className="mr-1.5 h-3.5 w-3.5" />
                    {shipment.receiver.email}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <FiPhone className="mr-1.5 h-3.5 w-3.5" />
                    {shipment.receiver.phone}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center">
                    <FiMapPin className="mr-1 h-3 w-3" />
                    {shipment.receiver.country} • {shipment.receiver.zipCode}
                  </div>
                </td>

                {/* Shipment Details */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 flex items-center">
                    <FiTruck className="mr-1.5 h-4 w-4" />
                    {shipment.shipmentDetails.company}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {shipment.shipmentDetails.parcelType} • {shipment.shipmentDetails.totalWeight} kg
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {shipment.shipmentDetails.goodsType?.join(", ")}
                  </div>
                </td>

                {/* Dates */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="font-medium">Pickup:</span>
                      <span className="ml-1">{formatDate(shipment.sender.pickupDateRange.start)}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="font-medium">To:</span>
                      <span className="ml-1">{formatDate(shipment.sender.pickupDateRange.end)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Created: {formatDate(shipment.createdAt)}
                  </div>
                </td>

                {/* Status */}
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[shipment.status].bg} ${statusColors[shipment.status].text} border ${statusColors[shipment.status].border}`}>
                    {shipment.status.replace("-", " ")}
                  </span>
                </td> */}

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-bold text-blue-700">
  ${shipment.shipmentDetails.price.toFixed(2)}{" "}
  <span className="text-sm text-green-600 font-medium">
    (৳{(shipment.shipmentDetails.price * 120).toFixed(0)})
  </span>
</div>

                  <div className="text-xs text-gray-500 mt-1">
                    {shipment?.shipmentDetails?.weightDetails?.length} package(s)
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedShipment && (
        <ShipmentDetailsModal 
          shipment={selectedShipment} 
          onClose={() => setSelectedShipment(null)} 
        />
      )}
      </div>
    </div>
  );
};

export default ShipmentTable;