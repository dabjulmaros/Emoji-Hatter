/**
 * TODO:
 * 1-- Detect if text in fields are emojis or text
 *      if text is detected show controls to customize text
 *
 * 2-- Add custom emoji keyboard
 *      Have it support search and recently used emojis...
 *      Just like the system emoji keyboard... but worse
 * 
 * 3-- Add base 64 image support??
 */
//-----------------------------//
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const img = document.querySelector("#result");

let selectedLayer = 0;
var mousePosX, mousePosY, originalX, originalY;

var lastScrolled = "Size"; // used for scroll... possible values size, rotation, opacity

const settingsTemplate = {
  value: "",
  OffsetX: 0,
  OffsetY: 0,
  SizeOffset: 0,
  Mirror: false,
  Color: { r: 0, g: 0, b: 0 },
  Font: "sans-serif",
  Stroke: false,
  StrokeWidth: 0,
  Rotation: 0,
  Transparency: 100,
  Masking: false,
  Mask: null
};
const layers = document.getElementById("layers");

let settings = [];


generateMad();
function generateHatted() {


  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // The size of the emoji is set with the font
  for (var layer = settings.length - 1; layer >= 0; layer--) {
    ctx.drawImage(renderLayer(layer), 0, 0);
  }


  img.src = canvas.toDataURL("image/png");

  // canvas.toBlob(function (blob) {
  //   const item = new ClipboardItem({ "image/png": blob });
  //   navigator.clipboard.write([item]);
  // });
}

function renderLayer(layer) {
  const renderCanvas = document.createElement('canvas');
  const renderCtx = renderCanvas.getContext('2d');

  renderCanvas.width = canvas.width;
  renderCanvas.height = canvas.height;

  renderCtx.textAlign = "center";
  renderCtx.textBaseline = "middle";

  renderCtx.font = `${160 + parseInt(settings[layer].SizeOffset)}px ${fontSelector(settings[layer].Font, settings[layer].value)}`;
  renderCtx.fillStyle = `rgba(${settings[layer].Color?.r ?? 0},${settings[layer].Color?.g ?? 0},${settings[layer].Color?.b ?? 0},${settings[layer].Transparency / 100})`;

  if (settings[layer].Mask != null) {
    renderCtx.globalCompositeOperation = 'source-out';
    if (layer != selectedLayer) {
      renderCtx.drawImage(settings[layer].Mask, 0, 0);
    } else {
      renderCtx.drawImage(maskCanvas, 0, 0)
    }

  }

  renderCtx.translate(
    (renderCanvas.width / 2) + parseInt(settings[layer].OffsetX),
    (renderCanvas.height / 2) + parseInt(settings[layer].OffsetY)
  );


  renderCtx.rotate((parseInt(settings[layer].Rotation) * Math.PI) / 180);
  if (settings[layer].Mirror) {
    renderCtx.scale(-1, 1);
  }
  if (settings[layer].Stroke) {
    renderCtx.strokeStyle = `rgba(${settings[layer].Color?.r ?? 0},${settings[layer].Color?.g ?? 0},${settings[layer].Color?.b ?? 0},${settings[layer].Transparency / 100})`;
    renderCtx.lineWidth = settings[layer].StrokeWidth;
    renderCtx.strokeText(settings[layer].value, 0, 0);
  } else {
    renderCtx.fillText(settings[layer].value, 0, 0);
  }

  return renderCanvas;
}

document.querySelectorAll("#showSettings").forEach((node) => {
  node.addEventListener("click", (e) => {
    if (e.currentTarget.classList.contains("rotate")) {
      e.currentTarget.classList.remove("rotate");
      e.currentTarget.parentElement.nextElementSibling.classList.remove("show");
    } else {
      e.currentTarget.classList.add("rotate");
      e.currentTarget.parentElement.nextElementSibling.classList.add("show");
    }
  });
});

