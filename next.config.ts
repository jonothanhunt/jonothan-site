import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ["http://blog.lvh.me", "http://lvh.me"],
  },
  //   domains: ["jonothan.dev", "blog.jonothan.dev"],
  //   async rewrites() {
  //     return {
  //       beforeFiles: [
  //         // Handle static assets for blog subdomain
  //         {
  //           source: "/_next/:path*",
  //           has: [
  //             {
  //               type: "host",
  //               value: "blog.jonothan.dev",
  //             },
  //           ],
  //           destination: "/_next/:path*",
  //         },
  //         {
  //           source: "/_next/:path*",
  //           has: [
  //             {
  //               type: "host",
  //               value: "blog.lvh.me",
  //             },
  //           ],
  //           destination: "/_next/:path*",
  //         },
  //         // Handle favicon and other root assets
  //         {
  //           source: "/favicon.ico",
  //           has: [
  //             {
  //               type: "host",
  //               value: "blog.jonothan.dev",
  //             },
  //           ],
  //           destination: "/favicon.ico",
  //         },
  //         {
  //           source: "/favicon.ico",
  //           has: [
  //             {
  //               type: "host",
  //               value: "blog.lvh.me",
  //             },
  //           ],
  //           destination: "/favicon.ico",
  //         },
  //         // Handle other static files in public directory
  //         {
  //           source: "/public/:path*",
  //           has: [
  //             {
  //               type: "host",
  //               value: "blog.jonothan.dev",
  //             },
  //           ],
  //           destination: "/public/:path*",
  //         },
  //         {
  //           source: "/public/:path*",
  //           has: [
  //             {
  //               type: "host",
  //               value: "blog.lvh.me",
  //             },
  //           ],
  //           destination: "/public/:path*",
  //         },
  //         // Handle regular page requests for blog subdomain
  //         {
  //           source: "/:path*",
  //           has: [
  //             {
  //               type: "host",
  //               value: "blog.jonothan.dev",
  //             },
  //           ],
  //           destination: "/blog/:path*",
  //         },
  //         {
  //           source: "/:path*",
  //           has: [
  //             {
  //               type: "host",
  //               value: "blog.lvh.me",
  //             },
  //           ],
  //           destination: "/blog/:path*",
  //         },
  //       ],
  //     };
  //   },
};

export default nextConfig;
