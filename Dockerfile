FROM node:22-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN SKIP_ENV_VALIDATION=1 npm run build
RUN npm prune --production

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache postgresql-client

# Copy dependencies and build outputs from builder
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "/app/scripts/docker-entrypoint.js"]