["Size", "Rotation", "Transparency", "StrokeWidth"].forEach((name) => {
  document.getElementById(`${name}Label`).addEventListener("click", (e) => {
    lastScrolled = name;
    setScrolling(name);
  });
});
document.querySelectorAll('input[type="number"]').forEach((ele) => {
  ele.addEventListener("wheel", (e) => {
    if ("createEvent" in document) {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", false, true);
      e.target.dispatchEvent(evt);
    } else e.target.fireEvent("onchange");
  });
});

document.getElementById("addItem").addEventListener("click", (e) => {
  settings.unshift(JSON.parse(JSON.stringify(settingsTemplate)));
  addLayer();
  selectedLayer = 0;
  changeSelectedLayer();
});
document.getElementById("removeItem").addEventListener("click", (e) => {
  removeLayer(selectedLayer);
});
document.getElementById("resetCanvas").addEventListener("click", (e) => {
  let c = confirm("You are about to remove everything.");
  if (c) {
    resetCanvas();
    settings.unshift(JSON.parse(JSON.stringify(settingsTemplate)));
    addLayer();
    selectedLayer = 0;
    changeSelectedLayer();
    generateHatted();
  }
});

document.getElementById("Mirror").addEventListener("click", (e) => {
  settings[selectedLayer].Mirror = !settings[selectedLayer].Mirror;
  generateHatted();
});

document.getElementById("Stroke").addEventListener("click", (e) => {
  settings[selectedLayer].Stroke = !settings[selectedLayer].Stroke;
  generateHatted();
});



function addLayer() {
  const div = document.createElement("div");
  div.classList.add("block", "layer");

  const input = document.createElement("input");
  input.type = "text";

  const controls = document.createElement("div");
  controls.classList.add("layerControl");

  const layerUp = document.createElement("button");
  layerUp.addEventListener("click", (e) => {
    event.stopPropagation();
    pos = getLayer(document.querySelector(".selected"));
    moveLayer(pos, -1);
  });
  layerUp.innerHTML = `<span class="material-icons-round">expand_less</span>`;

  const layerDown = document.createElement("button");
  layerDown.addEventListener("click", (e) => {
    event.stopPropagation();
    pos = getLayer(document.querySelector(".selected"));
    moveLayer(pos, 1);
  });
  layerDown.innerHTML = `<span class="material-icons-round">expand_more</span>`;

  controls.appendChild(layerUp);
  controls.appendChild(layerDown);

  const duplicateControl = document.createElement("div");
  duplicateControl.classList.add("layerControl");
  duplicateControl.classList.add("duplicate");

  const duplicateButton = document.createElement("button");
  duplicateButton.addEventListener("click", (e) => {
    event.stopPropagation();
    //  duplicate layer
    pos = getLayer(document.querySelector(".selected"));
    duplicateLayer(pos);
  });
  duplicateButton.innerHTML = `<span class="material-icons-round">content_copy</span>`;
  duplicateControl.appendChild(duplicateButton);

  const maskControl = document.createElement("div");
  maskControl.classList.add("layerControl");
  maskControl.classList.add("mask");

  const maskButton = document.createElement("button");
  maskButton.addEventListener("click", (e) => {
    event.stopPropagation();
    //  enable masking
    let target = e.target;
    if (target.tagName === "SPAN") {
      target = target.parentElement;
    }
    let masking = target.classList.toggle('active');
    settings[selectedLayer].Masking = masking;

    if (masking) {
      maskingImg.style.display = "block";
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      if (settings[selectedLayer].Mask == null) {
        const maskImg = new Image();
        settings[selectedLayer].Mask = maskImg;
      } else {
        maskCtx.drawImage(settings[selectedLayer].Mask, 0, 0);
      }
    }
    else {
      maskingImg.style.display = "";
    }
    console.log("mask", masking);
  });
  maskButton.innerHTML = `<span class="material-icons-round">hide_image</span>`;
  maskControl.appendChild(maskButton);


  const divBreak = document.createElement("div");
  divBreak.classList.add("break");

  div.appendChild(divBreak);
  div.appendChild(maskControl)
  div.appendChild(duplicateControl)
  div.appendChild(input);
  div.appendChild(controls);

  div.addEventListener("click", (e) => {
    let target = e.target;
    if (target.tagName === "INPUT") {
      target = target.parentElement;
    }
    selectedLayer = getLayer(target);
    changeSelectedLayer();
  });

  input.addEventListener("input", (e) => {
    let layer = getLayer(e.target.parentElement);
    settings[layer].value = e.target.value;
    document.querySelector('.layer.selected input').setAttribute("list", dataListSelector(settings[layer].Font, e.target.value));
    e.target.style.fontFamily = fontSelector(settings[layer].Font, e.target.value);
    generateHatted();
  });

  layers.insertBefore(div, layers.childNodes[0]);
}

