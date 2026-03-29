import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchSales } from '../store/slices/salesSlice';
import MainLayout from '../components/MainLayout';
import NewSaleForm from '../components/NewSaleForm';

function Sales() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.sales);
  const { user } = useAppSelector((state) => state.auth);
  const [showNewSaleForm, setShowNewSaleForm] = useState(false);

  useEffect(() => {
    dispatch(fetchSales({ stationId: user?.stationId || 'all' }));
  }, [dispatch, user?.stationId]);

  const handleSaleCreated = () => {
    // Refresh sales list
    dispatch(fetchSales({ stationId: user?.stationId || 'all' }));
  };

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('sales.title')}</h1>
          <button
            onClick={() => setShowNewSaleForm(true)}
            className="btn-primary"
          >
            + {t('sales.addSale')}
          </button>
        </div>

        {showNewSaleForm && (
          <NewSaleForm
            onClose={() => setShowNewSaleForm(false)}
            onSaleCreated={handleSaleCreated}
            stationId={user?.stationId}
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        ) : items && items.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('common.info')}</th>
                  <th>{t('sales.saleDate')}</th>
                  <th>{t('sales.amount')}</th>
                  <th>{t('sales.paymentMethod')}</th>
                  <th>{t('common.search')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((sale: any) => (
                  <tr key={sale.id}>
                    <td>{sale.id.slice(0, 8)}</td>
                    <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td className="font-semibold text-success">
                      ${sale.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td>{sale.paymentMethod || 'N/A'}</td>
                    <td>
                      <button className="text-primary hover:text-primary-600 text-sm">
                        {t('common.search')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-600">{t('sales.noSales')}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Sales;
