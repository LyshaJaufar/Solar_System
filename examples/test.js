import * as THREE from '../build/three.module.js';

import Stats from '../build/stats.module.js';

import { FlyControls } from '/FlyControls.js';
import { EffectComposer } from '/EffectComposer.js';
import { RenderPass } from '/RenderPass.js';
import { FilmPass } from '/FilmPass.js';

const radius = 3000;
const tilt = 0.41;
const rotationSpeed = 0.02;

const earthScale = 0.009;
const mercuryScale = 0.0035;
const cloudsScale = 0.009005;
const moonScale = 0.23;

var mercuryMeanDis = 579;
var venusMeanDis = 1080;
var earthMeanDis = 1500;

const MARGIN = 0;
let SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
let SCREEN_WIDTH = window.innerWidth;

let camera, controls, scene, renderer, stats;
let geometry, meshPlanet, meshClouds, meshMoon, meshSun, meshMercury;
let dirLight, dirLight1, dirLight2, dirLight3;

let composer;

const textureLoader = new THREE.TextureLoader();

let d, dPlanet, dMoon;
const dMoonVec = new THREE.Vector3();

const clock = new THREE.Clock();

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 50, 1e7 );
	camera.position.x = (radius + earthMeanDis)+100;
	camera.position.z = radius;

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );

	lights();

	// Sun
	const materialSun = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/sun.png" )

	});
	geometry = new THREE.SphereGeometry( radius, 100, 50 );

	meshSun = new THREE.Mesh( geometry, materialSun );
	meshSun.rotation.y = 0;
	meshSun.rotation.z = tilt;
	scene.add( meshSun );


	const materialNormalMap = new THREE.MeshPhongMaterial( {

		specular: 0x333333,
		shininess: 15,
		map: textureLoader.load( "textures/earth_atmos_2048.jpg" ),
		specularMap: textureLoader.load( "textures/earth_specular_2048.jpg" ),
		normalMap: textureLoader.load( "textures/earth_normal_2048.jpg" ),

		// y scale is negated to compensate for normal map handedness.
		normalScale: new THREE.Vector2( 0.85, - 0.85 )

	} );

	// Mercury
	const materialMercury = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/mercury.jpg" )

	} );

	meshMercury = new THREE.Mesh( geometry, materialMercury );
	meshMercury.position.set( radius+mercuryMeanDis, 0, 0 );
	meshMercury.scale.set(mercuryScale, mercuryScale, mercuryScale );
	scene.add( meshMercury );


	// planet
	meshPlanet = new THREE.Mesh( geometry, materialNormalMap );
	meshPlanet.position.set( radius+earthMeanDis, 0, 0 );
	meshPlanet.scale.set( earthScale, earthScale, earthScale );
	meshPlanet.rotation.y = 0;
	meshPlanet.rotation.z = tilt;
	scene.add( meshPlanet );

	// clouds
	const materialClouds = new THREE.MeshLambertMaterial( {

		map: textureLoader.load( "textures/earth_clouds_1024.png" ),
		transparent: true

	} );

	meshClouds = new THREE.Mesh( geometry, materialClouds );
	meshClouds.position.set( radius+earthMeanDis, 0, 0 );
	meshClouds.scale.set( cloudsScale, cloudsScale, cloudsScale );
	meshClouds.rotation.z = tilt;
	scene.add( meshClouds );

	// moon
	const materialMoon = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/moon_1024.jpg" )

	} );

	meshMoon = new THREE.Mesh( geometry, materialMoon );
	meshMoon.position.set( radius+900, 0, 0 );
	meshMoon.scale.set( 0.0035, 0.0035, 0.0035 );
	//scene.add( meshMoon );

	// stars

	const r = radius, starsGeometry = [ new THREE.BufferGeometry(), new THREE.BufferGeometry() ];

	const vertices1 = [];
	const vertices2 = [];

	const vertex = new THREE.Vector3();

	for ( let i = 0; i < 250; i ++ ) {

		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( r );

		vertices1.push( vertex.x, vertex.y, vertex.z );

	}

	for ( let i = 0; i < 1500; i ++ ) {

		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( r );

		vertices2.push( vertex.x, vertex.y, vertex.z );

	}

	starsGeometry[ 0 ].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices1, 3 ) );
	starsGeometry[ 1 ].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices2, 3 ) );

	const starsMaterials = [
		new THREE.PointsMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
		new THREE.PointsMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
	];

	for ( let i = 10; i < 30; i ++ ) {

		const stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

		stars.rotation.x = Math.random() * 6;
		stars.rotation.y = Math.random() * 6;
		stars.rotation.z = Math.random() * 6;
		stars.scale.setScalar( i * 10 );

		stars.matrixAutoUpdate = false;
		stars.updateMatrix();

		scene.add( stars );

	}

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	document.body.appendChild( renderer.domElement );

	//

	controls = new FlyControls( camera, renderer.domElement );

	controls.movementSpeed = 1000;
	controls.domElement = renderer.domElement;
	controls.rollSpeed = Math.PI / 24;
	controls.autoForward = false;
	controls.dragToLook = false;

	//

	stats = new Stats();
	document.body.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize );

	// postprocessing

	const renderModel = new RenderPass( scene, camera );
	const effectFilm = new FilmPass( 0.35, 0.75, 2048, false );

	composer = new EffectComposer( renderer );

	composer.addPass( renderModel );
	composer.addPass( effectFilm );

}

function onWindowResize() {

	SCREEN_HEIGHT = window.innerHeight;
	SCREEN_WIDTH = window.innerWidth;

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	composer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

}

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {

	// rotate the planet and clouds

	const delta = clock.getDelta();

	meshPlanet.rotation.y += rotationSpeed * delta;
	meshClouds.rotation.y += 1.25 * rotationSpeed * delta;

	// slow down as we approach the surface

	dPlanet = camera.position.length();

	dMoonVec.subVectors( camera.position, meshMoon.position );
	dMoon = dMoonVec.length();

	if ( dMoon < dPlanet ) {

		d = ( dMoon - radius * moonScale * 1.01 );

	} else {

		d = ( dPlanet - radius * 1.01 );

	}

	controls.movementSpeed = 0.33 * d;
	controls.update( delta );

	composer.render( delta );

}
function lights() {
    
    // Create lights, add lights to scene
	dirLight = new THREE.DirectionalLight( 0xffffff );
	dirLight.position.set( -1, 0, 1 ).normalize();
	scene.add( dirLight );

	dirLight1 = new THREE.DirectionalLight( 0xffffff );
	dirLight1.position.set(  1, 0, -1 ).normalize();
	scene.add( dirLight1 );

	dirLight2 = new THREE.DirectionalLight( 0xffffff );
	dirLight2.position.set( -1, 1, 1).normalize();
	scene.add( dirLight2 );

	dirLight3 = new THREE.DirectionalLight( 0xffffff );
	dirLight3.position.set( 1, -1, 1).normalize();
	scene.add( dirLight3 );

    dirLight3 = new THREE.DirectionalLight( 0xffffff );
	dirLight3.position.set( -1, -1, -1).normalize();
	scene.add( dirLight3 );

};