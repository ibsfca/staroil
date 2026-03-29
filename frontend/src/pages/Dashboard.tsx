import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchDashboardMetrics } from '../store/slices/dashboardSlice';
import MainLayout from '../components/MainLayout';

function Dashboard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { metrics, isLoading } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch dashboard metrics
    dispatch(
      fetchDashboardMetrics({
        stationId: user?.stationId || 'all',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      })
    );
  }, [dispatch, user?.stationId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('dashboard.title')}</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <p className="text-sm text-gray-600">{t('dashboard.todaySales')}</p>
            <p className="text-3xl font-bold text-primary mt-2">
              ${metrics?.totalSales?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">{t('sales.refund')}</p>
            <p className="text-3xl font-bold text-danger mt-2">
              ${metrics?.totalRefunds?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">{t('sales.amount')}</p>
            <p className="text-3xl font-bold text-secondary mt-2">
              ${metrics?.averageTransactionValue?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">{t('inventory.lowStockAlert')}</p>
            <p className="text-3xl font-bold text-warning mt-2">
              {metrics?.lowStockItems || 0}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('sales.paymentMethod')}
            </h2>
            <div className="space-y-3">
              {metrics?.salesByPaymentMethod?.map((item: any) => (
                <div key={item.method} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.method}</span>
                  <span className="font-semibold text-gray-800">
                    ${item.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('dashboard.recentTransactions')}
            </h2>
            <div className="space-y-3">
              {metrics?.topSales?.slice(0, 5).map((sale: any) => (
                <div key={sale.id} className="flex justify-between items-center">
                  <span className="text-gray-600">{sale.description}</span>
                  <span className="font-semibold text-success">
                    ${sale.amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
