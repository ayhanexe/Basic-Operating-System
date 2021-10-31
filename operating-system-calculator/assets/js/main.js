const OPTIONS = {
  startX: 0,
  startY: 0,
  draggingWindow: null,
  desktopGrid: {
    1000: {
      x: 10,
      y: 10,
      iconSize: "4.5vw",
    },
    500: {
      x: 3,
      y: 5,
      iconSize: "60px",
    },
  },
  desktopCellBaseName: "desktop-cell",
  desktopColor: "black",
  desktopImage: "./assets/media/bg.png",
  draggingCell: null,
  desktopData: {
    programs: [
      {
        sector: 1,
        name: "Chrome",
        icon: "./assets/media/programs/chrome.png",
        isStarted: false,
        callback: () => console.log("chrome started"),
      },
      {
        sector: 2,
        name: "Settings",
        icon: "./assets/media/programs/settings.png",
        isStarted: false,
        callback: () => console.log("settings started"),
      },
      {
        sector: 3,
        name: "Calculator",
        icon: "./assets/media/programs/calculator.png",
        isStarted: false,
        callback: (data) => PROGRAM_EXECUTOR_MIDDLEWARE(() => CALCULATOR(data)),
        frameSRC: "./assets/programs/calculator/index.html",
      },
    ],
  },
};

let dragEvent = null;

// PROGRAMS
function PROGRAM_EXECUTOR_MIDDLEWARE(fn) {
  fn();
  // initializeDragDrop();
}

function makeWindow(title, data, windowStyle) {
  const programWindow = $("div", _, ["program-window"], windowStyle);
  const toolbar = makeToolbar(title, data);

  programWindow.dataset.taskbarId = String(data.name).toLowerCase();

  programWindow.appendChild(toolbar);

  const iframe = $("iframe", _, ["program-content"]);
  iframe.src = data.frameSRC;

  iframe.addEventListener("load", () => {
    if (iframe.contentDocument) {
      style(iframe, {
        height: `${parseInt(
          window.getComputedStyle(iframe.contentDocument.querySelector("html"))
            .height
        )}px`,
      });
    }
  });

  initializeDragDrop(programWindow);
  programWindow.appendChild(iframe);

  return programWindow;
}
function makeToolbar(title = "Untitled Program", data) {
  const toolbar = $("div", null, ["toolbar"]);
  const programTitle = $("span", null, ["toolbar-title"]);
  const toolbarControls = $("div", null, ["toolbar-controls"]);
  const toolbarControlItemSmall = $("div", null, [
    "toolbar-control-item",
    "small",
  ]);
  const toolbarControlItemExpand = $("div", null, [
    "toolbar-control-item",
    "expand",
  ]);
  const toolbarControlItemClose = $("div", null, [
    "toolbar-control-item",
    "close",
  ]);
  const smallIcon = $("i", null, ["fas", "fa-chevron-down"]);
  const expandIcon = $("i", null, ["fas", "fa-expand-alt"]);
  const closeIcon = $("i", null, ["fas", "fa-times"]);

  toolbar.appendChild(programTitle);

  toolbarControlItemSmall.appendChild(smallIcon);
  toolbarControlItemExpand.appendChild(expandIcon);
  toolbarControlItemClose.appendChild(closeIcon);

  const closeFn = (e) => {
    window.removeEventListener("mousemove", dragEvent);
    e.target.closest(".program-window").remove();
    data.isStarted = false;
    OPTIONS.startX = 0;
    OPTIONS.startY = 0;
    OPTIONS.draggingWindow = null;
  };

  toolbarControlItemClose.addEventListener("click", (e) => {
    const programWindow = toolbar.closest(".program-window");

    if (programWindow) {
      gsap
        .to([programWindow, document.querySelector(`#${programWindow.dataset.taskbarId}`)], {
          scale: 0.5,
          duration: 0.2,
          opacity: 0,
        })
        .then(() => {
          closeFn(e);
          removeTaskbarItem(programWindow.dataset.taskbarId);
        });
    } else {
      closeFn(e);
    }
  });

  toolbarControls.appendChild(toolbarControlItemSmall);
  toolbarControls.appendChild(toolbarControlItemExpand);
  toolbarControls.appendChild(toolbarControlItemClose);

  toolbar.appendChild(toolbarControls);

  programTitle.textContent = title;

  return toolbar;
}

function removeTaskbarItem(id) {
  document.querySelector("#taskbar").querySelector(`#${id}`)?.remove();
}

function addTaskbarItem(data) {
  const taskbar = document.querySelector("#taskbar");
  const taskbarItem = $("div", _, ["taskbar-item"]);
  const img = $("img");

  taskbarItem.id = `${String(data.name).toLowerCase()}`;

  img.src = data.icon;

  taskbarItem.appendChild(img);
  taskbar.appendChild(taskbarItem);
}

function addWindowToLayer(window, data) {
  const windowLayer = document.querySelector("#window-layer");
  windowLayer.appendChild(window);

  addTaskbarItem(data);

  gsap.fromTo(
    window,
    {
      display: "block",
      opacity: 0,
      scale: 0.5,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      ease: "power.inOut",
    }
  );
}

function CALCULATOR(data) {
  const __window_options__ = {
    styles: {
      width: "400px",
      height: "auto",
    },
  };

  const window = makeWindow("Calculator", data, __window_options__.styles);
  addWindowToLayer(window, data);
}
// PROGRAMS

function currentBreakpoint() {
  const breakpoints = Object.keys(OPTIONS.desktopGrid)
    .sort()
    .map((item) => parseInt(item))
    .filter((item) => isFinite(item));

  for (let breakpoint of breakpoints) {
    if (window.innerWidth >= breakpoint) {
      return OPTIONS.desktopGrid[breakpoint];
    } else {
      return Object.values(OPTIONS.desktopGrid)[0];
    }
  }
}

