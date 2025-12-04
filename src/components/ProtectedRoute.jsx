import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  const { activityId } = useParams();

  if (!isAuthenticated) {
    // If we have an activityId in the URL, enforce login with that id
    const target = activityId ? `/login/${activityId}` : '/login';
    return <Navigate to={target} replace />;
  }

  return children;
};

export default ProtectedRoute;
