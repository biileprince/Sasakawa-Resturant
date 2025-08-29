import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <footer className="relative bg-white/80 backdrop-blur-sm border-t border-gray-200 text-center py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                SR
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">Sasakawa University</span>
                <span className="hidden sm:inline"> • Restaurant Service Request System</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>© 2025 All Rights Reserved</span>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-green-600 transition-colors duration-200">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="hover:text-green-600 transition-colors duration-200">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="hover:text-green-600 transition-colors duration-200">
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
