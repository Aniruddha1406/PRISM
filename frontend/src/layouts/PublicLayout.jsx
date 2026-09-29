import { Outlet } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-frost-50">
      <TopBar />
      <main id="main-content" className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
