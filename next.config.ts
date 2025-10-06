import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

console.log("SERVER sees:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

export default nextConfig;
