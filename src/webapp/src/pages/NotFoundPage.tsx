import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-white p-12 rounded-lg shadow-md text-center max-w-lg w-full">
        <h1 className="text-6xl font-bold mb-4 text-blue-600">404</h1>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
