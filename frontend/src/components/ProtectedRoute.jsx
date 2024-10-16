import React from 'react'
import { Outlet, Navigate } from "react-router-dom";

function ProtectedRoute() {

  const isLoggedIn = localStorage.getItem('user') !== null


  return isLoggedIn ? <Outlet /> : <Navigate to="/Login" />
}

export default ProtectedRoute