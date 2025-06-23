// Referenzen auf die Hauptelemente des Autos und Greifarms
const car = document.getElementById('car');
const arm = document.getElementById('arm');
const wrist = document.getElementById('wrist');
const fingerL = document.getElementById('fingerL');
const fingerR = document.getElementById('fingerR');
// Referenzen auf die vier Räder
const wheel1 = document.getElementById('wheel1');
const wheel2 = document.getElementById('wheel2');
const wheel3 = document.getElementById('wheel3');
const wheel4 = document.getElementById('wheel4');
const carWidth = 127.804;   // 182.577 * 0.7
const carHeight = 197.087;  // 281.553 * 0.7

// Offset-Werte der Räder relativ zur linken oberen Ecke des Autos (ggf. anpassen)
const wheelOffsets = [
  { left: 7, top: 14 },     // 10*0.7, 20*0.7
  { left: 91, top: 14 },    // 130*0.7, 20*0.7
  { left: 7, top: 161 },    // 10*0.7, 230*0.7
  { left: 91, top: 161 }    // 130*0.7, 230*0.7
];

let rotation = 0;
const step = 2.3;

// Armhöhe (Steuerung des Arms)
let armHeight = 217.883;    // 311.262 * 0.7
const armMin = 14, armMax = 217.883; // 20*0.7, 311.262*0.7
let gripperOpenAmount = 0; // Öffnungsgrad des Greifers (0 = zu, 1 = maximal offen)
let keysPressed = {}; // Merkt gedrückte Tasten

// Basiswerte für Arm und Handgelenk (Positionierung)
const armBaseHeight = 217.883;       // 311.262 * 0.7
const wristBaseHeight = 53.785;      // 76.836 * 0.7
const wristBaseWidth = 59.336;       // 84.765 * 0.7
const wristOffsetY = -42.736;        // -61.051 * 0.7
const wristOffsetX = -5.431;         // -7.044 * 0.7
const fingerL_X = -31.732;           // -45.332 * 0.7
const fingerR_X = 44.672;            // 65.245 * 0.7
const fingerY = -169.867;            // -240.239 * 0.7

// Hilfsfunktion: Grad in Radiant umrechnen
function degToRad(deg) {
  return deg * Math.PI / 180;
}

// Aktualisiert die Position und Darstellung des Arms und Greifers
function updateArm() {
  // 1. Der Arm wird von unten nach oben skaliert (bottom bleibt fixiert, Höhe verändert sich)
  arm.style.height = armHeight + 'px';
  arm.style.bottom = '0px';
  arm.style.top = ''; // top zurücksetzen, um Konflikte zu vermeiden

  // Berechnet die obere Kante des Arms relativ zum Auto-Container
  const armTop = carHeight - armHeight;

  // 2. Das Handgelenk folgt der Armspitze, bleibt aber in der Größe konstant
  wrist.style.left = wristOffsetX + 'px';
  wrist.style.top = (armTop + wristOffsetY) + 'px';
  wrist.style.height = wristBaseHeight + 'px';
  wrist.style.width = wristBaseWidth + 'px';

  // 3. Die Greiferfinger folgen ebenfalls der Armspitze, bleiben aber in der Größe konstant
  fingerL.style.left = fingerL_X + 'px';
  fingerL.style.top = (armTop + fingerY) + 'px';
  fingerR.style.left = fingerR_X + 'px';
  fingerR.style.top = (armTop + fingerY) + 'px';


  // 4. Animation für das Öffnen und Schließen der Greiferfinger
  // Die Finger rotieren und verschieben sich horizontal je nach Öffnungsgrad
  const maxRotate = 20;      // maximaler Öffnungswinkel
  const maxTranslate = 10;   // maximale horizontale Verschiebung (Pixel)
  const rotateL = -5 - (maxRotate - 5) * gripperOpenAmount;
  const rotateR = 5 + (maxRotate - 5) * gripperOpenAmount;
  const translateX = maxTranslate * gripperOpenAmount;

  fingerL.style.transform = `rotate(${rotateL}deg) translateX(-${translateX}px)`;
  fingerR.style.transform = `rotate(${rotateR}deg) translateX(${translateX}px)`;
}

// Aktualisiert die Drehung aller vier Räder (optische Animation)
function updateWheels() {
  const wheels = [wheel1, wheel2, wheel3, wheel4];
  for (let i = 0; i < 4; i++) {
    wheels[i].style.transform = `rotate(${rotation}deg)`;
  }
}

// Bewegt das Auto in die gewünschte Richtung (vorwärts, rückwärts, drehen)
function moveCar(direction) {
  const rad = degToRad(rotation);
  let dx = 0, dy = 0;
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
    case 'q': // nach links drehen
      rotation -= step / turnRadius * 180 / Math.PI;
      break;
    case 'e': // nach rechts drehen
      rotation += step / turnRadius * 180 / Math.PI;
      break;
  }

  carX += dx;
  carY += dy;

  // Begrenzung: Das Auto bleibt im sichtbaren Bereich des Fensters
  carX = Math.min(window.innerWidth - carWidth, Math.max(0, carX));
  carY = Math.min(window.innerHeight - carHeight, Math.max(0, carY));

  car.style.left = carX + 'px';
  car.style.top = carY + 'px';
  car.style.transform = `rotate(${rotation}deg)`;
  updateWheels();
}

