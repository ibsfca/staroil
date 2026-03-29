/**
 * Debug Helper - Paste into browser console to diagnose issues
 */

// Quick diagnostic function
const debugStarOil = {
  checkMockMode() {
    const enabled = localStorage.getItem('MOCK_MODE');
    console.log(`Mock Mode: ${enabled === 'true' ? '✅ ENABLED' : '❌ DISABLED'}`);
    return enabled === 'true';
  },

  enableMock() {
    localStorage.setItem('MOCK_MODE', 'true');
    console.log('✅ Mock mode enabled. Reloading...');
    setTimeout(() => location.reload(), 1000);
  },

  disableMock() {
    localStorage.removeItem('MOCK_MODE');
    console.log('❌ Mock mode disabled. Reloading...');
    setTimeout(() => location.reload(), 1000);
  },

  checkRedux() {
    // Try to access Redux store if available
    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
      console.log('✅ Redux DevTools available');
    } else {
      console.log('⚠️  Redux DevTools not found');
    }
  },

  checkDOM() {
    const root = document.getElementById('root');
    if (root) {
      console.log('✅ Root element found');
      console.log(`✅ Root has children: ${root.children.length > 0}`);
    } else {
      console.log('❌ Root element NOT FOUND - app won\'t render!');
    }
  },

  runFullDiagnostic() {
    console.log('🔍 Running full diagnostic...\n');
    this.checkDOM();
    this.checkMockMode();
    this.checkRedux();
    console.log('\n📋 Commands available:');
    console.log('  debugStarOil.enableMock()   - Turn on mock mode');
    console.log('  debugStarOil.disableMock()  - Turn off mock mode');
    console.log('  debugStarOil.checkMockMode() - Check current status');
  },
};

// Attach to window
window.debugStarOil = debugStarOil;

// Auto-run diagnostic on load
debugStarOil.runFullDiagnostic();
