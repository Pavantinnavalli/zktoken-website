/* ═══════════════════════════════════════════════════════════════
   ZKTokenOpt — Shader v2: Warm Copper Topographic Flow
   A flowing topo-map style rather than the generic particle grid
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('shader-bg');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vertSrc = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const fragSrc = `
    precision mediump float;
    uniform float u_t;
    uniform vec2 u_res;
    uniform float u_scroll;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1,0)), f.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p = p * 2.0 + vec2(0.3);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_t * 0.08;
      float s = u_scroll * 0.0003;

      // Topographic contour lines
      vec2 p = uv * 3.0 + vec2(t, s);
      float f = fbm(p);
      float f2 = fbm(p + vec2(1.7, 9.2) + t * 0.3);

      // Generate contour lines from the noise field
      float contour = abs(fract(f * 8.0) - 0.5) * 2.0;
      contour = smoothstep(0.0, 0.08, contour);

      float contour2 = abs(fract(f2 * 6.0) - 0.5) * 2.0;
      contour2 = smoothstep(0.0, 0.12, contour2);

      // Warm ivory base
      vec3 base = vec3(0.965, 0.945, 0.920);

      // Copper contour lines
      vec3 lineColor = vec3(0.722, 0.451, 0.204); // copper
      vec3 lineColor2 = vec3(0.478, 0.365, 0.275); // muted brown

      vec3 color = base;
      color = mix(color, mix(base, lineColor2, 0.08), 1.0 - contour2);
      color = mix(color, mix(base, lineColor, 0.12), 1.0 - contour);

      // Subtle vignette
      float vig = 1.0 - smoothstep(0.3, 1.5, length((uv - 0.5) * 1.4));
      color = mix(vec3(0.94, 0.92, 0.89), color, vig);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, vertSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uT = gl.getUniformLocation(prog, 'u_t');
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uScroll = gl.getUniformLocation(prog, 'u_scroll');

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize);
  resize();

  const t0 = performance.now();
  (function loop() {
    gl.uniform1f(uT, (performance.now() - t0) / 1000);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uScroll, scrollY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(loop);
  })();
})();
