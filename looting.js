let debugMessage = ["%cWFRP4e - Looting %c[debug]%c.", "font-weight: bold;", "color: orange;", ""];
//Пересоздание служебного предмета со скриптами Генератора
async function updateLootingScriptsItem() {
	if (!game.user.isGM) {return null};
	//Удаление старого предмета скриптов, если он есть
	let oldUuid = game.settings.get("wfrp4e-looting", "effectsItem");
	if (oldUuid) {
		let oldItem = await fromUuid(oldUuid);
		if (oldItem) {await oldItem.delete({onReset: true})};
	};
	//Создание нового предмета скриптов
	let newItem = await Item.implementation.create({
		name: game.i18n.localize("WFRP4E.Looting.Settings.effectsItem.Item.Name"),
		type: "trapping",
		img: "modules/wfrp4e-core/icons/unarmed.png",
		flags: {
			looting: {
				version: game.modules.get("wfrp4e-looting").version
			}
		},
		system: {
			description: {value: game.i18n.localize("WFRP4E.Looting.Settings.effectsItem.Item.Description")}
		},
		effects: [game.wfrp4e.looting.data.generator.effects.script].concat(
			game.wfrp4e.looting.data.generator.effects.default.map(s => s.effects).flat(1),
			game.settings.get("wfrp4e-looting", "customEffects").map(s => s.effects).flat(1)
		)
	}, {onReset: true});
	if (game.settings.get("wfrp4e-tools", "debug")) {
		console.debug(...debugMessage, "updateLootingScriptsItem \"newItem\"");
		console.debug(newItem);
	};
	await game.settings.set("wfrp4e-looting", "effectsItem", newItem.uuid);
	//Сокрытие предмета в списке
	let dirItem = document.querySelector(`li.directory-item.document.item[data-entry-id="${newItem.id}"]`);
	if (dirItem) {dirItem.hidden = true};
	return newItem;
};
//Перевод суммы в медных пенни в объект монет {gc, ss, bp, priceValue}
function bpToCoins(totalBp) {
	let priceValue = Math.max(0, Math.round(Number(totalBp) || 0));
	let gc = Math.floor(priceValue / 240);
	let ss = Math.floor((priceValue % 240) / 12);
	let bp = priceValue % 12;
	return {gc, ss, bp, priceValue};
};
//Форматирование монет в HTML-строку для сообщений чата
function formatCoinsHTML(coins) {
	return [
		coins.gc ? `<b style='margin: 0 1px;'>${coins.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}</b>` : "",
		coins.ss ? `<b style='margin: 0 1px;'>${coins.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}</b>` : "",
		coins.bp ? `<b style='margin: 0 1px;'>${coins.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}</b>` : ""
	].filter(Boolean).join("");
};
//Извлечение формулы цены из описания RollTable
function parseTablePrice(description) {
	if (!description) {return null};
	let wrapper = document.createElement("div");
	wrapper.innerHTML = description;
	let el = wrapper.querySelector("p#tablePrice");
	return el ? el.textContent.split("|") : null;
};

class WFRP4eLootingLoot extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		classes: ["WFRP4eLooting-loot", "WFRP4eLooting", "warhammer"],
		form: {
			submitOnChange: false,
			closeOnSubmit: false
		},
		window: {
			resizable: true,
			title: "WFRP4E.Looting.Loot.Title",
			icon: "fas fa-treasure-chest"
		},
		actions: {
			clickPreset: this._onClickPreset
		}
	};

	static PARTS = {
		form: {
			template: "modules/wfrp4e-looting/templates/loot/app.hbs",
		}
	};

	constructor(params, debug, options) {
		super(options);
		this.params = params;
		this.debug = debug;
		this.lootToken = options.token || null;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot constructor \"this\"");
			console.debug(this);
		};
	};

	static getAllPresets() {
		let defaults = game.wfrp4e.looting?.data?.defaultList || [];
		let custom = game.settings.get("wfrp4e-looting", "customLooting") || [];
		return defaults.concat(custom);
	};

	static getPresetById(id) {
		if (!id) {return null};
		return this.getAllPresets().find(p => p.id == id) || null;
	};

	async _prepareContext(options) {
		let context = await super._prepareContext(options);
		context.params = this.params;
		context.debug = this.debug;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot _prepareContext \"context\"");
			console.debug(context);
		};
		return context;
	};

	static async create(options={}) {
		this.debug = game.settings.get("wfrp4e-tools", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot create");
		};
		//Проверка на наличие активного окна мародёрства
		let existingApp = Array.from(foundry.applications.instances.values()).find(a => a instanceof WFRP4eLootingLoot);
		if (existingApp) {
			existingApp.lootToken = options.token || null;
			existingApp.bringToFront?.();
			return;
		};
		//Определение параметров
		let params = {
			default: game.wfrp4e.looting.data.defaultList,
			custom: game.settings.get("wfrp4e-looting", "customLooting")
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot create \"params\"");
			console.debug(params);
		};
		return new Promise(resolve => {
			options.resolve = resolve;
			new this(params, this.debug, options).render({force: true});
		});
	};

	static async _onClickPreset(event, button) {
		if (event.pointerId == -1) {return};
		//Определение типа шаблона и его id
		let type = button.dataset.type;
		let id = button.dataset.id;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot _onClickPreset \"type\", \"id\"");
			console.debug(type);
			console.debug(id);
		};
		if (button.classList.value.includes("add") || event.altKey || event.ctrlKey) {
			if (!game.user.isGM) {
				ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Errors.EditNotGM"));
				return;
			};
			//При добавлении нового пресета
			if (button.classList.value.includes("add")) {
				let newPreset = {
					id: foundry.utils.randomID(),
					name: game.i18n.localize("Name"),
					hint: game.i18n.localize("Description"),
					type: "brass",
					money: {
						bp: {
							chance: 0,
							dice: {count: 1, type: 10}
						},
						ss: {
							chance: 0,
							dice: {count: 1, type: 5}
						},
						gc: {
							chance: 0,
							dice: {count: 1, type: 1}
						}
					},
					tables: []
				};
				//Обновление параметров и настроек
				await game.settings.set("wfrp4e-looting", "customLooting", game.settings.get("wfrp4e-looting", "customLooting").concat(newPreset));
				this.params.custom = game.settings.get("wfrp4e-looting", "customLooting");
				this.element.querySelector("button.add").insertAdjacentHTML("beforebegin", `<button type="button" class="brass" data-action="clickPreset" data-type="custom" data-id="${newPreset.id}" data-tooltip="${newPreset.hint}<hr>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Ctrl")}">${newPreset.name + (this.debug ? " [" + newPreset.id + "]" : "")}</button>`);
				id = newPreset.id;
			//Копирование существующего шаблона
			} else if (event.ctrlKey) {
				let source = this.params[type].find(p => p.id == id);
				if (!source) {return};
				let newPreset = foundry.utils.deepClone(source);
				newPreset.id = foundry.utils.randomID();
				//Обновление параметров и настроек
				await game.settings.set("wfrp4e-looting", "customLooting", game.settings.get("wfrp4e-looting", "customLooting").concat(newPreset));
				this.params.custom = game.settings.get("wfrp4e-looting", "customLooting");
				this.element.querySelector("button.add").insertAdjacentHTML("beforebegin", `<button type="button" class="${newPreset.type}" data-action="clickPreset" data-type="custom" data-id="${newPreset.id}" data-tooltip="${newPreset.hint}<hr>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Ctrl")}">${newPreset.name + (this.debug ? " [" + newPreset.id + "]" : "")}</button>`);
				id = newPreset.id;
				type = "custom";
			};
			let targetPreset = this.params[type].find(p => p.id == id);
			if (!targetPreset) {return};
			//Окно просмотра настроек шаблона
			warhammer.apps.WFRP4eLootingLootPreset.create(foundry.utils.deepClone(targetPreset), type, this);
		} else {
			let targetPreset = this.params[type].find(p => p.id == id);
			if (!targetPreset) {return};
			if (this.lootToken) {
				let tokenDoc = this.lootToken;
				let flavor = `${game.i18n.localize("WFRP4E.Looting.Name")}: ${tokenDoc.name} (${targetPreset.name})`;
				await WFRP4eLootingLoot.rollLoot(targetPreset, {flavor});
				await markTokenLooted(tokenDoc, true);
				this.lootToken = null;
				await this.close();
			} else {
				await WFRP4eLootingLoot.rollLoot(targetPreset);
			};
		};
	};

	updateParams() {
		this.params.custom = game.settings.get("wfrp4e-looting", "customLooting");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot updateParams \"this.params.custom\"");
			console.debug(this.params.custom);
		};
	};

	async looting(preset, options = {}) {
		return WFRP4eLootingLoot.rollLoot(preset, options);
	};

	static async rollLoot(preset, {flavor} = {}) {
		if (!preset) {return null};
		let debug = game.settings.get("wfrp4e-tools", "debug");
		let modifier = Number(game.settings.get("wfrp4e-looting", "modifier")) || 1;
		//Определение значения денежной награды
		let rawMoney = {bp: 0, ss: 0, gc: 0};
		for (let key in rawMoney) {
			let entry = preset.money?.[key];
			if (!entry || Number(entry.chance) <= 0) {continue};
			let chanceRoll = (await new Roll("1d100").roll()).total;
			if (debug) {
				console.debug(...debugMessage, "WFRP4eLootingLoot rollLoot money", key, "\"chanceRoll\"");
				console.debug(chanceRoll);
			};
			if (chanceRoll <= Number(entry.chance)) {
				let diceCount = Number(entry.dice?.count) || 1;
				let diceType = Number(entry.dice?.type) || 1;
				let roll = await new Roll(`${diceCount}d${diceType}`).roll();
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot rollLoot money", key, "\"roll\"");
					console.debug(roll);
				};
				let critical = async () => {
					let criticalRoll = (await new Roll(`1d${diceType}`).roll()).total;
					if (debug) {
						console.debug(...debugMessage, "WFRP4eLootingLoot rollLoot money", key, "critical \"criticalRoll\"");
						console.debug(criticalRoll);
					};
					if (criticalRoll == diceType) {criticalRoll += await critical()};
					return criticalRoll;
				};
				for (let val of roll.dice[0].values) {
					rawMoney[key] += val;
					if (val == diceType && [10, 20, 100].includes(diceType)) {rawMoney[key] += await critical()};
				};
			};
		};
		//Конверсия денег
		let money = bpToCoins((rawMoney.bp + (rawMoney.ss * 12) + (rawMoney.gc * 240)) * modifier);
		if (debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot rollLoot \"money\"");
			console.debug(money);
		};

		//Определение предметов по таблицам
		let items = [];
		let otherTrappingName = game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name");
		for (let tableEntry of (preset.tables || [])) {
			let tableItems = [];
			if (Number(tableEntry.chance) <= 0) {continue};
			let chanceRoll = (await new Roll("1d100").roll()).total;
			if (debug) {
				console.debug(...debugMessage, "WFRP4eLootingLoot rollLoot items", tableEntry, "\"chanceRoll\"");
				console.debug(chanceRoll);
			};
			if (chanceRoll <= Number(tableEntry.chance)) {
				let count = 0;
				let diceCount = Number(tableEntry.dice?.count) || 1;
				let diceType = Number(tableEntry.dice?.type) || 1;
				for (let i = 0; i < diceCount; i++) {
					let roll = (await new Roll(`1d${diceType}`).roll()).total;
					count += roll;
					if (roll == diceType && [10, 20, 100].includes(diceType)) {i--};
				};
				if (debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot rollLoot items", tableEntry, "\"count\"");
					console.debug(count);
				};
				for (let i = 0; i < count; i++) {
					if (tableEntry.table?.key) {
						let table = game.wfrp4e.tables.findTable(tableEntry.table.key || "", tableEntry.table.column || "");
						if (!table) {continue};
						let results = (await table.roll()).results || [];
						let tablePrice = parseTablePrice(table.description) || [1, 1, "+0"];
						for (let res of results) {
							let rawPrice = {bp: 0, ss: 0, gc: 0};
							let rolledPrice = (await new Roll(`${tablePrice[0]}d${tablePrice[1]} ${tablePrice[2] || "+0"}`).roll()).total;
							if (preset.type === "brass") {rawPrice.bp = rolledPrice}
							else if (preset.type === "silver") {rawPrice.ss = rolledPrice}
							else if (preset.type === "gold") {rawPrice.gc = rolledPrice};
							let price = bpToCoins((rawPrice.bp + (rawPrice.ss * 12) + (rawPrice.gc * 240)) * modifier);
							let id = false;
							if (res.documentUuid) {id = res.documentUuid}
							else if (res.name == otherTrappingName) {id = "other"};
							tableItems.push({item: res.name, price, priceValue: price.priceValue, id, table: table.name});
						};
					} else if (tableEntry.table?.id) {
						let itemRef = tableEntry.table.id;
						let item = await fromUuid(itemRef) || game.items.get(itemRef.replace("Item.", ""));
						if (!item) {continue};
						let srcPrice = item.system?.price || item.price || {bp: 0, ss: 0, gc: 0};
						let price = bpToCoins((Number(srcPrice.bp) || 0) + ((Number(srcPrice.ss) || 0) * 12) + ((Number(srcPrice.gc) || 0) * 240));
						tableItems.push({item: item.name, price, priceValue: price.priceValue, id: item.uuid});
					} else {
						let table = game.wfrp4e.looting.data.lootTables.find(t => t.table == tableEntry.table);
						if (!table?.values?.length) {continue};
						let pool = [];
						table.values.forEach(t => {pool = pool.concat(Array(t.weight).fill(t.name))});
						let itemName = pool[Math.floor(CONFIG.Dice.randomUniform() * pool.length)];
						if (!itemName) {continue};
						let totalBp = 0;
						if (tableEntry?.price) {totalBp = Number(tableEntry.price) || 0}
						else if (table.price?.count && table.price?.type) {
							let rolledPrice = (await new Roll(`${table.price.count}d${table.price.type} ${table.price.mod || "+0"}`).roll()).total;
							let mult = preset.type === "gold" ? 240 : preset.type === "silver" ? 12 : 1;
							totalBp = rolledPrice * mult * modifier;
						};
						let price = bpToCoins(totalBp);
						let id = false;
						if (itemName == otherTrappingName) {id = "other"}
						else {
							let found = await game.wfrp4e.utility.findBaseName(itemName);
							if (found) {id = found.uuid || found.id || false};
						};
						tableItems.push({item: itemName, price, priceValue: price.priceValue, id, table: table.title});
					};
				};
			};
			items = items.concat(tableItems.sort((a, b) => a.item.localeCompare(b.item)));
		};
		if (debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot rollLoot \"items\"");
			console.debug(items);
		};
		let totalItemsBp = items.reduce((sum, it) => sum + (it.priceValue || 0), 0);
		let totalItemsPrice = bpToCoins(totalItemsBp);
		let params = {
			flavor: flavor || `${game.i18n.localize("WFRP4E.Looting.Name")} (${preset.name})`,
			user: game.user.character?.name || "",
			status: {
				money: money.priceValue > 0,
				items: items.length > 0,
				value: money.priceValue > 0 || items.length > 0
			},
			price: totalItemsPrice,
			priceValue: totalItemsPrice.priceValue,
			type: preset.type
		};
		if (debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot rollLoot \"params\"");
			console.debug(params);
		};
		//Вывод сообщения в чат
		let chatData = {
			user: game.user.id,
			content: await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-looting/templates/loot/chat.hbs", {money, items, params}),
			flavor: params.flavor
		};
		let message = await ChatMessage.create(ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode")));
		return message;
	};

	async close(options) {
		this.options.resolve?.();
		return super.close(options);
	};
};
warhammer.apps.WFRP4eLootingLoot = WFRP4eLootingLoot;

class WFRP4eLootingLootPreset extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		classes: ["WFRP4eLooting-editPreset", "WFRP4eLooting", "warhammer"],
		form: {
			submitOnChange: false,
			closeOnSubmit: true
		},
		window: {
			resizable: true,
			title: "WFRP4E.Looting.Loot.Preset.Title",
			icon: "fas fa-treasure-chest",
			contentClasses: ["standard-form"]
		},
		actions: {
			addTable: this._addTable,
			addCustomTable: this._addCustomTable,
			addItem: this._addItem,
			removeTable: this._removeTable,
			save: this._onSave,
			close: this._onClose,
			delete: this._onDelete
		}
	};

	static PARTS = {
		form: {
			template: "modules/wfrp4e-looting/templates/loot/edit.hbs",
		},
		footer: {
			template: "modules/wfrp4e-tools/templates/form-footer.hbs"
		}
	};

	constructor(preset, presetType, menu, debug, options) {
		super(options);
		this.preset = preset;
		this.type = preset.type
		this.menu = menu;
		this.debug = debug;
		this.presetType = presetType;
		this.tables = game.wfrp4e.looting.data.lootTables;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset constructor \"this\"");
			console.debug(this);
		};
	};

	async _onRender(context) {
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _onRender \"context\"");
			console.debug(context);
		};
		//Обозначение типа шаблона (медь, серебро, золото)
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _onRender \"type\"");
			console.debug(this.type);
		};
		//При изменении типа
		this.element.querySelector("select#type").addEventListener("change", (element) => {
			this.type = element.target.querySelector("option:checked").value;
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLootPreset _onRender select#type change \"type\"");
				console.debug(this.type);
			};
			//Изменение всех таблиц, имеющих зависимость от типа
			this.element.querySelectorAll("select#table").forEach(e => {
				let option = e.querySelector("option:checked");
				if (option?.dataset.type && option.dataset.type != this.type) {
					option.selected = false;
					let match = Array.from(e).find(o => o.dataset.type == this.type && o.textContent == option.textContent);
					if (match) {match.selected = true};
				};
				let activeOption = e.querySelector("option:checked");
				if (activeOption?.dataset.tooltip) {
					e.dataset.tooltip = activeOption.dataset.tooltip.replace(/(color: var\(--brass\)|color: var\(--silver\)|color: var\(--gold\))/g, `color: var(--${this.type})`);
				};
			});
			//Перекрашивание стоимости у пользовательских таблиц
			this.element.querySelectorAll("div.table").forEach(e => {
				if (e.dataset.tooltip) {
					e.dataset.tooltip = e.dataset.tooltip.replace(/(color: var\(--brass\)|color: var\(--silver\)|color: var\(--gold\))/g, `color: var(--${this.type})`);
				};
			});
		});
		//Обновление содержания подсказки таблиц
		this.element.querySelectorAll("select#table").forEach(e => {
			let checked = e.querySelector("option:checked");
			if (checked?.dataset.tooltip) {
				e.dataset.tooltip = checked.dataset.tooltip.replace(/(color: var\(--brass\)|color: var\(--silver\)|color: var\(--gold\))/, `color: var(--${this.type})`);
			};
			this.updateTable(e);
		});
		//Динамическая процентная шкала
		this.element.querySelectorAll("input#BP-chance, input#SS-chance, input#GC-chance, input#chance").forEach(e => {this.updateChances(e)});
		//Обработка пользовательских таблиц
		this.element.querySelectorAll("div.table").forEach(e => {
			let table = game.wfrp4e.tables.findTable(e.querySelector("input#tableKey").value || "", e.querySelector("input#tableColumn").value || "");
			if (table?.id) {
				let tablePrice = parseTablePrice(table.description) || [1, 1, "+0"];
				e.dataset.tooltip = "<div class='WFRP4eLooting-tooltip'>"
				+ "\n\t" + game.i18n.localize("DOCUMENT.RollTable") + ": " + table.name
				+ "\n\t<hr>"
				+ "\n\t" + game.i18n.localize("Cost") + ": <span style='color: var(--" + this.type + ");'>" + tablePrice[0] + "d" + tablePrice[1] + (tablePrice[2] || "") + "<i class='fas fa-coins'></i></span>"
				+ "\n\t<hr>"
				+ "\n\t<ul>"
				+ table?.results.map(t => "<li>" + t.name + " (" + t.weight + ")</li>").join("")
				+ "\n\t</ul>"
				+ "\n</div>";
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingLootPreset _onRender div.table \"tablePrice\", \"tooltip\"");
					console.debug(tablePrice);
					console.debug(e.dataset.tooltip);
				};
			} else {e.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.AddCustom.Missing")};
			this.updateCustomTable(e.querySelector("input#tableKey"));
			this.updateCustomTable(e.querySelector("input#tableColumn"));
		});
		//Обработка отдельных предметов
		this.element.querySelectorAll("input#tableID").forEach(e => {
			let item = fromUuidSync(e.value) || false;
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLootPreset _onRender input#tableID \"item\"");
				console.debug(item);
			};
			if (item) {
				e.dataset.tooltip = "<div class='WFRP4eLooting-tooltip'>" + game.i18n.localize("DOCUMENT.Item") + ": \"" + item.name + "\"<hr>" + game.i18n.localize("Cost") + ": <span>" + ([
					item.price.gc ? "<span style='color: var(--gold);'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</span>" : false,
					item.price.ss ? "<span style='color: var(--silver);'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</span>" : false,
					item.price.bp ? "<span style='color: var(--brass);'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</span>" : false
				].filter(Boolean).join(" ") || 0) + "</div>";
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingLootPreset _onRender input#tableID \"tooltip\"");
					console.debug(e.dataset.tooltip);
				};
			} else {e.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.AddItem.Missing")};
			this.updateItem(e);
		});
	};

	async _prepareContext(options) {
		let context = await super._prepareContext(options);
		context.preset = this.preset;
		context.debug = this.debug;
		context.tables = this.tables;
		context.presetType = this.presetType;
		//Кнопка сохранения или закрытия окна
		context.buttons = [{
			icon: this.presetType == "custom" ? "fas fa-save" : "fas fa-xmark",
			action: this.presetType == "custom" ? "save" : "close",
			default: true,
			label: this.presetType == "custom" ? "Save" : "Close"
		}];
		//Кнопка удаления для пользовательских шаблонов
		if (this.presetType == "custom") {
			context.buttons.unshift({
				action: "delete",
				icon: "fas fa-trash",
				label: "Delete"
			});
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _prepareContext \"context\"");
			console.debug(context);
		};
		return context;
	};

	/**
	 * Создание предмета с использованием генератора предметов WFRP4e - Looting
	 * @param {object} preset Шаблон Мародёрства.
	 * @param {string} presetType Тип шаблона. "custom" или "default".
	 * @param {WFRP4eLootingLoot} menu Окно основного меню Мародёрства
	 */
	static async create(preset, presetType, menu, options={}) {
		this.debug = game.settings.get("wfrp4e-tools", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset create");
		};
		//Определение названия шапки шаблона в соответствии с типом
		let title = (presetType == "custom" ? game.i18n.localize("WFRP4E.Looting.Loot.Preset.Title") : game.i18n.localize("WFRP4E.Looting.Loot.Preset.Default")) + (game.settings.get("wfrp4e-tools", "debug") ? " [ID: " + preset.id + "]" : "");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset create \"title\"");
			console.debug(title);
		};
		return new Promise(resolve => {
			options.resolve = resolve;
			new this(preset, presetType, menu, this.debug, options).render({force: true, window: {title}});
		});
	};

	static async _onSave() {
		this.preset = {
			id: this.preset.id,
			name: this.element.querySelector("#name").value,
			hint: this.element.querySelector("#hint").value,
			type: this.element.querySelector("#type").value,
			money: {
				bp: {
					chance: Number(this.element.querySelector("#BP-chance").value) || 0,
					dice: {count: Number(this.element.querySelector("#BP-diceCount").value) || 1, type: Number(this.element.querySelector("#BP-diceType").value) || 10}
				},
				ss: {
					chance: Number(this.element.querySelector("#SS-chance").value) || 0,
					dice: {count: Number(this.element.querySelector("#SS-diceCount").value) || 1, type: Number(this.element.querySelector("#SS-diceType").value) || 5}
				},
				gc: {
					chance: Number(this.element.querySelector("#GC-chance").value) || 0,
					dice: {count: Number(this.element.querySelector("#GC-diceCount").value) || 1, type: Number(this.element.querySelector("#GC-diceType").value) || 1}
				}
			},
			tables: Array.from(this.element.querySelectorAll("#tables > li")).map(t => ({
				table:
					t.querySelector("#table") ? t.querySelector("#table").value :
					t.querySelector("#tableID") ? {id: t.querySelector("#tableID").value} :
					{key: t.querySelector("#tableKey").value, column: t.querySelector("#tableColumn").value},
				chance: Number(t.querySelector("#chance").value) || 0,
				dice: {count: Number(t.querySelector("#diceCount").value) || 1, type: Number(t.querySelector("#diceType").value) || 10}
			})).filter(t => t.table && t.table !== "false")
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _onSave \"this.preset\"");
			console.debug(this.preset);
		};
		await game.settings.set("wfrp4e-looting", "customLooting", game.settings.get("wfrp4e-looting", "customLooting").map(p => p.id == this.preset.id ? this.preset : p));
		game.wfrp4e.tools.newNotification({text: game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Save")}, {color: "green"});
		if (this.menu?.element) {
			let button = this.menu.element.querySelector(`button[data-id="${this.preset.id}"]`);
			if (button) {
				button.classList.value = this.preset.type;
				button.dataset.tooltip = `${this.preset.hint}<hr>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Ctrl")}`;
				button.textContent = this.preset.name + (this.debug ? " [" + this.preset.id + "]" : "");
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingLootPreset _onSave menu \"button\"");
					console.debug(button);
				};
			};
			this.menu.updateParams();
		};
	};

	static async _onDelete() {
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _onDelete \"this.preset.id\"");
			console.debug(this.preset.id);
		};
		await game.settings.set("wfrp4e-looting", "customLooting", game.settings.get("wfrp4e-looting", "customLooting").filter(p => p.id != this.preset.id));
		if (this.menu?.element) {
			this.menu.element.querySelector(`button[data-id="${this.preset.id}"]`)?.remove();
			this.menu.updateParams();
		};
		await this.close();
	};

	static _addTable(event, button) {
		let table = document.createElement("li");
		table.innerHTML = "<div class='body'>"
			+ "\n\t<select id='table' style='width: 48%;'>"
			+ `\n\t\t<option hidden disabled selected value="false">${game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.Select")}</option>`
			+ this.tables.map(tab => `\n\t\t<option data-tooltip="<div class='WFRP4eLooting-tooltip'>${tab.price ? game.i18n.localize("Cost") + ": <span style='color: var(--" + this.type + ");'>" + tab.price.count + "d" + tab.price.type + tab.price.mod + " <i class='fas fa-coins'></i></span><hr>" : ""}${game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.Values")} (${tab.weights}):<ul>${tab.values.map(v => "<li>" + v.name + " (" + v.weight + ")</li>").join("")}</ul></div>" value='${tab.table}'${tab.type ? " data-type='" + tab.type + "'": ""}>${tab.title}</option>`).join("\n")
			+ "\n\t</select>"
			+ "\n\t<div style='width: 32%;'>"
			+ "\n\t\t<input id='chance' type='range' value='50' min='0' max='100'>"
			+ "\n\t\t<output>50%</output>"
			+ "\n\t</div>"
			+ "\n\t<div style='width: 16%;'>"
			+ "\n\t\t<input id='diceCount' style='flex: 2;' type='number' value='1' min='1' step='1'>"
			+ "\n\t\t<span style='flex: 1;'>d</span>"
			+ "\n\t\t<select id='diceType' style='flex: 3;'>"
			+ "\n\t\t\t<option>1</option>"
			+ "\n\t\t\t<option>2</option>"
			+ "\n\t\t\t<option>5</option>"
			+ "\n\t\t\t<option selected>10</option>"
			+ "\n\t\t\t<option>20</option>"
			+ "\n\t\t\t<option>100</option>"
			+ "\n\t\t</select>"
			+ "\n\t</div>"
			+ "\n\t<button type='button' data-action='removeTable' style='width: 4%;' data-tooltip='" + game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.Remove") + "'><i class='fas fa-trash'></i></button>"
			+ "\n</div>";
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _addTable \"innerHTML\"");
			console.debug(table.innerHTML);
		};
		this.updateChances(table.querySelector("input#chance"));
		this.updateTable(table.querySelector("select#table"));
		button.closest("div.tables").querySelector("ul#tables").insertAdjacentElement("beforeend", table);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _addTable \"table\"");
			console.debug(table);
		};
	};

	static _addCustomTable(event, button) {
		let table = document.createElement("li");
		table.innerHTML = "<div class='body'>"
			+ "\n\t<div class='table' style='width: 48%;'>"
			+ `\n\t\t<input id="tableKey" style="flex: 1;" type="string" value="" placeholder="${game.i18n.localize("TABLE.Key")}">`
			+ `\n\t\t<input id="tableColumn" style="flex: 1;" type="string" value="" placeholder="${game.i18n.localize("TABLE.Column")}">`
			+ "\n\t</div>"
			+ "\n\t<div style='width: 32%;'>"
			+ "\n\t\t<input id='chance' type='range' value='50' min='0' max='100'>"
			+ "\n\t\t<output>50%</output>"
			+ "\n\t</div>"
			+ "\n\t<div style='width: 16%;'>"
			+ "\n\t\t<input id='diceCount' style='flex: 2;' type='number' value='1' min='1' step='1'>"
			+ "\n\t\t<span style='flex: 1;'>d</span>"
			+ "\n\t\t<select id='diceType' style='flex: 3;'>"
			+ "\n\t\t\t<option>1</option>"
			+ "\n\t\t\t<option>2</option>"
			+ "\n\t\t\t<option>5</option>"
			+ "\n\t\t\t<option selected>10</option>"
			+ "\n\t\t\t<option>20</option>"
			+ "\n\t\t\t<option>100</option>"
			+ "\n\t\t</select>"
			+ "\n\t</div>"
			+ "\n\t<button type='button' data-action='removeTable' style='width: 4%;' data-tooltip='" + game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.Remove") + "'><i class='fas fa-trash'></i></button>"
			+ "\n</div>";
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _addCustomTable \"innerHTML\"");
			console.debug(table.innerHTML);
		};
		this.updateChances(table.querySelector("input#chance"));
		this.updateCustomTable(table.querySelector("input#tableKey"));
		this.updateCustomTable(table.querySelector("input#tableColumn"));
		button.closest("div.tables").querySelector("ul#tables").insertAdjacentElement("beforeend", table);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _addCustomTable \"table\"");
			console.debug(table);
		};
	};

	static _addItem(event, button) {
		let table = document.createElement("li");
		table.innerHTML = "<div class='body'>"
			+ "\n\t<input id='tableID' style='width: 48%; text-align: center;' type='string' value='' placeholder='UUID'>"
			+ "\n\t<div style='width: 32%;'>"
			+ "\n\t\t<input id='chance' type='range' value='50' min='0' max='100'>"
			+ "\n\t\t<output>50%</output>"
			+ "\n\t</div>"
			+ "\n\t<div style='width: 16%;'>"
			+ "\n\t\t<input id='diceCount' style='flex: 2;' type='number' value='1' min='1' step='1'>"
			+ "\n\t\t<span style='flex: 1;'>d</span>"
			+ "\n\t\t<select id='diceType' style='flex: 3;'>"
			+ "\n\t\t\t<option>1</option>"
			+ "\n\t\t\t<option>2</option>"
			+ "\n\t\t\t<option>5</option>"
			+ "\n\t\t\t<option selected>10</option>"
			+ "\n\t\t\t<option>20</option>"
			+ "\n\t\t\t<option>100</option>"
			+ "\n\t\t</select>"
			+ "\n\t</div>"
			+ "\n\t<button type='button' data-action='removeTable' style='width: 4%;' data-tooltip='" + game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.Remove") + "'><i class='fas fa-trash'></i></button>"
			+ "\n</div>";
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _addItem \"innerHTML\"");
			console.debug(table.innerHTML);
		};
		this.updateChances(table.querySelector("input#chance"));
		this.updateItem(table.querySelector("input#tableID"));
		button.closest("div.tables").querySelector("ul#tables").insertAdjacentElement("beforeend", table);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _addItem \"table\"");
			console.debug(table);
		};
	};

	static _removeTable(event, button) {
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _removeTable \"button\"");
			console.debug(button);
		};
		button.closest("li").remove();
	};

	updateChances(element) {
		element.addEventListener("input", (e) => {
			e.target.nextElementSibling.value = e.target.value + "%";
		});
	};

	updateTable(element) {
		element.addEventListener("change", (e) => {
			e.target.dataset.tooltip = e.target.querySelector("option:checked").dataset.tooltip.replace(/(color: var\(--brass\)|color: var\(--silver\)|color: var\(--gold\))/, `color: var(--${this.type})`);
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLootPreset updateTable \"tooltip\"");
				console.debug(e.target.dataset.tooltip);
			};
		});
	};

	updateCustomTable(element) {
		element.addEventListener("change", (e) => {
			let parent = e.target.parentElement;
			let table = game.wfrp4e.tables.findTable(parent.querySelector("input#tableKey").value || "", parent.querySelector("input#tableColumn").value || "");
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLootPreset updateCustomTable \"parent\",  \"table\"");
				console.debug(parent);
				console.debug(table);
			};
			if (table?.id) {
				let tablePrice = parseTablePrice(table.description);
				if (tablePrice) {
					tablePrice = tablePrice?.textContent?.split("|") || [1, 1, "+0"];
					parent.dataset.tooltip = "<div class='WFRP4eLooting-tooltip'>"
					+ "\n\t" + game.i18n.localize("DOCUMENT.RollTable") + ": " + table.name
					+ "\n\t<hr>"
					+ "\n\t" + game.i18n.localize("Cost") + ": <span style='color: var(--" + this.type + ");'>" + tablePrice[0] + "d" + tablePrice[1] + (tablePrice[2] || "") + "<i class='fas fa-coins'></i></span>"
					+ "\n\t<hr>"
					+ "\n\t<ul>"
					+ table?.results.map(t => "<li>" + t.name + " (" + t.weight + ")</li>").join("")
					+ "\n\t</ul>"
					+ "\n</div>";
					if (this.debug) {
						console.debug(...debugMessage, "WFRP4eLootingLootPreset updateCustomTable \"tablePrice\", \"tooltip\"");
						console.debug(tablePrice);
						console.debug(parent.dataset.tooltip);
					};
				} else {
					parent.dataset.tooltip = "<div class='WFRP4eLooting-tooltip'>"
					+ "\n\t" + game.i18n.localize("DOCUMENT.RollTable") + ": " + table.name
					+ "\n\t<hr>"
					+ "\n\t" + game.i18n.localize("Cost") + ": <span style='color: var(--" + this.type + ");'>" + game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.AddCustom.EmptyPrice") + "<i class='fas fa-coins'></i></span>"
					+ "\n\t<hr>"
					+ "\n\t<ul>"
					+ table?.results.map(t => "<li>" + t.name + " (" + t.weight + ")</li>").join("")
					+ "\n\t</ul>"
					+ "\n</div>";
				};
			} else {parent.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.AddCustom.Missing")};
		});
	};

	updateItem(element) {
		element.addEventListener("change", (e) => {
			let item = fromUuidSync(e.target.value) || game.items.get(e.target.value.replace("Item.", "")) || false;
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLootPreset updateItem \"item\"");
				console.debug(item);
			};
			if (item) {
				e.target.dataset.tooltip = "<div class='WFRP4eLooting-tooltip'>" + game.i18n.localize("DOCUMENT.Item") + ": \"" + item.name + "\"<hr>" + game.i18n.localize("Cost") + ": <span>" + ([
					item.price.gc ? "<span style='color: var(--gold);'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</span>" : false,
					item.price.ss ? "<span style='color: var(--silver);'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</span>" : false,
					item.price.bp ? "<span style='color: var(--brass);'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</span>" : false
				].filter(Boolean).join(" ") || 0) + "</div>";
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingLootPreset updateItem \"tooltip\"");
					console.debug(e.target.dataset.tooltip);
				};
			} else {e.target.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.AddItem.Missing")};
		});
	};

	static _onClose() {this.close()};

	async close(options) {
		this.options.resolve?.();
		return super.close(options);
	};
};
warhammer.apps.WFRP4eLootingLootPreset = WFRP4eLootingLootPreset;

