// Register Zfont plugin
Zfont.init(Zdog);

// create illo
let illo = new Zdog.Illustration({
  element: '.zdog-canvas',
  dragRotate: true,
});

let anchor = new Zdog.Anchor({
  addTo: illo
})

// create font
let font = new Zdog.Font({
	src: './fredokaone.ttf'
});

let title = new Zdog.Text({
  addTo: anchor,
  font: font,
  value: [
    'Zfont',
  ],
  translate: {y: -120},
  fontSize: 72,
  textAlign: 'center',
  textBaseline: 'middle',
  color: '#fff',
  fill: true,
});

let subtitle = new Zdog.Text({
  addTo: anchor,
  font: font,
  value: [
    'A text plugin for',
    'the Zdog 3D engine',
  ],
  stroke: 0,
  fontSize: 48,
  textAlign: 'center',
  textBaseline: 'middle',
  color: '#fff',
  fill: true,
});

// text "shadow"
title.copy({
  addTo: anchor,
  translate: {z: -8, y: -120},
  color: '#aab',
});

subtitle.copy({
  addTo: anchor,
  translate: {z: -6},
  color: '#aab',
});

// animation loop
function animate() {
  illo.updateRenderGraph();
  requestAnimationFrame(animate);
}

animate();