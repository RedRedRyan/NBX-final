/**
 * Empty mock for node modules that shouldn't be bundled in the browser.
 * Used to satisfy imports from test files that accidentally get bundled.
 */

// Named exports with unique prefixes to avoid variable name collisions
export const __emptyMockTest = () => { };
export const __emptyMockJoin = () => '';
export const test = __emptyMockTest;
export const join = __emptyMockJoin;

// Default export
const emptyMock = {};
export default emptyMock;