function removeLayer(layer) {
  layers.removeChild(layers.children[layer]);
  settings.splice(layer, 1);

  if (selectedLayer !== 0) selectedLayer--;

  if (settings.length) changeSelectedLayer();

  generateHatted();
}

function moveLayer(pos, move) {
  const current = settings[pos];

  settings.splice(pos, 1);
  settings.splice(pos + move, 0, current);

  selectedLayer = pos + move;
  changeSelectedLayer();

  setLayerInputs();

  generateHatted();
}

function duplicateLayer(pos) {
  const current = JSON.stringify(settings[pos]);

  // settings.splice(pos, 1);
  settings.splice(pos, 0, JSON.parse(current));
  addLayer();
  changeSelectedLayer();

  setLayerInputs();

  generateHatted();
}

function setLayerInputs() {
  for (var x = 0; x < settings.length; x++) {
    let target = layers.children[x].querySelector("input");
    target.value = settings[x].value;
    target.setAttribute("list", dataListSelector(settings[x].Font, target.value));
    target.style.fontFamily = fontSelector(settings[x].Font, target.value);
  }
}

function resetCanvas() {
  for (var layer = settings.length - 1; layer >= 0; layer--) {
    removeLayer(layer);
  }
}

function changeSelectedLayer() {
  if (document.querySelector(".selected") !== null)
    document.querySelector(".selected").classList.remove("selected");

  // Keeps the last scrolled setting
  let temp = lastScrolled;

  layers.children[selectedLayer].classList.add("selected");

  setSize(settings[selectedLayer].SizeOffset ?? 0);
  setOffsetX(settings[selectedLayer].OffsetX ?? 0);
  setOffsetY(settings[selectedLayer].OffsetY ?? 0);
  setRotation(settings[selectedLayer].Rotation ?? 0);
  setOpacity(settings[selectedLayer].Transparency ?? 100);
  setMirror(settings[selectedLayer].Mirror ?? false);
  setStroke(settings[selectedLayer].Stroke ?? false)
  SetStrokeWidth(settings[selectedLayer].StrokeWidth ?? 0)
  setColor(settings[selectedLayer].Color ?? "#000000");
  setFont(settings[selectedLayer].Font ?? "sans-serif");

  layers.children[selectedLayer].querySelector('.mask button').setAttribute('class', settings[selectedLayer].Masking ? "active" : "");
  maskingImg.style.display = settings[selectedLayer].Masking ? "block" : "";

  if (settings[selectedLayer].Masking) {
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    if (settings[selectedLayer].Mask == null) {
      const maskImg = new Image();
      settings[selectedLayer].Mask = maskImg;
    } else {
      maskCtx.drawImage(settings[selectedLayer].Mask, 0, 0);
    }
  }

  lastScrolled = temp;
  setScrolling(lastScrolled);
}

document.getElementById("SizeSlide").addEventListener("input", (e) => {
  setSize(e.currentTarget.value);
  generateHatted();
});

document.getElementById("SizeField").addEventListener("change", (e) => {
  setSize(e.currentTarget.value);
  generateHatted();
});
document.getElementById("OffsetXSlide").addEventListener("input", (e) => {
  setOffsetX(e.currentTarget.value);
  generateHatted();
});
document.getElementById("OffsetXField").addEventListener("change", (e) => {
  setOffsetX(e.currentTarget.value);
  generateHatted();
});
document.getElementById("OffsetYSlide").addEventListener("input", (e) => {
  setOffsetY(e.currentTarget.value);
  generateHatted();
});
document.getElementById("OffsetYField").addEventListener("change", (e) => {
  setOffsetY(e.currentTarget.value);
  generateHatted();
});

