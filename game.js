(function () {
  "use strict";

  var KEY = "buddy2048-v1";
  var MOVE_MS = 150;

  var board = document.getElementById("board");
  var tilesEl = document.getElementById("tiles");
  var scoreEl = document.getElementById("score");
  var bestEl = document.getElementById("best");
  var goalLine = document.getElementById("goal-line");
  var undoBtn = document.getElementById("undo-btn");
  var newBtn = document.getElementById("new-btn");
  var soundBtn = document.getElementById("sound-btn");
  var howBtn = document.getElementById("how-btn");
  var howDialog = document.getElementById("how-dialog");
  var endDialog = document.getElementById("end-dialog");
  var endAnimal = document.getElementById("end-animal");
  var endTitle = document.getElementById("end-title");
  var endText = document.getElementById("end-text");
  var keepBtn = document.getElementById("keep-btn");
  var againBtn = document.getElementById("again-btn");
  var toast = document.getElementById("toast");
  var live = document.getElementById("live");
  var goalButtons = Array.prototype.slice.call(document.querySelectorAll(".goal-btn"));

  var state = null;
  var best = 0;
  var muted = false;
  var busy = false;
  var tileEls = new Map();
  var audioCtx = null;
  var toastTimer = 0;
  var pointer = null;

  for (var i = 0; i < 16; i++) {
    var cell = document.createElement("div");
    cell.className = "cell";
    document.getElementById("cells").appendChild(cell);
  }

  goalButtons.forEach(function (btn) {
    var goal = Number(btn.dataset.goal);
    var buddy = Buddy2048.buddy(goal);
    btn.setAttribute("aria-label", "Win at " + goal + ", the " + buddy.name);
    btn.innerHTML = '<span class="mini">' + (BuddyAnimals[goal] || "") + "</span><strong>" + goal + "</strong>";
  });

  document.getElementById("step-same").innerHTML = BuddyAnimals[2] + BuddyAnimals[2];
  document.getElementById("step-next").innerHTML = BuddyAnimals[4];

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function metrics() {
    var cs = getComputedStyle(board);
    var pad = parseFloat(cs.paddingLeft) || 12;
    var gap = parseFloat(cs.getPropertyValue("--gap")) || 10;
    var inner = board.clientWidth - pad * 2;
    var size = (inner - gap * 3) / 4;
    return { pad: pad, gap: gap, size: size };
  }

  function place(el, r, c, box) {
    el.style.width = box.size + "px";
    el.style.height = box.size + "px";
    el.style.transform = "translate(" + (box.pad + c * (box.size + box.gap)) + "px, " + (box.pad + r * (box.size + box.gap)) + "px)";
  }

  function makeTile(cell) {
    var buddy = Buddy2048.buddy(cell.value);
    var el = document.createElement("div");
    el.className = "tile";
    el.dataset.value = String(cell.value);
    el.style.zIndex = String(cell.id);
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", buddy.name + ", " + cell.value);
    var face = document.createElement("div");
    face.className = "tile-face";
    face.style.background = buddy.bg;
    face.style.color = buddy.ink;
    face.innerHTML = '<div class="animal">' + (BuddyAnimals[cell.value] || "") + '</div><div class="badge">' + cell.value + "</div>";
    el.appendChild(face);
    return el;
  }

  function paint(el, value) {
    var buddy = Buddy2048.buddy(value);
    var face = el.querySelector(".tile-face");
    face.style.background = buddy.bg;
    face.style.color = buddy.ink;
    face.querySelector(".animal").innerHTML = BuddyAnimals[value] || "";
    face.querySelector(".badge").textContent = String(value);
    el.dataset.value = String(value);
    el.setAttribute("aria-label", buddy.name + ", " + value);
  }

  function find(id) {
    for (var r = 0; r < state.cells.length; r++) {
      for (var c = 0; c < state.cells[r].length; c++) {
        var cell = state.cells[r][c];
        if (cell && cell.id === id) return { r: r, c: c };
      }
    }
    return null;
  }

  function layout(animate) {
    if (!state) return;
    var box = metrics();
    tileEls.forEach(function (el, id) {
      var pos = find(id);
      if (!pos) return;
      if (!animate) el.style.transition = "none";
      place(el, pos.r, pos.c, box);
    });
    if (!animate) {
      requestAnimationFrame(function () {
        tileEls.forEach(function (el) { el.style.transition = ""; });
      });
    }
  }

  function renderAll() {
    tilesEl.innerHTML = "";
    tileEls.clear();
    var box = metrics();
    for (var r = 0; r < state.cells.length; r++) {
      for (var c = 0; c < state.cells[r].length; c++) {
        var cell = state.cells[r][c];
        if (!cell) continue;
        var el = makeTile(cell);
        el.style.transition = "none";
        place(el, r, c, box);
        tilesEl.appendChild(el);
        tileEls.set(cell.id, el);
      }
    }
    requestAnimationFrame(function () {
      tileEls.forEach(function (el) { el.style.transition = ""; });
    });
    updateHud();
  }

  function updateHud() {
    if (state.score > best) best = state.score;
    scoreEl.textContent = String(state.score);
    bestEl.textContent = String(best);
    var buddy = Buddy2048.buddy(state.goal);
    goalLine.innerHTML = (BuddyAnimals[state.goal] || "") + "<span>Make the " + buddy.name.toLowerCase() + "</span>";
    goalButtons.forEach(function (btn) {
      var on = Number(btn.dataset.goal) === state.goal;
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    undoBtn.disabled = state.undo.length === 0;
    soundBtn.textContent = muted ? "Quiet" : "Sound";
    soundBtn.setAttribute("aria-pressed", muted ? "false" : "true");
    soundBtn.setAttribute("aria-label", muted ? "Sound off" : "Sound on");
  }

  function say(text) {
    live.textContent = "";
    live.textContent = text;
  }

  function showToast(text) {
    toast.hidden = false;
    toast.textContent = text;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 1100);
  }

  function burst() {
    var box = document.getElementById("confetti");
    box.innerHTML = "";
    var colors = ["#f6c431", "#f08a3a", "#8eb4e8", "#c9a0f0", "#b6e5a8", "#ffb3c7"];
    for (var i = 0; i < 18; i++) {
      var bit = document.createElement("i");
      bit.style.left = (6 + Math.random() * 88) + "%";
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = (Math.random() * 120) + "ms";
      box.appendChild(bit);
    }
  }

  function dialogOpen() {
    return howDialog.open || endDialog.open;
  }

  function showEnd(value, options) {
    options = options || {};
    var buddy = Buddy2048.buddy(value);
    endAnimal.innerHTML = BuddyAnimals[value] || "";
    endTitle.textContent = options.full ? "All full!" : "You made the " + buddy.name.toLowerCase() + "!";
    endText.textContent = options.full
      ? "Your biggest animal was the " + buddy.name.toLowerCase() + " (" + value + ")."
      : value + " is on the board.";
    keepBtn.hidden = !options.canContinue;
    if (!options.full && !reducedMotion()) burst();
    if (!endDialog.open) endDialog.showModal();
    say(endTitle.textContent);
  }

  function closeEnd() {
    if (endDialog.open) endDialog.close();
  }

  function unlock() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (err) {
      audioCtx = null;
    }
  }

  function tone(freq, dur, when, type, gain) {
    if (muted || !audioCtx) return;
    var t = audioCtx.currentTime + (when || 0);
    var osc = audioCtx.createOscillator();
    var amp = audioCtx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t);
    amp.gain.setValueAtTime(gain || 0.06, t);
    amp.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(amp);
    amp.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  function playMoveSound() { tone(220, 0.06, 0, "sine", 0.04); }

  function playMergeSound(value) {
    tone(260 + Math.log2(value) * 42, 0.12, 0, "triangle", 0.07);
  }

  function playWinSound() {
    [523, 659, 784, 1046].forEach(function (freq, i) {
      tone(freq, 0.18, i * 0.09, "triangle", 0.06);
    });
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: 1,
        goal: state.goal,
        score: state.score,
        best: best,
        won: state.won,
        over: state.over,
        champion: state.champion,
        nextId: state.nextId,
        muted: muted,
        cells: state.cells,
        undo: state.undo,
      }));
    } catch (err) {
      /* private mode */
    }
  }

  function validValue(n) {
    return typeof n === "number" && n >= 2 && n <= 4096 && (n & (n - 1)) === 0;
  }

  function validCells(cells) {
    if (!Array.isArray(cells) || cells.length !== 4) return false;
    var ids = {};
    for (var r = 0; r < 4; r++) {
      if (!Array.isArray(cells[r]) || cells[r].length !== 4) return false;
      for (var c = 0; c < 4; c++) {
        var cell = cells[r][c];
        if (cell == null) continue;
        if (!cell || !validValue(cell.value) || typeof cell.id !== "number" || ids[cell.id]) return false;
        ids[cell.id] = true;
      }
    }
    return true;
  }

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || !validCells(raw.cells)) return null;
      if (Buddy2048.GOALS.indexOf(raw.goal) === -1) return null;
      var undo = Array.isArray(raw.undo) ? raw.undo.filter(function (snap) {
        return snap && validCells(snap.cells) && Buddy2048.GOALS.indexOf(snap.goal) !== -1;
      }) : [];
      return {
        best: typeof raw.best === "number" ? raw.best : 0,
        muted: !!raw.muted,
        state: {
          size: 4,
          goal: raw.goal,
          cells: raw.cells,
          score: raw.score || 0,
          won: !!raw.won,
          over: !!raw.over,
          champion: !!raw.champion,
          nextId: raw.nextId || 1,
          undo: undo.slice(-30),
        },
      };
    } catch (err) {
      return null;
    }
  }

  function afterChange(result) {
    updateHud();
    save();
    var high = Buddy2048.highestValue(state);
    if (result && result.justWon) {
      playWinSound();
      showEnd(result.newHigh || high || state.goal, { canContinue: !state.over });
    } else if (result && result.justChampion) {
      playWinSound();
      showEnd(2048, { canContinue: !state.over });
    } else if (state.over) {
      var top = Buddy2048.highest(state);
      showEnd(top ? top.value : 2, { full: true, canContinue: false });
    } else if (result && result.newHigh >= 16) {
      var buddy = Buddy2048.buddy(result.newHigh);
      showToast(buddy.name + "! " + result.newHigh);
      say(buddy.name + " " + result.newHigh);
    }
  }

  function act(dir) {
    if (busy || !state || state.over || dialogOpen()) return;
    unlock();
    var result = Buddy2048.move(state, dir);
    if (!result.moved) {
      board.classList.remove("shake");
      void board.offsetWidth;
      board.classList.add("shake");
      playMoveSound();
      return;
    }
    state = result.state;
    busy = true;
    playMoveSound();
    result.events.forEach(function (event) {
      if (event.type === "merge") playMergeSound(event.value);
    });
    var box = metrics();
    result.events.forEach(function (event) {
      if (event.type !== "move" && event.type !== "merge") return;
      var el = tileEls.get(event.id);
      if (!el) return;
      place(el, event.to.r, event.to.c, box);
      if (event.type === "merge") {
        var into = tileEls.get(event.intoId);
        if (into) into.style.zIndex = "1000";
      }
    });
    window.setTimeout(function () {
      result.events.forEach(function (event) {
        if (event.type === "merge") {
          var gone = tileEls.get(event.id);
          if (gone) {
            gone.remove();
            tileEls.delete(event.id);
          }
          var into = tileEls.get(event.intoId);
          if (into) {
            paint(into, event.value);
            into.style.zIndex = String(event.intoId);
            into.classList.remove("pop");
            void into.offsetWidth;
            if (!reducedMotion()) into.classList.add("pop");
          }
        }
        if (event.type === "spawn") {
          var el = makeTile({ id: event.id, value: event.value });
          if (!reducedMotion()) el.classList.add("fresh");
          place(el, event.at.r, event.at.c, metrics());
          tilesEl.appendChild(el);
          tileEls.set(event.id, el);
        }
      });
      busy = false;
      afterChange(result);
    }, reducedMotion() ? 0 : MOVE_MS);
  }

  function doUndo() {
    if (busy) return;
    unlock();
    var result = Buddy2048.undo(state);
    if (!result.undone) return;
    state = result.state;
    closeEnd();
    renderAll();
    save();
    say("Undone");
  }

  function doNew() {
    if (busy) return;
    unlock();
    state = Buddy2048.restart(state);
    closeEnd();
    renderAll();
    save();
    say("New game");
  }

  function chooseGoal(goal) {
    if (busy) return;
    unlock();
    var result = Buddy2048.setGoal(state, goal);
    if (!result.changed) return;
    state = result.state;
    closeEnd();
    var high = Buddy2048.highestValue(state);
    afterChange({
      justWon: result.justWon,
      justChampion: false,
      newHigh: result.justWon ? high : 0,
    });
    if (!result.justWon) {
      updateHud();
      save();
    }
  }

  goalButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      chooseGoal(Number(btn.dataset.goal));
    });
  });

  document.querySelectorAll(".arrow").forEach(function (btn) {
    btn.addEventListener("click", function () { act(btn.dataset.dir); });
  });
  undoBtn.addEventListener("click", doUndo);
  newBtn.addEventListener("click", doNew);
  soundBtn.addEventListener("click", function () {
    unlock();
    muted = !muted;
    updateHud();
    save();
    if (!muted) playMoveSound();
  });
  howBtn.addEventListener("click", function () {
    unlock();
    if (!howDialog.open) howDialog.showModal();
  });
  document.getElementById("lets-play").addEventListener("click", function () {
    howDialog.close();
  });
  keepBtn.addEventListener("click", function () {
    closeEnd();
    if (state.over) {
      var top = Buddy2048.highest(state);
      showEnd(top ? top.value : 2, { full: true, canContinue: false });
    }
  });
  againBtn.addEventListener("click", doNew);

  board.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  board.addEventListener("pointerup", function (event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    var dx = event.clientX - pointer.x;
    var dy = event.clientY - pointer.y;
    pointer = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    act(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  });
  board.addEventListener("pointercancel", function () { pointer = null; });

  window.addEventListener("keydown", function (event) {
    var map = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
      a: "left",
      A: "left",
      d: "right",
      D: "right",
      w: "up",
      W: "up",
      s: "down",
      S: "down",
    };
    if (!map[event.key] || event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    act(map[event.key]);
  });

  if (window.ResizeObserver) {
    new ResizeObserver(function () { layout(false); }).observe(board);
  } else {
    window.addEventListener("resize", function () { layout(false); });
  }

  var saved = load();
  if (saved) {
    state = saved.state;
    best = saved.best;
    muted = saved.muted;
  } else {
    state = Buddy2048.createGame();
  }
  renderAll();
  save();
  if (state.over) {
    var topTile = Buddy2048.highest(state);
    showEnd(topTile ? topTile.value : 2, { full: true, canContinue: false });
  }
})();
