/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // TypeScript 7 (the native compiler) doesn't expose the legacy compiler API
    // Next's bundled type-checker expects. Route Next through the TS CLI so the
    // build type-checks with the same tsc that `npm run typecheck` uses.
    useTypeScriptCli: true,
  },
  // The share card is drawn by satori, which needs the font as bytes. Nothing
  // imports these two files, so the tracer has to be told they are needed.
  outputFileTracingIncludes: {
    "/api/share/match/[id]": ["./lib/fonts/*.ttf"],
  },
  images: {
    // Player photos live in a public Supabase storage bucket.
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};
export default nextConfig;
