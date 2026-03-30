import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="layout">
      <Navbar />
      <main style={{ paddingTop: '100px', minHeight: 'calc(100vh - 300px)' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
