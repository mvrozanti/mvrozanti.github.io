import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,
    env: {
        TOKEN_GITHUB: process.env.TOKEN_GITHUB,
    }
};

export default nextConfig;
