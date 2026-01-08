// Mock for pino/thread-stream to avoid Turbopack bundling issues
// These packages have test files that break the Turbopack bundler

const noop = () => { };
const noopLogger = {
    info: noop,
    warn: noop,
    error: noop,
    debug: noop,
    trace: noop,
    fatal: noop,
    child: () => noopLogger,
    level: 'silent',
};

export default noopLogger;
export const pino = () => noopLogger;
