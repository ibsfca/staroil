import { useMemo } from 'react';

interface FinancialRow {
  id: string;
  description: string;
  stockDepart: number;
  totalLivraison: number;
  totalVersement: number;
  stockJour: number;
}

interface FinancialRowCalculated extends FinancialRow {
  solde: number;
  soldeActuel: number;
}

interface FinancialSummaryProps {
  data: FinancialRow[];
  title?: string;
}

// Format numbers with thousand separators
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Calculate financial metrics
const calculateMetrics = (row: FinancialRow): FinancialRowCalculated => {
  const solde = row.stockDepart + row.totalLivraison - row.totalVersement;
  const soldeActuel = solde - row.stockJour;

  return {
    ...row,
    solde,
    soldeActuel,
  };
};

// Get styling for solde actuel (red if negative, green if positive)
const getSoldeActuelColor = (value: number): string => {
  if (value < 0) return 'text-red-600 font-semibold';
  if (value > 0) return 'text-green-600 font-semibold';
  return 'text-gray-600';
};

export default function FinancialSummary({
  data,
  title = 'Financial Summary Report',
}: FinancialSummaryProps) {
  // Calculate all rows
  const calculatedData = useMemo(
    () => data.map((row) => calculateMetrics(row)),
    [data]
  );

  // Calculate totals
  const totals = useMemo(() => {
    return calculatedData.reduce(
      (acc, row) => ({
        stockDepart: acc.stockDepart + row.stockDepart,
        totalLivraison: acc.totalLivraison + row.totalLivraison,
        totalVersement: acc.totalVersement + row.totalVersement,
        stockJour: acc.stockJour + row.stockJour,
        solde: acc.solde + row.solde,
        soldeActuel: acc.soldeActuel + row.soldeActuel,
      }),
      {
        stockDepart: 0,
        totalLivraison: 0,
        totalVersement: 0,
        stockJour: 0,
        solde: 0,
        soldeActuel: 0,
      }
    );
  }, [calculatedData]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-primary to-primary-600 text-white">
              <th className="px-4 py-3 text-left font-semibold">Description</th>
              <th className="px-4 py-3 text-center font-semibold">Stock Départ</th>
              <th className="px-4 py-3 text-center font-semibold">Total Livraison</th>
              <th className="px-4 py-3 text-center font-semibold">Total Versement</th>
              <th className="px-4 py-3 text-center font-semibold">Solde</th>
              <th className="px-4 py-3 text-center font-semibold">Stock Jour</th>
              <th className="px-4 py-3 text-center font-semibold">Solde Actuel</th>
            </tr>
          </thead>
          <tbody>
            {calculatedData.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b transition-colors hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-gray-700 font-medium">
                  {row.description}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded font-semibold">
                    {formatNumber(row.stockDepart)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-700">
                  {formatNumber(row.totalLivraison)}
                </td>
                <td className="px-4 py-3 text-center text-gray-700">
                  {formatNumber(row.totalVersement)}
                </td>
                <td className="px-4 py-3 text-center font-bold text-primary-600">
                  {formatNumber(row.solde)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded font-semibold">
                    {formatNumber(row.stockJour)}
                  </span>
                </td>
                <td className={`px-4 py-3 text-center ${getSoldeActuelColor(row.soldeActuel)}`}>
                  {formatNumber(row.soldeActuel)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold text-gray-800">
              <td className="px-4 py-4 text-left">TOTAL</td>
              <td className="px-4 py-4 text-center">
                <span className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded">
                  {formatNumber(totals.stockDepart)}
                </span>
              </td>
              <td className="px-4 py-4 text-center">{formatNumber(totals.totalLivraison)}</td>
              <td className="px-4 py-4 text-center">{formatNumber(totals.totalVersement)}</td>
              <td className="px-4 py-4 text-center text-primary-600">
                {formatNumber(totals.solde)}
              </td>
              <td className="px-4 py-4 text-center">
                <span className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded">
                  {formatNumber(totals.stockJour)}
                </span>
              </td>
              <td className={`px-4 py-4 text-center ${getSoldeActuelColor(totals.soldeActuel)}`}>
                {formatNumber(totals.soldeActuel)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total Solde</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {formatNumber(totals.solde)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Total Stock Jour</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {formatNumber(totals.stockJour)}
          </p>
        </div>
        <div
          className={`rounded-lg p-4 border-l-4 ${
            totals.soldeActuel >= 0
              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-500'
              : 'bg-gradient-to-br from-red-50 to-red-100 border-red-500'
          }`}
        >
          <p className="text-gray-600 text-sm font-medium">Total Solde Actuel</p>
          <p
            className={`text-2xl font-bold mt-2 ${
              totals.soldeActuel >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatNumber(totals.soldeActuel)}
          </p>
        </div>
      </div>
    </div>
  );
}
