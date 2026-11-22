<div align="center">

  # WFRP4e - Looting

  <p>
    <a href="https://foundryvtt.com/packages/wfrp4e-looting" rel="nofollow"><img src="https://img.shields.io/badge/WFRP4e%20--%20Looting-FoundryVTT-orange?labelColor=darkred" alt="FoundryVTT"></a>
    <a href="https://foundryvtt.com/" rel="nofollow"><img src="https://img.shields.io/badge/V13-Совместимо-darkgreen?labelColor=orange" alt="Совместимость"></a>
    <a href="https://github.com/nPocToI4eJI/wfrp4e-looting/releases" rel="nofollow"><img src="https://img.shields.io/github/v/release/nPocToI4eJI/wfrp4e-looting?display_name=release&label=%D0%92%D0%B5%D1%80%D1%81%D0%B8%D1%8F&labelColor=darkgreen" alt="Последняя версия"></a>
    <a href="https://github.com/nPocToI4eJI/wfrp4e-looting/releases/latest" rel="nofollow"><img src="https://img.shields.io/github/downloads/nPocToI4eJI/wfrp4e-looting/latest/wfrp4e-looting.zip?displayAssetName=false&label=%D0%A1%D0%BA%D0%B0%D1%87%D0%B8%D0%B2%D0%B0%D0%BD%D0%B8%D0%B9&labelColor=blue&color=darkgreen" alt="Скачивания"></a>
    <a href="https://github.com/nPocToI4eJI/wfrp4e-looting/releases" rel="nofollow"><img src="https://img.shields.io/github/downloads/nPocToI4eJI/wfrp4e-looting/wfrp4e-looting.zip?displayAssetName=false&label=%D0%92%D1%81%D0%B5%D0%B3%D0%BE&labelColor=darkgreen&color=darkred" alt="Скачиваний всего"></a>
  </p>

  <p>
    <a href="https://discord.gg/tPrYvW7" rel="nofollow"><img src="https://img.shields.io/badge/Discord-black?logo=discord&logoColor=%235865F2" alt="Discord"></a>
    <a href="https://www.youtube.com/@nPocTo_4eJI" rel="nofollow"><img src="https://img.shields.io/badge/Youtube-black?logo=youtube&logoColor=%23FF0000" alt="Youtube"></a>
    <a href="https://boosty.to/npocto_4eji" rel="nofollow"><img src="https://img.shields.io/badge/Boosty-black?logo=boosty&logoColor=%23F15F2C" alt="Boosty"></a>
  </p>


  **[🇷🇺 Русский](#-русский) | [🇬🇧 English](#-english)**

</div>

---

<a id="-русский"></a>

**WFRP4e - Looting** - модуль для генерации добычи, быстрого обыска поверженных врагов и создания уникальных предметов для системы **Warhammer Fantasy Roleplay 4th Edition** в Foundry VTT. Он помогает Мастеру в один клик выдавать сбалансированный лут по настраиваемым шаблонам, позволять игрокам самостоятельно обыскивать мёртвые токены на сцене и собирать уникальное оружие, броню и снаряжение со свойствами и особыми эффектами.

> [!IMPORTANT]
> Для работы этого модуля **обязательно** требуется установленный и включённый базовый модуль **[WFRP4e - Tools](https://github.com/nPocToI4eJI/wfrp4e-tools)**.

### 📋 Содержание
- [Мародёрство](#ru-looting)
  - [Шаблоны добычи и конструктор](#ru-looting-presets)
  - [Интерактивный лут в чате](#ru-looting-chat)
  - [Быстрый обыск мёртвых токенов](#ru-token-looting)
- [Генератор предметов](#ru-generator)
  - [Шаблоны модификации и пересчёт цены](#ru-generator-presets)
  - [Скрипты Генератора](#ru-generator-scripts)
- [Настройки и Меню отладки](#ru-settings)
- [Связанные модули](#ru-modules)

---

<a id="ru-looting"></a>
### 💰 Мародёрство

Кнопка на панели **«Дополнительные инструменты»** (`WFRP4e - Tools`) открывает окно **Мародёрства** со стандартными и пользовательскими шаблонами добычи, разделёнными по уровням благосостояния (*Медь*, *Серебро*, *Золото*).

<details align="center">
<summary>📷 Скриншоты</summary>

![Окно Мародёрства](https://github.com/user-attachments/assets/9c45092a-c449-493b-9c8d-d6d000e046b9)

</details>

---

<a id="ru-looting-presets"></a>
#### 📦 Шаблоны добычи и конструктор
Модуль включает набор готовых шаблонов и гибкий редактор для создания собственных.

* **Быстрое управление:** *ЛКМ* - сгенерировать добычу, *Alt + ЛКМ* - просмотр или редактирование шаблона, *Ctrl + ЛКМ* - копирование существующего шаблона в пользовательские.
* **Настройка монет:** для каждого типа монет (МП, СШ, ЗК) задаются шанс выпадения и формула броска с поддержкой взрывающихся кубов.
* **Таблицы и предметы:** в шаблон можно добавлять встроенные таблицы добычи, собственные Таблицы (по ключу и колонке, с поддержкой формулы цены в описании таблицы) и конкретные предметы из мира или библиотек.

<details align="center">
<summary>📷 Скриншоты</summary>

![Окно редактирования шаблона Мародёрства](https://github.com/user-attachments/assets/733694a7-fa0a-411b-a061-9be367b543fb)

</details>

---

<a id="ru-looting-chat"></a>
#### 💬 Интерактивный лут в чате
Сгенерированная добыча отправляется в чат в виде интерактивной карточки, синхронизированной между всеми участниками.

* **Забор добычи в один клик:** игроки могут забирать монеты и предметы прямо в инвентарь своего персонажа (поштучно или всё сразу), а с зажатой клавишей `Alt` - отправлять предмет или зачисление в чат для свободного распределения.
* **Быстрая продажа:** найденные предметы можно мгновенно обменять на монеты прямо из карточки добычи (при желании Мастер может ограничить продажу или снизить цену выкупа вдвое в настройках).
* **Синхронизация в реальном времени:** как только любой игрок забирает или продаёт предмет, он сразу исчезает из сообщения у остальных игроков, предотвращая дублирование добычи.
* **Прочее имущество:** при выпадении обобщённой позиции игрок сам выбирает подходящую подтаблицу прочего снаряжения.

<details align="center">
<summary>📷 Скриншоты</summary>

![Интерактивная карточка добычи в чате](https://github.com/user-attachments/assets/455312aa-ad37-4a5f-b523-6bcb08e16363)


</details>

---

<a id="ru-token-looting"></a>
#### ☠️ Быстрый обыск мёртвых токенов
Позволяет игрокам и Мастеру обыскивать поверженных противников прямо на карте без лишних действий.

* **Кнопка над токеном:** при наведении на мёртвый токен (0 ран или статус смерти) сверху над ним появляется кнопка с сундуком.
* **Привязка шаблона к актёру:** в заголовке листа актёра для Мастера доступна кнопка **«Указать шаблон мародёрства»** с отображением текущего привязанного шаблона. Если шаблон привязан - клик по кнопке над токеном сразу сгенерирует добычу; если нет - откроется окно выбора шаблона.
* **Статус обыска:** после обыска токен автоматически помечается как уже обысканный и скрывает кнопку от игроков. Мастер видит полупрозрачную иконку и может сбросить или переключить статус обыска по **ПКМ**.

<details align="center">
<summary>📷 Скриншоты</summary>

![Кнопка быстрого обыска](https://github.com/user-attachments/assets/7b9e392b-e941-4ac7-960a-c41b1b961c11)

![Привязка шаблона](https://github.com/user-attachments/assets/e3400078-1338-43ca-b343-d75b7080f2cf)

</details>

---

<a id="ru-generator"></a>
### 🎲 Генератор предметов *(только для Мастера)*

Кнопка в заголовке вкладки **«Предметы»** открывает **Генератор предметов**, позволяющий быстро создавать уникальное оружие, боеприпасы, броню и снаряжение на основе любого предмета из мира или библиотек.

<details align="center">
<summary>📷 Скриншоты</summary>

![Окно Генератора предметов](https://github.com/user-attachments/assets/c317177b-4663-4b69-b548-df275cf8859a)

</details>

---

<a id="ru-generator-presets"></a>
#### 🛠️ Шаблоны модификации и пересчёт цены
* **Комбинирование шаблонов:** выбирайте один или сразу несколько готовых и пользовательских шаблонов, а также шаблоны отдельных достоинств.
* **Достоинства и изъяны:** поддержка конкретных свойств и случайных выборок по категориям с настраиваемыми шансами, количеством и проверкой взаимоисключающих пар.
* **Пересчёт цены и генерация имени:** стоимость предмета автоматически пересчитывается по правилам системы в зависимости от полученных достоинств и изъянов, а имя собирается из префиксов, суффиксов или уникальных названий (с опциональным окном правки и переброса перед созданием).
* **Итоговая карточка:** после генерации выводится сводка с изменением цены, списком добавленных/взаимоисключённых свойств, скриптов и быстрыми кнопками открытия или удаления предмета.

<details align="center">
<summary>📷 Скриншоты</summary>

![Редактор шаблона Генератора](https://github.com/user-attachments/assets/bfcd1470-24a0-4e7d-b1f7-784942e6ae2c)

![Итоговое окно генерации предмета](https://github.com/user-attachments/assets/e4b59c2e-ec0b-450a-9203-263b8a5f32ba)

</details>

---

<a id="ru-generator-scripts"></a>
#### ⚡ Скрипты Генератора
Механизм добавления особых активных эффектов к сгенерированным и обычным предметам.

* **Редактор скриптов:** встроенные и пользовательские наборы эффектов хранятся в едином редакторе скриптов, доступном из вкладки **«Предметы»** и из редактора шаблонов Генератора.
* **Ручное управление на любом предмете:** на вкладке **«Эффекты»** листа любого предмета появляется кнопка для Мастера (*ЛКМ* - добавить скрипты Генератора, *ПКМ* - удалить их с предмета).
* **Скрытие от игроков:** в настройках можно скрыть скрипты Генератора в листах предметов от игроков - удобно для проклятых или неопознанных артефактов.

<details align="center">
<summary>📷 Скриншоты</summary>

![Редактор скриптов](https://github.com/user-attachments/assets/c6137b26-cc95-4bbc-b3b1-315ea908f357)

![Кнопка добавления скриптов](https://github.com/user-attachments/assets/901ba3e7-3703-4f79-97b2-9b2a896fd879)

</details>

---

<a id="ru-settings"></a>
### ⚙️ Настройки и Меню отладки

**Основные настройки модуля:**
* **Модификатор стоимости лута** - дополнительный множитель для найденных монет и стоимости предметов.
* **Быстрая продажа** - разрешить или запретить игрокам обменивать найденные предметы на монеты прямо из чата.
* **Уменьшение стоимости вдвое** - снижать цену предметов на `50%` при быстрой продаже.
* **Мародёрство с токенов** - включение или отключение кнопки быстрого обыска при наведении на мёртвые токены.
* **Редактор имени** - открывать окно редактирования и переброса имени при создании предмета в Генераторе.
* **Скрыть достоинства** - скрывать в Генераторе шаблоны, состоящие только из одного достоинства.
* **Скрыть скрипты Генератора** - скрывать эффекты скриптов Генератора от игроков на листах предметов.
* **Совместимость свойств** - автоматически удалять взаимоисключающие достоинства и изъяны при генерации предмета.

**Интеграция с Меню отладки (`WFRP4e - Tools`):**
* **Импорт / Экспорт** - сохранение пользовательских шаблонов Мародёрства, Генератора и пользовательских скриптов в файл и их перенос в другие миры (с выбором замены или объединения).
* **Сброс пользовательских данных** - отдельная очистка пользовательских шаблонов Мародёрства, шаблонов Генератора или пользовательских скриптов.
* **Обновление скриптов** - пересоздание служебного предмета со скриптами Генератора при возникновении ошибок.

<details align="center">
<summary>📷 Скриншоты</summary>

![Меню отладки](https://github.com/user-attachments/assets/e79054f9-854b-4eb1-8552-ce2a0bb42818)

</details>

---

<a id="ru-modules"></a>
### 🧩 Связанные модули

* **[WFRP4e - Tools](https://github.com/nPocToI4eJI/wfrp4e-tools)** *(обязателен)* - базовый модуль инструментов, улучшений и исправлений для системы **Warhammer Fantasy Roleplay 4th Edition** в Foundry VTT.
* **[WFRP4e - Assistant](https://github.com/nPocToI4eJI/wfrp4e-assistant)** - этот модуль позволит Мастеру разнообразить НИП и их отыгрыш с помощью встроенных инструментов автоматизации.
* **[WFRP4e - Sounds](https://github.com/nPocToI4eJI/wfrp4e-sounds)** - этот модуль содержит звуковые файлы, адаптированные для звуковой системы `WFRP4e - Tools`.

---

<a id="-english"></a>

**WFRP4e - Looting** is a loot generation, quick corpse-looting, and unique item creation module for **Warhammer Fantasy Roleplay 4th Edition** on Foundry VTT. It helps the GM roll balanced loot in one click using customizable presets, lets players loot defeated tokens directly on the canvas, and allows crafting unique weapons, armour, and trappings with properties and special effects.

> [!IMPORTANT]
> This module **requires** the core **[WFRP4e - Tools](https://github.com/nPocToI4eJI/wfrp4e-tools)** module to be installed and enabled.

### 📋 Contents
- [Looting](#en-looting)
  - [Loot Presets & Builder](#en-looting-presets)
  - [Interactive Loot in Chat](#en-looting-chat)
  - [Quick Looting of Dead Tokens](#en-token-looting)
- [Item Generator](#en-generator)
  - [Modification Presets & Price Recalculation](#en-generator-presets)
  - [Generator Scripts](#en-generator-scripts)
- [Settings & Debug Menu](#en-settings)
- [Related Modules](#en-modules)

---

<a id="en-looting"></a>
### 💰 Looting

A button on the **Additional Tools** bar (`WFRP4e - Tools`) opens the **Looting** window featuring built-in and custom loot presets organized by wealth tier (*Brass*, *Silver*, *Gold*).

<details align="center">
<summary>📷 Screenshots</summary>

![Looting Window](https://github.com/user-attachments/assets/9c45092a-c449-493b-9c8d-d6d000e046b9)

</details>

---

<a id="en-looting-presets"></a>
#### 📦 Loot Presets & Builder
The module includes a collection of ready-to-use presets and a flexible editor for creating your own.

* **Quick Controls:** *LMB* - generate loot, *Alt + LMB* - view or edit a preset, *Ctrl + LMB* - duplicate an existing preset into custom presets.
* **Coin Configuration:** configure drop chances and roll formulas with exploding dice support for each currency (BP, SS, GC).
* **Tables & Items:** add built-in loot tables, custom RollTable entries (by key and column, supporting price formulas in the table description), and specific items from the world or compendiums.

<details align="center">
<summary>📷 Screenshots</summary>

![Looting Preset Editor](https://github.com/user-attachments/assets/733694a7-fa0a-411b-a061-9be367b543fb)

</details>

---

<a id="en-looting-chat"></a>
#### 💬 Interactive Loot in Chat
Generated loot is posted to chat as an interactive card synchronized across all connected users.

* **One-Click Claiming:** players can claim coins and items straight into their character's inventory (individually or all at once), or hold `Alt` to post an item or credit prompt to chat for open distribution.
* **Quick Sale:** found items can be immediately exchanged for coins directly from the loot card (the GM can restrict quick sale or halve item sale value in settings).
* **Real-Time Synchronization:** as soon as any player claims or sells an item, it disappears from the chat card for everyone else, preventing duplicate looting.
* **Miscellaneous Trappings:** when a generic trapping entry is rolled, the player chooses the appropriate sub-table for miscellaneous gear.

<details align="center">
<summary>📷 Screenshots</summary>

![Interactive Loot Card in Chat](https://github.com/user-attachments/assets/455312aa-ad37-4a5f-b523-6bcb08e16363)

</details>

---

<a id="en-token-looting"></a>
#### ☠️ Quick Looting of Dead Tokens
Lets players and the GM loot defeated enemies right on the canvas without extra clicks.

* **Button Above Token:** hovering over a dead token (0 Wounds or the Dead status) displays a treasure chest button right above it.
* **Actor Preset Binding:** the GM gets a **Set looting preset** button in the actor sheet header showing the currently assigned preset. If a preset is bound, clicking the button above the token immediately rolls loot; otherwise, the preset selection window opens.
* **Looted Status:** once looted, the token is automatically marked as looted and hides the button from players. The GM sees a translucent icon and can reset or toggle the looted status with **RMB**.

<details align="center">
<summary>📷 Screenshots</summary>

![Quick Loot Button](https://github.com/user-attachments/assets/7b9e392b-e941-4ac7-960a-c41b1b961c11)

![Binding a Looting Preset](https://github.com/user-attachments/assets/e3400078-1338-43ca-b343-d75b7080f2cf)

</details>

---

<a id="en-generator"></a>
### 🎲 Item Generator *(GM Only)*

A button in the **Items** directory header opens the **Item Generator**, allowing you to quickly craft unique weapons, ammunition, armour, and trappings based on any item from the world or compendiums.

<details align="center">
<summary>📷 Screenshots</summary>

![Item Generator Window](https://github.com/user-attachments/assets/c317177b-4663-4b69-b548-df275cf8859a)

</details>

---

<a id="en-generator-presets"></a>
#### 🛠️ Modification Presets & Price Recalculation
* **Combining Presets:** select one or multiple built-in and custom presets, as well as single-quality presets.
* **Qualities & Flaws:** supports specific properties and random category pools with configurable chances, quantities, and mutually exclusive pair checks.
* **Price Recalculation & Name Generation:** item cost is automatically recalculated according to system rules based on rolled Qualities and Flaws, while the name is assembled from prefixes, suffixes, or unique titles (with an optional edit and reroll dialog before creation).
* **Result Summary Card:** displays a post-generation breakdown showing price changes, added/cancelled properties, attached scripts, and quick buttons to open or delete the item.

<details align="center">
<summary>📷 Screenshots</summary>

![Generator Preset Editor](https://github.com/user-attachments/assets/bfcd1470-24a0-4e7d-b1f7-784942e6ae2c)

![Item Generation Result Window](https://github.com/user-attachments/assets/e4b59c2e-ec0b-450a-9203-263b8a5f32ba)

</details>

---

<a id="en-generator-scripts"></a>
#### ⚡ Generator Scripts
A mechanism for attaching special Active Effects to generated and regular items alike.

* **Scripts Editor:** built-in and custom effect bundles are managed in a dedicated scripts editor accessible from the **Items** tab and the Generator preset editor.
* **Manual Control on Any Item:** adds a GM button to the **Effects** tab of any item sheet (*LMB* - add Generator scripts, *RMB* - remove them from the item).
* **Hidden from Players:** settings allow hiding Generator scripts from players on item sheets - ideal for cursed or unidentified artifacts.

<details align="center">
<summary>📷 Screenshots</summary>

![Scripts Editor](https://github.com/user-attachments/assets/c6137b26-cc95-4bbc-b3b1-315ea908f357)

![Add Scripts Button](https://github.com/user-attachments/assets/901ba3e7-3703-4f79-97b2-9b2a896fd879)

</details>

---

<a id="en-settings"></a>
### ⚙️ Settings & Debug Menu

**Main Module Settings:**
* **Loot cost modifier** - additional multiplier for found coins and item values.
* **Quick sale** - allow or disallow players to exchange found items for coins directly from chat.
* **Halve item value** - reduce item value by `50%` during quick sale.
* **Token looting** - enable or disable the quick loot button when hovering over dead tokens.
* **Name editor** - open the name editing and reroll window when creating an item in the Generator.
* **Hide qualities** - hide Item Generator presets that contain only a single Quality.
* **Hide Generator Scripts** - hide Generator script effects from players on item sheets.
* **Property compatibility** - automatically remove mutually exclusive Qualities and Flaws during item generation.

**Debug Menu Integration (`WFRP4e - Tools`):**
* **Import / Export** - save custom Looting presets, Generator presets, and custom scripts to a file and transfer them to other worlds (with an option to replace or merge).
* **Reset Custom Data** - individually clear custom Looting presets, Generator presets, or custom scripts.
* **Update Scripts** - recreate the helper item storing Generator scripts if errors occur.

<details align="center">
<summary>📷 Screenshots</summary>

![Debug Menu](https://github.com/user-attachments/assets/e79054f9-854b-4eb1-8552-ce2a0bb42818)

</details>

---

<a id="en-modules"></a>
### 🧩 Related Modules

* **[WFRP4e - Tools](https://github.com/nPocToI4eJI/wfrp4e-tools)** *(required)* - core toolkit, quality-of-life, and bugfix module for **Warhammer Fantasy Roleplay 4th Edition** on Foundry VTT.
* **[WFRP4e - Assistant](https://github.com/nPocToI4eJI/wfrp4e-assistant)** - allows the GM to diversify NPCs and their roleplay using built-in automation tools.
* **[WFRP4e - Sounds](https://github.com/nPocToI4eJI/wfrp4e-sounds)** - contains sound files tailored for the `WFRP4e - Tools` audio system.