Hooks.on("renderChatMessageHTML", (message, html) => {
	let chatRoot = html.querySelector("div#WFRP4eLooting-chat");
	if (!chatRoot) {return};
	let debug = game.settings.get("wfrp4e-tools", "debug");
	//Получить монеты
	async function takeMoney(coins, actor, alt) {
		let value = coins.bp + game.i18n.localize("MARKET.Abbrev.BP") + coins.ss + game.i18n.localize("MARKET.Abbrev.SS") + coins.gc + game.i18n.localize("MARKET.Abbrev.GC");
		if (debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage takeMoney \"value\"");
			console.debug(value);
		};
		if (actor && !alt) {
			let updatedMoney = game.wfrp4e.market.creditCommand(game.wfrp4e.market.amountToString(game.wfrp4e.market.parseMoneyTransactionString(value)), actor);
			if (updatedMoney) {await actor.updateEmbeddedDocuments("Item", updatedMoney)}
			else {return true};
		} else {
			CreditMessageModel.createCreditMessage(value, "", {reason: coins.name});
		};
		return false;
	};
	//Получить предмет
	async function takeItem(item, actor, alt) {
		let itemDoc;
		if (typeof item.value === "object" && item.value !== null) {
			let data = item.value.toObject();
			data.system.price = {bp: item.price.bp, ss: item.price.ss, gc: item.price.gc};
			if (data.system.encumbrance?.value == null) {
				data.system.encumbrance = Object.assign({}, data.system.encumbrance, {value: 0});
			};
			itemDoc = new ItemWFRP4e(data);
		} else {
			itemDoc = new ItemWFRP4e({
				name: item.value,
				type: "trapping",
				img: "modules/wfrp4e-core/icons/equipment/trapping.png",
				system: {
					price: {bp: item.price.bp, ss: item.price.ss, gc: item.price.gc},
					encumbrance: {value: 0},
					quantity: {value: 1},
					trappingType: {value: "misc"}
				}
			});
		};
		if (debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage takeItem \"itemDoc\"");
			console.debug(itemDoc);
		};
		if (actor && !alt) {
			await actor.createEmbeddedDocuments("Item", [itemDoc.toObject()]);
			let priceText = formatCoinsHTML(item.price);
			await ChatMessage.create(ChatMessage.applyRollMode(
				{
					user: game.user.id,
					content: `<p style="text-align: center; font-size: var(--font-size-14, 0.875rem);"><b>${actor.link}</b> ${game.i18n.localize("WFRP4E.Looting.Loot.Chat.Get")} <b data-tooltip="<i class='fas fa-coins'></i> ${priceText}">"${itemDoc.name}"</b>.</p>`,
					flavor: message.flavor || game.i18n.localize("WFRP4E.Looting.Name")
				},
				game.settings.get("core", "rollMode")
			));
		} else {itemDoc.postItem(1)};
	};
	//Разрешение предмета из строки <li> (возвращает null, если пользователь отменил выбор "other")
	async function resolveLootItem(liEl, fallbackName) {
		let itemKey = liEl.dataset.item;
		if (itemKey === "other") {
			let otherTables = game.wfrp4e.looting.data.lootTables.filter(t => t.table.includes("Other-"));
			let choice = await ItemDialog.create(
				otherTables.map((t, index) => Object.assign({}, t, {name: t.title, value: t.table, id: index})),
				1,
				{text: game.i18n.localize("WFRP4E.Looting.Loot.Chat.Other"), title: game.i18n.localize("CONTROLS.CommonSelect"), defaultValue: "0"}
			);
			if (!choice?.length) {return null};
			let table = otherTables.find(t => t.table == choice[0].value);
			if (!table?.values?.length) {return null};
			let pool = [];
			table.values.forEach(t => {pool = pool.concat(Array(t.weight).fill(t.name))});
			let newItemName = pool[Math.floor(CONFIG.Dice.randomUniform() * pool.length)];
			return await game.wfrp4e.utility.findBaseName(newItemName) || newItemName;
		};
		if (itemKey) {
			let doc = (itemKey.includes(".") ? await fromUuid(itemKey) : null) || game.items.get(itemKey);
			if (doc) {return doc};
		};
		return await game.wfrp4e.utility.findBaseName(fallbackName) || fallbackName;
	};
	async function complete() {
		if (game.dice3d && game.settings.get("wfrp4e", "throwMoney")) {
			let type = chatRoot.dataset.type;
			new Roll(`${type == "brass" ? 3 : type == "silver" ? 10 : 25}dc`).evaluate({allowInteractive: false}).then((roll) => {
				game.dice3d.showForRoll(roll, game.user, true);
			});
		};
		let newContent = chatRoot.outerHTML;
		if (game.user.isGM || message.isOwner) {await message.update({content: newContent})}
		else {game.socket.emit("module.wfrp4e-tools", {name: "lootingEditMessage", args: [message.id, newContent]})};
	};
	let actor = game.user.character || false;
	if (debug) {
		console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage \"actor\"");
		console.debug(actor);
	};
	//Отдельные предметы
	chatRoot.querySelectorAll("li[data-type='item'] a").forEach(button => {
		button.addEventListener("click", async (event) => {
			let a = event.target.closest("a");
			let li = event.target.closest("li");
			let ul = event.target.closest("ul");
			let p = ul?.previousElementSibling;
			if (!a || !li || !ul || !p || li.dataset.busy) {return};
			li.dataset.busy = "1";
			let itemPriceBp = parseInt(li.dataset.pricevalue) || 0;
			let item = {price: bpToCoins(itemPriceBp)};
			if (a.hasAttribute("data-money")) {
				if (!game.settings.get("wfrp4e-looting", "sellItems")) {
					delete li.dataset.busy;
					ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Settings.sellItems.Error"));
					return;
				};
				let sellBp = Math.floor(itemPriceBp * (game.settings.get("wfrp4e-looting", "itemsModifier") ? 0.5 : 1));
				if (await takeMoney(bpToCoins(sellBp), actor, event.altKey)) {delete li.dataset.busy; return};
			} else if (li.hasAttribute("data-item")) {
				let resolved = await resolveLootItem(li, a.textContent);
				if (resolved === null) {delete li.dataset.busy; return};
				item.value = resolved;
				await takeItem(item, actor, event.altKey);
			};
			//Изменение самого сообщения
			if (ul.children.length <= 1) {
				p.remove();
				ul.remove();
			} else {
				let remPrice = bpToCoins((parseInt(p.dataset.pricevalue) || 0) - itemPriceBp);
				p.dataset.pricevalue = remPrice.priceValue;
				p.querySelector("a[data-money]").innerHTML = `<i class="fas fa-coins"></i>${formatCoinsHTML(remPrice)}`;
				li.remove();
			};
			complete();
		});
	});
	//Все предметы
	chatRoot.querySelectorAll("p[data-type='items'] a").forEach(button => {
		button.addEventListener("click", async (event) => {
			let a = event.target.closest("a");
			let p = event.target.closest("p[data-type='items']");
			let ul = p?.nextElementSibling;
			if (!a || !p || !ul) {return};
			if (a.hasAttribute("data-money")) {
				if (!game.settings.get("wfrp4e-looting", "sellItems")) {
					ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Settings.sellItems.Error"));
					return;
				};
				let sellBp = Math.floor((parseInt(p.dataset.pricevalue) || 0) * (game.settings.get("wfrp4e-looting", "itemsModifier") ? 0.5 : 1));
				if (await takeMoney(bpToCoins(sellBp), actor, event.altKey)) {return};
				//Изменение самого сообщения
				ul.remove();
				p.remove();
				complete();
			} else if (a.hasAttribute("data-item")) {
				let remainingBp = parseInt(p.dataset.pricevalue) || 0;
				let changed = false;
				for (let li of Array.from(ul.children)) {
					let itemPriceBp = parseInt(li.dataset.pricevalue) || 0;
					let resolved = await resolveLootItem(li, li.querySelector("a")?.textContent || "");
					if (resolved === null) {continue};
					await takeItem({price: bpToCoins(itemPriceBp), value: resolved}, actor, event.altKey);
					remainingBp -= itemPriceBp;
					li.remove();
					changed = true;
				};
				if (!changed) {return};
				//Изменение самого сообщения
				if (!ul.children.length) {
					ul.remove();
					p.remove();
				} else {
					let remPrice = bpToCoins(remainingBp);
					p.dataset.pricevalue = remPrice.priceValue;
					p.querySelector("a[data-money]").innerHTML = `<i class="fas fa-coins"></i>${formatCoinsHTML(remPrice)}`;
				};
				complete();
			};
		});
	});
	//Все монеты
	chatRoot.querySelectorAll("p[data-type='money'] a").forEach(button => {
		button.addEventListener("click", async (event) => {
			let p = event.target.closest("p");
			if (!p || p.dataset.busy) {return};
			p.dataset.busy = "1";
			let coins = bpToCoins(parseInt(p.dataset.pricevalue) || 0);
			if (await takeMoney(coins, actor, event.altKey)) {delete p.dataset.busy; return};
			//Изменение самого сообщения
			p.remove();
			complete();
		});
	});
});

//Отметка токена как обысканного
async function markTokenLooted(tokenDoc, state = true) {
	if (!tokenDoc) {return};
	if (game.user.isGM) {await tokenDoc.update({"flags.looting.looted": Boolean(state)})}
	else {game.socket.emit("module.wfrp4e-tools", {name: "lootingMarkToken", args: [tokenDoc.uuid, Boolean(state)]})};
	hideTokenLootButton();
};

//Кнопка привязки шаблона мародёрства в заголовке листа актёра
Hooks.on("getHeaderControlsActorSheetV2", (sheet, controls) => {
	let actor = sheet.document;
	if (!["character", "npc", "creature"].includes(actor.type) || !sheet.isEditable || !game.user.isGM) {return};
	let boundId = actor.flags?.looting?.preset || "";
	let boundPreset = WFRP4eLootingLoot.getPresetById(boundId);
	let baseLabel = game.i18n.localize("WFRP4E.Looting.Loot.Token.BindPreset");
	let label = boundPreset ? `${baseLabel} (${boundPreset.name})` : baseLabel;
	let controlEntry = {
		icon: "fas fa-treasure-chest",
		label,
		onClick: async () => {
			const tierIcons = {
				brass: "modules/wfrp4e-core/icons/currency/brasspenny.png",
				silver: "modules/wfrp4e-core/icons/currency/silvershilling.png",
				gold: "modules/wfrp4e-core/icons/currency/goldcrown.png"
			};
			let list = [
				{
					name: game.i18n.localize("WFRP4E.Looting.Loot.Token.BindNone"),
					value: "",
					img: "systems/wfrp4e/icons/buildings/cross.png"
				}
			].concat(WFRP4eLootingLoot.getAllPresets().map(p => ({
				name: p.name,
				value: p.id,
				img: tierIcons[p.type] || "systems/wfrp4e/icons/buildings/scroll.png",
				description: p.hint
			})));
			let choice = await ItemDialog.create(list, 1, {
				text: game.i18n.localize("WFRP4E.Looting.Loot.Token.BindHint"),
				title: baseLabel
			});
			if (!choice?.length) {return};
			let chosenId = choice[0].value;
			await actor.update({"flags.looting.preset": chosenId}, {onReset: true});
			let chosenPreset = WFRP4eLootingLoot.getPresetById(chosenId);
			let newLabel = chosenPreset ? `${baseLabel} (${chosenPreset.name})` : baseLabel;
			controlEntry.label = newLabel;
			if (sheet.element) {
				sheet.element.querySelectorAll("button:has(> i.fa-treasure-chest), li:has(i.fa-treasure-chest) button").forEach(btn => {
					let labelSpan = btn.querySelector(".control-label, span");
					if (labelSpan) {labelSpan.textContent = newLabel}
					else {btn.innerHTML = `<i class="fas fa-treasure-chest" inert></i> ${newLabel}`};
					if (btn.dataset.tooltip) {btn.dataset.tooltip = newLabel};
					if (btn.ariaLabel) {btn.ariaLabel = newLabel};
				});
			};
			let notifyText = chosenPreset
				? game.i18n.format("WFRP4E.Looting.Loot.Token.BindSaved", {actor: actor.name, preset: chosenPreset.name})
				: game.i18n.format("WFRP4E.Looting.Loot.Token.BindCleared", {actor: actor.name});
			game.wfrp4e.tools.newNotification({text: notifyText}, {color: "green"});
		}
	};
	controls.push(controlEntry);
});

//Кнопка лутинга поверх мёртвого токена при наведении мыши
let tokenLootBtn = null;
let tokenLootHideTimer = null;
let tokenLootHoveredToken = null;
let tokenLootInProgress = new Set();

function isTokenDeadAndLootable(token) {
	if (!token?.actor || !token.document) {return false};
	if (!game.user.isGM && token.document.hidden) {return false};
	let actor = token.actor;
	let isDead = Boolean(
		actor.hasCondition?.("dead") ||
		token.document.hasStatusEffect?.("dead") ||
		(actor.system?.status?.wounds?.value ?? 1) <= 0
	);
	if (!isDead) {return false};
	let hasPreset = Boolean(actor.flags?.looting?.preset);
	if (!["npc", "creature"].includes(actor.type) && !hasPreset) {return false};
	let isLooted = Boolean(token.document.flags?.looting?.looted);
	if (isLooted && !game.user.isGM) {return false};
	return true;
};

function hideTokenLootButton() {
	if (tokenLootHideTimer) {
		clearTimeout(tokenLootHideTimer);
		tokenLootHideTimer = null;
	};
	if (tokenLootBtn) {
		tokenLootBtn.remove();
		tokenLootBtn = null;
	};
	tokenLootHoveredToken = null;
};

function scheduleHideTokenLootButton() {
	if (tokenLootHideTimer) {clearTimeout(tokenLootHideTimer)};
	tokenLootHideTimer = setTimeout(() => {hideTokenLootButton()}, 250);
};

function positionTokenLootButton(token) {
	if (!tokenLootBtn || !token || !canvas?.app?.view) {return};
	let rect = canvas.app.view.getBoundingClientRect();
	let cx = token.x + (token.w / 2);
	let topY = token.y;
	let pos = canvas.stage.worldTransform.apply({x: cx, y: topY});
	let btnW = tokenLootBtn.offsetWidth || 36;
	let btnH = tokenLootBtn.offsetHeight || 36;
	let left = Math.min(Math.max(rect.left + pos.x - (btnW / 2), 4), window.innerWidth - btnW - 4);
	let top = Math.min(Math.max(rect.top + pos.y - btnH - 6, 4), window.innerHeight - btnH - 4);
	tokenLootBtn.style.left = `${left}px`;
	tokenLootBtn.style.top = `${top}px`;
};

function showTokenLootButton(token) {
	if (tokenLootHideTimer) {
		clearTimeout(tokenLootHideTimer);
		tokenLootHideTimer = null;
	};
	if (token.isPreview) {return};
	if (tokenLootHoveredToken === token && tokenLootBtn?.isConnected) {
		positionTokenLootButton(token);
		return;
	};
	hideTokenLootButton();
	if (!canvas?.app?.view) {return};
	let tokenDoc = token.document;
	let isLooted = Boolean(tokenDoc.flags?.looting?.looted);
	let preset = WFRP4eLootingLoot.getPresetById(token.actor?.flags?.looting?.preset);
	let tooltip = preset
		? game.i18n.format("WFRP4E.Looting.Loot.Token.TooltipPreset", {name: tokenDoc.name, preset: preset.name})
		: game.i18n.format("WFRP4E.Looting.Loot.Token.TooltipOpen", {name: tokenDoc.name});
	if (isLooted && game.user.isGM) {tooltip += `<hr>${game.i18n.localize("WFRP4E.Looting.Loot.Token.AlreadyLooted")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Token.ResetHint")}`};
	let btn = document.createElement("button");
	btn.type = "button";
	btn.classList.add("wfrp4eLooting-tokenBtn");
	if (isLooted) {btn.classList.add("looted")};
	btn.dataset.tooltip = tooltip;
	btn.innerHTML = `<i class="fas fa-treasure-chest"></i>`;
	btn.addEventListener("mouseenter", () => {
		if (tokenLootHideTimer) {
			clearTimeout(tokenLootHideTimer);
			tokenLootHideTimer = null;
		};
	});
	btn.addEventListener("mouseleave", () => {scheduleHideTokenLootButton()});
	btn.addEventListener("click", async (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (tokenLootInProgress.has(tokenDoc.uuid)) {return};
		hideTokenLootButton();
		let activePreset = WFRP4eLootingLoot.getPresetById(token.actor?.flags?.looting?.preset);
		if (activePreset) {
			tokenLootInProgress.add(tokenDoc.uuid);
			try {
				let flavor = `${game.i18n.localize("WFRP4E.Looting.Name")}: ${tokenDoc.name} (${activePreset.name})`;
				await WFRP4eLootingLoot.rollLoot(activePreset, {flavor});
				await markTokenLooted(tokenDoc, true);
			} finally {tokenLootInProgress.delete(tokenDoc.uuid)};
		} else {await WFRP4eLootingLoot.create({token: tokenDoc})};
	});
	//Для ГМ: ПКМ по кнопке сбрасывает или выставляет статус "Уже обыскано"
	btn.addEventListener("contextmenu", async (event) => {
		if (!game.user.isGM) {return};
		event.preventDefault();
		event.stopPropagation();
		let nextState = !Boolean(tokenDoc.flags?.looting?.looted);
		await markTokenLooted(tokenDoc, nextState);
		hideTokenLootButton();
		let msgKey = nextState ? "WFRP4E.Looting.Loot.Token.MarkedLooted" : "WFRP4E.Looting.Loot.Token.MarkedUnlooted";
		game.wfrp4e.tools.newNotification({text: game.i18n.format(msgKey, {name: tokenDoc.name})}, {color: "blue"});
	});
	document.body.appendChild(btn);
	tokenLootBtn = btn;
	tokenLootHoveredToken = token;
	positionTokenLootButton(token);
};

Hooks.on("hoverToken", (token, hovered) => {
	if (!game.settings.get("wfrp4e-looting", "tokenLootButton")) {return};
	if (hovered) {
		if (isTokenDeadAndLootable(token)) {showTokenLootButton(token)}
		else if (tokenLootHoveredToken === token) {scheduleHideTokenLootButton()};
	} else if (tokenLootHoveredToken === token) {scheduleHideTokenLootButton()};
});
Hooks.on("refreshToken", (token) => {
	if (token === tokenLootHoveredToken && tokenLootBtn?.isConnected) {
		if (token.isPreview || !isTokenDeadAndLootable(token)) {hideTokenLootButton()}
		else {positionTokenLootButton(token)};
	};
});
Hooks.on("updateToken", (tokenDoc) => {if (tokenLootHoveredToken?.document?.id === tokenDoc.id) {hideTokenLootButton()}});
Hooks.on("canvasPan", hideTokenLootButton);
Hooks.on("canvasTearDown", hideTokenLootButton);
Hooks.on("deleteToken", (tokenDoc) => {if (tokenLootHoveredToken?.document?.id === tokenDoc.id) {hideTokenLootButton()}});

