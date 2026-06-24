FROM node:22-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline --no-audit --no-fund
COPY . .
RUN npx prisma generate
RUN SKIP_ENV_VALIDATION=1 npx next build --webpack
RUN npm prune --omit=dev

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy dependencies and build outputs from builder
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "/app/scripts/docker-entrypoint.js"]
