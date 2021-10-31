let processes = [];

mapButton();

function mapButton() {
  const buttons = document.querySelectorAll(".calculator-button");

  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const value = button.dataset.value;

      if (value == "=" && isFinite(processes.slice(-1))) {
        const calc = `${calculate(processes.join(""))}`.toLowerCase();

        if (calc == "undefined" || calc == "infinity" || calc == "nan") {
          processes = [""];
          writeScreen("ERROR!");
        } else {
          processes = [];
          processes.push(String(calc));
          writeScreen(processes.join(""));
        }
      } else if (value.toLowerCase() == "c") {
        processes = [];
        writeScreen("");
      } else if (value == "del") {
        processes = processes
          .map((process) => String(process).split(""))
          .flat();
        processes.pop();
        writeScreen(processes.join(""));
      } else {
        parseButtons(value);
        writeScreen(processes.join(""));
      }
    });
  });
}
function calculate(fn) {
  return new Function("return " + fn)();
}

function parseButtons(value) {
  const lastProcess = processes.slice(-1);

  if (processes.length == 0) {
    if (isFinite(value)) {
      processes.push(value);
    }
  } else {
    if (!isFinite(value) && isFinite(lastProcess)) {
      processes.push(value);
    } else if (isFinite(value) && !isFinite(lastProcess)) {
      processes.push(value);
    } else if (isFinite(value) && isFinite(lastProcess)) {
      processes.push(value);
    }
  }
}

function writeScreen(value) {
  const screen = document.querySelector(".calculator-screen");
  screen.textContent = `${value}`;
}
