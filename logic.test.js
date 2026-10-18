"use strict";

var assert = require("node:assert");
var game = require("./logic.js");

function zero() {
  return 0;
}

function values(state) {
  return state.cells.map(function (row) {
    return row.map(function (cell) {
      return cell ? cell.value : 0;
    });
  });
}

function row(state, r) {
  return values(state)[r];
}

var started = game.createGame(zero);
assert.deepStrictEqual(values(started), [
  [2, 2, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]);
assert.strictEqual(started.goal, 256);
assert.strictEqual(started.score, 0);
assert.strictEqual(started.won, false);

var merged = game.move(started, "left", zero);
assert.strictEqual(merged.moved, true);
assert.strictEqual(merged.gained, 4);
assert.strictEqual(merged.state.score, 4);
assert.strictEqual(merged.state.cells[0][0].value, 4);
assert.strictEqual(merged.state.cells[0][1].value, 2);
assert.strictEqual(merged.events.filter(function (e) { return e.type === "merge"; }).length, 1);
assert.strictEqual(merged.events.filter(function (e) { return e.type === "spawn"; }).length, 1);
assert.strictEqual(merged.justWon, false);

var fours = game.fromCells([
  [2, 2, 2, 2],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]);
var paired = game.move(fours, "left", zero);
assert.strictEqual(paired.state.cells[0][0].value, 4);
assert.strictEqual(paired.state.cells[0][1].value, 4);
assert.notStrictEqual(paired.state.cells[0][0].value, 8);
assert.strictEqual(paired.gained, 8);

var noCascade = game.fromCells([
  [2, 2, 4, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]);
var stayed = game.move(noCascade, "left", zero);
assert.strictEqual(stayed.state.cells[0][0].value, 4);
assert.strictEqual(stayed.state.cells[0][1].value, 4);

var once = game.fromCells([
  [4, 2, 2, 2],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]);
var onceMoved = game.move(once, "left", zero);
assert.deepStrictEqual(row(onceMoved.state, 0).slice(0, 3), [4, 4, 2]);
assert.strictEqual(onceMoved.gained, 4);

var toTheRight = game.fromCells([
  [2, 0, 0, 2],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]);
var right = game.move(toTheRight, "right", zero);
assert.strictEqual(right.state.cells[0][3].value, 4);
assert.strictEqual(right.state.cells[0][0].value, 2);

var upBoard = game.fromCells([
  [2, 0, 0, 0],
  [0, 0, 0, 0],
  [2, 0, 0, 0],
  [0, 0, 0, 0],
]);
var up = game.move(upBoard, "up", zero);
assert.strictEqual(up.state.cells[0][0].value, 4);
assert.strictEqual(up.state.cells[0][1].value, 2);

var downBoard = game.fromCells([
  [2, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [2, 0, 0, 0],
]);
var down = game.move(downBoard, "down", zero);
assert.strictEqual(down.state.cells[3][0].value, 4);
assert.strictEqual(down.state.cells[0][0].value, 2);

var packed = game.fromCells([
  [2, 4, 8, 16],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]);
var stuck = game.move(packed, "left", zero);
assert.strictEqual(stuck.moved, false);
assert.strictEqual(stuck.state.score, 0);
assert.strictEqual(stuck.state.undo.length, 0);
assert.strictEqual(stuck.state.nextId, packed.nextId);

var checker = game.fromCells([
  [2, 4, 2, 4],
  [4, 2, 4, 2],
  [2, 4, 2, 4],
  [4, 2, 4, 2],
]);
assert.strictEqual(game.canMove(checker), false);
assert.strictEqual(checker.over, true);

var almost = game.fromCells([
  [128, 128, 2, 4],
  [8, 16, 32, 2],
  [4, 8, 16, 32],
  [2, 4, 8, 16],
]);
var won = game.move(almost, "left", zero);
assert.strictEqual(won.justWon, true);
assert.strictEqual(won.state.won, true);
assert.strictEqual(won.state.cells[0][0].value, 256);
assert.strictEqual(won.state.goal, 256);
assert.strictEqual(won.gained, 256);

var back = game.undo(won.state);
assert.strictEqual(back.undone, true);
assert.strictEqual(back.state.won, false);
assert.strictEqual(back.state.score, 0);
assert.strictEqual(back.state.cells[0][0].value, 128);
assert.strictEqual(back.state.cells[0][1].value, 128);

var harder = game.fromCells(
  [
    [256, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  { goal: 512 }
);
assert.strictEqual(harder.won, false);
var raised = game.setGoal(harder, 256);
assert.strictEqual(raised.changed, true);
assert.strictEqual(raised.justWon, true);
assert.strictEqual(raised.state.goal, 256);
assert.strictEqual(raised.state.won, true);
var goalBack = game.undo(raised.state);
assert.strictEqual(goalBack.state.goal, 512);
assert.strictEqual(goalBack.state.won, false);

assert.throws(function () {
  game.setGoal(started, 128);
});

var dragon = game.fromCells(
  [
    [1024, 1024, 2, 4],
    [8, 16, 32, 64],
    [4, 8, 16, 32],
    [2, 4, 8, 16],
  ],
  { goal: 256, won: true }
);
var champ = game.move(dragon, "left", zero);
assert.strictEqual(champ.justWon, false);
assert.strictEqual(champ.justChampion, true);
assert.strictEqual(champ.state.cells[0][0].value, 2048);

var atDragon = game.fromCells(
  [
    [1024, 1024, 2, 4],
    [8, 16, 32, 64],
    [4, 8, 16, 32],
    [2, 4, 8, 16],
  ],
  { goal: 2048 }
);
var dragonWin = game.move(atDragon, "left", zero);
assert.strictEqual(dragonWin.justWon, true);
assert.strictEqual(dragonWin.justChampion, false);

var fresh = game.restart(won.state, zero);
assert.strictEqual(fresh.goal, 256);
assert.deepStrictEqual(values(fresh), [
  [2, 2, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]);
var restored = game.undo(fresh);
assert.strictEqual(restored.state.cells[0][0].value, 256);
assert.strictEqual(restored.state.won, true);

var same = game.setGoal(started, 256);
assert.strictEqual(same.changed, false);
assert.strictEqual(same.state, started);

console.log("logic tests passed");
