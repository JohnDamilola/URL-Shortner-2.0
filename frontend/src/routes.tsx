import Login from 'screens/AuthScreens/Login'
import Register from 'screens/AuthScreens/Register'
import Dashboard from 'screens/DashboardScreens/Dashboard'
import Home from 'screens/Home'
import EditUser from 'screens/DashboardScreens/EditUser'


const homeRoutes = [
  {
    path: '/',
    element: <Home />,
  }
]

const authRoutes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  }
]

const dashboardRoutes = [
  {
    path: '/overview',
    element: <Dashboard />,
  },
  {
    path: '/links',
    element: <div>Links</div>,
  },
  {
    path: '/analytics',
    element: <div>Analytics</div>,
  },
  {
    path: '/account-settings',
    element: <EditUser />,
  },
]

export { homeRoutes, authRoutes, dashboardRoutes }