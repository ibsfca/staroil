import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchInventory } from '../store/slices/inventorySlice';
import MainLayout from '../components/MainLayout';

function Inventory() {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.inventory);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchInventory({ stationId: user?.stationId || 'all' }));
  }, [dispatch, user?.stationId]);

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <button className="btn-primary">+ Add Item</button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Current Qty</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item: any) => {
                  const isLow = item.currentQuantity <= item.reorderLevel;
                  return (
                    <tr key={item.id}>
                      <td>{item.itemName}</td>
                      <td>{item.sku}</td>
                      <td>{item.itemType}</td>
                      <td className="font-semibold">{item.currentQuantity}</td>
                      <td>{item.reorderLevel}</td>
                      <td>
                        <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td>
                        <button className="text-primary hover:text-primary-600 text-sm">
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Inventory;
