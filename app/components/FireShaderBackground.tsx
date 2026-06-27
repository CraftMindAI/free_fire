"use client";

import { useEffect, useRef } from "react";

export default function FireShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    
    const observer = new ResizeObserver(syncSize);
    observer.observe(canvas);
    syncSize();

    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_texCoord;
    
    // Create subtle heat distortion / smoke movement
    float n = noise(uv + u_time * 0.1);
    vec2 distortedUv = uv + vec2(sin(uv.y * 10.0 + u_time) * 0.005, cos(uv.x * 10.0 + u_time) * 0.005);
    
    // Crimson red glow pulse
    float pulse = (sin(u_time * 2.0) * 0.5 + 0.5) * 0.3;
    vec3 glowColor = vec3(1.0, 0.18, 0.18); // #FF2E2E
    
    // Vignette
    float vignette = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5));
    
    // Simulating flying embers (small bright dots)
    float embers = 0.0;
    for(int i=0; i<15; i++) {
        vec2 pos = vec2(noise(vec2(float(i), 1.0)), noise(vec2(float(i), 2.0)));
        pos.y = fract(pos.y + u_time * 0.2);
        pos.x += sin(u_time + float(i)) * 0.02;
        float d = length(uv - pos);
        embers += smoothstep(0.01, 0.0, d) * noise(vec2(float(i), 3.0));
    }

    vec3 finalColor = glowColor * pulse * (1.0 - uv.y); // Bottom glow
    finalColor += vec3(1.0, 0.5, 0.2) * embers; // Orange embers
    
    gl_FragColor = vec4(finalColor * vignette, finalColor.r * 0.5);
}`;

    function cs(type: number, src: string) {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    if (!prog) return;
    
    const vShader = cs(gl.VERTEX_SHADER, vs);
    const fShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return;
    
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    const startTime = Date.now();
    
    function render() {
      if (!canvas || !gl || !prog) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      const t = Date.now() - startTime;
      
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    
    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-black pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
