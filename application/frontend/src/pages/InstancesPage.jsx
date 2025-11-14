import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const fetchInstances = async () => {
  const apiUrl = "https://0clmunin76.execute-api.ap-south-1.amazonaws.com/prod/list-instances";
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return JSON.parse(data.body);
};

const InstancePage = () => {
  const [instancesByRegion, setInstancesByRegion] = useState(null);

  // Query with enabled: false to disable automatic fetch
  const { data, status, error, refetch, isFetching } = useQuery({
    queryKey: ["instances"],
    queryFn: fetchInstances,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
    enabled: false, // disable auto fetch on mount
  });

  // Load from localStorage on mount
  useEffect(() => {
    const cachedData = localStorage.getItem("instancesByRegion");
    if (cachedData) {
      try {
        setInstancesByRegion(JSON.parse(cachedData));
      } catch {
        // corrupted data, ignore
        localStorage.removeItem("instancesByRegion");
      }
    }
  }, []);

  // When data is fetched successfully, save to state and localStorage
  useEffect(() => {
    if (data) {
      setInstancesByRegion(data);
      localStorage.setItem("instancesByRegion", JSON.stringify(data));
    }
  }, [data]);

  return (
    <div className="mt-6 w-full max-w-4xl mx-auto">
      <div className="mb-4 text-right">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="py-2 px-4 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isFetching ? "Loading..." : "Refresh Instances"}
        </button>
      </div>

      {status === "loading" && <p className="text-gray-500 mt-4">Loading instances...</p>}
      {status === "error" && <p className="text-red-500 mt-4">Error fetching instances: {error.message}</p>}

      {(!instancesByRegion || Object.keys(instancesByRegion).length === 0) && (
        <p className="text-gray-500 mt-4">No instances data available to display.</p>
      )}

      {instancesByRegion && Object.entries(instancesByRegion).map(([region, instances]) => (
        <div key={region} className="mb-8 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
          <h4 className="text-xl font-semibold text-blue-600 mb-3 border-b pb-2">
            📍 {region} ({instances.length} instances)
          </h4>

          {instances.length === 0 ? (
            <p className="text-gray-500">No instances found in this region.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instance ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Launch Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instances.map(instance => (
                    <tr key={instance.InstanceId} className={instance.State === "running" ? "bg-green-50" : "bg-red-50"}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{instance.Name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 font-mono">{instance.InstanceId}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{instance.Type}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold">
                        <span className={`px-2 inline-flex text-xs leading-5 rounded-full ${instance.State === "running" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {instance.State}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(instance.LaunchTime).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InstancePage;
