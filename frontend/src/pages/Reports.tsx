import { useState } from 'react';
import MainLayout from '../components/MainLayout';
import FinancialSummary from '../components/FinancialSummary';
import { useAppSelector } from '../hooks/useRedux';

function Reports() {
  const [activeReport, setActiveReport] = useState<'overview' | 'financial'>('overview');
  const financialData = useAppSelector((state) => state.financial.rows);

  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Reports</h1>

        {/* Report Navigation */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <button
            onClick={() => setActiveReport('overview')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeReport === 'overview'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveReport('financial')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeReport === 'financial'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Financial Summary
          </button>
        </div>

        {/* Overview Section */}
        {activeReport === 'overview' && (
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
        )}

        {/* Financial Summary Section */}
        {activeReport === 'financial' && (
          <div>
            <FinancialSummary data={financialData} title="Financial Summary Report - Daily Balance Sheet" />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Reports;
