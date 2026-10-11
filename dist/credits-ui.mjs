import * as identity from './account.mjs';
import { POLICY, advancePractice, canRedeem } from './credit-policy.mjs';
export const creditCopy = {
  en: { credits:'credits', signIn:'Continue with Google', signOut:'Sign out', earn:'Earn credits', wallet:'My credits', title:'LEARN. EARN. DUEL.', banner:'Ten little wins. One big duel.', explain:'Earn 10 credits per one-minute learning round. Collect 100, then spend them on five minutes of Minecraft-style PvP.', estimate:'About 10 minutes of practice. Your unused credits stay in your account.', balance:'Available credits', total:'Credits earned', pass:'PvP pass', account:'Your learning account', loginNote:'Use your own Google account on this school PC. Regular Gmail accounts work too. Remember to sign out when you leave.', setup:'Google sign-in is being set up. Your existing lessons are still available.', loading:'Connecting your account…', developer:'DEVELOPER', unlimited:'Unlimited credits and access', redeem:'Use 100 credits → 5 min PvP', continue:'Continue PvP', start:'Start a learning round', need:'Earn {n} more credits to enter PvP.', ready:'Your PvP reward is ready.', lesson:'LEARNING ROUND', round:'Round', minute:'Read, try, then answer. Stay on this tab for one minute to earn 10 credits.', pause:'Practice timer paused. Return to this tab to continue.', wait:'Practise for {n} more seconds before checking.', answer:'Your answer', check:'Check & earn 10 credits', success:'+10 credits earned. Nice work.', retry:'That answer was not accepted. Review the lesson and try again. No credits were lost.', changed:'This round changed in another tab. Start a new round.', next:'Next learning round →', finish:'Spend your credits →', error:'Could not connect. Check your internet and try again.', expired:'Your PvP pass has ended. Learn another round to earn the next one.', back:'Back to learning', time:'PvP time left', locked:'Sign in and earn 100 credits to unlock a five-minute PvP pass.', graph:'Explore in Desmos ↗', hint:'Try the example yourself before answering.', noCash:'Learning credits only. No purchases.', secure:'Credits sync with your Google account.', busy:'Checking your answer…', reconnect:'Reconnect your account' },
  uz: { credits:'kredit', signIn:'Google orqali kirish', signOut:'Hisobdan chiqish', earn:'Kredit yig‘ish', wallet:'Kreditlarim', title:'O‘RGAN. YIG‘. BELLASH.', banner:'O‘nta kichik yutuq. Bitta katta duel.', explain:'Har bir daqiqalik dars uchun 10 kredit ol. 100 kredit yig‘ib, ularni Minecraft uslubidagi besh daqiqalik PvP o‘yiniga sarfla.', estimate:'Taxminan 10 daqiqa mashq. Ishlatilmagan kreditlar hisobingda saqlanadi.', balance:'Mavjud kreditlar', total:'Yig‘ilgan kreditlar', pass:'PvP ruxsatnomasi', account:'O‘quv hisobing', loginNote:'Maktab kompyuterida o‘z Google hisobing bilan kir. Oddiy Gmail ham bo‘ladi. Ketishdan oldin hisobdan chiqishni unutma.', setup:'Google orqali kirish sozlanmoqda. Mavjud darslardan foydalanish mumkin.', loading:'Hisob ulanmoqda…', developer:'DASTURCHI', unlimited:'Cheksiz kredit va barcha imkoniyatlar', redeem:'100 kredit → 5 daqiqa PvP', continue:'PvP o‘yinini davom ettirish', start:'Darsni boshlash', need:'PvP uchun yana {n} kredit yig‘.', ready:'PvP mukofoting tayyor.', lesson:'KREDIT UCHUN DARS', round:'Dars', minute:'O‘qi, sinab ko‘r va javob ber. 10 kredit olish uchun shu sahifada bir daqiqa mashq qil.', pause:'Mashq vaqti to‘xtadi. Davom etish uchun shu sahifaga qayt.', wait:'Javobni tekshirishdan oldin yana {n} soniya mashq qil.', answer:'Javobing', check:'Tekshirish va 10 kredit olish', success:'+10 kredit olindi. Uddalading!', retry:'Javob qabul qilinmadi. Darsni o‘qib, yana urinib ko‘r. Kreditlar kamaymadi.', changed:'Bu dars boshqa sahifada o‘zgardi. Yangi darsni boshlang.', next:'Keyingi dars →', finish:'Kreditlarni sarflash →', error:'Ulanib bo‘lmadi. Internetni tekshirib, yana urinib ko‘r.', expired:'PvP vaqti tugadi. Keyingi o‘yin uchun yana dars bajar.', back:'Darslarga qaytish', time:'Qolgan PvP vaqti', locked:'Google hisobing bilan kir. Besh daqiqalik PvP uchun 100 kredit yig‘.', graph:'Desmosda tekshirish ↗', hint:'Javob berishdan oldin misolni o‘zing ishlab ko‘r.', noCash:'Faqat dars uchun kreditlar. Pul to‘lash shart emas.', secure:'Kreditlar Google hisobingda saqlanadi.', busy:'Javob tekshirilmoqda…', reconnect:'Hisobni qayta ulash' },
  ru: { credits:'кредитов', signIn:'Войти через Google', signOut:'Выйти', earn:'Заработать кредиты', wallet:'Мои кредиты', title:'УЧИСЬ. КОПИ. СРАЖАЙСЯ.', banner:'Десять маленьких побед. Одна большая дуэль.', explain:'Получай 10 кредитов за минутный учебный раунд. Собери 100 и обменяй их на пять минут PvP в стиле Minecraft.', estimate:'Примерно 10 минут практики. Неиспользованные кредиты остаются на счёте.', balance:'Доступные кредиты', total:'Заработано кредитов', pass:'Пропуск в PvP', account:'Твой учебный аккаунт', loginNote:'Входи со своим Google-аккаунтом на школьном ПК. Обычный Gmail тоже подходит. Не забудь выйти перед уходом.', setup:'Вход через Google настраивается. Обычные уроки остаются доступны.', loading:'Подключаем аккаунт…', developer:'РАЗРАБОТЧИК', unlimited:'Безлимитные кредиты и полный доступ', redeem:'100 кредитов → 5 мин PvP', continue:'Продолжить PvP', start:'Начать учебный раунд', need:'Заработай ещё {n} кредитов для PvP.', ready:'Твоя PvP-награда готова.', lesson:'УЧЕБНЫЙ РАУНД', round:'Раунд', minute:'Прочитай, попробуй и ответь. Занимайся на этой вкладке одну минуту, чтобы получить 10 кредитов.', pause:'Таймер остановлен. Вернись на эту вкладку, чтобы продолжить.', wait:'Потренируйся ещё {n} секунд перед проверкой.', answer:'Твой ответ', check:'Проверить и получить 10 кредитов', success:'+10 кредитов. Отличная работа.', retry:'Ответ не принят. Прочитай урок и попробуй снова. Кредиты не списаны.', changed:'Раунд изменился в другой вкладке. Начни новый раунд.', next:'Следующий раунд →', finish:'Потратить кредиты →', error:'Не удалось подключиться. Проверь интернет и повтори.', expired:'Время PvP закончилось. Учись, чтобы заработать следующий пропуск.', back:'Вернуться к учёбе', time:'Осталось времени PvP', locked:'Войди через Google и заработай 100 кредитов для пяти минут PvP.', graph:'Проверить в Desmos ↗', hint:'Реши пример самостоятельно перед ответом.', noCash:'Кредиты только за учёбу. Покупок нет.', secure:'Кредиты синхронизируются с Google-аккаунтом.', busy:'Проверяем ответ…', reconnect:'Переподключить аккаунт' }
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const time = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,'0')}`;
const googleIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285f4" d="M22 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.6c-.2 1.2-1 2.3-2 3v2.6h3.4c2-1.9 3-4.5 3-7.5Z"/><path fill="#34a853" d="M12 22c2.8 0 5.2-.9 7-2.4l-3.4-2.6c-.9.6-2.1.9-3.6.9-2.7 0-5-1.8-5.9-4.2H2.6v2.7A10 10 0 0 0 12 22Z"/><path fill="#fbbc05" d="M6.1 13.7a6 6 0 0 1 0-3.4V7.6H2.6a10 10 0 0 0 0 8.8Z"/><path fill="#ea4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.4l2.9-2.9A10 10 0 0 0 2.6 7.6l3.5 2.7C7 7.9 9.3 6.1 12 6.1Z"/></svg>';
export function installCredits({ show, getLanguage, registerCleanup }) {
  const text = key => creditCopy[getLanguage()]?.[key] || creditCopy.en[key];
  let view = '', cancelPractice = () => {}, signing = false;
  const showView = (next, html) => { cancelPractice(); cancelPractice = () => {}; view = next; show('progress', html); registerCleanup(() => { cancelPractice(); view = ''; }); };
  const status = (message, type = '') => { const el = document.querySelector('#credit-status'); if (el) { el.textContent = message; el.className = 'credit-status ' + type; } };
  function loginButton() { return `<button class="google-signin" id="credit-signin" ${!identity.configured ? 'disabled' : ''}>${googleIcon}${text('signIn')}</button>`; }
  function bindSignIn() {
    const button = document.querySelector('#credit-signin');
    if (button) button.onclick = async () => { if (signing) return; signing = true; button.disabled = true; status(text('loading')); try { await identity.signIn(); } catch (e) { if (!['auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(e.code)) status(text('error'), 'error'); } finally { signing = false; if (button.isConnected) button.disabled = false; } };
    const out = document.querySelector('#credit-signout'); if (out) out.onclick = () => identity.signOut().catch(() => status(text('error'),'error'));
  }
  function wallet() {
    const { user, account, loading, error } = identity.accountState();
    if (loading) { showView('wallet', `<h2 id="modal-title">${text('account')}</h2><p class="credit-loading">${text('loading')}</p>`); return; }
    if (!user || !account) {
      showView('wallet', `<h2 id="modal-title">${text('account')}</h2><p class="credit-copy">${text('loginNote')}</p><div class="game-buttons">${loginButton()}</div><p class="credit-status" id="credit-status" role="status">${!identity.configured ? text('setup') : error ? text('error') : ''}</p>${user ? `<button id="credit-signout">${text('signOut')}</button>` : ''}`); bindSignIn(); return;
    }
    const developer = account.role === 'developer', seconds = identity.remaining();
    showView('wallet', `<h2 id="modal-title">${text('wallet')}</h2>${developer ? `<span class="developer-pill">${text('developer')}</span><p>${text('unlimited')}</p>` : ''}<div class="credit-wallet"><div><strong>${developer ? '∞' : account.credits}</strong><small>${text('balance')}</small></div><div><strong>${account.earned}</strong><small>${text('total')}</small></div></div><div class="credit-meter"><i style="width:${developer ? 100 : Math.min(100,account.credits)}%"></i></div><p class="credit-copy">${developer || account.credits >= 100 || seconds > 0 ? text('ready') : text('need').replace('{n}',100-account.credits)}</p><p class="credit-session">${seconds > 0 ? text('time') + ': ' + (developer ? '∞' : time(seconds)) : text('estimate')}</p><div class="game-buttons"><button class="credit-primary" id="credit-earn">${text('earn')} →</button><button class="credit-secondary" id="credit-redeem" ${canRedeem(account,identity.serverNow()) ? '' : 'disabled'}>${seconds > 0 ? text('continue') : text('redeem')}</button></div><p class="credit-status" id="credit-status" role="status"></p><p class="credit-copy">${text('secure')} ${text('noCash')}</p><div class="credit-account"><span>${escape(user.displayName || user.email)}</span><button id="credit-signout">${text('signOut')}</button></div>`);
    document.querySelector('#credit-earn').onclick = practice;
    document.querySelector('#credit-redeem').onclick = async () => {
      const button = document.querySelector('#credit-redeem'); button.disabled = true;
      try { await identity.syncClock(); await identity.redeemPass(); location.assign('arena/?lang=' + getLanguage()); }
      catch { status(text('error'),'error'); button.disabled = false; }
    }; bindSignIn();
  }
  async function practice(subject) {
    if(typeof subject !== 'string')subject=undefined;
    if (!identity.accountState().account) return wallet();
    showView('practice', `<h2 id="modal-title">${text('lesson')}</h2><p>${text('loading')}</p><p id="credit-status" class="credit-status" role="status"></p>`);
    let abandoned = false; cancelPractice = () => { abandoned = true; };
    try {
      const round = await identity.startPractice(subject); if (abandoned) return;
      const language = getLanguage(), local = value => escape(value?.[language] || value?.en || '');
      showView('practice', `<h2 id="modal-title">${local(round.title)}</h2><div class="practice-top"><span>${text('round')} ${round.cursor + 1} · +10 ${text('credits')}</span><span class="practice-timer" id="practice-time">1:00</span></div><p class="credit-copy">${text('minute')}</p><div class="practice-card">${local(round.lesson)}</div>${round.code ? `<pre class="practice-code"><code>${escape(round.code)}</code></pre>` : ''}<p class="credit-progress-note">${text('hint')}</p>${round.graph ? `<a class="text-button" href="https://www.desmos.com/calculator?lang=${language === 'ru' ? 'ru' : 'en'}" target="_blank" rel="noopener">${text('graph')}</a>` : ''}<h3 class="practice-question">${local(round.prompt)}</h3><form class="practice-form" id="credit-answer-form">${round.options ? `<div class="practice-options">${round.options.map(o => `<label><input type="radio" name="credit-answer" value="${escape(o.value)}" required><span>${local(o.label)}</span></label>`).join('')}</div>` : `<input type="text" name="credit-answer" aria-label="${text('answer')}" maxlength="100" autocomplete="off" required ${round.input === 'number' ? 'inputmode="numeric"' : ''}>`}<button class="credit-primary" id="credit-check" disabled>${text('check')}</button></form><p class="credit-status" id="credit-status" role="status"></p>`);
      abandoned = false;
      let elapsed = 0, previous = performance.now(), busy = false, finished = false, lastSeconds = POLICY.roundSeconds;
      const timer = setInterval(() => {
        const now = performance.now(), active = !document.hidden && document.hasFocus(); elapsed = advancePractice(elapsed, now-previous, active); previous = now;
        const seconds = Math.ceil((POLICY.roundSeconds*1000-elapsed)/1000); document.querySelector('#practice-time').textContent = time(seconds);
        document.querySelector('#credit-check').disabled = seconds > 0 || busy || finished;
        if (!busy && !finished) {
          if (!active) status(text('pause'));
          else if (seconds > 0) status(text('wait').replace('{n}',seconds));
          else if (lastSeconds > 0) status('');
        }
        lastSeconds = seconds;
      }, 250);
      cancelPractice = () => { abandoned = true; clearInterval(timer); };
      document.querySelector('#credit-answer-form').onsubmit = async e => {
        e.preventDefault(); if (busy || finished || elapsed < POLICY.roundSeconds*1000) return;
        busy = true; document.querySelector('#credit-check').disabled = true; status(text('busy'));
        let answer = new FormData(e.currentTarget).get('credit-answer')?.trim() || '';
        if (round.input === 'formula' || round.input === 'shortcut') answer = answer.replace(/\s/g,'').toUpperCase();
        if (round.input === 'number' && answer !== '' && Number.isFinite(Number(answer))) answer = String(Number(answer));
        try {
          const balance = await identity.finishPractice(round,answer); if (abandoned) return;
          finished = true; clearInterval(timer); status(text('success'),'success');
          e.target.querySelectorAll('input').forEach(input => input.disabled = true);
          const button = document.querySelector('#credit-check'); button.disabled = false; button.type = 'button'; button.textContent = balance >= 100 ? text('finish') : text('next'); button.onclick = balance >= 100 ? wallet : () => practice(subject);
        } catch (err) { if (!abandoned) status(text(err.message === 'round-changed' ? 'changed' : err.code === 'permission-denied' ? 'retry' : 'error'),'error'); }
        finally { busy = false; }
      };
    } catch { if (!abandoned) status(text('error'),'error'); }
  }
  const header = document.querySelector('.header-right');
  const button = document.createElement('button'); button.id = 'wallet-button'; button.className = 'wallet-button'; header?.prepend(button); button.onclick = wallet;
  const banner = document.createElement('section'); banner.className = 'credit-banner'; banner.setAttribute('aria-label',text('credits')); document.querySelector('#worlds')?.before(banner);
  function render() {
    const { account } = identity.accountState();
    button.innerHTML = `<span aria-hidden="true">✦</span><b>${account?.role === 'developer' ? '∞' : account?.credits || 0}</b><span class="wallet-label">${text('credits')}</span>`; button.setAttribute('aria-label',text('wallet'));
    banner.innerHTML = `<div><span class="credit-eyebrow">${text('title')}</span><h2>${text('banner')}</h2><p>${text('explain')}</p><p>${text('estimate')}</p></div><div class="credit-actions"><button class="credit-primary" id="banner-earn">${text('earn')} ↗</button><button class="credit-secondary" id="banner-wallet">${text('wallet')}</button></div>`;
    banner.querySelector('#banner-earn').onclick = practice; banner.querySelector('#banner-wallet').onclick = wallet;
    if (view === 'wallet' && document.querySelector('#modal')?.open) wallet();
  }
  const controller = { enabled: identity.configured, openArena: wallet, openEarn: practice, render, isDeveloper: () => identity.accountState().account?.role === 'developer', lessonOffer: () => `<div class="credit-lesson-offer"><p>${text('explain')}</p><button id="lesson-credits" class="credit-primary">${text('earn')} →</button></div>` };
  window.levelupCredits = controller; identity.subscribe(render); identity.initializeAccount().catch(() => {});
  if (new URLSearchParams(location.search).has('credits')) wallet();
  return controller;
}
