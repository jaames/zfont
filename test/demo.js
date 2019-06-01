// Register Zfont plugin
Zfont.init(Zdog);

// create illo
let illo = new Zdog.Illustration({
  element: '.zdog-canvas',
  dragRotate: true,
});

// create font
let font = new Zdog.Font({
	src: './fredokaone.ttf'
});

// create text
let text = new Zdog.Text({
  addTo: illo,
  font: font,
  value: 'Hey, Zdog!',
  textAlign: 'center',
  color: '#fff',
  fill: true,
});

// text "shadow"
text.copy({
  addTo: illo,
  translate: {z: -8},
  color: '#aab'
});

// animation loop
function animate() {
  illo.updateRenderGraph();
  requestAnimationFrame(animate);
}

animate();