import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = () => {
  return (
    <header className="bg-slate-800 text-white px-8 py-2 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Medical CT-Scan Logo" className="h-10 w-auto" />
          <h1 className="text-2xl font-semibold">
            Medical CT-Scan 3D Printing
          </h1>
        </div>
        <div className="text-sm text-slate-300">
          University of Maine - Capstone Project
        </div>
      </div>
    </header>
  );
};

const Navigation = () => {
  const location = useLocation();

  const tabs = [
    { path: "/", label: "Upload" },
    { path: "/preview", label: "Preview" },
    { path: "/export", label: "Export" },
    { path: "/settings", label: "Settings" },
    { path: "/about", label: "About"}
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="px-8">
        <ul className="flex gap-1">
          {tabs.map((tab) => (
            <li key={tab.path}>
              <Link
                to={tab.path}
                className={`block px-6 py-4 border-b-4 transition-all ${
                  location.pathname === tab.path
                    ? "border-blue-500 text-blue-600 font-semibold"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

export default Layout;
