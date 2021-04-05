// Register Zfont plugin
Zfont.init(Zdog);

const textarea = document.getElementById('textarea');

// create illo
let illo = new Zdog.Illustration({
  element: '.Canvas',
  dragRotate: true,
  resize: true,
  rotate: {x: -0.32, y: 0.64, z: 0}
});

// create font
let font = new Zdog.Font({
	src: './fredokaone.ttf'
});

let text = new Zdog.Text({
  addTo: illo,
  font: font,
  value: textarea.value,
  fontSize: 48,
  textAlign: 'center',
  textBaseline: 'middle',
  color: '#fff',
  fill: true,
});

// text "shadow"
let shadow1 = text.copy({
  addTo: illo,
  translate: {z: -3},
  color: '#aab',
});
let shadow2 = text.copy({
  addTo: illo,
  translate: {z: -6},
  color: '#aab',
});

textarea.addEventListener('input', function() {
  text.value = textarea.value;
  shadow1.value = textarea.value;
  shadow2.value = textarea.value;
});

// animation loop
function animate() {
  illo.updateRenderGraph();
  requestAnimationFrame(animate);
}

animate();