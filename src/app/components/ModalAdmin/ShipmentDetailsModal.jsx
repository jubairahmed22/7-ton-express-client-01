"use client";

import { FiTrash2, FiX } from "react-icons/fi";

import UpdateSenderReceiver from "../../components/ShipmentDetailsModalCompo/UpdateSenderReceiver";

const ShipmentDetailsModal = ({ shipment, onClose }) => {
  if (!shipment) return null;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this shipment?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://server-gs-two.vercel.app/api/delete-inter-shipment-list/${shipment._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Shipment deleted successfully");
        refreshShipments(); // Refresh the shipment list
        onClose(); // Close the modal
      } else {
        toast.error(data.message || "Failed to delete shipment");
      }
    } catch (error) {
      toast.error("Error deleting shipment");
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* modal shell */}
      <div className="bg-white rounded-lg shadow-xl w-[80%] max-h-[90vh] flex flex-col">
        {/* ---------- Header ---------- */}
        <div className="flex justify-between items-center border-b border-gray-200 p-4 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            Shipment Details&nbsp;–&nbsp;{shipment.trackingNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* ---------- Body (scrollable) ---------- */}
        <div className="flex-1 overflow-y-auto">
          <UpdateSenderReceiver shipment={shipment} />
        </div>

        {/* ---------- Footer ---------- */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3 shrink-0">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ShipmentDetailsModal;
