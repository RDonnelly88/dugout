/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // TypeScript 7 (the native compiler) doesn't expose the legacy compiler API
    // Next's bundled type-checker expects. Route Next through the TS CLI so the
    // build type-checks with the same tsc that `npm run typecheck` uses.
    useTypeScriptCli: true,
  },
  images: {
    // Player photos live in a public Supabase storage bucket.
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};
export default nextConfig;
