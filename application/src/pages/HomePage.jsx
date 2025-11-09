import React from 'react';
import { useAuth } from 'react-oidc-context';

const HomePage = () => {
  const auth = useAuth();

  const signOutRedirect = async () => {
    const clientId = "1a2t44pe0ate3m869hnu1q8ong";
    const logoutUri = "https://d1wars3xdlos6i.cloudfront.net/";
    const cognitoDomain = "https://ap-south-1ixlqtnfr0.auth.ap-south-1.amazoncognito.com/";

    await auth.removeUser();
    window.location.href = `${cognitoDomain}logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  // Extract username from email (before "@")
  const userEmail = auth.user?.profile.email || "Guest";
  const username = userEmail.includes("@") ? userEmail.split("@")[0] : userEmail;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-4 border-blue-500 text-center"
        style={{ minWidth: "320px", maxWidth: "90%", display: "inline-block" }}>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-3">
          Welcome, {username}
        </h2>
        <p className="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed px-2">
          You are successfully logged in. You can now securely view and manage all AWS resources associated with account ID <span className="font-semibold text-gray-800">307621978721</span>.
        </p>
        <button
          onClick={signOutRedirect}
          className="py-3 px-10 border-2 border-red-500 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-red-50 transition duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-75 mx-auto block"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default HomePage;
