/**
 * TODO:
 * 
*/

const maskCanvas = document.createElement('canvas');
const maskCtx = maskCanvas.getContext('2d');

const maskingControl = document.getElementById('maskingControls')
const toolToggle = document.getElementById('toolToggle');
const squareTool = "check_box_outline_blank";
const circleTool = "radio_button_unchecked";

maskCanvas.width = canvas.width;
maskCanvas.height = canvas.height;

const controlCanvas = document.createElement('canvas');
const controlCtx = controlCanvas.getContext('2d');

controlCanvas.width = canvas.width;
controlCanvas.height = canvas.height;

const maskingImg = document.querySelector('img#mask');

let maskingSettings = { tool: 1, size: 10 };

let setShift = false;
let shiftDir = null;
let shiftConstVal = 0;


function toggleTool() {
  let tool;
  if (maskingSettings.tool == 1) {
    maskingSettings.tool = 0;
    tool = circleTool;
  } else if (maskingSettings.tool == 0) {
    maskingSettings.tool = 1;
    tool = squareTool;
  }
  toolToggle.querySelector('.icon').textContent = tool;
}
toggleTool();


maskingImg.addEventListener('mousemove', e => {
  e.preventDefault();
  processMouse(e);
})

maskingImg.addEventListener("mousedown", e => {
  processMouse(e);
});

maskingImg.addEventListener("mouseup", e => {
  if (setShift) {
    setShift = false;
    shiftDir = null;
  }
})

maskingImg.addEventListener('mouseleave', e => {
  controlCtx.clearRect(0, 0, controlCanvas.width, controlCanvas.height);
  generateMask();
});

maskingImg.addEventListener('contextmenu', e => {
  e.preventDefault();
})

maskingImg.addEventListener('wheel', e => {
  e.preventDefault();

  maskingSettings.size += e.deltaY / 5;

  if (maskingSettings.size < 5) {
    maskingSettings.size = 5;
  }
  else if (maskingSettings.size > 200) {
    maskingSettings.size = 200;
  }
  // drawControl(controlCanvas.width / 2, controlCanvas.height / 2);
  // generateMask();
  processMouse(e);
});

function processMouse(e) {

  let x = e.offsetX;
  let y = e.offsetY;

  if (e.shiftKey && shiftDir == null && e.buttons) {
    if (Math.abs(e.movementX) > Math.abs(e.movementY)) {
      setShift = true;
      shiftDir = 'x';
      shiftConstVal = e.offsetY;
    } else if (Math.abs(e.movementX) < Math.abs(e.movementY)) {
      setShift = true
      shiftDir = 'y';
      shiftConstVal = e.offsetX;
    }
  }

  if (setShift) {
    if (shiftDir == 'x') {
      y = shiftConstVal;
    } else if (shiftDir == 'y') {
      x = shiftConstVal;
    }
  }

  drawControl(x, y);
  if (e.buttons) {
    drawMask(x, y, e.altKey || e.buttons == 2);
    generateHatted();
  }
  generateMask();
}

function generateMask() {
  // const renderCanvas = document.createElement('canvas');
  // const renderCtx = renderCanvas.getContext('2d');

  // renderCanvas.width = canvas.width;
  // renderCanvas.height = canvas.height;

  // renderCtx.drawImage(maskCanvas, 0, 0);
  // renderCtx.drawImage(controlCanvas, 0, 0);

  // maskingImg.src = renderCanvas.toDataURL("image/png");

  maskingImg.src = controlCanvas.toDataURL("image/png");
  settings[selectedLayer].Mask.src = maskCanvas.toDataURL("image/png");
}


function drawControl(x, y) {
  controlCtx.clearRect(0, 0, controlCanvas.width, controlCanvas.height);

  setPath(controlCtx, x, y);

  controlCtx.stroke()
}

function drawMask(x, y, remove) {
  maskCtx.fillStyle = `rgba(255,255,255,1)`;

  if (remove) {
    maskCtx.globalCompositeOperation = 'destination-out';
  } else {
    maskCtx.globalCompositeOperation = 'source-over';
  }

  setPath(maskCtx, x, y);

  maskCtx.fill();
}

function setPath(ctx, x, y) {
  ctx.beginPath();
  if (maskingSettings.tool == 0) {
    ctx.arc(x, y, maskingSettings.size, 0, 2 * Math.PI);
  } else if (maskingSettings.tool == 1) {
    ctx.rect(x - maskingSettings.size / 2, y - maskingSettings.size / 2, maskingSettings.size, maskingSettings.size)
  }
}