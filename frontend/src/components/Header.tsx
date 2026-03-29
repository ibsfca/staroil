import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout } from '../store/slices/authSlice';
import LanguageSwitcher from './LanguageSwitcher';

function Header() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">StarOil {t('navigation.dashboard')}</h1>
        
        <div className="flex items-center space-x-6">
          <LanguageSwitcher />
          
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="hidden md:inline">{user?.firstName} {user?.lastName}</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-800">{user?.email}</p>
                  <p className="text-sm text-gray-600 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-danger hover:bg-danger-50"
                >
                  {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