document.getElementById("ColorPicker").addEventListener("input", (e) => {
  setColor(e.currentTarget.value);
  generateHatted();
});
document.getElementById("FontStyle").addEventListener("input", (e) => {
  setFont(e.currentTarget.value);
  generateHatted();
});

document.getElementById("StrokeWidthSlide").addEventListener("input", (e) => {
  SetStrokeWidth(e.currentTarget.value);
  generateHatted();
});

document.getElementById("StrokeWidthField").addEventListener("change", (e) => {
  SetStrokeWidth(e.currentTarget.value);
  generateHatted();
});

img.addEventListener("mousedown", (e) => {
  mousePosX = e.offsetX - canvas.width / 2;
  mousePosY = e.offsetY - canvas.height / 2;
  originalX = settings[selectedLayer].OffsetX;
  originalY = settings[selectedLayer].OffsetY;
});

img.addEventListener("mousemove", (mouse) => {
  if (mouse.buttons == 1) {
    setOffsetX(originalX + (mouse.offsetX - canvas.width / 2 - mousePosX));
    setOffsetY(originalY + (mouse.offsetY - canvas.height / 2 - mousePosY));
    generateHatted();
  }
});

img.addEventListener("wheel", (e) => {
  e.preventDefault();
  switch (lastScrolled) {
    case "Size":
      setSize((settings[selectedLayer].SizeOffset += e.deltaY / 50));
      break;
    case "Rotation":
      setRotation((settings[selectedLayer].Rotation += e.deltaY / 50));
      break;
    case "Transparency":
      setOpacity((settings[selectedLayer].Transparency += e.deltaY / 50));
      break;
    case "StrokeWidth":
      SetStrokeWidth((settings[selectedLayer].StrokeWidth += e.deltaY / 50));
      break;
    default:
  }
  generateHatted();
});

document.getElementById("RotationSlide").addEventListener("input", (e) => {
  setRotation(e.currentTarget.value);
  generateHatted();
});
document.getElementById("RotationField").addEventListener("change", (e) => {
  setRotation(e.currentTarget.value);
  generateHatted();
});
document.getElementById("TransparencySlide").addEventListener("input", (e) => {
  setOpacity(e.currentTarget.value);
  generateHatted();
});
document.getElementById("TransparencyField").addEventListener("change", (e) => {
  setOpacity(e.currentTarget.value);
  generateHatted();
});

document.getElementById("Reset").addEventListener("click", (e) => {
  setSize(0);
  setOffsetX(0);
  setOffsetY(0);
  setRotation(0);
  setOpacity(100);
  setMirror(false);
  setStroke(false);
  setColor('#000000');
  setFont('sans-serif');
  generateHatted();
});

function getLayer(t) {
  const target = t;
  const parent = target.parentElement;
  let layer = -1;
  for (var x = 0; x < parent.childElementCount; x++) {
    if (parent.children[x] == target) {
      layer = x;
    }
  }
  return layer;
}

