import React from 'react';
import { Link } from 'react-router-dom';
export default function Home() {
  return (
    <div className="bg-gray-900 h-screen flex flex-col justify-center items-center">
      {/*Logo*/}
      <div className="flex justify-center items-center pb-8">
        <img className="  mt-16" src="./logo.png" alt="Logo" />
      </div>

      {/*Title*/}
      <div className="text-center text-white mb-6">
        <h1 className="text-4xl md:text-5xl font-semibold">Welcome to Our Platform</h1>
        <p className="text-lg md:text-xl mt-2 opacity-75">
          Start your journey with us today.
        </p>
      </div>

      {/*Button*/}
      <div className="flex justify-center">
        <Link to="/start">
          <button className="bg-blue-500 py-2 px-6 rounded-lg text-white font-semibold text-xl hover:bg-blue-700 transition duration-300 ease-in-out">
            Start
          </button>
        </Link>
      </div>
    </div>
  );
}
