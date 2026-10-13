// Original numeric-response practice. Append questions to keep saved IDs stable.
const SATMath = (() => {
  const data = [
    {kind:'evaluate',a:0,b:2,c:3,x:4,answer:11},
    {kind:'evaluate',a:1,b:0,c:-4,x:3,answer:5},
    {kind:'greaterRoot',a:1,b:-5,c:6,answer:3},
    {kind:'positiveRoot',a:1,b:0,c:-49,answer:7},
    {kind:'smallerRoot',a:1,b:-7,c:12,answer:3},
    {kind:'evaluate',a:1,b:3,c:2,x:2,answer:12},
    {kind:'vertexX',a:1,b:-6,c:11,answer:3},
    {kind:'vertexY',a:1,b:-4,c:7,answer:3},
    {kind:'solutionCount',a:1,b:-6,c:9,answer:1},
    {kind:'greaterRoot',a:1,b:-8,c:15,answer:5},
    {kind:'sumRoots',a:1,b:-9,c:20,answer:9},
    {kind:'productRoots',a:1,b:-7,c:12,answer:12},
    {kind:'evaluate',a:1,b:-2,c:3,x:4,answer:11},
    {kind:'greaterRoot',a:1,b:1,c:-12,answer:3},
    {kind:'smallerRoot',a:1,b:-1,c:-6,answer:-2},
    {kind:'vertexY',a:1,b:6,c:12,answer:3},
    {kind:'solutionCount',a:1,b:0,c:4,answer:0},
    {kind:'greaterRoot',a:1,b:-10,c:25,answer:5},
    {kind:'constant',r1:2,r2:5,answer:10},
    {kind:'evaluate',a:2,b:0,c:1,x:3,answer:19},
    {kind:'sumRoots',a:1,b:-6,c:8,answer:6},
    {kind:'positiveRoot',a:1,b:0,c:-81,answer:9},
    {kind:'productRoots',a:1,b:2,c:-15,answer:-15},
    {kind:'solutionCount',a:1,b:-3,c:-10,answer:2},
    {kind:'greaterRoot',a:1,b:-4,c:0,answer:4},
    {kind:'solveLinear',m:3,n:5,rhs:20,answer:5},
    {kind:'evaluate',a:0,b:-2,c:9,x:3,answer:3},
    {kind:'solveLinear',m:4,n:3,rhs:5,answer:.5},
    {kind:'evaluate',a:0,b:3,c:-4,x:5,answer:11},
    {kind:'solveLinear',m:2,n:-7,rhs:3,answer:5},
    {kind:'solveLinear',m:5,n:10,rhs:-5,answer:-3},
    {kind:'evaluate',a:0,b:-3,c:6,x:-2,answer:12}
  ];
  const questions = Object.freeze(data.map((question,index) => Object.freeze({...question,id:`math-sat-${String(index+1).padStart(2,'0')}`})));
  const legacyIds = {'math-linear':questions[0].id,'math-quadratic':questions[1].id};
  function polynomial(a,b,c) {
    const terms = [];
    for (const [value,variable] of [[a,'x²'],[b,'x'],[c,'']]) {
      if (!value) continue;
      const magnitude = Math.abs(value);
      const term = `${variable && magnitude === 1 ? '' : magnitude}${variable}`;
      terms.push(terms.length ? `${value < 0 ? ' − ' : ' + '}${term}` : `${value < 0 ? '−' : ''}${term}`);
    }
    return terms.join('') || '0';
  }
  function equation(q) {
    if (q.kind === 'solveLinear') return `${polynomial(0,q.m,q.n)} = ${q.rhs}`;
    if (q.kind === 'constant') return `(x − ${q.r1})(x − ${q.r2}) = ${polynomial(1,-q.r1-q.r2,0)} + k`;
    const expression = polynomial(q.a,q.b,q.c);
    return ['evaluate','vertexX','vertexY'].includes(q.kind) ? `f(x) = ${expression}` : `${expression} = 0`;
  }
  const prompts = {
    en:{evaluate:'What is f({x})?',greaterRoot:'What is the greater solution for x?',smallerRoot:'What is the smaller solution for x?',positiveRoot:'What is the positive solution for x?',vertexX:'What is the x-coordinate of the vertex of the graph of f?',vertexY:'What is the minimum value of f(x)?',solutionCount:'How many distinct real solutions does this equation have?',sumRoots:'What is the sum of the solutions for x?',productRoots:'What is the product of the solutions for x?',constant:'The equation is true for every x. What is k?',solveLinear:'What is the value of x?'},
    uz:{evaluate:'f({x}) nechaga teng?',greaterRoot:'x ning kattaroq yechimi nechaga teng?',smallerRoot:'x ning kichikroq yechimi nechaga teng?',positiveRoot:'x ning musbat yechimi nechaga teng?',vertexX:'f grafigi uchining x koordinatasi nechaga teng?',vertexY:'f(x) ning eng kichik qiymati nechaga teng?',solutionCount:'Bu tenglamaning nechta turli haqiqiy yechimi bor?',sumRoots:'x yechimlarining yig‘indisi nechaga teng?',productRoots:'x yechimlarining ko‘paytmasi nechaga teng?',constant:'Tenglik har bir x uchun to‘g‘ri. k nechaga teng?',solveLinear:'x ning qiymati nechaga teng?'},
    ru:{evaluate:'Чему равно f({x})?',greaterRoot:'Чему равно большее решение для x?',smallerRoot:'Чему равно меньшее решение для x?',positiveRoot:'Чему равно положительное решение для x?',vertexX:'Чему равна координата x вершины графика f?',vertexY:'Чему равно минимальное значение f(x)?',solutionCount:'Сколько различных действительных решений у этого уравнения?',sumRoots:'Чему равна сумма решений для x?',productRoots:'Чему равно произведение решений для x?',constant:'Равенство верно при любом x. Чему равно k?',solveLinear:'Чему равно x?'}
  };
  const hints = {
    en:{evaluate:'Substitute x = {x}. Calculate the square first, then multiply and add.',linearEvaluate:'Substitute x = {x}. Multiply first, then add the constant.',greaterRoot:'Factor the expression and set each factor equal to 0. Choose the greater value.',smallerRoot:'Factor the expression and set each factor equal to 0. Choose the smaller value.',positiveRoot:'Move the constant to the other side and take the positive square root.',vertexX:'For ax² + bx + c, the vertex is at x = −b/(2a).',vertexY:'Find x = −b/(2a), then substitute that value into f(x).',solutionCount:'Graph the left side in Desmos. Count the places where it touches or crosses the x-axis.',sumRoots:'For ax² + bx + c = 0, the sum of the solutions is −b/a.',productRoots:'For ax² + bx + c = 0, the product of the solutions is c/a.',constant:'Expand the factors. Multiply their constant terms to find k.',solveLinear:'Move the constant to the right side, then divide by the coefficient of x.'},
    uz:{evaluate:'x = {x} ni qo‘y. Avval kvadratni hisobla, keyin ko‘paytir va qo‘sh.',linearEvaluate:'x = {x} ni qo‘y. Avval ko‘paytir, keyin doimiy sonni qo‘sh.',greaterRoot:'Ifodani ko‘paytuvchilarga ajrat va har birini 0 ga tenglashtir. Kattaroq qiymatni tanla.',smallerRoot:'Ifodani ko‘paytuvchilarga ajrat va har birini 0 ga tenglashtir. Kichikroq qiymatni tanla.',positiveRoot:'Doimiy sonni boshqa tomonga o‘tkaz va musbat kvadrat ildizni ol.',vertexX:'ax² + bx + c uchun uchning x koordinatasi −b/(2a) ga teng.',vertexY:'x = −b/(2a) ni top, keyin shu qiymatni f(x) ga qo‘y.',solutionCount:'Chap tomondagi ifodani Desmosda chiz. Grafik x o‘qiga tegadigan yoki uni kesadigan nuqtalarni sana.',sumRoots:'ax² + bx + c = 0 uchun yechimlar yig‘indisi −b/a ga teng.',productRoots:'ax² + bx + c = 0 uchun yechimlar ko‘paytmasi c/a ga teng.',constant:'Ko‘paytuvchilarni yoy. k ni topish uchun ularning doimiy sonlarini ko‘paytir.',solveLinear:'Doimiy sonni o‘ng tomonga o‘tkaz, keyin x koeffitsiyentiga bo‘l.'},
    ru:{evaluate:'Подставь x = {x}. Сначала вычисли квадрат, затем умножь и сложи.',linearEvaluate:'Подставь x = {x}. Сначала умножь, затем прибавь постоянное число.',greaterRoot:'Разложи выражение на множители и приравняй каждый к 0. Выбери большее значение.',smallerRoot:'Разложи выражение на множители и приравняй каждый к 0. Выбери меньшее значение.',positiveRoot:'Перенеси постоянное число на другую сторону и возьми положительный квадратный корень.',vertexX:'Для ax² + bx + c вершина находится при x = −b/(2a).',vertexY:'Найди x = −b/(2a), затем подставь его в f(x).',solutionCount:'Построй левую часть в Desmos. Посчитай точки, где график касается или пересекает ось x.',sumRoots:'Для ax² + bx + c = 0 сумма решений равна −b/a.',productRoots:'Для ax² + bx + c = 0 произведение решений равно c/a.',constant:'Раскрой скобки. Умножь постоянные члены, чтобы найти k.',solveLinear:'Перенеси постоянное число вправо, затем раздели на коэффициент при x.'}
  };
  function prompt(q,language='en') { return (prompts[language] || prompts.en)[q.kind].replace('{x}',String(q.x)); }
  function hint(q,language='en') { const kind = q.kind === 'evaluate' && q.a === 0 ? 'linearEvaluate' : q.kind; return (hints[language] || hints.en)[kind].replace('{x}',String(q.x)); }
  function parseAnswer(raw) {
    const text = String(raw ?? '').trim().replace(/[−–]/g,'-').replace(',','.');
    const number = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
    const parts = text.split('/').map(part => part.trim());
    if (parts.length === 1 && number.test(parts[0])) { const value=Number(parts[0]); return Number.isFinite(value) ? value : null; }
    if (parts.length === 2 && parts.every(part => number.test(part)) && Number(parts[1]) !== 0) { const value=Number(parts[0])/Number(parts[1]); return Number.isFinite(value) ? value : null; }
    return null;
  }
  function matches(q,raw) { const value=parseAnswer(raw); return value !== null && Math.abs(value-q.answer) < 1e-9; }
  function createDeck(random=Math.random) {
    let deck=[],previous=null,number=0;
    return {next(){
      if (!deck.length) {
        deck=[...questions];
        for (let i=deck.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
        if (deck.at(-1).id === previous) [deck[0],deck[deck.length-1]]=[deck.at(-1),deck[0]];
        number=0;
      }
      const question=deck.pop();previous=question.id;number++;return question;
    },get number(){return number;}};
  }
  function migrateCompleted(ids) { return ids.map(id => legacyIds[id] || id); }
  return Object.freeze({questions,prompt,hint,equation,parseAnswer,matches,createDeck,migrateCompleted});
})();
