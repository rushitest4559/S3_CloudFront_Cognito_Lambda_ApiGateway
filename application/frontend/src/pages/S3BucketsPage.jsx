import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const fetchS3Buckets = async () => {
  const apiUrl = "https://0clmunin76.execute-api.ap-south-1.amazonaws.com/prod/list-s3-buckets";
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return JSON.parse(data.body);
};

const S3BucketsPage = () => {
  const [bucketsByRegion, setBucketsByRegion] = useState(null);

  // TanStack Query for manual fetching
  const { data, status, error, refetch, isFetching } = useQuery({
    queryKey: ["s3buckets"],
    queryFn: fetchS3Buckets,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
    enabled: false,
  });

  // Load cached data on mount
  useEffect(() => {
    const cachedData = localStorage.getItem("bucketsByRegion");
    if (cachedData) {
      try {
        setBucketsByRegion(JSON.parse(cachedData));
      } catch {
        localStorage.removeItem("bucketsByRegion");
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (data) {
      setBucketsByRegion(data);
      localStorage.setItem("bucketsByRegion", JSON.stringify(data));
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
          {isFetching ? "Loading..." : "Refresh Buckets"}
        </button>
      </div>

      {status === "loading" && <p className="text-gray-500 mt-4">Loading S3 buckets...</p>}
      {status === "error" && <p className="text-red-500 mt-4">Error fetching buckets: {error.message}</p>}

      {(!bucketsByRegion || Object.keys(bucketsByRegion).length === 0) && (
        <p className="text-gray-500 mt-4">No S3 buckets data available to display.</p>
      )}

      {bucketsByRegion && Object.entries(bucketsByRegion).map(([region, buckets]) => (
        <div key={region} className="mb-8 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
          <h4 className="text-xl font-semibold text-blue-600 mb-3 border-b pb-2">
            🌍 {region} ({buckets.length} buckets)
          </h4>

          {buckets.length === 0 ? (
            <p className="text-gray-500">No buckets found in this region.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bucket Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creation Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Versioning
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Encryption
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buckets.map((bucket) => (
                    <tr key={bucket.Name} className="bg-white">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bucket.Name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {bucket.Region}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(bucket.CreationDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {bucket.Versioning}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {bucket.Encryption}
                      </td>
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

export default S3BucketsPage;
