
var scene = null;
var camera = null;
var renderer = null;
var controls = null;
var teapots = [];

function init()
{
    scene = new THREE.Scene();
	scene.fog = new THREE.Fog(new THREE.Color(0xffffff), 0.1, 3250);
	scene.background = new THREE.Color(0xffffff);
    camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        10000
    );
	camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = 0;
    camera.lookAt(0, 0, 0);
	
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
	renderer.setAnimationLoop(animate);
	
	const half_teapots = 5000;
	
	
	for (var x = -half_teapots; x < half_teapots; x += 200)
	{
		for (var z = -half_teapots; z < half_teapots; z += 200)
		{
			var geometry = new THREE.TeapotBufferGeometry();
			var material = new THREE.MeshNormalMaterial();
			teapot = new THREE.Mesh(geometry, material);
			teapot.position.copy( new THREE.Vector3(x, 0, z) );
			teapot.fog = true;
			teapot.rotation.x = new Chance(window.performance.now()).random() * Math.PI * 1.9;
			teapot.rotation.y = new Chance(window.performance.now()).random() * Math.PI * 1.9;
			teapot.rotation.z = new Chance(window.performance.now()).random() * Math.PI * 1.9;
			teapot.userData.rotationRate = new Chance(window.performance.now()).floating({min: -0.1, max: 0.1});
			scene.add(teapot);
			teapots.push(teapot);
			//console.log( x + (x * z) )
			//console.log( (((half_teapots / 200) * 2) ^ 2) );
		}
	}
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.autoRotate = true;
	
	document.getElementById("loading_thing").style.display = "none";
}

function animate()
{
    renderer.render( scene, camera );
	
	camera.position.y += 2;
	teapots.forEach(function(teapot)
	{
		teapot.rotation.x += teapot.userData.rotationRate;
		teapot.rotation.z -= teapot.userData.rotationRate;
	});
	
	controls.update();
}

init();