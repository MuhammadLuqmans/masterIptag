import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

const RedirectToLogin = () => {
  const { activityId } = useParams();
  const target = activityId ? `/login/${activityId}` : '/login';
  return <Navigate to={target} replace />;
};

export default RedirectToLogin;