function $(tagName, id = null, classes = [], styleObj = {}) {
  const element = document.createElement(tagName);
  element.id = id;
  element.classList.add(...classes);

  style(element, styleObj);

  return element;
}

function style(element, styleObj) {
  for (const [key, value] of Object.entries(styleObj)) {
    element.style[key] = value;
  }
}

function scaleGrid() {
  const root = document.querySelector("#root");
  const rootHeight = root.clientHeight - 50;
  const sectors = document.querySelectorAll(`.${OPTIONS.desktopCellBaseName}`);

  const gap = parseInt(window.getComputedStyle(root).gap);

  [...sectors].forEach((sector) => {
    style(sector, {
      width: `calc(100% / ${currentBreakpoint().x})`,
      minHeight: `${Math.floor(
        rootHeight / currentBreakpoint().y - (isFinite(gap) ? gap * 1.5 : 0)
      )}px`,

      flexBasis: `calc((100% / ${currentBreakpoint().x}) - 10px)`,
    });
  });

  OPTIONS.desktopData.onScreenProgramCellsY = Math.floor(
    root.clientHeight / (rootHeight / (currentBreakpoint().y / 2) + 5)
  );

  style(root, {
    // overflow: `${
    //   OPTIONS.desktopData.programs.length >
    //   OPTIONS.desktopData.onScreenProgramCellsY * 12
    //     ? "auto"
    //     : "hidden"
    // }`,
  });
}

function clearGrid() {
  const root = document.querySelector("#root");
  root.innerHTML = "";
}

function makeGrid() {
  const root = document.querySelector("#root");

  for (let i = 1; i <= currentBreakpoint().x; i++) {
    if (i - 1 < currentBreakpoint().y) {
      for (let j = 1; j <= currentBreakpoint().x; j++) {
        const div = $("div");

        div.classList.add(OPTIONS.desktopCellBaseName);

        div.id = `${OPTIONS.desktopCellBaseName}-${
          j * currentBreakpoint().x - currentBreakpoint().x + i
        }`;

        root.appendChild(div);
      }
    }
  }

  scaleGrid();
}

function initializeDragDrop(programWindow) {
  const toolbar = programWindow.querySelector(".toolbar");

  window.addEventListener("mousedown", (e) => {
    const _toolbar = e.target.closest(".toolbar");

    if (_toolbar) {
      OPTIONS.draggingWindow = programWindow;
      OPTIONS.startX = e.clientX;
      OPTIONS.startY = e.clientY;
    }
  });

  toolbar.addEventListener("mousedown", (e) => {
    OPTIONS.draggingWindow = programWindow;
    OPTIONS.startX = e.clientX;
    OPTIONS.startY = e.clientY;
  });
  toolbar.addEventListener("mouseup", () => {
    OPTIONS.draggingWindow = null;
    OPTIONS.startX = 0;
    OPTIONS.startY = 0;
  });
  // toolbar.addEventListener("mouseleave", () => {
  //   OPTIONS.draggingWindow = null;
  //   OPTIONS.startX = 0;
  //   OPTIONS.startY = 0;
  // });
  dragEvent = (e) => drag(programWindow, e);
  window.addEventListener("mousemove", dragEvent);
}

function drag(programWindow, e) {
  if (!OPTIONS.draggingWindow) return;

  const newLeft = programWindow.offsetLeft + (e.clientX - OPTIONS.startX);
  const newTop = programWindow.offsetTop + (e.clientY - OPTIONS.startY);

  programWindow.style.left = newLeft + "px";
  programWindow.style.top = newTop + "px";
  OPTIONS.startX = e.clientX;
  OPTIONS.startY = e.clientY;
}

function initializeOptions() {
  const root = document.querySelector("#root");

  style(root, {
    background: `${OPTIONS.desktopColor} url(${OPTIONS.desktopImage}) center no-repeat`,
    backgroundSize: "cover",
  });
}

function initPreloader() {
  const preloader = document.querySelector("#preloader-container");

  gsap
    .to("#preloader-container", {
      duration: 0.3,
      opacity: 0,
      delay: 3,
      ease: "power.in",
    })
    .then(() => {
      preloader.remove();
      gsap.to("#root", {
        duration: 0.1,
        scale: 1,
        delay: 0.2,
        ease: "power.in",
      });
    });
}

function generateDesktopElements() {
  OPTIONS.desktopData.programs.forEach((data) => {
    const sector = _.find(
      [...document.querySelectorAll(`.${OPTIONS.desktopCellBaseName}`)],
      (item) => item.id === `${OPTIONS.desktopCellBaseName}-${data.sector}`
    );

    if (sector) {
      const cellProgram = $("div");
      const programImage = $("div");
      const img = $("img");
      const programName = $("span");

      cellProgram.addEventListener("click", () => {
        if (!data.isStarted) {
          data.callback(data);
          data.isStarted = true;
        }
      });

      style(programImage, {
        width: currentBreakpoint().iconSize,
      });

      img.src = data.icon;

      cellProgram.classList.add("cell-program");
      programImage.classList.add("program-image");
      programName.classList.add("program-name");

      programName.textContent = data.name;

      programImage.appendChild(img);
      cellProgram.appendChild(programImage);
      cellProgram.appendChild(programName);

      sector.appendChild(cellProgram);
      sector.classList.add("non-empty-cell");
    }
  });
}

// Initialize App

window.addEventListener("load", function () {
  // initPreloader();
  initializeOptions();
  makeGrid();
  generateDesktopElements();

  window.addEventListener("resize", () => {
    clearGrid();
    makeGrid();
    scaleGrid();
    generateDesktopElements();
  });
});
