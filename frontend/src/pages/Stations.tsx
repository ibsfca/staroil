import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchStations, fetchStationDetails } from '../store/slices/stationsSlice';
import MainLayout from '../components/MainLayout';

function Stations() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { stations, currentStation, isLoading, isLoadingDetails } = useAppSelector(
    (state) => state.stations
  );
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchStations());
  }, [dispatch]);

  const handleStationClick = (stationId: string) => {
    setSelectedStationId(stationId);
    dispatch(fetchStationDetails(stationId));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('stations.title') || 'Stations'}</h1>
            <p className="text-gray-600 mt-2">{t('stations.subtitle') || 'View all station profiles and inventory'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('stations.allStations') || 'All Stations'} ({stations?.length || 0})
                </h2>
              </div>

              <div className="overflow-y-auto max-h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : stations && stations.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {stations.map((station: any) => (
                      <button
                        key={station.id}
                        onClick={() => handleStationClick(station.id)}
                        className={`w-full text-left px-6 py-4 transition-colors hover:bg-gray-50 border-l-4 ${
                          selectedStationId === station.id
                            ? 'bg-blue-50 border-l-primary'
                            : 'border-l-transparent'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{station.name}</div>
                        <div className="text-sm text-gray-600">{station.address}</div>
                        {station.stats && (
                          <div className="text-xs text-gray-500 mt-1 flex gap-2">
                            <span>👥 {station.stats.activeEmployees}</span>
                            <span>📦 {station.stats.lowStockItemsCount}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    {t('common.noData') || 'No stations found'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Station Details */}
          <div className="lg:col-span-2">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('common.loading') || 'Loading...'}</p>
                </div>
              </div>
            ) : currentStation ? (
              <div className="space-y-6">
                {/* Station Header */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentStation.name}</h2>
                  <div className="grid grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <span className="font-semibold">📍 {t('stations.address') || 'Address'}:</span>
                      <p>{currentStation.address}</p>
                    </div>
                    <div>
                      <span className="font-semibold">📞 {t('stations.phone') || 'Phone'}:</span>
                      <p>{currentStation.phone || t('common.notAvailable') || 'N/A'}</p>
                    </div>
                    {currentStation.manager && (
                      <div>
                        <span className="font-semibold">👔 {t('stations.manager') || 'Manager'}:</span>
                        <p>{currentStation.manager.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <StatsCard
                    icon="👥"
                    label={t('stations.activeEmployees') || 'Active Employees'}
                    value={currentStation.stats?.activeEmployees || 0}
                  />
                  <StatsCard
                    icon="⛽"
                    label={t('stations.fuelTypes') || 'Fuel Types'}
                    value={currentStation.stats?.fuelTypesCount || 0}
                  />
                  <StatsCard
                    icon="📦"
                    label={t('stations.convenienceItems') || 'Convenience Items'}
                    value={currentStation.stats?.convenienceItemsCount || 0}
                  />
                  <StatsCard
                    icon="🚨"
                    label={t('stations.lowStockItems') || 'Low Stock Items'}
                    value={currentStation.stats?.lowStockItemsCount || 0}
                    color="red"
                  />
                </div>

                {/* Fuel Inventory */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">⛽ {t('stations.fuelInventory') || 'Fuel Inventory'}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            {t('common.name') || 'Name'}
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            {t('common.quantity') || 'Quantity'}
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            {t('common.price') || 'Price'}
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            {t('common.status') || 'Status'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentStation.inventoryItems
                          ?.filter((item: any) => item.type === 'FUEL')
                          .map((item: any) => {
                            const isLow = item.quantity <= (item.reorderLevel || 10);
                            return (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 text-right font-semibold">
                                  {item.quantity.toFixed(2)} L
                                </td>
                                <td className="px-6 py-4 text-right">${item.unitPrice.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                      isLow
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {isLow ? '🔴 ' + (t('common.lowStock') || 'Low Stock') : '✅ ' + (t('common.inStock') || 'In Stock')}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Convenience Items */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">🏪 {t('stations.convenienceItems') || 'Convenience Items'}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            {t('common.name') || 'Name'}
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            {t('common.quantity') || 'Quantity'}
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            {t('common.price') || 'Price'}
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            {t('common.status') || 'Status'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentStation.inventoryItems
                          ?.filter((item: any) => item.type === 'CONVENIENCE')
                          .map((item: any) => {
                            const isLow = item.quantity <= (item.reorderLevel || 10);
                            return (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 text-right font-semibold">{item.quantity}</td>
                                <td className="px-6 py-4 text-right">${item.unitPrice.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                      isLow
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {isLow ? '🔴 ' + (t('common.lowStock') || 'Low Stock') : '✅ ' + (t('common.inStock') || 'In Stock')}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Employee Summary */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">👥 {t('stations.employees') || 'Employees'}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            {t('common.name') || 'Name'}
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            {t('common.email') || 'Email'}
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            {t('common.role') || 'Role'}
                          </th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                            {t('common.status') || 'Status'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentStation.users?.map((employee: any) => (
                          <tr key={employee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900">{employee.name}</td>
                            <td className="px-6 py-4 text-gray-600 text-sm">{employee.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                {employee.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  employee.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {employee.isActive ? t('common.active') || 'Active' : t('common.inactive') || 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">
                  {t('stations.selectStation') || 'Select a station to view details'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

interface StatsCardProps {
  icon: string;
  label: string;
  value: number;
  color?: 'green' | 'blue' | 'red';
}

function StatsCard({ icon, label, value, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    red: 'bg-red-50 text-red-900',
  };

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-75">{label}</div>
    </div>
  );
}

export default Stations;
