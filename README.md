# <p align="center">WFRP4e - Looting</p>
<p align="center">
  <a href="https://foundryvtt.com/packages/wfrp4e-looting" rel="nofollow"><img src="https://img.shields.io/badge/WFRP4e%20--%20Looting-FoundryVTT-orange?labelColor=darkred" alt="FoundryVTT"></a>
  <a href="https://foundryvtt.com/" rel="nofollow"><img src="https://img.shields.io/badge/V13-Совместимо-darkgreen?labelColor=orange" alt="Совместимость"></a>
  <a href="https://github.com/nPocToI4eJI/wfrp4e-looting/releases" rel="nofollow"><img src="https://img.shields.io/github/v/release/nPocToI4eJI/wfrp4e-looting?display_name=release&label=%D0%92%D0%B5%D1%80%D1%81%D0%B8%D1%8F&labelColor=darkgreen" alt="Последняя версия"></a>
  <a href="https://github.com/nPocToI4eJI/wfrp4e-looting/releases/latest" rel="nofollow"><img src="https://img.shields.io/github/downloads/nPocToI4eJI/wfrp4e-looting/latest/wfrp4e-looting.zip?displayAssetName=false&label=%D0%A1%D0%BA%D0%B0%D1%87%D0%B8%D0%B2%D0%B0%D0%BD%D0%B8%D0%B9&labelColor=blue&color=darkgreen" alt="Скачивания"></a>
  <a href="https://github.com/nPocToI4eJI/wfrp4e-looting/releases" rel="nofollow"><img src="https://img.shields.io/github/downloads/nPocToI4eJI/wfrp4e-looting/wfrp4e-looting.zip?displayAssetName=false&label=%D0%92%D1%81%D0%B5%D0%B3%D0%BE&labelColor=darkgreen&color=darkred" alt="Скачиваний всего"></a>
</p>
<p align="center">
  <a href="https://discord.gg/tPrYvW7" rel="nofollow"><img src="https://img.shields.io/badge/Discord-black?logo=discord&logoColor=%235865F2" alt="Discord"></a>
  <a href="https://www.youtube.com/@nPocTo_4eJI" rel="nofollow"><img src="https://img.shields.io/badge/Youtube-black?logo=youtube&logoColor=%23FF0000" alt="Youtube"></a>
  <a href="https://boosty.to/npocto_4eji" rel="nofollow"><img src="https://img.shields.io/badge/Boosty-black?logo=boosty&logoColor=%23F15F2C" alt="Boosty"></a>
</p>

Этот модуль поможет Вам оптимизировать процесс создания уникального лута.
<br>
<details>
  <summary>Описание</summary>

