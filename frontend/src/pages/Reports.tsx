import MainLayout from '../components/MainLayout';

function Reports() {
  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Reports</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card cursor-pointer hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Sales Report</h2>
            <p className="text-gray-600 text-sm">View sales by location, payment method, and date range</p>
          </div>

          <div className="card cursor-pointer hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Inventory Report</h2>
            <p className="text-gray-600 text-sm">Check inventory levels, stock value, and reorder alerts</p>
          </div>

          <div className="card cursor-pointer hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Shift Report</h2>
            <p className="text-gray-600 text-sm">Review employee shifts, hours, and attendance</p>
          </div>

          <div className="card cursor-pointer hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Financial Report</h2>
            <p className="text-gray-600 text-sm">Analyze revenue, refunds, and financial metrics</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Reports;
