import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import UCCLogo from "../components/UCCLogo";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <footer className="relative bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-3 shadow-lg">
                <UCCLogo size="md" />
              </div>
              <div className="text-white">
                <span className="font-bold text-lg">Sasakawa Restaurant</span>
                <span className="hidden sm:block text-primary-100 text-sm">
                  Service Request System
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-primary-100">
              <span>© 2025 All Rights Reserved</span>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                >
                  <i className="fab fa-facebook"></i>
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                >
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
