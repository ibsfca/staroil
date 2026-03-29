import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { login } from '../store/slices/authSlice';

function Login() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(
      login({ email: formData.email, password: formData.password })
    );
    if (login.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">StarOil</h1>
          <p className="text-gray-600 mt-2">{t('auth.welcomeBack')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
              placeholder={t('auth.email')}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.password')}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
              placeholder={t('auth.password')}
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-800 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? t('auth.loading') : t('auth.loginButton')}
          </button>
        </form>

        <div className="mt-6 p-4 bg-info-50 border border-info-200 rounded-lg">
          <p className="text-sm text-info-800">
            <strong>{t('common.info')}:</strong>
          </p>
          <p className="text-sm text-info-700 mt-1">
            {t('auth.email')}: admin@staroil.local
          </p>
          <p className="text-sm text-info-700">
            {t('auth.password')}: StarOil123!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
