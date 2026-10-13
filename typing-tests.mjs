import assert from 'node:assert/strict';
import {createTypingTest} from './dist/typing.mjs';

const timed = createTypingTest(['hello','world'], 'time', 30);
assert.equal(timed.started, null, 'A test waits for the first character');
timed.setValue('hello', 1000);
timed.commit(2000);
timed.setValue('world', 3000);
timed.finish(33000);
assert.equal(timed.finished, 31000, 'Delayed timer callbacks use the exact deadline');
assert.deepEqual(timed.stats(40000), {wpm:4, raw:4, accuracy:100, correctWords:2, characters:11, errors:0, seconds:30});
timed.setValue('late', 40000);
assert.equal(timed.value, 'world', 'Finished tests reject input');

const corrected = createTypingTest(['cat','dog'], 'words', 2);
corrected.setValue('cax', 1000);
corrected.setValue('ca', 2000);
corrected.setValue('cat', 3000);
corrected.commit(4000);
corrected.setValue('dog', 5000);
assert.equal(corrected.finished, 5000, 'Final correct word ends word mode without a trailing space');
assert.equal(corrected.stats(5000).correctWords, 2);
assert.equal(corrected.stats(5000).errors, 1, 'Correcting a mistake retains its accuracy cost');
assert.equal(corrected.stats(5000).accuracy, 89);

const skipped = createTypingTest(['cat','dog','sun'], 'words', 3);
skipped.setValue('c', 0);
skipped.commit(1000);
assert.equal(skipped.index, 1, 'Incorrect or incomplete words can be skipped');
skipped.back(2000);
assert.equal(skipped.index, 0);
assert.equal(skipped.value, 'c', 'Backspace restores a previous word for correction');
skipped.setValue('cat', 3000);
skipped.commit(4000);
assert.equal(skipped.stats(4000).correctWords, 1);
assert.equal(skipped.stats(4000).errors, 1, 'Skipped-word errors remain recorded after correction');

const expired = createTypingTest(['cat'], 'time', 15);
expired.setValue('c', 0);
expired.setValue('cat', 15000);
assert.equal(expired.finished, 15000);
assert.equal(expired.value, 'c', 'Input at the deadline cannot inflate scores');

const uzbek = createTypingTest(['o‘yin','do‘st'], 'words', 2);
uzbek.setValue("o'yin", 0);
uzbek.commit(1000);
uzbek.setValue('do’st', 2000);
assert.equal(uzbek.stats(2000).accuracy, 100, 'Uzbek apostrophe variants are equivalent');
assert.equal(uzbek.stats(2000).correctWords, 2);
const russian = createTypingTest(['мир'], 'words', 1);
russian.setValue('мир', 1000);
assert.equal(russian.finished, 1000);
assert.equal(russian.stats(1000).correctWords, 1);
console.log('PASS: automatic start, exact deadlines, final-word completion, corrected-error accuracy, skipped words, backtracking, Uzbek apostrophes and Cyrillic.');
