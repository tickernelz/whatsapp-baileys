// WebSocket polyfill for Next.js compatibility
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
if (typeof window === 'undefined') {
  // Server-side polyfills
  global.WebSocket = global.WebSocket || require('ws');
  
  // Polyfill for buffer utilities
  try {
    const bufferUtil = require('bufferutil');
    if (!bufferUtil.mask) {
      bufferUtil.mask = function(source: Buffer, mask: Buffer, output: Buffer, offset: number, length: number) {
        for (let i = 0; i < length; i++) {
          output[offset + i] = source[i] ^ mask[i % 4];
        }
      };
    }
    if (!bufferUtil.unmask) {
      bufferUtil.unmask = function(buffer: Buffer, mask: Buffer) {
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] ^= mask[i % 4];
        }
      };
    }
  } catch (error) {
    // Fallback if bufferutil is not available
    console.warn('bufferutil not available, using fallback');
  }
}

export {};