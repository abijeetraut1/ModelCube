import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from '@/renderer/App';
import store from '@/lib/Redux/Store';
import { Provider } from 'react-redux';

const root = createRoot(document.body);
root.render(
    <StrictMode>
        <Provider store={store}>

            <App />
        </Provider>

    </StrictMode>
);