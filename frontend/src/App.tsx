import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StoreLayout } from './components/StoreLayout';
import { Cart } from './pages/Cart';
import { Home } from './pages/Home';
import { Info } from './pages/Info';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { Orders } from './pages/Orders';
import { ProductDetail } from './pages/ProductDetail';
import { Signup } from './pages/Signup';
import { AdminLayout } from './pages/admin/AdminLayout';
import { OrdersAdmin } from './pages/admin/OrdersAdmin';
import { PaymentsAdmin } from './pages/admin/PaymentsAdmin';
import { ProductsAdmin } from './pages/admin/ProductsAdmin';
import { UsersAdmin } from './pages/admin/UsersAdmin';

function RouteScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const elementId = decodeURIComponent(hash.slice(1));
      const timer = window.setTimeout(() => {
        document.getElementById(elementId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 50);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <>
      <RouteScrollManager />
      <Routes>
        <Route element={<StoreLayout />}>
          <Route index element={<Home />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="info/:slug" element={<Info />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="payments" element={<PaymentsAdmin />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="*" element={<Navigate to="/admin/products" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
