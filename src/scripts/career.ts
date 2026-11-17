import { careerIcons, vacancyIcon } from '../data/career-icons';
import { demoVacancies, stories, type Vacancy } from '../data/career';

const dialog = document.querySelector<HTMLDialogElement>('#career-dialog')!;
const openDialog = (title: string, text: string) => {
  document.querySelector('#career-dialog-title')!.textContent = title;
  document.querySelector('#career-dialog-text')!.textContent = text;
  dialog.showModal();
};
dialog.querySelectorAll('button').forEach(b => b.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });

const directionTabs = [...document.querySelectorAll<HTMLButtonElement>('[data-direction-tab]')];
function selectDirection(index: number, focus = false) {
  directionTabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')!)!.hidden = !selected;
  });
  if (focus) directionTabs[index].focus();
}
directionTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectDirection(index));
  tab.addEventListener('keydown', event => {
    let next: number;
    switch (event.key) {
      case 'ArrowRight': next = (index + 1) % directionTabs.length; break;
      case 'ArrowLeft': next = (index - 1 + directionTabs.length) % directionTabs.length; break;
      case 'Home': next = 0; break;
      case 'End': next = directionTabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    selectDirection(next, true);
  });
});
document.querySelectorAll<HTMLAnchorElement>('[data-select-direction]').forEach(a => a.addEventListener('click', () => {
  document.querySelector<HTMLSelectElement>('#resume-direction')!.value = a.dataset.selectDirection!;
}));
document.querySelectorAll<HTMLButtonElement>('[data-vacancy]').forEach(button => button.addEventListener('click', () => {
  const vacancy = demoVacancies.find(v => v.id === button.dataset.vacancy)!;
  openDialog(vacancy.title, 'Это пример вакансии для согласования дизайна. Должностные обязанности, условия и требования добавляются после получения данных HR. Реальные открытые позиции можно посмотреть по кнопке «Все вакансии на hh.ru».');
}));
document.querySelectorAll<HTMLButtonElement>('[data-story]').forEach(button => button.addEventListener('click', () => {
  const story = stories[Number(button.dataset.story)];
  openDialog(story.title, `${story.text} Это место для будущего интервью. Реальные имя, должность, история и фотография сотрудника пока не предоставлены.`);
}));
document.querySelector('[data-legal]')!.addEventListener('click', () => openDialog('Документы по обработке данных', 'Здесь будут ссылки на согласованные юридические документы: согласие на обработку персональных данных и политику их обработки. До подключения документов и обработчика форма работает только как макет.'));

