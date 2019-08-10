FROM mhart/alpine-node:12
WORKDIR /app
COPY tsconfig.json package.json package-lock.json ./
COPY src /app/src/
RUN apk add --no-cache --virtual .gyp \
  python \
  make \
  g++ \ 
  && npm ci && NODE_ENV=production npx tsc

FROM mhart/alpine-node:12
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN apk add --no-cache --virtual .gyp \
  python \
  make \
  g++ \
  && npm ci --prod \
  && apk del .gyp

FROM alpine:3.9
ENV NODE_ENV=production
COPY --from=1 /app/node_modules/ /app/node_modules/
COPY --from=1 /usr/bin/node /usr/bin/
COPY --from=1 /usr/lib/node_modules/ /usr/lib/node_modules/
COPY --from=1 /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
WORKDIR /app
COPY --from=0 /app/dist/ ./dist/
COPY package.json /app/
CMD NODE_ENV=production node /app/dist
