const car = document.getElementById('car');
const arm = document.getElementById('arm');
const wrist = document.getElementById('wrist');
const fingerL = document.getElementById('fingerL');
const fingerR = document.getElementById('fingerR');
// 获取四个轮子
const wheel1 = document.getElementById('wheel1');
const wheel2 = document.getElementById('wheel2');
const wheel3 = document.getElementById('wheel3');
const wheel4 = document.getElementById('wheel4');
const carWidth = 182.577;
const carHeight = 281.553;


// 轮子相对于 car 左上角的偏移量（请根据实际图片调整）
const wheelOffsets = [
  { left: 10, top: 20 },    // wheel1 左上
  { left: 130, top: 20 },   // wheel2 右上
  { left: 10, top: 230 },   // wheel3 左下
  { left: 130, top: 230 }   // wheel4 右下
];

let rotation = 0;
const step = 2.3;

let armHeight = 311.262;
const armMin = 20, armMax = 311.262;
let gripperOpenAmount = 0;
let keysPressed = {};

const armBaseHeight = 311.262;
const wristBaseHeight = 76.836;
const wristOffsetY = -61.051;
const wristOffsetX = -7.044;
const fingerL_X = -45.332;
const fingerR_X = 65.245;
const fingerY = -240.239;

function degToRad(deg) {
  return deg * Math.PI / 180;
}

function updateArm() {
  // 1. arm 以底边为基准，bottom 固定，height 变化
  arm.style.height = armHeight + 'px';
  arm.style.bottom = '0px';
  arm.style.top = ''; // 清空 top，避免冲突

  // 计算 arm 顶部的 top（相对于 car 容器）
  const armTop = carHeight - armHeight;

  // 2. wrist 跟随 arm 顶部移动，不缩放
  wrist.style.left = wristOffsetX + 'px';
  wrist.style.top = (armTop + wristOffsetY) + 'px';
  wrist.style.height = wristBaseHeight + 'px';
  wrist.style.width = '84.765px';

  // 3. 钳子跟随 arm 顶部移动，不缩放
  fingerL.style.left = fingerL_X + 'px';
  fingerL.style.top = (armTop + fingerY) + 'px';
  fingerR.style.left = fingerR_X + 'px';
  fingerR.style.top = (armTop + fingerY) + 'px';


  // 4. 钳子张合动画
  const maxRotate = 30;
  const maxTranslate = 10;
  const rotateL = -5 - (maxRotate - 5) * gripperOpenAmount;
  const rotateR = 5 + (maxRotate - 5) * gripperOpenAmount;
  const translateX = maxTranslate * gripperOpenAmount;

  fingerL.style.transform = `rotate(${rotateL}deg) translateX(-${translateX}px)`;
  fingerR.style.transform = `rotate(${rotateR}deg) translateX(${translateX}px)`;
}

// 更新四个轮子的位置和旋转
function updateWheels() {
  const wheels = [wheel1, wheel2, wheel3, wheel4];
  for (let i = 0; i < 4; i++) {
    wheels[i].style.transform = `rotate(${rotation}deg)`;
  }
}

function moveCar(direction) {
  const rad = degToRad(rotation);
  let dx = 0, dy = 0;
  const turnRadius = 150;

  switch (direction) {
    case 'w':
      dx = Math.sin(rad) * step;
      dy = -Math.cos(rad) * step;
      break;
    case 's':
      dx = -Math.sin(rad) * step;
      dy = Math.cos(rad) * step;
      break;
    case 'q':
      rotation -= step / turnRadius * 180 / Math.PI;
      break;
    case 'e':
      rotation += step / turnRadius * 180 / Math.PI;
      break;
  }

  carX += dx;
  carY += dy;

  carX = Math.min(window.innerWidth - carWidth, Math.max(0, carX));
  carY = Math.min(window.innerHeight - carHeight, Math.max(0, carY));

  car.style.left = carX + 'px';
  car.style.top = carY + 'px';
  car.style.transform = `rotate(${rotation}deg)`;
  updateWheels();
}

function controlLoop() {
  let changed = false;

  if (keysPressed['f']) {
    const prev = armHeight;
    armHeight = Math.max(armMin, armHeight - 0.5);
    changed ||= (prev !== armHeight);
  }
  if (keysPressed['r']) {
    const prev = armHeight;
    armHeight = Math.min(armMax, armHeight + 0.5);
    changed ||= (prev !== armHeight);
  }
  if (changed) updateArm();

  if (keysPressed['t']) {
    gripperOpenAmount += 0.02;
    if (gripperOpenAmount > 1) gripperOpenAmount = 1; // 限制最大
  }
  if (keysPressed['g']) {
    gripperOpenAmount -= 0.02;
    if (gripperOpenAmount < 0) gripperOpenAmount = 0; // 限制最小
  }

  updateArm();

  ['w', 's', 'q', 'e'].forEach(key => {
    if (keysPressed[key]) moveCar(key);
  });

  if (keysPressed['a']) {
    carX -= step;
    carX = Math.max(0, carX);
    car.style.left = carX + 'px';
  }
  if (keysPressed['d']) {
    carX += step;
    carX = Math.min(window.innerWidth - carWidth, carX);
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

// 保持窗口居中
function centerCar() {
  carX = (window.innerWidth - carWidth) / 2;
  carY = (window.innerHeight - carHeight) / 2;
  car.style.left = carX + 'px';
  car.style.top = carY + 'px';
  car.style.transform = `rotate(${rotation}deg)`;
  updateWheels();
}

// 初始化
centerCar();
updateArm();
updateWheels();
controlLoop();