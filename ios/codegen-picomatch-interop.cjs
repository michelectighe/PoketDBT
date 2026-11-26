// Make picomatch's CommonJS API compatible with tinyglobby's bundled ESM
// interop when React Native Codegen is invoked from Xcode.
const Module = require('node:module');
const originalLoad = Module._load;

Module._load = function loadWithPicomatchInterop(request, parent, isMain) {
  const loaded = originalLoad.call(this, request, parent, isMain);
  if (
    request === 'picomatch' &&
    typeof loaded === 'function' &&
    typeof loaded.scan === 'function' &&
    parent?.filename?.includes('/tinyglobby/dist/index.cjs') &&
    loaded.default === undefined
  ) {
    Object.defineProperty(loaded, 'default', { value: loaded });
  }
  return loaded;
};
