import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { PaymentDemo } from './PaymentDemo';

export function PaymentRoutes() {
  return (
    <Routes>
      <Route path="/payment-demo" element={<PaymentDemo />} />
    </Routes>
  );
}