## Содержание
- [Мародёрство](#Мародёрство)
  - [Взаимодействие](#Взаимодействие)
  - [Пользовательские шаблоны](#Пользовательские-шаблоны-Мародёрства)
- [Генератор Предметов](#Генератор-Предметов)
  - [Пользовательские шаблоны](#Пользовательские-шаблоны-Генератора)
  - [Скрипты Генератора Предметов](#Скрипты-Генератора-Предметов)
- [Настройки](#Настройки)
  - [Режим Отладки](#Режим-Отладки)
- [Планы](#Планы)

## Мародёрство

## Мародёрство
_Эта опция поможет Вам в создании лута по заранее заготовленным шаблонам._

Доступ к Мародёрству можно получить через вкладку **Заметки Журнала** (в левой верхней части экрана), кнопкой **Мародёрство**:
<p align="center"><img width="230" height="400" alt="Доступ к Мародёрству" src="https://github.com/user-attachments/assets/9f8b04a4-909d-4695-8b9b-8b961582b4d9"/></p>

###### <p align="center">Интерфейс</p>

<p align="center"><img width="550" height="300" alt="Интерфейс Мародёрства" src="https://github.com/user-attachments/assets/8abce67e-b87b-492e-994a-9f08d19c4d74"/></p>

При нажатии **ЛКМ** по шаблону, будет произведён бросок, результат которого отобразится в чате:
<p align="center"><img width="250" height="200" alt="Пример результата броска Мародёрства" src="https://github.com/user-attachments/assets/3d19a89e-6465-4fc6-9320-391dc4becbf3"/></p>

#### Взаимодействие
_С сообщением результата броска Мародёрства можно взаимодействовать следующими способами._

- **Забрать предмет**: при нажатии **ЛКМ** на название отдельного предмета произойдёт следующее:
  - Если у игрока, нажавшего на предмет, отсутствует связанный актёр, предмет будет выведен в чат.
  - Если при клике была зажата клавиша **Alt**, предмет будет выведен в чат.
  - Если у игрока, нажавшего на предмет, есть связанный актёр, предмет будет добавлен в его инвентарь.

- **Продать предмет**: при нажатии **ЛКМ** на монеты, находящиеся напротив отдельного предмета, если Мастер Игры включил настройку "Мародёрство. Быстрая продажа", произойдёт следующее:
  - Если у игрока, нажавшего на предмет, отсутствует связанный актёр, в чат будет выведено сообщение о выдаче монет, в количестве, равном стоимости предмета.
  - Если при клике была зажата клавиша **Alt**, в чат будет выведено сообщение о выдаче монет, в количестве, равном стоимости предмета.
  - Если у игрока, нажавшего на предмет, есть связанный актёр, монеты, в количестве, равном стоимости предмета, буду добавлены в его инвентарь.

_Обратите внимание, если Мастер Игры включил настройку "Мародёрство. Уменьшать стоимость предметов", то стоимость предмета, при быстрой продаже, будет уменьшена вдвое._

- **Забрать все предметы**: при нажатии **ЛКМ** на слово "Добыча", расположенною над списком предметов:
  - Если у игрока, нажавшего на предмет, отсутствует связанный актёр, все предметы будут выведены в чат.
  - Если при клике была зажата клавиша **Alt**, все предметы будут выведены в чат.
  - Если у игрока, нажавшего на предмет, есть связанный актёр, все предметы будут добавлены в его инвентарь.

- **Продать все предметы**: при нажатии **ЛКМ** на монеты, находящиеся под словом "Добыча", расположенным над списком предметов, если Мастер Игры включил настройку "Мародёрство. Быстрая продажа", произойдёт следующее:
  - Если у игрока, нажавшего на предмет, отсутствует связанный актёр, в чат будет выведено сообщение о выдаче монет, в количестве, равном стоимости всех предметов.
  - Если при клике была зажата клавиша **Alt**, в чат будет выведено сообщение о выдаче монет, в количестве, равном стоимости всех предметов.
  - Если у игрока, нажавшего на предмет, есть связанный актёр, монеты, в количестве, равном стоимости всех предметов, буду добавлены в его инвентарь.

_Обратите внимание, если Мастер Игры включил настройку "Мародёрство. Уменьшать стоимость предметов", то стоимость всех предметов, при быстрой продаже, будет уменьшена вдвое._

- **Монеты**: при нажатии **ЛКМ** на слово "Монеты", расположенною над списком предметов:
  - Если у игрока, нажавшего на предмет, отсутствует связанный актёр, в чат будет выведено сообщение о выдаче монет.
  - Если при клике была зажата клавиша **Alt**, в чат будет выведено сообщение о выдаче монет.
  - Если у игрока, нажавшего на предмет, есть связанный актёр, монеты буду добавлены в его инвентарь.

#### Пользовательские шаблоны Мародёрства
_Модуль поддерживает возможность создания и использования собственных шаблонов._

При нажатии **Alt + ЛКМ** по шаблону, откроются его параметры. Стандартные шаблоны можно только просматривать, а пользовательские - редактировать.\
При нажатии **Ctrl + ЛКМ** по шаблону, он будет скопирован как пользовательский.\
При нажатии на **+** будет создан новый пользовательский шаблон.

###### <p align="center">Пример окна стандартного шаблона</p>

<p align="center"><img width="1000" height="500" alt="Пример окна стандартного шаблона" src="https://github.com/user-attachments/assets/6f3ae36e-cabe-4b64-9a8e-3c5f47f82cab"/></p>

###### <p align="center">Пример окна пользовательского шаблона</p>

<p align="center"><img width="1000" height="500" alt="Пример окна пользовательского шаблона" src="https://github.com/user-attachments/assets/79c4e01e-5c72-40ab-9f93-394074a4e3bb"/></p>

- Статус: определяет, в каком типе монет будет указана стоимость предметов:
  - Медь: медный пенни.
  - Серебро: серебряный шиллинг.
  - Золото: золотая крона.
- Шанс: вероятность получения монет (пенни, шиллинг или крона) или предмета из таблицы в результате броска. Если шанс не срабатывает, предмет или монета не добавляется ни в каком количестве.
- Количество: определяет количество монет или предметов, если шанс сработает. Если на кубах d10, d20 или d100 выпадает максимальный результат, совершается дополнительный бросок количества.
- Таблицы: наборы предметов, которые могут быть добавлены в результате броска:
  - Таблица (заранее заготовленная). Выбор одной из готовых таблиц.
  - Своя таблица (своя случайная таблица). Выбор пользовательской Случайной таблицы.
  - Предмет (UUID). Выбор определённого предмета.

###### <p align="center">Список заранее заготовленных таблиц</p>

<p align="center"><img width="425" height="300" alt="Список заранее заготовленных таблиц" src="https://github.com/user-attachments/assets/06fa4177-269d-4d20-ad2b-28c69c88a3a3"/></p>

###### <p align="center">Стоимость предметов в Случайной таблице</p>

Чтобы указать стоимость предметов в Случайной таблице, в любом месте её Описания, используя "Код HTML", укажите следующее:\
_&lt;p hidden id='tablePrice'&gt;Количество бросков|Тип куба|Модификатор&lt;/p&gt;_\
_Например: &lt;p hidden id='tablePrice'&gt;2|10|*5&lt;/p&gt; означает, что стоимость предмета будет определяться броском "2d10 * 5"._

## Генератор Предметов
_Эта опция поможет Вам в создании предметов с уникальным набором свойств._

Доступ к Генератору Предметов можно получить через вкладку **Предметы** (в правой части экрана), кнопкой **Генератор Предметов**:
<p align="center"><img width="325" height="500" alt="Доступ к Генератору Предметов" src="https://github.com/user-attachments/assets/bb2e511b-6e94-492d-ad07-9edd61513f8c"/></p>

###### <p align="center">Изначальный интерфейс</p>

<p align="center"><img width="525" height="100" alt="Изначальный Интерфейс Генератора Предметов" src="https://github.com/user-attachments/assets/f231eabc-2574-4159-b516-9a46df324c70"/></p>

Для отображения шаблонов Генератора Предметов, необходимо указать тип предмета.

###### <p align="center">Список типов предмета</p>

<p align="center"><img width="250" height="450" alt="Список типов предмета" src="https://github.com/user-attachments/assets/426ed3fa-2629-4bd1-93c4-d91f25272e78"/></p>

_Использование разделения всех предметов на типы обусловлено лишь удобством поиска среди всего обилия предметов._

###### <p align="center">Интерфейс после выбора типа предмета</p>

<p align="center"><img width="750" height="325" alt="Интерфейс после выбора типа предмета" src="https://github.com/user-attachments/assets/7308ca10-4677-48ec-87f9-383ad33aba81"/></p>

После выбора хотя бы одного шаблона появится список итоговых свойств и скриптов, которые могут быть добавлены предмету.

###### <p align="center">Интерфейс после выбора шаблона</p>

<p align="center"><img width="750" height="475" alt="Интерфейс после выбора шаблона" src="https://github.com/user-attachments/assets/4f2ae10c-9598-4e49-8618-c05dc39a6a65"/></p>

При наведении на шаблон, будет отображено его описание. Оно, также, включает и список входящих в шаблон достоинств, недостатков, их соотношение и скриптов.

###### <p align="center">Описание шаблона</p>

<p align="center"><img width="300" height="575" alt="Описание шаблона" src="https://github.com/user-attachments/assets/32ba41f2-9cff-475c-95fd-62109a29b2cd"/></p>

Когда предмет указан и хотя бы один шаблон выбран, появится кнопка **Создать**.

###### <p align="center">Интерфейс после выбора предмета</p>

<p align="center"><img width="750" height="525" alt="Интерфейс после выбора предмета" src="https://github.com/user-attachments/assets/2eb0860b-fb0c-4e8f-9d2b-27160b074d2c"/></p>

После нажатия на кнопку **Создать**, указанный предмет с выбранными шаблонами будет создан.

#### Пользовательские шаблоны Генератора
_Модуль поддерживает возможность создания и использования собственных шаблонов._

При нажатии **Alt + ЛКМ** по шаблону, откроются его параметры. Стандартные шаблоны можно только просматривать, а пользовательские - редактировать.\
При нажатии **Ctrl + ЛКМ** по шаблону, он будет скопирован как пользовательский.\
При нажатии на **+** будет создан новый пользовательский шаблон.

###### <p align="center">Пример окна стандартного шаблона</p>

<p align="center"><img width="925" height="1000" alt="Пример окна стандартного шаблона" src="https://github.com/user-attachments/assets/53cba25c-d606-40d3-82d8-e79586f284bb"/></p>

###### <p align="center">Пример окна пользовательского шаблона</p>

<p align="center"><img width="1000" height="950" alt="Пример окна пользовательского шаблона" src="https://github.com/user-attachments/assets/4061ab35-ee9b-4d09-aa73-35b90fc23343"/></p>

- Цвет: визуальный элемент, выделяющий шаблон на фоне остальных:
  - $${\color{blue}Blue}$$.
  - $${\color{cyan}Cyan}$$.
  - $${\color{goldenrod}Goldenrod}$$.
  - $${\color{gray}Gray}$$.
  - $${\color{green}Green}$$.
  - $${\color{khaki}Khaki}$$.
  - $${\color{olivedrab}Olivedrab}$$.
  - $${\color{orange}Orange}$$.
  - $${\color{orchid}Orchid}$$.
  - $${\color{red}Red}$$.
  - $${\color{salmon}Salmon}$$.
  - $${\color{slateblue}Slateblue}$$.
  - $${\color{turquoise}Turquoise}$$.
  - $${\color{violet}Violet}$$.
- Фильтр типов предмета: позволяет отображать шаблон только для определённых типов предмета.
- Достоинства и Изъяны (далее Свойства):
  - Шанс: вероятность добавления Свойства предмету.
  - Количество: определяет, сколько раз будет совершаться бросок шанса.
  - Список Свойств включает специфические параметры:
    - Любой (общий): случайное общее Свойство.
    - Любой (типовой): случайное Свойство, соответствующее типу предмета.
    - Любой (имущество): случайное Свойство, соответствующее типу "Имущество".
    - Любой (рукопашное): случайное Свойство, соответствующее типу "Рукопашное".
    - Любой (дистанционное): случайное Свойство, соответствующее типу "Дистанционное".
    - Любой (броня): случайное Свойство, соответствующее типу "Броня".
- Перечень случайных имён: Перечень слов или фраз, которые случайно выбираются при создании предмета:
  - A: Слова или фразы <ins>перед</ins> названием предмета.
  - B: Слова или фразы <ins>после</ins> названия предмета.
  - C: Слова или фразы <ins>полностью замещающие</ins> название предмета.
- Скрипты Генератора предметов: скрипты, которые будет использовать создаваемый предмет.

#### Скрипты Генератора Предметов
_Модуль содержит скрипты, которые расширяют функционал создаваемых предметов._

##### Зажигательное
_Оружие, созданное с использованием Акши, при извлечении вспыхивает обжигающим пламенем, не причиняющим вреда владельцу или его носимому снаряжению. Если владелец наносит урон этим оружием цели, та получается 1 состояние горения._
- **Триггер**: _нанесение урона цели этим оружием._
- **Цель**: _противник._
- **Действие**: _получение 1 состояния горения._
- **Автоматизация**: _полная._

##### Эльфийские одеяния
_Эти одеяния созданы магами лесных эльфов и делают владельца куда незаметнее. Любые проверки Наблюдительности, основанные на зрении, или Дальнего боя, проведённые против носителя, проводятся с модификатором -20._
- **Триггер**: _проверки Наблюдательности или Дальнего боя (и основанных на нём навыков) против владельца, носящего эти одеяния._
- **Цель**: _противник._
- **Действие**: _модификатор проверки -20._
- **Автоматизация**: _полная._

##### Обсидиановые вставки
_Этот предмет зачарован на разрушение враждебной магии, пытающейся навредить носящему. Владелец может предпринять попытку развеять любое заклинание, направленное в него (считайте что носящий владеет Языком (магический), равным 30, при попытке рассеять заклинание)._
- **Триггер**: _ручное нажатие._
- **Цель**: _нет._
- **Действие**: _проверка Языка (магический)._
- **Автоматизация**: _полная._

##### Громрил
_Громрил — самый твёрдый металл в известном мире и один из самых редких. Доспех из громрила даёт на 1 единицу брони (КБ) больше и делает носителя невосприимчивым к критическим ранениям — за исключением ситуаций, когда персонаж уже потерял все очки ран. Оружие же получает достоинство Неразрушимое._
- **Триггер**: _создание предмета._
- **Цель**: _предмет._
- **Действие**: _увеличение КБ брони на 1 (увеличиваются только те значения, что выше 0) или добавление свойства Неразрушимое оружию._
- **Автоматизация**: _частичная._

##### Итильмар
_Итильмар означает "небесное серебро", ибо он светел как небеса и сверкает подобно начищенному серебру. Итильмар не тускнеет, прекрасно обрабатывается, при этом не уступая по прочности лучшей стали. Вес любого предмета из итильмара уменьшен на 2 единицы — но не ниже 0._
- **Триггер**: _создание предмета._
- **Цель**: _предмет._
- **Действие**: _снижение веса создаваемого предмета на 2, но не меньше 0._
- **Автоматизация**: _полная._

##### Заразное (X)
_Оружие является разносчиком опасной инфекции. Если живая цель теряет здоровье в результате атаки этим оружием, она должна пройти проверку стойкости (+X), чтобы на месте этой раны не возникло Нагноение._
- **Триггер**: _нанесение урона цели этим оружием._
- **Цель**: _противник._
- **Действие**: _при создании предмета предлагается выбрать сложность для проверки (X). При нанесении урона цели предлагается пройти проверку Стойкости. В случае провала накладывается болезнь: Нагноение._
- **Автоматизация**: _полная._

##### Ядовитое
_Это оружие сделано из материала, являющегося ядвитым. Если цель атаки теряет здоровье, она немедленно оказывается отравлена. Сложность всех связанных с этим состоянием проверок будет Серьёзная (+0)._
- **Триггер**: _нанесение урона цели этим оружием._
- **Цель**: _противник._
- **Действие**: _получение состояния Отравлен._
- **Автоматизация**: _полная._

##### Тяжёлая броня
_Эта броня обладает всеми свойствами тяжёлого доспеха. Она обеспечивает лучшую защиту, а именно - даёт на 1 единицу брони (КБ) больше, но её вес на 1 больше. Так же носящий её получает соответствующие штрафы к тестам Скрытности и Наблюдательности._
- **Триггер**: _создание предмета._
- **Цель**: _предмет._
- **Действие**: _увеличение КБ брони на 1 (увеличиваются только те значения, что выше 0), увеличение веса на 1. При создании предмета предлагается выбрать тип брони для определения штрафа: Глухой шлем (-20 к проверкам Наблюдательности), Открытый шлем / Кольчужный капюшон (-10 к проверкам Наблюдательности), Латные поножи (-10 к проверкам Скрытности) или Другое (ничего)._
- **Автоматизация**: _полная._

##### Горлоискатель
_Это магическое оружие сделано с присущей ей врождённой жаждой крови, благодаря чему остриё проходит даже через лучшую защиту. Оно игнорирует любой класс брони, предоставляемый броней с Уязвимыми местами, но им нельзя совершать Щадящие атаки, а одноимённый изъян не работает._
- **Триггер**: _атака цели этим оружием._
- **Цель**: _противник._
- **Действие**: _полностью игнорирует КБ брони с Уязвимыми местами. При создании предмета удаляет свойство Щадящее, если оно есть._
- **Автоматизация**: _полная._

##### Осквернённое оружие
_Это оружие было осквернено тлетворным влиянием Хаоса. Если владелец наносит урон этим оружием цели, та подвергается Слабому Оскверняющему воздействию. При этом, в случае критического провала, сам владелец должен противостоять этому же воздействию._
- **Триггер**: _нанесение урона цели этим оружием / критический провал этим оружием._
- **Цель**: _противник / сам._
- **Действие**: _добавляет строку со Слабым Оскверняющим воздействием._
- **Автоматизация**: _полная._

##### Утихомиренная броня
_Этот элемент брони был зачарован так, чтобы убрать шум, издаваемый при его ношении. Обычный штраф к скрытности для неё не применяется. Однако заклинания, использованные для зачарования, не были доведены до совершенства, и носящие эту броню могут говорить только шёпотом._
- **Триггер**: _создание предмета._
- **Цель**: _предмет._
- **Действие**: _удаляет скрипты, накладывающие штраф на проверки Скрытности._
- **Автоматизация**: _полная._

##### Насыщенный ветрами
_Ветра магии имеют слабую связь с этим предметом. Каждый раз, когда он используется, владелец должен пройти Элементарную (+60) проверку концентрации. В случае провала совершите бросок по таблице слабой магической отдачи. Персонажи без навыка концентрации автоматически проваливают проверку._
- **Триггер**: _использование предмета._
- **Цель**: _владелец._
- _Действие:_
  - _Оружие: при проверке с использованием этого оружия появляется окно проверки Языка (магический). В случае провала или отсутствия навыка появляется кнопка броска слабой магической отдачи._
  - _Броня: при получении урона по части тела, защищённой этой бронёй, появляется окно проверки Языка (магический). В случае провала или отсутствия навыка появляется кнопка броска слабой магической отдачи._
- **Автоматизация**: _полная._

##### Истощающий
_Предмет черпает силу в жизненной энергии владельца. Каждый раз при использовании предмета владелец должен совершить Заурядную (+20) проверку Стойкости. В случае провала он получает состояние усталости._
- **Триггер**: _использование предмета._
- **Цель**: _владелец._
- _Действие:_
  - _Оружие: при проверке с использованием этого оружия появляется окно проверки Стойкости. В случае провала цель получает состояние усталости._
  - _Броня: при получении урона по части тела, защищённой этой бронёй, появляется окно проверки Стойкости. В случае провала цель получает состояние усталости._
- **Автоматизация**: _полная._

##### Привлекающий ветра
_Магические потоки вьются вокруг предмета. Любой, произносящий заклинание в радиусе 10 ярдов от владельца, попадает под действие Неспокойных ветров._
- **Триггер**: _проверка Сотворения или Концентрации заклинания._
- **Цель**: _заклинатель в 10 ярдах и ближе._
- **Действие**: _у цели в окне броска появляется модификатор, случайно определённый таблицей Неспокойных ветров._
- **Автоматизация**: _полная._

##### Проклятый
_Предмет проклят на предательство. Заклинание, наложенное на него, противоположно черте Оберег. Если атака не попадает во владельца этого предмета, совершите бросок 1d10. При выпадении 7 или выше атака попадёт в цель с +1 УУ, и еще +1 УУ за каждое число выше 7. Многие не понимают, что предмет проклят, до того как не погибнут от него._
- **Триггер**: _успешная встречная проверка защиты цели._
- **Цель**: _сам._
- **Действие**: _при успешной защите совершается бросок 1d10. При выпадении 7 или выше атака попадает в цель с +1 УУ, и еще +1 УУ за каждое число выше 7._
- **Автоматизация**: _полная._

##### Неумолимая ярость
_Сверкающее оружие кажется совершенным на первый взгляд. Каждый раз, когда им наносят урон, персонажу нужно пройти Серьезную (+0) проверку Силы Воли. Более того, каждая новая проверка в ходе одного боя получает накапливающийся модификатор -10 (до максимума в -30). При провале персонаж входит в Состояние Ярости, получая все его преимущества, однако, в отличие от обычной ярости, оно не заканчивается, когда все враги оказываются повержены. Напротив, персонаж обязан атаковать ближайшую цель, кем бы она ни была. Состояние можно прервать только обезоружив, оглушив или выведя из строя._
- **Триггер**: _получение предмета / нанесение урона противнику этим оружием._
- **Цель**: _сам._
- **Действие**: _выдача таланта Ярость / цели предлагается пройти проверку Силы Воли, при этом модификатор высчитывается автоматически._
- **Автоматизация**: _полная / частичная._

##### Оружие потерянной удачи
_При создании этого оружия использовались самые экзотические материалы: светлый блестящий металл, ярко белая слоновая кость и другие. Пока у владельца есть хотя бы 1 очко судьбы, он получает +20 к проверкам, связанным с этим оружием. Однако каждый раз, когда атака попадает, но при этом имеет 2 УУ или меньше, то есть попала благодаря бонусу, оно ворует одно очко Удачи._
- **Триггер**: _успешная встречная проверка цели, получившая 2 или меньше УУ._
- **Цель**: _сам._
- **Действие**: _при наличии очков удачи предоставляет модификатор к проверке +20. При получении менее 2 УУ в успешной встречной проверке указывает на вороство очка удачи (его необходимо убирать вручную)._
- **Автоматизация**: _частичная._

##### Размер и Народ
_Этот предмет изготовлен под особый заказ, поэтому его размер может подойти не всем. Мастер волен сам определить эффект, который принесёт использование персонажем неподходящего по размеру или принадлежности определённому народу предмета._
- **Триггер**: _создание предмета._
- **Цель**: _предмет._
- **Действие**: _случайно определяет принадлежность народу и рост для брони и только принадлежность народу для остального и добавляет эти сведения к названию._
- **Автоматизация**: _полная._

##### Снятый с трупа
_Этот предмет был снят с тела убитого, и только богам известно, насколько дрянным он может быть._
- **Триггер**: _создание предмета._
- **Цель**: _предмет._
- **Действие**: _случайно определяет изъяны, согласно правилам WFRP4e Unofficial Treasure Artefacts для предметов, снятых с убитых NPC._
- **Автоматизация**: _полная._

#### Редактор Скриптов
_Модуль поддерживает создание собственных скриптов._

Доступ к Редактору Скриптов Генератора предметов можно получить через вкладку **Предметы** (в правой части экрана), кнопкой **Скрипты Генератора предметов**:
<p align="center"><img width="325" height="500" alt="Доступ к Скриптам Генератора предметов" src="https://github.com/user-attachments/assets/f10657b4-3580-4fea-b3c3-e67a19875411"/></p>

Добавить собственные скрипты можно, используя кнопку "Добавить скрипт" в шапке окна:
<p align="center"><img width="450" height="400" alt="Доступ к Скриптам Генератора предметов" src="https://github.com/user-attachments/assets/e223683e-5f06-4b4d-8e50-60f7ad528c2e"/></p>

## Настройки
_Модуль обладает возможностью гибкой настройки._

###### <p align="center">Интерфейс Настроек</p>

<p align="center"><img width="750" height="600" alt="Интерфейс Настроек" src="https://github.com/user-attachments/assets/0784812e-a4a6-44b5-b878-7f9bdcdf27bb"/></p>

Список настраиваемых параметров:
- Пользовательские настройки. Позволяет импортировать и экспортировать пользовательские шаблоны и скрипты.
- Мародёрство. Быстрая продажа: разрешить игрокам сразу обменивать найденные предметы на деньги, используя кнопки "Продать предмет" и "Продать все предметы".
- Мародёрство. Модификатор стоимости добычи: дополнительный модификатор, на который умножаются итоговые броски находимых монет и стоимости предметов. Например: "2", увеличит получаемые монеты вдвое, а "0,5", вдвое их уменьшит.
- Мародёрство. Уменьшать стоимость предметов: если включено, стоимость денежной награды при быстрой продаже будет уменьшена вдвое, после применение "Мародёрство. Модификатора стоимости добычи".
- Генератор. Редактор имени: если включено, при генерации предмета будет появляться окно, в котором можно изменить его имя.
- Генератор. Скрыть качества: скрывает базовые шаблоны генератора, содержащие только одно качество.
- Генератор. Совместимость качеств: если включено, при генерации предмета противоположные качества будут взаимоисключаться. Например: при одновременном получении качеств "Красивый" и "Некрасивый", они будут исключены.

#### Режим Отладки
_Модуль оборудован режимом отладки, используемым для обнаружения и решения проблем при его использовании._

###### <p align="center">Интерфейс Меню Отладки</p>

<p align="center"><img width="575" height="400" alt="Интерфейс Меню Отладки" src="https://github.com/user-attachments/assets/260d56ce-cbf7-414f-9788-793336e7c670"/></p>

## Планы
_Дальнейшие планы по обновлению модуля._

- [ ] Исправление ошибок.
- [ ] Адаптация модуля под новые обновления Foundry VTT и системы WFRP4e.
- [ ] Добавление новых шаблонов сообщества.
- [ ] Свои предложения по улучшению модуля, шаблоны Мародёрства, Генератора предметов и пользовательские Скрипты можете присылать в <a href="https://discord.gg/tPrYvW7" rel="nofollow"><img src="https://img.shields.io/badge/Discord-black?logo=discord&logoColor=%235865F2" alt="Discord"></a>.

</details>
<hr>

This module will help you optimize the process of creating unique loot.
<br>
<details>
  <summary>Description</summary>

## Contents
- [Looting](#Looting)
  - [Interaction](#Interaction)
  - [Custom Looting Templates](#Custom-Looting-Templates)
- [Item Generator](#Item-Generator)
  - [Custom Templates](#Custom-Item-Generator-Templates)
  - [Item Generator Scripts](#Item-Generator-Scripts)
- [Settings](#Settings)
  - [Debug Mode](#Debug-Mode)
- [Plans](#Plans)

## Looting
_This option will help you create loot based on pre‑defined templates._

You can access Looting via the **Journal Notes** tab (in the top‑left corner of the screen) using the **Looting** button:
<p align="center"><img width="230" height="400" alt="Accessing Looting" src="https://github.com/user-attachments/assets/9f8b04a4-909d-4695-8b9b-8b961582b4d9"/></p>

###### <p align="center">Looting Interface</p>

<p align="center"><img width="550" height="300" alt="Looting Interface" src="https://github.com/user-attachments/assets/8abce67e-b87b-492e-994a-9f08d19c4d74"/></p>

When you **LMB** on a template, a roll will be made and the result will be displayed in the chat:
<p align="center"><img width="250" height="200" alt="Example of a Looting Roll Result" src="https://github.com/user-attachments/assets/3d19a89e-6465-4fc6-9320-391dc4becbf3"/></p>

#### Interaction
_You can interact with the Looting roll result in the following ways:_

- **Take Item**: When **LMB** on the name of an individual item, the following will happen:
  - If the player who clicked lacks an associated actor, the item will be output to the chat.
  - If the **Alt** key is held during the click, the item will be output to the chat.
  - If the player who clicked has an associated actor, the item will be added to their inventory.

- **Sell Item**: When **LMB** on the coins next to an individual item — if the Game Master has enabled the "Looting. Allow a quick sale" setting — the following will happen:
  - If the player lacks an associated actor, a message about awarding coins equal to the item’s value will be output to the chat.
  - If the **Alt** key is held during the click, a message about awarding coins will be output.
  - If the player has an associated actor, coins equal to the item’s value will be added to their inventory.

  _Note: If the Game Master has enabled "Looting. Reduce item value by half", the item’s sale value during a quick sale will be halved._

- **Take All Items**: When **LMB** on the word "Loot" above the item list:
  - If the player lacks an associated actor, all items will be output to the chat.
  - If the **Alt** key is held during the click, all items will be output to the chat.
  - If the player has an associated actor, all items will be added to their inventory.

- **Sell All Items**: When **LMB** on the coins below the word "Loot" (above the item list), if the Game Master has enabled "Looting. Allow a quick sale", the following will happen:
  - If the player lacks an associated actor, a message about awarding coins equal to the total value of all items will be output to the chat.
  - If the **Alt** key is held, a message about awarding coins will be output.
  - If the player has an associated actor, coins equal to the total value will be added to their inventory.

  _Note: If the Game Master has enabled "Looting. Reduce item value by half", the total sale value will be halved._

- **Coins**: When **LMB** on the word "Coins" above the item list:
  - If the player lacks an associated actor, a message about awarding coins will be output to the chat.
  - If the **Alt** key is held, a message about awarding coins will be output.
  - If the player has an associated actor, coins will be added to their inventory.

#### Custom Looting Templates
_The module supports the ability to create and use custom templates._

When **Alt + LMB** on a template, its parameters will open. Standard templates can only be viewed, while custom ones can be edited.  
When **Ctrl + LMB** on a template, it will be copied as a custom one.  
Clicking the **+** button will create a new custom template.

###### <p align="center">Example of a Standard Template Window</p>

<p align="center"><img width="1000" height="500" alt="Example of a Standard Template Window" src="https://github.com/user-attachments/assets/6f3ae36e-cabe-4b64-9a8e-3c5f47f82cab"/></p>

###### <p align="center">Example of a Custom Template Window</p>

<p align="center"><img width="1000" height="500" alt="Example of a Custom Template Window" src="https://github.com/user-attachments/assets/79c4e01e-5c72-40ab-9f93-394074a4e3bb"/></p>

- Status: Determines in which type of coins the item value will be specified:
  - Brass: brass penny.
  - Silver: silver shilling.
  - Gold: gold crown.
- Chance: The probability of obtaining coins (penny, shilling, or crown) or an item from the table as a result of the roll. If the chance fails, no item or coin is added in any quantity.
- Quantity: Determines the number of coins or items if the chance succeeds. If a maximum result is rolled on d10, d20, or d100 dice, an additional quantity roll is made.
- Tables: Sets of items that may be added as a result of a roll:
  - Table (pre‑defined): Select one of the ready‑made tables.
  - Custom Table (custom random table): Select a user‑defined random table.
  - Item (UUID): Select a specific item.

###### <p align="center">List of Pre‑Defined Tables</p>

<p align="center"><img width="425" height="300" alt="List of Pre-Defined Tables" src="https://github.com/user-attachments/assets/06fa4177-269d-4d20-ad2b-28c69c88a3a3"/></p>

###### <p align="center">Item Values in a Random Table</p>

To specify the cost of items in this table, specify the following anywhere in its Description using "HTML Code":\
_&lt;p hidden id='tablePrice'&gt;Number of rolls|Dice Type|The modifier&lt;/p&gt;_\
_For example: &lt;p hidden id='tablePrice'&gt;2|10|*5&lt;/p&gt; means that the value of the item will be determined by the roll "2d10 * 5"._

## Item Generator
_This feature helps you create items with a unique set of properties._

You can access the Item Generator via the **Items** tab (on the right side of the screen) using the **Item Generator** button:
<p align="center"><img width="325" height="500" alt="Accessing the Item Generator" src="https://github.com/user-attachments/assets/bb2e511b-6e94-492d-ad07-9edd61513f8c"/></p>

###### <p align="center">Initial Interface</p>

<p align="center"><img width="525" height="100" alt="Initial Item Generator Interface" src="https://github.com/user-attachments/assets/f231eabc-2574-4159-b516-9a46df324c70"/></p>

To display the Item Generator templates, you need to specify the item type.

###### <p align="center">List of Item Types</p>

<p align="center"><img width="250" height="450" alt="List of Item Types" src="https://github.com/user-attachments/assets/426ed3fa-2629-4bd1-93c4-d91f25272e78"/></p>

_Categorizing all items by type is done solely for convenience when searching through the wide variety of items._

###### <p align="center">Interface After Selecting an Item Type</p>

<p align="center"><img width="750" height="325" alt="Interface After Selecting an Item Type" src="https://github.com/user-attachments/assets/7308ca10-4677-48ec-87f9-383ad33aba81"/></p>

After selecting at least one template, a list of final properties and scripts that can be added to the item will appear.

###### <p align="center">Interface After Selecting a Template</p>

<p align="center"><img width="750" height="475" alt="Interface After Selecting a Template" src="https://github.com/user-attachments/assets/4f2ae10c-9598-4e49-8618-c05dc39a6a65"/></p>

When you hover over a template, its description will be displayed. It also includes a list of the template’s qualities, flaws, their ratio, and scripts.

###### <p align="center">Template Description</p>

<p align="center"><img width="300" height="575" alt="Template Description" src="https://github.com/user-attachments/assets/32ba41f2-9cff-475c-95fd-62109a29b2cd"/></p>

Once an item is specified and at least one template is selected, the **Create** button will appear.

###### <p align="center">Interface After Selecting an Item</p>

<p align="center"><img width="750" height="525" alt="Interface After Selecting an Item" src="https://github.com/user-attachments/assets/2eb0860b-fb0c-4e8f-9d2b-27160b074d2c"/></p>

After clicking the **Create** button, the specified item with the selected templates will be created.

#### Custom Generator Templates
_The module supports the ability to create and use custom templates._

Pressing **Alt + LMB** on a template will open its parameters. Standard templates can only be viewed, while custom ones can be edited.  
Pressing **Ctrl + LMB** on a template will copy it as a custom one.  
Clicking the **+** button will create a new custom template.

###### <p align="center">Example of a Standard Template Window</p>

<p align="center"><img width="925" height="1000" alt="Example of a Standard Template Window" src="https://github.com/user-attachments/assets/53cba25c-d606-40d3-82d8-e79586f284bb"/></p>

###### <p align="center">Example of a Custom Template Window</p>

<p align="center"><img width="1000" height="950" alt="Example of a Custom Template Window" src="https://github.com/user-attachments/assets/4061ab35-ee9b-4d09-aa73-35b90fc23343"/></p>

- Color: A visual element that makes the template stand out from the rest:
  - $${\color{blue}Blue}$$.
  - $${\color{cyan}Cyan}$$.
  - $${\color{goldenrod}Goldenrod}$$.
  - $${\color{gray}Gray}$$.
  - $${\color{green}Green}$$.
  - $${\color{khaki}Khaki}$$.
  - $${\color{olivedrab}Olivedrab}$$.
  - $${\color{orange}Orange}$$.
  - $${\color{orchid}Orchid}$$.
  - $${\color{red}Red}$$.
  - $${\color{salmon}Salmon}$$.
  - $${\color{slateblue}Slateblue}$$.
  - $${\color{turquoise}Turquoise}$$.
  - $${\color{violet}Violet}$$.
- **Item Type Filter**: Allows the template to be displayed only for certain item types.
- **Qualities and Flaws (hereafter Property)**:
  - **Chance**: The probability of adding a Property to the item.
  - **Quantity**: Determines how many times the chance roll will be made.
  - The **Property List** includes specific parameters:
    - **Any (all)**: A random general Property.
    - **Any (type)**: A random Property matching the item type.
    - **Any (trapping)**: A random Property matching the "Trapping" type.
    - **Any (melee)**: A random Property matching the "Melee" type.
    - **Any (range)**: A random Property matching the "Ranged" type.
    - **Any (armor)**: A random Property matching the "Armor" type.
- **Random Name List**: A list of words or phrases that are randomly selected when creating an item:
  - **A**: Words or phrases <ins>before</ins> the item name.
  - **B**: Words or phrases <ins>after</ins> the item name.
  - **C**: Words or phrases <ins>completely replacing</ins> the item name.
- **Item Generator Scripts**: Scripts that the created item will use.

#### Item Generator Scripts
_The module contains scripts that extend the functionality of created items._

##### Incendiary
_A weapon forged with Aqshy flares with searing flames upon being drawn, causing no harm to the wielder or their equipment. If the wielder deals damage to a target with this weapon, the target gains 1 Ablaze condition._
- **Trigger**: _dealing damage to a target with this weapon._
- **Target**: _opponent._
- **Effect**: _gaining 1 Ablaze condition._
- **Automation**: _full._

##### Elven
_These garments were crafted by Wood Elf mages and make the wearer far less conspicuous. Any Perception (sight‑based) or Ballistic Skill tests made against the wearer are performed with a −20 modifier._
- **Trigger**: _Perception (sight‑based) or Ballistic Skill checks (and skills based on them) against the wearer wearing these garments._
- **Target**: _opponent._
- **Effect**: _test modifier −20._
- **Automation**: _full._

##### Obsidian Inlays
_This item is enchanted to disrupt hostile magic targeting the wearer. The wearer may attempt to dispel any spell directed at them (treat the wearer as having Language (Magic) 30 when attempting to dispel a spell)._
- **Trigger**: _manual activation._
- **Target**: _none._
- **Effect**: _Language (Magic) test._
- **Automation**: _full._

##### Gromril
_Gromril is the hardest metal in the known world and one of the rarest. Gromril armor grants 1 extra point of armor (AP) and makes the wearer immune to critical hits, except when the character has already lost all their wounds. Gromril weapons gain the Unbreakable quality._
- **Trigger**: _item creation._
- **Target**: _item._
- **Effect**: _increasing AP by 1 (only values above 0 are increased) or adding the Indestructible quality to weapons._
- **Automation**: _partial._

##### Ithilmar
_Ithilmar means "heavenly silver," for it is as bright as the heavens and as shiny as polished silver. Ithilmar does not tarnish and is highly durable, rivaling the strength of the finest steel. The encumbrance of any Ithilmar item is reduced by 2 points, but not below 0._
- **Trigger**: _item creation._
- **Target**: _item._
- **Effect**: _reducing the item’s encumbrance by 2, but not below 0._
- **Automation**: _full._

##### Infected (X)
_This weapon is a carrier of a dangerous infection. If a living target loses health as a result of an attack with this weapon, they must pass a Endurance test (+X) to prevent the wound from becoming infected._
- **Trigger**: _dealing damage to a target with this weapon._
- **Target**: _opponent._
- **Effect**: _when creating the item, the user is prompted to select the test difficulty (X). When dealing damage, a Endurance test is required. On failure, the Infection condition is applied._
- **Automation**: _full._

##### Poisoned
_This weapon is made of a poisonous material. If the target of the attack loses health, they are immediately poisoned. The difficulty of all tests related to this condition will be Challenging (+0)._
- **Trigger**: _dealing damage to a target with this weapon._
- **Target**: _opponent._
- **Effect**: _gaining the Poisoned condition._
- **Automation**: _full._

##### Heavy Armor
_This armor has all the properties of heavy armor. It provides better protection, specifically 1 more armor points (AP), but it also encumbrance 1 more. Additionally, the wearer receives corresponding penalties to Stealth and Perception tests._
- **Trigger**: _item creation._
- **Target**: _item._
- **Effect**: _increasing AP by 1 (only values above 0), increasing encumbrance by 1. When creating the item, the user is prompted to select armor type to determine the penalty: Plate Helm (−20 to Perception checks), Plate Open Helm / Mail Coif (−10 to Perception checks), Plate Leggings (−10 to Stealth checks), or Other (no penalty)._
- **Automation**: _full._

##### Throatseeker
_This magical weapon is made with an innate bloodlust, allowing it to pierce even the best defenses. It ignores any armor class provided by armor with Weak Points, but it cannot perform Undamaging attacks, and the flaw of the same name does not work._
- **Trigger**: _attacking a target with this weapon._
- **Target**: _opponent._
- **Effect**: _completely ignores AP from armor with Weak Points. When creating the item, removes the Undamaging property if present._
- **Automation**: _full._

##### Tainted Weapon
_These weapons have been polluted by the corrupting influence of Chaos. If the wielder damages the target with this weapon, it is exposed to a Weak Desecrating Effect. At the same time, in the event of a critical failure, the owner himself must withstand the same impact._
- **Trigger**: _dealing damage with this weapon / critical failure with this weapon._
- **Target**: _opponent / self._
- **Effect**: _adds a line with Minor corruption exposure._
- **Automation**: _full._

##### Quietened
_This piece of armor has been enchanted to remove the noise it makes when worn. The usual stealth penalty does not apply to her. However, the spells used for enchantment have not been perfected, and those wearing this armor can only speak in a whisper._
- **Trigger**: _item creation._
- **Target**: _item._
- **Effect**: _removes scripts that apply Stealth test penalties._
- **Automation**: _full._

##### Full of Wind
_The winds of magic have a weak connection to this item. Each time it is used, the wearer must pass an Very Easy (+60) concentration test. In case of failure, roll on the weak magic recoil table. Characters without concentration skills automatically fail the test._
- **Trigger**: _using the item._
- **Target**: _owner._
- **Effect**:
  - _Weapon: when making a check with this weapon, a Language (Magic) test window appears. On failure or lacking the skill, a weak magic recoil roll button appears._
  - _Armor: when taking damage to a body part protected by this armor, a Language (Magic) check window appears. On failure or lacking the skill, a weak magic recoil roll button appears._
- **Automation**: _full._

##### Draining
_The item draws strength from the owner's vital energy. Each time the item is used, the owner must perform a Average (+20) Endurance test. In case of failure, he gets a state of fatigue._
- **Trigger**: _using the item._
- **Target**: _owner._
- **Effect**:
  - _Weapon: when making a check with this weapon, a Endurance test window appears. On failure, the target gains the Fatigue condition._
  - _Armor: when taking damage to a body part protected by this armor, a Endurance test window appears. On failure, the target gains the Fatigue condition._
- **Automation**: _full._

##### Drawing the Winds
_Magical currents swirl around the object. Anyone casting a spell within 10 yards of the wearer is exposed to The Swirling Winds._
- **Trigger**: _casting or Concentration spell test._
- **Target**: _caster within 10 yards or closer._
- **Effect**: _the target’s roll window shows a modifier randomly determined by the The Swirling Winds._
- **Automation**: _full._

##### Cursed
_The item is cursed for betrayal. The spell cast on it is the opposite of the Ward trait. If the attack does not hit the owner of this item, roll 1d10. If you hit 7 or higher, the attack will hit the target with +1 SL, and another +1 SL for each number above 7. Many people don't realize that an object is cursed until they die from it._
- **Trigger**: _successful opposed defense check by the target._
- **Target**: _self._
- **Effect**: _on successful defense, roll 1d10. On 7 or higher, the attack hits with +1 AP, plus +1 AP for each number above 7._
- **Automation**: _full._

##### Relentless Fury
_A gleaming weapon seems perfect at first glance. Every time it is used to deal damage, the character must pass a Challenging (+0) Willpower test. Moreover, each new test during a single battle receives a cumulative -10 modifier (up to a maximum of -30). If the test is failed, the character enters the Frenzy, gaining all its benefits. However, unlike regular Frenzy, it does not end when all enemies are defeated. Instead, the character is compelled to attack the nearest target, regardless of their identity. The Frenzy can only be interrupted by disarming, stunning, or incapacitating the character._
- **Trigger**: _obtaining the item / dealing damage to an opponent with this weapon._
- **Target**: _self._
- **Effect**: _granting the Fury talent / the target is prompted to make a Willpower test, with the modifier calculated automatically._
- **Automation**: _full / partial._

##### Weapon of Forsaken Fortune
_When creating this weapon, the most exotic materials were used: light shiny metal, bright white ivory and others. As long as the owner has at least 1 Fortune point, he gets +20 to the checks related to this weapon. However, every time an attack hits, but it has 2 SL or less, that is, it hits thanks to the bonus, it steals one point of Fortune._
- **Trigger**: _successful opposed check by the target that results in 2 or fewer SL._
- **Target**: _self._
- **Effect**: _if the owner has Fortune points, grants a +20 modifier to the check. If the successful opposed check results in 2 or fewer SL, it indicates the theft of a Fortune point (this must be manually removed)._
- **Automation**: _partial._

##### Size & Species
_This item is custom-made, so its size may not be suitable for everyone. The master is free to determine for himself the effect that the use of an object unsuitable in size or belonging to a certain people will bring._
- **Trigger**: _item creation._
- **Target**: _item._
- **Effect**: _randomly determines the species and height for armor (and only species for other items) and adds this information to the item’s name._
- **Automation**: _full._

##### Looted Item
_This item was removed from the body of the murdered man, and only the gods know how shoddy it can be._
- **Trigger**: _item creation._
- **Target**: _item._
- **Effect**: _randomly determines flaws according to the rules of WFRP4e Unofficial Treasure Artefacts for items looted from dead NPCs._
- **Automation**: _full._

#### Script Editor
_The module supports creating custom scripts._

You can access the Item Generator Script Editor via the **Items** tab (on the right side of the screen), using the **Item Generator Scripts** button:
<p align="center"><img width="325" height="500" alt="Accessing the Item Generator Scripts" src="https://github.com/user-attachments/assets/f10657b4-3580-4fea-b3c3-e67a19875411"/></p>

You can add custom scripts using the **Add Script** button in the window header:
<p align="center"><img width="450" height="400" alt="Accessing the Item Generator Scripts" src="https://github.com/user-attachments/assets/e223683e-5f06-4b4d-8e50-60f7ad528c2e"/></p>

## Settings
_The module offers flexible configuration options._

###### <p align="center">Settings Interface</p>

<p align="center"><img width="750" height="600" alt="Settings Interface" src="https://github.com/user-attachments/assets/0784812e-a4a6-44b5-b878-7f9bdcdf27bb"/></p>

List of configurable parameters:
- User Settings. Allows importing and exporting user‑defined templates and scripts.
- Looting. Allow a quick sale. Allow players to immediately exchange the found items or money using the **Sell Item** and **Sell All Items** buttons.
- Looting. Loot cost Modifier. An additional modifier that multiplies the final dice rolls for found coins and the cost of the items. For example, "2" will double the received coins, while "0.5" will halve them.
- Looting. Reduce item value by half. If enabled, the monetary reward for found items will be halved after applying the "Looting. Loot cost Modifier".
- Generator. Editor for the name of the generated item. If enabled, a window will appear when generating an item in which you can change its name.
- Generator. Hide qualities. Hides the basic generator templates that contain only one quality.
- Generator. Compatibility of props. If enabled, when generating an item, the opposite qualities will be mutually exclusive. For example: if you simultaneously receive the qualities "Fine" and "Ugly", they will be excluded.

#### Debug Mode
_The module includes a debug mode used to detect and resolve issues during its use._

###### <p align="center">Debug Menu Interface</p>

<p align="center"><img width="575" height="400" alt="Debug Menu Interface" src="https://github.com/user-attachments/assets/260d56ce-cbf7-414f-9788-793336e7c670"/></p>

## Roadmap
_Future plans for module updates._

- [ ] Bug fixes.
- [ ] Adapting the module for new Foundry VTT updates and the WFRP4e system.
- [ ] Adding new community templates.
- [ ] You can submit your suggestions for improving the module, looting templates, item generator templates, and custom scripts via <a href="https://discord.gg/tPrYvW7" rel="nofollow"><img src="https://img.shields.io/badge/Discord-black?logo=discord&logoColor=%235865F2" alt="Discord"></a>.

</details>
