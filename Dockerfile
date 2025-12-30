FROM node:25.2-slim

WORKDIR /app

COPY package*.json yarn.lock* pnpm-lock.yaml* ./

RUN if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else npm i; \
    fi

COPY . .

ENV NODE_ENV=prod
ENV PORT=6606

RUN npm run build
EXPOSE 6606
CMD npm run start
