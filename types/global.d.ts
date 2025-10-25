declare module 'pg';

declare global {
  // pool attached to globalThis to avoid creating multiple pools during hot reload
  var __pgPool: any;
}

export {};
