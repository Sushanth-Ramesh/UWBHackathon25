'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const goToUploadPage = () => {
    router.push('/upload');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <h1 className="text-5xl font-bold text-center mb-6 text-green-900">Welcome to CarbonCraft 🌿</h1>
      <p className="text-lg text-center mb-10 max-w-xl text-gray-800">
        Your one-stop platform to easily track and reduce your carbon footprint.
        Upload your energy usage and get personalized insights!
      </p>
      <button
        onClick={goToUploadPage}
        className="px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition transform hover:scale-105"
      >
        Start Calculating 🚀
      </button>
    </main>
  );
}