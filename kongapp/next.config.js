/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // OpenTelemetry 관련 폴리필
        "@opentelemetry/core": false,
        "@opentelemetry/sdk-trace-base": false,
        "@opentelemetry/sdk-metrics": false,
        "@grpc/grpc-js": false,
        "node-fetch": false,
        "shimmer": false,
        "uuid": false,
        "data-uri-to-buffer": false,
        // Genkit AI 관련 패키지 무시
        "@genkit-ai/ai": false,
        "@genkit-ai/googleai": false,
        "@genkit-ai/next": false,
        "@genkit-ai/core": false,
        "genkit": false
      };
    }
    
    // src/ai 디렉토리 완전히 무시
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /src\/ai\/.+\.(js|jsx|ts|tsx)$/,
          use: 'ignore-loader',
        }
      ]
    };
    
    return config;
  },
};

module.exports = nextConfig;
