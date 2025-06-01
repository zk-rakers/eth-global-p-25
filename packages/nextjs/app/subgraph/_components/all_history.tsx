"use client";

import { useEffect, useState } from "react";
import { GetAllRequestsDocument, execute } from "~~/.graphclient";

const AllRequestsTable = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    console.log("Fetching all requests...");
    try {
      setLoading(true);
      const { data } = await execute(GetAllRequestsDocument, {});
      console.log("ALL REQUESTS DATA:", JSON.stringify(data, null, 2));
      setRequests(data?.requests || []);
    } catch (err) {
      console.error("GraphQL error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("AllRequestsTable mounted");
    fetchData();
  }, []);

  if (error)
    return (
      <div className="text-red-500">
        ❌ Error loading data: {error.message}
        <button onClick={fetchData} className="btn btn-secondary ml-4">
          Retry
        </button>
      </div>
    );

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={fetchData} className="btn btn-secondary mb-4">
        Refresh All Requests
      </button>

      {requests.length === 0 ? (
        <div>No requests found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Bid Count</th>
                <th>Is Active</th>
                <th>User</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r: any) => (
                <tr key={r.id}>
                  <td className="font-mono text-sm">{r.id.slice(0, 10)}...</td>
                  <td>{r.title}</td>
                  <td>{r.bidCount}</td>
                  <td>{r.isActive ? "✅" : "❌"}</td>
                  <td className="font-mono text-sm">{r.userIdentifier.slice(0, 10)}...</td>
                  <td>{new Date(Number(r.timestamp) * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllRequestsTable;
