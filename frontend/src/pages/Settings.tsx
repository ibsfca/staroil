import MainLayout from '../components/MainLayout';

function Settings() {
  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-primary text-white rounded-lg">
                General Settings
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Users & Permissions
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Inventory Items
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Notifications
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                API Settings
              </button>
            </nav>
          </div>

          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">General Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input type="text" className="input-field" defaultValue="StarOil Gas Stations" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input type="email" className="input-field" defaultValue="support@staroil.local" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select className="input-field">
                    <option>USD - US Dollar</option>
                    <option>CAD - Canadian Dollar</option>
                    <option>EUR - Euro</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="btn-primary">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Settings;
