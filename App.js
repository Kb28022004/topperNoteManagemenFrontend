import { Provider } from 'react-redux';
import { store } from './src/app/store';

import AppNavigator from './src/routes/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
