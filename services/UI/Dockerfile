FROM mhart/alpine-node:latest
WORKDIR /app
COPY package.json package-lock.json tsconfig.json .babelrc ./
RUN npm install
COPY ./server/ ./server/
COPY ./@types/ ./@types/
COPY ./icons/ ./icons/
COPY ./UI/ ./UI/
COPY ./bin/ ./bin/
COPY ./public/ ./public/
RUN NODE_ENV=production npm run build

FROM mhart/alpine-node:latest
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install --prod

FROM alpine:3.9
ENV NODE_ENV=production
COPY --from=1 /usr/bin/node /usr/bin/
COPY --from=1 /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
COPY --from=1 /app/node_modules/ /app/node_modules/
WORKDIR /app
COPY --from=0 /app/dist/ /app/dist/
COPY package.json /app/
CMD NODE_ENV=production node /app/dist/server

HEALTHCHECK --interval=5s --timeout=5s --retries=3 CMD wget localhost:81 -q -O - > /dev/null 2>&1
