import { useState, useEffect } from "react";
import { type Order } from "../../lib/data";
import axiosInstance from "../../utils/axios";

interface VendorOrderListProps {
  vendorId: string;
}

export default function VendorOrderList({ vendorId }: VendorOrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedOrders = await axiosInstance.get(
          `api/orders/vendor/${vendorId}/orders`
        );
        setOrders(fetchedOrders.data.data);
      } catch (e: any) {
        setError(`Failed to fetch orders: ${e.message}`);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [vendorId]);

  if (loading) {
    return <div className="text-center p-4">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500 border rounded-md">
        No orders found for this vendor ({vendorId}).
      </div>
    );
  }

  function exportCsv() {
    // Example data — replace this with your actual data array
    const data = orders;

    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Get CSV headers from the keys of the first object
    const headers = Object.keys(data[0]);

    // Convert array of objects into CSV string
    const csvRows = [
      headers.join(","), // header row first
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const val = row[fieldName];
            // If the field is an object, JSON stringify it or flatten it as needed
            if (typeof val === "object" && val !== null) {
              return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            }
            // Escape commas and quotes for strings
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvRows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "distribution_centers.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Order List</h2>
        <button
          className="mt-2 text-sm text-gray-100 rounded hover:underline py-2 px-3 bg-blue-500 hover:bg-blue-600"
          onClick={exportCsv}
        >
          export <span className="font-semibold">CSV</span>
        </button>
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
            <th className="py-3 px-4 border-b">Order Number</th>
            <th className="py-3 px-4 border-b">Order Placement Status</th>
            <th className="py-3 px-4 border-b">Total Amount</th>
            <th className="py-3 px-4 border-b">Items</th>
            <th className="py-3 px-4 border-b">Payment Status</th>
            <th className="py-3 px-4 border-b">Order Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50">
              <td className="py-3 px-4 border-b border-gray-200">
                {order.orderNumber}
              </td>
              <td className="py-3 px-4 border-b border-gray-200">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-800"
                      : order.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="py-3 px-4 border-b border-gray-200">
                {order.orderSummary.totalAmount.toFixed(2)}
              </td>
              <td className="py-3 px-4 border-b border-gray-200">
                <ul className="list-disc list-inside text-sm">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.productName} (x{item.quantity})
                    </li>
                  ))}
                </ul>
              </td>
              <td className="py-3 px-4 border-b border-gray-200">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.payment.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : order.payment.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.payment.status === "FAILED"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.payment.status}
                </span>
              </td>
              <td className="py-3 px-4 border-b border-gray-200">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