class WFRP4eLootingGenerator extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		classes: ["WFRP4eLooting-generator", "WFRP4eLooting", "warhammer"],
		form: {
			submitOnChange: false,
			closeOnSubmit: false
		},
		window: {
			resizable: true,
			title: "WFRP4E.Looting.Generator.Title",
			icon: "fas fa-dice-d20"
		},
		actions: {
			clickPreset: this._onClickPreset,
			create: this.onCreate
		}
	};

	static PARTS = {
		form: {
			template: "modules/wfrp4e-looting/templates/generator/app.hbs",
		}
	};

	constructor(params, debug, options) {
		super(options);
		this.params = params;
		this.debug = debug;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator constructor \"this\"");
			console.debug(this);
		};
	};

	async _onRender(context) {
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onRender \"context\"");
			console.debug(context);
		};
		//При обновлении типа предметов
		this.element.querySelector("select#type").addEventListener("change", (e) => {
			this.type = e.target.querySelector("option:checked").dataset.type;
			let type = e.target.value;
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGenerator change select#type \"type\"");
				console.debug(type);
			};
			//Скрытие кнопки создания
			this.element.querySelector("button[data-action='create']").hidden = true;
			//Переключение отображения параметров предмета в зависимости от типа
			this.element.querySelectorAll("div.base_item").forEach(d => {
				let dataType = e.target.querySelector("option:checked").dataset.type;
				if (d.classList.value.includes(dataType)) {d.hidden = false}
				else {d.hidden = true};
			});
			//Обновление параметров предмета
			this.updateItem();
			//Изменение отображаемых предметов в соответствии с их типом
			e.target.nextElementSibling.querySelectorAll(`option[data-type="${type}"]`).forEach(o => {o.hidden = false});
			e.target.nextElementSibling.querySelectorAll(`option:not([data-type="${type}"])`).forEach(o => {
				if (o.dataset.type) {
					o.hidden = true;
					o.selected = false;
				} else {
					o.hidden = false;
					o.selected = true;
				};
			});
			//Изменение отображаемых шаблонов в соответствии с их типом
			this.element.querySelector("div.presets").hidden = false;
			this.element.querySelectorAll("div.presets > label").forEach(l => {
				let labelTypes = l.dataset.types.replaceAll(" ", "").split(",");
				if (labelTypes.includes(e.target.querySelector("option:checked").dataset.type)) {l.hidden = false}
				else {l.hidden = true};
				if (l.querySelector("input")) {l.querySelector("input").checked = false};
			});
			//Скрытие списка выбранных шаблонов
			this.element.querySelector("div.props").innerHTML = "";
		});
		//Обновление параметров предмета при его изменении
		this.element.querySelector("select#item").addEventListener("change", (e) => {this.updateItem(e.target)});
		//Обновление параметров выбранных шаблонов при их переключении
		this.element.querySelector("div.presets")?.addEventListener("change", (e) => {
			if (e.target.matches("label > input[type='checkbox']")) {this.updateProps()};
		});
	};

	async _prepareContext(options) {
		let context = await super._prepareContext(options);
		context.params = this.params;
		context.debug = this.debug;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _prepareContext \"context\"");
			console.debug(context);
		};
		return context;
	};

	static async create(options={}) {
		this.debug = game.settings.get("wfrp4e-tools", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator create");
		};
		//Проверка на наличие активного окна генератора
		if (document.querySelector("div.WFRP4eLooting.WFRP4eLooting-generator")) {
			document.querySelector("div.WFRP4eLooting.WFRP4eLooting-generator").style.zIndex = ++ApplicationV2._maxZ;
			return;
		};
		//Определение параметров
		let params = {};
		//Типы предметов
		params.types = [
			{value: "trapping", type: "trapping", name: game.i18n.localize("Other")},
			{value: "armourCore", type: "armour", name: game.i18n.localize("Armour")},
			{value: "basic", type: "melee", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Basic") + ")"},
			{value: "cavalry", type: "melee", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Cavalry") + ")"},
			{value: "fencing", type: "melee", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Fencing") + ")"},
			{value: "brawling", type: "melee", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Brawling") + ")"},
			{value: "flail", type: "melee", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Flail") + ")"},
			{value: "parry", type: "melee", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Parry") + ")"},
			{value: "polearm", type: "melee", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Polearm") + ")"},
			{value: "twohanded", type: "melee", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.TwoHanded") + ")"},
			{value: "blackpowder", type: "range", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Blackpowder") + ")"},
			{value: "bow", type: "range", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Bow") + ")"},
			{value: "crossbow", type: "range", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Crossbow") + ")"},
			{value: "entangling", type: "range", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Entangling") + ")"},
			{value: "engineering", type: "range", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Engineering") + ")"},
			{value: "explosives", type: "range", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Explosives") + ")"},
			{value: "sling", type: "range", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Sling") + ")"},
			{value: "throwing", type: "range", name: game.i18n.localize("Weapon") + " (" + game.i18n.localize("SPEC.Throwing") + ")"},
			{value: "ammunition", type: "range", name: game.i18n.localize("Ammunition")}
		];
		if (game.modules.get("wfrp4e-archives3")?.active) {params.types.splice(2, 0, {value: "armourArchives3", type: "armour", name: game.i18n.localize("TYPES.Item.wfrp4e-archives3.armour")})};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"params.types\"");
			console.debug(params.types);
		};
		//Формирование списка предметов
		let trappings = (await warhammer.utility.findAllItems("trapping", false, true, ["system.trappingType.value"]))
			.sort((a, b) => a.name.localeCompare(b.name));
		trappings.map(t => {
			if (t.uuid.indexOf("Compendium.") > -1) {t.pack = game.packs.get(t.uuid.substring(t.uuid.indexOf("Compendium.") + 11, t.uuid.indexOf(".Item."))).title};
			return t;
		});
		let weapons = ((await warhammer.utility.findAllItems("weapon", false, true, ["system.weaponGroup.value"])).filter(w => w.system.weaponGroup.value != "vehicle" && w.system.weaponGroup.value != "warMachine")
			.concat(await warhammer.utility.findAllItems("ammunition", false, true)))
			.sort((a, b) => a.name.localeCompare(b.name));
		weapons.map(w => {
			if (w.uuid.indexOf("Compendium.") > -1) {w.pack = game.packs.get(w.uuid.substring(w.uuid.indexOf("Compendium.") + 11, w.uuid.indexOf(".Item."))).title};
			w.group = w.system.weaponGroup?.value || "ammunition";
			return w;
		});
		let armours = ((await warhammer.utility.findAllItems("armour", false, true))
			.concat(await warhammer.utility.findAllItems("wfrp4e-archives3.armour", false, true)))
			.sort((a, b) => a.name.localeCompare(b.name));
		armours.map(a => {
			if (a.uuid.indexOf("Compendium.") > -1) {a.pack = game.packs.get(a.uuid.substring(a.uuid.indexOf("Compendium.") + 11, a.uuid.indexOf(".Item."))).title};
			a.group = a.type == "wfrp4e-archives3.armour" ? "armourArchives3" : "armourCore";
			return a;
		});
		//Предметы
		params.items = trappings.concat(weapons, armours);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"trappings\", \"weapons\", \"armours\", \"params.items\"");
			console.debug(trappings);
			console.debug(weapons);
			console.debug(armours);
			console.debug(params.items);
		};
		//Шаблоны
		params.presets = game.wfrp4e.looting.data.generator.presets.all;
		//Скрипты
		params.scripts = game.wfrp4e.looting.data.generator.effects.all;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"params.presets\", \"params.scripts\"");
			console.debug(params.presets);
			console.debug(params.scripts);
		};
		//Достоинства
		params.qualities = Object.assign({
			any: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.All"),
			type: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Type"),
			trapping: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Trapping"),
			melee: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Melee"),
			range: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Range"),
			armour: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Armour")
		}, Object.fromEntries(Object.entries(game.wfrp4e.utility.qualityList()).sort(([, a], [, b]) => a.localeCompare(b))));
		//Изъяны
		params.flaws = Object.assign({
			any: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.All"),
			type: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Type"),
			trapping: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Trapping"),
			melee: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Melee"),
			range: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Range"),
			armour: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Armour")
		}, Object.fromEntries(Object.entries(game.wfrp4e.utility.flawList()).sort(([, a], [, b]) => a.localeCompare(b))));
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"params.qualities\", \"params.flaws\"");
			console.debug(params.qualities);
			console.debug(params.flaws);
		};
		return new Promise(resolve => {
			options.resolve = resolve;
			new this(params, this.debug, options).render({force: true});
		});
	};

	static async _onClickPreset(event, button) {
		if (event.pointerId == -1) {return};
		//Определение типа шаблона
		let type = button.dataset.type;
		//Определение id шаблона
		let id = button.dataset.id;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onClickPreset \"type\", \"id\"");
			console.debug(type);
			console.debug(id);
		};
		//Действия при Добавлении, копировании, просмотре настроек шаблона
		if (button.classList.value.includes("add") || event.altKey || event.ctrlKey) {
			//Запретить переключение шаблона
			event.preventDefault();
			//Добавление нового шаблона
			if (button.classList.value.includes("add")) {
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingGenerator _onClickPreset onAdd");
				};
				//Тип шаблона: "custom"
				type = "custom";
				//Определение нового ID
				id = foundry.utils.randomID();
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingGenerator _onClickPreset onAdd \"id\"");
					console.debug(id);
				};
				//Базовые параметры пользовательского шаблона
				let preset = {
					id: id,
					label: game.i18n.localize("WFRP4E.Looting.Generator.Preset.Title"),
					hint: game.i18n.localize("Description"),
					color: "olivedrab",
					type: "custom",
					types: {
						trapping: true,
						melee: true,
						range: true,
						armour: true,
						value: "trapping,melee,range,armour"
					},
					value: game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.0"),
					qualities: [],
					flaws: [],
					scripts: [],
					names: {}
				};
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingGenerator _onClickPreset onAdd \"preset\"");
					console.debug(preset);
				};
				//Обновление настроек: добавление нового шаблона
				await game.settings.set("wfrp4e-looting", "customGenerator", game.settings.get("wfrp4e-looting", "customGenerator").concat(preset));
				//Добавление кнопки нового шаблона в список
				this.newLabel(preset);
			//Копирование шаблона
			} else if (event.ctrlKey) {
				//Копирование параметров шаблона
				let preset = structuredClone(game.wfrp4e.looting.data.generator.presets.all.find(p => p.id == id));
				//Тип шаблона: "custom"
				type = "custom";
				//Определение нового ID
				id = foundry.utils.randomID();
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingGenerator _onClickPreset onCopy \"id\"");
					console.debug(id);
				};
				//Применение собственных параметров для шаблона
				preset.id = id;
				preset.type = type;
				preset.baseQuality = false;
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingGenerator _onClickPreset onCopy \"preset\"");
					console.debug(preset);
				};
				//Обновление настроек: добавление нового шаблона
				await game.settings.set("wfrp4e-looting", "customGenerator", game.settings.get("wfrp4e-looting", "customGenerator").concat(preset));
				//Добавление кнопки нового шаблона в список
				this.newLabel(preset);
			};
			//Окно просмотра настроек шаблона
			warhammer.apps.WFRP4eLootingGeneratorPreset.create(id, type, this.params, this);
		};
	};

	/**
	 * Создание предмета с использованием генератора предметов WFRP4e - Looting
	 * @param {PointerEvent} event PointerEvent при нажатии на кнопку. Оставьте пустым.
	 * @param {element} html Html element кнопки создания. Оставьте пустым.
	 * @param {string} item UUID предмета, который будет использован в Генераторе.
	 * @param {array} presets Массив id's шаблонов, используемых при создании.
	 */
	static async onCreate(event, html, item, presets=[]) {
		//Определение предмета по UUID
		if (item) {item = await fromUuid(item)}
		//Если item пуст, но есть диалоговое окно, определяется предмет в соответствии с выбранным в окне
		else if (this.element) {item = this.item};
		if (!item) {
			ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Generator.Error.ItemNotFound"));
			return;
		};
		item = item.toObject();
		//Определение категории предмета (работает и без открытого окна)
		let itemCategory = this.type;
		if (!itemCategory) {
			if (item.type === "armour" || item.type === "wfrp4e-archives3.armour") {itemCategory = "armour"}
			else if (item.type === "ammunition") {itemCategory = "range"}
			else if (item.type === "weapon") {
				let rangeGroups = ["blackpowder", "bow", "crossbow", "entangling", "engineering", "explosives", "sling", "throwing"];
				itemCategory = rangeGroups.includes(item.system?.weaponGroup?.value) ? "range" : "melee";
			} else {itemCategory = "trapping"};
		};
		//Если шаблоны не заданы
		if (!presets.length) {
			//Но есть диалоговое окно, определяется шаблоны в соответствии с выбранными в окне
			if (this.element) {presets = Array.from(this.element.querySelectorAll("div.presets > label:has(> input:checked)")).map(p => p.dataset.id)}
			else {
				ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Generator.Error.PresetsNotFound"));
				return;
			};
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"item\", \"presets\"");
			console.debug(item);
			console.debug(presets);
		};
		let names = {a: [""], b: [""], c: [""]};
		let notification = {
			qualities: {true: [], false: []},
			flaws: {true: [], false: []},
			scripts: []
		};
		let scripts = [];
		let props = {qualities: [], flaws: []};
		const categoryKeys = ["any", "type", "trapping", "melee", "range", "armour"];
		//Перечисление шаблонов
		for (let presetId of presets) {
			//Нахождение шаблона
			let preset = game.wfrp4e.looting.data.generator.presets.all.find(p => p.id == presetId);
			if (!preset) {continue};
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate presets.forEach \"preset\"");
				console.debug(preset);
			};
			//Добавление скриптов шаблона
			scripts = scripts.concat(preset.scripts || []);
			//Броски на определение свойств предмета
			let getProperties = async (p, type) => {
				if (!categoryKeys.includes(p.name)) {
					switch (item.type) {
						case "weapon":
						case "ammunition": {
							if (!Object.assign({}, WFRP4E.itemQualities, WFRP4E.weaponQualities, WFRP4E.itemFlaws, WFRP4E.weaponFlaws)[p.name]) {return};
							break;
						};
						case "armour":
						case "wfrp4e-archives3.armour": {
							if (!Object.assign({}, WFRP4E.itemQualities, WFRP4E.armorQualities, WFRP4E.itemFlaws, WFRP4E.armorFlaws)[p.name]) {return};
							break;
						};
						case "trapping": {
							if (!Object.assign({}, WFRP4E.itemQualities, WFRP4E.itemFlaws)[p.name]) {return};
							break;
						};
						default: return;
					};
				};
				let qty = Number(p.quantity) || 1;
				let chance = Number(p.chance) || 0;
				for (let a = 0; a < qty; a++) {
					if (this.debug) {
						console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate presets.forEach preset \"p\"");
						console.debug(p);
					};
					if ((await new Roll("1d100").roll()).total <= chance) {
						let prop;
						//Если базовое свойство
						if (Object.assign({}, game.wfrp4e.utility.qualityList(), game.wfrp4e.utility.flawList())[p.name]) {
							prop = p.name;
						//Если категория
						} else {
							let poolByCat = game.wfrp4e.looting.data.generator.props[type];
							let targetCat = p.name === "type" ? itemCategory : p.name;
							let pool = poolByCat?.[targetCat] || [];
							if (pool.length) {prop = game.wfrp4e.tools.randomArrayElement(pool)};
						};
						if (this.debug) {
							console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate presets.forEach preset p \"prop\"");
							console.debug(prop);
						};
						//Добавление свойства к результату
						if (prop) {props[type].push(prop)};
					};
				};
			};
			for (let q of (preset.qualities || [])) {await getProperties(q, "qualities")};
			for (let f of (preset.flaws || [])) {await getProperties(f, "flaws")};
			//Добавление случайных имён к массиву случайных имён
			if (preset.names?.a?.length) {names.a = names.a.concat(preset.names.a)};
			if (preset.names?.b?.length) {names.b = names.b.concat(preset.names.b)};
			if (preset.names?.c?.length) {names.c = names.c.concat(preset.names.c)};
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate presets.forEach names \"names.a\", \"names.b\", \"names.c\"");
				console.debug(names.a);
				console.debug(names.b);
				console.debug(names.c);
			};
		};
		//Проверка на взаимоисключение
		let propsCompatibility = [];
		let check = async (q, f, a) => {
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate props check \"q\", \"f\"");
				console.debug(q);
				console.debug(f);
			};
			if (props.flaws.includes(f)) {
				let filter = game.settings.get("wfrp4e-looting", "propsCompatibility");
				if (!filter) {
					let cached = propsCompatibility.find(p => p.prop == q);
					if (cached) {filter = cached.filter}
					else {
						filter = await foundry.applications.api.DialogV2.wait({
							window: {title: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Compatibility.Title")},
							content: game.i18n.format("WFRP4E.Looting.Generator.Dialog.Props.Compatibility.Content", {q: game.wfrp4e.looting.data.generator.names[q], f: game.wfrp4e.looting.data.generator.names[f]}),
							buttons: [
								{
									action: "ok",
									default: true,
									label: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Compatibility.False"),
									callback: () => false
								},
								{
									action: "true",
									label: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Compatibility.True"),
									callback: () => true
								},
								{
									action: "trueAlways",
									label: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Compatibility.TrueAlways"),
									callback: async () => {
										await game.settings.set("wfrp4e-looting", "propsCompatibility", true);
										return true;
									}
								}
							]
						});
						propsCompatibility.push({prop: q, filter: Boolean(filter)});
					};
				};
				if (filter) {
					props.qualities.splice(props.qualities.indexOf(q), 1);
					props.flaws.splice(props.flaws.indexOf(f), 1);
					notification.qualities.false.push(q);
					notification.flaws.false.push(f);
					a--;
				};
			};
			return a;
		};
		let oppositeMap = {
			fine: "ugly",
			lightweight: "bulky",
			practical: "unreliable",
			durable: "shoddy",
			fast: "slow",
			precise: "imprecise",
			damaging: "undamaging",
			impact: "undamaging",
			defensive: "unbalanced"
		};
		//Проверка на совместимость по достоинствам
		for (let a = 0; a < props.qualities.length; a++) {
			let q = props.qualities[a];
			if (oppositeMap[q]) {a = await check(q, oppositeMap[q], a)};
		};
		//Установка стоимости предмета в зависимости от новых достоинств и изъянов
		let srcPrice = item.system?.price || {gc: 0, ss: 0, bp: 0};
		let baseBp = (Number(srcPrice.bp) || 0) + ((Number(srcPrice.ss) || 0) * 12) + ((Number(srcPrice.gc) || 0) * 240);
		let oldPrice = {default: Object.assign(bpToCoins(baseBp), {value: baseBp})};
		let pow = 0;
		let calcProps = (type) => {
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate calcProps \"props[type]\"");
				console.debug(props[type]);
			};
			if (!Array.isArray(item.system[type]?.value)) {item.system[type] = {value: []}};
			for (let i = 0; i < props[type].length; i++) {
				let propName = props[type][i];
				if (game.wfrp4e.config.propertyHasValue[propName]) {
					let existing = item.system[type].value.find(ip => ip.name == propName);
					if (existing) {existing.value = (Number(existing.value) || 0) + 1}
					else {item.system[type].value.push({name: propName, value: 1})};
					pow += (type == "qualities" ? 1 : -1);
				} else if (!item.system[type].value.find(prop => prop.name == propName)) {
					item.system[type].value.push({name: propName});
					pow += (type == "qualities" ? 1 : -1);
				} else {
					props[type].splice(i, 1);
					i--;
				};
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate calcProps \"props[type][i]\"");
					console.debug(props[type][i]);
				};
			};
		};
		calcProps("qualities");
		calcProps("flaws");
		let newPrice = bpToCoins(Math.round(baseBp * (2 ** pow)));
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"pow\"");
			console.debug(pow);
		};
		item.system.price = {gc: newPrice.gc, ss: newPrice.ss, bp: newPrice.bp};
		oldPrice.new = Object.assign({}, newPrice, {value: newPrice.priceValue});
		oldPrice.value = oldPrice.new.value > oldPrice.default.value;
		//Совмещение дублей свойств
		let merge = (array, count) => {
			return Object.entries(array.reduce((obj, p) => {
				if (game.wfrp4e.config.propertyHasValue[p] || count) {obj[p] = (obj[p] || 0) + 1}
				else {obj[p] = 1};
				return obj;
			}, {})).map(([key, value]) => (game.wfrp4e.looting.data.generator.names[key] || key) + (value > 1 ? ` (${value})` : ""));
		};
		notification.qualities.true = merge(props.qualities, false);
		notification.flaws.true = merge(props.flaws, false);
		notification.qualities.false = merge(notification.qualities.false, true);
		notification.flaws.false = merge(notification.flaws.false, true);
		//Определение имени
		let originalName = item.name;
		let rollGeneratedName = () => {
			let a = game.wfrp4e.tools.randomArrayElement(names.a) || "";
			let b = game.wfrp4e.tools.randomArrayElement(names.b) || "";
			let combined = [a, originalName, b].filter(Boolean).join(" ");
			let cPool = names.c.concat(combined).filter(Boolean);
			return game.wfrp4e.tools.randomArrayElement(cPool) || originalName;
		};
		item.name = rollGeneratedName();
		if (game.settings.get("wfrp4e-looting", "editName")) {
			let editedName = await foundry.applications.api.DialogV2.prompt({
				window: {title: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.EditName")},
				content: `<div style="display: flex; gap: 0.3rem; padding: 0.2rem;"><input name="name" type="text" value="${foundry.utils.escapeHTML(item.name)}" autofocus><a style="height: auto;" class="button" data-action="rerollName"><i class="fas fa-refresh"></i></a></div>`,
				ok: {
					label: game.i18n.localize("Submit"),
					callback: (event, button) => button.form.elements.name.value?.trim() || item.name
				},
				render: (event, dialog) => {
					//Обновление имени по заданным шаблонам
					dialog.element.querySelector("[data-action='rerollName']")?.addEventListener("click", () => {
						dialog.element.querySelector("input[name='name']").value = rollGeneratedName();
					});
				}
			});
			if (!editedName) {return};
			item.name = editedName;
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"item.name\"");
			console.debug(item.name);
		};
		//Определение скриптов по броскам
		let newScripts = [];
		for (let i = scripts.length - 1; i >= 0; i--) {
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate scripts.forEach \"scripts[i]\"");
				console.debug(scripts[i]);
			};
			if ((await new Roll("1d100").roll()).total <= Number(scripts[i].chance)) {
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate scripts.forEach add \"scripts[i].id\"");
					console.debug(scripts[i].id);
				};
				newScripts.push(scripts[i]);
			};
		};
		//Фильтр дублей
		scripts = newScripts.filter((script, index, self) => index == self.findIndex((s) => s.id == script.id));
		notification.scripts = scripts.map(s => s.name);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"notification\"");
			console.debug(notification);
		};
		//Создание предмета
		delete item._id;
		item = await Item.implementation.create(item);
		if (!item) {return};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"item\"");
			console.debug(item);
		};
		//Добавление скриптов к созданному предмету
		if (scripts.length) {await WFRP4eLootingGenerator.addScripts(item.uuid, scripts)};
		//Итоговое окно генерации
		await foundry.applications.api.DialogV2.wait({
			window: {title: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Result.Title")},
			content: await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-looting/templates/generator/result.hbs", {
				item: item.name,
				price: oldPrice,
				qualities: {add: notification.qualities.true, remove: notification.qualities.false},
				flaws: {add: notification.flaws.true, remove: notification.flaws.false},
				scripts: notification.scripts
			}),
			buttons: [
				{
					action: "ok",
					default: true,
					label: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Result.Open"),
					callback: () => {item.sheet.render(true)}
				},
				{
					action: "delete",
					label: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Result.Delete"),
					callback: () => {item.delete()}
				}
			],
			classes: ["WFRP4eLooting-generator", "WFRP4eLooting"]
		});
	};

	/**
	 * Добавление скриптов генератора предметов предмету
	 * @param {string} item UUID предмета, которому добавляются скрипты.
	 * @param {array} scripts Массив, содержащий ID добавляемых скриптов.
	 */
	static async addScripts(item, scripts=[]) {
		//Определение предмета
		if (item) {item = await fromUuid(item)};
		if (!item) {
			ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Generator.Error.ItemNotFound"));
			return;
		};
		//Указание добавленных скриптов в свойства предмета
		let existingScripts = item.flags.looting?.scripts || [];
		let mergedIds = [...new Set(scripts.map(s => s.id).concat(existingScripts).filter(Boolean))];
		await item.update({"flags.looting.scripts": mergedIds}, {onReset: true});
		//Если скрипты не заданы
		if (!scripts.length) {return};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator addScripts \"item\", \"scripts\"");
			console.debug(item);
			console.debug(scripts);
		};
		//Подготовка всех эффектов, принадлежащих выбранным скриптам
		let effectsToAdd = scripts
			.flatMap(s => game.wfrp4e.looting.data.generator.effects.all.find(e => e.id == s.id)?.effects || [])
			.map(e => typeof e.toObject === "function" ? e.toObject() : foundry.utils.deepClone(e));
		//Добавление базового скрипта проверки
		if (!item.effects.find(e => e.flags.looting?.id == "onRemove")) {
			effectsToAdd.push(foundry.utils.deepClone(game.wfrp4e.looting.data.generator.effects.onRemove));
		};
		//Добавление скриптов, НЕ выполняющихся при добавлении к предмету
		let nonImmediate = effectsToAdd.filter(e => e.system?.transferData?.documentType != "Item" || e.system?.scriptData?.some(s => s.trigger != "immediate"));
		//Добавление скриптов, выполняющихся при добавлении к предмету
		let immediate = effectsToAdd.filter(e => e.system?.transferData?.documentType == "Item" && e.system?.scriptData?.some(s => s.trigger == "immediate"));
		if (nonImmediate.length) {await item.createEmbeddedDocuments("ActiveEffect", nonImmediate, {broadcast: false, onReset: true})};
		if (immediate.length) {await item.createEmbeddedDocuments("ActiveEffect", immediate, {broadcast: false, onReset: true})};
	};

	async updateItem(e) {
		//Определение нового предмета
		this.item = await fromUuid(e?.value);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator updateItem \"item\"");
			console.debug(this.item);
		};
		//Определение элемента, отображающего параметры предмета
		let element = this.element.querySelector(`div.base_item.${this.element.querySelector("select#type > option:checked").dataset.type}`);
		if (!element) {return};
		//Отображание кнопки создания при существовании предмета (при выборе хотя бы одного шаблона)
		if (this.item) {this.element.querySelector("button[data-action='create']").hidden = false};
		//Обновление параметров предмета в соответствии с его типом
		element.querySelector("#base\\.money\\.gc").value = this.item?.system?.price?.gc || 0;
		element.querySelector("#base\\.money\\.ss").value = this.item?.system?.price?.ss || 0;
		element.querySelector("#base\\.money\\.bp").value = this.item?.system?.price?.bp || 0;
		element.querySelector("#base\\.encumbrance").value = this.item?.system?.encumbrance?.value || 0;
		element.querySelector("#base\\.availability").value = game.wfrp4e.config.availability[this.item?.system?.availability?.value || "None"];
		element.querySelector("#base\\.properties").value = (this.item?.Qualities || []).concat(this.item?.Flaws || []).join(", ");
		//Обновление параметров предмета для trapping
		if (element.querySelector("#base\\.type")) {element.querySelector("#base\\.type").value = game.wfrp4e.config.trappingTypes[this.item?.system?.trappingType?.value] || "-"};
		//Обновление параметров предмета для melee
		if (element.querySelector("#base\\.reach")) {element.querySelector("#base\\.reach").value = game.wfrp4e.config.weaponReaches[this.item?.system?.reach?.value] || "-"};
		if (element.querySelector("#base\\.damage")) {element.querySelector("#base\\.damage").value = this.item?.system?.damage?.value || ""};
		if (element.querySelector("#base\\.twohanded")) {this.item?.system?.twohanded?.value ? element.querySelector("#base\\.twohanded").checked = true : element.querySelector("#base\\.twohanded").checked = false};
		//Обновление параметров предмета для range
		if (element.querySelector("#base\\.range")) {element.querySelector("#base\\.range").value = this.item?.system?.range?.value || 0};
		if (element.querySelector("#base\\.damage")) {element.querySelector("#base\\.damage").value = this.item?.system?.damage?.value || ""};
		if (element.querySelector("#base\\.twohanded")) {this.item?.system?.twohanded?.value ? element.querySelector("#base\\.twohanded").checked = true : element.querySelector("#base\\.twohanded").checked = false};
		//Обновление параметров предмета для armour
		if (element.querySelector("#base\\.apHead")) {element.querySelector("#base\\.apHead").value = this.item?.system?.AP?.head || 0};
		if (element.querySelector("#base\\.apLArm")) {element.querySelector("#base\\.apLArm").value = this.item?.system?.AP?.lArm || 0};
		if (element.querySelector("#base\\.apRArm")) {element.querySelector("#base\\.apRArm").value = this.item?.system?.AP?.rArm || 0};
		if (element.querySelector("#base\\.apBody")) {element.querySelector("#base\\.apBody").value = this.item?.system?.AP?.body || 0};
		if (element.querySelector("#base\\.apLLeg")) {element.querySelector("#base\\.apLLeg").value = this.item?.system?.AP?.lLeg || 0};
		if (element.querySelector("#base\\.apRLeg")) {element.querySelector("#base\\.apRLeg").value = this.item?.system?.AP?.rLeg || 0};
		if (element.querySelector("#base\\.armorType")) {element.querySelector("#base\\.armorType").value = game.wfrp4e.config.armorTypesV2 ? game.wfrp4e.config.armorTypesV2[this.item?.system?.armorType?.value] || "" : game.wfrp4e.config.armorTypes[this.item?.system?.armorType?.value] || ""};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator updateItem \"element\"");
			console.debug(element);
		};
	};

	updateProps() {
		let props = {qualities: [], flaws: [], scripts: []};
		//Проверка всех выбранных шаблонов
		this.element.querySelectorAll("div.presets > label:has(> input:checked)").forEach(l => {
			//Создание подсказки по каждому шаблону
			let div = document.createElement("div");
			div.innerHTML = l.dataset.tooltip;
			props.qualities = props.qualities.concat(Array.from(div.querySelectorAll("li.qualities")).map(e => "<span class='qualities'>" + e.innerText + "</span>"));
			props.flaws = props.flaws.concat(Array.from(div.querySelectorAll("li.flaws")).map(e => "<span class='flaws'>" + e.innerText + "</span>"));
			props.scripts = props.scripts.concat(Array.from(div.querySelectorAll("li.scripts")).map(e => "<span class='scripts'>" + e.innerText + "</span>"));
		});
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator updateProps \"props.qualities\", \"props.flaws\", \"props.scripts\"");
			console.debug(props.qualities);
			console.debug(props.flaws);
			console.debug(props.scripts);
		};
		this.element.querySelector("div.props").innerHTML = props.qualities.sort((a, b) => a.localeCompare(b)).concat(props.flaws.sort((a, b) => a.localeCompare(b)), props.scripts.sort((a, b) => a.localeCompare(b))).join("");
	};

	newLabel(preset) {
		let label = `<label data-id="${preset.id}" type="button" data-action="clickPreset" data-type="custom" data-types="${preset.types.value}" style="--qualities_border: var(--qualities-${preset.color}_border); --qualities: var(--qualities-${preset.color});" data-tooltip="${
			"<div class='WFRP4eLooting-tooltip'>"
			+ "<span style='font-style: italic;'>" + preset.hint + "</span>"
			+ "<hr>"
			+ "<span id='value' style='font-style: italic;'>" + game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.Title") + ": <b>" + preset.value + "</b></span>"
			+ "<hr>"
			+ (preset.qualities.length ? "<div>"
				+ "<span>" + game.i18n.localize("Qualities") + ": </span>"
				+ "<ul>"
				+ preset.qualities.map(q => {
					if (q.chance > 0 && q.quantity > 0) {return "<li class='qualities'>" + (q.quantity > 1 ? q.quantity + "x: " : "") + q.label + (q.chance != 100 ? " [" + q.chance + "%]" : "") + "</li>"};
				}).join("")
				+ "</ul>"
				+ "</div>"
			: "")
			+ (preset.flaws.length ? "<div>"
				+ "<span>" + game.i18n.localize("Flaws") + ": </span>"
				+ "<ul>"
				+ preset.flaws.map(f => {
					if (f.chance > 0 && f.quantity > 0) {return "<li class='flaws'>" + (f.quantity > 1 ? f.quantity + "x: " : "") + f.label + (f.chance != 100 ? " [" + f.chance + "%]" : "") + "</li>"};
				}).join("")
				+ "</ul>"
				+ "</div>"
			: "")
			+ (preset.scripts.length ? "<div>"
				+ "<span>" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Title") + ": </span>"
				+ "<ul>"
				+ preset.scripts.map(s => {
					if (s.chance > 0) {return "<li class='scripts'>" + s.name + (s.chance != 100 ? " [" + s.chance + "%]" : "") + "</li>"};
				}).join("")
				+ "</ul>"
				+ "</div>"
			: "")
			+ "<hr>"
			+ game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Hint.LMB")
			+ "<br>"
			+ game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Hint.Alt")
			+ "<br>"
			+ game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Hint.Ctrl")
			+ "</div>"
		}">${preset.label + (this.debug ? " [" + preset.id + "]" : "")}<input hidden type="checkbox" name="${preset.id}"></label>`;
		this.element.querySelector("div.presets > label.add").insertAdjacentHTML("beforebegin", label);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator newLabel \"label\"");
			console.debug(label);
		};
	};

	editLabel(preset) {
		preset.scripts = (preset.scripts || []).reduce((acc, s) => {
			let script = game.wfrp4e.looting.data.generator.effects.all.find(e => e.id == s.id);
			if (script) {
				s.name = script.name;
				s.hint = script.hint;
				s.default = script.default;
				acc.push(s);
			};
			return acc;
		}, []);
		let buttonPreset = this.element.querySelector(`label[data-type="custom"][data-id="${preset.id}"]`);
		if (!buttonPreset) {return};
		buttonPreset.style.setProperty("--qualities_border", `var(--qualities-${preset.color}_border)`);
		buttonPreset.style.setProperty("--qualities", `var(--qualities-${preset.color})`);
		buttonPreset.addEventListener("change", () => {this.updateProps()});
		buttonPreset.dataset.types = preset.types.value;
		buttonPreset.dataset.tooltip = `${
			"<div class='WFRP4eLooting-tooltip'>"
			+ "<span style='font-style: italic;'>" + preset.hint + "</span>"
			+ "<hr>"
			+ "<span id='value' style='font-style: italic;'>" + game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.Title") + ": <b>" + preset.value + "</b></span>"
			+ "<hr>"
			+ (preset.qualities.length ? "<div>"
				+ "<span>" + game.i18n.localize("Qualities") + ": </span>"
				+ "<ul>"
				+ preset.qualities.map(q => {
					if (q.chance > 0 && q.quantity > 0) {return "<li class='qualities'>" + (q.quantity > 1 ? q.quantity + "x: " : "") + q.label + (q.chance != 100 ? " [" + q.chance + "%]" : "") + "</li>"};
				}).join("")
				+ "</ul>"
				+ "</div>"
			: "")
			+ (preset.flaws.length ? "<div>"
				+ "<span>" + game.i18n.localize("Flaws") + ": </span>"
				+ "<ul>"
				+ preset.flaws.map(f => {
					if (f.chance > 0 && f.quantity > 0) {return "<li class='flaws'>" + (f.quantity > 1 ? f.quantity + "x: " : "") + f.label + (f.chance != 100 ? " [" + f.chance + "%]" : "") + "</li>"};
				}).join("")
				+ "</ul>"
				+ "</div>"
			: "")
			+ (preset.scripts.length ? "<div>"
				+ "<span>" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Title") + ": </span>"
				+ "<ul>"
				+ preset.scripts.map(s => {
					if (s.chance > 0) {return "<li class='scripts'>" + s.name + (s.chance != 100 ? " [" + s.chance + "%]" : "") + "</li>"};
				}).join("")
				+ "</ul>"
				+ "</div>"
			: "")
			+ "<hr>"
			+ game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Hint.LMB")
			+ "<br>"
			+ game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Hint.Alt")
			+ "<br>"
			+ game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Hint.Ctrl")
			+ "</div>"
		}`;
		buttonPreset.innerHTML = `${preset.label + (this.debug ? " [" + preset.id + "]" : "")}<input hidden type="checkbox"${buttonPreset.querySelector("input").checked ? " checked" : ""} name="${preset.id}">`;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator editLabel \"buttonPreset\"");
			console.debug(buttonPreset);
		};
	};

	async close(options) {
		this.options.resolve?.();
		return super.close(options);
	};
};
warhammer.apps.WFRP4eLootingGenerator = WFRP4eLootingGenerator;

