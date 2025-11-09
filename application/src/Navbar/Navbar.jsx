import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import MenuButton from "./MenuButton";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const signOutRedirect = async () => {
    const clientId = "1a2t44pe0ate3m869hnu1q8ong";
    const logoutUri = "https://d1wars3xdlos6i.cloudfront.net/";
    const cognitoDomain = "https://ap-south-1ixlqtnfr0.auth.ap-south-1.amazoncognito.com/";

    await auth.removeUser();
    window.location.href = `${cognitoDomain}logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        
        <div className="text-xl font-bold text-blue-700">
          <Link to="/" className="hover:text-blue-600 transition-colors">View-AWS</Link>
        </div>

        <ul className="hidden md:flex items-center space-x-8 text-gray-700 font-semibold">
          <li><Link to="/instances" className="hover:text-blue-600 transition-colors">Instances</Link></li>
          <li><Link to="/dbs-rds" className="hover:text-blue-600 transition-colors">DBs & RDS</Link></li>
          <li><Link to="/eks-clusters" className="hover:text-blue-600 transition-colors">EKS Clusters</Link></li>
          <li><Link to="/s3-buckets" className="hover:text-blue-600 transition-colors">S3 Buckets</Link></li>
          <li>
            <button
              onClick={signOutRedirect}
              className="py-2 px-6 border-2 border-red-500 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-red-50 transition duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-75"
            >
              Logout
            </button>
          </li>
        </ul>

        <MenuButton onClick={toggleMenu} isOpen={isOpen} />

        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 
            ${isOpen ? "translate-x-0" : "translate-x-full"} md:hidden`}
        >
          <ul className="flex flex-col mt-20 space-y-6 p-6 text-gray-800 font-semibold">
            <li><Link to="/instances" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">Instances</Link></li>
            <li><Link to="/dbs-rds" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">DBs & RDS</Link></li>
            <li><Link to="/eks-clusters" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">EKS Clusters</Link></li>
            <li><Link to="/s3-buckets" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">S3 Buckets</Link></li>
            <li>
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOutRedirect();
                }}
                className="py-2 px-6 border-2 border-red-500 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-red-50 transition duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-75 block text-left"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 md:hidden z-40"
            onClick={toggleMenu}
          />
        )}
      </div>
    </nav>
  );
}
