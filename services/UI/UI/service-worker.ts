declare function importScripts(url: string): void;
/* eslint-env service-worker */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

declare const workbox: typeof import('workbox-sw');

const precacheManifest = ['App.tsx', 'client.tsx'];

workbox.precaching.precacheAndRoute(precacheManifest, {});

workbox.routing.registerRoute(
  /^https?.*/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'offlineCache',
    plugins: [new workbox.expiration.Plugin({ maxEntries: 200, purgeOnQuotaError: false })]
  }),
  'GET'
);
