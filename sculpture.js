// A procedural torus knot, built locally. No model downloads or third-party runtime.
export function createSculpture(canvas) {
  const gl = canvas.getContext('webgl', { alpha:true, antialias:true, powerPreference:'low-power' });
  if (!gl) throw new Error('WebGL unavailable');
  const vertex = `
    attribute vec3 aPosition; attribute vec3 aNormal;
    attribute vec3 aTarget; attribute vec3 aTargetNormal;
    uniform mat4 uRotation; uniform mat4 uProjection;
    uniform float uMorph; uniform float uScale; uniform vec2 uOffset;
    varying vec3 vNormal; varying vec3 vPosition;
    void main(){
      vec3 p=mix(aPosition,aTarget,uMorph);
      vec3 n=normalize(mix(aNormal,aTargetNormal,uMorph));
      vec3 world=(uRotation*vec4(p*uScale,1.)).xyz+vec3(uOffset,0.);
      vPosition=world; vNormal=normalize((uRotation*vec4(n,0.)).xyz);
      gl_Position=uProjection*vec4(world-vec3(0.,0.,8.2),1.);
    }`;
  const fragment = `
    precision highp float;
    varying vec3 vNormal; varying vec3 vPosition;
    uniform float uTint;
    vec3 environment(vec3 r){
      vec3 col=mix(vec3(.025,.035,.025),vec3(.42,.46,.38),smoothstep(-.65,.95,r.y));
      float strip=pow(max(0.,1.-abs(dot(r,normalize(vec3(.4,.75,.52))))),30.);
      float softbox=pow(max(0.,dot(r,normalize(vec3(-.7,.5,1.)))),10.);
      float edgebox=pow(max(0.,dot(r,normalize(vec3(.9,.1,.45)))),18.);
      float darkband=1.-.85*exp(-pow((r.y+.08)*6.,2.));
      col*=darkband;
      col+=vec3(.9,.97,.82)*strip*1.55;
      col+=vec3(.85,.9,.82)*softbox*1.6;
      col+=mix(vec3(.75,.85,.59),vec3(.64,.95,.12),uTint)*edgebox*1.9;
      return col;
    }
    void main(){
      vec3 n=normalize(vNormal);
      vec3 eye=normalize(vec3(0.,0.,8.2)-vPosition);
      vec3 reflection=reflect(-eye,n);
      vec3 color=environment(reflection);
      float fresnel=pow(1.-max(dot(n,eye),0.),3.);
      color+=mix(vec3(.16,.20,.12),vec3(.35,.48,.03),uTint)*fresnel;
      color*=.8+.2*max(n.y,0.);
      color=pow(color,vec3(.83));
      gl_FragColor=vec4(color,1.);
    }`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const mobile=matchMedia('(max-width:600px)').matches;
  const segments=mobile?180:300, sides=mobile?20:32;
  const positions=[],normals=[],targets=[],targetNormals=[],indices=[];
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const add=(a,b)=>a.map((v,i)=>v+b[i]);
  const mul=(a,s)=>a.map(v=>v*s);
  const norm=a=>mul(a,1/(Math.hypot(...a)||1));
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const curve=(u,torus)=>torus?[1.85*Math.cos(u),1.85*Math.sin(u),0]:[(1.35+.52*Math.cos(3*u))*Math.cos(2*u),(1.35+.52*Math.cos(3*u))*Math.sin(2*u),.78*Math.sin(3*u)];
  function tube(u,v,torus){
    const c=curve(u,torus), tangent=norm(sub(curve(u+.001,torus),curve(u-.001,torus)));
    const outward=norm(cross(tangent,[0,0,1]));const binormal=norm(cross(tangent,outward));
    const normal=add(mul(outward,Math.cos(v)),mul(binormal,Math.sin(v)));
    return {p:add(c,mul(normal,torus?.32:.29)),n:normal};
  }
  for(let i=0;i<=segments;i++)for(let j=0;j<=sides;j++){
    const a=tube(i/segments*Math.PI*2,j/sides*Math.PI*2,false),b=tube(i/segments*Math.PI*2,j/sides*Math.PI*2,true);
    positions.push(...a.p);normals.push(...a.n);targets.push(...b.p);targetNormals.push(...b.n);
    if(i<segments&&j<sides){const v=i*(sides+1)+j;indices.push(v,v+sides+1,v+1,v+1,v+sides+1,v+sides+2);}
  }
  function attribute(name,data){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}
  attribute('aPosition',positions);attribute('aNormal',normals);attribute('aTarget',targets);attribute('aTargetNormal',targetNormals);
  const indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  const uniforms=Object.fromEntries(['uRotation','uProjection','uMorph','uScale','uOffset','uTint'].map(n=>[n,gl.getUniformLocation(program,n)]));
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
  function multiply(a,b){const out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];return out;}
  function rotation(x,y,z){const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);return multiply(multiply([1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1],[cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1]),[cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1]);}
  let width=0,height=0;
  function resize(){const dpr=Math.min(devicePixelRatio||1,mobile?1.35:1.65);width=innerWidth;height=innerHeight;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);const aspect=width/height,f=1/Math.tan(Math.PI/8),near=.1,far=100;gl.uniformMatrix4fv(uniforms.uProjection,false,new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]));}
  resize();
  return {
    resize,
    draw({time=0,progress=0,intro=0,pointerX=0,pointerY=0,reduced=false}){
      if(gl.isContextLost())return;
      const small=width<=600, medium=width<=900;
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const phase=Math.max(0,Math.min(1,progress));
      const morph=Math.sin(phase*Math.PI);
      const spin=reduced?0:time*.09;
      gl.uniformMatrix4fv(uniforms.uRotation,false,rotation(.38+phase*1.4+pointerY*.14,.4+spin+phase*3.1+pointerX*.22,-.42+phase*1.5));
      gl.uniform1f(uniforms.uMorph,reduced?0:morph);
      const blend=intro*intro*(3.-2.*intro);
      gl.uniform1f(uniforms.uScale,small?.83-blend*.25:medium?1.04:1.28);
      gl.uniform2f(uniforms.uOffset,small?.06:width/height*(1.14+blend*.32),small?-.5-blend*1.02:.28-blend*.33);
      gl.uniform1f(uniforms.uTint,.55+phase*.45);
      gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
    },
    get available(){return !gl.isContextLost();}
  };
}