class WFRP4eLootingGeneratorPreset extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		classes: ["WFRP4eLooting-editPreset", "WFRP4eLooting", "warhammer"],
		form: {
			submitOnChange: false,
			closeOnSubmit: true
		},
		window: {
			resizable: true,
			title: "WFRP4E.Looting.Generator.Preset.Title",
			icon: "fas fa-dice-d20",
			contentClasses: ["standard-form"]
		},
		actions: {
			clickPreset: this._onClickPreset,
			save: this._onSave,
			close: this._onClose,
			delete: this._onDelete,
			script: this._script
		}
	};

	static PARTS = {
		form: {
			template: "modules/wfrp4e-looting/templates/generator/edit.hbs",
		},
		footer: {
			template: "modules/wfrp4e-tools/templates/form-footer.hbs"
		}
	};

	constructor(preset, type, params, generator, debug, options) {
		super(options);
		this.preset = preset;
		this.type = type;
		this.params = params;
		this.generator = generator;
		this.debug = debug;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset constructor \"this\"");
			console.debug(this);
		};
	};

	async _onRender(context) {
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset _onRender \"context\"");
			console.debug(context);
		};
		//Добавление задачи на обновление Соотношения свойств при изменении параметров шаблона
		this.element.querySelectorAll("div.props #chance, div.props #prop, div.props #quantity").forEach(i => {
			i.addEventListener("change", (e) => {this.updateValue()});
		});
		//Проверка скрипта на наличие
		this.element.querySelectorAll("div.scripts > div.body > a").forEach(e => {
			let preset = game.wfrp4e.looting.data.generator.effects.all.find(s => s.id == e.dataset.id);
			//Если такого скрипта нет, удаляется из шаблона
			if (!preset) {e.remove()}
			//Если он есть, проверка на название. Установка нового названия при несоответствии.
			else if (e.textContent != preset.name + (e.dataset.chance == 100 ? "" : " [" + e.dataset.chance + "%]") + (this.debug ? " [" + e.dataset.id + "]" : "")) {e.textContent = preset.name + (e.dataset.chance == 100 ? "" : " [" + e.dataset.chance + "%]") + (this.debug ? " [" + e.dataset.id + "]" : "")};
			//Добавление задачи на удаление при нажатии на ПКМ
			if (this.type != "default") {e.addEventListener("contextmenu", (a) => {a.preventDefault(); a.currentTarget.remove()})};
		});
		//Добавление кнопок для изменение шаблона
		this.element.querySelectorAll("a.button[data-action=\"addProp\"]").forEach(b => {b.addEventListener("click", (e) => {this.addProp(b)})});
		this.element.querySelectorAll("a.button[data-action=\"removeProp\"]").forEach(b => {b.addEventListener("click", (e) => {this.removeProp(b)})});
		this.element.querySelectorAll("a.button[data-action=\"addName\"]").forEach(b => {b.addEventListener("click", (e) => {this.addName(b)})});
		this.element.querySelectorAll("a.button[data-action=\"removeName\"]").forEach(b => {b.addEventListener("click", (e) => {this.removeName(b)})});
		this.element.querySelectorAll("a.button[data-action=\"addScript\"]").forEach(b => {b.addEventListener("click", (e) => {this.addScript(b)})});
		//Отображение редактора скриптов
		this.element.querySelectorAll("a.button[data-action=\"scriptsEditor\"]").forEach(b => {
			b.addEventListener("click", async () => {
				let item = await fromUuid(game.settings.get("wfrp4e-looting", "effectsItem"));
				if (item) {item.sheet.render(true)};
			});
		});
	};

	async _prepareContext(options) {
		let context = await super._prepareContext(options);
		context.preset = this.preset;
		context.type = this.type;
		context.params = this.params;
		context.debug = this.debug;
		//Кнопка сохранения или закрытия окна
		context.buttons = [{
			icon: this.type == "custom" ? "fas fa-save" : "fas fa-xmark",
			action: this.type == "custom" ? "save" : "close",
			default: true,
			label: this.type == "custom" ? "Save" : "Close"
		}];
		//Кнопка удаления для пользовательских шаблонов
		if (this.type == "custom") {
			context.buttons.unshift({
				action: "delete",
				icon: "fas fa-trash",
				label: "Delete"
			});
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset _prepareContext \"context\"");
			console.debug(context);
		};
		return context;
	};

	static async create(id, type, params, generator, options={}) {
		this.debug = game.settings.get("wfrp4e-tools", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset create");
		};
		//Определение названия шапки шаблона в соответствии с типом
		let title = (type == "custom" ? game.i18n.localize("WFRP4E.Looting.Generator.Preset.Title") : game.i18n.localize("WFRP4E.Looting.Generator.Preset.Default")) + (game.settings.get("wfrp4e-tools", "debug") ? " [ID: " + id + "]" : "");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset create \"title\"");
			console.debug(title);
		};
		params.props = {
			qualities: game.i18n.localize("WFRP4E.Looting.Generator.Preset.Props.Qualities"),
			flaws: game.i18n.localize("WFRP4E.Looting.Generator.Preset.Props.Flaws")
		};
		let foundPreset = game.wfrp4e.looting.data.generator.presets.all.find(p => p.id == id);
		if (!foundPreset) {return};
		return new Promise(resolve => {
			options.resolve = resolve;
			new this(foundry.utils.deepClone(foundPreset), type, params, generator, this.debug, options).render({force: true, window: {title}});
		});
	};

	static async _onSave() {
		if (this.type == "custom") {
			//Стандартизация параметров шаблона
			let preset = {
				id: this.preset.id,
				label: this.element.querySelector("#label").value || game.i18n.localize("WFRP4E.Looting.Generator.Preset.Title"),
				hint: this.element.querySelector("#hint").value || game.i18n.localize("Description"),
				color: this.element.querySelector("#color").value || "olivedrab",
				types: {
					trapping: this.element.querySelector("#trapping").checked,
					melee: this.element.querySelector("#melee").checked,
					range: this.element.querySelector("#range").checked,
					armour: this.element.querySelector("#armour").checked
				},
				qualities: Array.from(this.element.querySelectorAll("div.props .qualities")).map(p => ({
					chance: Number(p.querySelector("#chance").value) || 100,
					name: p.querySelector("#prop").value || "type",
					label: game.wfrp4e.looting.data.generator.names[p.querySelector("#prop").value] || game.wfrp4e.looting.data.generator.names.type,
					quantity: Number(p.querySelector("#quantity").value) || 1
				})).filter(p => p.chance > 0 && p.name != "false" && p.quantity > 0),
				flaws: Array.from(this.element.querySelectorAll("div.props .flaws")).map(p => ({
					chance: Number(p.querySelector("#chance").value) || 100,
					name: p.querySelector("#prop").value || "type",
					label: game.wfrp4e.looting.data.generator.names[p.querySelector("#prop").value] || game.wfrp4e.looting.data.generator.names.type,
					quantity: Number(p.querySelector("#quantity").value) || 1
				})).filter(p => p.chance > 0 && p.name != "false" && p.quantity > 0),
				names: {
					a: Array.from(this.element.querySelectorAll("div.names div.a")).map(n => (n.querySelector("#name\\.a").value)).filter(Boolean),
					b: Array.from(this.element.querySelectorAll("div.names div.b")).map(n => (n.querySelector("#name\\.b").value)).filter(Boolean),
					c: Array.from(this.element.querySelectorAll("div.names div.c")).map(n => (n.querySelector("#name\\.c").value)).filter(Boolean)
				},
				scripts: Array.from(this.element.querySelectorAll("div.scripts a[data-action='script']")).map(s => ({
					id: s.dataset.id,
					chance: Number(s.dataset.chance)
				}))
			};
			//Установка параметров фильтра шаблона
			preset.types.value = [(preset.types.trapping ? "trapping" : ""), (preset.types.melee ? "melee" : ""), (preset.types.range ? "range" : ""), (preset.types.armour ? "armour" : "")].filter(Boolean).join(",");
			//Должен быть выбран хотя бы один фильтр
			if (preset.types.value == "") {
				preset.types = foundry.utils.deepClone(this.preset.types);
				ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Generator.Error.PresetTypesEmpty"));
			};
			//Подсчёт Соотношения свойств
			preset.value = calcGeneratorPresetValue(preset);
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset _onSave \"preset\"");
				console.debug(preset);
			};
			await this.update(game.settings.get("wfrp4e-looting", "customGenerator").map(p => p.id == preset.id ? preset : p));
			//Удаление кнопки шаблона, если окно открыто
			if (this.generator?.element) {
				this.generator.editLabel(preset);
				this.generator.updateProps();
			};
			await this.close();
		};
	};

	static async _onDelete() {
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset _onDelete \"this.preset.id\"");
			console.debug(this.preset.id);
		};
		await this.update(game.settings.get("wfrp4e-looting", "customGenerator").filter(p => p.id != this.preset.id));
		//Удаление кнопки шаблона, если окно открыто
		if (this.generator?.element) {
			this.generator.element.querySelector(`div.presets > label[data-type="custom"][data-id="${this.preset.id}"]`)?.remove();
			this.generator.updateProps();
		};
		await this.close();
	};

	static async _script(event, button) {
		//Открыть скрипт
		if (event.altKey) {
			let item = await fromUuid(game.settings.get("wfrp4e-looting", "effectsItem"));
			item.effects.filter(s => s.flags?.looting?.id == button.dataset?.id).forEach(e => e.sheet.render(true));
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset _script click \"button.dataset.id\"");
				console.debug(button.dataset?.id);
			};
		//Изменить шанс срабатывания скрипта в шаблоне
		} else if (this.type != "default") {this.updateChances(button)};
	};

	static _onClose() {this.close()};

	updateValue() {
		//Обновление Соотношения свойств в шаблоне
		let value = game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.Title") + ": <i>" + calcGeneratorPresetValue({
			qualities: Array.from(this.element.querySelectorAll("div.props .qualities")).map(p => ({
				chance: p.querySelector("#chance").value,
				quantity: p.querySelector("#quantity").value
			})).filter(p => Boolean(p.chance) && p.name != "false" && Boolean(p.quantity)),
			flaws: Array.from(this.element.querySelectorAll("div.props .flaws")).map(p => ({
				chance: p.querySelector("#chance").value,
				quantity: p.querySelector("#quantity").value
			})).filter(p => Boolean(p.chance) && p.name != "false" && Boolean(p.quantity))
		}) + "</i>";
		this.element.querySelector("#value").innerHTML = value;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset updateValue \"value\"");
			console.debug(value);
		};
	};

	addProp(button) {
		//Добавление нового свойства в Шаблон
		let type = button.dataset.type;
		let prop = document.createElement("div");
		prop.innerHTML = ""
			+ `<input id='chance' type='number' min='0' max='100' style='flex: 1;' data-tooltip='${game.i18n.localize("WFRP4E.Looting.Generator.Preset.Props.Chance")}' value='100'>`
			+ "<select id='prop' style='flex: 5;'>"
			+ `\t<option hidden disabled selected value='false'>${game.i18n.format("WFRP4E.Looting.Generator.Preset.Props.Label", {type: game.i18n.localize("WFRP4E.Looting.Generator.Preset.Props." + (type == "qualities" ? "Qualities" : "Flaws"))})}</option>`
			+ Object.entries(this.params[type]).map(([key, value]) => {return "\t<option value='" + key + "'>" + value + "</option>"}).join("")
			+ "</select>"
			+ `<input id='quantity' type='number' style='flex: 1;' data-tooltip='${game.i18n.localize("Quantity")}' value='1'>`
			+ `<a class='button' data-action='removeProp' data-type='${type}' style='flex: 1;' data-tooltip='${game.i18n.format("WFRP4E.Looting.Generator.Preset.Props.Remove", {type: game.i18n.localize("WFRP4E.Looting.Generator.Preset.Props." + (type == "qualities" ? "Qualities" : "Flaws"))})}'><i class='fas fa-trash'></i></a>`;
		prop.classList.add(type);
		button.insertAdjacentElement("beforebegin", prop);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addProp \"prop\"");
			console.debug(prop);
		};
		prop.querySelectorAll("#chance, #prop, #quantity").forEach(i => { i.addEventListener("change", (e) => {this.updateValue()}) });
		prop.querySelectorAll("a.button[data-action=\"removeProp\"]").forEach(b => {b.addEventListener("click", (e) => {this.removeProp(b)})});
	};

	removeProp(button) {
		//Удаление свойства
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset removeProp \"prop\"");
			console.debug(button.closest(`div.${button.dataset.type}`).querySelector("select#prop").value);
		};
		button.closest(`div.${button.dataset.type}`)?.remove();
		this.updateValue();
	};

	addName(button) {
		//Добавление нового имени в Шаблон
		let type = button.dataset.type;
		let name = document.createElement("div");
		name.innerHTML = ""
			+ `<input id="name.${type}" type="text" style="flex: 9;" value="">`
			+ `<a class="button" data-action="removeName" style="flex: 1;" data-tooltip="${game.i18n.localize("WFRP4E.Looting.Generator.Preset.Names.Remove")}"><i class="fas fa-trash"></i></a>`;
		name.classList.add(type);
		button.insertAdjacentElement("beforebegin", name);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addName \"name\"");
			console.debug(name);
		};
		name.querySelectorAll("a.button[data-action=\"removeName\"]").forEach(b => {b.addEventListener("click", (e) => {this.removeName(b)})});
	};

	removeName(button) {
		//Удаление имени
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset removeName \"prop\"");
			console.debug(button.closest("div").querySelector("input").value);
		};
		button.closest("div")?.remove();
	};

	async addScript(button) {
		//Добавление скриптов в шаблон
		let effectID = button.previousElementSibling.value;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addScript \"effectID\"");
			console.debug(effectID);
		};
		//Если эффект выбран, добавить его в список скриптов
		if (effectID != "false") {
			if (!Array.from(button.closest("div.scripts").querySelectorAll("div.body > a")).map(a => a.dataset.id).includes(effectID)) {
				let effect = game.wfrp4e.looting.data.generator.effects.all.find(s => s.id == effectID);
				let script = document.createElement("a");
				script.classList.add("button");
				script.dataset.action = "script";
				script.dataset.id = effect.id;
				script.dataset.chance = 100;
				script.textContent = effect.name + (script.dataset.chance == 100 ? "" : " [" + script.dataset.chance + "%]") + (this.debug ? " [" + effect.id + "]" : "");
				if (effect.default) {script.dataset.type = "default"};
				script.oncontextmenu = (event) => {
					event.preventDefault();
					event.target.remove();
				};
				script.dataset.tooltip = (effect.default ? effect.hint + "<hr>" : "")
					+ game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Hint.LMB")
					+ "<br>"
					+ game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Hint.Alt")
					+ "<br>"
					+ game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Hint.RMB");
				this.updateChances(button.closest("div.scripts").querySelector("div.body").insertAdjacentElement("beforeend", script));
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addScript \"effect\", \"script\"");
					console.debug(effect);
					console.debug(script);
				};
			} else {ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Error"))};
		};
	};

	//Обновление шанса срабатывания скрипта
	async updateChances(button) {
		await foundry.applications.api.DialogV2.prompt({
			window: {title: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Chance")},
			content: `<input name="chance" type="number" min="0" max="100" value="${button.dataset.chance}" autofocus required>`,
			ok: {
				label: game.i18n.localize("Submit"),
				callback: async (event, nameButton, dialog) => {
					button.dataset.chance = nameButton.form.elements.chance.value;
				}
			}
		});
		let effName = game.wfrp4e.looting.data.generator.effects.all.find(s => s.id == button.dataset.id)?.name || button.dataset.id;
		button.textContent = effName + (button.dataset.chance == 100 ? "" : " [" + button.dataset.chance + "%]") + (this.debug ? " [" + button.dataset.id + "]" : "");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset updateChances \"button.dataset.chance\"");
			console.debug(button.dataset.chance);
		};
	};

	async update(customGenerator) {
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset update \"customGenerator\"");
			console.debug(customGenerator);
		};
		//Обновление настроек: добавление нового шаблона
		await game.settings.set("wfrp4e-looting", "customGenerator", customGenerator);
	};

	async close(options) {
		this.options.resolve?.();
		return super.close(options);
	};
};
warhammer.apps.WFRP4eLootingGeneratorPreset = WFRP4eLootingGeneratorPreset;

Hooks.on("renderItemDirectory", () => {
	//Сокрытие предмета, содержащего скрипты
	let item = document.querySelector(`li.directory-item.document.item[data-entry-id="${game.settings.get("wfrp4e-looting", "effectsItem").replace("Item.", "")}"]`);
	if (item) {item.hidden = true};
	//Добавление кнопок в шапку предметов
	updateGeneratorButton();
});

function updateGeneratorButton() {
	if (game.user.isGM) {
		let headerActions = document.querySelector("section#items > header > .header-actions");
		if (!headerActions) {return};
		//Добавление кнопки генератора предметов
		if (!document.querySelector("section#items > header > .header-actions > button[data-action=\"lootingGenerator\"]")) {
			let button = document.createElement("button");
			button.type = "button";
			button.dataset.action = "lootingGenerator";
			button.innerHTML = `<i class="fas fa-dice-d20"></i><span>${game.i18n.localize("WFRP4E.Looting.Generator.Title")}</span>`;
			button.addEventListener("click", (element) => {warhammer.apps.WFRP4eLootingGenerator.create()});
			document.querySelector("section#items > header > .header-actions").insertAdjacentElement("beforeend", button);
		};
		//Добавление кнопки редактора скриптов
		if (!document.querySelector("section#items > header > .header-actions > button[data-action=\"scriptEditor\"]")) {
			let button = document.createElement("button");
			button.type = "button";
			button.dataset.action = "scriptEditor";
			button.innerHTML = `<i class="fas fa-dice-d20"></i><span>${game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Tooltip")}</span>`;
			button.addEventListener("click", async (element) => {
				let item = await fromUuid(game.settings.get("wfrp4e-looting", "effectsItem"));
				if (item) {item.sheet.render(true)};
			});
			document.querySelector("section#items > header > .header-actions").insertAdjacentElement("beforeend", button);
		};
	};
};

Hooks.on("renderItemSheetV2", (event, html) => {
	if (event.item.uuid == game.settings.get("wfrp4e-looting", "effectsItem")) {
		//Изменение отображения листов
		let header = html.querySelector("div.sheet-header");
		if (header) {header.hidden = true};
		let tabs = html.querySelector("nav.sheet-tabs");
		if (tabs) {tabs.hidden = true};
		html.querySelectorAll("section.tab:not([data-tab=\"effects\"])").forEach(t => t.classList.remove("active"));
		html.querySelector("section.tab[data-tab=\"effects\"]")?.classList.add("active");
		let listControls = html.querySelector("div.list-header div.list-controls");
		if (listControls) {listControls.hidden = true};
		//Изменение отображения скриптов
		html.querySelectorAll("section[data-tab=\"effects\"] .list-content > div").forEach(e => {
			let effect = fromUuidSync(e.dataset.uuid);
			if (!effect) {return};
			if (effect.flags.looting?.id) {
				let labelEl = e.querySelector("div.list-name a.label");
				if (labelEl) {
					let prefix = effect.flags.looting?.default
						? game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts." + effect.flags.looting.id + ".Label")
						: effect.flags.looting.name;
					labelEl.textContent = prefix + ": " + labelEl.textContent + (game.settings.get("wfrp4e-tools", "debug") ? " [" + effect.flags.looting.id + "]" : "");
				};
			} else {e.hidden = true};
			if (effect.flags.looting?.default) {
				let ctrl = e.querySelector("div.list-controls");
				if (ctrl) {ctrl.hidden = true};
			} else {
				let toggle = e.querySelector("div.list-controls a.list-control[data-action=\"toggleProperty\"]");
				if (toggle) {toggle.hidden = true};
			};
		});
		//Добавление кнопки Нового скрипта
		if (!html.querySelector("button[data-action=\"addNewScript\"]")) {
			let button = document.createElement("button");
			button.type = "button";
			button.classList.add("header-control", "icon", "fa-solid", "fa-plus");
			button.ariaLabel = game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Add");
			button.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Add");
			button.dataset.action = "addNewScript";
			button.addEventListener("click", () => {addNewScript()});
			html.querySelector("header.window-header > h1.window-title")?.insertAdjacentElement("afterend", button);
		};
	} else if (!event.item.inCompendium) {
		if (game.user.isGM) {
			//Добавление кнопки "Добавить скрипт" в шапку эффектов
			let button = addGeneratorScript(event.item, html);
			if (!button) {return};
			//Добавление списка скриптов
			let scripts = [];
			if (event.item.flags.looting?.scripts?.length) {
				event.item.flags.looting.scripts.forEach(e => {
					let effect = game.wfrp4e.looting.data.generator.effects.all.find(s => s.id == e);
					if (!effect) {return};
					if (effect.default) {scripts.push(game.i18n.localize(`WFRP4E.Looting.Generator.Lists.Scripts.${e}.Label`))}
					else {scripts.push(effect.name)};
				});
			};
			if (!scripts.length) {scripts.push(game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Empty"))};
			button.dataset.tooltip = "<strong>" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Tooltip") + ": </strong><i>" + scripts.join(", ") + "</i>.<hr>" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.LMB") + "<br>" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.RMB");
		} else {
			//Сокрытие скриптов генератора
			html.querySelectorAll("section[data-tab=\"effects\"] .list-content > div").forEach(e => {
				let effect = fromUuidSync(e.dataset.uuid);
				if (effect?.flags?.looting?.id && game.settings.get("wfrp4e-looting", "hideEffects")) {e.hidden = true};
			});
		};
	};
});

async function addNewScript(item, html) {
	let debug = game.settings.get("wfrp4e-tools", "debug");
	await foundry.applications.api.DialogV2.prompt({
		window: {title: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Create.Name")},
		content: "<p style=\"text-align: center;\">" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Create.New") + "<input name=\"name\" type=\"text\"></p>"
			+ "<span style=\"text-align: center;\">" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Create.Or") + "</span>"
			+ "<p style=\"text-align: center;\">" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Create.Add") + "<select name=\"script\" style=\"text-align: center;\">"
			+ "\n\t<option disabled hidden selected value=\"false\">" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Option") + (debug ? " [false]" : "") + "</option>"
			+ game.settings.get("wfrp4e-looting", "customEffects").map(e => {return "\n\t<option value=\"" + e.id + "\">" + e.name + (debug ? " [" + e.id + "]" : "") + "</option>"}).join("")
			+ "\n</select></p>",
		ok: {
			label: game.i18n.localize("Submit"),
			callback: async (event, IDbutton, dialog) => {
				//Проверка на пустой ввод
				if (!IDbutton.form.elements.name.value && IDbutton.form.elements.script.value == "false") {return};
				if (debug) {
					console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addNewScript \"newName\", \"script\"");
					console.debug(IDbutton.form.elements.name.value);
					console.debug(IDbutton.form.elements.script.value);
				};
				//Предмет, содержащий скрипты
				let item = await fromUuid(game.settings.get("wfrp4e-looting", "effectsItem"));
				let script = false;
				//Если добавляется эффект в существующий скрипт
				if (IDbutton.form.elements.script.value != "false") {
					let effect = game.wfrp4e.looting.data.generator.effects.all.find(e => e.id == IDbutton.form.elements.script.value);
					//Создание эффекта
					script = await item.createEmbeddedDocuments("ActiveEffect", [{
						name: effect.name,
						img: "modules/wfrp4e-core/icons/unarmed.png",
						flags: {
							looting: {
								id: effect.id,
								name: effect.name
							}
						}
					}], {onReset: true});
				//Если добавляется новый скрипт
				} else {
					//Создание эффекта
					script = await item.createEmbeddedDocuments("ActiveEffect", [{
						name: IDbutton.form.elements.name.value,
						img: "modules/wfrp4e-core/icons/unarmed.png",
						flags: {
							looting: {
								id: foundry.utils.randomID(),
								name: IDbutton.form.elements.name.value
							}
						}
					}], {onReset: true});
				};
				if (script.length) {
					script = script[0];
					if (debug) {
						console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addNewScript \"script\"");
						console.debug(script);
					};
					script.sheet.render(true);
					if (document.querySelector("div.scripts")) {
						if (IDbutton.form.elements.script.value == "false") {
							let scriptSelect = document.querySelector("div.scripts > select#script");
							if (scriptSelect) {
								let option = document.createElement("option");
								option.textContent = script.name + (debug ? " [" + script.flags.looting.id + "]" : "");
								option.value = script.flags.looting.id;
								scriptSelect.appendChild(option);
							};
						};
					};
				};
			}
		}
	});
};

