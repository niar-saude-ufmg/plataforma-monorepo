import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { APP_ROUTES } from '@niar/config';
import RemoteApp from './RemoteApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to={APP_ROUTES.assistant} />} />
        <Route path={`${APP_ROUTES.assistant}/*`} element={<RemoteApp />} />
        <Route path="*" element={<Navigate replace to={APP_ROUTES.assistant} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
