import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <footer className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
                <i className="fas fa-utensils text-white text-lg"></i>
              </div>
              <div className="text-white">
                <span className="font-bold text-lg">Sasakawa University</span>
                <span className="hidden sm:block text-primary-100 text-sm">Restaurant Service Request System</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-primary-100">
              <span>© 2025 All Rights Reserved</span>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
