// varying vec2 vUv;

//   void main() {
//     vUv = uv;
//     gl_Position = vec4(position, 1.0);
//   }

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vPosition = position;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}