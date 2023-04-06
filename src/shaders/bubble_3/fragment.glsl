precision mediump sampler2DArray;

// precision mediump float; 
precision highp float;
precision mediump int;   

uniform sampler2D uTexture;
// uniform float uCameraAspect;

varying vec2 vUv;
varying vec4 vTexCoords;

void main()
{
    vec2 uv = vUv;
    vec2 positionalUv = (vTexCoords.xy / vTexCoords.w) * 0.5 + 0.5;


    float dist = length(uv - vec2(0.5));
    if(dist>0.5) discard;
    float r = 0.49;

    vec2 uv_display = positionalUv + vec2(0.0,0.1);

    float powered = pow(dist, 2.0) * 0.02;

    vec4 colour_x = texture2D(uTexture, uv_display + powered);
    vec4 colour_y = texture2D(uTexture, uv_display + powered * 1.2);
    vec4 colour_z = texture2D(uTexture, uv_display + powered * 1.2);
    
    // vec4 cc = texture2D(uTexture, uv_display + powered);

    // vec3 mixed = mix(cc.xyz, vec3(1.0), pow(dist, 2.0));
    vec3 mixed = mix(vec3(colour_x.x, colour_y.y, colour_z.z), vec3(1.0), pow(dist, 2.0));

    gl_FragColor = vec4(mixed, 1.0);
}