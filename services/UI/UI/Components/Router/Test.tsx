export const RouteItems = [
  {
    label: 'Home',
    path: '/',
    to: '/',
    exact: true
  },
  {
    label: 'Login',
    path: 'Login',
    to: '/Login',
    authMode: false
  },
  {
    label: 'Register',
    path: 'Register',
    to: '/Register',
    authMode: false
  },
  {
    label: 'Setup',
    path: 'Setup',
    to: '/Setup',
    hideUI: true,
    hidden: true,
    exact: true
  },
  {
    label: 'Zones',
    path: 'Zones',
    to: '/Zones/',
    role: 'User',
    children: [
      {
        label: 'Zone',
        path: ':domainName',
        to: '/Zones/example.com',
        role: 'User',
        hidden: true
      }
    ]
  },
  {
    label: 'Admin',
    path: 'Admin',
    to: '/Admin/',
    role: 'Admin',
    children: [
      {
        label: 'Test',
        path: 'Test',
        to: '/Admin/Test',
        role: 'Admin'
      }
    ]
  }
];
