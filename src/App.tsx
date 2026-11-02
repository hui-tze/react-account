import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import "bootstrap/js/src/collapse";
import {mainRouter} from './routes/Routes';
import {Auth} from "@/providers/auth";

function App() {
  return (
    <Auth>
        <RouterProvider router={mainRouter} />
        <ToastContainer />
    </Auth>
  );
}

export default App;
