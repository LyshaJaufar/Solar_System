import * as THREE from '../build/three.module.js';
import Stats from '../build/stats.module.js';
import { FlyControls } from '/FlyControls.js';
import { OrbitControls } from '/OrbitControls.js';
import { EffectComposer } from '/EffectComposer.js';
import { RenderPass } from '/RenderPass.js';
import { FilmPass } from '/FilmPass.js';

// Various three.js global variables
var scene,
    camera,
    renderer,
    composer,
    controls,
    cube,
    stats;

var dirLight,
    dirLight1,
    dirLight2,
    dirLight3,
    dirLight4;

const rotationSpeed = 0.02;
const radius = 6371;
const tilt = 0.41;

const cloudsScale = 1.005;
const moonScale = 0.23;

const MARGIN = 0;
let SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
let SCREEN_WIDTH = window.innerWidth;

const textureLoader = new THREE.TextureLoader();
const clock = new THREE.Clock();

let geometry, meshPlanet, meshClouds, meshMoon;
let d, dPlanet, dMoon;

init();
animate();

function init() {

    // Set up scene + renderer
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );
                                                                                                        
    camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	document.body.appendChild( renderer.domElement );
    
    lights();

	const geometry = new THREE.SphereGeometry(1, 32, 16);
	const materialNormalMap = new THREE.MeshPhongMaterial( {

		specular: 0x333333,
		shininess: 15,
		map: textureLoader.load( "textures/earth_atmos_2048.jpg" ),
		specularMap: textureLoader.load( "textures/earth_specular_2048.jpg" ),
		normalMap: textureLoader.load( "textures/earth_normal_2048.jpg" ),

		// y scale is negated to compensate for normal map handedness.
		normalScale: new THREE.Vector2( 0.85, - 0.85 )

	} );

	meshPlanet = new THREE.Mesh( geometry, materialNormalMap );
	scene.add(meshPlanet);

	const materialClouds = new THREE.MeshLambertMaterial( {

		map: textureLoader.load( "textures/earth_clouds_1024.png" ),
		transparent: true

	} );

	meshClouds = new THREE.Mesh( geometry, materialClouds );
	meshClouds.scale.set( cloudsScale, cloudsScale, cloudsScale );
	meshClouds.rotation.z = tilt;
	scene.add( meshClouds );

	// moon

	const materialMoon = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/moon_1024.jpg" )

	} );

	meshMoon = new THREE.Mesh( geometry, materialMoon );
	meshMoon.position.set( 2.5, 0, 0 );
	meshMoon.scale.set( moonScale, moonScale, moonScale );
	scene.add( meshMoon );


    // Orbital controls (rotation)
    controls = new OrbitControls(camera, renderer.domElement);


	// postprocessing
	const renderModel = new RenderPass( scene, camera );
	const effectFilm = new FilmPass( 0.35, 0.75, 2048, false );

	composer = new EffectComposer( renderer );

	composer.addPass( renderModel );
	composer.addPass( effectFilm )
};

function animate() {
	requestAnimationFrame(animate);
    controls.update();
    //render();
    renderer.render(scene, camera);

};

function render() {

	// rotate the planet and clouds
	const delta = clock.getDelta();

	meshPlanet.rotation.y += rotationSpeed * delta;

	// slow down as we approach the surface
	dPlanet = camera.position.length();

    d = ( dPlanet - radius * 1.01 );


	controls1.movementSpeed = 0.33 * d;
	controls1.update( delta );

	composer.render( delta );

}

function lights() {
    
    // Create lights, add lights to scene
	dirLight = new THREE.DirectionalLight( 0xffffff );
	dirLight.position.set( -1, 0, 1 ).normalize();
	scene.add( dirLight );



};

