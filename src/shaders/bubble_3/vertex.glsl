varying vec2 vUv;
varying vec4 vTexCoords;
  
void main() {
  // VERTEX POSITION
  
  vec4 mvPosition = vec4( position, 1.0 );
  #ifdef USE_INSTANCING
    mvPosition = instanceMatrix * mvPosition;
  #endif
  
  vec4 modelViewPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * modelViewPosition;

  vUv = uv;
  vTexCoords = projectionMatrix * viewMatrix * instanceMatrix * vec4(position, 1.0);
  
}