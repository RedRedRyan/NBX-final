// app/polyfills.ts
"use client";

import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
    // 1. Make Buffer globally available for the SDK
    if (!window.Buffer) {
        window.Buffer = Buffer;
    }

    // 2. Make process globally available (safely)
    if (!window.process) {
        // @ts-ignore
        window.process = { env: {} };
    }
}