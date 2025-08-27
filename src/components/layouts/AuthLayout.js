// File: src/components/layouts/AuthLayout.js
export default function AuthLayout({ children }) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {children}
      </div>
    );
  }