import { Provider } from 'react-redux';
import { store } from './src/app/store';
import { AlertProvider } from './src/context/AlertContext';

import AppNavigator from './src/routes/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <AlertProvider>
        <AppNavigator />
      </AlertProvider>
    </Provider>
  );
}
