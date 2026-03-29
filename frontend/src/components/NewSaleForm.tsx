import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../hooks/useRedux';
import { apiClient } from '../services/api';

interface SaleItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface NewSaleFormProps {
  onClose: () => void;
  onSaleCreated: () => void;
  stationId?: string;
}

function NewSaleForm({ onClose, onSaleCreated, stationId }: NewSaleFormProps) {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SaleItem[]>([
    { itemId: '', quantity: 0, unitPrice: 0, subtotal: 0 },
  ]);
  const [form, setForm] = useState({
    paymentMethod: 'CASH',
    notes: '',
  });

  const fuelTypes = [
    { id: 'fuel-91', label: '91 Octane Fuel' },
    { id: 'fuel-95', label: '95 Octane Fuel' },
    { id: 'fuel-diesel', label: 'Diesel Fuel' },
    { id: 'store-item-1', label: 'Store Item 1' },
    { id: 'store-item-2', label: 'Store Item 2' },
  ];

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'quantity') {
      item.quantity = parseFloat(value) || 0;
    } else if (field === 'unitPrice') {
      item.unitPrice = parseFloat(value) || 0;
    } else if (field === 'itemId') {
      item.itemId = value;
    }

    item.subtotal = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { itemId: '', quantity: 0, unitPrice: 0, subtotal: 0 },
    ]);
  };

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validation
      if (items.some((item) => !item.itemId)) {
        throw new Error('Please fill in all item fields');
      }

      const totalAmount = calculateTotal();
      if (totalAmount <= 0) {
        throw new Error('Sale total must be greater than 0');
      }

      const saleData = {
        stationId: stationId || user?.stationId || '',
        employeeId: user?.id || '',
        totalAmount,
        paymentMethod: form.paymentMethod,
        items: items.filter((item) => item.itemId),
        notes: form.notes,
      };

      await apiClient.post('/sales', saleData);

      // Success message (would normally be a toast)
      alert(t('common.createdSuccessfully'));
      onClose();
      onSaleCreated();
    } catch (err: any) {
      setError(err.message || t('errors.unknownError'));
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{t('sales.addSale')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-800">
              {error}
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('sales.paymentMethod')} <span className="text-danger">*</span>
            </label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="input-field"
            >
              <option value="CASH">{t('sales.cash')}</option>
              <option value="CARD">{t('sales.card')}</option>
              <option value="CHECK">{t('sales.check')}</option>
            </select>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('sales.items')} <span className="text-danger">*</span>
            </label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Item Type</th>
                    <th className="px-3 py-2 text-left">Quantity</th>
                    <th className="px-3 py-2 text-left">Unit Price</th>
                    <th className="px-3 py-2 text-left">Subtotal</th>
                    <th className="px-3 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-3 py-2">
                        <select
                          value={item.itemId}
                          onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                          className="input-field text-sm py-1"
                        >
                          <option value="">Select item</option>
                          {fuelTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity || ''}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', e.target.value)
                          }
                          className="input-field text-sm py-1 w-20"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice || ''}
                          onChange={(e) =>
                            handleItemChange(index, 'unitPrice', e.target.value)
                          }
                          className="input-field text-sm py-1 w-24"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-3 py-2 font-semibold text-success">
                        ${item.subtotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="text-danger hover:text-danger-600 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addItemRow}
              className="mt-2 text-primary hover:text-primary-600 text-sm font-medium"
            >
              + {t('common.add')} Item
            </button>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.info')}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Optional notes..."
            />
          </div>

          {/* Total */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">
                {t('sales.totalAmount')}:
              </span>
              <span className="text-2xl font-bold text-success">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewSaleForm;
