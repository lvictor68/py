const topics=[
['01','Язык',[['home','Обзор и быстрый старт'],['types','Типы, коллекции и копирование'],['functions','Функции и область видимости'],['oop','Классы, MRO и dataclass'],['errors','Исключения и with']]],
['02','Поток выполнения',[['iterators','Итераторы и генераторы'],['decorators','Декораторы и замыкания'],['async','asyncio и конкурентность'],['typing','Типизация и протоколы']]],
['03','Стандартная библиотека',[['stdlib','Часто используемые модули'],['collections','collections'],['datetime','datetime'],['json','json · pathlib · re'],['testing','unittest · logging']]],
['04','Расширенные модули',[['django','Django'],['fastapi','FastAPI'],['sqlalchemy','SQLAlchemy'],['pytest','pytest']]]
];
const code=s=>`<div class="code-block"><div class="code-head"><span>python</span><button class="copy">копировать</button></div><pre>${s.replaceAll('&','&amp;').replaceAll('<','&lt;')}</pre></div>`;
const pages={
types:{title:'Типы, коллекции и копирование',intro:'Как выбирать контейнеры, избегать изменяемых значений по умолчанию и понимать разницу между ссылкой, shallow и deep copy.',sections:[['Контейнеры в одном экране',`<dl class="definition"><dt>list</dt><dd>Упорядоченная изменяемая последовательность. Хороша для накопления и обхода элементов.</dd><dt>tuple</dt><dd>Неизменяемая последовательность; подходит для записей, ключей словаря и возврата нескольких значений.</dd><dt>dict</dt><dd>Отображение «ключ → значение» с сохранением порядка вставки. Поиск по ключу амортизированно <code>O(1)</code>.</dd><dt>set</dt><dd>Уникальные хешируемые значения. Быстрые проверки принадлежности и операции множеств.</dd></dl>`],['Ссылки и копирование',`<p>Присваивание не копирует объект: обе переменные указывают на одну область памяти. <code>copy.copy()</code> копирует только внешний контейнер, <code>copy.deepcopy()</code> — всю вложенную структуру.</p>${code(`from copy import copy, deepcopy
original = [[1], [2]]
shallow = copy(original)
deep = deepcopy(original)
original[0].append(99)
print(shallow)  # [[1, 99], [2]]
print(deep)     # [[1], [2]]`)} `],['Практическое правило',`<div class="callout">Не используйте список или словарь в значении параметра по умолчанию. Создавайте его внутри функции через <code>None</code>.</div>${code(`def add_tag(tag, tags=None):
    if tags is None:
        tags = []
    tags.append(tag)
    return tags`)}`]]},
functions:{title:'Функции и область видимости',intro:'Функция — объект первого класса. Разберём параметры, распаковку, LEGB и замыкания — базу для читаемого API.',sections:[['Параметры',`<p>Используйте позиционные-only (<code>/</code>) для внутреннего API, keyword-only (<code>*</code>) для ясности вызова. <code>*args</code> собирает лишние позиционные, <code>**kwargs</code> — именованные аргументы.</p>${code(`def connect(host, /, port=5432, *, timeout=5):
    return f"{host}:{port}; timeout={timeout}"
connect('db.local', timeout=3)`)}`],['LEGB и замыкание',`<p>Имена ищутся в порядке Local → Enclosing → Global → Built-in. Замыкание хранит ссылки на значения из внешней функции.</p>${code(`def make_multiplier(factor):
    def multiply(value):
        return value * factor
    return multiply
triple = make_multiplier(3)
print(triple(7))  # 21`)}`]]},
iterators:{title:'Итераторы и генераторы',intro:'Итерация — протокол: итерируемый объект отдаёт итератор через <code>iter()</code>, а тот возвращает элементы через <code>next()</code>.',sections:[['Протокол итератора',`<p>Генераторная функция создаёт ленивый итератор. Код выполняется лишь по мере запроса значений, поэтому генераторы удобны для больших потоков данных.</p>${code(`def read_chunks(stream, size=4096):
    while chunk := stream.read(size):
        yield chunk
squares = (n * n for n in range(1_000_000))
print(next(squares))  # 0`)}`],['Когда применять',`<ul><li>Генератор — когда не нужно хранить все результаты в памяти.</li><li>Список — когда потребуется повторный обход или индексирование.</li><li><code>itertools</code> — для композиции потоков без промежуточных контейнеров.</li></ul>`]]},
decorators:{title:'Декораторы и замыкания',intro:'Декоратор принимает вызываемый объект и возвращает другой. Обычно он добавляет логирование, кэширование или проверку доступа.',sections:[['Рабочий декоратор',`<p>Всегда используйте <code>functools.wraps</code>: он сохраняет имя, документацию и другие метаданные исходной функции.</p>${code(`from functools import wraps
def logged(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"→ {func.__name__}")
        return func(*args, **kwargs)
    return wrapper
@logged
def total(a, b): return a + b`)}`],['С декоратором-параметром',`<p>Если нужны настройки, добавьте ещё один уровень функции: <code>retry(times)</code> возвращает сам декоратор.</p>`]]},
oop:{title:'Классы, MRO и dataclass',intro:'Классы объединяют состояние и поведение. Для простых объектов-данных выбирайте <code>dataclass</code>, а не ручной boilerplate.',sections:[['dataclass',code(`from dataclasses import dataclass, field
@dataclass(frozen=True)
class User:
    name: str
    roles: set[str] = field(default_factory=set)
    def is_admin(self) -> bool:
        return 'admin' in self.roles`)],['MRO: порядок поиска методов',`<p>При множественном наследовании Python использует C3-линеаризацию. Проверьте порядок через <code>Class.mro()</code>. В кооперативных классах вызывайте <code>super()</code>.</p>`]]},
errors:{title:'Исключения и контекстные менеджеры',intro:'Исключения отделяют обработку ошибок от обычного потока. Контекстные менеджеры гарантируют освобождение ресурса.',sections:[['Точная обработка',code(`try:
    user = users[user_id]
except KeyError as error:
    raise LookupError(f"Пользователь {user_id} не найден") from error
else:
    audit(user)
finally:
    metrics.increment('lookup')`)],['Контекстный менеджер',`<p><code>with</code> вызывает <code>__enter__</code> и гарантированно вызовет <code>__exit__</code>, даже при ошибке. Для собственных менеджеров используйте <code>contextlib.contextmanager</code>.</p>`]]},
async:{title:'asyncio и конкурентность',intro:'Асинхронность эффективна для ожидания I/O. Один event loop переключает корутины в точках <code>await</code>, не ускоряя CPU-bound расчёты.',sections:[['Параллельное ожидание',code(`import asyncio
async def fetch_all(urls):
    tasks = [fetch(url) for url in urls]
    return await asyncio.gather(*tasks)
# asyncio.run(fetch_all(urls))`)],['Выбор инструмента',`<ul><li><b>asyncio</b> — много I/O-задач с async-совместимыми библиотеками.</li><li><b>threading</b> — блокирующее I/O и интеграция со старым кодом.</li><li><b>multiprocessing</b> — CPU-bound задачи, обход GIL.</li></ul>`]]},
typing:{title:'Типизация и протоколы',intro:'Аннотации позволяют статическим анализаторам найти ошибки до запуска. В рантайме они не валидируют значения сами по себе.',sections:[['Современный синтаксис',code(`from collections.abc import Iterable
from typing import Protocol
def unique_names(users: Iterable[User]) -> set[str]:
    return {user.name for user in users}
class HasId(Protocol):
    id: int`)],['Практика',`<p>Типизируйте публичные функции и границы модулей. Для объединений используйте <code>str | None</code>, для коллекций — встроенные <code>list[str]</code> и <code>dict[str, int]</code>.</p>`]]}
};
function home(){return {title:'Шпаргалка Python',intro:'Структурированная карта языка для middle-разработчика: от модели объектов до конкурентности и стандартной библиотеки.',sections:[['Как пользоваться',`<div class="hero-note"><strong>01</strong><div>Начните с основы, переходите в тему из дерева и используйте примеры как маленькие исполняемые эксперименты. У каждой страницы — краткая суть и минимально необходимая база.</div></div><div class="grid">${[['types','Типы и коллекции','Выбор контейнера, ссылки и копирование'],['functions','Функции','Параметры, scope и замыкания'],['iterators','Поток данных','Итераторы и генераторы'],['decorators','Обёртки','Декораторы без магии'],['async','Конкурентность','asyncio, threads, processes'],['typing','Типы','Аннотации и Protocol']].map(x=>`<a class="topic-card" href="#${x[0]}"><small>ОТКРЫТЬ →</small><h3>${x[1]}</h3><p>${x[2]}</p></a>`).join('')}</div>`],['Встроенные функции: ежедневный набор',`<dl class="definition"><dt>len · range</dt><dd>Размер контейнера и ленивый диапазон чисел.</dd><dt>enumerate</dt><dd>Индекс и значение при обходе: <code>for i, item in enumerate(items)</code>.</dd><dt>zip</dt><dd>Собирает несколько итерируемых объектов поэлементно.</dd><dt>any · all</dt><dd>Проверяют, есть ли хотя бы одно / все истинные значения.</dd><dt>sorted</dt><dd>Возвращает новый список; используйте <code>key=</code> для своего порядка.</dd><dt>isinstance</dt><dd>Проверка типа с поддержкой кортежа допустимых типов.</dd></dl>`],['Стандартная библиотека',`<div class="module-list">${['collections','datetime','json','pathlib','re','functools','itertools','logging','unittest','contextlib'].map(x=>`<a href="#stdlib">${x}</a>`).join('')}</div>`],['Мини-памятка по выбору',`<ul><li>Нужны уникальные элементы → <code>set</code>.</li><li>Нужна очередь → <code>collections.deque</code>.</li><li>Нужен объект-данные → <code>@dataclass</code>.</li><li>Нужно временно открыть ресурс → <code>with</code>.</li><li>Нужно параллельно ждать сеть → <code>asyncio</code>.</li></ul>`]]}};
function stdlib(){return {title:'Стандартная библиотека',intro:'Модули, которые уже установлены вместе с Python. Освойте их до подключения внешней зависимости.',sections:[['Рабочий набор',`<dl class="definition"><dt>pathlib</dt><dd>Объектный API путей: <code>Path('data') / 'users.json'</code>.</dd><dt>collections</dt><dd><code>Counter</code>, <code>defaultdict</code>, <code>deque</code>, <code>ChainMap</code>.</dd><dt>functools</dt><dd><code>cache</code>, <code>partial</code>, <code>wraps</code>, <code>reduce</code>.</dd><dt>itertools</dt><dd>Комбинаторы итераторов: <code>chain</code>, <code>islice</code>, <code>groupby</code>.</dd><dt>contextlib</dt><dd>Инструменты для создания и композиции контекстных менеджеров.</dd></dl>`],['Пример: путь и JSON',code(`from pathlib import Path
import json
path = Path('settings.json')
settings = json.loads(path.read_text(encoding='utf-8'))
path.with_suffix('.bak').write_text(
    json.dumps(settings, ensure_ascii=False, indent=2),
    encoding='utf-8',
)`)]]}};
function getPage(id){if(['home','quick','practice'].includes(id))return home();if(['stdlib','collections','datetime','json','testing'].includes(id))return stdlib();return pages[id]}
function render(){const id=location.hash.slice(1)||'home',data=getPage(id),tree=document.querySelector('#tree');tree.innerHTML=topics.map(t=>`<section class="tree-section"><div class="tree-title"><b>${t[0]}</b>${t[1]}</div>${t[2].map(x=>`<a class="${x[0]===id?'active':''} ${!getPage(x[0])?'stub-link':''}" href="#${x[0]}">${x[1]}${!getPage(x[0])?' · скоро':''}</a>`).join('')}</section>`).join('');
let html;if(!data){const name=topics.flatMap(t=>t[2]).find(x=>x[0]===id)?.[1]||'Тема';html=`<div class="crumbs"><a href="#home">PY / CORE</a><span>/</span> Расширенные модули</div><p class="eyebrow">РАСШИРЕНИЕ</p><h1 class="page-title">${name}</h1><div class="placeholder"><strong>Раздел в разработке</strong><p>Здесь появятся краткая теория, рабочие примеры и связи с базовыми темами Python.</p></div>`}else{html=`<div class="crumbs"><a href="#home">PY / CORE</a><span>/</span>${id==='home'?'Содержание':data.title}</div><p class="eyebrow">${id==='home'?'КАРТА ЗНАНИЙ':'ОСНОВА ЯЗЫКА'}</p><h1 class="page-title">${data.title}</h1><p class="intro">${data.intro}</p>${data.sections.map((s,i)=>`<section class="section" id="s${i}"><h2>${s[0]}</h2>${s[1]}</section>`).join('')}<nav class="pager"><a href="#home">← к содержанию</a><a href="#${id==='home'?'types':'home'}">продолжить →</a></nav>`}document.querySelector('#content').innerHTML=html;document.querySelector('#outline-nav').innerHTML=[...document.querySelectorAll('.section h2')].map((h,i)=>`<a href="#s${i}">${h.textContent}</a>`).join('')||'<a href="#home">Содержание</a>';window.scrollTo({top:0});}
addEventListener('hashchange',render);render();
document.querySelector('.mobile-menu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
document.querySelector('#search').oninput=e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('.tree a').forEach(a=>a.style.display=a.textContent.toLowerCase().includes(q)?'block':'none')};
document.addEventListener('click',e=>{if(e.target.classList.contains('copy')){navigator.clipboard.writeText(e.target.closest('.code-block').querySelector('pre').innerText);const t=document.querySelector('#toast');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)}});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.querySelector('#search').focus()}});
