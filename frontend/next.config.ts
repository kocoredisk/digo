import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  async rewrites() {
    const apiUrl = process.env.BUILD_STANDALONE === 'true'
      ? (process.env.INTERNAL_API_URL || 'http://backend:3004')
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004');

    return [
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
    ];
  },

  async redirects() {
    return [
      // class.digo.kr → 수강신청 페이지
      { source: '/', has: [{ type: 'host', value: 'class.digo.kr' }], destination: '/axfirststone.html', permanent: false },
      { source: '/', destination: '/index.html', permanent: false },
      { source: '/lecture', destination: '/lecture/index.html', permanent: false },
      { source: '/hipus', destination: '/hipus.html', permanent: false },
      { source: '/minierp', destination: '/minierp.html', permanent: false },
      { source: '/mydoo', destination: '/mydoo.html', permanent: false },
      { source: '/axfirststone', destination: '/axfirststone.html', permanent: false },
    ];
  },
};

export default nextConfig;
