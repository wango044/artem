import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LaserFlow.css';

const VERT = `
precision highp float;
attribute vec3 position;
void main(){
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform vec3 uColor;
uniform float uBeamXFrac;
uniform float uBeamYFrac;
uniform float uFlowSpeed;
uniform float uFogIntensity;
uniform float uWispDensity;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.123);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main(){
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 center = vec2(uBeamXFrac, 0.5 + uBeamYFrac);
  float t = iTime * uFlowSpeed;
  float beam = exp(-pow(abs(uv.y - center.y) * 9.0, 2.0));
  float vertical = exp(-pow(abs(uv.x - center.x) * 7.0, 2.0)) * smoothstep(0.95, 0.1, uv.y);
  float flare = exp(-distance(uv, center) * 5.0);
  float wisps = noise(vec2(uv.x * 40.0 - t * 8.0, uv.y * 8.0 + t)) * beam * uWispDensity;
  float fog = noise(vec2(uv.x * 3.0 + t, uv.y * 4.0 - t * 0.5)) * uFogIntensity;
  float alpha = clamp((beam * 0.52 + vertical * 0.62 + flare * 0.42 + wisps * 0.18 + fog * 0.16), 0.0, 1.0);
  vec3 color = uColor * alpha;
  gl_FragColor = vec4(color, alpha);
}
`;

const hexToRGB = hex => {
  let c = hex.trim();
  if (c[0] === '#') c = c.slice(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16) || 0xffffff;
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};

export default function LaserFlow({
  className,
  style,
  wispDensity = 1,
  dpr,
  horizontalBeamOffset = 0.1,
  verticalBeamOffset = 0,
  flowSpeed = 0.35,
  fogIntensity = 0.45,
  color = '#FF79C6',
}) {
  const mountRef = useRef(null);
  const uniformsRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, depth: false, powerPreference: 'high-performance' });
    const pr = Math.min(dpr ?? window.devicePixelRatio ?? 1, 2);
    renderer.setPixelRatio(pr);
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    const rgb = hexToRGB(color);
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, pr) },
      iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
      uColor: { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
      uBeamXFrac: { value: horizontalBeamOffset },
      uBeamYFrac: { value: verticalBeamOffset },
      uFlowSpeed: { value: flowSpeed },
      uFogIntensity: { value: fogIntensity },
      uWispDensity: { value: wispDensity },
    };
    uniformsRef.current = uniforms;
    const material = new THREE.RawShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.iResolution.value.set(w * pr, h * pr, pr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(canvas)) mount.removeChild(canvas);
    };
  }, [dpr]);

  useEffect(() => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    const rgb = hexToRGB(color);
    uniforms.uColor.value.set(rgb.r, rgb.g, rgb.b);
    uniforms.uBeamXFrac.value = horizontalBeamOffset;
    uniforms.uBeamYFrac.value = verticalBeamOffset;
    uniforms.uFlowSpeed.value = flowSpeed;
    uniforms.uFogIntensity.value = fogIntensity;
    uniforms.uWispDensity.value = wispDensity;
  }, [color, horizontalBeamOffset, verticalBeamOffset, flowSpeed, fogIntensity, wispDensity]);

  return <div ref={mountRef} className={`laser-flow-container ${className || ''}`} style={style} />;
}
