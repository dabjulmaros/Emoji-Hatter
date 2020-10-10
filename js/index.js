//-----------------------------//
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext("2d");
const img = document.querySelector("#result");

let selectedLayer=0;
var mousePosX,mousePosY,originalX,originalY;;
let moving = false;

const settingsTemplate={
  "value":"",
  "OffsetX":0,
  "OffsetY":0,
  "SizeOffset":0,
  "Mirror":false,
  "Rotation":0,
  "Transparency":100
};
const layers = document.getElementById('layers');

let settings=[];

// use these alignment properties for "better" positioning
ctx.textAlign = "center";
ctx.textBaseline = "middle";

generateMad();
function generateHatted(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // The size of the emoji is set with the font
  for(var layer = settings.length-1;layer>=0;layer--){
    ctx.font = `${160+parseInt(settings[layer].SizeOffset)}px sans-serif`;
    ctx.fillStyle=`rgba(0,0,0,${settings[layer].Transparency/100})`;
    ctx.save();
    ctx.translate(canvas.width*(1/2)+parseInt(settings[layer].OffsetX),canvas.height*(1/2)+parseInt(settings[layer].OffsetY));
    ctx.rotate(parseInt(settings[layer].Rotation) * Math.PI / 180);
    if(settings[layer].Mirror){
      ctx.scale(-1,1);
    }
    ctx.fillText(settings[layer].value,0,0);
    ctx.restore();
  }

  img.src=canvas.toDataURL("image/png");

  // canvas.toBlob(function(blob) {
  //     const item = new ClipboardItem({ "image/png": blob });
  //     navigator.clipboard.write([item]);
  // });
}
  

document.querySelectorAll('#showSettings').forEach(node=>{
  node.addEventListener('click',e=>{
    if(e.currentTarget.classList.contains('rotate')){
      e.currentTarget.classList.remove('rotate');
      e.currentTarget.parentElement.nextElementSibling.classList.remove("show");
    }else{
      e.currentTarget.classList.add('rotate');
      e.currentTarget.parentElement.nextElementSibling.classList.add("show");
    }
  });
});

document.getElementById('addItem').addEventListener('click',e=>{
    addLayer();
});
document.getElementById('removeItem').addEventListener('click',e=>{
    removeLayer(selectedLayer);
});
document.getElementById('resetCanvas').addEventListener('click',e=>{
  let c = confirm("You are about to remove everything.");
  if(c){
    for(var layer = settings.length-1;layer>=0;layer--){
      removeLayer(layer);
    }
    addLayer();
    generateHatted();
  }
});

document.getElementById("Mirror").addEventListener("click",e=>{
  settings[selectedLayer].Mirror=!settings[selectedLayer].Mirror;
  generateHatted();
});

function addLayer(){
  settings.unshift(JSON.parse(JSON.stringify(settingsTemplate)));
  const div = document.createElement('div');
  div.classList.add('block','layer');
  const input = document.createElement('input');
  const divBreak = document.createElement('div');
  divBreak.classList.add('break');
  input.type="text";
  div.appendChild(divBreak);
  div.appendChild(input);
  div.addEventListener('click',e=>{
    let target = e.target;
    if(target.tagName==="INPUT"){
      target=target.parentElement;
    }
    selectedLayer=getLayer(target);
    changeSelectedLayer();
  });
  input.addEventListener('input',e=>{
    let layer = getLayer(e.target.parentElement);
    settings[layer].value = e.target.value;
    generateHatted();
  })
  layers.insertBefore(div,layers.childNodes[0]);
  selectedLayer = 0;
  changeSelectedLayer();
}

function removeLayer(layer){
  layers.removeChild(layers.children[layer]);
  settings.splice(layer,1);

  if(selectedLayer !== 0)
    selectedLayer--;

  if(settings.length)
    changeSelectedLayer();

  generateHatted();
}

function changeSelectedLayer(){
  if(document.querySelector('.selected')!==null)
    document.querySelector('.selected').classList.remove('selected');
  
  layers.children[selectedLayer].classList.add('selected');
  
  setSize(settings[selectedLayer].SizeOffset);
  setOffsetX(settings[selectedLayer].OffsetX)
  setOffsetY(settings[selectedLayer].OffsetY)
  setRotation(settings[selectedLayer].Rotation);
  setOpacity(settings[selectedLayer].Transparency);
  setMirror(settings[selectedLayer].Mirror);
}

