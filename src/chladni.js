let particles, sliders, m, n, a, b;


// vibration strength params
let A = 0.02;
let minWalk = 0.002;

const settings = {
  nParticles : 20000,
  canvasSize : [600, 600],
  drawHeatmap : false
}



const pi = 3.1415926535;
const baseFrequency = 20; // Hz

const calculateFrequency = (m, n) => {
  return baseFrequency * m * n;
}

// chladni 2D closed-form solution - returns between -1 and 1
const chladni = (x, y, a, b, m, n) => 
  a * sin(pi*n*x) * sin(pi*m*y) + b * sin(pi*m*x) * sin(pi*n*y);

/* Initialization */

const DOMinit = () => {
  let canvas = createCanvas(...settings.canvasSize);
  canvas.parent('sketch-container');

  // sliders
  sliders = {
    m : {
      slider: select('#mSlider'), // freq param 1
      display: select('#mValue') // display element
    },
    n : {
      slider: select('#nSlider'), // freq param 2
      display: select('#nValue') // display element
    },
    a : {
      slider: select('#aSlider'), // freq param 3
      display: select('#aValue') // display element
    },
    b:{
      slider: select('#bSlider'), // freq param 4
      display: select('#bValue') // display element
    },
    v : {
      slider: select('#vSlider'), // vibration strength
      display: select('#vValue') // display element
    },
    num : {
      slider: select('#numSlider'), // vibration strength
      display: select('#npValue') // display element
    }
  }
}

const setupParticles = () => {
  // particle array
  particles = [];
  for (let i = 0; i < settings.nParticles; i++) {
    particles[i] = new Particle();
  }
}


/* Particle dynamics */

class Particle {

  constructor() {
    this.x = random(0,1);
    this.y = random(0,1);
    this.stochasticAmplitude;

    // this.color = [random(100,255), random(100,255), random(100,255)];
    
    this.updateOffsets();
  }

  move() {
    // what is our chladni value i.e. how much are we vibrating? (between -1 and 1, zeroes are nodes)
    let eq = chladni(this.x, this.y, a, b, m, n);

    // set the amplitude of the move -> proportional to the vibration
    this.stochasticAmplitude = v * abs(eq);

    if (this.stochasticAmplitude <= minWalk) this.stochasticAmplitude = minWalk;

    // perform one random walk
    this.x += random(-this.stochasticAmplitude, this.stochasticAmplitude);
    this.y += random(-this.stochasticAmplitude, this.stochasticAmplitude);
 
    this.updateOffsets();
  }

  updateOffsets() {
    // handle edges
    if (this.x <= 0) this.x = 0;
    if (this.x >= 1) this.x = 1;
    if (this.y <= 0) this.y = 0;
    if (this.y >= 1) this.y = 1;

    // convert to screen space
    this.xOff = width * this.x; // (this.x + 1) / 2 * width;
    this.yOff = height * this.y; // (this.y + 1) / 2 * height;
  }

  show() {
    // stroke(...this.color);
    point(this.xOff, this.yOff)
  }
}

const moveParticles = () => {
  let movingParticles = particles.slice(0, N);

  // particle movement
  for(let particle of movingParticles) {
    particle.move();
    particle.show();
  }
}



const updateParams = () => {
  m = sliders.m.slider.value();
  sliders.m.display.html(m);
  n = sliders.n.slider.value();
  sliders.n.display.html(n);
  a = sliders.a.slider.value();
  sliders.a.display.html(a);
  b = sliders.b.slider.value();
  sliders.b.display.html(b);
  v = sliders.v.slider.value();
  sliders.v.display.html(v);
  N = sliders.num.slider.value();
  sliders.num.display.html(N);

  let freq = calculateFrequency(m, n);
  // Display the frequency somewhere
  document.getElementById('freq').innerHTML = freq.toFixed(2) + ' Hz';
}



const drawHeatmap = () => {
  // draw the function heatmap in the background (not working)
  if (settings.drawHeatmap) {
    let res = 3;
    for (let i = 0; i <= width; i+=res) {
      for (let j = 0; j <= height; j+=res) {
        let eq = chladni(i/width, j/height, a, b, m, n);
        noStroke();
        fill((eq + 1) * 127.5);
        square(i, j, res);
      }
    }
  }
}



const wipeScreen = () => {
  background(30);
  stroke(255);
}



/* Timing */

// run at DOM load
function setup() {
  DOMinit();
  setupParticles();
}
// run each frame
function draw() {
  wipeScreen();
  updateParams();
  drawHeatmap();
  moveParticles();
}