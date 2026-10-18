(function (root) {
  "use strict";

  var SIZE = 4;
  var GOALS = [256, 512, 1024, 2048];
  var DEFAULT_GOAL = 256;
  var UNDO_LIMIT = 30;

  var BUDDIES = {
    2: { name: "Mouse", bg: "#F6E7C1", ink: "#5C4318" },
    4: { name: "Bunny", bg: "#F7C6D0", ink: "#8A3D55" },
    8: { name: "Frog", bg: "#B6E5A8", ink: "#1E6B32" },
    16: { name: "Ducky", bg: "#FFE56A", ink: "#7A5A00" },
    32: { name: "Piggy", bg: "#FFB3C7", ink: "#8C3050" },
    64: { name: "Fox", bg: "#F5A35C", ink: "#6B3208" },
    128: { name: "Lion", bg: "#F6C431", ink: "#6A4A00" },
    256: { name: "Tiger", bg: "#F08A3A", ink: "#5C2408" },
    512: { name: "Panda", bg: "#E7EEF4", ink: "#243040" },
    1024: { name: "Elephant", bg: "#8EB4E8", ink: "#163864" },
    2048: { name: "Dragon", bg: "#C9A0F0", ink: "#3D2170" },
    4096: { name: "Star", bg: "#FFD1DC", ink: "#7A2040" },
  };

  function emptyGrid() {
    var rows = [];
    for (var r = 0; r < SIZE; r++) {
      var row = [];
      for (var c = 0; c < SIZE; c++) row.push(null);
      rows.push(row);
    }
    return rows;
  }

  function cloneCells(cells) {
    return cells.map(function (row) {
      return row.map(function (cell) {
        return cell ? { id: cell.id, value: cell.value } : null;
      });
    });
  }

  function cloneUndo(undo) {
    return (undo || []).map(function (snap) {
      return {
        cells: cloneCells(snap.cells),
        score: snap.score,
        won: snap.won,
        over: snap.over,
        champion: snap.champion,
        nextId: snap.nextId,
        goal: snap.goal,
      };
    });
  }

  function snapshot(state, keepUndo) {
    var snap = {
      cells: cloneCells(state.cells),
      score: state.score,
      won: state.won,
      over: state.over,
      champion: state.champion,
      nextId: state.nextId,
      goal: state.goal,
    };
    if (keepUndo) snap.undo = cloneUndo(state.undo);
    return snap;
  }

  function highestValue(state) {
    var best = 0;
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var cell = state.cells[r][c];
        if (cell && cell.value > best) best = cell.value;
      }
    }
    return best;
  }

  function highest(state) {
    var best = null;
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var cell = state.cells[r][c];
        if (cell && (!best || cell.value > best.value)) best = cell;
      }
    }
    return best;
  }

  function canMove(state) {
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var cell = state.cells[r][c];
        if (!cell) return true;
        if (c + 1 < SIZE) {
          var right = state.cells[r][c + 1];
          if (right && right.value === cell.value) return true;
        }
        if (r + 1 < SIZE) {
          var down = state.cells[r + 1][c];
          if (down && down.value === cell.value) return true;
        }
      }
    }
    return false;
  }

  function goalOf(goal) {
    var n = Number(goal);
    if (GOALS.indexOf(n) === -1) {
      throw new Error("Winning number must be 256, 512, 1024, or 2048");
    }
    return n;
  }

  function blank(goal) {
    return {
      size: SIZE,
      goal: goalOf(goal == null ? DEFAULT_GOAL : goal),
      cells: emptyGrid(),
      score: 0,
      won: false,
      over: false,
      champion: false,
      nextId: 1,
      undo: [],
    };
  }

  function empties(cells) {
    var spots = [];
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (!cells[r][c]) spots.push({ r: r, c: c });
      }
    }
    return spots;
  }

  function pickIndex(rng, count) {
    var n = rng();
    if (typeof n !== "number" || n !== n) n = 0;
    var idx = Math.floor(n * count);
    if (idx < 0) idx = 0;
    if (idx >= count) idx = count - 1;
    return idx;
  }

  function spawnInto(state, rng) {
    var spots = empties(state.cells);
    if (!spots.length) return null;
    var spot = spots[pickIndex(rng, spots.length)];
    var tile = { id: state.nextId, value: 2 };
    state.nextId += 1;
    state.cells[spot.r][spot.c] = tile;
    return { tile: tile, at: spot };
  }

  function lineTiles(cells, dir, index) {
    var tiles = [];
    var r;
    var c;
    var cell;
    if (dir === "left") {
      for (c = 0; c < SIZE; c++) {
        cell = cells[index][c];
        if (cell) tiles.push({ id: cell.id, value: cell.value, r: index, c: c });
      }
    } else if (dir === "right") {
      for (c = SIZE - 1; c >= 0; c--) {
        cell = cells[index][c];
        if (cell) tiles.push({ id: cell.id, value: cell.value, r: index, c: c });
      }
    } else if (dir === "up") {
      for (r = 0; r < SIZE; r++) {
        cell = cells[r][index];
        if (cell) tiles.push({ id: cell.id, value: cell.value, r: r, c: index });
      }
    } else if (dir === "down") {
      for (r = SIZE - 1; r >= 0; r--) {
        cell = cells[r][index];
        if (cell) tiles.push({ id: cell.id, value: cell.value, r: r, c: index });
      }
    } else {
      throw new Error("Unknown direction");
    }
    return tiles;
  }

  function destination(dir, index, i) {
    if (dir === "left") return { r: index, c: i };
    if (dir === "right") return { r: index, c: SIZE - 1 - i };
    if (dir === "up") return { r: i, c: index };
    return { r: SIZE - 1 - i, c: index };
  }

  function slide(tiles) {
    var placed = [];
    for (var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];
      var last = placed[placed.length - 1];
      if (last && !last.merged && last.value === tile.value) {
        last.value *= 2;
        last.merged = true;
        last.mergeFrom = tile;
      } else {
        placed.push({
          id: tile.id,
          value: tile.value,
          merged: false,
          from: { r: tile.r, c: tile.c },
          mergeFrom: null,
        });
      }
    }
    return placed;
  }

  function createGame(rng, goal) {
    var random = rng || Math.random;
    var state = blank(goal);
    spawnInto(state, random);
    spawnInto(state, random);
    state.over = !canMove(state);
    return state;
  }

  function fromCells(rows, extras) {
    extras = extras || {};
    if (!rows || rows.length !== SIZE) throw new Error("Board must be 4 by 4");
    var state = blank(extras.goal == null ? DEFAULT_GOAL : extras.goal);
    var nextId = 1;
    for (var r = 0; r < SIZE; r++) {
      if (!rows[r] || rows[r].length !== SIZE) throw new Error("Board must be 4 by 4");
      for (var c = 0; c < SIZE; c++) {
        var value = rows[r][c];
        if (value == null || value === 0) continue;
        state.cells[r][c] = { id: nextId, value: value };
        nextId += 1;
      }
    }
    if (extras.nextId) state.nextId = extras.nextId;
    state.score = extras.score || 0;
    var high = highestValue(state);
    state.won = extras.won != null ? !!extras.won : high >= state.goal;
    state.champion = extras.champion != null ? !!extras.champion : high >= 2048;
    state.over = extras.over != null ? !!extras.over : !canMove(state);
    return state;
  }

  function move(state, dir, rng) {
    var random = rng || Math.random;
    var before = snapshot(state, false);
    var nextCells = emptyGrid();
    var events = [];
    var gain = 0;
    var moved = false;

    for (var index = 0; index < SIZE; index++) {
      var placed = slide(lineTiles(state.cells, dir, index));
      for (var i = 0; i < placed.length; i++) {
        var item = placed[i];
        var to = destination(dir, index, i);
        nextCells[to.r][to.c] = { id: item.id, value: item.value };
        if (item.from.r !== to.r || item.from.c !== to.c) {
          moved = true;
          events.push({
            type: "move",
            id: item.id,
            from: item.from,
            to: to,
            value: item.value,
          });
        }
        if (item.mergeFrom) {
          moved = true;
          gain += item.value;
          events.push({
            type: "merge",
            id: item.mergeFrom.id,
            intoId: item.id,
            from: { r: item.mergeFrom.r, c: item.mergeFrom.c },
            to: to,
            value: item.value,
          });
        }
      }
    }

    if (!moved) {
      return {
        state: state,
        moved: false,
        events: [],
        justWon: false,
        justChampion: false,
        gained: 0,
        newHigh: 0,
      };
    }

    var beforeHigh = highestValue(state);
    var next = {
      size: state.size,
      goal: state.goal,
      cells: nextCells,
      score: state.score + gain,
      won: state.won,
      over: false,
      champion: state.champion,
      nextId: state.nextId,
      undo: state.undo.concat(before).slice(-UNDO_LIMIT),
    };
    var spawned = spawnInto(next, random);
    if (spawned) {
      events.push({
        type: "spawn",
        id: spawned.tile.id,
        at: spawned.at,
        value: spawned.tile.value,
      });
    }
    var high = highestValue(next);
    var won = high >= next.goal;
    var champion = high >= 2048;
    var justWon = won && !state.won;
    var justChampion = champion && !state.champion && next.goal < 2048;
    next.won = won;
    next.champion = champion;
    next.over = !canMove(next);
    return {
      state: next,
      moved: true,
      events: events,
      justWon: justWon,
      justChampion: justChampion,
      gained: gain,
      newHigh: high > beforeHigh ? high : 0,
    };
  }

  function undo(state) {
    if (!state.undo.length) return { state: state, undone: false };
    var prev = state.undo[state.undo.length - 1];
    return {
      undone: true,
      state: {
        size: SIZE,
        goal: prev.goal,
        cells: cloneCells(prev.cells),
        score: prev.score,
        won: prev.won,
        over: prev.over,
        champion: prev.champion,
        nextId: prev.nextId,
        undo: prev.undo ? cloneUndo(prev.undo) : state.undo.slice(0, -1),
      },
    };
  }

  function setGoal(state, goal) {
    var nextGoal = goalOf(goal);
    if (nextGoal === state.goal) {
      return { state: state, changed: false, justWon: false };
    }
    var before = snapshot(state, false);
    var high = highestValue(state);
    var won = high >= nextGoal;
    var next = {
      size: state.size,
      goal: nextGoal,
      cells: cloneCells(state.cells),
      score: state.score,
      won: won,
      over: state.over,
      champion: state.champion || high >= 2048,
      nextId: state.nextId,
      undo: state.undo.concat(before).slice(-UNDO_LIMIT),
    };
    return { state: next, changed: true, justWon: won && !state.won };
  }

  function restart(state, rng) {
    var fresh = createGame(rng || Math.random, state.goal);
    var snap = snapshot(state, true);
    fresh.undo = [snap];
    return fresh;
  }

  function buddy(value) {
    return BUDDIES[value] || { name: String(value), bg: "#d7c4f2", ink: "#3D2170" };
  }

  var api = {
    SIZE: SIZE,
    GOALS: GOALS,
    DEFAULT_GOAL: DEFAULT_GOAL,
    BUDDIES: BUDDIES,
    createGame: createGame,
    fromCells: fromCells,
    move: move,
    undo: undo,
    setGoal: setGoal,
    restart: restart,
    canMove: canMove,
    highest: highest,
    highestValue: highestValue,
    snapshot: snapshot,
    buddy: buddy,
  };

  root.Buddy2048 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
