(function () {
  "use strict";

  var KEYS = {
    miron: ["лысый персик", "лысыйперсик"],
    gleb: ["киндер сюрприз", "киндерсюрприз", "киндер-сюрприз"]
  };

  var STORAGE = "dom-olesi-unlock-v1";

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^a-zа-я0-9]+/gi, "")
      .trim();
  }

  function matches(who, value) {
    var needle = normalize(value);
    return KEYS[who].some(function (item) {
      return normalize(item) === needle;
    });
  }

  var state = { miron: false, gleb: false };

  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE) || "{}");
    state.miron = !!saved.miron;
    state.gleb = !!saved.gleb;
  } catch (err) {
    state = { miron: false, gleb: false };
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(state));
    } catch (err) {}
  }

  var gate = document.getElementById("gate");
  var house = document.getElementById("house");
  var statusEl = document.getElementById("gate-status");
  var music = document.getElementById("bg-music");
  var musicBtn = document.getElementById("music-btn");

  function markDoor(who, opened) {
    var card = document.getElementById("door-" + who);
    if (!card) return;
    card.classList.toggle("is-open", opened);
    var hint = card.querySelector(".hint");
    var input = card.querySelector("input");
    var button = card.querySelector("button");
    if (opened) {
      hint.hidden = false;
      hint.className = "hint ok";
      hint.textContent = "Ну конечно. Это ты.";
      if (input) {
        input.disabled = true;
        input.value = who === "miron" ? "лысый персик" : "киндер сюрприз";
      }
      if (button) button.disabled = true;
    }
  }

  function bothOpen() {
    return state.miron && state.gleb;
  }

  function enterHouse() {
    gate.hidden = true;
    house.hidden = false;
    document.body.classList.add("in-house");
    if (!house.dataset.entered) {
      house.dataset.entered = "1";
      showRoom("prihozaya", true);
    }
  }

  function updateGate() {
    markDoor("miron", state.miron);
    markDoor("gleb", state.gleb);
    if (bothOpen()) {
      statusEl.textContent = "Оба ключа на месте. Входи.";
      if (house.dataset.entered) {
        enterHouse();
      } else {
        window.setTimeout(enterHouse, 700);
      }
    } else if (state.miron || state.gleb) {
      statusEl.textContent = "Одна дверь уже своя. Осталась вторая.";
    } else {
      statusEl.textContent = "Пока закрыто. Один сын — половина дома.";
    }
  }

  document.querySelectorAll(".lock-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var who = form.getAttribute("data-who");
      var input = form.querySelector("input");
      var hint = form.querySelector(".hint");
      hint.hidden = false;
      if (matches(who, input.value)) {
        state[who] = true;
        persist();
        hint.className = "hint ok";
        hint.textContent = "Ну конечно. Это ты.";
        updateGate();
      } else {
        hint.className = "hint";
        hint.textContent = "Это знает только наша мама.";
        input.focus();
        input.select();
      }
    });
  });

  function showRoom(id, instant) {
    document.querySelectorAll(".room").forEach(function (room) {
      room.classList.toggle("is-active", room.id === "room-" + id);
    });
    document.querySelectorAll(".nav-btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-room") === id);
    });
    var top = house.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top), behavior: instant ? "auto" : "smooth" });
  }

  document.querySelectorAll(".nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showRoom(btn.getAttribute("data-room"));
    });
  });

  if (musicBtn && music) {
    musicBtn.addEventListener("click", function () {
      if (music.paused) {
        var play = music.play();
        if (play && typeof play.then === "function") {
          play.then(function () {
            musicBtn.classList.add("is-on");
            musicBtn.setAttribute("aria-pressed", "true");
            musicBtn.textContent = "Музыка вкл";
          }).catch(function () {
            musicBtn.textContent = "Нет файла музыки";
          });
        }
      } else {
        music.pause();
        musicBtn.classList.remove("is-on");
        musicBtn.setAttribute("aria-pressed", "false");
        musicBtn.textContent = "Музыка";
      }
    });
  }

  updateGate();
})();
