import React, { useContext } from 'react';
import { Store } from '../Store';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { state } = useContext(Store);
  const { userLoggedIn } = state;
  return userLoggedIn ? children : <Navigate to="/signin" />;
}
