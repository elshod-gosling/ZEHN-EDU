// Typing state stays independent of the DOM so timing and scoring can be checked.
const key = text => text.replace(/[‘’ʻʼ`]/g, "'");
export function createTypingTest(words, mode = 'time', limit = 30) {
  const test = {words, mode, limit, index: 0, value: '', history: [], started: null, finished: null, attempts: 0, correctAttempts: 0};
  test.expired = now => test.started !== null && mode === 'time' && now >= test.started + limit * 1000;
  test.finish = now => { if (test.finished === null) test.finished = mode === 'time' && test.expired(now) ? test.started + limit * 1000 : now; };
  test.setValue = (value, now) => {
    if (test.finished !== null) return;
    if (test.expired(now)) { test.finish(now); return; }
    value = value.slice(0, 40);
    if (!value && test.started === null) return;
    if (test.started === null) test.started = now;
    let prefix = 0;
    while (prefix < value.length && value[prefix] === test.value[prefix]) prefix++;
    for (let i = prefix; i < value.length; i++) {
      test.attempts++;
      if (key(value[i]) === key(words[test.index]?.[i] || '')) test.correctAttempts++;
    }
    test.value = value;
    if (mode === 'words' && test.index === limit - 1 && key(value) === key(words[test.index])) test.commit(now);
  };
  test.commit = now => {
    if (test.finished !== null) return;
    if (test.expired(now)) { test.finish(now); return; }
    if (!test.value) return;
    const good = key(test.value) === key(words[test.index]);
    test.attempts++;
    if (good) test.correctAttempts++;
    test.history.push(test.value);
    test.index++;
    test.value = '';
    if (mode === 'words' && test.index >= limit) test.finish(now);
  };
  test.back = now => {
    if (test.finished !== null || test.expired(now) || test.value || !test.index) return;
    test.index--;
    test.value = test.history.pop();
  };
  test.stats = now => {
    let characters = 0, rawCharacters = 0, correctWords = 0;
    const entries = [...test.history, ...(test.value ? [test.value] : [])];
    entries.forEach((value, index) => {
      const expected = words[index];
      const complete = index < test.history.length;
      rawCharacters += value.length + (complete ? 1 : 0);
      const good = key(value) === key(expected);
      if (good && (complete || test.finished !== null)) correctWords++;
      for (let i = 0; i < value.length; i++) if (key(value[i]) === key(expected[i] || '')) characters++;
      if (complete && good) characters++;
    });
    const seconds = test.started === null ? 0 : Math.max(0, ((test.finished ?? now) - test.started) / 1000);
    const minutes = Math.max(1, seconds) / 60;
    return {wpm: Math.round(characters / 5 / minutes), raw: Math.round(rawCharacters / 5 / minutes), accuracy: test.attempts ? Math.round(test.correctAttempts / test.attempts * 100) : 100, correctWords, characters, errors: test.attempts - test.correctAttempts, seconds};
  };
  return test;
}

const uiCopy = {
  en: {title:'typing practice', time:'time', words:'words', ready:'Start typing to begin', focus:'Click here to focus', restart:'Restart test', next:'Next test', raw:'raw', errors:'errors', best:'personal best', test:'test', hint:'Space → next word · Backspace → correct · Tab + Enter → restart', reward:'Type 5 correct words to finish this quest and earn 50 XP.', low:'Keep practicing. Finish 5 correct words in one test to complete the quest.', done:'Test complete', language:'Word language'},
  uz: {title:'tez yozish mashqi', time:'vaqt', words:'so‘zlar', ready:'Boshlash uchun yozing', focus:'Yozish uchun shu yerni bosing', restart:'Qayta boshlash', next:'Keyingi sinov', raw:'umumiy', errors:'xatolar', best:'shaxsiy rekord', test:'sinov', hint:'Space → keyingi so‘z · Backspace → tuzatish · Tab + Enter → qayta boshlash', reward:'5 ta so‘zni to‘g‘ri yozib, topshiriqni bajaring va 50 XP oling.', low:'Mashqni davom ettiring. Topshiriq uchun bitta sinovda 5 ta so‘zni to‘g‘ri yozing.', done:'Sinov tugadi', language:'So‘zlar tili'},
  ru: {title:'практика печати', time:'время', words:'слова', ready:'Начните печатать', focus:'Нажмите здесь, чтобы печатать', restart:'Начать заново', next:'Следующий тест', raw:'общая скорость', errors:'ошибки', best:'личный рекорд', test:'тест', hint:'Пробел → следующее слово · Backspace → исправить · Tab + Enter → начать заново', reward:'Напечатайте 5 слов правильно, чтобы выполнить задание и получить 50 XP.', low:'Продолжайте практиковаться. Для задания напечатайте 5 слов правильно за один тест.', done:'Тест завершён', language:'Язык слов'}
};
const extraWords = {
  en:'the be to of and a in that have it for not on with as you do at this but by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us learn world create focus school light small home hand life place word never again together'.split(' '),
  uz:'va men sen biz ular bu shu uchun bilan bor yo‘l uy ish kun tun vaqt so‘z ona ota bola suv non yer osmon daraxt hayot inson yaxshi katta kichik yangi eski bugun ertaga kecha doim bir ikki uch ham lekin yoki agar nima kim qanday qayer mehr til shahar qishloq bahor yoz kuz qish rang oq qora bilim kitob qalam maktab dars oila do‘st o‘yin o‘rganish tezlik maqsad imkon mehnat savol javob'.split(' '),
  ru:'и в не на я быть он с что а это как она по но они мы к у ты из за от так для о же всё его ещё или во уже да до время слово день дом свет вода рука мир жизнь люди знать видеть идти делать новый большой маленький первый хороший работа школа книга друг город место путь вместе учиться писать каждый сейчас можно только'.split(' ')
};
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountTyping({show, modal, lang, t, words, read, write, award, credits, registerCleanup}) {
  const labels = uiCopy[lang];
  const stored = read('zehn-typing-settings', {});
  const settings = stored && typeof stored === 'object' ? stored : {};
  let mode = settings.mode === 'words' ? 'words' : 'time';
  let limit = [15,30,60,120].includes(settings.time) ? settings.time : 30;
  let count = [10,25,50,100].includes(settings.words) ? settings.words : 25;
  show('train', `<div class="typing-heading"><span aria-hidden="true">⌨</span><h2 id="modal-title">${labels.title}</h2><span class="typing-language" title="${labels.language}">${{en:'english',uz:'o‘zbek',ru:'русский'}[lang]}</span></div><div class="typing-toolbar" aria-label="${labels.test}"><div id="typing-modes" class="typing-choice"></div><span class="typing-divider" aria-hidden="true"></span><div id="typing-limits" class="typing-choice"></div></div><div class="typing-live"><span id="typing-progress"></span><span id="typing-speed"></span></div><div id="typing-stage" class="typing-stage"><div id="typing-words" class="typing-words" aria-hidden="true"></div><input id="typing-input" class="typing-capture" aria-label="${t('typeWord')}" aria-describedby="typing-help" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text" maxlength="40"><div class="typing-focus" id="typing-focus">${labels.focus}</div></div><div class="typing-ready" id="typing-ready">${labels.ready}</div><div id="typing-results" class="typing-results" hidden aria-live="polite"></div><button type="button" id="typing-restart" class="typing-restart" aria-label="${labels.restart}" title="${labels.restart}">↻</button><p id="typing-help" class="typing-help">${labels.hint}</p><div id="feedback" class="typing-feedback" role="status">${labels.reward}</div>${credits ? `<div class="typing-credit">${credits.lessonOffer()}</div>` : ''}`);
  modal.classList.add('typing-modal');
  const $ = selector => modal.querySelector(selector);
  const input = $('#typing-input'), stage = $('#typing-stage'), wordArea = $('#typing-words');
  let test, timer, disposed = false;
  const pool = [...new Set([...extraWords[lang], ...words])];
  function generate(size) {
    const result = [];
    while (result.length < size) {
      const candidates = [...pool];
      for (let i = candidates.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
      if (candidates[0] === result.at(-1)) candidates.reverse();
      result.push(...candidates);
    }
    return result.slice(0, size);
  }
  function toolbar() {
    $('#typing-modes').innerHTML = ['time','words'].map(value => `<button type="button" data-mode="${value}" aria-pressed="${mode === value}">${labels[value]}</button>`).join('');
    $('#typing-limits').innerHTML = (mode === 'time' ? [15,30,60,120] : [10,25,50,100]).map(value => `<button type="button" data-limit="${value}" aria-pressed="${(mode === 'time' ? limit : count) === value}">${value}</button>`).join('');
    $('#typing-modes').querySelectorAll('button').forEach(button => button.onclick = () => { mode = button.dataset.mode; reset(); });
    $('#typing-limits').querySelectorAll('button').forEach(button => button.onclick = () => { if (mode === 'time') limit = Number(button.dataset.limit); else count = Number(button.dataset.limit); reset(); });
  }
  function paintWord(index) {
    const element = wordArea.children[index];
    if (!element) return;
    const typed = index < test.index ? test.history[index] : index === test.index ? test.value : '';
    const target = test.words[index];
    element.className = 'typing-word' + (index === test.index ? ' current' : '') + (index < test.index && key(typed) !== key(target) ? ' missed' : '');
    const letters = Array.from(target).map((char, position) => `<span class="${position < typed.length ? key(typed[position]) === key(char) ? 'correct' : 'incorrect' : ''}">${index === test.index && position === typed.length ? '<i class="typing-caret"></i>' : ''}${escape(char)}</span>`);
    for (let i = target.length; i < typed.length; i++) letters.push(`<span class="extra">${escape(typed[i])}</span>`);
    if (index === test.index && typed.length >= target.length) letters.push('<span class="caret-end"><i class="typing-caret"></i></span>');
    element.innerHTML = letters.join('');
  }
  function appendWords(from) {
    wordArea.insertAdjacentHTML('beforeend', test.words.slice(from).map(() => '<div class="typing-word"></div>').join(''));
    for (let i = from; i < test.words.length; i++) paintWord(i);
  }
  function draw(previous = test.index) {
    if (mode === 'time' && test.index > test.words.length - 20) {
      const from = test.words.length; test.words.push(...generate(100)); appendWords(from);
    }
    paintWord(previous); paintWord(test.index);
    input.setAttribute('aria-label', `${t('typeWord')}: ${test.words[test.index] || ''}`);
    const current = wordArea.children[test.index];
    if (current) {
      const top = current.offsetTop - wordArea.offsetTop;
      wordArea.scrollTop = Math.max(0, top - current.offsetHeight);
    }
    const stats = test.stats(Date.now());
    $('#typing-speed').textContent = test.started === null ? '' : `${stats.wpm} wpm`;
    $('#typing-progress').textContent = mode === 'time' ? Math.max(0, Math.ceil(limit - stats.seconds)) : `${Math.min(test.index, count)} / ${count}`;
    modal.classList.toggle('typing-running', test.started !== null && test.finished === null);
    if (test.started !== null) $('#typing-ready').textContent = '';
  }
  function finish() {
    clearInterval(timer); timer = null;
    input.disabled = true;
    stage.hidden = true;
    modal.classList.remove('typing-running');
    const stats = test.stats(Date.now());
    const bestKey = `zehn-typing-best-${lang}-${mode}-${mode === 'time' ? limit : count}`;
    const previousBest = Number(read(bestKey, 0)) || 0;
    const best = Math.max(previousBest, stats.wpm);
    write(bestKey, best);
    $('#typing-ready').textContent = labels.done;
    $('#typing-results').hidden = false;
    $('#typing-results').innerHTML = `<div class="typing-main-stat"><span>wpm</span><strong>${stats.wpm}</strong></div><div class="typing-main-stat"><span>${t('accuracy').toLowerCase()}</span><strong>${stats.accuracy}%</strong></div><div class="typing-detail"><span>${labels.raw}</span><b>${stats.raw} wpm</b></div><div class="typing-detail"><span>${labels.words}</span><b>${stats.correctWords}</b></div><div class="typing-detail"><span>${labels.errors}</span><b>${stats.errors}</b></div><div class="typing-detail"><span>${labels.time}</span><b>${stats.seconds.toFixed(1)}s</b></div><div class="typing-best"><span>${labels.best}</span><b>${best} wpm${stats.wpm > previousBest ? ' ↗' : ''}</b></div>`;
    $('#feedback').textContent = stats.correctWords >= 5 ? award('typing-run') ? t('correct') : t('againCorrect') : labels.low;
    $('#typing-restart').innerHTML = `↻ <span>${labels.next}</span>`;
    $('#typing-restart').focus();
  }
  function tick() {
    if (disposed || test.finished !== null) return;
    if (test.expired(Date.now())) test.finish(Date.now());
    draw();
    if (test.finished !== null) finish();
  }
  function update(value) {
    const previous = test.index;
    test.setValue(value, Date.now());
    input.value = test.value;
    if (test.started !== null && !timer && test.finished === null) timer = setInterval(tick, 100);
    draw(previous);
    if (test.finished !== null) finish();
  }
  function reset() {
    clearInterval(timer); timer = null;
    write('zehn-typing-settings', {mode, time: limit, words: count});
    test = createTypingTest(generate(mode === 'time' ? 150 : count), mode, mode === 'time' ? limit : count);
    input.disabled = false; input.value = '';
    stage.hidden = false; wordArea.innerHTML = ''; wordArea.scrollTop = 0;
    $('#typing-results').hidden = true;
    $('#typing-ready').textContent = labels.ready;
    $('#feedback').textContent = labels.reward;
    $('#typing-restart').innerHTML = '↻';
    toolbar(); appendWords(0); draw(); input.focus();
  }
  input.addEventListener('paste', event => event.preventDefault());
  input.addEventListener('drop', event => event.preventDefault());
  input.addEventListener('beforeinput', event => {
    if (/Paste|Drop/.test(event.inputType) || (event.inputType === 'insertText' && event.data?.includes(' '))) {
      event.preventDefault();
      if (event.data === ' ') { const previous = test.index; test.commit(Date.now()); input.value = test.value; draw(previous); if (test.finished !== null) finish(); }
    }
  });
  input.addEventListener('input', event => { if (!event.isComposing) update(input.value); });
  input.addEventListener('compositionend', () => update(input.value));
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault(); const previous = test.index; test.commit(Date.now()); input.value = test.value; draw(previous); if (test.finished !== null) finish();
    } else if (event.key === 'Backspace' && !input.value && test.index) {
      event.preventDefault(); const previous = test.index; test.back(Date.now()); input.value = test.value; draw(previous);
    } else if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) event.preventDefault();
  });
  input.addEventListener('select', () => input.setSelectionRange(input.value.length, input.value.length));
  input.addEventListener('focus', () => stage.classList.remove('unfocused'));
  input.addEventListener('blur', () => stage.classList.add('unfocused'));
  stage.addEventListener('click', () => input.focus());
  $('#typing-restart').onclick = reset;
  const shortcut = event => { if (event.target === $('#typing-restart') && event.key === 'Enter') { event.preventDefault(); reset(); } };
  modal.addEventListener('keydown', shortcut);
  if (credits) $('#lesson-credits').onclick = () => credits.openEarn('typing');
  registerCleanup(() => { disposed = true; clearInterval(timer); modal.removeEventListener('keydown', shortcut); modal.classList.remove('typing-modal','typing-running'); });
  reset();
}
