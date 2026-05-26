
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AdminApp } from './admin/AdminApp';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isAdminPath = window.location.pathname.startsWith('/admin');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isAdminPath ? <AdminApp /> : <App />}
  </React.StrictMode>
);
