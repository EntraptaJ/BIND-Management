FROM mhart/alpine-node:12
WORKDIR /app

RUN apk add --no-cache --virtual .gyp \
  python \
  make \
  g++
COPY tsconfig.json package.json package-lock.json ./
RUN npm install
COPY src /app/src/
RUN NODE_ENV=production npx tsc

FROM mhart/alpine-node:12
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache --virtual .gyp \
  python \
  make \
  g++
COPY package.json package-lock.json ./
RUN npm install --prod
RUN apk del .gyp

FROM alpine:3.10   
ENV NODE_ENV=production
COPY --from=1 /app/node_modules/ /app/node_modules/
COPY --from=1 /usr/bin/node /usr/bin/
COPY --from=1 /usr/lib/node_modules/ /usr/lib/node_modules/
COPY --from=1 /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY --from=0 /app/dist/ ./dist/
COPY package.json /app/
CMD NODE_ENV=production node /app/dist