function addGeneratorScript(item, html) {
	let existing = html.querySelector("section[data-tab=\"effects\"] .list-header > .list-controls > a[data-action=\"addGeneratorScript\"]");
	if (existing) {return existing};
	let container = html.querySelector("section[data-tab=\"effects\"] .list-header > .list-controls");
	if (!container) {return null};
	let a = document.createElement("a");
	a.classList.add("list-control");
	a.dataset.action = "addGeneratorScript";
	a.dataset.tooltip = "";
	a.innerHTML = "<i class=\"fas fa-square-plus\"></i>";
	a.addEventListener("click", async () => {
		let scripts = game.wfrp4e.looting.data.generator.effects.all.filter(s => !item.flags.looting?.scripts?.includes(s.id));
		if (!scripts.length) {return};
		let choice = await ItemDialog.create(scripts.map(s => ({name: s.name, img: s.img || s.effects?.[0]?.img, id: s.id, description: s.hint})), scripts.length, {text: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Text.Add"), title: game.i18n.localize("WH.Scripts")});
		if (choice?.length) {await warhammer.apps.WFRP4eLootingGenerator.addScripts(item.uuid, choice)};
	});
	a.addEventListener("contextmenu", async (element) => {
		element.preventDefault();
		let scripts = game.wfrp4e.looting.data.generator.effects.all.filter(s => item.flags.looting?.scripts?.includes(s.id));
		if (!scripts.length) {return};
		let choice = await ItemDialog.create(scripts.map(s => ({name: s.name, img: s.img || s.effects?.[0]?.img, id: s.id, description: s.hint})), scripts.length, {text: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Text.Remove"), title: game.i18n.localize("WH.Scripts")});
		if (choice?.length) {
			let chosenIds = choice.map(c => c.id);
			let deleteIds = item.effects.filter(e => chosenIds.includes(e.flags.looting?.id)).map(e => e.id);
			if (deleteIds.length) {await item.deleteEmbeddedDocuments("ActiveEffect", deleteIds)};
		};
	});
	return container.insertAdjacentElement("afterbegin", a);
};

function calcGeneratorPresetValue(p) {
	let value = 0;
	p.qualities?.forEach((q, i) => {
		p.qualities[i].label = game.wfrp4e.looting.data.generator.names[p.qualities[i].name];
		value += p.qualities[i].chance * p.qualities[i].quantity / 100;
	});
	p.flaws?.forEach((f, i) => {
		p.flaws[i].label = game.wfrp4e.looting.data.generator.names[p.flaws[i].name];
		value -= p.flaws[i].chance * p.flaws[i].quantity / 100;
	});
	value = Math.round(value);

	if (value > 2) {value = game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.>2")}
	else if (value == 2) {value = game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.2")}
	else if (value == 1) {value = game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.1")}
	else if (value == 0) {value = game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.0")}
	else if (value == -1) {value = game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.-1")}
	else if (value == -2) {value = game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.-2")}
	else if (value < -2) {value = game.i18n.localize("WFRP4E.Looting.Generator.Preset.RatioOfProperties.<-2")};

	return value;
};

Hooks.once("init", () => {
	game.settings.register("wfrp4e-looting", "customLooting", {
		scope: "world",
		config: false,
		default: [],
		type: Array,
		onChange: (value) => {
			if (game.settings.get("wfrp4e-tools", "debug")) {
				console.debug(...debugMessage, "customLooting onChange \"value\"");
				console.debug(value);
			};
		}
	});
	game.settings.register("wfrp4e-looting", "customGenerator", {
		scope: "world",
		config: false,
		default: [],
		type: Array,
		onChange: (value) => {
			if (!game.wfrp4e?.looting?.data) {return};
			game.wfrp4e.looting.data.generator.presets.all = game.wfrp4e.looting.data.generator.presets.default.concat(game.wfrp4e.looting.data.generator.presets.props, value);
			game.wfrp4e.looting.data.generator.presets.all.forEach(p => {
				p.types.value = [(p.types.trapping ? "trapping" : ""), (p.types.melee ? "melee" : ""), (p.types.range ? "range" : ""), (p.types.armour ? "armour" : "")].filter(Boolean).join(",");
				p.value = calcGeneratorPresetValue(p);
				p.scripts = (p.scripts || []).reduce((acc, s) => {
					let script = game.wfrp4e.looting.data.generator.effects.all.find(e => e.id == s.id);
					if (script) {
						s.name = script.name;
						s.hint = script.hint;
						s.default = script.default;
						acc.push(s);
					};
					return acc;
				}, []);
			});
			if (game.settings.get("wfrp4e-tools", "debug")) {
				console.debug(...debugMessage, "customGenerator onChange \"game.wfrp4e.looting.data.generator.presets.all\"");
				console.debug(game.wfrp4e.looting.data.generator.presets.all);
			};
		}
	});
	game.settings.register("wfrp4e-looting", "customEffects", {
		scope: "world",
		config: false,
		default: [],
		type: Array,
		onChange: (value) => {
			if (!game.wfrp4e?.looting?.data) {return};
			game.wfrp4e.looting.data.generator.effects.all = game.wfrp4e.looting.data.generator.effects.default.concat(value);
			if (game.settings.get("wfrp4e-tools", "debug")) {
				console.debug(...debugMessage, "customGenerator onChange \"game.wfrp4e.looting.data.generator.presets.all\"");
				console.debug(game.wfrp4e.looting.data.generator.effects.all);
			};
		}
	});
	game.settings.register("wfrp4e-looting", "effectsItem", {
		scope: "world",
		config: false,
		default: "",
		type: String
	});
	game.settings.register("wfrp4e-looting", "modifier", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.modifier.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.modifier.Hint"),
		scope: "world",
		config: true,
		default: 1,
		type: Number
	});
	game.settings.register("wfrp4e-looting", "sellItems", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.sellItems.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.sellItems.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-looting", "itemsModifier", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.itemsModifier.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.itemsModifier.Hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("wfrp4e-looting", "tokenLootButton", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.tokenLootButton.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.tokenLootButton.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-looting", "editName", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.editName.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.editName.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-looting", "hideQualities", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.hideQualities.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.hideQualities.Hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
		onChange: (value) => {value ? document.body.style.setProperty("--baseQuality", "none") : document.body.style.setProperty("--baseQuality", "unset")}
	});
	game.settings.register("wfrp4e-looting", "hideEffects", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.hideEffects.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.hideEffects.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-looting", "propsCompatibility", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.propsCompatibility.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.propsCompatibility.Hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	//Настройки для интеграции с WFRP4e Tools
	game.settings.register("wfrp4e-looting", "controlButtons", {
		scope: "world",
		config: false,
		default: [
			{
				name: "looting",
				title: "WFRP4E.Looting.Loot.Title",
				icon: "fas fa-treasure-chest",
				visible: true,
				button: true,
				onChange: "game.wfrp4e.tools.Looting.create()"
			}
		],
		type: Array
	});
});

Hooks.once("wfrp4e:toolsReady", async () => {
	game.wfrp4e.tools.registerModule("wfrp4e-looting", {
		debug: [
			{
				form: {id: "lootingDebug", template: "modules/wfrp4e-looting/templates/debug.hbs"},
				listener: {
					selector: "a.button[data-action=\"importExportLooting\"]",
					action: "click",
					func: async () => {
						let action = await foundry.applications.api.DialogV2.confirm({
							window: {title: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Action.Title")},
							content: "",
							yes: {
								icon: "fas fa-file-import",
								label: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Action.Import"),
								callback: () => "import"
							},
							no: {
								icon: "fas fa-file-export",
								label: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Action.Export"),
								callback: () => "export"
							}
						});
						if (action == "import") {
							let file = false;
							await foundry.applications.api.DialogV2.prompt({
								window: {title: game.i18n.localize("WFRP4E.Looting.Settings.importExport.File")},
								content: `<input name="file" type="file" accept=".txt,.json,text/plain,application/json" autofocus>`,
								ok: {
									label: game.i18n.localize("Submit"),
									callback: (event, button) => {file = button.form.elements.file.files[0]}
								}
							});
							if (!file) {return};
							let parsed;
							try {
								parsed = JSON.parse(await foundry.utils.readTextFromFile(file));
							} catch (e) {
								game.wfrp4e.tools.newNotification({text: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Error")}, {color: "red"});
								return;
							};
							if (!parsed || typeof parsed !== "object") {
								game.wfrp4e.tools.newNotification({text: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Error")}, {color: "red"});
								return;
							};
							let types = [
								{key: "customLooting", labelKey: "customPresets"},
								{key: "customGenerator", labelKey: "customGenerator"},
								{key: "customEffects", labelKey: "customEffects"}
							];
							for (let t of types) {
								if (!Array.isArray(parsed[t.key])) {continue};
								let existing = game.settings.get("wfrp4e-looting", t.key);
								let replace = existing.length ? await foundry.applications.api.DialogV2.confirm({
									window: {title: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Replace.Title")},
									content: `${game.i18n.format("WFRP4E.Looting.Settings.importExport.Replace.Content", {type: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Replace." + t.labelKey)})}<span style="font-size: 0.8rem; font-style: italic;">${game.i18n.localize("WFRP4E.Looting.Settings.importExport.Replace.Hint")}</span>`
								}) : true;
								if (replace === null) {continue};
								if (replace) {
									await game.settings.set("wfrp4e-looting", t.key, parsed[t.key]);
								} else {
									let items = parsed[t.key].map(p => {
										let copy = foundry.utils.deepClone(p);
										copy.id = foundry.utils.randomID();
										if (copy.uuid) {copy.uuid = copy.id};
										return copy;
									});
									await game.settings.set("wfrp4e-looting", t.key, existing.concat(items));
								};
							};
							await updateLootingScriptsItem();
							game.wfrp4e.tools.newNotification({text: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Complete")}, {color: "green"});
						} else if (action == "export") {
							let data = {
								customLooting: game.settings.get("wfrp4e-looting", "customLooting"),
								customGenerator: game.settings.get("wfrp4e-looting", "customGenerator"),
								customEffects: game.settings.get("wfrp4e-looting", "customEffects")
							};
							foundry.utils.saveDataToFile(JSON.stringify(data), "text/plain", `${game.i18n.localize("WFRP4E.Looting.Name")} (${game.i18n.localize("WFRP4E.Looting.Settings.importExport.Name")}).txt`);
						};
					}
				}
			},
			{
				listener: {
					selector: "a.button[data-action=\"resetLooting\"]",
					action: "click",
					func: async () => {
						let confirm = await foundry.applications.api.DialogV2.confirm({
							window: {title: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Looting")},
							content: `<p>${game.i18n.format("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Confirm", {type: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Looting")})}</p>`
						});
						if (!confirm) {return};
						await game.settings.set("wfrp4e-looting", "customLooting", []);
						game.wfrp4e.tools.newNotification({text: game.i18n.format("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Notify", {type: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Looting")})}, {color: "green"});
					}
				}
			},
			{
				listener: {
					selector: "a.button[data-action=\"resetGenerator\"]",
					action: "click",
					func: async () => {
						let confirm = await foundry.applications.api.DialogV2.confirm({
							window: {title: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Generator")},
							content: `<p>${game.i18n.format("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Confirm", {type: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Generator")})}</p>`
						});
						if (!confirm) {return};
						await game.settings.set("wfrp4e-looting", "customGenerator", []);
						game.wfrp4e.tools.newNotification({text: game.i18n.format("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Notify", {type: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Generator")})}, {color: "green"});
					}
				}
			},
			{
				listener: {
					selector: "a.button[data-action=\"resetScripts\"]",
					action: "click",
					func: async () => {
						let confirm = await foundry.applications.api.DialogV2.confirm({
							window: {title: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Scripts")},
							content: `<p>${game.i18n.format("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Confirm", {type: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Scripts")})}</p>`
						});
						if (!confirm) {return};
						await game.settings.set("wfrp4e-looting", "customEffects", []);
						await updateLootingScriptsItem();
						game.wfrp4e.tools.newNotification({text: game.i18n.format("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Notify", {type: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Scripts")})}, {color: "green"});
					}
				}
			},
			{
				listener: {
					selector: "a.button[data-action=\"updateLootingScripts\"]",
					action: "click",
					func: async () => {
						await updateLootingScriptsItem();
						game.wfrp4e.tools.newNotification({text: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Update.Notify")}, {color: "green"});
					}
				}
			}
		],
		sockets: {
			lootingEditMessage: async (messageId, content) => {
				let activeGM = game.users.activeGM;
				if (!game.user.isGM || (activeGM && activeGM.id !== game.user.id)) {return};
				await game.messages.get(messageId)?.update({content});
			},
			lootingMarkToken: async (tokenUuid, state) => {
				let activeGM = game.users.activeGM;
				if (!game.user.isGM || (activeGM && activeGM.id !== game.user.id)) {return};
				let tokenDoc = await fromUuid(tokenUuid);
				if (tokenDoc) {await tokenDoc.update({"flags.looting.looted": Boolean(state)})};
			}
		}
	});
	game.wfrp4e.tools.Looting = WFRP4eLootingLoot;
	game.wfrp4e.tools.LootingPreset = WFRP4eLootingLootPreset;
	game.wfrp4e.tools.Generator = WFRP4eLootingGenerator;
	game.wfrp4e.tools.GeneratorPreset = WFRP4eLootingGeneratorPreset;
	game.wfrp4e.looting = {
		data: {
			defaultList: [
				{
					id: "hovel",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Hovel.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Hovel.Title"),
					type: "brass",
					money: {
						bp: {
							chance: 50,
							dice: {count: 1, type: 10}
						},
						ss: {
							chance: 10,
							dice: {count: 1, type: 5}
						},
						gc: {
							chance: 1,
							dice: {count: 1, type: 5}
						}
					},
					tables: [
						{table: "DomesticItems", chance: 10, dice: {count: 1, type: 5}},
						{table: "ClothesFursHangings", chance: 10, dice: {count: 1, type: 1}}
					]
				},
				{
					id: "house",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.House.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.House.Title"),
					type: "silver",
					money: {
						bp: {
							chance: 100,
							dice: {count: 6, type: 10}
						},
						ss: {
							chance: 100,
							dice: {count: 2, type: 10}
						},
						gc: {
							chance: 25,
							dice: {count: 1, type: 10}
						}
					},
					tables: [
						{table: "DomesticItems", chance: 100, dice: {count: 1, type: 10}},
						{table: "GemsJewellery-silver", chance: 5, dice: {count: 1, type: 5}},
						{table: "ObjetsdArt", chance: 10, dice: {count: 1, type: 2}},
						{table: "ClothesFursHangings", chance: 25, dice: {count: 1, type: 5}}
					]
				},
				{
					id: "estate",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Estate.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Estate.Title"),
					type: "gold",
					money: {
						bp: {
							chance: 100,
							dice: {count: 2, type: 100}
						},
						ss: {
							chance: 100,
							dice: {count: 1, type: 100}
						},
						gc: {
							chance: 100,
							dice: {count: 1, type: 100}
						}
					},
					tables: [
						{table: "DomesticItems", chance: 100, dice: {count: 2, type: 10}},
						{table: "GemsJewellery-gold", chance: 90, dice: {count: 1, type: 10}},
						{table: "ObjetsdArt", chance: 75, dice: {count: 1, type: 10}},
						{table: "ClothesFursHangings", chance: 100, dice: {count: 1, type: 10}}
					]
				},
				{
					id: "wizardsHouse",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.WizardsHouse.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.WizardsHouse.Title"),
					type: "gold",
					money: {
						bp: {
							chance: 100,
							dice: {count: 3, type: 10}
						},
						ss: {
							chance: 75,
							dice: {count: 5, type: 10}
						},
						gc: {
							chance: 50,
							dice: {count: 3, type: 10}
						}
					},
					tables: [
						{table: "DomesticItems", chance: 25, dice: {count: 1, type: 5}},
						{table: "GemsJewellery-gold", chance: 75, dice: {count: 1, type: 5}},
						{table: "ObjetsdArt", chance: 75, dice: {count: 1, type: 2}},
						{table: "ClothesFursHangings", chance: 25, dice: {count: 1, type: 5}}
					]
				},
				{
					id: "workshop",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Workshop.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Workshop.Title"),
					type: "silver",
					money: {
						bp: {
							chance: 75,
							dice: {count: 1, type: 100}
						},
						ss: {
							chance: 50,
							dice: {count: 3, type: 10}
						},
						gc: {
							chance: 25,
							dice: {count: 1, type: 10}
						}
					},
					tables: [
						{table: "DomesticItems", chance: 10, dice: {count: 1, type: 5}},
						{table: "GemsJewellery-silver", chance: 5, dice: {count: 1, type: 5}},
						{table: "ObjetsdArt", chance: 1, dice: {count: 1, type: 1}},
						{table: "ClothesFursHangings", chance: 25, dice: {count: 1, type: 2}}
					]
				},
				{
					id: "shrine",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Shrine.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Shrine.Title"),
					type: "brass",
					money: {
						bp: {
							chance: 100,
							dice: {count: 1, type: 100}
						},
						ss: {
							chance: 50,
							dice: {count: 1, type: 10}
						},
						gc: {
							chance: 5,
							dice: {count: 1, type: 5}
						}
					},
					tables: [
						{table: "GemsJewellery-brass", chance: 25, dice: {count: 1, type: 1}},
						{table: "ObjetsdArt", chance: 75, dice: {count: 1, type: 1}},
						{table: "ClothesFursHangings", chance: 5, dice: {count: 1, type: 1}}
					]
				},
				{
					id: "temple",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Temple.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Temple.Title"),
					type: "gold",
					money: {
						bp: {
							chance: 100,
							dice: {count: 5, type: 100}
						},
						ss: {
							chance: 75,
							dice: {count: 1, type: 100}
						},
						gc: {
							chance: 50,
							dice: {count: 5, type: 10}
						}
					},
					tables: [
						{table: "DomesticItems", chance: 25, dice: {count: 1, type: 10}},
						{table: "GemsJewellery-gold", chance: 75, dice: {count: 1, type: 5}},
						{table: "ObjetsdArt", chance: 50, dice: {count: 1, type: 5}},
						{table: "ClothesFursHangings", chance: 100, dice: {count: 1, type: 10}}
					]
				},
				{
					id: "smallMonster",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.SmallMonster.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.SmallMonster.Title"),
					type: "silver",
					money: {
						bp: {
							chance: 50,
							dice: {count: 5, type: 10}
						},
						ss: {
							chance: 15,
							dice: {count: 2, type: 10}
						},
						gc: {
							chance: 15,
							dice: {count: 1, type: 5}
						}
					},
					tables: [
						{table: "GemsJewellery-silver", chance: 15, dice: {count: 1, type: 1}}
					]
				},
				{
					id: "largeMonster",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.LargeMonster.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.LargeMonster.Title"),
					type: "gold",
					money: {
						bp: {
							chance: 75,
							dice: {count: 2, type: 100}
						},
						ss: {
							chance: 50,
							dice: {count: 1, type: 100}
						},
						gc: {
							chance: 25,
							dice: {count: 1, type: 100}
						}
					},
					tables: [
						{table: "DomesticItems", chance: 5, dice: {count: 1, type: 10}},
						{table: "GemsJewellery-gold", chance: 75, dice: {count: 1, type: 10}}
					]
				},
				{
					id: "chestOpen",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.ChestOpen.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.ChestOpen.Title"),
					type: "silver",
					money: {
						bp: {
							chance: 25,
							dice: {count: 1, type: 100}
						},
						ss: {
							chance: 25,
							dice: {count: 1, type: 10}
						},
						gc: {
							chance: 5,
							dice: {count: 1, type: 10}
						}
					},
					tables: [
						{table: "DomesticItems", chance: 5, dice: {count: 1, type: 1}},
						{table: "GemsJewellery-silver", chance: 5, dice: {count: 1, type: 1}},
						{table: "ClothesFursHangings", chance: 5, dice: {count: 1, type: 1}}
					]
				},
				{
					id: "chestSecure",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.ChestSecure.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.ChestSecure.Title"),
					type: "gold",
					money: {
						bp: {
							chance: 100,
							dice: {count: 5, type: 10}
						},
						ss: {
							chance: 100,
							dice: {count: 3, type: 10}
						},
						gc: {
							chance: 50,
							dice: {count: 2, type: 10}
						}
					},
					tables: [
						{table: "DomesticItems", chance: 10, dice: {count: 1, type: 1}},
						{table: "GemsJewellery-gold", chance: 15, dice: {count: 1, type: 10}},
						{table: "ObjetsdArt", chance: 5, dice: {count: 1, type: 1}},
						{table: "ClothesFursHangings", chance: 15, dice: {count: 1, type: 1}}
					]
				},
				{
					id: "chestVault",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.ChestVault.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.ChestVault.Title"),
					type: "gold",
					money: {
						bp: {
							chance: 100,
							dice: {count: 5, type: 100}
						},
						ss: {
							chance: 100,
							dice: {count: 4, type: 100}
						},
						gc: {
							chance: 100,
							dice: {count: 3, type: 100}
						}
					},
					tables: [
						{table: "GemsJewellery-gold", chance: 100, dice: {count: 5, type: 10}},
						{table: "ObjetsdArt", chance: 100, dice: {count: 1, type: 10}},
						{table: "ClothesFursHangings", chance: 25, dice: {count: 1, type: 1}}
					]
				},
				{
					id: "peasant",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Peasant.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Peasant.Title"),
					type: "brass",
					money: {
						bp: {
							chance: 15,
							dice: {count: 1, type: 10}
						},
						ss: {
							chance: 5,
							dice: {count: 1, type: 2}
						},
						gc: {
							chance: 0,
							dice: {count: 1, type: 1}
						}
					},
					tables: [
						{table: "ClothesFursHangings", chance: 1, dice: {count: 1, type: 1}}
					]
				},
				{
					id: "citizen",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Citizen.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Citizen.Title"),
					type: "silver",
					money: {
						bp: {
							chance: 75,
							dice: {count: 1, type: 10}
						},
						ss: {
							chance: 75,
							dice: {count: 1, type: 10}
						},
						gc: {
							chance: 5,
							dice: {count: 1, type: 5}
						}
					},
					tables: [
						{table: "GemsJewellery-silver", chance: 1, dice: {count: 1, type: 1}},
						{table: "ClothesFursHangings", chance: 5, dice: {count: 1, type: 1}}
					]
				},
				{
					id: "noble",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Noble.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Noble.Title"),
					type: "gold",
					money: {
						bp: {
							chance: 100,
							dice: {count: 1, type: 100}
						},
						ss: {
							chance: 100,
							dice: {count: 2, type: 10}
						},
						gc: {
							chance: 100,
							dice: {count: 1, type: 10}
						}
					},
					tables: [
						{table: "GemsJewellery-gold", chance: 50, dice: {count: 1, type: 2}},
						{table: "ObjetsdArt", chance: 5, dice: {count: 1, type: 1}},
						{table: "ClothesFursHangings", chance: 100, dice: {count: 1, type: 5}}
					]
				},
				{
					id: "wizard",
					name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Wizard.Name"),
					hint: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Presets.Wizard.Title"),
					type: "gold",
					money: {
						bp: {
							chance: 25,
							dice: {count: 2, type: 10}
						},
						ss: {
							chance: 50,
							dice: {count: 2, type: 10}
						},
						gc: {
							chance: 50,
							dice: {count: 1, type: 10}
						}
					},
					tables: [
						{table: "GemsJewellery-gold", chance: 5, dice: {count: 1, type: 1}},
						{table: "ClothesFursHangings", chance: 1, dice: {count: 1, type: 1}}
					]
				},
			],
			lootTables: [
				{
					table: "DomesticItems",
					title: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.DomesticItems"),
					weights: 10,
					hidden: false,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.DomesticItems.CandelabraCandles"), weight: 1},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.DomesticItems.CupsGlasses"), weight: 1},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.DomesticItems.Cutlery"), weight: 1},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.DomesticItems.Goblets"), weight: 1},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.DomesticItems.LanternOil"), weight: 1},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.DomesticItems.PipeTobacco"), weight: 1},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.DomesticItems.PlatesBowls"), weight: 1},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.DomesticItems.Teaware"), weight: 1},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.DomesticItems.WineSpirits"), weight: 1},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name"), weight: 1}
					],
					price: {count: 1, type: 10, mod: ""}
				},
				{
					table: "GemsJewellery-brass",
					type: "brass",
					title: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.GemsJewellery"),
					weights: 200,
					hidden: false,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsBrass.Amber"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsBrass.Agate"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsBrass.Hematite"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsBrass.LapisLazuli"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsBrass.Malachite"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsBrass.Rhodocrosite"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsBrass.Obsidian"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsBrass.Quartz"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsBrass.TigerEye"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsBrass.Turquoise"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Amulet"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Armlet"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Bracelet"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Brooch"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Chain"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Choker"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Circlet"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.CuffLinks"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Earrings"), weight: 9},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Hairpin"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Hatpin"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Locket"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Medallion"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Necklace"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Pendant"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.PocketWatch"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.PrayerBeads"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.RingDecorative"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.RingPromise"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.RingWedding"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.SignetRing"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Torc"), weight: 5},
					],
					price: {count: 2, type: 10, mod: ""}
				},
				{
					table: "GemsJewellery-silver",
					type: "silver",
					title: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.GemsJewellery"),
					weights: 200,
					hidden: false,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsSilver.Amethyst"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsSilver.Aquamarine"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsSilver.Bloodstone"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsSilver.Citrine"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsSilver.Jasper"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsSilver.Moonstone"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsSilver.Onyx"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsSilver.Peridot"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsSilver.Topaz"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsSilver.Zircon"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Amulet"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Armlet"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Bracelet"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Brooch"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Chain"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Choker"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Circlet"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.CuffLinks"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Earrings"), weight: 9},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Hairpin"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Hatpin"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Locket"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Medallion"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Necklace"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Pendant"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.PocketWatch"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.PrayerBeads"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.RingDecorative"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.RingPromise"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.RingWedding"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.SignetRing"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Torc"), weight: 5},
					],
					price: {count: 2, type: 10, mod: ""}
				},
				{
					table: "GemsJewellery-gold",
					type: "gold",
					title: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.GemsJewellery"),
					weights: 200,
					hidden: false,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsGold.Beryl"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsGold.Diamond"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsGold.Emerald"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsGold.Garnet"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsGold.Jade"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsGold.Opal"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsGold.Pearl"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsGold.Ruby"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsGold.Sapphire"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.GemsGold.Spinel"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Amulet"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Armlet"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Bracelet"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Brooch"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Chain"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Choker"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Circlet"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.CuffLinks"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Earrings"), weight: 9},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Hairpin"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Hatpin"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Locket"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Medallion"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Necklace"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Pendant"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.PocketWatch"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.PrayerBeads"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.RingDecorative"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.RingPromise"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.RingWedding"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.SignetRing"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.Jewellery.Torc"), weight: 5},
					],
					price: {count: 2, type: 10, mod: ""}
				},
				{
					table: "ObjetsdArt",
					title: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.ObjetsdArt"),
					weights: 100,
					hidden: false,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Abacus"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.CarvedDragonEgg"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.CeremonialWeapon"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Chalice"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.CostumeMask"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.CrownFalse"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.CrownReal"), weight: 1},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.DecorativeComb"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Doll"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.EngravedDice"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Figurine"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Flask"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Flute"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.FramedPortrait"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.GameBoardPieces"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.HarpToy"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Idol"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Instrument"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.IvoryDrinkingHorn"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.JewelleryBox"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.LargeStatue"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.LetterOpener"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.MiniSarcophagus"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.MusicBox"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Orrery"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Painting"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Paperweight"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.PewterMug"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Sceptre"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.SmallMirror"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Statuette"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.Vase"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.WarMask"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ObjetsdArt.WoodCarving"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name"), weight: 1}
					],
					price: {count: 2, type: 10, mod: "*5"}
				},
				{
					table: "ClothesFursHangings",
					title: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.ClothesFursHangings"),
					weights: 100,
					hidden: false,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.AnimalPelt"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Belt"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Blankets"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.BootsShoes"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Cape"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Cloak"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.ClothesFine"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.ClothesPractical"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.ClothesTravel"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Coat"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Costume"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.CourtlyGarb"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.DrapesFine"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Embroidery"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.FurCoat"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.FurStole"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.GlovesFine"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.GlovesPractical"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.HandkerchiefSilk"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.HatFancy"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.HatPractical"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.LinensFine"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.LinensPractical"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Pouch"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Purse"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Robes"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.RugFine"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.RugWoven"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Shawl"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Tapestry"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.Uniform"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.WalkingCane"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.ClothesFursHangings.WallHanging"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name"), weight: 1}
					],
					price: {count: 1, type: 10, mod: ""}
				},
				{
					table: "Other-PacksContainers",
					title: `${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.PacksContainers")} (${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name")})`,
					weights: 100,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.Backpack"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.Barrel"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.Cask"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.Flask"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.Jug"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.PewterStein"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.Pouch"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.Purse"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.Sack"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.SackLarge"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.Saddlebags"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.SlingBag"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.ScrollCase"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.PacksContainers.Waterskin"), weight: 10}
					],
					price: {count: 1, type: 10, mod: "+5"}
				},
				{
					table: "Other-FoodDrink",
					title: `${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.FoodDrink")} (${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name")})`,
					weights: 100,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.AlePint"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.AleKeg"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.BugmansAlePint"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.FoodGroceriesDay"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.ImperialBreakfast"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.MealInn"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.RationsDay"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.RationsWeek"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.RumsterPie"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.SpiritsPint"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.WineBottle"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.WineQualityBottle"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.WineRareBottle"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.FoodDrink.WineSpiritsDrink"), weight: 10}
					],
					price: {count: 1, type: 10, mod: ""}
				},
				{
					table: "Other-BooksDocuments",
					title: `${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.BooksDocuments")} (${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name")})`,
					weights: 100,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookApothecary"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookArt"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookCryptography"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookEngineer"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookIlluminated"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookLaw"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookLiterature"), weight: 20},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookMagic"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookMedicine"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookPrinted"), weight: 15},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.BookReligion"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.LegalDocument"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.Map"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.BooksDocuments.Parchment"), weight: 5}
					],
					price: {count: 2, type: 10, mod: "*5"}
				},
				{
					table: "Other-ProstheticsDisguises",
					title: `${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.ProstheticsDisguises")} (${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name")})`,
					weights: 100,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.Costume"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.DisguiseKit"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.EyePatch"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.FacePowder"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.FalseEye"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.FalseLeg"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.GildedNose"), weight: 10},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.Hook"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.EngineeringMarvel"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.MaskCostume"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.MaskWar"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ProstheticsDisguises.WoodenTeeth"), weight: 10}
					],
					price: {count: 2, type: 10, mod: ""}
				},
				{
					table: "Other-OccupationalTools",
					title: `${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.OccupationalTools")} (${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name")})`,
					weights: 100,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Abacus"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.AnimalTrap"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.BoatHook"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Broom"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Bucket"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Chisel"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.ClothesPegs"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Comb"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Crowbar"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.EarPick"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Eyeglasses"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.FishHooks"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.FishingLine"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.FishingRod"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.FloorBrush"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Gavel"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Hammer"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.HandMirror"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Hoe"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Key"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Knife"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.LockPicks"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.MagnifyingGlass"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Manacles"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Monocle"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Mop"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Nails"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.NavigationalCharts"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.PaintBrush"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.PestleMortar"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Pick"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Pole"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.QuillPen"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Rake"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.ReadingLens"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Saw"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Sickle"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.SnareWire"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Spade"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Spike"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.StampEngraved"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.TongsSteel"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Telescope"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.TradeTools"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.Tweezers"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.OccupationalTools.WritingKit"), weight: 2}
					],
					price: {count: 1, type: 10, mod: ""}
				},
				{
					table: "Other-HerbsMedsDrugs",
					title: `${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.HerbsMedsDrugs")} (${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name")})`,
					weights: 100,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.AddersRoot"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Alfunas"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.AntitoxinKit"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.AvermanniBlueleaf"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Bandage"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.BlackLotus"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.CleanRag"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Crutch"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.DigestiveTonic"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.EarthRoot"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Faxtoryll"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.FieldMedicalKit"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Gesundheit"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Hawthorn"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.HealingDraught"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.HealingPoultice"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Heartkill"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.HerbalOintment"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Juck"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.LadysMantle"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.LyeSoap"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.MadCapMushrooms"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.MageLeaf"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.MandrakeRoot"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.MedicalTools"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.MedicinalAlcohol"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Moonflower"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.NeedleThread"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.NerveTonic"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Nightshade"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Oxleaf"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.RanaldsDelight"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Salwort"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Sigmafoil"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Spellwort"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Spiderleaf"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Spit"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Tarrabeth"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Valerian"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Vanera"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Vinegar"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.VitalityDraught"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Weirdroot"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Willow"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Yarrow"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.HerbsMedsDrugs.Zitterwort"), weight: 2}
					],
					price: {count: 2, type: 10, mod: ""}
				},
				{
					table: "Other-ClothingAccessories",
					title: `${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.ClothingAccessories")} (${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name")})`,
					weights: 100,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.AmuletOrTrinket"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.AnimalPelt"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Belt"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Boots"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Breeches"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Cape"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Cloak"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.ClothingFine"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.ClothingPractical"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.ClothingTravel"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Coat"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.CourtlyGarb"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.FineDress"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.FurCoat"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.FurStole"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.GlovesFine"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.GlovesPractical"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.GlovesFur"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Handkerchief"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.HatFancy"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.HatPractical"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Hood"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Jewellery"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.MaskCostumeWar"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Neckerchief"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Perfume"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Pins"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.ReligiousSymbol"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.RidingBootsSpurs"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Robes"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Scarf"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Sceptre"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Shawl"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Shoes"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.SignetRing"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Tattoo"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.Uniform"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.ClothingAccessories.WalkingCane"), weight: 2}
					],
					price: {count: 1, type: 10, mod: ""}
				},
				{
					table: "Other-MiscellaneousItems",
					title: `${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.MiscellaneousItems")} (${game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name")})`,
					weights: 100,
					values: [
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Ball"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Baton"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Bedroll"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.BellSmall"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Blanket"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Bowl"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Candle"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.CanvasTarp"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Chain"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Chalk"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.CharcoalStick"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.CoachHorn"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.CookingPot"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Cup"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.CutleryPlain"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.CutleryJewelled"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.DavrichLamp"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.DeckOfCards"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Dice"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Doll"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.GrapplingHook"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Kettle"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.KindlingFirewood"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.LampOil"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Lantern"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.LanternStorm"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Linens"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Matches"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.MattressFeather"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.MessKit"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.MouthHarp"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.MusicalInstrument"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Pan"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.PipeTobacco"), weight: 4},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Placard"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Plate"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.PotLamp"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Rags"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Rope"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Rug"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.String"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Tapestry"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Tent"), weight: 2},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Tinderbox"), weight: 3},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Torch"), weight: 5},
						{name: game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.OtherTrapping.MiscellaneousItems.Whistle"), weight: 2}
					],
					price: {count: 1, type: 10, mod: ""}
				}
			],
			generator: {
				names: Object.assign({
					any: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.All"),
					type: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Type"),
					trapping: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Trapping"),
					melee: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Melee"),
					range: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Range"),
					armour: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Names.Armour")
				}, game.wfrp4e.utility.qualityList(), game.wfrp4e.utility.flawList()),
				props: {
					qualities: {
						any: ["fine", "unbreakable", "lightweight", "practical", "durable", "penetrating", "fast", "damaging", "defensive", "trapblade", "entangle", "wrap", "distract", "pummel", "trip", "impale", "hack", "slash", "impact", "precise", "accurate"],
						trapping: ["fine", "unbreakable", "lightweight", "practical", "durable"],
						melee: ["fine", "unbreakable", "lightweight", "practical", "durable", "penetrating", "fast", "damaging", "defensive", "trapblade", "entangle", "wrap", "distract", "pummel", "trip", "impale", "hack", "slash", "impact", "precise"],
						range: ["fine", "unbreakable", "lightweight", "practical", "durable", "penetrating", "fast", "damaging", "defensive", "accurate", "impale", "hack", "pummel", "precise"],
						armour: ["fine", "unbreakable", "lightweight", "practical", "durable", "impenetrable"]
					},
					flaws: {
						any: ["bulky", "ugly", "unreliable", "shoddy", "tiring", "slow", "unbalanced", "imprecise", "dangerous", "undamaging", "partial", "weakpoints"],
						trapping: ["bulky", "ugly", "unreliable", "shoddy"],
						melee: ["bulky", "ugly", "unreliable", "shoddy", "tiring", "slow", "unbalanced", "imprecise", "dangerous", "undamaging"],
						range: ["bulky", "ugly", "unreliable", "shoddy", "tiring", "slow", "unbalanced", "imprecise", "dangerous", "undamaging"],
						armour: ["bulky", "ugly", "unreliable", "shoddy", "partial", "weakpoints"]
					}
				},
				presets: {
					default: [
						{
							id: "hereditary",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Hereditary.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Hereditary.Title"),
							color: "goldenrod",
							type: "default",
							types: {trapping: true, melee: true, range: true, armour: false},
							qualities: [
								{chance: 100, name: "damaging", quantity: 1},
								{chance: 75, name: "fine", quantity: 1},
								{chance: 25, name: "fine", quantity: 2},
								{chance: 50, name: "type", quantity: 1}
							],
							flaws: [
								{chance: 100, name: "shoddy", quantity: 1},
								{chance: 25, name: "unreliable", quantity: 1},
								{chance: 25, name: "type", quantity: 2}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Hereditary.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Hereditary.Names.a.2")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Hereditary.Names.b.1")
								]
							},
							scripts: [
								{id: "Gromril", chance: 10},
								{id: "Ithilmar", chance: 10},
								{id: "Size&Species", chance: 100},
								{id: "Ward", chance: 10},
								{id: "Cursed", chance: 10}
							]
						},
						{
							id: "templarWeapon",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Title"),
							color: "goldenrod",
							type: "default",
							types: {trapping: false, melee: true, range: true, armour: false},
							qualities: [
								{chance: 50, name: "fine", quantity: 3},
								{chance: 75, name: "defensive", quantity: 1},
								{chance: 50, name: "damaging", quantity: 1}
							],
							flaws: [
								{chance: 75, name: "tiring", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Names.b.4"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Names.b.5"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarWeapon.Names.b.6")
								]
							},
							scripts: [
								{id: "ObsidianInlays", chance: 50},
								{id: "Draining", chance: 75}
							]
						},
						{
							id: "templarArmour",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Title"),
							color: "goldenrod",
							type: "default",
							types: {trapping: false, melee: false, range: false, armour: true},
							qualities: [
								{chance: 75, name: "fine", quantity: 2},
								{chance: 75, name: "durable", quantity: 2}
							],
							flaws: [
								{chance: 50, name: "bulky", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Names.b.4"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Names.b.5"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.TemplarArmour.Names.b.6")
								]
							},
							scripts: [
								{id: "HeavyArmor", chance: 100},
								{id: "Draining", chance: 50},
								{id: "ObsidianInlays", chance: 100},
								{id: "Ward", chance: 25}
							]
						},
						{
							id: "punishingFlame",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.PunishingFlame.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.PunishingFlame.Title"),
							color: "goldenrod",
							type: "default",
							types: {trapping: false, melee: true, range: true, armour: false},
							qualities: [
								{chance: 100, name: "magical", quantity: 1},
								{chance: 75, name: "accurate", quantity: 1},
								{chance: 50, name: "penetrating", quantity: 1},
								{chance: 25, name: "fast", quantity: 1}
							],
							flaws: [
								{chance: 50, name: "tiring", quantity: 1},
								{chance: 25, name: "unreliable", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.PunishingFlame.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.PunishingFlame.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.PunishingFlame.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.PunishingFlame.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.PunishingFlame.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.PunishingFlame.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.PunishingFlame.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.PunishingFlame.Names.b.4")
								]
							},
							scripts: [
								{id: "Incendiary", chance: 100},
								{id: "ObsidianInlays", chance: 50},
								{id: "Draining", chance: 100}
							]
						},
						{
							id: "nulnExperiment",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.NulnExperiment.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.NulnExperiment.Title"),
							color: "goldenrod",
							type: "default",
							types: {trapping: false, melee: true, range: true, armour: false},
							qualities: [
								{chance: 75, name: "penetrating", quantity: 1},
								{chance: 50, name: "damaging", quantity: 1},
								{chance: 25, name: "blackpowder", quantity: 1}
							],
							flaws: [
								{chance: 25, name: "shoddy", quantity: 1},
								{chance: 75, name: "bulky", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.NulnExperiment.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.NulnExperiment.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.NulnExperiment.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.NulnExperiment.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.NulnExperiment.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.NulnExperiment.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.NulnExperiment.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.NulnExperiment.Names.b.4")
								]
							},
							scripts: [
								{id: "Incendiary", chance: 50},
								{id: "Draining", chance: 25}
							]
						},
						{
							id: "heroic",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Title"),
							color: "goldenrod",
							type: "default",
							types: {trapping: true, melee: true, range: true, armour: true},
							qualities: [
								{chance: 100, name: "unbreakable", quantity: 1},
								{chance: 100, name: "durable", quantity: 1},
								{chance: 50, name: "durable", quantity: 1},
								{chance: 75, name: "practical", quantity: 1},
								{chance: 25, name: "type", quantity: 1}
							],
							flaws: [
								{chance: 25, name: "bulky", quantity: 1},
								{chance: 25, name: "unreliable", quantity: 1},
								{chance: 25, name: "type", quantity: 2}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Names.a.3")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Names.b.4")
								]
							},
							scripts: [
								{id: "Incendiary", chance: 15},
								{id: "Gromril", chance: 10},
								{id: "Throatseeker", chance: 10},
								{id: "Ward", chance: 15},
								{id: "Size&Species", chance: 100},
								{id: "Cursed", chance: 10}
							]
						},
						{
							id: "ithilmarWeapon",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarWeapon.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarWeapon.Title"),
							color: "cyan",
							type: "default",
							types: {trapping: false, melee: true, range: false, armour: false},
							qualities: [
								{chance: 50, name: "fast", quantity: 1},
								{chance: 75, name: "fine", quantity: 2},
								{chance: 50, name: "practical", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarWeapon.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarWeapon.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarWeapon.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarWeapon.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarWeapon.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarWeapon.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarWeapon.Names.b.3")
								]
							},
							scripts: [
								{id: "Ithilmar", chance: 100},
								{id: "Throatseeker", chance: 50}
							]
						},
						{
							id: "ithilmarArmor",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarArmor.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarArmor.Title"),
							color: "cyan",
							type: "default",
							types: {trapping: false, melee: false, range: false, armour: true},
							qualities: [
								{chance: 50, name: "reinforced", quantity: 1},
								{chance: 75, name: "fine", quantity: 2},
								{chance: 50, name: "practical", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarArmor.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarArmor.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarArmor.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarArmor.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarArmor.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarArmor.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.IthilmarArmor.Names.b.3")
								]
							},
							scripts: [
								{id: "Ithilmar", chance: 100},
								{id: "Elven", chance: 50}
							]
						},
						{
							id: "gromril",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Gromril.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Gromril.Title"),
							color: "blue",
							type: "default",
							types: {trapping: false, melee: true, range: true, armour: true},
							qualities: [
								{chance: 75, name: "durable", quantity: 2},
								{chance: 50, name: "impenetrable", quantity: 1},
								{chance: 50, name: "practical", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Gromril.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Gromril.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Gromril.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Gromril.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Gromril.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Gromril.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Gromril.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Gromril.Names.b.4")
								]
							},
							scripts: [
								{id: "Gromril", chance: 100},
								{id: "ObsidianInlays", chance: 50}
							]
						},
						{
							id: "mysterious",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Mysterious.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Mysterious.Title"),
							color: "khaki",
							type: "default",
							types: {trapping: true, melee: true, range: true, armour: true},
							qualities: [
								{chance: 50, name: "magical", quantity: 1},
								{chance: 50, name: "lightweight", quantity: 1},
								{chance: 25, name: "any", quantity: 2}
							],
							flaws: [
								{chance: 50, name: "ugly", quantity: 1},
								{chance: 50, name: "shoddy", quantity: 1},
								{chance: 25, name: "any", quantity: 2}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Mysterious.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Mysterious.Names.a.2")
								]
							},
							scripts: [
								{id: "Incendiary", chance: 10},
								{id: "ObsidianInlays", chance: 10},
								{id: "DrawingTheWinds", chance: 10},
								{id: "Ward", chance: 15}
							]
						},
						{
							id: "magical",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Title"),
							color: "khaki",
							type: "default",
							types: {trapping: true, melee: true, range: true, armour: true},
							qualities: [
								{chance: 100, name: "magical", quantity: 1},
								{chance: 50, name: "unbreakable", quantity: 1},
								{chance: 50, name: "durable", quantity: 1},
								{chance: 50, name: "type", quantity: 2}
							],
							flaws: [
								{chance: 25, name: "bulky", quantity: 1},
								{chance: 25, name: "unreliable", quantity: 1},
								{chance: 25, name: "type", quantity: 2}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Names.a.1")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Names.b.4"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Names.b.5"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Names.b.6"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Names.b.7"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Names.b.8"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Names.b.9")
								]
							},
							scripts: [
								{id: "FullOfWind", chance: 20},
								{id: "DrawingTheWinds", chance: 10},
								{id: "ObsidianInlays", chance: 10},
								{id: "Ward", chance: 20}
							]
						},
						{
							id: "ancient",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Ancient.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Ancient.Title"),
							color: "khaki",
							type: "default",
							types: {trapping: true, melee: true, range: true, armour: true},
							qualities: [
								{chance: 50, name: "unbreakable", quantity: 1},
								{chance: 50, name: "practical", quantity: 1},
								{chance: 50, name: "type", quantity: 4}
							],
							flaws: [
								{chance: 25, name: "shoddy", quantity: 1},
								{chance: 25, name: "ugly", quantity: 1},
								{chance: 25, name: "type", quantity: 2}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Ancient.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Ancient.Names.a.2")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Ancient.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Ancient.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Ancient.Names.b.3")
								]
							},
							scripts: [
								{id: "TaintedWeapon", chance: 15},
								{id: "FullOfWind", chance: 15},
								{id: "Draining", chance: 15},
								{id: "Blooddrinker", chance: 15}
							]
						},
						{
							id: "thievingTrade",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.ThievingTrade.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.ThievingTrade.Title"),
							color: "gray",
							type: "default",
							types: {trapping: false, melee: true, range: true, armour: false},
							qualities: [
								{chance: 50, name: "fast", quantity: 1},
								{chance: 75, name: "flexible", quantity: 1},
								{chance: 25, name: "lightweight", quantity: 1}
							],
							flaws: [
								{chance: 50, name: "shoddy", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.ThievingTrade.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.ThievingTrade.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.ThievingTrade.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.ThievingTrade.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.ThievingTrade.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.ThievingTrade.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.ThievingTrade.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.ThievingTrade.Names.b.4")
								]
							},
							scripts: [
								{id: "Throatseeker", chance: 50},
								{id: "Cursed", chance: 25},
								{id: "Size&Species", chance: 100}
							]
						},
						{
							id: "rusted",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Rusted.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Rusted.Title"),
							color: "olivedrab",
							type: "default",
							types: {trapping: true, melee: true, range: true, armour: true},
							flaws: [
								{chance: 75, name: "shoddy", quantity: 2},
								{chance: 75, name: "ugly", quantity: 2}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Rusted.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Rusted.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Rusted.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Rusted.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Rusted.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Rusted.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Rusted.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Rusted.Names.b.4")
								]
							},
							scripts: [
								{id: "LootedItem", chance: 75}
							]
						},
						{
							id: "swampRust",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.SwampRust.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.SwampRust.Title"),
							color: "olivedrab",
							type: "default",
							types: {trapping: true, melee: true, range: true, armour: true},
							qualities: [
								{chance: 75, name: "damaging", quantity: 1}
							],
							flaws: [
								{chance: 75, name: "ugly", quantity: 1},
								{chance: 50, name: "slow", quantity: 1},
								{chance: 50, name: "shoddy", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.SwampRust.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.SwampRust.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.SwampRust.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.SwampRust.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.SwampRust.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.SwampRust.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.SwampRust.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.SwampRust.Names.b.4")
								]
							},
							scripts: [
								{id: "LootedItem", chance: 100},
								{id: "Size&Species", chance: 100},
								{id: "WeaponOfForsakenFortune", chance: 50}
							]
						},
						{
							id: "warpDistortedWeapon",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Title"),
							color: "orchid",
							type: "default",
							types: {trapping: false, melee: true, range: true, armour: false},
							qualities: [
								{chance: 25, name: "damaging", quantity: 1},
								{chance: 50, name: "zzap", quantity: 1},
								{chance: 100, name: "warpstone", quantity: 1}
							],
							flaws: [
								{chance: 75, name: "shoddy", quantity: 1},
								{chance: 25, name: "ugly", quantity: 4}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.a.4"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.a.5"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.a.6")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.b.4"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.b.5"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedWeapon.Names.b.6")
								]
							},
							scripts: [
								{id: "RelentlessFury", chance: 50},
								{id: "FullOfWind", chance: 25},
								{id: "TaintedWeapon", chance: 100}
							]
						},
						{
							id: "warpDistortedArmour",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Title"),
							color: "orchid",
							type: "default",
							types: {trapping: false, melee: false, range: false, armour: true},
							qualities: [
								{chance: 100, name: "impenetrable", quantity: 1},
								{chance: 75, name: "durable", quantity: 2}
							],
							flaws: [
								{chance: 100, name: "ugly", quantity: 1},
								{chance: 75, name: "bulky", quantity: 1},
								{chance: 25, name: "shoddy", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.a.4"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.a.5"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.a.6")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.b.4"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.b.5"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.WarpDistortedArmour.Names.b.6")
								]
							},
							scripts: [
								{id: "HeavyArmor", chance: 50},
								{id: "DrawingTheWinds", chance: 50},
								{id: "FullOfWind", chance: 50}
							]
						},
						{
							id: "desecrated",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Title"),
							color: "orchid",
							type: "default",
							types: {trapping: false, melee: true, range: true, armour: false},
							qualities: [
								{chance: 100, name: "magical", quantity: 1},
								{chance: 100, name: "unbreakable", quantity: 1},
								{chance: 25, name: "penetrating", quantity: 1},
								{chance: 25, name: "fast", quantity: 1},
								{chance: 25, name: "entangle", quantity: 1},
								{chance: 25, name: "distract", quantity: 1}
							],
							flaws: [
								{chance: 100, name: "dangerous", quantity: 1},
								{chance: 100, name: "ugly", quantity: 1},
								{chance: 25, name: "bulky", quantity: 1},
								{chance: 25, name: "tiring", quantity: 1},
								{chance: 25, name: "slow", quantity: 1},
								{chance: 25, name: "imprecise", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Names.a.4")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Names.b.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Names.b.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Names.b.4")
								]
							},
							scripts: [
								{id: "Incendiary", chance: 15},
								{id: "Infected", chance: 15},
								{id: "Throatseeker", chance: 15},
								{id: "TaintedWeapon", chance: 100},
								{id: "FullOfWind", chance: 15},
								{id: "Draining", chance: 25},
								{id: "RelentlessFury", chance: 15},
								{id: "WeaponOfForsakenFortune", chance: 25},
								{id: "Blooddrinker", chance: 15}
							]
						},
						{
							id: "damaged",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Damaged.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Damaged.Title"),
							color: "salmon",
							type: "default",
							types: {trapping: true, melee: true, range: true, armour: true},
							qualities: [
								{chance: 50, name: "type", quantity: 2}
							],
							flaws: [
								{chance: 100, name: "shoddy", quantity: 1},
								{chance: 75, name: "unreliable", quantity: 1},
								{chance: 25, name: "type", quantity: 1}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Damaged.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Damaged.Names.a.2")
								]
							},
							scripts: [
								{id: "TaintedWeapon", chance: 10}
							]
						},
						{
							id: "fatal",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Fatal.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Fatal.Title"),
							color: "salmon",
							type: "default",
							types: {trapping: true, melee: true, range: true, armour: true},
							qualities: [
								{chance: 50, name: "type", quantity: 2}
							],
							flaws: [
								{chance: 75, name: "bulky", quantity: 1},
								{chance: 75, name: "unreliable", quantity: 1},
								{chance: 50, name: "type", quantity: 3}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Fatal.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Fatal.Names.a.2")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Fatal.Names.b.1")
								]
							},
							scripts: [
								{id: "Throatseeker", chance: 25},
								{id: "Poisoned", chance: 25},
								{id: "RelentlessFury", chance: 25},
								{id: "Blooddrinker", chance: 15}
							]
						},
						{
							id: "insignificant",
							label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Name"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Title"),
							color: "salmon",
							type: "default",
							types: {trapping: true, melee: true, range: true, armour: true},
							qualities: [
								{chance: 25, name: "type", quantity: 2}
							],
							flaws: [
								{chance: 100, name: "ugly", quantity: 1},
								{chance: 100, name: "shoddy", quantity: 1},
								{chance: 50, name: "type", quantity: 3}
							],
							names: {
								a: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Names.a.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Names.a.2"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Names.a.3"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Names.a.4"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Names.a.5")
								],
								b: [
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Names.b.1"),
									game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Names.b.2")
								]
							},
							scripts: [
								{id: "WeaponOfForsakenFortune", chance: 25}
							]
						}
					],
					props: [
						{
							id: "fine",
							label: game.i18n.localize("PROPERTY.Fine"),
							hint: game.i18n.localize("WFRP4E.Properties.Fine"),
							color: "green",
							type: "default",
							types: {
								trapping: true,
								melee: true,
								range: true,
								armour: true
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "fine", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Fine")]},
							scripts: []
						},
						{
							id: "unbreakable",
							label: game.i18n.localize("PROPERTY.Unbreakable"),
							hint: game.i18n.localize("WFRP4E.Properties.Unbreakable"),
							color: "green",
							type: "default",
							types: {
								trapping: true,
								melee: true,
								range: true,
								armour: true
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "unbreakable", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Unbreakable")]},
							scripts: []
						},
						{
							id: "lightweight",
							label: game.i18n.localize("PROPERTY.Lightweight"),
							hint: game.i18n.localize("WFRP4E.Properties.Lightweight"),
							color: "green",
							type: "default",
							types: {
								trapping: true,
								melee: true,
								range: true,
								armour: true
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "lightweight", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Lightweight")]},
							scripts: []
						},
						{
							id: "practical",
							label: game.i18n.localize("PROPERTY.Practical"),
							hint: game.i18n.localize("WFRP4E.Properties.Practical"),
							color: "green",
							type: "default",
							types: {
								trapping: true,
								melee: true,
								range: true,
								armour: true
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "practical", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Practical")]},
							scripts: []
						},
						{
							id: "durable",
							label: game.i18n.localize("PROPERTY.Durable"),
							hint: game.i18n.localize("WFRP4E.Properties.Durable"),
							color: "green",
							type: "default",
							types: {
								trapping: true,
								melee: true,
								range: true,
								armour: true
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "durable", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Durable")]},
							scripts: []
						},
						{
							id: "penetrating",
							label: game.i18n.localize("PROPERTY.Penetrating"),
							hint: game.i18n.localize("WFRP4E.Properties.Penetrating"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "penetrating", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Penetrating")]},
							scripts: []
						},
						{
							id: "fast",
							label: game.i18n.localize("PROPERTY.Fast"),
							hint: game.i18n.localize("WFRP4E.Properties.Fast"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "fast", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Fast")]},
							scripts: []
						},
						{
							id: "damaging",
							label: game.i18n.localize("PROPERTY.Damaging"),
							hint: game.i18n.localize("WFRP4E.Properties.Damaging"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "damaging", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Damaging")]},
							scripts: []
						},
						{
							id: "defensive",
							label: game.i18n.localize("PROPERTY.Defensive"),
							hint: game.i18n.localize("WFRP4E.Properties.Defensive"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "defensive", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Defensive")]},
							scripts: []
						},
						{
							id: "trapblade",
							label: game.i18n.localize("PROPERTY.TrapBlade"),
							hint: game.i18n.localize("WFRP4E.Properties.TrapBlade"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: false,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "trapblade", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.TrapBlade")]},
							scripts: []
						},
						{
							id: "entangle",
							label: game.i18n.localize("PROPERTY.Entangle"),
							hint: game.i18n.localize("WFRP4E.Properties.Entangle"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: false,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "entangle", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Entangle")]},
							scripts: []
						},
						{
							id: "wrap",
							label: game.i18n.localize("PROPERTY.Wrap"),
							hint: game.i18n.localize("WFRP4E.Properties.Wrap"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: false,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "wrap", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Wrap")]},
							scripts: []
						},
						{
							id: "distract",
							label: game.i18n.localize("PROPERTY.Distract"),
							hint: game.i18n.localize("WFRP4E.Properties.Distract"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: false,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "distract", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Distract")]},
							scripts: []
						},
						{
							id: "pummel",
							label: game.i18n.localize("PROPERTY.Pummel"),
							hint: game.i18n.localize("WFRP4E.Properties.Pummel"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "pummel", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Pummel")]},
							scripts: []
						},
						{
							id: "trip",
							label: game.i18n.localize("PROPERTY.Trip"),
							hint: game.i18n.localize("WFRP4E.Properties.Trip"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: false,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "trip", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Trip")]},
							scripts: []
						},
						{
							id: "impale",
							label: game.i18n.localize("PROPERTY.Impale"),
							hint: game.i18n.localize("WFRP4E.Properties.Impale"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "impale", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Impale")]},
							scripts: []
						},
						{
							id: "hack",
							label: game.i18n.localize("PROPERTY.Hack"),
							hint: game.i18n.localize("WFRP4E.Properties.Hack"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "hack", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Hack")]},
							scripts: []
						},
						{
							id: "slash",
							label: game.i18n.localize("PROPERTY.Slash"),
							hint: game.i18n.localize("WFRP4E.Properties.Slash"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: false,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "slash", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Slash")]},
							scripts: []
						},
						{
							id: "impact",
							label: game.i18n.localize("PROPERTY.Impact"),
							hint: game.i18n.localize("WFRP4E.Properties.Impact"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: false,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "impact", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Impact")]},
							scripts: []
						},
						{
							id: "precise",
							label: game.i18n.localize("PROPERTY.Precise"),
							hint: game.i18n.localize("WFRP4E.Properties.Precise"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "precise", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Precise")]},
							scripts: []
						},
						{
							id: "accurate",
							label: game.i18n.localize("PROPERTY.Accurate"),
							hint: game.i18n.localize("WFRP4E.Properties.Accurate"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: false,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "accurate", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Accurate")]},
							scripts: []
						},
						{
							id: "impenetrable",
							label: game.i18n.localize("PROPERTY.Impenetrable"),
							hint: game.i18n.localize("WFRP4E.Properties.Impenetrable"),
							color: "green",
							type: "default",
							types: {
								trapping: false,
								melee: false,
								range: false,
								armour: true
							},
							baseQuality: true,
							qualities: [{chance: 100, name: "impenetrable", quantity: 1}],
							flaws: [],
							names: {a: [game.i18n.localize("PROPERTY.Impenetrable")]},
							scripts: []
						},
						{
							id: "bulky",
							label: game.i18n.localize("PROPERTY.Bulky"),
							hint: game.i18n.localize("WFRP4E.Properties.Bulky"),
							color: "red",
							type: "default",
							types: {
								trapping: true,
								melee: true,
								range: true,
								armour: true
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "bulky", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Bulky")]},
							scripts: []
						},
						{
							id: "ugly",
							label: game.i18n.localize("PROPERTY.Ugly"),
							hint: game.i18n.localize("WFRP4E.Properties.Ugly"),
							color: "red",
							type: "default",
							types: {
								trapping: true,
								melee: true,
								range: true,
								armour: true
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "ugly", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Ugly")]},
							scripts: []
						},
						{
							id: "unreliable",
							label: game.i18n.localize("PROPERTY.Unreliable"),
							hint: game.i18n.localize("WFRP4E.Properties.Unreliable"),
							color: "red",
							type: "default",
							types: {
								trapping: true,
								melee: true,
								range: true,
								armour: true
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "unreliable", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Unreliable")]},
							scripts: []
						},
						{
							id: "shoddy",
							label: game.i18n.localize("PROPERTY.Shoddy"),
							hint: game.i18n.localize("WFRP4E.Properties.Shoddy"),
							color: "red",
							type: "default",
							types: {
								trapping: true,
								melee: true,
								range: true,
								armour: true
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "shoddy", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Shoddy")]},
							scripts: []
						},
						{
							id: "tiring",
							label: game.i18n.localize("PROPERTY.Tiring"),
							hint: game.i18n.localize("WFRP4E.Properties.Tiring"),
							color: "red",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "tiring", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Tiring")]},
							scripts: []
						},
						{
							id: "slow",
							label: game.i18n.localize("PROPERTY.Slow"),
							hint: game.i18n.localize("WFRP4E.Properties.Slow"),
							color: "red",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "slow", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Slow")]},
							scripts: []
						},
						{
							id: "unbalanced",
							label: game.i18n.localize("PROPERTY.Unbalanced"),
							hint: game.i18n.localize("WFRP4E.Properties.Unbalanced"),
							color: "red",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "unbalanced", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Unbalanced")]},
							scripts: []
						},
						{
							id: "imprecise",
							label: game.i18n.localize("PROPERTY.Imprecise"),
							hint: game.i18n.localize("WFRP4E.Properties.Imprecise"),
							color: "red",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "imprecise", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Imprecise")]},
							scripts: []
						},
						{
							id: "dangerous",
							label: game.i18n.localize("PROPERTY.Dangerous"),
							hint: game.i18n.localize("WFRP4E.Properties.Dangerous"),
							color: "red",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "dangerous", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Dangerous")]},
							scripts: []
						},
						{
							id: "undamaging",
							label: game.i18n.localize("PROPERTY.Undamaging"),
							hint: game.i18n.localize("WFRP4E.Properties.Undamaging"),
							color: "red",
							type: "default",
							types: {
								trapping: false,
								melee: true,
								range: true,
								armour: false
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "undamaging", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Undamaging")]},
							scripts: []
						},
						{
							id: "partial",
							label: game.i18n.localize("PROPERTY.Partial"),
							hint: game.i18n.localize("WFRP4E.Properties.Partial"),
							color: "red",
							type: "default",
							types: {
								trapping: false,
								melee: false,
								range: false,
								armour: true
							},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "partial", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Partial")]},
							scripts: []
						},
						{
							id: "weakpoints",
							label: game.i18n.localize("PROPERTY.Weakpoints"),
							hint: game.i18n.localize("WFRP4E.Properties.Weakpoints"),
							color: "red",
							type: "default",
							types: {armour: true},
							baseQuality: true,
							qualities: [],
							flaws: [{chance: 100, name: "weakpoints", quantity: 1}],
							names: {a: [game.i18n.localize("PROPERTY.Weakpoints")]},
							scripts: []
						}
					]
				},
				effects: {
					script: {
						name: game.i18n.localize("WH.Script"),
						img: "modules/wfrp4e-core/icons/unarmed.png",
						flags: {
							looting: {
								default: true,
								id: "Script",
								hide: true
							}
						},
						system: {
							transferData: {documentType: "Item"},
							scriptData: [{
								label: game.i18n.localize("WH.Script"),
								//При обновлении документа, содержащего скрипты
								trigger: "update",
								options: {runIfDisabled: true},
								//Задаём переменную, содержащую все НЕ default скрипты
								script: "let effects = this.item.effects.filter(e => !e.flags.looting?.default).map(e => ({name: e.flags.looting?.name, id: e.flags.looting?.id, effects: [e.toObject()]}));"
									//Объединяем значения массива, совпадающие по ID
									+ "\neffects = Object.values("
									+ "\n\teffects.reduce((e, item) => {"
									+ "\n\t\tif (e[item.id]) {e[item.id].effects = e[item.id].effects.concat(item.effects)}"
									+ "\n\t\telse {e[item.id] = {...item}}"
									+ "\n\t\treturn e;"
									+ "\n\t}, {})"
									+ "\n);"
									+ "\nawait game.settings.set(\"wfrp4e-looting\", \"customEffects\", effects);",
							}]
						}
					},
					onRemove: {
						name: game.i18n.localize("WH.Script"),
						img: "modules/wfrp4e-core/icons/unarmed.png",
						flags: {
							looting: {
								default: true,
								id: "onRemove"
							}
						},
						system: {
							transferData: {documentType: "Item"},
							scriptData: [
								{
									label: game.i18n.localize("WH.Script"),
									//При удалении эффекта генератора
									trigger: "update",
									options: {runIfDisabled: true},
									script: "if (args.options.action == \"delete\" && args.type == \"effect\" && args.document.flags.looting?.id) {"
										//Удаление других эффектов с этим же ID, для обеспечения целостности скриптов
										+ "\n\tthis.item.effects.forEach(e => {"
										+ "\n\t\tif (e.flags.looting?.id == args.document.flags.looting?.id) {e.delete()};"
										+ "\n\t});"
										+ "\n\tthis.item.update({\"flags.looting.scripts\": (this.item.flags.looting?.scripts || []).filter(s => s != args.document.flags.looting?.id)});"
										+ "\n};",
								}
							]
						}
					},
					default: [
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Incendiary.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Incendiary.Hint"),
							default: true,
							id: "Incendiary",
							effects: [{
								name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Incendiary.Label"),
								img: "systems/wfrp4e/icons/conditions/ablaze.png",
								flags: {
									looting: {
										default: true,
										id: "Incendiary"
									}
								},
								system: {
									transferData: {
										documentType: "Actor",
										equipTransfer: true,
										type: "damage"
									},
									scriptData: [{
										label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Incendiary.Label"),
										trigger: "immediate",
										options: {
											deleteEffect: true
										},
										script: "args.actor.addCondition(\"ablaze\", 1)",
									}]
								}
							}]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Elven.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Elven.Hint"),
							default: true,
							id: "Elven",
							effects: [{
								name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Elven.Label"),
								img: "modules/wfrp4e-core/icons/equipment/trapping.png",
								flags: {
									looting: {
										default: true,
										id: "Elven"
									}
								},
								system: {
									transferData: {
										documentType: "Actor",
										equipTransfer: true
									},
									scriptData: [{
										label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Elven.Label"),
										trigger: "dialog",
										options: {
											activateScript: "return args.characteristic == \"bs\" || args.skill?.name == game.i18n.localize(\"NAME.Perception\")",
											hideScript: "return args.characteristic != \"bs\" && args.skill?.name != game.i18n.localize(\"NAME.Perception\")",
											targeter: true
										},
										script: "args.fields.modifier -= 20",
									}]
								}
							}]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.ObsidianInlays.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.ObsidianInlays.Hint"),
							default: true,
							id: "ObsidianInlays",
							effects: [{
								name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.ObsidianInlays.Label"),
								img: "modules/wfrp4e-core/icons/equipment/trapping.png",
								flags: {
									looting: {
										default: true,
										id: "ObsidianInlays"
									}
								},
								system: {
									transferData: {
										documentType: "Actor",
										equipTransfer: true
									},
									scriptData: [{
										label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.ObsidianInlays.Button"),
										trigger: "manual",
										script: "let test = await this.actor.setupSkill(game.i18n.localize(\"NAME.Language\") + \" (\" + game.i18n.localize(\"SPEC.Magick\") + \")\", {skipDialog: true});"
											+ "\ntest.data.preData.target = 30;"
											+ "\ntest.data.context.breakdown.characteristic = \"30\" + \" (\" + game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.ObsidianInlays.Fixed\") + \")\";"
											+ "\nawait test.roll();",
									}]
								}
							}]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Gromril.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Gromril.Hint"),
							default: true,
							id: "Gromril",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Gromril.Label"),
									img: "modules/wfrp4e-core/icons/equipment/armour/armour.png",
									flags: {
										looting: {
											default: true,
											id: "Gromril"
										}
									},
									system: {
										transferData: {
											documentType: "Actor",
											equipTransfer: true
										},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Gromril.Label"),
											trigger: "opposedDefender",
											script: "if ([\"armour\", \"wfrp4e-archives3.armour\"].includes(this.item.type) && args.opposedTest.result.winner == \"attacker\" && args.opposedTest.result.crit && (this.actor.system?.status?.wounds?.value || 0) > 0) {"
												+ "\n\tlet loc = args.opposedTest.result.hitloc?.value;"
												+ "\n\tif (loc && (this.item.system?.AP?.[loc] || 0) > 0) {"
												+ "\n\t\targs.opposedTest.result.crit = null;"
												+ "\n\t\targs.opposedTest.result.other.push(\"<i>\" + game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.Gromril.CritBlocked\", {"
												+ "\n\t\t\tactor: \"<strong>\" + (this.actor.token?.name || this.actor.name) + \"</strong>\","
												+ "\n\t\t\titem: \"<strong>\" + this.item.name + \"</strong>\""
												+ "\n\t\t}) + \"</i>\");"
												+ "\n\t};"
												+ "\n};",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
									img: "modules/wfrp4e-core/icons/equipment/armour/armour.png",
									flags: {
										looting: {
											default: true,
											id: "Gromril"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
											trigger: "immediate",
											options: {
												deleteEffect: true
											},
											script: "if ([\"armour\", \"wfrp4e-archives3.armour\"].includes(this.item.type)) {"
												+ "\n\tlet ap = foundry.utils.deepClone(this.item.system.AP || {});"
												+ "\n\tlet boosted = [];"
												+ "\n\tfor (let loc of [\"body\", \"head\", \"lArm\", \"lLeg\", \"rArm\", \"rLeg\"]) {"
												+ "\n\t\tif ((Number(ap[loc]) || 0) > 0) {"
												+ "\n\t\t\tap[loc] = Number(ap[loc]) + 1;"
												+ "\n\t\t\tboosted.push(loc);"
												+ "\n\t\t};"
												+ "\n\t};"
												+ "\n\tlet note = \"<p>\" + game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Gromril.Armour\") + \"</p>\";"
												+ "\n\tlet desc = this.item.system.description?.value || \"\";"
												+ "\n\tif (!desc.includes(note)) {desc = note + (desc ? \"<br>\" + desc : \"\")};"
												+ "\n\tawait this.item.update({"
												+ "\n\t\t\"system.description.value\": desc,"
												+ "\n\t\t\"system.AP\": ap,"
												+ "\n\t\t\"flags.looting.gromrilAP\": boosted"
												+ "\n\t}, {onReset: true});"
												+ "\n} else {"
												+ "\n\tlet armourEffect = this.item.effects.find(e => e.flags?.looting?.id == \"Gromril\" && e.system?.transferData?.documentType == \"Actor\");"
												+ "\n\tif (armourEffect) {"
												+ "\n\t\tawait armourEffect.update({\"flags.looting.id\": false}, {onReset: true});"
												+ "\n\t\tawait armourEffect.delete({onReset: true});"
												+ "\n\t};"
												+ "\n\tif (this.item.type == \"weapon\") {"
												+ "\n\t\tlet qualities = foundry.utils.deepClone(this.item.system.qualities?.value || []);"
												+ "\n\t\tif (!qualities.find(q => q.name == \"unbreakable\")) {"
												+ "\n\t\t\tqualities.push({name: \"unbreakable\"});"
												+ "\n\t\t\tawait this.item.update({"
												+ "\n\t\t\t\t\"system.qualities.value\": qualities,"
												+ "\n\t\t\t\t\"flags.looting.gromrilAddedUnbreakable\": true"
												+ "\n\t\t\t}, {onReset: true});"
												+ "\n\t\t};"
												+ "\n\t};"
												+ "\n};",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
									img: "modules/wfrp4e-core/icons/equipment/armour/armour.png",
									flags: {
										looting: {
											default: true,
											id: "Gromril"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
											trigger: "deleteEffect",
											script: "if (this.item && [\"armour\", \"wfrp4e-archives3.armour\"].includes(this.item.type)) {"
												+ "\n\tlet ap = foundry.utils.deepClone(this.item.system.AP || {});"
												+ "\n\tlet boosted = Array.isArray(this.item.flags?.looting?.gromrilAP)"
												+ "\n\t\t? this.item.flags.looting.gromrilAP"
												+ "\n\t\t: [\"body\", \"head\", \"lArm\", \"lLeg\", \"rArm\", \"rLeg\"].filter(loc => (Number(ap[loc]) || 0) > 0);"
												+ "\n\tfor (let loc of boosted) {"
												+ "\n\t\tif ((Number(ap[loc]) || 0) > 0) {ap[loc] = Number(ap[loc]) - 1};"
												+ "\n\t};"
												+ "\n\tlet note = \"<p>\" + game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Gromril.Armour\") + \"</p>\";"
												+ "\n\tlet desc = (this.item.system.description?.value || \"\").replace(note + \"<br>\", \"\").replace(note, \"\");"
												+ "\n\tawait this.item.update({"
												+ "\n\t\t\"system.description.value\": desc,"
												+ "\n\t\t\"system.AP\": ap,"
												+ "\n\t\t\"flags.looting.-=gromrilAP\": null"
												+ "\n\t}, {onReset: true});"
												+ "\n} else if (this.item && this.item.type == \"weapon\") {"
												+ "\n\tif (this.item.flags?.looting?.gromrilAddedUnbreakable) {"
												+ "\n\t\tawait this.item.update({"
												+ "\n\t\t\t\"system.qualities.value\": (this.item.system.qualities?.value || []).filter(q => q.name != \"unbreakable\"),"
												+ "\n\t\t\t\"flags.looting.-=gromrilAddedUnbreakable\": null"
												+ "\n\t\t}, {onReset: true});"
												+ "\n\t};"
												+ "\n};",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Ithilmar.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Ithilmar.Hint"),
							default: true,
							id: "Ithilmar",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
									img: "modules/wfrp4e-core/icons/unarmed.png",
									flags: {
										looting: {
											default: true,
											id: "Ithilmar"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
											trigger: "immediate",
											options: {
												deleteEffect: true
											},
											script: "let encumbrance = Math.max(0, this.item.system.encumbrance.value - 2);"
												+ "\nthis.item.update({\"system.encumbrance.value\": encumbrance});",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
									img: "modules/wfrp4e-core/icons/unarmed.png",
									flags: {
										looting: {
											default: true,
											id: "Ithilmar"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
											trigger: "deleteEffect",
											script: "if (this.item) {this.item.update({\"system.encumbrance.value\": this.item.system.encumbrance.value + 2})};",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Infected.Label") + " (X)",
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Infected.Hint"),
							default: true,
							id: "Infected",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Infected.Label") + " (X)",
									img: "modules/wfrp4e-core/icons/diseases/disease.png",
									flags: {
										looting: {
											default: true,
											id: "Infected"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Infected.Label"),
											trigger: "applyDamage",
											script: "if (args.totalWoundLoss > 0) {"
												+ "\n\tlet difficulty = this.effect.name.split(\"(\")[1]?.split(\")\")[0] || \"0\";"
												+ "\n\tdifficulty = warhammer.utility.findKey(difficulty, game.wfrp4e.config.difficultyModifiers);"
												+ "\n\tlet test = await args.actor.setupSkill(game.i18n.localize(\"NAME.Endurance\"), {appendTitle: \": \" + this.item.name + \" (\" + game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Infected.Label\") + \")\", fields: {difficulty: difficulty}});"
												+ "\n\tawait test.roll();"
												+ "\n\tif (!test.succeeded) {args.actor.createEmbeddedDocuments(\"Item\", [(await fromUuid(\"Compendium.wfrp4e-core.items.kKccDTGzWzSXCBOb\")).toObject()])};"
												+ "\n};",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
									img: "modules/wfrp4e-core/icons/diseases/disease.png",
									flags: {
										looting: {
											default: true,
											id: "Infected"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
											trigger: "immediate",
											options: {
												deleteEffect: true
											},
											script: "let difficulty = Object.entries(game.wfrp4e.config.difficultyModifiers).map(([key, value]) => {return {name: game.wfrp4e.config.difficultyLabels[key], id: value}});"
												+ "\nlet choice = await ValueDialog.create({title: game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Infected.Label\") + \": \" + game.i18n.localize(\"Difficulty\"), text: game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Infected.Difficulty\")}, difficulty[3].name, difficulty.map(d => d.name));"
												+ "\nif (choice) {choice = game.wfrp4e.config.difficultyModifiers[warhammer.utility.findKey(choice, game.wfrp4e.config.difficultyLabels)] || \"0\"};"
												+ "\nlet effect = this.item.effects.find(e => e.name == game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Infected.Label\") + \" (X)\");"
												+ "\nif (effect) {effect.update({name: effect.name.replace(\"(X)\", \"(\" + choice + \")\")})};",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Poisoned.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Poisoned.Hint"),
							default: true,
							id: "Poisoned",
							effects: [{
								name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Poisoned.Label"),
								img: "systems/wfrp4e/icons/conditions/poisoned.png",
								flags: {
									looting: {
										default: true,
										id: "Poisoned"
									}
								},
								system: {
									transferData: {documentType: "Item"},
									scriptData: [{
										label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Poisoned.Label"),
										trigger: "applyDamage",
										script: "if (args.totalWoundLoss > 0) {args.actor.addCondition(\"poisoned\")};",
									}]
								}
							}]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Hint"),
							default: true,
							id: "HeavyArmor",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Label"),
									img: "modules/wfrp4e-core/icons/equipment/armour/armour.png",
									flags: {
										looting: {
											default: true,
											id: "HeavyArmor"
										}
									},
									system: {
										transferData: {
											documentType: "Actor",
											equipTransfer: true
										},
										scriptData: [
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateHelm.Name"),
												trigger: "dialog",
												script: "[Script.0iTLDgFHO9Rgc010]",
												options: {
													hideScript: "[Script.h0DfPwUUOBjyAHMZ]",
													activateScript: "[Script.9RFoasDcFnYZ1txR]"
												}
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateOpenHelm.Name"),
												trigger: "dialog",
												script: "[Script.xvGxwv7X0Vq3vNqb]",
												options: {
													hideScript: "[Script.h0DfPwUUOBjyAHMZ]",
													activateScript: "[Script.9RFoasDcFnYZ1txR]"
												}
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.MailCoif.Name"),
												trigger: "dialog",
												script: "[Script.xvGxwv7X0Vq3vNqb]",
												options: {
													hideScript: "[Script.h0DfPwUUOBjyAHMZ]",
													activateScript: "[Script.9RFoasDcFnYZ1txR]"
												}
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateLeggings.Name"),
												trigger: "dialog",
												script: "[Script.xvGxwv7X0Vq3vNqb]",
												options: {
													hideScript: "[Script.l8qFKSnMpy4P7XQR]",
													activateScript: "[Script.AV2Kj6jgmIc45zKi]"
												}
											}
										]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
									img: "modules/wfrp4e-core/icons/equipment/armour/armour.png",
									flags: {
										looting: {
											default: true,
											id: "HeavyArmor"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
											trigger: "immediate",
											options: {
												deleteEffect: true
											},
											script: "if ([\"armour\", \"wfrp4e-archives3.armour\"].includes(this.item.type)) {"
												+ "\n\tlet type = await foundry.applications.api.DialogV2.prompt({"
												+ "\n\t\twindow: {title: game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Label\") + \": \" + game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.Label\")},"
												+ "\n\t\tcontent: \"<select name=\'type\' required>\""
												+ "\n\t\t\t+ `\\t<option value=\"none\">${game.i18n.localize(\"Other\")}</option>`"
												+ "\n\t\t\t+ `\\t<option value=\"plateHelm\" title=\"${game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateHelm.Penalty\")}\">${game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateHelm.Name\")}</option>`"
												+ "\n\t\t\t+ `\\t<option value=\"plateOpenHelm\" title=\"${game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateOpenHelm.Penalty\")}\">${game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateOpenHelm.Name\")}</option>`"
												+ "\n\t\t\t+ `\\t<option value=\"mailCoif\" title=\"${game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.MailCoif.Penalty\")}\">${game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.MailCoif.Name\")}</option>`"
												+ "\n\t\t\t+ `\\t<option value=\"plateLeggings\" title=\"${game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateLeggings.Penalty\")}\">${game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateLeggings.Name\")}</option>`"
												+ "\n\t\t\t+ \"</select>\","
												+ "\n\t\tok: {"
												+ "\n\t\t\tlabel: game.i18n.localize(\"Submit\"),"
												+ "\n\t\t\tcallback: async (event, button, dialog) => {return button.form.elements.type.value}"
												+ "\n\t\t}"
												+ "\n\t}) || \"none\";"
												+ "\n\tlet effects = this.item.effects.find(e => e.name == game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Label\"));"
												+ "\n\tswitch (type) {"
												+ "\n\t\tcase \"none\": {"
												+ "\n\t\t\tawait effects.update({"
												+ "\n\t\t\t\t\"flags.looting.id\": false"
												+ "\n\t\t\t});"
												+ "\n\t\t\tawait effects.delete();"
												+ "\n\t\t\tbreak;"
												+ "\n\t\t};"
												+ "\n\t\tcase \"plateHelm\": {"
												+ "\n\t\t\teffects.update({"
												+ "\n\t\t\t\t\"name\": game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateHelm.Name\"),"
												+ "\n\t\t\t\t\"system.scriptData\": [effects.system.scriptData[0]]"
												+ "\n\t\t\t});"
												+ "\n\t\t\tbreak;"
												+ "\n\t\t};"
												+ "\n\t\tcase \"plateOpenHelm\": {"
												+ "\n\t\t\teffects.update({"
												+ "\n\t\t\t\t\"name\": game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateOpenHelm.Name\"),"
												+ "\n\t\t\t\t\"system.scriptData\": [effects.system.scriptData[1]]"
												+ "\n\t\t\t});"
												+ "\n\t\t\tbreak;"
												+ "\n\t\t};"
												+ "\n\t\tcase \"mailCoif\": {"
												+ "\n\t\t\teffects.update({"
												+ "\n\t\t\t\t\"name\": game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.MailCoif.Name\"),"
												+ "\n\t\t\t\t\"system.scriptData\": [effects.system.scriptData[2]]"
												+ "\n\t\t\t});"
												+ "\n\t\t\tbreak;"
												+ "\n\t\t};"
												+ "\n\t\tcase \"plateLeggings\": {"
												+ "\n\t\t\teffects.update({"
												+ "\n\t\t\t\t\"name\": game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.HeavyArmor.Scripts.PlateLeggings.Name\"),"
												+ "\n\t\t\t\t\"system.scriptData\": [effects.system.scriptData[3]]"
												+ "\n\t\t\t});"
												+ "\n\t\t\tbreak;"
												+ "\n\t\t};"
												+ "\n\t};"
												+ "\n\tlet ap = this.item.system.AP;"
												+ "\n\tap = {"
												+ "\n\t\tbody: ap.body > 0 ? ap.body + 1 : ap.body,"
												+ "\n\t\thead: ap.head > 0 ? ap.head + 1 : ap.head,"
												+ "\n\t\tlArm: ap.lArm > 0 ? ap.lArm + 1 : ap.lArm,"
												+ "\n\t\tlLeg: ap.lLeg > 0 ? ap.lLeg + 1 : ap.lLeg,"
												+ "\n\t\trArm: ap.rArm > 0 ? ap.rArm + 1 : ap.rArm,"
												+ "\n\t\trLeg: ap.rLeg > 0 ? ap.rLeg + 1 : ap.rLeg"
												+ "\n\t};"
												+ "\n\tlet encumbrance = this.item.system.encumbrance.value + 1;"
												+ "\n\tthis.item.update({"
												+ "\n\t\t\"system.AP\": ap,"
												+ "\n\t\t\"system.encumbrance.value\": encumbrance"
												+ "\n\t});"
												+ "\n};",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
									img: "modules/wfrp4e-core/icons/equipment/armour/armour.png",
									flags: {
										looting: {
											default: true,
											id: "HeavyArmor"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
											trigger: "deleteEffect",
											script: "if (this.item && [\"armour\", \"wfrp4e-archives3.armour\"].includes(this.item.type)) {"
												+ "\n\tlet ap = this.item.system.AP;"
												+ "\n\tap = {"
												+ "\n\t\tbody: ap.body > 0 ? ap.body - 1 : ap.body,"
												+ "\n\t\thead: ap.head > 0 ? ap.head - 1 : ap.head,"
												+ "\n\t\tlArm: ap.lArm > 0 ? ap.lArm - 1 : ap.lArm,"
												+ "\n\t\tlLeg: ap.lLeg > 0 ? ap.lLeg - 1 : ap.lLeg,"
												+ "\n\t\trArm: ap.rArm > 0 ? ap.rArm - 1 : ap.rArm,"
												+ "\n\t\trLeg: ap.rLeg > 0 ? ap.rLeg - 1 : ap.rLeg"
												+ "\n\t};"
												+ "\n\tlet encumbrance = Math.max(0, this.item.system.encumbrance.value - 1);"
												+ "\n\tthis.item.update({"
												+ "\n\t\t\"system.AP\": ap,"
												+ "\n\t\t\"system.encumbrance.value\": encumbrance"
												+ "\n\t});"
												+ "\n};",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Throatseeker.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Throatseeker.Hint"),
							default: true,
							id: "Throatseeker",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Throatseeker.Label"),
									img: "systems/wfrp4e/icons/conditions/bleeding.png",
									flags: {
										looting: {
											default: true,
											id: "Throatseeker"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Throatseeker.Label"),
											trigger: "computeApplyDamageModifiers",
											script: "let APIgnored = args.AP.layers.reduce((prev, current) => prev + ((current.weakpoints && !current.ignored) ? current.value : 0), 0);"
												+ "\nif (APIgnored) {"
												+ "\n\targs.modifiers.ap.ignored += APIgnored;"
												+ "\n\targs.modifiers.ap.details.push(\"<strong>\" + this.effect.name + \"</strong>: \" + game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.Throatseeker.Message\", {ap: APIgnored}));"
												+ "\n}",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
									img: "systems/wfrp4e/icons/conditions/bleeding.png",
									flags: {
										looting: {
											default: true,
											id: "Throatseeker"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
											trigger: "immediate",
											options: {
												deleteEffect: true
											},
											script: "let flaws = this.item.system.flaws.value;"
												+ "\nif (flaws.find(f => f.name == \"undamaging\")) {"
												+ "\n\tflaws = flaws.filter(f => f.name != \"undamaging\");"
												+ "\n\tui.notifications.notify(game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Throatseeker.Undamaging\"));"
												+ "\n\tthis.item.update({\"system.flaws.value\": flaws});"
												+ "\n};",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.TaintedWeapon.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.TaintedWeapon.Hint"),
							default: true,
							id: "TaintedWeapon",
							effects: [{
								name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.TaintedWeapon.Label"),
								img: "modules/wfrp4e-core/icons/mutations/mutation.png",
								flags: {
									looting: {
										default: true,
										id: "TaintedWeapon"
									}
								},
								system: {
									transferData: {
										documentType: "Item",
										equipTransfer: true
									},
									scriptData: [
										{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.TaintedWeapon.Label"),
											trigger: "applyDamage",
											script: "if (args.totalWoundLoss > 0) {"
												+ "\n\tif (args.opposedTest) {"
												+ "\n\t\targs.opposedTest.result.other.push(\"@Corruption[\" + game.i18n.localize(\"CORRUPTION.Minor\") + \"]{\" + game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.TaintedWeapon.Message.Opposed\") + \"}\");"
												+ "\n\t} else {"
												+ "\n\t\tthis.script.message(\"<strong>\" + args.actor.prototypeToken.name + \"</strong> \" + game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.TaintedWeapon.Message.NotOpposed\"));"
												+ "\n\t};"
												+ "\n};",
										},
										{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.TaintedWeapon.Label"),
											trigger: "rollWeaponTest",
											script: "if (args.test.isFumble && args.test.item == this.item) {"
												+ "\n\tthis.script.message(\"<strong>\" + (this.actor.token?.name || this.actor.name) + \"</strong> \" + game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.TaintedWeapon.Message.NotOpposed\"));"
												+ "\n};",
										}
									]
								}
							}]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Quietened.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Quietened.Hint"),
							default: true,
							id: "Quietened",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
									img: "modules/wfrp4e-core/icons/equipment/armour/armour.png",
									flags: {
										looting: {
											default: true,
											id: "Quietened"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
											trigger: "immediate",
											options: {
												deleteEffect: true
											},
											script: "this.item.effects.forEach(e => {"
												+ "\n\tif (e.system.scriptData.find(s => s.options.hideScript == \"\\[Script.l8qFKSnMpy4P7XQR\\]\")) {e.update({\"disabled\": true})};"
												+ "\n});",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
									img: "modules/wfrp4e-core/icons/equipment/armour/armour.png",
									flags: {
										looting: {
											default: true,
											id: "Quietened"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
											trigger: "deleteEffect",
											script: "if (this.item) {"
												+ "\n\tthis.item.effects.forEach(e => {"
												+ "\n\t\tif (e.system.scriptData.find(s => s.options.hideScript == \"\\[Script.l8qFKSnMpy4P7XQR\\]\")) {e.update({\"disabled\": false})};"
												+ "\n\t});"
												+ "\n};",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.FullOfWind.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.FullOfWind.Hint"),
							default: true,
							id: "FullOfWind",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.FullOfWind.Label") + " (" + game.i18n.localize("Armour") + ")",
									img: "modules/wfrp4e-core/icons/equipment/armour/armour.png",
									flags: {
										looting: {
											default: true,
											id: "FullOfWind"
										}
									},
									system: {
										transferData: {
											documentType: "Actor",
											equipTransfer: true
										},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.FullOfWind.Label") + " (" + game.i18n.localize("Armour") + ")",
											trigger: "takeDamage",
											script: "let skillTest = async () => {"
												+ "\n\tif (args.AP.layers.find(i => i.source.id == this.item.id)) {"
												+ "\n\t\tlet result = false;"
												+ "\n\t\tif (this.actor.itemTags.skill.find(s => s.name == game.i18n.localize(\"NAME.Language\") + \" (\" + game.i18n.localize(\"SPEC.Magick\") + \")\")) {"
												+ "\n\t\t\tlet test = await this.actor.setupSkill(game.i18n.localize(\"NAME.Language\") + \" (\" + game.i18n.localize(\"SPEC.Magick\") + \")\", {appendTitle: \": \" + this.effect.name, fields: {difficulty: \"veasy\"}});"
												+ "\n\t\t\tawait test.roll();"
												+ "\n\t\t\tresult = test.outcome == \"failure\" ? false : true;"
												+ "\n\t\t};"
												+ "\n\t\tif (!result) {"
												+ "\n\t\t\tthis.script.message(\"<a class='table-click action-link\tfumble-roll' data-action='clickTable' data-column='' data-table='minormis' data-modifier=''><i class='fas fa-list'></i> \" + game.i18n.localize(\"ROLL.MinorMis\") + \" </a>\");"
												+ "\n\t\t};"
												+ "\n\t};"
												+ "\n};"
												+ "\nskillTest();",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.FullOfWind.Label") + " (" + game.i18n.localize("Weapon") + ")",
									img: "modules/wfrp4e-core/icons/equipment/weapons/hand-weapon.png",
									flags: {
										looting: {
											default: true,
											id: "FullOfWind"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.FullOfWind.Label") + " (" + game.i18n.localize("Weapon") + ")",
											trigger: "rollTest",
											script: "let skillTest = async () => {"
												+ "\n\tlet result = false;"
												+ "\n\tif (this.actor.itemTags.skill.find(s => s.name == game.i18n.localize(\"NAME.Language\") + \" (\" + game.i18n.localize(\"SPEC.Magick\") + \")\")) {"
												+ "\n\t\tlet test = await this.actor.setupSkill(game.i18n.localize(\"NAME.Language\") + \" (\" + game.i18n.localize(\"SPEC.Magick\") + \")\", {appendTitle: \": \" + this.effect.name, fields: {difficulty: \"veasy\"}});"
												+ "\n\t\tawait test.roll();"
												+ "\n\t\tresult = test.outcome == \"failure\" ? false : true;"
												+ "\n\t};"
												+ "\n\tif (!result) {"
												+ "\n\t\tthis.script.message(\"<a class='table-click action-link fumble-roll' data-action='clickTable' data-column='' data-table='minormis' data-modifier=''><i class='fas fa-list'></i> \" + game.i18n.localize(\"ROLL.MinorMis\") + \" </a>\");"
												+ "\n\t};"
												+ "\n};"
												+ "\nskillTest();",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Draining.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Draining.Hint"),
							default: true,
							id: "Draining",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Draining.Label") + " (" + game.i18n.localize("Armour") + ")",
									img: "modules/wfrp4e-core/icons/equipment/armour/armour.png",
									flags: {
										looting: {
											default: true,
											id: "Draining"
										}
									},
									system: {
										transferData: {
											documentType: "Actor",
											equipTransfer: true
										},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Draining.Label") + " (" + game.i18n.localize("Armour") + ")",
											trigger: "takeDamage",
											script: "if (args.AP.layers.find(i => i.source.id == this.item.id)) {"
												+ "\n\tlet skillTest = async () => {"
												+ "\n\t\tlet test = await this.actor.setupSkill(game.i18n.localize(\"NAME.Endurance\"), {appendTitle: \": \" + this.effect.name, fields: {difficulty: \"average\"}});"
												+ "\n\t\tawait test.roll();"
												+ "\n\t\tif (test.outcome == \"failure\") {await this.actor.addCondition(\"fatigued\")};"
												+ "\n\t};"
												+ "\n\tskillTest();"
												+ "\n};",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Draining.Label") + " (" + game.i18n.localize("Weapon") + ")",
									img: "modules/wfrp4e-core/icons/equipment/weapons/hand-weapon.png",
									flags: {
										looting: {
											default: true,
											id: "Draining"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Draining.Label") + " (" + game.i18n.localize("Weapon") + ")",
											trigger: "rollTest",
											script: "let skillTest = async () => {"
												+ "\n\tlet test = await this.actor.setupSkill(game.i18n.localize(\"NAME.Endurance\"), {appendTitle: \": \" + this.effect.name, fields: {difficulty: \"average\"}});"
												+ "\n\tawait test.roll();"
												+ "\n\tif (test.outcome != \"success\") {await this.actor.addCondition(\"fatigued\")};"
												+ "\n};"
												+ "\nskillTest();",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.DrawingTheWinds.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.DrawingTheWinds.Hint"),
							default: true,
							id: "DrawingTheWinds",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.DrawingTheWinds.Label"),
									img: "modules/wfrp4e-core/icons/spells/petty.png",
									flags: {
										looting: {
											default: true,
											id: "DrawingTheWinds"
										}
									},
									system: {
										transferData: {
											documentType: "Actor",
											type: "aura",
											area: {
												radius: "10"
											},
											filter: "if (args.effects.find(e => e.flags.looting.id == \"DrawingTheWinds\")) {return true};"
										},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.DrawingTheWinds.Label"),
											trigger: "dialog",
											options: {
												activateScript: "return true;",
												hideScript: "return !args.spell;"
											},
											script: "let swirlingWinds = [-30, -10, -10, 0, 0, 0, 0, 10, 10, 30];"
												+ "\nswirlingWinds = swirlingWinds[(await new Roll(\"1d\" + swirlingWinds.length + \" - 1\").roll({allowInteractive: false})).total];"
												+ "\nargs.fields.modifier += Number(swirlingWinds);"
												+ "\nthis.script.message(\"<strong>\" + (this.actor.token?.name || this.actor.name) + \"</strong> \" + game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.DrawingTheWinds.Message\", {result: \"<strong>\" + swirlingWinds + \"</strong> \"}));",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Cursed.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Cursed.Hint"),
							default: true,
							id: "Cursed",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Cursed.Label"),
									img: "modules/wfrp4e-core/icons/spells/undivided.png",
									flags: {
										looting: {
											default: true,
											id: "Cursed"
										}
									},
									system: {
										transferData: {documentType: "Actor"},
										scriptData: [
											{
												label: game.i18n.localize("WH.Script"),
												trigger: "preOpposedDefender",
												script: "if (Number.isNumeric(args.attackerTest.damage) && (args.attackerTest.result.SL <= args.defenderTest.result.SL || (args.attackerTest.result.SL === args.defenderTest.result.SL && (args.attackerTest.target <= args.defenderTest.target)))) {"
													+ "\n\tlet rollD10 = (await new Roll(\"1d10\").roll({allowInteractive : false})).total;"
													+ "\n\tif (rollD10 >= 7) {"
													+ "\n\t\targs.defenderTest.result.SL = 6 - rollD10 + Number(args.attackerTest.result.SL);"
													+ "\n\t\targs.opposedTest.result.other.push(\"<i>\" + game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.Cursed.Message\", {defender: \"<b>\" + (args.defenderTest.actor.token?.name || args.defenderTest.actor.name) + \"</b>\"}) + \"</i>\");"
													+ "\n\t};"
													+ "\n};",
											},
											{
												label: game.i18n.localize("WH.Script"),
												trigger: "immediate",
												script: "this.effect.updateSource({"
													+ "\n\tname: this.item.name,"
													+ "\n\timg: this.item.img,"
													+ "\n});",
											}
										]
									}
								}
							]
						},

						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.RelentlessFury.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.RelentlessFury.Hint"),
							default: true,
							id: "RelentlessFury",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.ApplyDamage"),
									img: "modules/wfrp4e-core/icons/talents/frenzy.png",
									flags: {
										looting: {
											default: true,
											id: "RelentlessFury"
										}
									},
									system: {
										transferData: {
											documentType: "Item",
											equipTransfer: true
										},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.ApplyDamage"),
											trigger: "applyDamage",
											script: "if (args.totalWoundLoss > 0) {"
												+ "\n\tlet wielder = args.attacker || this.actor;"
												+ "\n\tif (!wielder) {return};"
												+ "\n\tlet alreadyFrenzied = Boolean("
												+ "\n\t\twielder.hasCondition?.(\"frenzied\") ||"
												+ "\n\t\twielder.effects?.some(e => !e.disabled && (e.statuses?.has(\"frenzied\") || e.flags?.looting?.id === \"RelentlessFuryActive\" || /frenzy|ярость/i.test(`${e.name} ${e.flags?.babele?.originalName || \"\"}`)))"
												+ "\n\t);"
												+ "\n\tif (alreadyFrenzied) {return};"
												+ "\n\tlet count = Number(this.item.flags?.looting?.furyCount) || 0;"
												+ "\n\tlet mod = Math.max(-30, -(count * 10));"
												+ "\n\tawait this.item.update({\"flags.looting.furyCount\": count + 1}, {onReset: true});"
												+ "\n\tlet diffKey = warhammer.utility.findKey(mod, game.wfrp4e.config.difficultyModifiers) || \"challenging\";"
												+ "\n\tlet test = await wielder.setupCharacteristic(\"wp\", {"
												+ "\n\t\tfields: {difficulty: diffKey},"
												+ "\n\t\tappendTitle: \" — \" + this.item.name"
												+ "\n\t});"
												+ "\n\tif (!test) {return};"
												+ "\n\tawait test.roll();"
												+ "\n\tif (!test.succeeded) {"
												+ "\n\t\tlet frenzyTalent = wielder.itemTypes?.talent?.find(t => /frenzy|ярость/i.test(`${t.name} ${t.flags?.babele?.originalName || \"\"}`));"
												+ "\n\t\tlet frenzyEffect = frenzyTalent?.effects?.contents?.find(e => e.system?.transferData?.documentType == \"Actor\") || frenzyTalent?.effects?.contents?.[0];"
												+ "\n\t\tif (frenzyEffect) {"
												+ "\n\t\t\tlet effData = frenzyEffect.toObject();"
												+ "\n\t\t\teffData.disabled = false;"
												+ "\n\t\t\teffData.flags = foundry.utils.mergeObject(effData.flags || {}, {looting: {id: \"RelentlessFuryActive\"}});"
												+ "\n\t\t\tawait wielder.createEmbeddedDocuments(\"ActiveEffect\", [effData]);"
												+ "\n\t\t} else if (game.wfrp4e.config.systemEffects?.frenzy) {"
												+ "\n\t\t\tawait wielder.addSystemEffect(\"frenzy\");"
												+ "\n\t\t} else {"
												+ "\n\t\t\tawait wielder.addCondition(\"frenzied\");"
												+ "\n\t\t};"
												+ "\n\t\tthis.script.message(game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.RelentlessFury.Failed\", {"
												+ "\n\t\t\tactor: \"<strong>\" + (wielder.token?.name || wielder.name) + \"</strong>\","
												+ "\n\t\t\titem: \"<strong>\" + this.item.name + \"</strong>\""
												+ "\n\t\t}));"
												+ "\n\t};"
												+ "\n};",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.RelentlessFury.Label"),
									img: "modules/wfrp4e-core/icons/talents/frenzy.png",
									flags: {
										looting: {
											default: true,
											id: "RelentlessFury"
										}
									},
									system: {
										transferData: {
											documentType: "Actor",
											equipTransfer: true
										},
										scriptData: [
											{
												label: game.i18n.localize("NAME.Frenzy"),
												trigger: "immediate",
												script: "let hasFrenzy = this.actor.itemTypes?.talent?.some(t => /frenzy|ярость/i.test(`${t.name} ${t.flags?.babele?.originalName || \"\"}`));"
													+ "\nif (!hasFrenzy) {"
													+ "\n\tlet talent = await fromUuid(\"Compendium.wfrp4e-core.items.hXcfygzujgyMN1uI\");"
													+ "\n\tif (talent) {"
													+ "\n\t\tawait Item.create([talent.toObject()], {fromEffect: this.effect.id, parent: this.actor, onReset: true});"
													+ "\n\t};"
													+ "\n};",
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.StartCombat"),
												trigger: "startCombat",
												script: "if (this.item && (Number(this.item.flags?.looting?.furyCount) || 0) !== 0) {"
													+ "\n\tawait this.item.update({\"flags.looting.furyCount\": 0}, {onReset: true});"
													+ "\n};",
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.EndCombat"),
												trigger: "endCombat",
												script: "if (this.item && (Number(this.item.flags?.looting?.furyCount) || 0) !== 0) {"
													+ "\n\tawait this.item.update({\"flags.looting.furyCount\": 0}, {onReset: true});"
													+ "\n};",
											}
										]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Hint"),
							default: true,
							id: "WeaponOfForsakenFortune",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Label"),
									img: "modules/wfrp4e-core/icons/equipment/weapons/hand-weapon.png",
									flags: {
										looting: {
											default: true,
											id: "WeaponOfForsakenFortune"
										}
									},
									system: {
										transferData: {
											documentType: "Actor",
											equipTransfer: true
										},
										scriptData: [
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Label"),
												trigger: "dialog",
												options: {
													activateScript: "return (this.actor.system.status.fortune?.value || 0) > 0;",
													hideScript: "return args.weapon?.id != this.item.id || this.actor.type != \"character\";",
													submissionScript: "if ((this.actor.system.status.fortune?.value || 0) > 0) {args.context.weaponOfForsakenFortune = true};"
												},
												script: "if ((this.actor.system.status.fortune?.value || 0) > 0) {args.fields.modifier += 20};",
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Label"),
												trigger: "opposedDefender",
												script: "let usedBonus = Boolean(args.defenderTest?.context?.weaponOfForsakenFortune || args.defenderTest?.options?.weaponOfForsakenFortune);"
													+ "\nif (args.opposedTest.result.winner == \"defender\" && args.defenderTest?.item?.id == this.item.id && usedBonus && Number(args.opposedTest.result.differenceSL) <= 2) {"
													+ "\n\tlet curFortune = Number(this.actor.system?.status?.fortune?.value) || 0;"
													+ "\n\tif (curFortune <= 0) {"
													+ "\n\t\targs.opposedTest.result.other.push(game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.NoFortune\", {"
													+ "\n\t\t\titem: \"<b>\" + this.item.name + \"</b>\","
													+ "\n\t\t\tactor: \"<b>\" + (this.actor.token?.name || this.actor.name) + \"</b>\""
													+ "\n\t\t}));"
													+ "\n\t} else {"
													+ "\n\t\tawait this.actor.update({\"system.status.fortune.value\": curFortune - 1});"
													+ "\n\t\targs.opposedTest.result.other.push(game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Message\", {"
													+ "\n\t\t\titem: \"<b>\" + this.item.name + \"</b>\","
													+ "\n\t\t\tactor: \"<b>\" + (this.actor.token?.name || this.actor.name) + \"</b>\""
													+ "\n\t\t}));"
													+ "\n\t};"
													+ "\n};",
												},
												{
													label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Label"),
													trigger: "opposedAttacker",
													script: "let usedBonus = Boolean(args.attackerTest?.context?.weaponOfForsakenFortune || args.attackerTest?.options?.weaponOfForsakenFortune);"
													+ "\nif (args.opposedTest.result.winner == \"attacker\" && args.attackerTest?.item?.id == this.item.id && usedBonus && Number(args.opposedTest.result.differenceSL) <= 2) {"
													+ "\n\tlet curFortune = Number(this.actor.system?.status?.fortune?.value) || 0;"
													+ "\n\tif (curFortune <= 0) {"
													+ "\n\t\targs.opposedTest.result.other.push(game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.NoFortune\", {"
													+ "\n\t\t\titem: \"<b>\" + this.item.name + \"</b>\","
													+ "\n\t\t\tactor: \"<b>\" + (this.actor.token?.name || this.actor.name) + \"</b>\""
													+ "\n\t\t}));"
													+ "\n\t} else {"
													+ "\n\t\tawait this.actor.update({\"system.status.fortune.value\": curFortune - 1});"
													+ "\n\t\targs.opposedTest.result.other.push(game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Message\", {"
													+ "\n\t\t\titem: \"<b>\" + this.item.name + \"</b>\","
													+ "\n\t\t\tactor: \"<b>\" + (this.actor.token?.name || this.actor.name) + \"</b>\""
													+ "\n\t\t}));"
													+ "\n\t};"
													+ "\n};",
											}
										]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Blooddrinker.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Blooddrinker.Hint"),
							default: true,
							id: "Blooddrinker",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Blooddrinker.Label"),
									img: "systems/wfrp4e/icons/conditions/bleeding.png",
									flags: {
										looting: {
											default: true,
											id: "Blooddrinker"
										}
									},
									system: {
										transferData: {
											documentType: "Item",
											equipTransfer: true
										},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Blooddrinker.Label"),
											trigger: "applyDamage",
											script: "if (args.totalWoundLoss > 0) {"
												+ "\n\tlet wielder = args.attacker || this.actor;"
												+ "\n\tlet target = args.actor;"
												+ "\n\tif (!wielder || !target) {return};"
												+ "\n\tlet isVampire = Boolean("
												+ "\n\t\twielder.has?.(game.i18n.localize(\"NAME.Vampiric\")) ||"
												+ "\n\t\twielder.itemTypes?.trait?.some(t => /vampir|вампир/i.test(`${t.name} ${t.flags?.babele?.originalName || \"\"}`)) ||"
												+ "\n\t\t/vampir|вампир/i.test(`${wielder.system?.details?.species?.value || \"\"} ${wielder.system?.details?.species?.subspecies || \"\"}`) ||"
												+ "\n\t\twielder.flags?.assistant?.reactions?.subspecies === \"Vampire\""
												+ "\n\t);"
												+ "\n\tif (!isVampire) {return};"
												+ "\n\tlet isInvalidTarget = Boolean("
												+ "\n\t\ttarget.has?.(game.i18n.localize(\"NAME.Undead\")) ||"
												+ "\n\t\ttarget.has?.(game.i18n.localize(\"NAME.Daemonic\")) ||"
												+ "\n\t\ttarget.itemTypes?.trait?.some(t => /undead|daemon|нежить|демон/i.test(`${t.name} ${t.flags?.babele?.originalName || \"\"}`)) ||"
												+ "\n\t\t/undead|daemon|нежить|демон/i.test(`${target.system?.details?.species?.value || \"\"} ${target.system?.details?.species?.subspecies || \"\"}`) ||"
												+ "\n\t\t[\"RestlessDead\", \"Daemons\"].includes(target.flags?.assistant?.reactions?.species)"
												+ "\n\t);"
												+ "\n\tif (isInvalidTarget) {return};"
												+ "\n\tlet heal = Math.ceil(args.totalWoundLoss * 0.1);"
												+ "\n\tlet cur = Number(wielder.system?.status?.wounds?.value) || 0;"
												+ "\n\tlet max = Number(wielder.system?.status?.wounds?.max) || cur;"
												+ "\n\tlet actualHeal = Math.min(max, cur + heal) - cur;"
												+ "\n\tif (actualHeal > 0) {"
												+ "\n\t\tawait wielder.update({\"system.status.wounds.value\": cur + actualHeal});"
												+ "\n\t\tthis.script.message(game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.Blooddrinker.Message\", {"
												+ "\n\t\t\tactor: \"<strong>\" + (wielder.token?.name || wielder.name) + \"</strong>\","
												+ "\n\t\t\twounds: \"<strong>\" + actualHeal + \"</strong>\","
												+ "\n\t\t\titem: \"<strong>\" + this.item.name + \"</strong>\""
												+ "\n\t\t}));"
												+ "\n\t};"
												+ "\n};",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Ward.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Ward.Hint"),
							default: true,
							id: "Ward",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Ward.Label") + " (9)",
									img: "modules/wfrp4e-core/icons/spells/petty.png",
									flags: {
										looting: {
											default: true,
											id: "Ward",
											rating: 9
										}
									},
									system: {
										transferData: {
											documentType: "Actor",
											equipTransfer: true
										},
										scriptData: [
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Ward.Label"),
												trigger: "opposedDefender",
												script: "let isHit = args.opposedTest.result.winner == \"attacker\" || Boolean(args.opposedTest.result.crit);"
												+ "\nlet isAttack = Number.isNumeric(args.attackerTest?.damage) || Number(args.opposedTest.result.damage?.value) > 0 || Boolean(args.opposedTest.result.crit);"
												+ "\nif (isHit && isAttack && !args.opposedTest.result.wardBlocked) {"
												+ "\n\tlet rating = Number(this.effect.name.match(/\\((\\d+)\\)/)?.[1]) || Number(this.effect.flags?.looting?.rating) || 9;"
												+ "\n\tlet rollD10 = (await new Roll(\"1d10\").roll({allowInteractive: false})).total;"
												+ "\n\tif (rollD10 >= rating) {"
												+ "\n\t\targs.opposedTest.result.damage = {value: null, breakdown: null};"
												+ "\n\t\targs.opposedTest.result.crit = null;"
												+ "\n\t\targs.opposedTest.result.wardBlocked = true;"
												+ "\n\t\targs.opposedTest.result.other.push(\"<i>\" + game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.Ward.Blocked\", {"
												+ "\n\t\t\tdefender: \"<strong>\" + (this.actor.token?.name || this.actor.name) + \"</strong>\","
												+ "\n\t\t\trating,"
												+ "\n\t\t\troll: \"<strong>\" + rollD10 + \"</strong>\""
												+ "\n\t\t}) + \"</i>\");"
												+ "\n\t} else {"
												+ "\n\t\targs.opposedTest.result.other.push(\"<i>\" + game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.Ward.Failed\", {"
												+ "\n\t\t\trating,"
												+ "\n\t\t\troll: \"<strong>\" + rollD10 + \"</strong>\""
												+ "\n\t\t}) + \"</i>\");"
												+ "\n\t};"
												+ "\n};",
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Ward.Label"),
												trigger: "preTakeDamage",
												script: "let rating = Number(this.effect.name.match(/\\((\\d+)\\)/)?.[1]) || Number(this.effect.flags?.looting?.rating) || 9;"
												+ "\nif (args.opposedTest?.result?.wardBlocked) {"
												+ "\n\targs.abort = game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.Ward.BlockedSimple\", {"
												+ "\n\t\tdefender: \"<strong>\" + (this.actor.token?.name || this.actor.name) + \"</strong>\","
												+ "\n\t\trating"
												+ "\n\t});"
												+ "\n} else if (!args.opposedTest) {"
												+ "\n\tlet rollD10 = (await new Roll(\"1d10\").roll({allowInteractive: false})).total;"
												+ "\n\tif (rollD10 >= rating) {"
												+ "\n\t\targs.abort = game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.Ward.Blocked\", {"
												+ "\n\t\t\tdefender: \"<strong>\" + (this.actor.token?.name || this.actor.name) + \"</strong>\","
												+ "\n\t\t\trating,"
												+ "\n\t\t\troll: \"<strong>\" + rollD10 + \"</strong>\""
												+ "\n\t\t});"
												+ "\n\t};"
												+ "\n};",
											}
										]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
									img: "modules/wfrp4e-core/icons/spells/petty.png",
									flags: {
										looting: {
											default: true,
											id: "Ward"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
											trigger: "immediate",
											options: {
												deleteEffect: true
											},
											script: "let roll = (await new Roll(\"1d100\").roll({allowInteractive: false})).total;"
												+ "\nlet rating = roll <= 10 ? 7 : roll <= 30 ? 8 : 9;"
												+ "\nlet wardEffect = this.item.effects.find(e => e.flags?.looting?.id == \"Ward\" && e.id != this.effect.id);"
												+ "\nif (wardEffect) {"
												+ "\n\tawait wardEffect.update({"
												+ "\n\t\tname: game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Ward.Label\") + \" (\" + rating + \")\","
												+ "\n\t\t\"flags.looting.rating\": rating"
												+ "\n\t}, {onReset: true});"
												+ "\n};",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Hint"),
							default: true,
							id: "Size&Species",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
									img: "systems/wfrp4e/icons/buildings/scroll.png",
									flags: {
										looting: {
											default: true,
											id: "Size&Species"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
											trigger: "immediate",
											options: {
												deleteEffect: true
											},
											script: "let species = [].concat("
												+ "\n\tArray(5).fill(game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Human\")),"
												+ "\n\tArray(2).fill(game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Elf\")),"
												+ "\n\tArray(2).fill(game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Dwarf\")),"
												+ "\n\tArray(1).fill(game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Halfling\"))"
												+ "\n);"
												+ "\nlet size = [].concat("
												+ "\n\tArray(1).fill(game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.EShort\")),"
												+ "\n\tArray(2).fill(game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Short\")),"
												+ "\n\tArray(4).fill(game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Average\")),"
												+ "\n\tArray(2).fill(game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Tall\")),"
												+ "\n\tArray(1).fill(game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.ETall\"))"
												+ "\n);"
												+ "\nif ([\"armour\", \"wfrp4e-archives3.armour\"].includes(this.item.type)) {"
												+ "\n\tspecies = species[(await new Roll(\"1d\" + species.length + \" - 1\").roll({allowInteractive: false})).total];"
												+ "\n\tsize = size[(await new Roll(\"1d\" + size.length + \" - 1\").roll({allowInteractive: false})).total];"
												+ "\n\tlet table = {"
												+ "\n\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Human\")]: {"
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.EShort\")]: \"4'10\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Short\")]: \"5'2\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Average\")]: \"5'7\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Tall\")]: \"6'0\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.ETall\")]: \"6'5\\\"\","
												+ "\n\t\t},"
												+ "\n\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Elf\")]: {"
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.EShort\")]: \"6'\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Short\")]: \"6'3\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Average\")]: \"6'5\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Tall\")]: \"6'7\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.ETall\")]: \"6'9\\\"\","
												+ "\n\t\t},"
												+ "\n\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Dwarf\")]: {"
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.EShort\")]: \"4'4\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Short\")]: \"4'6\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Average\")]: \"4'8\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Tall\")]: \"4'10\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.ETall\")]: \"5'1\\\"\","
												+ "\n\t\t},"
												+ "\n\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Halfling\")]: {"
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.EShort\")]: \"3'2\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Short\")]: \"3'4\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Average\")]: \"3'6\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.Tall\")]: \"3'8\\\"\","
												+ "\n\t\t\t[game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Size&Species.Scripts.ETall\")]: \"3'11\\\"\","
												+ "\n\t\t}"
												+ "\n\t};"
												+ "\n\tthis.item.update({"
												+ "\n\t\tname: this.item.name + \" (\" + species + \", \" + size + \") [\" + table[species][size] + \"]\","
												+ "\n\t\t\"flags.looting.size\": size,"
												+ "\n\t\t\"flags.looting.species\": species,"
												+ "\n\t\t\"flags.looting.add_label\": \" (\" + species + \", \" + size + \") [\" + table[species][size] + \"]\""
												+ "\n\t});"
												+ "\n} else {"
												+ "\n\tspecies = \" (\" + species[(await new Roll(\"1d\" + species.length + \" - 1\").roll({allowInteractive: false})).total] + \")\";"
												+ "\n\tthis.item.update({"
												+ "\n\t\tname: this.item.name + species,"
												+ "\n\t\t\"flags.looting.species\": species,"
												+ "\n\t\t\"flags.looting.add_label\": species"
												+ "\n\t});"
												+ "\n};",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
									img: "systems/wfrp4e/icons/buildings/scroll.png",
									flags: {
										looting: {
											default: true,
											id: "Size&Species"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
											trigger: "deleteEffect",
											script: "if (this.item && [\"armour\", \"wfrp4e-archives3.armour\"].includes(this.item.type)) {"
												+ "\n\tthis.item.update({"
												+ "\n\t\tname: this.item.name.replace(this.item.flags.looting.add_label, \"\"),"
												+ "\n\t\t\"flags.looting.size\": \"\","
												+ "\n\t\t\"flags.looting.species\": \"\","
												+ "\n\t\t\"flags.looting.add_label\": \"\""
												+ "\n\t});"
												+ "\n} else {"
												+ "\n\tthis.item.update({"
												+ "\n\t\tname: this.item.name.replace(this.item.flags.looting.add_label, \"\"),"
												+ "\n\t\t\"flags.looting.species\": \"\","
												+ "\n\t\t\"flags.looting.add_label\": \"\""
												+ "\n\t});"
												+ "\n};",
										}]
									}
								}
							]
						},
						{
							name: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.LootedItem.Label"),
							hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.LootedItem.Hint"),
							default: true,
							id: "LootedItem",
							effects: [
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
									img: "modules/wfrp4e-core/icons/unarmed.png",
									flags: {
										looting: {
											default: true,
											id: "LootedItem"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
											trigger: "immediate",
											options: {
												deleteEffect: true
											},
											script: "let flaws = [];"
												+ "\nlet list;"
												+ "\nif (this.item.type == \"weapon\") {"
												+ "\n\tlist = ["
												+ "\n\t\tArray(10).fill(\"bulky\"),"
												+ "\n\t\tArray(15).fill(\"dangerous\"),"
												+ "\n\t\tArray(10).fill(\"imprecise\"),"
												+ "\n\t\tArray(15).fill(\"shoddy\"),"
												+ "\n\t\tArray(10).fill(\"slow\"),"
												+ "\n\t\tArray(10).fill(\"ugly\"),"
												+ "\n\t\tArray(10).fill(\"undamaging\"),"
												+ "\n\t\tArray(15).fill(\"unreliable\"),"
												+ "\n\t\tArray(5).fill(\"roll\")"
												+ "\n\t].flat(1);"
												+ "\n} else if ([\"armour\", \"wfrp4e-archives3.armour\"].includes(this.item.type)) {"
												+ "\n\tlist = ["
												+ "\n\t\tArray(15).fill(\"bulky\"),"
												+ "\n\t\tArray(15).fill(\"partial\"),"
												+ "\n\t\tArray(20).fill(\"shoddy\"),"
												+ "\n\t\tArray(15).fill(\"ugly\"),"
												+ "\n\t\tArray(15).fill(\"unreliable\"),"
												+ "\n\t\tArray(15).fill(\"weakpoints\"),"
												+ "\n\t\tArray(5).fill(\"roll\")"
												+ "\n\t].flat(1);"
												+ "\n};"
												+ "\nlet getRandom = async () => {"
												+ "\n\tlet roll = (await new Roll(\"1d100\").roll()).total;"
												+ "\n\tif (list[roll] == \"roll\") {"
												+ "\n\t\tawait getRandom();"
												+ "\n\t\tawait getRandom();"
												+ "\n\t} else {flaws.push(list[roll])};"
												+ "\n};"
												+ "\nawait getRandom();"
												+ "\nthis.item.update({"
												+ "\n\t\"system.flaws.value\": this.item.system.flaws.value.concat(flaws.map(f => ({name: f}))),"
												+ "\n\t\"flags.looting.lootedFlaws\": flaws.filter(f => !this.item.system.flaws.value.find(t => t.name == f))"
												+ "\n});",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
									img: "modules/wfrp4e-core/icons/unarmed.png",
									flags: {
										looting: {
											default: true,
											id: "LootedItem"
										}
									},
									system: {
										transferData: {documentType: "Item"},
										scriptData: [{
											label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
											trigger: "deleteEffect",
											script: "if (this.item) {"
												+ "\n\tthis.item.update({"
												+ "\n\t\t\"system.flaws.value\": this.item.system.flaws.value.filter(f => !this.item.flags.looting.lootedFlaws.includes(f.name)),"
												+ "\n\t\t\"flags.looting.lootedFlaws\": \"\""
												+ "\n\t});"
												+ "\n};",
										}]
									}
								}
							]
						}
					]
				}
			}
		}
	};
	game.settings.get("wfrp4e-looting", "hideQualities") ? document.body.style.setProperty("--baseQuality", "none") : document.body.style.setProperty("--baseQuality", "unset");
	//Фильтр качеств на наличие
	["any", "trapping", "melee", "range", "armour"].forEach(p => {
		game.wfrp4e.looting.data.generator.props.qualities[p] = game.wfrp4e.looting.data.generator.props.qualities[p].filter(q => game.wfrp4e.utility.qualityList()[q]);
		game.wfrp4e.looting.data.generator.props.flaws[p] = game.wfrp4e.looting.data.generator.props.flaws[p].filter(f => game.wfrp4e.utility.flawList()[f]);
	});
	//Установление параметров
	game.wfrp4e.looting.data.generator.effects.all = game.wfrp4e.looting.data.generator.effects.default.concat(game.settings.get("wfrp4e-looting", "customEffects"));
	game.wfrp4e.looting.data.generator.presets.all = game.wfrp4e.looting.data.generator.presets.default.concat(game.wfrp4e.looting.data.generator.presets.props, game.settings.get("wfrp4e-looting", "customGenerator"));
	game.wfrp4e.looting.data.generator.presets.all.forEach(p => {
		p.types.value = [(p.types.trapping ? "trapping" : ""), (p.types.melee ? "melee" : ""), (p.types.range ? "range" : ""), (p.types.armour ? "armour" : "")].filter(Boolean).join(",");
		p.qualities = p.qualities?.filter(q => game.wfrp4e.utility.qualityList()[q.name] || ["any", "trapping", "melee", "range", "armour", "type"].includes(q.name));
		p.flaws = p.flaws?.filter(f => game.wfrp4e.utility.flawList()[f.name] || ["any", "trapping", "melee", "range", "armour", "type"].includes(f.name));
		p.value = calcGeneratorPresetValue(p);
		p.scripts = (p.scripts || []).reduce((acc, s) => {
			let script = game.wfrp4e.looting.data.generator.effects.all.find(e => e.id == s.id);
			if (script) {
				s.name = script.name;
				s.hint = script.hint;
				s.default = script.default;
				acc.push(s);
			};
			return acc;
		}, []);
	});
	//Проверка/обновление служебного предмета Скриптов Генератора
	if (game.user.isGM && game.users.activeGM?.id === game.user.id) {
		let effectsUuid = game.settings.get("wfrp4e-looting", "effectsItem");
		let existingItem = effectsUuid ? fromUuidSync(effectsUuid) : null;
		if (!existingItem || existingItem.flags?.looting?.version !== game.modules.get("wfrp4e-looting").version) {await updateLootingScriptsItem()};
	};
	//Добавление кнопок во вкладку предметов
	updateGeneratorButton();
});