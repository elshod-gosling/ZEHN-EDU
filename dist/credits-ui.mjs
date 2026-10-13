import * as identity from './supabase-account.mjs?v=zehn-rooms-1';
import { POLICY, advancePractice, canRedeem } from './credit-policy.mjs';
export const creditCopy = {
  en: { credits:'credits', signIn:'Continue with Google', signOut:'Sign out', earn:'Earn credits', wallet:'My credits', title:'LEARN. EARN. DUEL.', banner:'Ten little wins. One big duel.', explain:'Earn 10 credits per one-minute learning round. Collect 100, then spend them on five minutes of Minecraft-style PvP.', estimate:'About 10 minutes of practice. Your unused credits stay in your account.', balance:'Available credits', total:'Credits earned', pass:'PvP pass', account:'Your learning account', loginNote:'Use your own Google account on this school PC. Regular Gmail accounts work too. Remember to sign out when you leave.', setup:'Google sign-in is being set up. Your existing lessons are still available.', loading:'Connecting your account…', developer:'DEVELOPER', unlimited:'Unlimited credits and access', redeem:'Use 100 credits → 5 min PvP', continue:'Continue PvP', start:'Start a learning round', need:'Earn {n} more credits to enter PvP.', ready:'Your PvP reward is ready.', lesson:'LEARNING ROUND', round:'Round', minute:'Read, try, then answer. Stay on this tab for one minute to earn 10 credits.', pause:'Practice timer paused. Return to this tab to continue.', wait:'Practise for {n} more seconds before checking.', answer:'Your answer', check:'Check & earn 10 credits', success:'+10 credits earned. Nice work.', retry:'That answer was not accepted. Review the lesson and try again. No credits were lost.', changed:'This round changed in another tab. Start a new round.', next:'Next learning round →', finish:'Spend your credits →', error:'Could not connect. Check your internet and try again.', expired:'Your PvP pass has ended. Learn another round to earn the next one.', back:'Back to learning', time:'PvP time left', locked:'Sign in and earn 100 credits to unlock a five-minute PvP pass.', graph:'Explore in Desmos ↗', hint:'Try the example yourself before answering.', noCash:'Learning credits only. No purchases.', secure:'Credits sync with your Google account.', busy:'Checking your answer…', reconnect:'Reconnect your account' },
  uz: { credits:'kredit', signIn:'Google orqali kirish', signOut:'Hisobdan chiqish', earn:'Kredit yig‘ish', wallet:'Kreditlarim', title:'O‘RGAN. YIG‘. BELLASH.', banner:'O‘nta kichik yutuq. Bitta katta duel.', explain:'Har bir daqiqalik dars uchun 10 kredit ol. 100 kredit yig‘ib, ularni Minecraft uslubidagi besh daqiqalik PvP o‘yiniga sarfla.', estimate:'Taxminan 10 daqiqa mashq. Ishlatilmagan kreditlar hisobingda saqlanadi.', balance:'Mavjud kreditlar', total:'Yig‘ilgan kreditlar', pass:'PvP ruxsatnomasi', account:'O‘quv hisobing', loginNote:'Maktab kompyuterida o‘z Google hisobing bilan kir. Oddiy Gmail ham bo‘ladi. Ketishdan oldin hisobdan chiqishni unutma.', setup:'Google orqali kirish sozlanmoqda. Mavjud darslardan foydalanish mumkin.', loading:'Hisob ulanmoqda…', developer:'DASTURCHI', unlimited:'Cheksiz kredit va barcha imkoniyatlar', redeem:'100 kredit → 5 daqiqa PvP', continue:'PvP o‘yinini davom ettirish', start:'Darsni boshlash', need:'PvP uchun yana {n} kredit yig‘.', ready:'PvP mukofoting tayyor.', lesson:'KREDIT UCHUN DARS', round:'Dars', minute:'O‘qi, sinab ko‘r va javob ber. 10 kredit olish uchun shu sahifada bir daqiqa mashq qil.', pause:'Mashq vaqti to‘xtadi. Davom etish uchun shu sahifaga qayt.', wait:'Javobni tekshirishdan oldin yana {n} soniya mashq qil.', answer:'Javobing', check:'Tekshirish va 10 kredit olish', success:'+10 kredit olindi. Uddalading!', retry:'Javob qabul qilinmadi. Darsni o‘qib, yana urinib ko‘r. Kreditlar kamaymadi.', changed:'Bu dars boshqa sahifada o‘zgardi. Yangi darsni boshlang.', next:'Keyingi dars →', finish:'Kreditlarni sarflash →', error:'Ulanib bo‘lmadi. Internetni tekshirib, yana urinib ko‘r.', expired:'PvP vaqti tugadi. Keyingi o‘yin uchun yana dars bajar.', back:'Darslarga qaytish', time:'Qolgan PvP vaqti', locked:'Google hisobing bilan kir. Besh daqiqalik PvP uchun 100 kredit yig‘.', graph:'Desmosda tekshirish ↗', hint:'Javob berishdan oldin misolni o‘zing ishlab ko‘r.', noCash:'Faqat dars uchun kreditlar. Pul to‘lash shart emas.', secure:'Kreditlar Google hisobingda saqlanadi.', busy:'Javob tekshirilmoqda…', reconnect:'Hisobni qayta ulash' },
  ru: { credits:'кредитов', signIn:'Войти через Google', signOut:'Выйти', earn:'Заработать кредиты', wallet:'Мои кредиты', title:'УЧИСЬ. КОПИ. СРАЖАЙСЯ.', banner:'Десять маленьких побед. Одна большая дуэль.', explain:'Получай 10 кредитов за минутный учебный раунд. Собери 100 и обменяй их на пять минут PvP в стиле Minecraft.', estimate:'Примерно 10 минут практики. Неиспользованные кредиты остаются на счёте.', balance:'Доступные кредиты', total:'Заработано кредитов', pass:'Пропуск в PvP', account:'Твой учебный аккаунт', loginNote:'Входи со своим Google-аккаунтом на школьном ПК. Обычный Gmail тоже подходит. Не забудь выйти перед уходом.', setup:'Вход через Google настраивается. Обычные уроки остаются доступны.', loading:'Подключаем аккаунт…', developer:'РАЗРАБОТЧИК', unlimited:'Безлимитные кредиты и полный доступ', redeem:'100 кредитов → 5 мин PvP', continue:'Продолжить PvP', start:'Начать учебный раунд', need:'Заработай ещё {n} кредитов для PvP.', ready:'Твоя PvP-награда готова.', lesson:'УЧЕБНЫЙ РАУНД', round:'Раунд', minute:'Прочитай, попробуй и ответь. Занимайся на этой вкладке одну минуту, чтобы получить 10 кредитов.', pause:'Таймер остановлен. Вернись на эту вкладку, чтобы продолжить.', wait:'Потренируйся ещё {n} секунд перед проверкой.', answer:'Твой ответ', check:'Проверить и получить 10 кредитов', success:'+10 кредитов. Отличная работа.', retry:'Ответ не принят. Прочитай урок и попробуй снова. Кредиты не списаны.', changed:'Раунд изменился в другой вкладке. Начни новый раунд.', next:'Следующий раунд →', finish:'Потратить кредиты →', error:'Не удалось подключиться. Проверь интернет и повтори.', expired:'Время PvP закончилось. Учись, чтобы заработать следующий пропуск.', back:'Вернуться к учёбе', time:'Осталось времени PvP', locked:'Войди через Google и заработай 100 кредитов для пяти минут PvP.', graph:'Проверить в Desmos ↗', hint:'Реши пример самостоятельно перед ответом.', noCash:'Кредиты только за учёбу. Покупок нет.', secure:'Кредиты синхронизируются с Google-аккаунтом.', busy:'Проверяем ответ…', reconnect:'Переподключить аккаунт' }
};
for (const [language, words] of Object.entries({
  en: { create:'Create account', login:'Sign in', name:'Your name', email:'Email address', password:'Password', confirm:'Confirm password', passwordHint:'At least 8 characters', hasAccount:'Already have an account?', newAccount:'New here?', forgot:'Forgot password?', reset:'Send reset link', resetNote:'Enter your account email. We’ll send a link to choose a new password.', resetSent:'If this email has an account, a reset link is on its way. Check your inbox and spam folder.', mismatch:'Passwords do not match.', invalidEmail:'Enter a valid email address.', weakPassword:'Use a stronger password with at least 8 characters.', emailUsed:'This email already has an account. Sign in or reset your password. ', credentials:'Email or password is incorrect. Try again or reset your password.', tooMany:'Too many attempts. Wait a moment and try again.', unavailable:'Account registration is temporarily unavailable. Please try again later.', network:'Check your internet connection and try again.', or:'or', loginNote:'Create an account with any email address — school email, Gmail, Outlook, Yahoo, or another provider. You’ll stay signed in on this browser until you sign out. Sign out before leaving a shared PC.', setup:'Accounts are being set up. Your existing lessons are still available.', secure:'Credits sync with your learning account.', locked:'Create an account or sign in, then earn 100 credits for five minutes of PvP.' },
  uz: { create:'Hisob yaratish', login:'Kirish', name:'Isming', email:'Email manzili', password:'Parol', confirm:'Parolni takrorla', passwordHint:'Kamida 8 ta belgi', hasAccount:'Hisobing bormi?', newAccount:'Yangi foydalanuvchimisan?', forgot:'Parolni unutdingmi?', reset:'Tiklash havolasini yuborish', resetNote:'Hisobing emailini yoz. Yangi parol tanlash uchun havola yuboramiz.', resetSent:'Bu emailda hisob bo‘lsa, tiklash havolasi yuboriladi. Kiruvchi xatlar va spamni tekshir.', mismatch:'Parollar bir xil emas.', invalidEmail:'To‘g‘ri email manzilini yoz.', weakPassword:'Kamida 8 belgili kuchliroq parol tanla.', emailUsed:'Bu emailda hisob bor. Kir yoki parolni tikla. ', credentials:'Email yoki parol noto‘g‘ri. Qayta urin yoki parolni tikla.', tooMany:'Urinishlar juda ko‘p. Biroz kutib, qayta urin.', unavailable:'Hisob yaratish vaqtincha ishlamayapti. Keyinroq qayta urin.', network:'Internetni tekshir va qayta urin.', or:'yoki', loginNote:'Istalgan email bilan hisob yarat: maktab emaili, Gmail, Outlook, Yahoo yoki boshqa xizmat. Hisobdan chiqmaguningcha bu brauzerda kirgan holatda qolasan. Umumiy kompyuterdan ketishdan oldin hisobdan chiq.', setup:'Hisoblar sozlanmoqda. Mavjud darslar ochiq.', secure:'Kreditlar o‘quv hisobingda saqlanadi.', locked:'Hisob yarat yoki kir. Besh daqiqalik PvP uchun 100 kredit yig‘.' },
  ru: { create:'Создать аккаунт', login:'Войти', name:'Твоё имя', email:'Электронная почта', password:'Пароль', confirm:'Повтори пароль', passwordHint:'Не менее 8 символов', hasAccount:'Уже есть аккаунт?', newAccount:'Впервые здесь?', forgot:'Забыл пароль?', reset:'Отправить ссылку', resetNote:'Введи почту аккаунта. Мы отправим ссылку для создания нового пароля.', resetSent:'Если аккаунт с этой почтой существует, ссылка отправлена. Проверь входящие и спам.', mismatch:'Пароли не совпадают.', invalidEmail:'Введи корректный адрес почты.', weakPassword:'Выбери более надёжный пароль из 8 или более символов.', emailUsed:'Аккаунт с этой почтой уже есть. Войди или сбрось пароль. ', credentials:'Неверная почта или пароль. Повтори попытку или сбрось пароль.', tooMany:'Слишком много попыток. Подожди и повтори.', unavailable:'Регистрация временно недоступна. Попробуй позже.', network:'Проверь интернет и повтори попытку.', or:'или', loginNote:'Создай аккаунт с любой почтой: школьной, Gmail, Outlook, Yahoo или другой. Вход сохранится в этом браузере, пока ты не выйдешь. Не забудь выйти на общем компьютере.', setup:'Аккаунты настраиваются. Обычные уроки доступны.', secure:'Кредиты сохраняются в твоём учебном аккаунте.', locked:'Создай аккаунт или войди, затем заработай 100 кредитов для пяти минут PvP.' }
})) Object.assign(creditCopy[language], words);
Object.assign(creditCopy.en, { sessionEnded:'Your session ended. Sign in again to continue.', accessDenied:'Account access could not be confirmed. Sign out and sign back in, then retry.' });
Object.assign(creditCopy.uz, { sessionEnded:'Seans tugadi. Davom etish uchun qayta kir.', accessDenied:'Hisob ruxsatini tekshirib bo‘lmadi. Hisobdan chiqib, qayta kir va urin.' });
Object.assign(creditCopy.ru, { sessionEnded:'Сеанс завершён. Войди снова, чтобы продолжить.', accessDenied:'Не удалось подтвердить доступ. Выйди, войди снова и повтори попытку.' });
Object.assign(creditCopy.en,{update:'Set new password',confirmEmail:'Check your inbox to confirm your email, then sign in.',mailSetup:'Email delivery is still being set up. Please try again later.',setup:'Accounts are being connected. Your existing lessons are available.'});
Object.assign(creditCopy.uz,{update:'Yangi parol o‘rnatish',confirmEmail:'Emailni tasdiqlash uchun xatlarni tekshir, so‘ng kir.',mailSetup:'Email yuborish hali sozlanmoqda. Keyinroq qayta urin.',setup:'Hisoblar ulanmoqda. Mavjud darslar ochiq.'});
Object.assign(creditCopy.ru,{update:'Задать новый пароль',confirmEmail:'Подтверди почту по ссылке в письме, затем войди.',mailSetup:'Отправка писем ещё настраивается. Попробуй позже.',setup:'Аккаунты подключаются. Обычные уроки доступны.'});
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const time = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,'0')}`;
export function installCredits({ show, getLanguage, registerCleanup }) {
  const text = key => creditCopy[getLanguage()]?.[key] || creditCopy.en[key];
  let view = '', cancelPractice = () => {}, signing = false, redeeming = false, authMode = 'create';
  const showView = (next, html) => {
    cancelPractice(); cancelPractice = () => {};
    // show() cleans up the previous modal before installing its replacement.
    show('progress', html); view = next;
    registerCleanup(() => { cancelPractice(); view = ''; });
  };
  const status = (message, type = '') => { const el = document.querySelector('#credit-status'); if (el) { el.textContent = message; el.className = 'credit-status ' + type; } };
  function bindSignIn() {
    const out = document.querySelector('#credit-signout'); if (out) out.onclick = () => identity.signOut().catch(() => status(text('error'),'error'));
    const retry = document.querySelector('#credit-retry'); if (retry) retry.onclick = () => identity.reconnect();
  }
  function authForm() {
    const create = authMode === 'create', reset = authMode === 'reset', update = authMode === 'update';
    const field = (key, type, autocomplete, extra = '') => `<label>${text(key)}<input name="${key}" type="${type}" autocomplete="${autocomplete}" required ${extra}></label>`;
    showView('wallet', `<h2 id="modal-title">${text(authMode)}</h2><p class="credit-copy">${text(reset ? 'resetNote' : 'loginNote')}</p><form id="account-form" class="account-form">${create ? field('name','text','nickname','maxlength="60"') : ''}${!update ? field('email','email','email','maxlength="254" autocapitalize="none" spellcheck="false"') : ''}${!reset ? field('password','password',create || update ? 'new-password' : 'current-password',create || update ? 'minlength="8" aria-describedby="password-hint"' : '') : ''}${create || update ? `<small id="password-hint">${text('passwordHint')}</small>${field('confirm','password','new-password','minlength="8"')}` : ''}<button class="credit-primary" type="submit" ${!identity.configured ? 'disabled' : ''}>${text(authMode)}</button></form><p class="credit-status" id="credit-status" role="status">${!identity.configured ? text('setup') : ''}</p><div class="account-switch">${text(create ? 'hasAccount' : 'newAccount')} <button type="button" data-auth-mode="${create ? 'login' : 'create'}">${text(create ? 'login' : 'create')}</button>${!create && !update ? `<button type="button" data-auth-mode="${reset ? 'login' : 'reset'}">${text(reset ? 'login' : 'forgot')}</button>` : ''}</div>`);
    document.querySelectorAll('[data-auth-mode]').forEach(button => button.onclick = () => { if (!signing) { authMode = button.dataset.authMode; authForm(); } });
    const form = document.querySelector('#account-form');
    form.onsubmit = async event => {
      event.preventDefault(); if (signing) return;
      const values = new FormData(form), email = String(values.get('email') || '').trim(), password = String(values.get('password') || '');
      if ((create || update) && password !== values.get('confirm')) { status(text('mismatch'), 'error'); return; }
      signing = true; form.querySelectorAll('button,input').forEach(el => el.disabled = true); status(text('loading'));
      try {
        if (reset) { await identity.resetPassword(email); if (form.isConnected) status(text('resetSent'), 'success'); }
        else if (update) { await identity.updatePassword(password); authMode = 'login'; }
        else if (create) { const result = await identity.createAccount(String(values.get('name') || ''), email, password); if (result.confirmationRequired && form.isConnected) status(text('confirmEmail'),'success'); }
        else await identity.signIn(email, password);
      } catch (error) {
        const key = ({'email_address_invalid':'invalidEmail','email_address_not_authorized':'mailSetup','validation_failed':'invalidEmail','weak_password':'weakPassword','user_already_exists':'emailUsed','email_exists':'emailUsed','invalid_credentials':'credentials','email_not_confirmed':'confirmEmail','over_email_send_rate_limit':'tooMany','over_request_rate_limit':'tooMany','signup_disabled':'unavailable','request_timeout':'network','unexpected_failure':'network'})[error.code] || 'error';
        status(text(key),'error');
      } finally {
        signing = false; form.querySelectorAll('button,input').forEach(el => el.disabled = false);
        if (authMode !== 'reset' && identity.accountState().user && view === 'wallet') wallet();
      }
    };
    bindSignIn();
  }
  function wallet() {
    if (identity.accountState().recovery) { authMode = 'update'; authForm(); return; }
    const { user, account, loading, error } = identity.accountState();
    if (loading) { showView('wallet', `<h2 id="modal-title">${text('account')}</h2><p class="credit-loading">${text('loading')}</p>`); return; }
    if (!user || !account) {
      if (!user) { authForm(); return; }
      showView('wallet', `<h2 id="modal-title">${text('account')}</h2><p class="credit-copy">${text('loginNote')}</p><button id="credit-retry">${text('reconnect')}</button><p class="credit-status" id="credit-status" role="status">${!identity.configured ? text('setup') : error ? text('error') : ''}</p>${user ? `<button id="credit-signout">${text('signOut')}</button>` : ''}`); bindSignIn(); return;
    }
    const developer = account.role === 'developer', seconds = identity.remaining();
    showView('wallet', `<h2 id="modal-title">${text('wallet')}</h2>${developer ? `<span class="developer-pill">${text('developer')}</span><p>${text('unlimited')}</p>` : ''}<div class="credit-wallet"><div><strong>${developer ? '∞' : account.credits}</strong><small>${text('balance')}</small></div><div><strong>${account.earned}</strong><small>${text('total')}</small></div></div><div class="credit-meter"><i style="width:${developer ? 100 : Math.min(100,account.credits)}%"></i></div><p class="credit-copy">${developer || account.credits >= 100 || seconds > 0 ? text('ready') : text('need').replace('{n}',100-account.credits)}</p><p class="credit-session">${seconds > 0 ? text('time') + ': ' + (developer ? '∞' : time(seconds)) : text('estimate')}</p><div class="game-buttons"><button class="credit-primary" id="credit-earn">${text('earn')} →</button><button class="credit-secondary" id="credit-redeem" ${canRedeem(account,identity.serverNow()) ? '' : 'disabled'}>${seconds > 0 ? text('continue') : text('redeem')}</button></div><p class="credit-status" id="credit-status" role="status"></p><p class="credit-copy">${text('secure')} ${text('noCash')}</p><div class="credit-account"><span>${escape(user.displayName || user.email)}</span><button id="credit-signout">${text('signOut')}</button></div>`);
    document.querySelector('#credit-earn').onclick = practice;
    document.querySelector('#credit-redeem').onclick = async () => {
      if (redeeming) return;
      redeeming = true;
      const button = document.querySelector('#credit-redeem'); button.disabled = true; status(text('loading'));
      try { await identity.syncClock(); await identity.redeemPass(); location.assign('arena/?lang=' + getLanguage()); }
      catch (error) {
        console.error('PvP entry failed:', error.code || error.message || 'unknown');
        const key = error.message === 'not-enough-credits' ? 'need' : error.message === 'sign-in-required' ? 'sessionEnded' : error.code === '42501' ? 'accessDenied' : 'error';
        status(text(key).replace('{n}',Math.max(0,100-(identity.accountState().account?.credits || 0))),'error');
        button.disabled = false;
      } finally { redeeming = false; }
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
        } catch (err) { if (!abandoned) status(text(err.message === 'round-changed' ? 'changed' : ['wrong-answer','round-too-early'].includes(err.message) ? 'retry' : 'error'),'error'); }
        finally { busy = false; }
      };
    } catch { if (!abandoned) status(text('error'),'error'); }
  }
  const header = document.querySelector('.header-right');
  const button = document.createElement('button'); button.id = 'wallet-button'; button.className = 'wallet-button'; header?.prepend(button); button.onclick = () => { if (!identity.accountState().user) authMode = 'create'; wallet(); };
  const banner = document.createElement('section'); banner.className = 'credit-banner'; banner.setAttribute('aria-label',text('credits')); document.querySelector('#worlds')?.before(banner);
  function render() {
    const { account, user } = identity.accountState();
    button.innerHTML = user ? `<span aria-hidden="true">✦</span><b>${account?.role === 'developer' ? '∞' : account?.credits || 0}</b><span class="wallet-label">${text('credits')}</span>` : `<span>${text('create')}</span>`; button.setAttribute('aria-label',text(user ? 'wallet' : 'create'));
    banner.innerHTML = `<div><span class="credit-eyebrow">${text('title')}</span><h2>${text('banner')}</h2><p>${text('explain')}</p><p>${text('estimate')}</p></div><div class="credit-actions"><button class="credit-primary" id="banner-earn">${text('earn')} ↗</button><button class="credit-secondary" id="banner-wallet">${text('wallet')}</button></div>`;
    banner.querySelector('#banner-earn').onclick = practice; banner.querySelector('#banner-wallet').onclick = wallet;
    if (view === 'wallet' && document.querySelector('#modal')?.open && !signing && (!redeeming || !user) && (user || !document.querySelector('#account-form'))) wallet();
  }
  const controller = { enabled: identity.configured, openArena: wallet, openEarn: practice, render, isDeveloper: () => identity.accountState().account?.role === 'developer', lessonOffer: () => `<div class="credit-lesson-offer"><p>${text('explain')}</p><button id="lesson-credits" class="credit-primary">${text('earn')} →</button></div>` };
  window.levelupCredits = controller; identity.subscribe(render); identity.initializeAccount().catch(() => {});
  if (new URLSearchParams(location.search).has('credits')) wallet();
  return controller;
}
