// Server-owned lesson bank. Only question content is returned to students.
// Open-source examples are educational material, not authentication secrets.
const languages = ['en', 'uz', 'ru'];
const texts = (en, uz, ru) => ({ en, uz, ru });
export const questionBank = [];
function add(subject, title, lesson, prompt, answer, extra = {}) {
  const index = questionBank.length;
  questionBank.push({ id: 'q' + index, index, answer, question: { subject, title, lesson, prompt, ...extra } });
}
for (let n = 0; n < 8; n++) {
  if (n === 3 || n === 7) {
    const explorer = n === 3;
    add('coding', texts('Windows shortcuts', 'Windows tugmalari', 'Сочетания Windows'),
      texts('A shortcut combines keys to perform an action. Windows + E opens File Explorer. Windows + L locks your computer. Lock a shared school PC before leaving it.', 'Tugmalar birikmasi amalni tez bajaradi. Windows + E fayl boshqaruvchisini ochadi. Windows + L kompyuterni qulflaydi. Umumiy kompyuterdan ketayotganda uni qulflashni unutma.', 'Сочетание клавиш быстро выполняет действие. Windows + E открывает Проводник. Windows + L блокирует компьютер. Уходя от общего компьютера, блокируй его.'),
      explorer ? texts('Which shortcut opens File Explorer?', 'Fayl boshqaruvchisini qaysi birikma ochadi?', 'Как открыть Проводник?') : texts('Which shortcut locks your PC?', 'Kompyuterni qaysi birikma qulflaydi?', 'Как заблокировать компьютер?'), explorer ? 'explorer' : 'lock',
      { options: [{ value: 'explorer', label: texts('Windows + E', 'Windows + E', 'Windows + E') }, { value: 'lock', label: texts('Windows + L', 'Windows + L', 'Windows + L') }, { value: 'print', label: texts('Ctrl + P', 'Ctrl + P', 'Ctrl + P') }] });
  } else {
    const a = n + 6, b = n + 4, multiply = n % 2 === 1;
    const code = n % 3 === 0 ? `score = ${a}\nbonus = ${b}\nprint(score ${multiply ? '*' : '+'} bonus)` : n % 3 === 1 ? `int gems = ${a};\nstd::cout << gems ${multiply ? '*' : '+'} ${b};` : `int energy = ${a};\nConsole.WriteLine(energy ${multiply ? '*' : '+'} ${b});`;
    add('coding', texts('Read a little code', 'Kichik kodni tushun', 'Прочитай немного кода'),
      texts('A variable stores a value. + adds values; * multiplies them. print, std::cout, and Console.WriteLine show the result in Python, C++, and C#. Work through the expression before running it.', 'O‘zgaruvchi qiymatni saqlaydi. + qo‘shadi, * ko‘paytiradi. Python, C++ va C# da print, std::cout va Console.WriteLine natijani ko‘rsatadi. Kodni ishga tushirishdan oldin hisoblab ko‘r.', 'Переменная хранит значение. + складывает, * умножает. print, std::cout и Console.WriteLine выводят результат в Python, C++ и C#. Сначала вычисли выражение самостоятельно.'),
      texts('What does this code print?', 'Bu kod qanday natija chiqaradi?', 'Что выведет этот код?'), String(multiply ? a * b : a + b), { code, input: 'number' });
  }
  if (n % 3 === 0) {
    const end = n % 2 === 0 ? 'A3' : 'B4', start = end === 'A3' ? 'A1' : 'B1';
    add('office', texts('Excel: add a range', 'Excel: oraliqni qo‘shish', 'Excel: сумма диапазона'),
      texts('A formula starts with =. SUM adds a range. A colon means “through”: A1:A3 includes A1, A2, and A3. Try naming a range on paper, then write its SUM formula.', 'Formula = belgisi bilan boshlanadi. SUM oraliqdagi sonlarni qo‘shadi. A1:A3 yozuvi A1, A2 va A3 ni bildiradi. Oraliqni tasavvur qilib, SUM formulasini yoz.', 'Формула начинается с =. SUM складывает диапазон. Двоеточие означает «до»: A1:A3 включает A1, A2 и A3. Назови ячейки диапазона, затем запиши формулу SUM.'),
      texts(`Write a SUM formula for ${start} through ${end}.`, `${start} dan ${end} gacha bo‘lgan oraliq uchun SUM formulasini yoz.`, `Запиши формулу SUM для диапазона от ${start} до ${end}.`), `=SUM(${start}:${end})`, { input: 'formula' });
  } else {
    const word = n % 3 === 1;
    add('office', word ? texts('Word: structure a document', 'Word: hujjatni tartiblash', 'Word: структура документа') : texts('PowerPoint: entrance effects', 'PowerPoint: kirish effektlari', 'PowerPoint: эффекты входа'),
      word ? texts('Heading styles describe document structure. Heading 1 is for a main section heading; normal text is for paragraphs. Styles help readers and screen readers navigate your work.', 'Sarlavha uslublari hujjat tuzilishini belgilaydi. Heading 1 asosiy bo‘lim sarlavhasi uchun, oddiy matn esa abzatslar uchun. Uslublar hujjatni o‘qish va unda yurishni osonlashtiradi.', 'Стили заголовков задают структуру документа. Заголовок 1 подходит для основного раздела, обычный текст — для абзацев. Стили помогают читателям ориентироваться.') : texts('An entrance animation makes an object appear. Fly In brings it onto the slide. Disappear and Fade Out are exit effects. A short entrance can draw attention without distracting from your message.', 'Kirish animatsiyasi obyektni ko‘rsatadi. Fly In uni slaydga olib kiradi. Disappear va Fade Out esa chiqish effektlari. Qisqa kirish effekti asosiy fikrga e’tibor qaratadi.', 'Анимация входа показывает объект. Fly In выводит его на слайд. Disappear и Fade Out — эффекты выхода. Короткий эффект входа помогает выделить главную мысль.'),
      word ? texts('Choose the style for a main section heading.', 'Asosiy bo‘lim sarlavhasi uchun uslubni tanla.', 'Выбери стиль для заголовка основного раздела.') : texts('Which effect brings an object onto the slide?', 'Qaysi effekt obyektni slaydga olib kiradi?', 'Какой эффект выводит объект на слайд?'), word ? 'heading' : 'fly',
      { options: word ? [{ value: 'normal', label: texts('Normal text', 'Oddiy matn', 'Обычный текст') }, { value: 'heading', label: texts('Heading 1', 'Sarlavha 1', 'Заголовок 1') }, { value: 'caption', label: texts('Caption', 'Izoh', 'Подпись') }] : [{ value: 'fly', label: texts('Fly In', 'Fly In — uchib kirish', 'Fly In — появление') }, { value: 'disappear', label: texts('Disappear', 'Yo‘qolish', 'Исчезновение') }, { value: 'fade', label: texts('Fade Out', 'So‘nib chiqish', 'Затухание') }] });
  }
  const x = n + 2, a = n % 3 + 2, b = n + 1, quadratic = n % 2 === 1;
  add('math', texts('Functions: find a point', 'Funksiya: nuqtani topish', 'Функции: найди точку'),
    texts('To find y, replace x with the given number. For y = 2x + 3 and x = 2, y = 2 × 2 + 3 = 7. In x², multiply x by itself. Explore your equation in Desmos, then calculate your own point.', 'y ni topish uchun x o‘rniga berilgan sonni qo‘y. y = 2x + 3 va x = 2 bo‘lsa, y = 2 × 2 + 3 = 7. x² da x ni o‘ziga ko‘paytir. Tenglamani Desmosda tekshirib, nuqtani o‘zing hisobla.', 'Чтобы найти y, подставь число вместо x. При y = 2x + 3 и x = 2 получим y = 2 × 2 + 3 = 7. x² означает x, умноженный на себя. Исследуй уравнение в Desmos и вычисли свою точку.'),
    texts(`For y = ${quadratic ? `x² − ${b}` : `${a}x + ${b}`}, find y when x = ${x}.`, `y = ${quadratic ? `x² − ${b}` : `${a}x + ${b}`} bo‘lsa, x = ${x} da y ni top.`, `Для y = ${quadratic ? `x² − ${b}` : `${a}x + ${b}`} найди y при x = ${x}.`), String(quadratic ? x * x - b : a * x + b), { input: 'number', graph: true });
  const commands = ['save', 'copy', 'undo', 'paste', 'save', 'copy', 'undo', 'paste'], command = commands[n];
  add('typing', texts('Keyboard fluency', 'Klaviaturadan ravon foydalanish', 'Уверенная работа с клавиатурой'),
    texts('Accuracy comes before speed. Sit comfortably, keep your wrists relaxed, and look at the task rather than rushing. Ctrl + S saves; Ctrl + C copies; Ctrl + Z undoes; Ctrl + V pastes. Practise finding those keys without looking.', 'Avval aniqlik, keyin tezlik. Qulay o‘tir, bilaklaringni bo‘sh tut, shoshilma. Ctrl + S saqlaydi, Ctrl + C nusxalaydi, Ctrl + Z oxirgi amalni bekor qiladi, Ctrl + V joylashtiradi. Tugmalarni qaramasdan topishga urin.', 'Сначала точность, потом скорость. Сядь удобно, расслабь запястья, не спеши. Ctrl + S сохраняет, Ctrl + C копирует, Ctrl + Z отменяет, Ctrl + V вставляет. Попробуй находить эти клавиши, не глядя.'),
    texts(`Type the shortcut to ${command}. Example format: Ctrl + S`, `${({ save: 'saqlash', copy: 'nusxalash', undo: 'bekor qilish', paste: 'joylashtirish' })[command]} uchun tugmalar birikmasini yoz. Namuna: Ctrl + S`, `Напечатай сочетание для действия «${({ save: 'сохранить', copy: 'копировать', undo: 'отменить', paste: 'вставить' })[command]}». Формат: Ctrl + S`), ({ save: 'CTRL+S', copy: 'CTRL+C', undo: 'CTRL+Z', paste: 'CTRL+V' })[command], { input: 'shortcut' });
}
if (questionBank.length !== 32 || questionBank.some(q => languages.some(l => !q.question.title[l] || !q.question.lesson[l] || !q.question.prompt[l]))) throw new Error('Incomplete question bank');