// Hauptsteuerungsschleife: prüft gedrückte Tasten und aktualisiert Positionen/Animationen
function controlLoop() {
  let changed = false;

  // Arm senken
  if (keysPressed['f']) {
    const prev = armHeight;
    armHeight = Math.max(armMin, armHeight - 0.5);
    changed ||= (prev !== armHeight);
  }
  // Arm heben
  if (keysPressed['r']) {
    const prev = armHeight;
    armHeight = Math.min(armMax, armHeight + 0.5);
    changed ||= (prev !== armHeight);
  }
  if (changed) updateArm();

  // Greifer öffnen
  if (keysPressed['t']) {
    gripperOpenAmount += 0.02;
    if (gripperOpenAmount > 1) gripperOpenAmount = 1; // Maximalwert
  }
  // Greifer schließen
  if (keysPressed['g']) {
    gripperOpenAmount -= 0.02;
    if (gripperOpenAmount < 0) gripperOpenAmount = 0; // Minimalwert
  }

  updateArm();

  // Bewegung: vorwärts, rückwärts, drehen
  ['w', 's', 'q', 'e'].forEach(key => {
    if (keysPressed[key]) moveCar(key);
  });

  // Seitwärtsbewegung nach links
  if (keysPressed['a']) {
    carX -= step;
    carX = Math.max(0, carX);
    car.style.left = carX + 'px';
  }
  // Seitwärtsbewegung nach rechts
  if (keysPressed['d']) {
    carX += step;
    carX = Math.min(window.innerWidth - carWidth, carX);
    car.style.left = carX + 'px';
  }

  requestAnimationFrame(controlLoop);
}

// Tastendruck-Handler: merkt gedrückte Steuerungstasten
window.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  if (['w','a','s','d','q','e','r','f','t','g'].includes(key)) {
    keysPressed[key] = true;
    e.preventDefault();
  }
});

// Tastenloslassen-Handler: setzt gedrückte Tasten zurück
window.addEventListener('keyup', e => {
  const key = e.key.toLowerCase();
  if (key in keysPressed) keysPressed[key] = false;
});

// Zentriert das Auto beim Start im Fenster
function centerCar() {
  carX = (window.innerWidth - carWidth) / 2;
  carY = (window.innerHeight - carHeight) / 2;
  car.style.left = carX + 'px';
  car.style.top = carY + 'px';
  car.style.transform = `rotate(${rotation}deg)`;
  updateWheels();
}

// Animation für die Räder (optional, falls Container vorhanden)
// Holt die Container und Bilder der Räder
const wheelContainers = [
  document.getElementById('wheel1-container'),
  document.getElementById('wheel2-container'),
  document.getElementById('wheel3-container'),
  document.getElementById('wheel4-container')
];
const wheelImgs = [
  wheelContainers[0]?.querySelector('.wheel-img'),
  wheelContainers[1]?.querySelector('.wheel-img'),
  wheelContainers[2]?.querySelector('.wheel-img'),
  wheelContainers[3]?.querySelector('.wheel-img')
];
const wheelImgHeight = 33.6;         // 48 * 0.7
let wheelOffsetsY = [0, 0, 0, 0]; // Aktuelle Y-Offsets für jedes Rad

// Aktualisiert die Animation der Räder (vertikales Scrollen für optischen Effekt)
function updateWheelAnimation() {
  for (let i = 0; i < 4; i++) {
    if (!wheelContainers[i] || !wheelImgs[i]) continue;
    wheelOffsetsY[i] -= 1.2;
    if (wheelOffsetsY[i] <= -wheelImgHeight) {
      wheelOffsetsY[i] += wheelImgHeight;
    }
    // Hauptbild
    wheelImgs[i].style.position = 'absolute';
    wheelImgs[i].style.left = '0px';
    wheelImgs[i].style.width = '33.6px';
    wheelImgs[i].style.height = '33.6px';
    let y = wheelOffsetsY[i] % wheelImgHeight;
    if (y < 0) y += wheelImgHeight;
    wheelImgs[i].style.top = (y - wheelImgHeight) + 'px';
    // Kopie für nahtlose Schleife
    let copyImg = wheelContainers[i].querySelector('.wheel-img-copy');
    if (!copyImg) {
      copyImg = wheelImgs[i].cloneNode();
      copyImg.classList.add('wheel-img-copy');
      wheelContainers[i].appendChild(copyImg);
    }
    copyImg.style.position = 'absolute';
    copyImg.style.left = '0px';
    copyImg.style.width = '33.6px';
    copyImg.style.height = '33.6px';
    copyImg.style.top = y + 'px';
  }
  requestAnimationFrame(updateWheelAnimation);
}

// Initialisierung: Auto zentrieren, Arm und Räder setzen, Steuerung und Animation starten
centerCar();
updateArm();
updateWheels();
controlLoop();
updateWheelAnimation(); // Startet die Rad-Animation