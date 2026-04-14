import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

import { checkStoredToken, clearAuth } from '../store/authSlice';
import { setUnauthorizedCallback } from '../services/api';

import SplashScreen from '../screens/SplashScreen';
import AuthStack from './auth/AuthStack';
import FarmerTabNavigator from './roles/farmer/FarmerTabNavigator';
import RetailerNavigator from './roles/retailer/RetailerNavigator';
import EmployeeNavigator from './roles/employee/EmployeeNavigator';

export default function RootNavigator() {
  const dispatch = useDispatch();

  const { token, user, isAuthChecked } = useSelector(state => state.auth || {});

  // =========================
  // INITIAL AUTH CHECK
  // =========================
  useEffect(() => {
    dispatch(checkStoredToken());
  }, [dispatch]);

  useEffect(() => {
    setUnauthorizedCallback(() => {
      dispatch(clearAuth());
    });

    return () => {
      setUnauthorizedCallback(null);
    };
  }, [dispatch]);

  // =========================
  // SAFE NORMALIZATION
  // =========================
  const safeToken =
    typeof token === 'string' && token.trim().length > 0 ? token : null;

  const safeUser =
    user && typeof user === 'object' && Object.keys(user).length > 0
      ? user
      : null;

  const userRole =
    typeof safeUser?.role === 'string' && safeUser.role.trim().length > 0
      ? safeUser.role
      : null;

  // =========================
  // LOADING STATE
  // =========================
  if (!isAuthChecked) {
    return <SplashScreen />;
  }

  // =========================
  // AUTH FALLBACK
  // =========================
  if (!safeToken || !safeUser) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  // =========================
  // ROLE BASED NAVIGATION
  // =========================
  //app stack
  const renderAppStack = () => {
    switch (userRole) {
      case 'Farmer':
        return <FarmerTabNavigator />;

      case 'Retailer':
        return <RetailerNavigator />;

      case 'Employee':
        return <EmployeeNavigator />;

      default:
        return <AuthStack />; // fallback safety
    }
  };

  // =========================
  // FINAL RENDER
  // =========================
  return <NavigationContainer>{renderAppStack()}</NavigationContainer>;
}
