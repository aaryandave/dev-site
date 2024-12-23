"use client";

import { Navigation } from "../components/nav"; // Reuse the Navigation component
import Particles from "../components/particles"; // Reuse the Particles component

export default function NotFoundPage() {
  return (
    <div className="relative flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      <Particles className="absolute inset-0 -z-10" quantity={200} />
      <Navigation />
      <div className="flex flex-col items-center text-center mt-20">
        <h1
          className="text-9xl font-bold text-white relative group transition-transform duration-500 hover:scale-110"
        >
          404
          <span
            className="absolute top-0 left-0 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 blur-md opacity-0 group-hover:opacity-100 group-hover:blur-none transition-all duration-500"
            aria-hidden="true"
          >
            404
          </span>
        </h1>

        <p className="mt-4 text-lg text-zinc-400">
          How the <em>FUCK</em> did you get here? 
        </p>
      </div>
    </div>
  );
}