function generateMad() {
  for (var x = 0; x < 3; x++) {
    settings.unshift(JSON.parse(JSON.stringify(settingsTemplate)));
    addLayer()
  };

  let madSettings = [
    {
      value: "☕",
      OffsetX: -105,
      OffsetY: -35,
      SizeOffset: -60,
      Mirror: false,
      Rotation: 135,
      Transparency: 100,
    },
    {
      value: "🎩",
      OffsetX: 55,
      OffsetY: -50,
      SizeOffset: 0,
      Mirror: false,
      Rotation: 0,
      Transparency: 100,
    },
    {
      value: "🤪",
      OffsetX: 55,
      OffsetY: 80,
      SizeOffset: 0,
      Mirror: false,
      Rotation: 0,
      Transparency: 100,
    },
  ];
  let layer = 0;
  madSettings.forEach(object => {
    for (let key in object)
      settings[layer][key] = object[key];
    layer++;
  });

  for (var x = 0; x < 3; x++)
    layers.children[x].querySelector("input").value = settings[x].value;
  changeSelectedLayer();
  setScrolling(lastScrolled);
  generateHatted();

}
function openImport() {
  document.getElementById("impexp").style.display = "block";
  document.getElementById("impexpName").innerText = "Import";
  document.getElementById("impexpText").removeAttribute("readonly", "");
  document.getElementById("importButton").style.display = "block";
  document.getElementById("zip").style.display = "none";
  document.getElementById("impexpText").value = "";
}
function textImport() {
  const value = document.getElementById("impexpText").value;
  if (value == null || value == "") {
    //show error cant be empty
    console.log("empty");
    return;
  }

  switch (typeof value) {
    case "string":
      try {
        importSettings(JSON.parse(value));
      } catch (e) {
        //invalid JSON
        console.log("badJSON");
        return;
      }
      break;
    case "object":
      importSettings(value);
      break;
    default:
      //show error invalid type
      console.log("invalid type");
      return;
  }
  document.getElementById("impexp").style.display = "none";
}
function openExport() {
  document.getElementById("impexp").style.display = "block";
  document.getElementById("impexpName").innerText = "Export";
  document.getElementById("impexpText").setAttribute("readonly", "");
  document.getElementById("importButton").style.display = "none";
  document.getElementById("zip").style.display = "flex";
  document.getElementById("impexpText").value = exportSettings();
}
async function exportZip() {
  var zip = new JSZip();
  let sizes = parseText();
  const image = document.createElement("img");
  image.src = await canvas.toDataURL();
  image.onload = () => {
    if (sizes.length) {
      addToZip(0);
    } else {
      alert(
        "Please enter a valid list of intergers separated by commas for the image sizes.\nRange 10 to 400."
      );
    }
  };

  function addToZip(index) {
    canvas.width = sizes[index];
    canvas.height = sizes[index];
    ctx.drawImage(image, 0, 0, 400, 400, 0, 0, sizes[index], sizes[index]);

    canvas.toBlob((e) => {
      zip.file(`emoji_${sizes[index]}.png`, e);

      if (index < sizes.length - 1) {
        const next = index + 1;
        addToZip(next);
      } else {
        zip.generateAsync({ type: "blob" }).then(function (content) {
          saveData(content, "images.zip");
          canvas.width = 400;
          canvas.height = 400;
          ctx.drawImage(image, 0, 0);
        });
      }
    });
  }
}

function importSettings(imprt) {
  for (var layer = layers.childElementCount - 1; layer >= 0; layer--) {
    removeLayer(layer);
  }

  settings = imprt;
  for (var x = 0; x < settings.length; x++) {
    addLayer();
    layers.children[0].querySelector("input").value =
      settings[settings.length - 1 - x].value;
  }
  generateHatted();
}

function exportSettings() {
  const exprtString = JSON.stringify(settings);
  console.log(exprtString);
  return exprtString;
}

function setOffsetX(num) {
  const value = parseInt(num);
  document.getElementById("OffsetXField").value = value;
  document.getElementById("OffsetXSlide").value = value;
  settings[selectedLayer].OffsetX = value;
}
function setOffsetY(num) {
  const value = parseInt(num);
  document.getElementById("OffsetYField").value = value;
  document.getElementById("OffsetYSlide").value = value;
  settings[selectedLayer].OffsetY = value;
}
function setRotation(num) {
  const value = parseInt(num);
  document.getElementById("RotationField").value = value;
  document.getElementById("RotationSlide").value = value;
  settings[selectedLayer].Rotation = value;

  setScrolling("Rotation");
}
function setOpacity(num) {
  const value = parseInt(num);
  document.getElementById("TransparencyField").value = value;
  document.getElementById("TransparencySlide").value = value;
  settings[selectedLayer].Transparency = value;

  setScrolling("Transparency");
}
function setSize(num) {
  const value = parseInt(num);
  document.getElementById("SizeField").value = value;
  document.getElementById("SizeSlide").value = value;
  settings[selectedLayer].SizeOffset = value;

  setScrolling("Size");
}
function setMirror(bool) {
  document.getElementById("Mirror").checked = bool;
  settings[selectedLayer].Mirror = bool;
}

