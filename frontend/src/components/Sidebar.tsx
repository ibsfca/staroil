import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../hooks/useRedux';

function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: t('navigation.dashboard'), icon: '📊' },
    { path: '/sales', label: t('navigation.sales'), icon: '🛒' },
    { path: '/inventory', label: t('navigation.inventory'), icon: '📦' },
    { path: '/shifts', label: t('navigation.shifts'), icon: '⏰' },
    { path: '/stations', label: t('navigation.stations'), icon: '🏢' },
    { path: '/reports', label: t('navigation.reports'), icon: '📈' },
  ];

  const adminMenuItems = [
    { path: '/settings', label: t('navigation.settings'), icon: '⚙️' },
  ];

  const allMenuItems = user?.role === 'ADMIN' ? [...menuItems, ...adminMenuItems] : menuItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-primary text-white rounded-lg"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-gray-900 text-white transition-transform duration-300 z-30 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold">StarOil</h2>
          <p className="text-sm text-gray-400">{t('app.title')}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {allMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive(item.path)
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">© 2024 StarOil Manager</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
