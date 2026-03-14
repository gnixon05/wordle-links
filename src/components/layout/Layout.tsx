import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isGamePlay = /^\/game\/[^/]+$/.test(location.pathname);

  return (
    <div className={`d-flex flex-column min-vh-100${isGamePlay ? ' layout-gameplay' : ''}`}>
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
