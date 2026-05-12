FROM node:22-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies from the lockfile for reproducible builds.
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the app (static export → outputs to /app/out).
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx tsc --noEmit && npm run build

# Production image — serve the static export with nginx.
FROM nginx:alpine AS runner
COPY --from=builder /app/out /usr/share/nginx/html

# nginx default config serves index.html and handles 404 → index.html fallback.
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ $uri.html /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
