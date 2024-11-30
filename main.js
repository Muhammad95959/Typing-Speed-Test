//TODO: calc the actual accuracy
//TODO: add "press any key to start"
//TODO: add results page
//TODO: add fetch error handling
const paragraph = document.querySelector(".paragraph");
const speed = document.querySelector(".speed");
const accuracy = document.querySelector(".accuracy");
const typedText = [];
let quoteContent;
let started = false;
let startTime = 0;
let checkingInterval;
let right = 0;
let wrong = 0;

const retrieved = fetch("https://api.quotable.io/random?minLength=200&maxLength=500")
// const retrieved = fetch("https://api.quotable.io/random?maxLength=20")
  .then((val) => val.json())
  .then((val) => {
    quoteContent = val.content.trim();
    for (let i = 0; i < quoteContent.length; i++) {
      const span = document.createElement("span");
      span.textContent = quoteContent[i];
      paragraph.appendChild(span);
    }
    window.addEventListener("keypress", keyHandler);
    window.addEventListener("keydown", backspaceHandler);
    checkingInterval = setInterval(checkSpeedAndAccuracy, 500);
  });

function keyHandler(ev) {
  if (!started) {
    started = true;
    startTime = Date.now();
    speed.style.transition = "visibility 0.3s";
    speed.style.visibility = "visible";
    accuracy.style.transition = "visibility 0.3s";
    accuracy.style.visibility = "visible";
  }
  type(ev.key);
}

function backspaceHandler(ev) {
  if (ev.key === "Backspace") untype();
}

function checkSpeedAndAccuracy() {
  if (started) {
    const wpm = Math.round(right / (5 * ((Date.now() - startTime) / 1000 / 60)));
    speed.innerHTML = `<span>${wpm}</span><span>WPM</span>`;
    const acc = typedText.length > 0 ? Math.round((right / typedText.length) * 100) : 0;
    accuracy.textContent = `${acc}%`;
  }
}

function type(key) {
  let typedLen = typedText.length;
  if (typedLen < quoteContent.length) {
    typedText.push(key);
    const span = document.querySelector(`.paragraph span:nth-child(${typedLen + 1})`);
    if (key === quoteContent[typedLen]) {
      span.classList.add("right");
      right++;
    } else {
      span.classList.add("wrong");
      wrong++;
    }
  }
  if (typedLen + 1 >= quoteContent.length) {
    window.removeEventListener("keypress", keyHandler);
    window.removeEventListener("keydown", backspaceHandler);
    clearInterval(checkingInterval);
  }
}

function untype() {
  const typedLen = typedText.length;
  if (typedLen > 0) {
    typedText.pop();
    const span = document.querySelector(`.paragraph span:nth-child(${typedLen})`);
    if (span.classList.contains("right")) right--;
    else if (span.classList.contains("wrong")) wrong--;
    span.classList = "";
  }
}
