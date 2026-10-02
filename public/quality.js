
class Component extends PageLogic {
  constructor(props) {
    super(props);
    this.state = { agree: false, ferr: {}, sent: false, hp: 0, svc: 0, abSel: 0, rp: 0 };
    this.onScroll = this.onScroll.bind(this);
  }
  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    this.onScroll();
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    if (this.raf) cancelAnimationFrame(this.raf);
  }
  onScroll() {
    if (this.raf) return;
    var self = this;
    this.raf = requestAnimationFrame(function () {
      self.raf = 0;
      var el = document.getElementById('hero'), h = window.innerHeight || 900;
      if (!el) return;
      var rc = el.getBoundingClientRect();
      var hp = Math.max(0, Math.min(1, (84 - rc.top) / Math.max(1, rc.height - h + 84)));
      var v = document.getElementById('etVideo');
      if (v && v.duration && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        var t = Math.max(0, Math.min(1, (hp - 0.16) / 0.66)) * Math.min(3.7, v.duration - 0.05);
        if (Math.abs(v.currentTime - t) > 0.01) v.currentTime = t;
      }
      var st = document.getElementById('svcStack'), sp = 0;
      if (st) { var rs = st.getBoundingClientRect(); sp = Math.max(0, Math.min(1, (84 - rs.top) / Math.max(1, rs.height - h + 84))); }
      var rl = document.getElementById('abReelSec'), rp = 0;
      if (rl) { var rr = rl.getBoundingClientRect(); rp = Math.max(0, Math.min(1, (84 - rr.top) / Math.max(1, rr.height - h + 84))); }
      if (Math.abs(rp - (self.state.rp || 0)) > 0.001) self.setState({ rp: rp });
      function pin(id) { var e = document.getElementById(id); if (!e) return 0; var q = e.getBoundingClientRect(); return Math.max(0, Math.min(1, (84 - q.top) / Math.max(1, q.height - h + 84))); }
      var wl = pin('whyPin'), wk = pin('whyKinPin'), wr = [], wb = 0;
      document.querySelectorAll('.whyRow').forEach(function (e) { var q = e.getBoundingClientRect(); wr.push(Math.round(Math.max(0, Math.min(1, (h * 0.9 - q.top) / (h * 0.3))) * 1000) / 1000); });
      var bg = document.getElementById('whyBentoGrid'); if (bg) { var qb = bg.getBoundingClientRect(); wb = Math.max(0, Math.min(1, (h * 0.95 - qb.top) / (h * 0.7))); }
      var wrs = wr.join(',');
      if (Math.abs(wl - (self.state.wl || 0)) > 0.001 || Math.abs(wk - (self.state.wk || 0)) > 0.001 || Math.abs(wb - (self.state.wb || 0)) > 0.002 || wrs !== (self.state.wrs || '')) self.setState({ wl: wl, wk: wk, wb: wb, wrs: wrs });
      var xg = document.getElementById('xsGrid'), xp = 0; if (xg) { var qx = xg.getBoundingClientRect(); xp = Math.max(0, Math.min(1, (h * 0.95 - qx.top) / (h * 0.5))); }
      if (Math.abs(xp - (self.state.xp || 0)) > 0.002) self.setState({ xp: xp });
      var asS = document.getElementById('abSceneSec'), asp = 0;
      if (asS) { var qa = asS.getBoundingClientRect(); asp = Math.max(0, Math.min(1, (84 - qa.top) / Math.max(1, qa.height - h + 84))); }
      if (Math.abs(asp - (self.state.asp || 0)) > 0.001) self.setState({ asp: asp });
      var ipp = 0, ipE = document.getElementById('impPin'); if (ipE) { var qi = ipE.getBoundingClientRect(); ipp = Math.max(0, Math.min(1, (84 - qi.top) / Math.max(1, qi.height - h + 84))); }
      var itr = []; document.querySelectorAll('.impRow').forEach(function (e) { var q = e.getBoundingClientRect(); itr.push(Math.round(Math.max(0, Math.min(1, (h * 0.92 - q.top) / (h * 0.3))) * 1000) / 1000); });
      var icp = 0, icE = document.getElementById('impCards'); if (icE) { var qc = icE.getBoundingClientRect(); icp = Math.max(0, Math.min(1, (h * 0.95 - qc.top) / (h * 0.6))); }
      var itrs = itr.join(',');
      if (Math.abs(ipp - (self.state.ipp || 0)) > 0.001 || itrs !== (self.state.itrs || '') || Math.abs(icp - (self.state.icp || 0)) > 0.002) self.setState({ ipp: ipp, itrs: itrs, icp: icp });
      var mi = document.getElementById('mission'), mp = 0;
      if (mi) { var rm = mi.getBoundingClientRect(); mp = Math.max(0, Math.min(1, (h * 0.92 - rm.top) / (h * 0.62))); }
      if (Math.abs(hp - self.state.hp) > 0.0005 || Math.abs(sp - (self.state.sp || 0)) > 0.0005 || Math.abs(mp - (self.state.mp || 0)) > 0.002) self.setState({ hp: hp, sp: sp, mp: mp });
    });
  }
  renderVals() {
    // Сцена первого экрана: hp — прогресс закреплённой секции (0…1)
    function clamp(x) { return Math.max(0, Math.min(1, x)); }
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function r(n) { return Math.round(n * 1000) / 1000; }

    // «Три направления работы»: вкладки / аккордеон
    var sv = this.props.services || 'Карточка на экран', svc = this.state.svc, selfS = this, svv = {};
    [0, 1, 2].forEach(function (i) {
      var on = svc === i;
      svv['svSel' + i] = on ? 'true' : 'false';
      svv['svOn' + i] = on;
      svv['svPick' + i] = function () { selfS.setState({ svc: i }); };
      svv['svToggle' + i] = function () { selfS.setState({ svc: selfS.state.svc === i ? -1 : i }); };
      svv['svTab' + i] = 'display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 22px 24px 22px 0; background: transparent; border: 0; border-bottom: 2px solid ' + (on ? '#F4F3EF' : 'transparent') + '; margin-bottom: -1px; color: #F4F3EF; font-family: inherit; font-size: clamp(18px, 1.5vw, 24px); font-weight: 500; text-align: left; cursor: pointer; opacity: ' + (on ? 1 : 0.5) + '; transition: opacity .25s, border-color .25s;';
      svv['svIco' + i] = 'width: 48px; height: 48px; border-radius: 4px; border: 1px solid ' + (on ? '#F4F3EF' : 'rgba(244,243,239,.4)') + '; display: flex; align-items: center; justify-content: center; justify-self: end; transition: border-color .25s;';
      svv['svIcoS' + i] = 'display: block; transform: rotate(' + (on ? 45 : 0) + 'deg); transition: transform .35s cubic-bezier(.2,.7,0,1);';
      svv['svWrap' + i] = 'display: grid; grid-template-rows: ' + (on ? '1fr' : '0fr') + '; opacity: ' + (on ? 1 : 0) + '; transition: grid-template-rows .5s cubic-bezier(.2,.7,0,1), opacity .35s;';
    });

    svv.svStack = true; svv.svHead = !svv.svStack;
    svv.svSecStyle = svv.svStack ? 'padding: 10vh 0 0;' : 'padding: 14vh 4vw 0;';
    var sp = this.state.sp || 0, starts = [-1, 0.22, 0.47, 0.72];
    [0, 1, 2, 3].forEach(function (i) {
      var e = i === 0 ? 1 : ease(clamp((sp - starts[i]) / 0.24));
      var nx = i < 3 ? ease(clamp((sp - starts[i + 1]) / 0.2)) : 0;
      var late = i === 0 ? 1 : ease(clamp((sp - starts[i] - 0.1) / 0.2));
      svv['stL' + i] = 'position: absolute; left: 4vw; right: 4vw; top: 2vh; bottom: 3vh; border-radius: 16px; overflow: hidden; background: #141415; z-index: ' + (i + 1) + '; clip-path: inset(' + r((1 - e) * 100) + '% 0 0 0 round 16px); filter: brightness(' + r(1 - nx * 0.55) + ');';
      svv['stM' + i] = 'transform: scale(' + r(1.14 - 0.14 * e) + ');';
      svv['stT' + i] = 'margin: 0; font-size: clamp(52px, 6.4vw, 124px); line-height: .92; font-weight: 500; letter-spacing: -.05em; white-space: nowrap; transform: translateY(' + r((1 - late) * 40) + 'px); opacity: ' + r(late) + ';';
      svv['stB' + i] = 'position: absolute; left: 2.8vw; right: 2.8vw; bottom: 3.6vh; display: flex; flex-direction: column; gap: 2.6vh; opacity: ' + r(late) + '; transform: translateY(' + r((1 - late) * 16) + 'px);';
    });
    // Миссия: слова проявляются по прокрутке, как интро на главной
    var mp = this.state.mp || 0, MWN = 8;
    for (var wi = 0; wi < MWN; wi++) svv['mw' + wi] = 'opacity: ' + r(0.16 + 0.84 * clamp(mp * MWN * 1.15 - wi)) + ';';
    svv.mEy = 'opacity: ' + r(clamp(mp * 3)) + ';';
    var mb = clamp((mp - 0.85) / 0.15);
    svv.mBtn = 'opacity: ' + r(mb) + '; transform: translateY(' + r((1 - mb) * 16) + 'px);';
    // FAQ: аккордеон, первый вопрос открыт
    var fq = this.state.fq === undefined ? 0 : this.state.fq, selfQ = this;
    for (var qi = 0; qi < 6; qi++) (function (i) {
      var on = fq === i;
      svv['fqSel' + i] = on ? 'true' : 'false';
      svv['fqPick' + i] = function () { var cur = selfQ.state.fq === undefined ? 0 : selfQ.state.fq; selfQ.setState({ fq: cur === i ? -1 : i }); };
      svv['fqIco' + i] = 'width: 44px; height: 44px; border-radius: 4px; border: 1px solid ' + (on ? '#F4F3EF' : 'rgba(244,243,239,.4)') + '; display: flex; align-items: center; justify-content: center; justify-self: end; transition: border-color .25s;';
      svv['fqIcoS' + i] = 'display: block; transform: rotate(' + (on ? 45 : 0) + 'deg); transition: transform .35s cubic-bezier(.2,.7,0,1);';
      svv['fqWrap' + i] = 'display: grid; grid-template-rows: ' + (on ? '1fr' : '0fr') + '; opacity: ' + (on ? 1 : 0) + '; transition: grid-template-rows .5s cubic-bezier(.2,.7,0,1), opacity .35s;';
    })(qi);
    // Кросс-продажи: карточки проявляются по очереди
    var xp = this.state.xp || 0;
    for (var xi = 0; xi < 5; xi++) { var xe = ease(clamp(xp * 1.6 - xi * 0.14)); svv['xsC' + xi] = ['grid-column: 1 / span 7; grid-row: 1 / span 2;', 'grid-column: 8 / span 5; grid-row: 1;', 'grid-column: 8 / span 5; grid-row: 2;', 'grid-column: 1 / span 7; grid-row: 3;', 'grid-column: 8 / span 5; grid-row: 3;'][xi] + ' opacity: ' + r(xe) + '; transform: translateY(' + r((1 - xe) * 36) + 'px);'; }
    // «О предприятии» — сцена: фото на весь экран сжимается влево, справа выезжают карточки
    var asp = this.state.asp || 0, ae = ease(clamp(asp / 0.32));
    var akA = (this.state.asks || '').split(',').map(Number);
    svv.asPanel = 'position: absolute; left: 0; top: 2.4vh; bottom: 3vh; width: calc(' + r(50 + 50 * (1 - ae)) + '% - ' + r(8 * ae) + 'px); border-radius: ' + r(6 + 10 * ae) + 'px; overflow: hidden; background: #141415; pointer-events: auto;';
    svv.asPhoto = 'transform: scale(' + r(1.08 - 0.08 * ae) + '); transform-origin: 50% 50%;';
    svv.asH = 'margin: 0; font-size: ' + r(6.6 - 3.1 * ae) + 'vw; line-height: .96; font-weight: 500; letter-spacing: -.045em; max-width: ' + r(17 + 1 * ae) + 'ch;';
    svv.asLead = 'margin: 0; font-size: clamp(16px, 1.25vw, 20px); line-height: 1.5; color: rgba(244,243,239,.78); max-width: 44ch; opacity: ' + r(clamp((ae - 0.6) / 0.4)) + '; transform: translateY(' + r((1 - clamp((ae - 0.6) / 0.4)) * 16) + 'px);';
    for (var ak = 0; ak < 3; ak++) { var kq = ease(clamp((asp - 0.36 - ak * 0.16) / 0.16)); svv['asK' + ak] = 'opacity: ' + r(kq) + '; transform: translateY(' + r((1 - kq) * 40) + 'px);'; }
    svv.abScene = true;
    // Импортозамещение: табло / таблица / карточки
    var imp = this.props.imp || 'Табло на скролле';
    svv.impA = imp === 'Табло на скролле'; svv.impB = imp === 'Таблица замен'; svv.impC = imp === 'Карточки «было → стало»';
    var IN = 5, ipp = this.state.ipp || 0, iAct = Math.min(IN - 1, Math.floor(ipp * IN * 0.999));
    var iLoc = clamp(ipp * IN - iAct);
    svv.ipNum = '0' + (iAct + 1);
    svv.ipRL = 'height: 100%; transform: translateY(' + (-iAct * 100) + '%); transition: transform .7s cubic-bezier(.7,0,.2,1);';
    svv.ipRR = 'height: 100%; transform: translateY(' + (-iAct * 100) + '%); transition: transform .7s cubic-bezier(.7,0,.2,1) .18s;';
    svv.ipArr = 'color: #F19E65; display: flex; transform: translateX(' + r(ease(clamp(iLoc / 0.3)) * 10 - 5) + 'px);';
    var itA = (this.state.itrs || '').split(',').map(Number), icp = this.state.icp || 0;
    for (var ii = 0; ii < IN; ii++) {
      var strike = ii < iAct ? 1 : (ii === iAct ? ease(clamp((iLoc - 0.15) / 0.35)) : 0);
      svv['ipS' + ii] = 'position: absolute; left: -2%; right: -2%; top: 54%; height: 3px; background: #F4F3EF; opacity: .7; transform-origin: left; transform: scaleX(' + r(strike) + ');';
      svv['ipB' + ii] = 'position: absolute; inset: 0; background: #F4F3EF; transform-origin: left; transform: scaleX(' + r(clamp(ipp * IN - ii)) + ');';
      var tq = itA[ii] || 0;
      svv['itS' + ii] = 'position: absolute; left: -2%; right: -2%; top: 54%; height: 2px; background: rgba(244,243,239,.75); transform-origin: left; transform: scaleX(' + r(ease(clamp(tq / 0.5))) + ');';
      svv['itA' + ii] = 'color: #F19E65; display: flex; opacity: ' + r(clamp((tq - 0.35) / 0.3)) + '; transform: translateX(' + r((1 - ease(clamp((tq - 0.35) / 0.4))) * -20) + 'px);';
      svv['itE' + ii] = 'display: flex; flex-direction: column; gap: 6px; opacity: ' + r(clamp((tq - 0.5) / 0.5)) + '; transform: translateY(' + r((1 - ease(clamp((tq - 0.5) / 0.5))) * 16) + 'px);';
      var ce = ease(clamp(icp * 1.6 - ii * 0.15));
      svv['icC' + ii] = 'display: flex; flex-direction: column; border: 1px solid #2C2C2E; border-radius: 12px; background: #121213; overflow: hidden; opacity: ' + r(ce) + '; transform: translateY(' + r((1 - ce) * 30) + 'px);';
    }
    // Первый экран «Кволити+»: этапы сертификации идут вместе с печатью
    var qh = this.state.hp || 0, qShow = clamp((qh - 0.12) / 0.08), qk = clamp((qh - 0.16) / 0.6) * 6, qd = clamp((qh - 0.8) / 0.08);
    svv.qStg = 'position: absolute; left: 4vw; top: 50%; transform: translateY(calc(-50% + ' + r((1 - qShow) * 30) + 'px)); width: min(40vw, 560px); display: flex; flex-direction: column; gap: 0; z-index: 2; opacity: ' + r(qShow) + '; pointer-events: none;';
    for (var qi2 = 0; qi2 < 6; qi2++) {
      var qa = clamp(qk - qi2), qon = qk >= qi2 && qk < qi2 + 1 && qd < 0.5;
      svv['qs' + qi2] = 'display: flex; align-items: baseline; gap: 14px; padding: 1.5vh 0; border-top: 1px solid ' + (qon ? 'rgba(244,243,239,.7)' : 'rgba(244,243,239,.14)') + '; opacity: ' + r((0.28 + 0.72 * qa) * (1 - qd * 0.55)) + '; transition: border-color .3s;';
      svv['qsT' + qi2] = 'font-size: ' + (qon ? 'clamp(26px, 2.4vw, 40px)' : 'clamp(18px, 1.5vw, 24px)') + '; font-weight: 500; letter-spacing: -.02em; transition: font-size .35s cubic-bezier(.2,.7,0,1); color: ' + (qa >= 1 && !qon ? 'rgba(244,243,239,.75)' : '#F4F3EF') + ';';
    }
    svv.qDone = 'display: flex; align-items: center; gap: 18px; margin-top: 3vh; opacity: ' + r(qd) + '; transform: translateY(' + r((1 - qd) * 20) + 'px);';
    // Кейсы: переключение по ячейкам предприятий
    var CS = [
      { name: 'Металлургический комбинат', ind: 'Металлургия · Урал', tag: 'Импортозамещение', title: 'Заменили импортные термопары в сталеплавильной печи',
        task: 'Европейский поставщик прекратил отгрузки, запас термопар для дуговой печи заканчивался. Рабочая температура — до +1700 °C.',
        sol: 'Подобрали отечественный аналог с совместимыми размерами и защитной арматурой — установили без переделки узлов.',
        res: 'Печь работает без простоев, ресурс термопар не ниже импортных.',
        m1: '6 недель', m1t: 'от заявки до поставки', m2: '+1700 °C', m2t: 'рабочая температура' },
      { name: 'Производитель технических газов', ind: 'Химия и газы', tag: 'Индивидуальная разработка', title: 'Спроектировали датчик для жидкого азота',
        task: 'Нужен контроль температуры в криогенной ёмкости при −196 °C. Серийные датчики давали погрешность на низких температурах.',
        sol: 'КБ разработало датчик под криогенную среду, испытания прошли в собственной лаборатории.',
        res: 'Стабильные показания во всём рабочем диапазоне, датчик перешёл в серийную поставку.',
        m1: '±0,5 °C', m1t: 'погрешность при −196 °C', m2: '−196 °C', m2t: 'рабочая температура' },
      { name: 'Машиностроительный завод', ind: 'Машиностроение', tag: 'Метрологическое оборудование', title: 'Перенесли поверку датчиков на площадку заказчика',
        task: '800 датчиков в год приходилось возить на поверку в сторонний центр — линия простаивала.',
        sol: 'Поставили комплект поверочного оборудования: калибратор, термостат, эталонный термометр. Обучили метрологов завода.',
        res: 'Поверка проходит на месте, без вывоза датчиков и простоя линии.',
        m1: '2 дня', m1t: 'вместо 3 недель на поверку', m2: '800', m2t: 'датчиков в год поверяют на месте' }
    ];
    var cs = this.state.cs || 0, selfK = this;
    CS.forEach(function (c, i) {
      var on = cs === i;
      svv['csName' + i] = c.name; svv['csInd' + i] = c.ind; svv['csSel' + i] = on ? 'true' : 'false';
      svv['csPick' + i] = function () { if ((selfK.state.cs || 0) !== i) selfK.setState({ cs: i }); };
      svv['csC' + i] = 'position: relative; min-height: clamp(120px, 15vh, 170px); display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; gap: 8px; padding: 22px 70px 22px 24px; border: 0; border-right: 1px solid #2C2C2E; border-bottom: 1px solid #2C2C2E; background: ' + (on ? 'rgba(244,243,239,.06)' : 'transparent') + '; color: #F4F3EF; font-family: inherit; cursor: pointer; opacity: ' + (on ? 1 : 0.6) + '; transition: background .3s, opacity .3s;';
      svv['csQ' + i] = 'position: absolute; right: 14px; top: 14px; width: 26px; height: 26px; border-radius: 3px; display: flex; align-items: center; justify-content: center; transition: background .3s, color .3s; ' + (on ? 'background: #F4F3EF; color: #0D0D0E;' : 'border: 1px solid rgba(244,243,239,.45); color: #F4F3EF;');
      svv['csL' + i] = 'position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: #F4F3EF; transform-origin: left; transform: scaleX(' + (on ? 1 : 0) + '); transition: transform .4s cubic-bezier(.2,.7,0,1);';
      svv['csI' + i] = 'opacity: ' + (on ? 1 : 0) + '; transform: scale(' + (on ? 1 : 1.04) + '); transition: opacity .6s ease, transform 1.2s cubic-bezier(.2,.7,0,1);';
    });
    var cc = CS[cs];
    svv.csTag = cc.tag; svv.csIndT = cc.ind; svv.csTitle = cc.title; svv.csTask = cc.task; svv.csSol = cc.sol; svv.csRes = cc.res;
    svv.csM1 = cc.m1; svv.csM1t = cc.m1t; svv.csM2 = cc.m2; svv.csM2t = cc.m2t;
    svv.csBody = 'display: flex; flex-direction: column; gap: 2.6vh;';
    // «Почему выбирают»: варианты
    var why = 'Крупно по одному';
    svv.whyList = why === 'Список на скролле'; svv.whyKin = why === 'Крупно по одному'; svv.whyPain = why === 'Задача → решение'; svv.whyBento = why === 'Бенто со счётчиками'; svv.whyOrig = why === 'Колонки (исходный)';
    var wl = this.state.wl || 0, wAct = Math.min(3, Math.floor(wl * 4 * 0.999 + 0.0001));
    var wk = this.state.wk || 0, kAct = Math.min(4, Math.floor(wk * 5 * 0.999));
    var wrA = (this.state.wrs || '').split(',').map(Number), wb = this.state.wb || 0;
    [0, 1, 2, 3, 4].forEach(function (i) {
      var on = wAct === i;
      svv['wyF' + i] = 'position: absolute; left: 0; bottom: 0; opacity: ' + (on ? 1 : 0) + '; transform: translateY(' + (on ? 0 : (i < wAct ? -24 : 24)) + 'px); transition: opacity .45s ease, transform .6s cubic-bezier(.2,.7,0,1);';
      svv['wyR' + i] = 'display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 12px; padding: 3.2vh 0; border-top: 1px solid ' + (on ? 'rgba(244,243,239,.7)' : '#2C2C2E') + '; opacity: ' + (on ? 1 : (i < wAct ? 0.35 : 0.22)) + '; transition: opacity .4s, border-color .4s;';
      svv['wyD' + i] = 'display: block; font-size: 17px; line-height: 1.5; color: rgba(244,243,239,.72); max-width: 50ch; max-height: ' + (on ? '90px' : '0') + '; margin-top: ' + (on ? '14px' : '0') + '; overflow: hidden; transition: max-height .5s cubic-bezier(.2,.7,0,1), margin-top .5s;';
      // крупно по одному: локальный прогресс сегмента
      var lp = wk * 5 - i, inn = ease(clamp(lp / 0.28)), outp = i === 4 ? 0 : ease(clamp((lp - 0.78) / 0.22));
      var op = i === 0 ? 1 - outp : inn * (1 - outp);
      svv['wkS' + i] = 'position: absolute; left: 0; right: 0; top: 50%; transform: translateY(calc(-50% + ' + r((1 - inn) * 60 - outp * 60) + 'px)); opacity: ' + r(i === 0 && wk === 0 ? 1 : op) + ';';
      svv['wkB' + i] = 'position: absolute; inset: 0; background: #F4F3EF; transform-origin: left; transform: scaleX(' + r(clamp(lp)) + ');';
      // задача → решение
      var q = wrA[i] || 0, qe = ease(q);
      svv['wpR' + i] = 'display: grid; grid-template-columns: minmax(0, 5fr) 80px minmax(0, 7fr); gap: 0 2vw; align-items: start; padding: 4.4vh 0; border-top: 1px solid #2C2C2E;';
      svv['wpA' + i] = 'color: #F19E65; padding-top: .5em; opacity: ' + r(clamp((q - 0.3) / 0.4)) + '; transform: translateX(' + r((1 - clamp((q - 0.3) / 0.7)) * -24) + 'px);';
      svv['wpS' + i] = 'display: flex; flex-direction: column; gap: 14px; opacity: ' + r(clamp((q - 0.45) / 0.55)) + '; transform: translateY(' + r((1 - ease(clamp((q - 0.45) / 0.55))) * 24) + 'px);';
    });
    svv.wkNum = '0' + (kAct + 1);
    var tl = 'border: 1px solid #2C2C2E; border-radius: 12px; padding: 30px; display: flex; flex-direction: column; justify-content: space-between; gap: 5vh; background: #111112;';
    for (var ti = 0; ti < 5; ti++) { var te = ease(clamp(wb * 1.6 - ti * 0.12)); svv['wbT' + ti] = 'grid-column: ' + ['1 / span 7; min-height: 46vh', '8 / span 5', '1 / span 4', '5 / span 4', '9 / span 4'][ti] + '; ' + tl + ' opacity: ' + r(te) + '; transform: translateY(' + r((1 - te) * 30) + 'px);'; }
    var cnt = ease(clamp((wb - 0.1) / 0.8));
    svv.wbN0 = Math.round(1000 * cnt) + (cnt > 0.999 ? '+' : '');
    svv.wbN1 = Math.round(20 * cnt) + (cnt > 0.999 ? '+' : '');
    // «О предприятии»: фото + список, лента
    var abSel = this.state.abSel, selfA = this, UN = ['01 · Конструкторское бюро', '02 · Лаборатория микроэлектроники', '03 · Гальванический цех', '04 · Поверочная лаборатория'];
    [0, 1, 2, 3].forEach(function (i) {
      var on = abSel === i;
      svv['abF' + i] = 'opacity: ' + (on ? 1 : 0) + '; transform: scale(' + (on ? 1 : 1.04) + '); transition: opacity .6s ease, transform 1.2s cubic-bezier(.2,.7,0,1);';
      svv['abPick' + i] = function () { if (selfA.state.abSel !== i) selfA.setState({ abSel: i }); };
      svv['abR' + i] = 'width: 100%; display: grid; grid-template-columns: 56px minmax(0, 1fr); align-items: start; gap: 12px; padding: 2vh 0; background: transparent; border: 0; border-top: 1px solid ' + (on ? 'rgba(244,243,239,.6)' : '#2C2C2E') + '; color: #F4F3EF; font-family: inherit; text-align: left; cursor: pointer; opacity: ' + (on ? 1 : 0.45) + '; transition: opacity .3s, border-color .3s;';
      svv['abD' + i] = 'font-size: 16px; line-height: 1.45; color: rgba(244,243,239,.7); max-height: ' + (on ? '60px' : '0') + '; overflow: hidden; transition: max-height .45s cubic-bezier(.2,.7,0,1);';
    });
    svv.abCap = UN[abSel] || '';
    var rp = this.state.rp || 0;
    svv.abTrack = 'display: flex; align-items: stretch; gap: 2vw; height: 72vh; padding-left: 4vw; transform: translateX(' + r(-ease(rp) * 130) + 'vw); will-change: transform;';
    svv.svTabs = sv === 'Вкладки'; svv.svAcc = sv === 'Аккордеон'; svv.svCols = sv === 'Три колонки'; svv.svRows = sv === 'Строки (исходный)';
    var ab = this.props.about || 'Мозаика';
    var hp = this.state.hp, m = ease(clamp(hp / 0.22));
    // Время видео (8 с) → температура: иней до 4,5 с (−196…0), чистый металл до 5,7 с (0…+525), свечение до конца (+525…+1700)
    var vt = clamp((hp - 0.2) / 0.72) * 8;
    var T = vt < 4.5 ? -196 + 196 * (1 - Math.pow(1 - vt / 4.5, 2)) : (vt < 5.7 ? 525 * (vt - 4.5) / 1.2 : 525 + 1175 * clamp((vt - 5.7) / 2.3));
    T = Math.round(T);
    var tempTxt = (T > 0 ? '+' : (T < 0 ? '−' : '')) + Math.abs(T);
    var zoneTxt = T < -100 ? 'Криогенные температуры: жидкий азот, криостаты' : (T < 150 ? 'Нормальные и технологические условия' : (T < 525 ? 'Нагрев: металл ещё не светится' : 'Высокие температуры: печи, металлургия, энергетика'));
    function X(t) { return t <= 0 ? 40 + (t + 200) / 200 * 0.22 * 920 : 40 + 0.22 * 920 + t / 2500 * 0.78 * 920; }
    var scW = r(Math.max(0, X(T) - X(-196)));
    var scMk = 'transform: translateX(' + r(X(T)) + 'px);';
    var vWrap = 'position: absolute; left: 0; right: 0; top: 50%; transform: translate(' + r((1 - m) * 17) + 'vw, calc(-50% + ' + r(m * 4) + 'vh)) scale(' + r(0.58 + 0.42 * m) + '); transform-origin: center; -webkit-mask-image: radial-gradient(ellipse 72% 72% at 50% 50%, #000 62%, transparent 100%); mask-image: radial-gradient(ellipse 72% 72% at 50% 50%, #000 62%, transparent 100%);';
    var out = clamp(hp / 0.14);
    var heroTxt = 'position: absolute; left: 4vw; top: 4vh; width: 46vw; display: flex; flex-direction: column; gap: 2.2vh; z-index: 2; opacity: ' + r(1 - out) + '; transform: translateY(' + r(-out * 50) + 'px); pointer-events: ' + (hp < 0.1 ? 'auto' : 'none') + ';';
    var show = clamp((hp - 0.14) / 0.08);
    var rdStyle = 'position: absolute; left: 4vw; top: 4vh; display: flex; flex-direction: column; gap: 10px; z-index: 2; opacity: ' + r(show) + '; transform: translateY(' + r((1 - show) * 30) + 'px); pointer-events: none;';
    var scStyle = 'position: absolute; left: 4vw; right: 4vw; bottom: 3vh; z-index: 2; opacity: ' + r(show) + ';';
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
    return Object.assign(formVals, svv, { ctaA: true, ctaB: false, ctaC: false, abSplit: ab === 'Фото + список', abReel: ab === 'Лента', abBento: ab === 'Мозаика', abChain: ab === 'Цепочка производства', abPhoto: ab === 'Фото-плитки', abList: ab === 'Крупный список', abTiles: ab === 'Плитки (исходный)', vWrap: vWrap, heroTxt: heroTxt, rdStyle: rdStyle, scStyle: scStyle, tempTxt: tempTxt, zoneTxt: zoneTxt, scW: scW, scMk: scMk });
  }
}

export default Component;
