import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import {NextUIProvider} from "@nextui-org/react";

import './index.css';

// components
import Header from './components/Header';
import Footer from './components/Footer';

// route pages
import Landing from './pages/Landing';
import Players from './pages/Players';
import Bidding from './pages/Bidding';
import Draft from './pages/apps/Draft';
import CreateUser from './pages/users/CreateUser';

const router = createBrowserRouter([
/**  {
    path: "/",
    element: <Landing />,
  }, **/
  {
    path: "/",
    element: <Draft />,
  },
  {
    path: "/players",
    element: <Players />,
  },
  {
    path: "/users/create",
    element: <CreateUser />
  },
  {
    path: "/bid",
    element: <Bidding />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NextUIProvider>
      <Header />
      <RouterProvider router={router} />
      <Footer />
    </NextUIProvider>
  </React.StrictMode>
);
