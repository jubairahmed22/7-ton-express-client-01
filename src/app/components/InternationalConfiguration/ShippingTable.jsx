import React from "react";

const ShippingTable = ({
  companyData,
  zoneKeys,
  allRatesData,
  onRateChange,
  onParcelTypeChange,
  onDuplicateRow,
  onDeleteRow,
  handleWeightChange,
}) => {
  return (
    <div className="mb-8 p-5 rounded-xl bg-white">
      <h2 className="text-xl font-semibold mb-4">
        {companyData.company} Rates
      </h2>
      <div className="bg-white shadow-lg rounded-lg border border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-black">
            <thead className="bg-blue-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider border border-black">
                  Weight (kg)
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider border border-black">
                  Parcel Type
                </th>
                {zoneKeys.map((zone) => (
                  <th
                    key={zone}
                    className="px-6 py-4 text-center text-sm font-bold text-black uppercase tracking-wider border border-black"
                  >
                    {zone.replace("Zone", "Zone ")}
                  </th>
                ))}
                <th className="px-6 py-4 text-center text-sm font-bold text-black uppercase tracking-wider border border-black">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companyData.rates.map((item, rateIndex) => (
                <tr key={item._id || rateIndex} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-md font-semibold text-black border border-black bg-blue-200">
                    <input
                      type="text"
                      value={item.weightKg}
                      onChange={(e) =>
                        handleWeightChange(
                          allRatesData.findIndex(
                            (c) => c._id === companyData._id
                          ),
                          rateIndex,
                          e.target.value
                        )
                      }
                      className="border border-gray-300 text-black font-medium rounded px-3 py-2 w-full max-w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-6 py-4 border border-black">
                    <select
                      value={item.parcelType}
                      onChange={(e) =>
                        onParcelTypeChange(
                          allRatesData.findIndex(
                            (c) => c._id === companyData._id
                          ),
                          rateIndex,
                          e.target.value
                        )
                      }
                      className="bg-gray-50 border border-gray-300 text-black text-md rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                    >
                      <option value="DOX">DOX</option>
                      <option value="WPX">WPX</option>
                    </select>
                  </td>
                  {zoneKeys.map((zone) => (
                    <td key={zone} className="px-6 py-4 border border-black">
                      <input
                        type="text"
                        value={item.rates[zone] || ""}
                        onChange={(e) =>
                          onRateChange(
                            allRatesData.findIndex(
                              (c) => c._id === companyData._id
                            ),
                            rateIndex,
                            zone,
                            e.target.value
                          )
                        }
                        className="border border-gray-300 text-black font-medium rounded px-3 py-2 w-full max-w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                  ))}
                  <td className="px-6 py-4 border border-black text-center">
                    <div className="flex justify-center space-x-3">
  <button
    onClick={() => onDuplicateRow(companyData._id, rateIndex)}
    className="bg-emerald-500 cursor-pointer hover:bg-emerald-600 text-white p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75"
    title="Add new row"
    aria-label="Add row"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  </button>
  
  <button
    onClick={() => onDeleteRow(companyData._id, rateIndex)}
    className="bg-rose-500 cursor-pointer hover:bg-rose-600 text-white p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-75"
    title="Delete this row"
    aria-label="Delete row"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  </button>
</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShippingTable;
