import React, { useRef } from 'react';

import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './index.css'

import Layout from "./routes/Layout";
import Home from './routes/Home'
import Make from "./routes/Make";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="make" element={<Make />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

