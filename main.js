const overlay = document.querySelector(".overlay");
const header = document.querySelector(".header");
const paragraph = document.querySelector(".paragraph");
const speed = document.querySelector(".speed");
const accuracy = document.querySelector(".accuracy");
const replayBtn = document.querySelector("ul i.replay");
const refetchBtn = document.querySelector("ul i.refetch");
const showTypingPageBtn = document.querySelector("ul i.show-typing-page");
const showResultsPageBtn = document.querySelector("ul i.show-results-page");
const resultsCard = document.querySelector(".results-card");
const accuracyCircle = document.querySelector(".results-card .accuracy .circle");
const realAccuracyCircle = document.querySelector(".results-card .real-accuracy .circle");
const speedCircle = document.querySelector(".results-card .speed .circle");
let typedText = [];
let quoteContent;
let started = false;
let startTime;
let checkingInterval;
let right = 0;
let wrong = 0;
let typedWrongArr;
let realAccuracy;
let capsNotified = false;
let wpm;
let acc;

fetch("database/quotes.json")
  .then((response) => response.json())
  .then((quotes) => quotes[Math.floor(Math.random() * quotes.length)])
  .then((quote) => {
    quoteContent = quote.content.trim();
    for (let i = 0; i < quoteContent.length; i++) {
      const span = document.createElement("span");
      span.textContent = quoteContent[i];
      paragraph.appendChild(span);
    }
    overlay.firstChild.style.opacity = 0;
    overlay.style.zIndex = "-1";
    overlay.style.backgroundColor = "#24273a66";
    setTimeout(function () {
      header.style.transition = "opacity 0.6s";
      header.style.opacity = 1;
      paragraph.style.transition = "opacity 0.6s";
      paragraph.style.opacity = 1;
      window.addEventListener("keypress", keyHandler);
      window.addEventListener("keydown", backAndCapsHandler);
      checkingInterval = setInterval(checkSpeedAndAccuracy, 500);
    }, 300);
  })
  .catch((e) => {
    overlay.firstChild.style.color = "var(--red)";
    overlay.firstChild.textContent = "Something Went Wrong \n¯\\_('')_/¯";
    console.error("Failed to retrieve the data: ", e);
  });

replayBtn.addEventListener("click", function () {
  for (let i = 0; i < typedText.length; i++) {
    const span = document.querySelector(`.paragraph span:nth-child(${i + 1})`);
    span.classList = "";
  }
  right = 0;
  wrong = 0;
  typedText = [];
  typedWrongArr = new Array(quoteContent.length);
  started = false;
  capsNotified = false;
  speed.style.opacity = 0;
  accuracy.style.opacity = 0;
  hideResultsCard();
});

refetchBtn.addEventListener("click", function () {
  window.location.reload();
});

showTypingPageBtn.addEventListener("click", () => notify("Unimplemented yet."));
showResultsPageBtn.addEventListener("click", () => notify("Unimplemented yet."));

function keyHandler(ev) {
  if (!started) {
    started = true;
    speed.style.transition = "opacity 0.5s";
    speed.style.opacity = 1;
    accuracy.style.transition = "opacity 0.5s";
    accuracy.style.opacity = 1;
    typedWrongArr = new Array(quoteContent.length);
    startTime = Date.now();
  }
  type(ev.key);
}

function backAndCapsHandler(ev) {
  if (!capsNotified && ev.getModifierState("CapsLock")) {
    capsNotified = true;
    notify("You have Caps Lock enabled");
  }
  if (ev.key === "Backspace") untype();
}

function checkSpeedAndAccuracy() {
  if (started) {
    wpm = Math.round(right / (5 * ((Date.now() - startTime) / 1000 / 60)));
    speed.innerHTML = `<span>${wpm}</span><span>WPM</span>`;
    acc = typedText.length > 0 ? Math.round((right / typedText.length) * 100) : 0;
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
      typedWrongArr[typedLen] = 1;
    }
  }
  if (typedLen + 1 >= quoteContent.length) {
    window.removeEventListener("keypress", keyHandler);
    window.removeEventListener("keydown", backAndCapsHandler);
    clearInterval(checkingInterval);
    showResultsCard();
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

function showResultsCard() {
  const typedWrongLen = typedWrongArr.filter((val) => val === 1).length;
  realAccuracy = Math.round(((quoteContent.length - typedWrongLen) / quoteContent.length) * 100);
  accuracyCircle.dataset.result = acc;
  document.documentElement.style.setProperty("--accuracy", `${acc}%`);
  realAccuracyCircle.dataset.result = realAccuracy;
  document.documentElement.style.setProperty("--real-accuracy", `${realAccuracy}%`);
  speedCircle.dataset.result = wpm;
  const speedPercentage = wpm >= 75 ? 100 : Math.round((wpm / 75) * 100);
  document.documentElement.style.setProperty("--speed", `${speedPercentage}%`);
  resultsCard.style.visibility = "visible";
  setTimeout(() => (resultsCard.style.opacity = 1), 500);
  const closeBtn = document.querySelector(".results-card .close");
  closeBtn.addEventListener("click", hideResultsCard);
}

function hideResultsCard() {
  resultsCard.style.opacity = 0;
  setTimeout(() => (resultsCard.style.visibility = "hidden"), 1000);
}

function notify(message) {
  const notifications = document.querySelector(".notifications");
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notifications.prepend(notification);
  const closeBtn = document.createElement("a");
  closeBtn.classList.add("close");
  closeBtn.textContent = "x";
  const messageText = document.createTextNode(message);
  notification.appendChild(closeBtn);
  notification.appendChild(messageText);
  closeBtn.addEventListener("click", hideNotification);
  setTimeout(hideNotification, 10000);
  function hideNotification() {
    notification.remove();
  }
}