function setStroke(bool) {
  document.getElementById("Stroke").checked = bool;
  settings[selectedLayer].Stroke = bool;
}

function SetStrokeWidth(num) {
  const value = parseInt(num);
  document.getElementById("StrokeWidthField").value = value;
  document.getElementById("StrokeWidthSlide").value = value;
  settings[selectedLayer].StrokeWidth = value;

  setScrolling("StrokeWidth");
}

function setColor(value) {
  if (typeof (value) == "string") {
    settings[selectedLayer].Color = hexToRgb(value);
    document.getElementById("ColorPicker").value = value;
    document.getElementById("ColorShow").style.backgroundColor = value;
  } else {
    settings[selectedLayer].Color = value;
    let hex = rgbToHex(value?.r ?? 0, value?.g ?? 0, value?.b ?? 0);
    document.getElementById("ColorPicker").value = hex;
    document.getElementById("ColorShow").style.backgroundColor = hex;
  }
}

function setFont(value) {
  document.getElementById("FontStyle").value = value;
  settings[selectedLayer].Font = value;
  document.querySelector('.layer.selected input').style.fontFamily = fontSelector(value, settings[selectedLayer].value);
}

function parseText() {
  let text = document.getElementById("textArr").value;
  if (text == "") return [32, 64, 128];
  text = text.replace(/[^(0-9),]*/g, "");
  let arr = text.split(",");
  for (var x = arr.length - 1; x >= 0; x--) {
    if (arr[x] == "") arr.splice(x, 1);

    arr[x] = parseInt(arr[x]);

    if (arr[x] < 10 || arr[x] > 400) arr.splice(x, 1);
  }
  return arr;
}

function setScrolling(name) {
  lastScrolled = name;
  removeClass("scrolling");
  document.getElementById(`${name}Field`).classList.add("scrolling");
  document.getElementById(`${name}Slide`).classList.add("scrolling");
  document.getElementById(`${name}Label`).classList.add("scrolling");
}

function removeClass(className) {
  document
    .querySelectorAll(`.${className}`)
    .forEach((e) => e.classList.remove(className));
}

function saveData(data, fileName) {
  var a = document.createElement("a");
  var blob = new Blob([data], { type: "application/zip" });
  var url = window.URL.createObjectURL(blob);
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}
function fontSelector(value, string) {
  let fontPicked;
  switch (value ?? "sans-serif") {
    case "Filled":
      if (icons[string]?.includes(value.toLowerCase())) {
        fontPicked = "Material Icons"
      }
      break
    case "Outlined":
    case "Round":
    case "Sharp":
    case "Two Tone":
      if (icons[string]?.includes(value.toLowerCase().replace(' ', '_'))) {
        fontPicked = `"Material Icons ${value}"`;
      }
      break;
    default:
      fontPicked = value ?? "sans-serif";
  }
  return fontPicked ?? "sans-serif";
}
function dataListSelector(style, string) {
  let datalist = "";
  if (icons[string])
    if (icons[string].includes(style.toLowerCase().replace(' ', '_')))
      return '';

  if (string.length > 2) {
    switch (style ?? "sans-serif") {
      case "Filled":
        datalist = "FilledIcons"
        break
      case "Outlined":
        datalist = "OutlinedIcons"
        break
      case "Round":
        datalist = "RoundedIcons"
        break
      case "Sharp":
        datalist = "SharpIcons"
        break
      case "Two Tone":
        datalist = "TwoToneIcons"
        break;
      default:
        datalist = "";
    }
  }

  return datalist
}


//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}