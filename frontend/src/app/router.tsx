import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '../auth/ProtectedRoute.tsx';
import AppLayout from '../components/layout/AppLayout.tsx';
import Landing from '../pages/Landing.tsx';
import Login from '../pages/Login.tsx';
import Signup from '../pages/Signup.tsx';
import Dashboard from '../pages/app/Dashboard.tsx';
import Profile from '../pages/app/Profile.tsx';
import Info from '../pages/Info.tsx';

// ITR-1 Pages
import ITR1Salary from '../pages/app/itr1/Salary.tsx';
import ITR1Review from '../pages/app/itr1/Review.tsx';
import ITR1Calculate from '../pages/app/itr1/Calculate.tsx';

// ITR-2 Pages
import ITR2Salary from '../pages/app/itr2/Salary.tsx';
import ITR2Equity from '../pages/app/itr2/Equity.tsx';
import ITR2MutualFunds from '../pages/app/itr2/MutualFunds.tsx';
import ITR2Review from '../pages/app/itr2/Review.tsx';
import ITR2Calculate from '../pages/app/itr2/Calculate.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/info',
    element: <Info />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/signup',
        element: <Signup />,
      },
    ],
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
          // ITR-1 Routes
          {
            path: 'itr-1/salary',
            element: <ITR1Salary />,
          },
          {
            path: 'itr-1/review',
            element: <ITR1Review />,
          },
          {
            path: 'itr-1/calculate',
            element: <ITR1Calculate />,
          },
          // ITR-2 Routes
          {
            path: 'itr-2/salary',
            element: <ITR2Salary />,
          },
          {
            path: 'itr-2/equity',
            element: <ITR2Equity />,
          },
          {
            path: 'itr-2/mutual-funds',
            element: <ITR2MutualFunds />,
          },
          {
            path: 'itr-2/review',
            element: <ITR2Review />,
          },
          {
            path: 'itr-2/calculate',
            element: <ITR2Calculate />,
          },
        ],
      },
    ],
  },
]);
