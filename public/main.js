
class Component extends PageLogic {
  constructor(props) {
    super(props);
    this.state = { y: 0, vh: 900, vw: 1440, geoP: 0, mode: 0, auto: true, regHover: -1, geoSeen: false, geoTop: 99999, clTop: 99999, caseSel: 0, agree: false, ferr: {}, sent: false };
    this.runCount = this.runCount.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }
  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    var v = document.getElementById('heroVideo');
    if (v) { v.pause(); v.addEventListener('loadedmetadata', this.onScroll); }
    this.onScroll();
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.tour) clearInterval(this.tour);
  }
  onScroll() {
    if (this.raf) return;
    var self = this;
    this.raf = requestAnimationFrame(function () {
      self.raf = 0;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var h = window.innerHeight || 900;
      var v = document.getElementById('heroVideo');
      if (v && v.duration && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        var t = Math.max(0, Math.min(1, y / h / 1.3)) * (v.duration - 0.05);
        if (Math.abs(v.currentTime - t) > 0.01) v.currentTime = t;
      }
      var g = document.getElementById('geo'), cl = document.getElementById('clients');
      var gt = g ? g.getBoundingClientRect().top : 99999, ct = cl ? cl.getBoundingClientRect().top : 99999;
      self.setState({ y: y, vh: h, vw: window.innerWidth || 1440, geoTop: gt, clTop: ct });
      if (!self.state.geoSeen && gt < h * 0.55) { self.setState({ geoSeen: true }); self.runCount(); }
    });
  }
  runCount() {
    var self = this, start = null;
    if (this.countRaf) cancelAnimationFrame(this.countRaf);
    function stepFn(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / 1400), e = 1 - Math.pow(1 - t, 3);
      self.setState({ geoP: e });
      if (t < 1) self.countRaf = requestAnimationFrame(stepFn);
    }
    this.countRaf = requestAnimationFrame(stepFn);
    if (!this.tour) this.tour = setInterval(function () {
      if (self.state.auto && self.state.regHover < 0) self.setState({ mode: (self.state.mode + 1) % 3 });
    }, 5400);
  }
  renderVals() {
    var accent = this.props.accent || '#F4F3EF';
    var vh = this.state.vh || 900;
    var D = this.state.y / vh;
    function clamp(x) { return Math.max(0, Math.min(1, x)); }
    function seg(a, b) { return clamp((D - a) / (b - a)); }
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function r(n) { return Math.round(n * 1000) / 1000; }
    function lerp(a, b, t) { return a + (b - a) * t; }

    // HERO: 0 → 1.3 экрана видео перематывается; затем кадр сжимается в карточку и схлопывается
    var heroText = 'position: absolute; left: 4vw; bottom: 8vh; max-width: 44vw; z-index: 2; transform: translateY(' + r(-seg(0.6, 1.2) * 60) + 'px); opacity: ' + r(1 - seg(0.6, 1.15)) + ';';
    // Переход: кадр распадается на 6 квадратов знака (как в логотипе: шаг = 1,25 стороны),
    // затем квадраты улетают в знак логотипа в шапке
    var W = this.state.vw || 1440, H = vh;
    var sq = Math.min(W, H) * 0.14, step = sq * 1.25, tot = sq + step * 2;
    var ox = W / 2 - tot / 2, oy = H / 2 - tot / 2;
    var hsq = 40 * 54 / 200, hstep = 40 * 67.5 / 200, hx = W * 0.04, hy = 22;
    var cells = [[0, 0], [1, 0], [2, 0], [1, 1], [2, 1], [2, 2]];
    var d = [], fLast = ease(seg(2.3 + 5 * 0.045, 2.8 + 5 * 0.045));
    cells.forEach(function (c, i) {
      var m = ease(seg(1.3 + i * 0.035, 2.05 + i * 0.035));
      var f = ease(seg(2.3 + i * 0.045, 2.8 + i * 0.045));
      var tx = ox + c[0] * step, ty = oy + c[1] * step;
      var x = lerp(0, tx, m), y = lerp(0, ty, m), w = lerp(W, sq, m), h = lerp(H, sq, m);
      x = lerp(x, hx + c[0] * hstep, f); y = lerp(y, hy + c[1] * hstep, f);
      w = lerp(w, hsq, f); h = lerp(h, hsq, f);
      if (fLast < 0.995) d.push('M' + r(x) + ' ' + r(y) + 'H' + r(x + w) + 'V' + r(y + h) + 'H' + r(x) + 'Z');
    });
    var k = ease(seg(1.3, 2.1));
    var frameStyle = 'position: absolute; inset: 0; z-index: 1; clip-path: path(\'' + (d.length ? d.join(' ') : 'M0 0Z') + '\'); opacity: ' + (d.length ? 1 : 0) + ';';
    var gradStyle = 'position: absolute; inset: 0; background: linear-gradient(60deg, rgba(8,8,9,.85) 0%, rgba(8,8,9,.4) 35%, rgba(8,8,9,0) 60%); opacity: ' + r(1 - k) + ';';
    // Шапка собирается из прилетевших квадратов: знак → надпись → пункты меню
    var markIn = seg(2.86, 3.02), wordIn = ease(seg(2.98, 3.4));
    var hBase = 'position: absolute; left: 0; top: 0; height: 40px; width: auto; display: block; ';
    var hMark = hBase + 'clip-path: inset(0 79% 0 0); opacity: ' + r(markIn) + ';';
    var hWord = hBase + 'clip-path: inset(0 ' + r((1 - wordIn) * 73) + '% 0 27%); opacity: ' + r(wordIn > 0 ? 1 : 0) + '; transform: translateX(' + r((1 - wordIn) * -14) + 'px);';
    var hNav = [0, 1, 2, 3, 4].map(function (i) {
      var t = ease(seg(3.12 + i * 0.07, 3.45 + i * 0.07));
      return 'display: inline-block; opacity: ' + r(t) + '; transform: translateY(' + r((1 - t) * -14) + 'px); pointer-events: ' + (t > 0.5 ? 'auto' : 'none') + ';';
    });
    var headerBg = D > 3.45 ? 'background: rgba(13,13,14,.8); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); transition: background .3s;' : 'background: transparent; transition: background .3s;';

    // ИНТРО
    var txt = 'Развиваем производство, контролируем качество, обеспечиваем предприятия всем необходимым — для технологического будущего промышленности.';
    var parts = txt.split(' ');
    var reveal = seg(3.1, 4.1);
    var out = ease(seg(4.25, 4.6));
    var N = parts.length;
    // Три глагола-направления выделены; вариант выделения — в Tweaks («Акцент глаголов»)
    var KEY = ['развиваем', 'контролируем', 'обеспечиваем'];
    var acc = this.props.verbs || 'Медь из херо';
    var caps = acc.indexOf('Капс') === 0, grad = { 'Медь из херо': 'copper', 'Янтарь': 'amber', 'Красный отлив': 'red', 'Красный глубокий': 'red2', 'Металл': 'metal', 'Холодный синий': 'blue' }[acc] || 'copper';
    var GR = { copper: '#FFF1E2 0%, #FFD190 16%, #F19E65 34%, #B05A33 50%, #FFE4C8 72%, #E6895B 100%', amber: '#FFFFFF 0%, #FFE3B8 20%, #FFD190 34%, #E6895B 50%, #FFF1DE 72%, #F19E65 100%', red: '#FFFFFF 0%, #F3CFCC 22%, #D9463F 50%, #FFFFFF 72%, #EBA8A3 100%', red2: '#FFFFFF 0%, #EE9C96 20%, #C4161C 50%, #FFFFFF 72%, #E0736D 100%', metal: '#FFFFFF 0%, #C9D0D8 24%, #76828F 50%, #FFFFFF 72%, #B9C1CA 100%', blue: '#FFFFFF 0%, #C4D4F4 22%, #6E93D8 50%, #FFFFFF 72%, #B4C8F0 100%' };
    var words = parts.map(function (w, i) {
      var t = clamp(reveal * N * 1.15 - i), key = KEY.indexOf(w.replace(/[^а-яё]/gi, '').toLowerCase()) >= 0;
      var u = ease(clamp((reveal * N * 1.15 - i) / 3));
      var ks = '';
      if (key && caps) ks += 'text-transform: uppercase; letter-spacing: -.005em; font-weight: 600;';
      if (key && grad) ks += ' background: linear-gradient(100deg, ' + GR[grad] + '); background-size: 200% 100%; background-position: ' + r((1 - u) * 100) + '% 0; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;';
      return { text: w, ks: ks, style: 'opacity: ' + r(0.16 + (key ? 0.84 : 0.34) * t) + ';' + (key ? ' white-space: nowrap;' : '') };
    });
    var introStyle = 'position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 36px; padding: 0 8vw; opacity: ' + r(seg(2.95, 3.2) * (1 - out)) + '; transform: translateY(' + r(-out * 80) + 'px); pointer-events: none;';

    // КАРТОЧКИ
    var variant = this.props.cards || 'C — фото на всю карточку';
    var isA = variant.indexOf('A') === 0, isB = variant.indexOf('B') === 0, isC = variant.indexOf('C') === 0, isR = !isA && !isB && !isC;
    var starts = [4.6, 5.9, 7.2];
    var data = [
      { title: 'РАЗВИВАТЬ', label: 'Развитие производства', text: 'Роботизируем участки, внедряем цифровые решения и ИИ, консультируем по развитию производства.', links: ['Автоматизация', 'Цифровизация и AI', 'Консалтинг'], caption: 'Кадр: роботизированная ячейка «Кибермодуль» в цеху', g: '160deg' },
      { title: 'КОНТРОЛИРОВАТЬ', label: 'Качество и соответствие', text: 'Контролируем качество продукции и поставщиков, обеспечиваем единство измерений, сертифицируем системы менеджмента.', links: ['Контроль качества', 'Метрологическая служба', 'Сертификация'], caption: 'Кадр: метролог за аттестацией испытательного оборудования', g: '200deg' },
      { title: 'ОБЕСПЕЧИВАТЬ', label: 'Снабжение и оборудование', text: '[Одна строка о направлении — формулировку даёт подразделение.]', links: ['Оборудование «Эталон»', 'Снабжение', 'Полиграфия'], caption: 'Кадр: оборудование «Эталон» / склад и отгрузка', g: '140deg' }
    ];
    var cards = data.map(function (d, i) {
      var e = ease(seg(starts[i], starts[i] + 0.85));
      var p = i < 2 ? ease(seg(starts[i + 1], starts[i + 1] + 0.85)) : 0;
      var late = ease(seg(starts[i] + 0.35, starts[i] + 1.05));
      var media = '';
      var links = d.links.map(function (t, j) {
        var o = clamp(late * 1.8 - j * 0.16);
        return {
          t: t, n: '0' + (j + 1), notFirst: j > 0, href: t.indexOf('Эталон') >= 0 ? '/solutions/etalon' : (t === 'Сертификация' ? '/solutions/quality' : (t === 'Снабжение' ? '/solutions/supply' : '#')),
          low: j === 0 ? t : (t === 'AI' ? t : t.charAt(0).toLowerCase() + t.slice(1)),
          style: 'border-top: 1px solid #2C2C2E; opacity: ' + r(o) + '; transform: translateY(' + r((1 - o) * 14) + 'px);',
          cStyle: 'opacity: ' + r(o) + '; transform: translateY(' + r((1 - o) * 16) + 'px);',
          bStyle: 'display: flex; align-items: baseline; gap: 18px; font-size: clamp(24px, 2.5vw, 44px); line-height: 1.1; font-weight: 500; letter-spacing: -.02em; opacity: ' + r(o) + '; transform: translateX(' + r((1 - o) * 30) + 'px);'
        };
      });
      return {
        img: 'img' + (i + 1), e: e, idx: '0' + (i + 1), title: d.title, label: d.label, text: d.text, caption: '', links: links,
        // C — фото на всю карточку
        cWrap: 'position: absolute; left: 4vw; right: 4vw; top: calc(84px + 2vh); bottom: 3vh; border-radius: 16px; overflow: hidden; background: #141415; z-index: ' + (i + 3) + '; clip-path: inset(' + r((1 - e) * 100) + '% 0 0 0 round 16px); filter: brightness(' + r(1 - p * 0.55) + ');',
        cMedia: media + ' transform: scale(' + r(1.14 - 0.14 * e) + ');',
        cTitle: 'margin: 0; font-size: clamp(52px, 6.4vw, 124px); line-height: .92; font-weight: 500; letter-spacing: -.05em; white-space: nowrap; transform: translateY(' + r((1 - late) * 40) + 'px); opacity: ' + r(late) + ';',
        cText: 'margin: 0; font-size: clamp(17px, 1.4vw, 22px); line-height: 1.4; max-width: 36ch; opacity: ' + r(late) + ';',
        // A
        aWrap: 'position: absolute; left: 5vw; right: 5vw; top: calc(84px + 3vh); bottom: 4vh; z-index: ' + (i + 3) + '; clip-path: inset(' + r((1 - e) * 100) + '% 0 0 0 round 14px);',
        aPanel: 'position: absolute; inset: 0; box-sizing: border-box; padding: 3vh 3vw 3.5vh; background: #141415; border: 1px solid #2C2C2E; border-radius: 14px; display: grid; grid-template-rows: auto auto minmax(0, 1fr); row-gap: 2.4vh; filter: brightness(' + r(1 - p * 0.55) + ');',
        aTitle: 'margin: 0; font-size: clamp(56px, 7.4vw, 140px); line-height: .9; font-weight: 500; letter-spacing: -.055em; white-space: nowrap; transform: translateY(' + r((1 - late) * 50) + 'px); opacity: ' + r(late) + ';',
        aMedia: media + ' transform: scale(' + r(1.15 - 0.15 * e) + ');',
        // B
        bWrap: 'position: absolute; inset: 0; z-index: ' + (i + 3) + '; background: #0D0D0E; display: grid; grid-template-columns: 44% 11vw minmax(0, 1fr); transform: translateX(' + r((1 - e) * 100 - p * 18) + '%); box-shadow: -30px 0 60px rgba(0,0,0,' + r(e < 1 ? 0.5 : 0) + ');',
        bDim: 'filter: brightness(' + r(1 - p * 0.6) + ');',
        bMedia: media + ' transform: scale(' + r(1.2 - 0.2 * e) + ');',
        bTitle: 'margin: 0; writing-mode: vertical-rl; transform: rotate(180deg); font-size: clamp(56px, 6.6vw, 124px); line-height: 1; font-weight: 500; letter-spacing: -.04em; white-space: nowrap; color: ' + accent + '; opacity: ' + r(late) + ';',
        // исходный
        rWrap: 'position: absolute; left: 6vw; right: 6vw; top: 19vh; bottom: 4vh; z-index: ' + (i + 3) + '; transform: translateY(' + r((1 - e) * 110 - p * 3) + 'vh) scale(' + r(1 - p * 0.05) + '); transform-origin: 50% 0;',
        rArt: 'filter: brightness(' + r(1 - p * 0.6) + ');',
        rTitle: 'position: absolute; left: 0; right: 0; top: 0; transform: translateY(-60%); margin: 0; text-align: center; font-size: clamp(56px, 8.4vw, 160px); line-height: 1; font-weight: 500; letter-spacing: -.05em; white-space: nowrap; background: linear-gradient(180deg, #F4F3EF 0 60%, ' + accent + ' 60% 100%); -webkit-background-clip: text; background-clip: text; color: transparent; opacity: ' + r(clamp(1 - p * 1.8)) + ';'
      };
    });
    // ГЕОГРАФИЯ: режимы 0 — приёмки, 1 — регионы, 2 — представительства
    var seen = this.state.geoSeen, gp = this.state.geoP, mode = this.state.mode, rh = this.state.regHover, selfG = this;
    var regs = ["Москва", "Московская область", "Санкт-Петербург", "Республика Башкортостан", "Республика Татарстан", "Удмуртская Республика", "Чувашская Республика", "Красноярский край", "Пермский край", "Владимирская область", "Волгоградская область", "Кировская область", "Нижегородская область", "Пензенская область", "Ростовская область", "Самарская область", "Саратовская область", "Свердловская область", "Челябинская область"];
    var rc = [[150.2, 236.8], [147, 236.2], [167.1, 161.6], [238.5, 350], [214.6, 311.7], [240.6, 302.4], [194.8, 290.9], [526.2, 298.7], [275.1, 297.3], [167.6, 251.2], [122.4, 328.2], [238.1, 273.7], [189.5, 270.5], [159.8, 298.7], [87.5, 325.9], [193.6, 330.1], [156.8, 326], [300.9, 323.6], [264.1, 365.1]];
    var px = [155.8, 153, 149.6, 152.7, 147.9, 143.6, 147.9, 152.3, 166.5, 168.9, 165.3, 296.3, 266, 312, 219.3, 217.2, 257.7, 241.1, 182.1, 203.1, 208.4, 210.8, 273.1, 283.4, 287.6, 299.2, 486, 509.8, 231.4, 244, 176.9, 147.2, 99, 78.8, 165.7, 177.8, 191.2, 103.2, 232.2, 150.6];
    var Z = [0.7062, 148.3, 4.9];
    var geo = {
      zoom: 'transform: ' + (mode === 2 ? 'translate(' + Z[1] + 'px, ' + Z[2] + 'px) scale(' + Z[0] + ')' : 'translate(0px, 0px) scale(1)') + '; transform-origin: 0 0; transition: transform 1.3s cubic-bezier(.65,0,.35,1);',
      clip: 'transform: scaleX(' + (seen ? 1 : 0) + '); transform-origin: 0 0; transition: transform 2s cubic-bezier(.45,0,.2,1);',
      scan: 'transform: translateX(' + (seen ? 1080 : 0) + 'px); opacity: ' + (seen ? 0 : 1) + '; transition: transform 2s cubic-bezier(.45,0,.2,1), opacity .4s ease 1.8s;',
      byS: 'opacity: ' + (mode === 2 ? 0.5 : 0) + '; transition: opacity .8s ease ' + (mode === 2 ? '1s' : '0s') + ';',
      cnS: 'opacity: ' + (mode === 2 ? 0.36 : 0) + '; transition: opacity .8s ease ' + (mode === 2 ? '1.1s' : '0s') + ';',
      rl: function () { selfG.setState({ regHover: -1 }); },
      tip: 'opacity: ' + (rh >= 0 && mode !== 2 ? 1 : 0) + '; transform: translate(' + (rh >= 0 ? rc[rh][0] : 0) + 'px, ' + (rh >= 0 ? rc[rh][1] : 0) + 'px); transition: opacity .2s ease; pointer-events: none;',
      tipText: rh >= 0 ? regs[rh] : '',
      stats: [[40, 'технических приёмок'], [19, 'регионов присутствия'], [2, 'зарубежных представительства']].map(function (m, i) {
        var on = i === mode;
        return {
          v: Math.round(m[0] * gp), l: m[1], sel: on ? 'true' : 'false',
          pick: function () { selfG.setState({ mode: i, auto: false, geoSeen: true }); },
          style: 'position: relative; display: flex; align-items: center; gap: 20px; padding: 2.2vh 0; background: none; border: 0; color: #F4F3EF; cursor: pointer; font-family: Onest, sans-serif; text-align: left; opacity: ' + (on ? 1 : 0.42) + '; transition: opacity .35s ease;',
          bar: 'position: absolute; left: 0; top: 0; height: 2px; background: #F4F3EF; width: ' + (on ? '100%' : '0') + '; transition: width ' + (on ? (selfG.state.auto ? '5.4s linear' : '.4s ease') : '0s') + ';'
        };
      }),
      list: regs.map(function (n, i) {
        var on = mode === 1 || rh === i;
        return { n: n, hover: function () { selfG.setState({ regHover: i }); },
          style: 'font-size: 15px; line-height: 1.35; cursor: default; color: #F4F3EF; transition: opacity .3s; opacity: ' + (rh === i ? 1 : on ? 0.85 : 0.4) + ';' };
      })
    };
    regs.forEach(function (n, i) {
      var on = seen && mode === 1, hov = rh === i;
      geo['r' + i] = 'stroke-dasharray: 1; stroke-dashoffset: ' + (on ? 0 : 1) + '; fill-opacity: ' + (on ? (hov ? 0.34 : 0.1) : (hov ? 0.18 : 0)) + '; stroke-opacity: ' + (on || hov ? 1 : 0) + '; transition: stroke-dashoffset 1.4s ease ' + r(on ? i * 0.05 : 0) + 's, fill-opacity .5s ease ' + r(on && !hov ? 0.6 + i * 0.05 : 0) + 's, stroke-opacity .3s ease; cursor: pointer;';
      geo['rh' + i] = function () { selfG.setState({ regHover: i }); };
    });
    px.forEach(function (x, i) {
      var on = seen && mode === 0, dl = on ? 0.1 + x / 1000 * 2 : 0;
      geo['p' + i] = 'opacity: ' + (on ? 1 : (seen ? 0.28 : 0)) + '; transform: scale(' + (on ? 1 : 0.7) + '); transform-box: fill-box; transform-origin: center; transition: opacity .45s ease ' + r(dl) + 's, transform .6s cubic-bezier(.2,.7,0,1) ' + r(dl) + 's;';
    });
    [0, 1].forEach(function (j) {
      var on = mode === 2;
      geo['oa' + j] = 'stroke-dasharray: 1; stroke-dashoffset: ' + (on ? 0 : 1) + '; transition: stroke-dashoffset 1.2s ease ' + (on ? 1.3 + j * 0.2 : 0) + 's;';
      geo['ol' + j] = 'opacity: ' + (on ? 1 : 0) + '; transition: opacity .6s ease ' + (on ? 2 + j * 0.2 : 0) + 's;';
    });
    // Клиенты + кейсы: 12 ячеек, у части есть кейс; выбранный кейс раскрывается под своим рядом
    var clTop = this.state.clTop, sel = this.state.caseSel, selfC = this;
    var withCase = [0, 5, 10];
    var CASES = {
      0: { name: 'Аэрокон', logo: '/assets/logo_aerokon.png', w: 'clamp(150px, 13vw, 210px)', p: 1, ind: 'Авиастроение',
           title: 'Входной контроль деталей двигателя от 12 поставщиков',
           task: 'Детали двигателя поступали от 12 поставщиков, несоответствия выявлялись уже на сборке.',
           sol: 'Техническую приёмку перенесли на площадки поставщиков: контроль по согласованной программе до отгрузки.',
           res: 'Брак отсекается у поставщика, сборка идёт по графику.',
           m1: '−38%', m1t: 'возвратов поставщикам', m2: '12', m2t: 'поставщиков под приёмкой' },
      5: { name: 'Сталь-Меридиан', logo: '/assets/logo_stal.png', w: 'clamp(140px, 12vw, 196px)', p: 2, ind: 'Металлургия',
           title: 'Приёмка проката для гособоронзаказа',
           task: 'Подтверждать соответствие каждой партии проката требованиям заказчика по ГОЗ.',
           sol: 'Постоянное представительство технической приёмки на заводе: контроль партий, документации и маркировки.',
           res: 'Партии уходят с подтверждённым качеством, без повторных проверок у заказчика.',
           m1: '4 200 т', m1t: 'проката принято за год', m2: '0', m2t: 'рекламаций за год' },
      10: { name: 'Кварта-Электроника', logo: '/assets/logo_kvarta.png', w: 'clamp(134px, 11.5vw, 186px)', p: 3, ind: 'Электроника',
           title: 'Приёмка печатных плат для приборостроения',
           task: 'Сократить цикл приёмки плат без потери глубины контроля.',
           sol: 'Контроль по критическим параметрам, визуальный и микроскопический осмотр, единый протокол приёмки.',
           res: 'Цикл приёмки короче, соответствие стабильно выше 99%.',
           m1: '99,7%', m1t: 'соответствия', m2: '−21 день', m2t: 'цикла приёмки' }
    };
    var cellsAll = [];
    for (var j = 0; j < 12; j++) {
      (function (j) {
        var o = clamp(((vh - clTop) / vh - 0.18 - j * 0.035) / 0.3);
        var has = withCase.indexOf(j) >= 0, on = sel === j;
        cellsAll.push({
          name: has ? CASES[j].name : '[Логотип]', hasCase: has, noCase: !has, sel: on ? 'true' : 'false',
          logo: has ? CASES[j].logo : '',
          logoStyle: 'display: block; width: ' + (has ? CASES[j].w : '0') + '; height: auto; opacity: ' + (on ? 1 : 0.62) + '; transition: opacity .3s;',
          aria: 'Кейс: ' + (has ? CASES[j].name : 'логотип ' + (j + 1)),
          pick: function () { selfC.setState({ caseSel: selfC.state.caseSel === j ? -1 : j }); },
          style: 'position: relative; height: clamp(130px, 17vh, 190px); display: flex; align-items: center; justify-content: center; border: 0; border-right: 1px solid #2C2C2E; border-bottom: 1px solid #2C2C2E; background: ' + (on ? 'rgba(244,243,239,.06)' : 'transparent') + '; color: #F4F3EF; font-family: Onest, sans-serif; cursor: ' + (has ? 'pointer' : 'default') + '; transition: background .3s, opacity .5s, transform .5s; opacity: ' + r(o) + '; transform: translateY(' + r((1 - o) * 18) + 'px);',
          nameStyle: 'font-size: clamp(18px, 1.6vw, 26px); font-weight: 600; opacity: ' + (has ? (on ? 0.95 : 0.6) : 0.25) + '; transition: opacity .3s;',
          markStyle: 'position: absolute; right: 14px; top: 14px; width: 26px; height: 26px; border-radius: 3px; display: flex; align-items: center; justify-content: center; transition: background .3s, color .3s; ' + (on ? 'background: #F4F3EF; color: #0D0D0E;' : 'border: 1px solid rgba(244,243,239,.45); color: #F4F3EF;'),
          lineStyle: 'position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: #F4F3EF; transform: scaleX(' + (on ? 1 : 0) + '); transition: transform .4s cubic-bezier(.2,.7,0,1);'
        });
      })(j);
    }
    var rows = [0, 1, 2].map(function (ri) {
      var open = sel >= ri * 4 && sel < ri * 4 + 4;
      var c = CASES[withCase[ri]];
      return {
        p1: c.p === 1, p2: c.p === 2, p3: c.p === 3, ind: c.ind, title: c.title, task: c.task, sol: c.sol, res: c.res,
        m1: c.m1, m1t: c.m1t, m2: c.m2, m2t: c.m2t,
        cells: cellsAll.slice(ri * 4, ri * 4 + 4),
        panelWrap: 'display: grid; grid-template-rows: ' + (open ? '1fr' : '0fr') + '; opacity: ' + (open ? 1 : 0) + '; transition: grid-template-rows .55s cubic-bezier(.2,.7,0,1), opacity .35s ease;'
      };
    });
    var closeCase = function () { selfC.setState({ caseSel: -1 }); };
    var active = cards[2].e > 0.5 ? 2 : cards[1].e > 0.5 ? 1 : 0;
    var dots = ['Развивать', 'Контролировать', 'Обеспечивать'].map(function (l, i) {
      var on = i === active;
      return {
        label: l,
        go: function () { window.scrollTo({ top: (starts[i] + 0.9) * vh, behavior: 'smooth' }); },
        style: 'width: 10px; height: 10px; padding: 0; border-radius: 50%; cursor: pointer; border: 1.5px solid ' + (on ? accent : 'rgba(244,243,239,.75)') + '; background: ' + (on ? accent : 'transparent') + ';'
      };
    });
    var dotsStyle = 'position: absolute; right: 2vw; top: 50%; transform: translateY(-50%); z-index: 10; display: flex; flex-direction: column; gap: 22px; opacity: ' + r(seg(4.5, 4.9)) + ';';

    var cta = this.props.cta || 'Контур';
    // Форма заявки: валидация, экран «отправлено»
    var selfF = this, ferr = this.state.ferr;
    var submitForm = function (e) {
      e.preventDefault();
      var f = e.currentTarget.elements;
      var nm = f.fname.value.trim(), ph = f.fphone.value.replace(/\D/g, ''), ml = f.femail.value.trim();
      var er = { n: !nm, p: ph.length < 10, m: ml !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ml), a: !selfF.state.agree };
      if (er.n || er.p || er.m || er.a) { selfF.setState({ ferr: er }); return; }
      selfF.setState({ sent: true, ferr: {} });
    };
    var formVals = {
      submitForm: submitForm, formOpen: !this.state.sent, sent: this.state.sent,
      inpName: ferr.n ? 'inp bad' : 'inp', inpPhone: ferr.p ? 'inp bad' : 'inp', inpMail: ferr.m ? 'inp bad' : 'inp',
      errName: ferr.n ? 'Укажите имя' : '', errPhone: ferr.p ? 'Укажите телефон — 10–11 цифр' : '', errMail: ferr.m ? 'Проверьте адрес почты' : '',
      errAgree: ferr.a ? 'Нужно согласие, чтобы отправить заявку' : '',
      agree: this.state.agree, agreeAria: this.state.agree ? 'true' : 'false', cbxCls: 'cbx' + (this.state.agree ? ' on' : '') + (ferr.a && !this.state.agree ? ' bad' : ''),
      toggleAgree: function () { selfF.setState({ agree: !selfF.state.agree }); },
      resetForm: function () { selfF.setState({ sent: false, agree: false, ferr: {} }); }
    };
    return Object.assign(formVals, { hMark: hMark, hWord: hWord, hNav0: hNav[0], hNav1: hNav[1], hNav2: hNav[2], hNav3: hNav[3], hNav4: hNav[4], hcText: this.props.headerCta === 'Текст', hcIcon: (this.props.headerCta || 'Квадрат') === 'Квадрат', hcExp: this.props.headerCta === 'Квадрат с раскрытием', rows: rows, closeCase: closeCase, ctaA: cta === 'Контур', ctaB: cta === 'Контур + квадрат', ctaC: cta === 'Ссылка + квадрат', geo: geo, gradStyle: gradStyle, accent: accent, isA: isA, isB: isB, isC: isC, isR: isR, cards: cards, headerBg: headerBg, heroText: heroText, frameStyle: frameStyle, words: words, introStyle: introStyle, dots: dots, dotsStyle: dotsStyle });
  }
}

export default Component;