// Серверный адаптер должен возвращать { vacancies: Vacancy[] }.
// В production демоданные никогда не используются как запасной источник.
const vacancySection = document.querySelector<HTMLElement>('#vacancies')!;
async function loadVacancies() {
  if (vacancySection.dataset.demo === 'true' || !vacancySection.dataset.endpoint) return;
  const notice = document.querySelector('#vacancy-notice')!;
  notice.textContent = 'Загружаем вакансии…';
  try {
    const response = await fetch(vacancySection.dataset.endpoint, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Vacancies unavailable');
    const data = await response.json();
    if (!Array.isArray(data.vacancies)) throw new Error('Invalid vacancies response');
    const items = data.vacancies.filter((v: Vacancy) => v && typeof v.title === 'string' && typeof v.city === 'string' && typeof v.direction === 'string' && typeof v.url === 'string' && /^https:\/\//.test(v.url)).slice(0, 3) as Vacancy[];
    const list = document.querySelector('#vacancy-list')!;
    list.replaceChildren();
    for (const v of items) {
      const row = document.createElement('article'); row.className = 'vacancy-card';
      const icon = document.createElement('span'); icon.className = 'vacancy-icon';
      icon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${careerIcons[vacancyIcon(v.direction)]}</svg>`;
      const top = document.createElement('div'); top.className = 'vacancy-card-top'; top.append(icon);
      const description = document.createElement('div'); description.className = 'vacancy-description';
      const title = document.createElement('h3'); title.textContent = v.title;
      const direction = document.createElement('p'); direction.textContent = v.direction;
      description.append(title, direction);
      const meta = document.createElement('div'); meta.className = 'vacancy-meta';
      for (const text of [v.city, v.format].filter(Boolean)) { const span = document.createElement('span'); span.textContent = text!; meta.append(span); }
      const link = document.createElement('a'); link.className = 'vacancy-more'; link.href = v.url!; link.textContent = 'Подробнее ↗'; link.target = '_blank'; link.rel = 'noopener noreferrer';
      row.append(top, description, meta, link); list.append(row);
    }
    document.querySelector<HTMLElement>('#vacancy-empty')!.hidden = items.length > 0;
    notice.textContent = items.length ? 'Позиции из подключённого источника вакансий.' : 'Актуальные предложения можно проверить на hh.ru.';
  } catch {
    document.querySelector('#vacancy-list')!.replaceChildren();
    document.querySelector<HTMLElement>('#vacancy-empty')!.hidden = false;
    notice.textContent = 'Не удалось обновить вакансии. Посмотри предложения на hh.ru.';
  }
}
void loadVacancies();

const form = document.querySelector<HTMLFormElement>('#career-resume')!;
const file = form.elements.namedItem('resume') as HTMLInputElement;
file.addEventListener('change', () => {
  document.querySelector('#resume-filename')!.textContent = file.files?.[0]?.name || 'PDF, DOC или DOCX · до 10 МБ';
});
function setError(name: string, message: string) {
  const input = form.elements.namedItem(name) as HTMLInputElement;
  input.setAttribute('aria-invalid', String(Boolean(message)));
  document.querySelector(`#error-${name}`)!.textContent = message;
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  const status = document.querySelector<HTMLElement>('#resume-status')!;
  status.textContent = '';
  const name = form.elements.namedItem('name') as HTMLInputElement;
  const phone = form.elements.namedItem('phone') as HTMLInputElement;
  const email = form.elements.namedItem('email') as HTMLInputElement;
  const direction = form.elements.namedItem('direction') as HTMLSelectElement;
  const consent = form.elements.namedItem('consent') as HTMLInputElement;
  const attachment = file.files?.[0];
  const errors: Record<string,string> = {
    name: name.value.trim().split(/\s+/).length >= 2 && name.value.trim().length >= 3 ? '' : 'Укажи имя и фамилию.',
    phone: /^[+\d\s()\-]+$/.test(phone.value) && phone.value.replace(/\D/g, '').length >= 10 && phone.value.replace(/\D/g, '').length <= 15 ? '' : 'Проверь номер телефона: от 10 до 15 цифр.',
    email: email.value && email.validity.valid ? '' : 'Укажи корректный адрес электронной почты.',
    direction: direction.value ? '' : 'Выбери интересующее направление.',
    resume: !attachment ? 'Прикрепи резюме.' : !/\.(pdf|doc|docx)$/i.test(attachment.name) ? 'Допустимы файлы PDF, DOC и DOCX.' : attachment.size > 10*1024*1024 ? 'Размер файла не должен превышать 10 МБ.' : '',
    consent: consent.checked ? '' : 'Отметь согласие для проверки формы.',
  };
  Object.entries(errors).forEach(([key,value]) => setError(key,value));
  if (Object.values(errors).some(Boolean)) { (form.querySelector('[aria-invalid="true"]') as HTMLElement)?.focus(); return; }
  // Деморежим: нет запроса и сообщения о якобы принятом резюме.
  if (!form.dataset.endpoint) { status.textContent = 'Форма заполнена корректно. Это демонстрация: резюме не отправлено. Для отклика перейди к вакансиям компании на hh.ru.'; return; }
  const button = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  button.disabled = true; button.textContent = 'Отправляем…'; form.setAttribute('aria-busy','true');
  try {
    const response = await fetch(form.dataset.endpoint, { method:'POST', body:new FormData(form), signal:AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error('Resume rejected');
    const result = await response.json();
    if (result.accepted !== true) throw new Error('No server confirmation');
    status.textContent = 'Резюме отправлено. Спасибо за интерес к нашей команде!'; form.reset(); document.querySelector('#resume-filename')!.textContent = 'PDF, DOC или DOCX · до 10 МБ';
  } catch { status.textContent = 'Не удалось отправить резюме. Попробуй ещё раз или откликнись на hh.ru.'; }
  finally { button.disabled=false; button.textContent='Отправить резюме ↗'; form.removeAttribute('aria-busy'); }
});
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('career-reveal'); observer.unobserve(entry.target); } }); }, { threshold:.12 });
  document.querySelectorAll('.section-heading,.federal-card,.growth-card,.story,.hiring-steps').forEach(el => observer.observe(el));
}
