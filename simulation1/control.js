const car = document.getElementById('car');
const arm = document.getElementById('arm');
const fingerL = document.getElementById('fingerL');
const fingerR = document.getElementById('fingerR');

let carX = (window.innerWidth - 50) / 2;
let carY = (window.innerHeight - 150) / 2;
let rotation = 0;
const step = 2.3; // Geschwindigkeit der Bewegung verringert

let armHeight = 80;
const armMin = 20, armMax = 200;

let gripperOpenAmount = 0; // 0 = geschlossen, 1 = vollständig geöffnet

let keysPressed = {};

function degToRad(deg) {
  return deg * Math.PI / 180;
}

function updateArm() {
  // Armlänge setzen
  arm.style.height = armHeight + 'px';
  arm.style.top = -armHeight + 'px';

  // Maximaler Winkel und maximale Verschiebung der Greiferfinger
  const maxRotate = 30; // maximale Rotationswinkel
  const maxTranslate = 10; // maximale Verschiebung in Pixel

  // Interpolierte Werte abhängig vom Öffnungsgrad
  const rotateL = -5 - (maxRotate - 5) * gripperOpenAmount;
  const rotateR = 5 + (maxRotate - 5) * gripperOpenAmount;
  const translateX = maxTranslate * gripperOpenAmount;

  // Transformation der linken und rechten Greiferfinger
  fingerL.style.transform = `rotate(${rotateL}deg) translateX(-${translateX}px)`;
  fingerR.style.transform = `rotate(${rotateR}deg) translateX(${translateX}px)`;
}

function moveCar(direction) {
  const rad = degToRad(rotation);
  let dx = 0, dy = 0;

  // Radius für die Kurvenfahrt, größerer Wert = größere Kurven
  const turnRadius = 150;

  switch (direction) {
    case 'w': // vorwärts
      dx = Math.sin(rad) * step;
      dy = -Math.cos(rad) * step;
      break;
    case 's': // rückwärts
      dx = -Math.sin(rad) * step;
      dy = Math.cos(rad) * step;
      break;
    case 'q': // links vorwärts Kurve
      rotation -= step / turnRadius * 180 / Math.PI; // Rotation proportional zur Bewegung
      const radQ = degToRad(rotation);
      dx = Math.sin(radQ) * step;
      dy = -Math.cos(radQ) * step;
      break;
    case 'e': // rechts vorwärts Kurve
      rotation += step / turnRadius * 180 / Math.PI;
      const radE = degToRad(rotation);
      dx = Math.sin(radE) * step;
      dy = -Math.cos(radE) * step;
      break;
  }

  carX += dx;
  carY += dy;

  // Begrenzung innerhalb des Fensters
  carX = Math.min(window.innerWidth - car.offsetWidth, Math.max(0, carX));
  carY = Math.min(window.innerHeight - car.offsetHeight, Math.max(0, carY));

  // Position und Rotation des Autos setzen
  car.style.left = carX + 'px';
  car.style.top = carY + 'px';
  car.style.transform = `rotate(${rotation}deg)`;
}

function controlLoop() {
  let changed = false;

  // Armhöhe steuern mit R und F
  if (keysPressed['r']) {
    const prev = armHeight;
    armHeight = Math.max(armMin, armHeight - 0.5);
    changed ||= (prev !== armHeight);
  }
  if (keysPressed['f']) {
    const prev = armHeight;
    armHeight = Math.min(armMax, armHeight + 0.5);
    changed ||= (prev !== armHeight);
  }
  if (changed) updateArm();

  // Greifer langsam öffnen/schließen mit T und G
  if (keysPressed['t']) {
    gripperOpenAmount += 0.02; // Geschwindigkeit des Öffnens (langsamer)
    if (gripperOpenAmount > 1) gripperOpenAmount = 1;
  }
  if (keysPressed['g']) {
    gripperOpenAmount -= 0.02; // Geschwindigkeit des Schließens (langsamer)
    if (gripperOpenAmount < 0) gripperOpenAmount = 0;
  }

  updateArm();

  // Bewegung und Rotation des Autos
  ['w', 's', 'q', 'e'].forEach(key => {
    if (keysPressed[key]) moveCar(key);
  });

  // Seitwärtsbewegung mit A und D (falls benötigt)
  if (keysPressed['a']) {
    carX -= step;
    carX = Math.max(0, carX);
    car.style.left = carX + 'px';
  }
  if (keysPressed['d']) {
    carX += step;
    carX = Math.min(window.innerWidth - car.offsetWidth, carX);
    car.style.left = carX + 'px';
  }

  requestAnimationFrame(controlLoop);
}

window.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
if (['w','a','s','d','q','e','r','f','t','g'].includes(key)) {
  keysPressed[key] = true;
  e.preventDefault();
}
});

window.addEventListener('keyup', e => {
  const key = e.key.toLowerCase();
  if (key in keysPressed) keysPressed[key] = false;
});

// Anfangswerte setzen
car.style.left = carX + 'px';
car.style.top = carY + 'px';
car.style.transform = `rotate(${rotation}deg)`;
updateArm();
controlLoop();
