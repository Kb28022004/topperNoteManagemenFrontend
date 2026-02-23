import { Provider } from 'react-redux';
import { store } from './src/app/store';
import { AlertProvider } from './src/context/AlertContext';

import AppNavigator from './src/routes/AppNavigator';
import UsageTracker from './src/components/UsageTracker';

export default function App() {
  return (
    <Provider store={store}>
      <AlertProvider>
        <UsageTracker />
        <AppNavigator />
      </AlertProvider>
    </Provider>
  );
}
