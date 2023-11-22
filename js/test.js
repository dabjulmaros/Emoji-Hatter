console.log("hello");

let anim = true;
document.getElementById("icon").addEventListener("click", (e) => {
  let ele = e.target;
  let div = document.getElementById("div");
  if (anim) {
    anim = false;
    ele.classList.toggle("spin");

    setTimeout(
      (ele) => {
        if (ele.innerHTML.includes("close")) {
          ele.innerHTML = "format_size";
          div.classList.add("closed");
        } else {
          ele.innerHTML = "close";
          div.classList.remove("closed");
        }
        setTimeout(
          (ele) => {
            ele.classList.toggle("spin");
            anim = true;
          },
          250,
          ele
        );
      },
      250,
      ele
    );
  }
});