document.getElementById("SizeSlide").addEventListener("change",e=>{
  setSize(e.currentTarget.value);
  generateHatted();
});

document.getElementById("SizeField").addEventListener("change",e=>{
  setSize(e.currentTarget.value);
  generateHatted();
});
document.getElementById("OffsetXSlide").addEventListener("change",e=>{
  setOffsetX(e.currentTarget.value);
  generateHatted();
});
document.getElementById("OffsetXField").addEventListener("change",e=>{
  setOffsetX(e.currentTarget.value);
  generateHatted();
});
document.getElementById("OffsetYSlide").addEventListener("change",e=>{
  setOffsetY(e.currentTarget.value);
  generateHatted();
});
document.getElementById("OffsetYField").addEventListener("change",e=>{
  setOffsetY(e.currentTarget.value);
  generateHatted();
});

img.addEventListener("mousedown",e=>{
  mousePosX= e.offsetX-200;
  mousePosY= e.offsetY-200;
  originalX = settings[selectedLayer].OffsetX;
  originalY = settings[selectedLayer].OffsetY;
  moving = true;
});

img.addEventListener("mouseup",e=>{
  moving = false;
});

img.addEventListener('mousemove',e=>{
  if(moving){
    setOffsetX(originalX + (e.offsetX-200 - mousePosX));
    setOffsetY(originalY + (e.offsetY-200 - mousePosY));
    generateHatted();
  }
})

document.getElementById("RotationSlide").addEventListener("change",e=>{
  setRotation(e.currentTarget.value);;
  generateHatted();
});
document.getElementById("RotationField").addEventListener("change",e=>{
  setRotation(e.currentTarget.value);
  generateHatted();
});
document.getElementById("TransparencySlide").addEventListener("change",e=>{
  setOpacity(e.currentTarget.value);
  generateHatted();
});
document.getElementById("TransparencyField").addEventListener("change",e=>{
  setOpacity(e.currentTarget.value);
  generateHatted();
});
  
document.getElementById('Reset').addEventListener('click',e=>{
  setSize(0);
  setOffsetX(0);
  setOffsetY(0);
  setRotation(0)
  setOpacity(100);
  setMirror(false);
  generateHatted();
});

function getLayer(t){
  const target = t;
  const parent = target.parentElement;
  let layer=-1;
  for(var x= 0;x<parent.childElementCount;x++){
    if(parent.children[x] == target){
        layer=x;
    }
  }
  return layer;
}

function generateMad(){
  for(var x = 0;x<3;x++)addLayer();

  settings=[{
    "value":"☕",
    "OffsetX":-105,
    "OffsetY":-35,
    "SizeOffset":-60,
    "Mirror":false,
    "Rotation":135,
    "Transparency":100
  },{
    "value":"🎩",
    "OffsetX":55,
    "OffsetY":-50,
    "SizeOffset":0,
    "Mirror":false,
    "Rotation":0,
    "Transparency":100
  },{
    "value":"🤪",
    "OffsetX":55,
    "OffsetY":80,
    "SizeOffset":0,
    "Mirror":false,
    "Rotation":0,
    "Transparency":100
  }];
  layers.children[0].querySelector('input').value="☕";
  layers.children[1].querySelector('input').value="🎩";
  layers.children[2].querySelector('input').value="🤪";
  generateHatted();
}

function setOffsetX(num){
  document.getElementById("OffsetXField").value=num;
  document.getElementById("OffsetXSlide").value=num;
  settings[selectedLayer].OffsetX=num;
}
function setOffsetY(num){
  document.getElementById("OffsetYField").value=num;
  document.getElementById("OffsetYSlide").value=num;
  settings[selectedLayer].OffsetY=num;
}
function setRotation(num){
  document.getElementById("RotationField").value=num;
  document.getElementById("RotationSlide").value=num;
  settings[selectedLayer].Rotation=num;
}
function setOpacity(num){
  document.getElementById("TransparencyField").value=num;
  document.getElementById("TransparencySlide").value=num;
  settings[selectedLayer].Transparency=num;
}
function setSize(num){
  document.getElementById("SizeField").value=num;
  document.getElementById("SizeSlide").value=num;
  settings[selectedLayer].SizeOffset=num;
}
function setMirror(bool){
  document.getElementById("Mirror").checked=bool;
  settings[selectedLayer].hatMirror=bool;
}

