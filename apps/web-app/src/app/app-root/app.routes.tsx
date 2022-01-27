import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppHome } from '../app-shell/home/AppHome';
import { AppShell } from '../app-shell/AppShell';
import FeatureSampleRoutes from '../features/feature-sample/feature-sample.routes';
import { Loading } from '../shared/components';
import { PageNotFound } from '../app-shell/not-found/PageNotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<Loading />}>
            <AppShell />
          </Suspense>
        }
      >
        <Route
          path="/"
          element={
            <Suspense fallback={<Loading />}>
              <AppHome />
            </Suspense>
          }
        ></Route>
        {/* Children routes are declared within AppShell @Code{ Outlet } directive */}
        <Route
          path="/sample/*"
          element={
            <Suspense fallback={<Loading />}>
              <FeatureSampleRoutes />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<Loading />}>
              <PageNotFound />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}