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
const venusScale = 0.0086;
const cloudsScale = 0.009005;
const marsScale = 0.004867;
const jupiterScale = 0.100398;
const saturnScale = 0.0836258;
const uranusScale = 0.0364219;
const neptuneScale = 0.0353592;
const plutoScale = 0.00170649;
const moonScale = 0.23;

var mercuryMeanDis = 579;
var venusMeanDis = 1080;
var earthMeanDis = 1500;
var marsMeanDis = 2280;
var jupiterMeanDis = 7780;
var saturnMeanDis = 14300;
var uranusMeanDis = 28700;
var neptuneMeanDis = 45000;
var plutoMeanDis = 59000;

const MARGIN = 0;
let SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
let SCREEN_WIDTH = window.innerWidth;

let camera, controls, scene, renderer, stats;
let geometry, meshPlanet, meshClouds, meshMoon, meshSun, meshMercury, meshVenus,
	meshMars, meshJupiter, meshSaturn, meshUranus, meshNeptune, meshPluto;
let dirLight, dirLight1, dirLight2, dirLight3;

let composer;

const textureLoader = new THREE.TextureLoader();

let d, dPlanet, dMoon;
const dMoonVec = new THREE.Vector3();

const clock = new THREE.Clock();

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 25, SCREEN_WIDTH / SCREEN_HEIGHT, 50, 1e7 );
	camera.position.x = (radius + plutoMeanDis);
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

	// Mercury
	const materialMercury = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/mercury.jpg" )

	} );

	meshMercury = new THREE.Mesh( geometry, materialMercury );
	meshMercury.position.set( radius+mercuryMeanDis, 0, 0 );
	meshMercury.scale.set(mercuryScale, mercuryScale, mercuryScale );
	scene.add( meshMercury );

	// Venus
	const materialVenus = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/venus.jpg" )

	} );

	meshVenus = new THREE.Mesh( geometry, materialVenus );
	meshVenus.position.set( radius+venusMeanDis, 0, 0 );
	meshVenus.scale.set(venusScale, venusScale, venusScale );
	scene.add( meshVenus );

	// Earth
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


	// Mars
	const materialMars = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/mars.jpg" )

	} );

	meshMars = new THREE.Mesh( geometry, materialMars );
	meshMars.position.set( radius+marsMeanDis, 0, 0 );
	meshMars.scale.set(marsScale, marsScale, marsScale );
	scene.add( meshMars );

	// Jupiter
	const materialJupiter = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/jupiter.jpg" )

	} );

	meshJupiter = new THREE.Mesh( geometry, materialJupiter );
	meshJupiter.position.set( radius+jupiterMeanDis, 0, 0 );
	meshJupiter.scale.set(jupiterScale, jupiterScale, jupiterScale );
	scene.add( meshJupiter );

	// Saturn
	const materialSaturn = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/saturn.png" )

	} );

	meshSaturn = new THREE.Mesh( geometry, materialSaturn );
	meshSaturn.position.set( radius+saturnMeanDis, 0, 0 );
	meshSaturn.scale.set(saturnScale, saturnScale, saturnScale );
	scene.add( meshSaturn );

	// Uranus
	const materialUranus = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/uranus.jpg" )

	} );

	meshUranus = new THREE.Mesh( geometry, materialUranus );
	meshUranus.position.set( radius+uranusMeanDis, 0, 0 );
	meshUranus.scale.set(uranusScale, uranusScale, uranusScale );
	scene.add( meshUranus );

	// Neptune
	const materialNeptune = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/neptune.jpg" )

	} );

	meshNeptune = new THREE.Mesh( geometry, materialNeptune );
	meshNeptune.position.set( radius+neptuneMeanDis, 0, 0 );
	meshNeptune.scale.set(neptuneScale, neptuneScale, neptuneScale );
	scene.add( meshNeptune );

	// Pluto
	const materialPluto = new THREE.MeshPhongMaterial( {

		map: textureLoader.load( "textures/pluto.jpg" )

	} );

	meshPluto = new THREE.Mesh( geometry, materialPluto );
	meshPluto.position.set( radius+plutoMeanDis, 0, 0 );
	meshPluto.scale.set(plutoScale, plutoScale, plutoScale );
	scene.add( meshPluto );

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

	for ( let i = 10; i < 180; i ++ ) {

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



	dirLight2 = new THREE.DirectionalLight( 0xffffff );
	dirLight2.position.set( -1, 1, 1).normalize();
	scene.add( dirLight2 );

	dirLight3 = new THREE.DirectionalLight( 0xffffff );
	dirLight3.position.set( 1, -1, 1).normalize();
	scene.add( dirLight3 );

};