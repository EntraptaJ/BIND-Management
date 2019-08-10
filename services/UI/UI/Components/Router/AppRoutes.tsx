// UI/UI/Components/Router/AppRoutes.tsx
import { AppRoute } from 'UI/Components/Router/types';
import { Loadable } from './Loadable';

export const AppRoutes: AppRoute[] = [
  {
    label: 'Home',
    path: '/',
    to: '/',
    exact: true,
    Loadable: Loadable(import('UI/Routes/Home/index'), 'Routes/Home/index.tsx')
  },
  {
    label: 'Login',
    path: 'Login',
    to: '/Login',
    authMode: false,
    Loadable: Loadable(import('UI/Routes/Authentication/Login'), 'UI/Routes/Authentication/Login.tsx')
  },
  {
    label: 'Register',
    path: 'Register',
    to: '/Register',
    authMode: false,
    Loadable: Loadable(import('UI/Routes/Authentication/Register'), 'UI/Routes/Authentication/Register.tsx')
  },
  {
    label: 'Setup',
    path: 'Setup',
    to: '/Setup',
    hideUI: true,
    hidden: true,
    exact: true,
    Loadable: Loadable(import('UI/Routes/Setup'), 'UI/Routes/Setup/index.tsx')
  },
  {
    label: 'Zones',
    path: 'Zones',
    to: '/Zones/',
    role: 'User',
    authMode: true,
    Loadable: Loadable(import('UI/Routes/Zone/Zones'), 'UI/Routes/Zone/Zones.tsx'),
    children: [
      {
        label: 'Zone',
        path: ':domainName',
        to: '/Zones/example.com',
        role: 'User',
        hidden: true,
        Loadable: Loadable(import('UI/Routes/Zone/Zone'), 'UI/Routes/Zone/Zone.tsx')
      }
    ]
  },
  {
    label: 'Admin',
    path: 'Admin',
    to: '/Admin/',
    role: 'Admin',
    Loadable: Loadable(import('UI/Routes/Admin/Home'), 'Routes/Admin/Home.tsx'),
    children: [
      {
        label: 'Test',
        path: 'Test',
        to: '/Admin/Test',
        role: 'Admin',
        Loadable: Loadable(import('UI/Routes/Admin/Test'), 'Routes/Admin/Test.tsx')
      }
    ]
  }
];
