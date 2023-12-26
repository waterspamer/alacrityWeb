"use strict";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';




const scene = new THREE.Scene();
scene.background = new THREE.Color(1,1,1,0);
const camera = new THREE.PerspectiveCamera( 
    75, window.innerWidth / window.innerHeight, 0.1, 1000 );
``
const renderer = new THREE.WebGLRenderer(
    {antialias: true,
        canvas: document.getElementById("сube_canvas")}
);


document.addEventListener( 'mousemove', onMouseMove, false );


var target = new THREE.Vector3();

const mouse = new THREE.Vector2();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var raycaster = new THREE.Raycaster();
var meshes = [];


function vertexShader(){
    return `

    uniform float mFresnelBias;
    uniform float mFresnelScale;
    uniform float mFresnelPower;
    uniform float utime;

    varying vec2 vertexUV;
    varying vec3 vertexNormal;
    varying vec3 worldNormal;
    varying vec3 camPos;
    varying vec3 eyeVector;
    varying vec3 vPositionW;

void main() {
    camPos = cameraPosition;
    vec4 worldPosition = modelViewMatrix * vec4( position, 1.0);
    vPositionW = vec3( vec4( position, 1.0 ) * modelMatrix);

    vertexUV = uv;
    vertexNormal = normalMatrix * normal;
    worldNormal = normalize( vec3( vec4( normal, 0.0 ) * modelViewMatrix ));
    eyeVector = normalize(worldPosition.xyz - cameraPosition);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`
}

function fragmentShader(){
    return `uniform sampler2D _MainTex;

    varying vec2 vertexUV;
    varying vec3 vertexNormal;
    varying vec3 eyeVector;
    varying vec3 camPos;
    varying vec3 worldNormal;
    varying vec3 vPositionW;
    
    float Fresnel(vec3 eyeVector, vec3 worldNormal) {
        return pow( 1.0 + dot( eyeVector, worldNormal), 3.0 );
      }

    void main() {
        
         vec3 viewDirectionW = normalize(camPos - vPositionW);
         float fresnelTerm = 1.0 - pow(dot(vec3(0,0,1), vertexNormal), .3);
         //fresnelTerm = 1.0 -pow(clamp(1.0 - fresnelTerm, 0., 1.), 5.3);
        gl_FragColor = vec4(texture2D(_MainTex, 
        vertexUV).rgb, 1);
        //gl_FragColor += vec4(fresnelTerm * 0.3 * vec3(1,1,1),1);
        float diffuseLight = pow(dot(vertexNormal, vec3(-0, 0, 1)), .9);
        gl_FragColor = max(vec4(pow(1.0-diffuseLight *.1, 17.5),pow(1.0-diffuseLight *.1, 17.5),pow(1.0-diffuseLight *.1, 17.5) , 1), gl_FragColor);
        //gl_FragColor = vec4(0,1,0,1);
    }`
}



const geometry = new THREE.BoxGeometry( .5, .5, .5 );
const material = new THREE.ShaderMaterial({ 
    vertexShader : vertexShader(),
    fragmentShader : fragmentShader(),
    uniforms:{
        _MainTex:{
            value: new THREE.TextureLoader().load('./models/cubeTex.png')
        }
    } 
});
const wireMaterial = new THREE.MeshToonMaterial ({color: 0x000000});

wireMaterial.wireframe = true;

var cube2 = new THREE.Mesh( geometry, wireMaterial );
var cube = new THREE.Mesh( geometry, wireMaterial );
scene.add( cube );
scene.add(cube2);


var cubeObject;



const fbxLoader = new FBXLoader();




fbxLoader.load (
    'models/LOGOCube.fbx',
    (object) => {
        object.traverse(function (child) {
             if (child.isMesh) {
                child.material = material;
                 // (child as THREE.Mesh).material = material
                 console.log(child)
             }
         })
        
        
        cubeObject = object;
        console.log(cubeObject)
        cubeObject.scale.set(.005,.005,.005)
        cube.add(cubeObject)
    }
)

console.log (meshes.length);


camera.position.z = 5;

window.addEventListener("resize", onWindowResize());
    
const pointer = new THREE.Vector2();


function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        renderer.setSize(window.innerWidth, window.innerHeight);
    }


function onPointerMove (event){
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}


function onMouseMove( event ) {
    event.preventDefault();
	mouse.x = ( event.clientX - windowHalfX );
	mouse.y = ( event.clientY - windowHalfY );
}



window.addEventListener( 'pointermove', onPointerMove );


var stopRotate = false;

function animate() {
    
	requestAnimationFrame( animate );


    target.x = ( 1 - mouse.x ) * -0.0015;
    target.y = ( 1 - mouse.y ) * -0.002;
    onWindowResize();
  cube.rotation.x += 0.25 * ( target.y - cube.rotation.x );
  cube.rotation.y += 0.25 * ( target.x - cube.rotation.y );

    
  cube2.rotation.x = -0.1 * ( target.y - cube2.rotation.x );
  cube2.rotation.y = -0.1 *  ( target.x - cube2.rotation.y );

  renderer.render( scene, camera );

}

animate();