const test = require('node:test');
const assert = require('node:assert/strict');
const { STAGES, TOTAL_WEIGHT, sample } = require('../assets/progression-scroll.js');

test('every scroll position keeps the frame inside its caption range, moving forward', () => {
  let previous = 0;
  for (let step = 0; step <= 10000; step++) {
    const { phase, frame } = sample(step / 10000);
    assert.ok(frame >= STAGES[phase].from && frame <= STAGES[phase].to);
    assert.ok(frame >= previous);
    previous = frame;
  }
});
test('all boundaries change image and caption together in either direction', () => {
  let weight = 0;
  STAGES.slice(0, -1).forEach((stage, phase) => {
    weight += stage.weight;
    assert.deepEqual(sample(weight / TOTAL_WEIGHT - 1e-8), { phase, frame: stage.to });
    assert.deepEqual(sample(weight / TOTAL_WEIGHT + 1e-8), { phase: phase + 1, frame: STAGES[phase + 1].from });
  });
});
test('every short caption gets substantial scroll space; the conclusion holds still', () => {
  assert.equal(STAGES.length, 7);
  STAGES.forEach(stage => assert.ok(stage.weight / TOTAL_WEIGHT >= .13));
  assert.deepEqual(sample(-1), { phase: 0, frame: 1 });
  assert.deepEqual(sample(.99), { phase: 6, frame: 150 });
  assert.deepEqual(sample(2), { phase: 6, frame: 150 });
});
