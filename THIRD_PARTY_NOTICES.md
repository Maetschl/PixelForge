# Third-party notices

PixelForge vendors the following browser libraries under `dist/vendor/three/` so the application can run without a CDN or runtime network request.

## Three.js

Three.js and its example loaders and controls are distributed under the MIT License.

- Project: <https://github.com/mrdoob/three.js>
- License: <https://github.com/mrdoob/three.js/blob/dev/LICENSE>

This includes the core module and the local `OrbitControls`, `GLTFLoader`, `OBJLoader`, `MTLLoader`, `FBXLoader`, and supporting parser modules used by PixelForge.

## fflate

The vendored `fflate` utility used by the Three.js loaders is distributed under the MIT License.

- Project: <https://github.com/101arrowz/fflate>
- License: <https://github.com/101arrowz/fflate/blob/master/LICENSE>

No third-party library is fetched from a CDN at runtime.
