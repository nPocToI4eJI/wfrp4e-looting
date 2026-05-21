let debugMessage = ["%cWFRP4e - Looting %c[debug]%c.", "font-weight: bold;", "color: orange;", ""];

function getID(array) {
	array = array.sort((a, b) => a - b);
	let id = false;
	if (!array.length) {id = 1} else {
		for (let i = 0; i < array.length; i++) {
			if (!array.includes("1")) {
				id = 1;
				break;
			} else if (Number(array[i + 1]) - Number(array[i]) != 1) {
				id = Number(array[i]) + 1;
				break;
			};
		};
		if (!id) {id = Number(array.at(-1)) + 1};
	};
	if (game.settings.get("wfrp4e-looting", "debug")) {
		console.debug(...debugMessage, "getID \"id\"");
		console.debug(id);
	};
	return id;
};

class importExport extends FormApplication {
	constructor() {
		super();
		importExport.action();
	};
	render() {this.close()};

	static async action() {
		let action = await foundry.applications.api.DialogV2.confirm({
			window: {title: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Action.Title")},
			content: "",
			yes: {
				icon: "fas fa-file-import",
				label: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Action.Import"),
				callback: () => {return "import"}
			},
			no: {
				icon: "fas fa-file-export",
				label: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Action.Export"),
				callback: () => {return "export"}
			}
		});

		if (action == "import") {
			let file = false;
			await foundry.applications.api.DialogV2.prompt({
				window: {title: game.i18n.localize("WFRP4E.Looting.Settings.importExport.File")},
				content: `<input name="file" type="file" accept="text/plain" autofocus>`,
				ok: {
					label: game.i18n.localize("Submit"),
					callback: (event, button, dialog) => {file = button.form.elements.file.files[0]}
				}
			});
			if (file) {
				file = JSON.parse(await foundry.utils.readTextFromFile(file));
				let types = ["customLooting", "customGenerator", "customEffects"];
				for (let i = 0; i < types.length; i++) {
					let replace = game.settings.get("wfrp4e-looting", types[i]).length ? await foundry.applications.api.DialogV2.confirm({
						window: {title: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Replace.Title")},
						content: `${game.i18n.format("WFRP4E.Looting.Settings.importExport.Replace.Content", {type: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Replace." + types[i])})}<span style="font-size: 12px; font-style: italic;">${game.i18n.localize("WFRP4E.Looting.Settings.importExport.Replace.Hint")}</span>`
					}) : true;
					if (replace) {await game.settings.set("wfrp4e-looting", types[i], file[types[i]])} else {
						let items = file[types[i]];
						items = items.concat(game.settings.get("wfrp4e-looting", types[i]));
						items = items.filter((item, index, self) => index == self.findIndex((i) => i.id == item.id));
						await game.settings.set("wfrp4e-looting", types[i], items.sort((a, b) => a.id.localeCompare(b.id)));
					};
				};
			};
		} else if (action == "export") {
			let data = {customLooting: game.settings.get("wfrp4e-looting", "customLooting"), customGenerator: game.settings.get("wfrp4e-looting", "customGenerator"), customEffects: game.settings.get("wfrp4e-looting", "customEffects")};
			foundry.utils.saveDataToFile(JSON.stringify(data), "text/plain", `${game.i18n.localize("WFRP4E.Looting.Name")} (${game.i18n.localize("WFRP4E.Looting.Settings.importExport.Name")})` + ".txt");
		};
	};
};

class debugMenu extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.template = "modules/wfrp4e-looting/templates/debug.hbs";
        options.classes.push("WFRP4eLooting-debug", "WFRP4eLooting", "warhammer");
        options.title = localize("WFRP4E.Looting.Settings.debugMenu.Name") + ": " + localize("WFRP4E.Looting.Name");
		if (game.settings.get("wfrp4e-looting", "debug")) {
			console.debug(...debugMessage, "debugMenu defaultOptions \"options\"");
			console.debug(options);
		};
        return options;
    };

    constructor(options) {
		//Проверка на наличие активного окна отладки
		if (document.querySelector("div.WFRP4eLooting.WFRP4eLooting-debug")) {
			document.querySelector("div.WFRP4eLooting.WFRP4eLooting-debug").style.zIndex = ++ApplicationV2._maxZ;
			return;
		};
        super(options);
        this.debug = game.settings.get("wfrp4e-looting", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "debugMenu constructor \"this\"");
			console.debug(this);
		};
    };

	async getData() {
		return {
			debug: this.debug
		};
	};

	activateListeners(html) {
		//Добавление взаимодействия при нажатии на кнопки
		super.activateListeners(html);
		//Переключение режима отладки
		this.element[0].querySelector("a.button[data-action=\"debugMode\"]").addEventListener("click", () => {this.updateDebugMode()});
		//Сброс Шаблонов Мародёрства
		this.element[0].querySelector("a.button[data-action=\"resetLooting\"]").addEventListener("click", () => {
			game.settings.set("wfrp4e-looting", "customLooting", []);
			ui.notifications.notify(game.i18n.format("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Notify", {type: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Looting")}));
		});
		//Сброс Шаблонов Генератора
		this.element[0].querySelector("a.button[data-action=\"resetGenerator\"]").addEventListener("click", () => {
			game.settings.set("wfrp4e-looting", "customGenerator", []);
			ui.notifications.notify(game.i18n.format("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Notify", {type: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Generator")}));
		});
		//Сброс Пользовательских Скриптов Генератора
		this.element[0].querySelector("a.button[data-action=\"resetScripts\"]").addEventListener("click", async () => {
			await game.settings.set("wfrp4e-looting", "customEffects", []);
			//Обновление предмета Скриптов Генератора
			this.updateScriptsItem();
			ui.notifications.notify(game.i18n.format("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Notify", {type: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Reset.Scripts")}));
		});
		//Обновление предмета Скриптов Генератора
		this.element[0].querySelector("a.button[data-action=\"updateScripts\"]").addEventListener("click", () => {
			this.updateScriptsItem();
			ui.notifications.notify(game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.Update.Notify"));
		});
	};

	async updateDebugMode() {
		if (this.debug) {await game.settings.set("wfrp4e-looting", "debug", false)}
		else {await game.settings.set("wfrp4e-looting", "debug", true)};
		this.debug = game.settings.get("wfrp4e-looting", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "debugMenu updateDebugMode \"this.debug\"");
			console.debug(this.debug);
		};
		this.element[0].querySelector("span#debugMode").textContent = this.debug ? game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.DebugMode.On") : game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Dialog.DebugMode.Off");
		this.element[0].querySelector("span#debugMode").style.color = this.debug ? "green" : "red";
	};

	async updateScriptsItem() {
		//Удаление старого предмета
		(await fromUuid(game.settings.get("wfrp4e-looting", "effectsItem"))).delete();
		//Создание нового предмета
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
				description: {value: game.i18n.localize("WFRP4E.Looting.Settings.effectsItem.Item.Description")},
			},
			effects: [game.wfrp4e.looting.data.generator.effects.script].concat(game.wfrp4e.looting.data.generator.effects.default.map(s => s.effects).flat(1), game.settings.get("wfrp4e-looting", "customEffects").map(s => s.effects).flat(1))
		});
		if (this.debug) {
			console.debug(...debugMessage, "debugMenu updateScriptsItem \"newItem\"");
			console.debug(newItem);
		};
		await game.settings.set("wfrp4e-looting", "effectsItem", newItem.uuid);
		document.querySelector(`li.directory-item.document.item[data-entry-id="${newItem.id}"]`).hidden = true;
	};
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
            title: "WFRP4E.Looting.Loot.Title"
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
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot constructor \"this\"");
			console.debug(this);
		};
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
		this.debug = game.settings.get("wfrp4e-looting", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot create");
		};
		//Проверка на наличие активного окна мародёрства
		if (document.querySelector("div.WFRP4eLooting.WFRP4eLooting-loot")) {
			document.querySelector("div.WFRP4eLooting.WFRP4eLooting-loot").style.zIndex = ++ApplicationV2._maxZ;
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
			console.debug(...debugMessage, "WFRP4eLootingLoot _onClickPreset \"type\"");
			console.debug(type);
			console.debug(...debugMessage, "WFRP4eLootingLoot _onClickPreset \"id\"");
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
					id: "custom-" + getID(game.settings.get("wfrp4e-looting", "customLooting").map(i => i.id.replace("custom-", ""))),
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
				this.element.querySelector("button.add").insertAdjacentHTML("beforebegin", `<button type="button" class="brass" data-action="clickPreset" data-type="custom" data-id="${newPreset.id}" data-tooltip="${newPreset.hint}<hr>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Ctrl")}">${newPreset.name}</button>`);
				id = newPreset.id;
			//Копирование существующего шаблона
			} else if (event.ctrlKey) {
				let newPreset = this.params[type].find(p => p.id == id);
				newPreset.id = "custom-" + getID(game.settings.get("wfrp4e-looting", "customLooting").map(i => i.id.replace("custom-", "")));
				//Обновление параметров и настроек
				await game.settings.set("wfrp4e-looting", "customLooting", game.settings.get("wfrp4e-looting", "customLooting").concat(newPreset));
				this.params.custom = game.settings.get("wfrp4e-looting", "customLooting");
				this.element.querySelector("button.add").insertAdjacentHTML("beforebegin", `<button type="button" class="brass" data-action="clickPreset" data-type="custom" data-id="${newPreset.id}" data-tooltip="${newPreset.hint}<hr>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Ctrl")}">${newPreset.name}</button>`);
				id = newPreset.id;
				type = "custom";
			};
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLoot _onClickPreset \"preset\"");
				console.debug(this.params[type].find(p => p.id == id));
			};
			//Окно просмотра настроек шаблона
			warhammer.apps.WFRP4eLootingLootPreset.create(this.params[type].find(p => p.id == id), type, this);
		} else {this.looting(this.params[type].find(p => p.id == id))};
	};

	updateParams() {
		this.params.custom = game.settings.get("wfrp4e-looting", "customLooting");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot updateParams \"this.params.custom\"");
			console.debug(this.params.custom);
		};
	};

	async looting(preset) {
		//Определение значения денежной награды
		let money = {bp: 0, ss: 0, gc: 0};
		let chanceRoll;
		for (let key in money) {
			chanceRoll = (await new Roll("1d100").roll()).total;
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLoot looting money", key, "\"chanceRoll\"");
				console.debug(chanceRoll);
			};
			if (chanceRoll <= preset.money[key].chance) {
				let roll = await new Roll(`${preset.money[key].dice.count}d${preset.money[key].dice.type}`).roll();
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot looting money", key, "\"roll\"");
					console.debug(roll);
				};
				let critical = async () => {
					let criticalRoll = (await new Roll(`1d${preset.money[key].dice.type}`).roll()).total;
					if (this.debug) {
						console.debug(...debugMessage, "WFRP4eLootingLoot looting money", key, "critical \"criticalRoll\"");
						console.debug(criticalRoll);
					};
					if (criticalRoll == preset.money[key].dice.type) {criticalRoll += await critical()};
					return criticalRoll;
				};
				for (let v in roll.dice[0].values) {
					money[key] += roll.dice[0].values[v];
					if (roll.dice[0].values[v] == preset.money[key].dice.type && [10, 20, 100].includes(preset.money[key].dice.type)) {money[key] += (await critical())};
				};
			};
		};
		//Конверсия денег
		money.bp = Math.round((money.bp + (money.ss * 12) + (money.gc * 20 * 12)) * game.settings.get("wfrp4e-looting", "modifier"));
		money.priceValue = money.bp;
		money.ss = 0;
		money.gc = 0;
		while (money.bp >= 12) {
			money.ss += 1;
			money.bp -= 12;
		};
		while (money.ss >= 20) {
			money.gc += 1;
			money.ss -= 20;
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot looting \"money\"");
			console.debug(money);
		};
		//Определение предметов по таблицам
		let items = [];
		for (let key in preset.tables) {
			let tableItems = [];
			chanceRoll = (await new Roll("1d100").roll()).total;
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLoot looting items", key, "\"chanceRoll\"");
				console.debug(chanceRoll);
			};
			if (chanceRoll <= preset.tables[key].chance) {
				let count = 0;
				for (let i = 0; i < preset.tables[key].dice.count; i++) {
					let roll = (await new Roll(`1d${preset.tables[key].dice.type}`).roll()).total;
					if (this.debug) {
						console.debug(...debugMessage, "WFRP4eLootingLoot looting items", key, "count \"roll\"");
						console.debug(roll);
					};
					count += roll;
					if (roll == preset.tables[key].dice.type && [10, 20, 100].includes(preset.tables[key].dice.type)) {i--};
				};
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot looting items", key, "\"count\"");
					console.debug(count);
				};
				for (let i = 0; i < count; i++) {
					if (preset.tables[key].table?.key) {
						let table = game.wfrp4e.tables.findTable(preset.tables[key].table.key || "", preset.tables[key].table.column || "");
						let item = (await table.roll()).results;
						if (this.debug) {
							console.debug(...debugMessage, "WFRP4eLootingLoot looting items", key, "count:", i, "\"item\"");
							console.debug(item);
						};
						for (let a in item) {
							let tablePrice = $(table.description).filter("p#tablePrice")[0]?.textContent?.split("|") || [1, 1, "+0"];
							let price = {bp: 0, ss: 0, gc: 0};
							switch (preset.type) {
								case "brass": price.bp = (await new Roll(`${tablePrice[0]}d${tablePrice[1]} ${tablePrice[2] || "+0"}`).roll()).total; break;
								case "silver": price.ss = (await new Roll(`${tablePrice[0]}d${tablePrice[1]} ${tablePrice[2] || "+0"}`).roll()).total; break;
								case "gold": price.gc = (await new Roll(`${tablePrice[0]}d${tablePrice[1]} ${tablePrice[2] || "+0"}`).roll()).total; break;
							};
							price.bp = Math.round((price.bp + (price.ss * 12) + (price.gc * 20 * 12)) * game.settings.get("wfrp4e-looting", "modifier"));
							let priceValue = price.bp;
							price.ss = 0;
							price.gc = 0;
							while (price.bp >= 12) {
								price.ss += 1;
								price.bp -= 12;
							};
							while (price.ss >= 20) {
								price.gc += 1;
								price.ss -= 20;
							};
							if (this.debug) {
								console.debug(...debugMessage, "WFRP4eLootingLoot looting items", key, "count:", i, "item:", a, "\"price\"");
								console.debug(price);
							};
							let id;
							if (item[a].type == "document") {id = item[a].documentUuid.replace("Item.", "")}
							else if (item[a].name == game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name")) {id = "other"};
							tableItems.push({item: item[a].name, price: price, priceValue, id, tableName: table.name});
						};
					} else if (preset.tables[key].table?.id) {
						let item = game.items.get(preset.tables[key].table.id.replace("Item.", ""));
						if (this.debug) {
							console.debug(...debugMessage, "WFRP4eLootingLoot looting items", key, "count:", i, "\"item\"");
							console.debug(item);
						};
						let price = {bp: item.price.bp, ss: item.price.ss, gc: item.price.gc};
						if (this.debug) {
							console.debug(...debugMessage, "WFRP4eLootingLoot looting items", key, "count:", i, "item:", item, "\"price\"");
							console.debug(price);
						};
						let priceValue = price.bp + (price.ss * 12) + (price.gc * 20 * 12);
						tableItems.push({item: item.name, price: price, priceValue, id: item.id});
					} else {
						let table = game.wfrp4e.looting.data.lootTables.find(t => t.table == preset.tables[key].table);
						let item = [];
						table.values.forEach(t => item = item.concat(Array(t.weight).fill(t.name)));
						item = item[Math.floor(Math.random() * table.weights)];
						if (this.debug) {
							console.debug(...debugMessage, "WFRP4eLootingLoot looting items", key, "count:", i, "\"item\"");
							console.debug(item);
						};
						let price = {bp: 0, ss: 0, gc: 0};
						if (preset.tables[key]?.price) {
							price.bp = preset.tables[key]?.price;
						} else {
							switch (preset.type) {
								case "brass": price.bp = (await new Roll(`${table.price?.count || preset || 0}d${table.price?.type || 0} ${table.price?.mod || "+0"}`).roll()).total; break;
								case "silver": price.ss = (await new Roll(`${table.price?.count || 0}d${table.price?.type || 0} ${table.price?.mod || "+0"}`).roll()).total; break;
								case "gold": price.gc = (await new Roll(`${table.price?.count || 0}d${table.price?.type || 0} ${table.price?.mod || "+0"}`).roll()).total; break;
							};
							price.bp = Math.round((price.bp + (price.ss * 12) + (price.gc * 20 * 12)) * game.settings.get("wfrp4e-looting", "modifier"));
						};
						let priceValue = price.bp;
						price.ss = 0;
						price.gc = 0;
						while (price.bp >= 12) {
							price.ss += 1;
							price.bp -= 12;
						};
						while (price.ss >= 20) {
							price.gc += 1;
							price.ss -= 20;
						};
						if (this.debug) {
							console.debug(...debugMessage, "WFRP4eLootingLoot looting items", key, "count:", i, "item:", item, "\"price\"");
							console.debug(price);
						};
						let id = await game.wfrp4e.utility.findBaseName(item) || false;
						if (item == game.i18n.localize("WFRP4E.Looting.Loot.Lists.Tables.List.OtherTrapping.Name")) {id = "other"};
						tableItems.push({item: item, price: price, priceValue, id, table: table.title});
					};
				};
			};
			items = items.concat(tableItems.sort((a, b) => a.item.localeCompare(b.item)));
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLoot looting \"items\"");
				console.debug(items);
			};
		};
		let params = {
			flavor: game.i18n.localize("WFRP4E.Looting.Name") + " (" + preset.name + ")",
			user: game.user.character?.name || "",
			status: {
				money: (money.priceValue == 0) ? false : true,
				items: items.length ? true : false,
				value: false
			},
			price: {bp: 0, ss: 0, gc: 0},
			type: preset.type
		};
		for (let key in items) {
			params.price.bp += parseInt(items[key].price.bp);
			params.price.ss += parseInt(items[key].price.ss);
			params.price.gc += parseInt(items[key].price.gc);
		};
		params.price.bp = params.price.bp + (params.price.ss * 12) + (params.price.gc * 20 * 12);
		params.priceValue = params.price.bp;
		params.price.ss = 0;
		params.price.gc = 0;
		while (params.price.bp >= 12) {
			params.price.ss += 1;
			params.price.bp -= 12;
		};
		while (params.price.ss >= 20) {
			params.price.gc += 1;
			params.price.ss -= 20;
		};
		if (params.status.money || params.status.items) {params.status.value = true};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot looting \"params\"");
			console.debug(params);
		};
		//Вывод сообщения в чат
		let chatData = {
			user: game.user.id,
			content: await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-looting/templates/loot/chat.hbs", {money, items, params}),
			flavor: params.flavor
		};
		let message = await ChatMessage.create(ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode")));
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot looting \"message\"");
			console.debug(message);
		};
	};

    close() {
        super.close();
        this.options.resolve();
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
            title: "WFRP4E.Looting.Generator.Preset.Title",
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
            template: "templates/generic/form-footer.hbs"
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
				if (option.dataset.type && option.dataset?.type != this.type) {
					option.selected = false;
					Array.from(e).find(o => o.dataset.type == this.type && o.textContent == option.textContent).selected = true;
				};
				e.dataset.tooltip = option.dataset.tooltip?.replace(/(color: var\(--brass\)|color: var\(--silver\)|color: var\(--gold\))/, `color: var(--${this.type})`);
			});
		});
		//Обновление содержания подсказки таблиц
		this.element.querySelectorAll("select#table").forEach(e => {
			e.dataset.tooltip = e.querySelector("option:checked").dataset.tooltip?.replace(/(color: var\(--brass\)|color: var\(--silver\)|color: var\(--gold\))/, `color: var(--${this.type})`);
			this.updateTable(e);
		});
		//Динамическая процентная шкала
		this.element.querySelectorAll("input#BP-chance, input#SS-chance, input#GC-chance, input#chance").forEach(e => {this.updateChances(e)});
		//Обработка пользовательских таблиц
		this.element.querySelectorAll("div.table").forEach(e => {
			let table = game.wfrp4e.tables.findTable(e.querySelector("input#tableKey").value || "", e.querySelector("input#tableColumn").value || "");
			if (table.id) {
				let tablePrice = $(table.description).filter("p#tablePrice")[0]?.textContent?.split("|") || [1, 1, "+0"];
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
					console.debug(...debugMessage, "WFRP4eLootingLootPreset _onRender div.table \"tablePrice\"");
					console.debug(tablePrice);
					console.debug(...debugMessage, "WFRP4eLootingLootPreset _onRender div.table \"tooltip\"");
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
					item.price.bp ? "<span style='color: var(--brass);'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</span>" : false,
					item.price.ss ? "<span style='color: var(--silver);'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</span>" : false,
					item.price.gc ? "<span style='color: var(--gold);'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</span>" : false
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
			icon: "<i class='fas fa-save'></i>",
			action: this.presetType == "custom" ? "save" : "close",
			default: true,
			label: this.presetType == "custom" ? game.i18n.localize("Save") : game.i18n.localize("Close")
		}];
		//Кнопка удаления для пользовательских шаблонов
		if (this.presetType == "custom") {
			context.buttons.unshift({
				action: "delete",
				icon: "<i class='fas fa-trash'></i>",
				label: game.i18n.localize("Delete")
			});
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _prepareContext \"context\"");
			console.debug(context);
		};
        return context;
    };

    static async create(preset, presetType, menu, options={}) {
		this.debug = game.settings.get("wfrp4e-looting", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset create");
		};
		//Определение названия шапки шаблона в соответствии с типом
		let title = (presetType == "custom" ? game.i18n.localize("WFRP4E.Looting.Loot.Preset.Title") : game.i18n.localize("WFRP4E.Looting.Loot.Preset.Default")) + (game.settings.get("wfrp4e-looting", "debug") ? " [ID: " + preset.id + "]" : "");
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
					chance: this.element.querySelector("#BP-chance").value,
					dice: {count: this.element.querySelector("#BP-diceCount").value, type: Number(this.element.querySelector("#BP-diceType").value)}
				},
				ss: {
					chance: this.element.querySelector("#SS-chance").value,
					dice: {count: this.element.querySelector("#SS-diceCount").value, type: Number(this.element.querySelector("#SS-diceType").value)}
				},
				gc: {
					chance: this.element.querySelector("#GC-chance").value,
					dice: {count: this.element.querySelector("#GC-diceCount").value, type: Number(this.element.querySelector("#GC-diceType").value)}
				}
			},
			tables: Array.from(this.element.querySelectorAll("#tables > li")).map(t => ({
				table:
					t.querySelector("#table") ? t.querySelector("#table").value :
					t.querySelector("#tableID") ? {id: t.querySelector("#tableID").value} :
					{key: t.querySelector("#tableKey").value, column: t.querySelector("#tableColumn").value},
				chance: t.querySelector("#chance").value,
				dice: {count: t.querySelector("#diceCount").value, type: Number(t.querySelector("#diceType").value)}
			}))
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingLootPreset _onSave \"this.preset\"");
			console.debug(this.preset);
		};
		await game.settings.set("wfrp4e-looting", "customLooting", game.settings.get("wfrp4e-looting", "customLooting").map(p => p.id == this.preset.id ? this.preset : p));
		ui.notifications.notify(game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Save"));
		//Обновление кнопки шаблона, если окно открыто
		if (this.menu.element) {
			let button = this.menu.element.querySelector(`button[data-id="${this.preset.id}"]`);
			button.classList.value = this.preset.type;
			button.dataset.tooltip = `${this.preset.hint}<hr>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Loot.Dialog.Hint.Ctrl")}`;
			button.textContent = this.preset.name + (this.debug ? " [" + this.preset.id + "]" : "");
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLootPreset _onSave menu \"button\"");
				console.debug(button);
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
		//Удаление кнопки шаблона, если окно открыто
		if (this.menu.element) {
			this.menu.element.querySelector(`button[data-id="${this.preset.id}"]`).remove();
			this.menu.updateParams();
		};
        this.close();
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
				console.debug(...debugMessage, "WFRP4eLootingLootPreset updateCustomTable \"parent\"");
				console.debug(parent);
				console.debug(...debugMessage, "WFRP4eLootingLootPreset updateCustomTable \"table\"");
				console.debug(table);
			};
			if (table.id) {
				`<hr>{{localize 'WFRP4E.Looting.Loot.Preset.Dialog.Table.Values'}} ({{this.weights}}):<ul>{{#each this.values}}<li>{{this.name}} ({{this.weight}})</li>{{/each}}</ul>`
				let tablePrice = $(table.description).filter("p#tablePrice")[0];
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
						console.debug(...debugMessage, "WFRP4eLootingLootPreset updateCustomTable \"tablePrice\"");
						console.debug(tablePrice);
						console.debug(...debugMessage, "WFRP4eLootingLootPreset updateCustomTable \"tooltip\"");
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
			let item = game.items.get(e.target.value.replace("Item.", "")) || false;
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingLootPreset updateItem \"item\"");
				console.debug(item);
			};
			if (item) {
				e.target.dataset.tooltip = "<div class='WFRP4eLooting-tooltip'>" + game.i18n.localize("DOCUMENT.Item") + ": \"" + item.name + "\"<hr>" + game.i18n.localize("Cost") + ": <span>" + ([
					item.price.bp ? "<span style='color: var(--brass);'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</span>" : false,
					item.price.ss ? "<span style='color: var(--silver);'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</span>" : false,
					item.price.gc ? "<span style='color: var(--gold);'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</span>" : false
				].filter(Boolean).join(" ") || 0) + "</div>";
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingLootPreset updateItem \"tooltip\"");
					console.debug(e.target.dataset.tooltip);
				};
			} else {e.target.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Loot.Preset.Dialog.Table.AddItem.Missing")};
		});
	};

	static _onClose() {this.close()};

    close() {
        super.close();
        this.options.resolve();
    };
};
warhammer.apps.WFRP4eLootingLootPreset = WFRP4eLootingLootPreset;

Hooks.on("renderChatMessage", (message, html, data) => {
	if (html[0].querySelector("div#WFRP4eLooting-chat")) {
		let debug = game.settings.get("wfrp4e-looting", "debug");
		//Получить монеты
		function takeMoney(item, actor, alt) {
			let money = {
				bp: item.bp,
				ss: item.ss,
				gc: item.gc
			};
			//Перевод значение в текстовую строку
			let value = money.bp + game.i18n.localize('MARKET.Abbrev.BP') + money.ss + game.i18n.localize('MARKET.Abbrev.SS') + money.gc + game.i18n.localize('MARKET.Abbrev.GC');
			if (debug) {
				console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage takeMoney \"value\"");
				console.debug(value);
			};
			//Если имеется актёр, деньги добавляются ему в инвентарь
			if (actor && !alt) {
				money = game.wfrp4e.market.creditCommand(game.wfrp4e.market.amountToString(game.wfrp4e.market.parseMoneyTransactionString(value)), actor);
				if (money) {actor.updateEmbeddedDocuments("Item", money)}
				else {return true};
			//Если актёра нет, создаётся текстовое сообщение
			} else {CreditMessageModel.createCreditMessage(value, "", {reason: item.name})};
		};
		async function takeItem(item, actor, alt) {
			if (typeof item.value === "object") {
				item.value = item.value.toObject();
				item.value.system.price = {
					bp: item.price.bp,
					ss: item.price.ss,
					gc: item.price.gc
				};
				item.value = new ItemWFRP4e(item.value);
			} else {
				item.value = new ItemWFRP4e({
					name: item.value,
					type: "trapping",
					img: "modules/wfrp4e-core/icons/equipment/trapping.png",
					system: {
						price: {
							bp: item.price.bp,
							ss: item.price.ss,
							gc: item.price.gc
						},
						trappingType: {
							value: "misc"
						}
					}
				});
			};
			if (debug) {
				console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage takeItem \"item.value\"");
				console.debug(item.value);
			};
			if (actor && !alt) {
				actor.createEmbeddedDocuments("Item", [item.value]);
				item.price.text = ""
					+ (item.price.bp ? "<b style='margin: 0 1px;'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</b>" : "")
					+ (item.price.ss ? "<b style='margin: 0 1px;'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</b>" : "")
					+ (item.price.gc ? "<b style='margin: 0 1px;'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</b>" : "");
				ChatMessage.create(ChatMessage.applyRollMode(
					{
						user: game.user.id,
						content: `<p style="text-align: center;font-size: 14px;"><b>${actor.link}</b> ${game.i18n.localize("WFRP4E.Looting.Loot.Chat.Get")} <b data-tooltip="<i class='fas fa-coins'></i> ${item.price.text}">"${item.value.name}"</b>.</p>`,
						flavor: html[0].querySelector("div#WFRP4eLooting-chat").closest(".chat-message.message").querySelector(".flavor-text")?.textContent || game.i18n.localize("WFRP4E.Looting.Name")
					},
					game.settings.get("core", "rollMode")
				));
			} else {item.value.postItem(1)};
		};
		function complete() {
			if (game.dice3d && game.settings.get("wfrp4e", "throwMoney")) {
				let type = html[0].querySelector("div#WFRP4eLooting-chat").dataset.type;
				new Roll(`${type == "brass" ? 3 : type == "silver" ? 10 : 25}dc`).evaluate({allowInteractive: false}).then((roll) => {
					game.dice3d.showForRoll(roll, game.user, true);
				});
			};
			socket.executeForOthers("wfrp4e-looting:editHTML", message.id, html[0].querySelector("div#WFRP4eLooting-chat").innerHTML);
			socket.executeAsGM("wfrp4e-looting:editMessage", message.id, html[0].querySelector("div#WFRP4eLooting-chat").outerHTML);
		};
		let actor = game.user.character || false;
		if (debug) {
			console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage item \"actor\"");
			console.debug(actor);
		};
		//Отдельные предметы
		html[0].querySelector(".message-content").querySelectorAll("li[data-type='item'] a").forEach(button => {
			button.addEventListener("click", async (element) => {
				let elements = {
					a: element.target.closest("a"),
					li: element.target.closest("li"),
					ul: element.target.closest("ul"),
					p: element.target.closest("ul").previousElementSibling
				};
				if (debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage item \"elements\"");
					console.debug(elements);
				};
				let item = {
					price: {
						bp: parseInt(elements.li.dataset.pricevalue),
						ss: 0,
						gc: 0,
						priceValue: parseInt(elements.li.dataset.pricevalue),
					}
				};
				while (item.price.bp >= 12) {item.price.ss += 1; item.price.bp -= 12};
				while (item.price.ss >= 20) {item.price.gc += 1; item.price.ss -= 20};
				if (debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage \"item\"");
					console.debug(item);
				};
				let price = {
					bp: parseInt(elements.p.dataset.pricevalue) - item.price.priceValue,
					ss: 0,
					gc: 0,
					priceValue: parseInt(elements.p.dataset.pricevalue) - item.price.priceValue,
				};
				if (debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage item \"price\"");
					console.debug(price);
				};
				if (elements.a.hasAttribute("data-money")) {
					if (!game.settings.get("wfrp4e-looting", "sellItems")) {
						ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Settings.sellItems.Error"));
						return;
					};
					item = {
						price: {
							bp: parseInt(elements.li.dataset.pricevalue) * (game.settings.get("wfrp4e-looting", "itemsModifier") ? 0.5 : 1),
							ss: 0,
							gc: 0,
							priceValue: parseInt(elements.li.dataset.pricevalue) * (game.settings.get("wfrp4e-looting", "itemsModifier") ? 0.5 : 1),
						}
					};
					while (item.price.bp >= 12) {item.price.ss += 1; item.price.bp -= 12};
					while (item.price.ss >= 20) {item.price.gc += 1; item.price.ss -= 20};
					if (debug) {
						console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage item sell \"item\"");
						console.debug(item);
					};
					if (takeMoney(item.price, actor, element.altKey)) {return};
				} else if (elements.li.hasAttribute("data-item")) {
					if (elements.li.dataset.item == "other") {
						let choice = await ItemDialog.create(game.wfrp4e.looting.data.lootTables.filter(t => t.table.includes("Other-")).map((t, index) => (Object.assign(t, {name: t.title, value: t.table, id: index}))), 1, {text: game.i18n.localize("WFRP4E.Looting.Loot.Chat.Other"), title: game.i18n.localize("CONTROLS.CommonSelect"), defaultValue: "0"});
						if (choice.length) {
							let table = game.wfrp4e.looting.data.lootTables.filter(t => t.table.includes("Other-")).find(t => t.table == choice[0].value);
							if (debug) {
								console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage item get \"table\"");
								console.debug(table);
							};
							let newItem = [];
							table.values.forEach(t => newItem = newItem.concat(Array(t.weight).fill(t.name)));
							newItem = newItem[Math.floor(Math.random() * table.weights)]
							item.value = await game.wfrp4e.utility.findBaseName(newItem) || newItem;
						};
					} else {
						item.value = game.items.get(elements.li.dataset?.id) || await game.wfrp4e.utility.findBaseName(elements.a.textContent) || elements.a.textContent;
					};
					if (debug) {
						console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage item get \"item\"");
						console.debug(item);
					};
					takeItem(item, actor, element.altKey);
				};
				//Изменение самого сообщения
				if (elements.ul.children.length == 1) {
					elements.p.remove();
					elements.ul.remove();
				} else {
					while (price.bp >= 12) {price.ss += 1; price.bp -= 12};
					while (price.ss >= 20) {price.gc += 1; price.ss -= 20};
					price.text = ""
						+ (price.bp ? "<b style='margin: 0 1px;'>" + price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</b>" : "")
						+ (price.ss ? "<b style='margin: 0 1px;'>" + price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</b>" : "")
						+ (price.gc ? "<b style='margin: 0 1px;'>" + price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</b>" : "");
					elements.p.dataset.pricevalue = price.priceValue;
					elements.p.querySelector("a[data-money]").innerHTML = `<i class="fas fa-coins"></i>${price.text}`;
					elements.li.remove();
				};
				if (debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage item complete \"elements\"");
					console.debug(elements);
				};
				complete();
			});
		});
		//Все предметы
		html[0].querySelector(".message-content").querySelectorAll("p[data-type='items'] a").forEach(button => {
			button.addEventListener("click", async (element) => {
				let elements = {
					a: element.target.closest("a"),
					ul: element.target.closest("p[data-type='items']").nextElementSibling,
					p: element.target.closest("p[data-type='items']")
				};
				if (debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage allItems \"elements\"");
					console.debug(elements);
				};
				let item = {};
				//При продаже
				if (elements.a.hasAttribute("data-money")) {
					if (!game.settings.get("wfrp4e-looting", "sellItems")) {
						ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Settings.sellItems.Error"));
						return;
					};
					item = {
						price: {
							bp: Math.floor(parseInt(elements.p.dataset.pricevalue) * (game.settings.get("wfrp4e-looting", "itemsModifier") ? 0.5 : 1)),
							ss: 0,
							gc: 0
						}
					};
					while (item.price.bp >= 12) {item.price.ss += 1; item.price.bp -= 12};
					while (item.price.ss >= 20) {item.price.gc += 1; item.price.ss -= 20};
					if (debug) {
						console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage allItems sell \"item\"");
						console.debug(item);
					};
					if(takeMoney(item.price, actor, element.altKey)) {return};
				//При забирании
				} else if (elements.a.hasAttribute("data-item")) {
					for (let e of elements.ul.children) {
						item = {
							price: {
								bp: parseInt(e.dataset.pricevalue),
								ss: 0,
								gc: 0,
								priceValue: parseInt(e.dataset.pricevalue),
							}
						};
						while (item.price.bp >= 12) {item.price.ss += 1; item.price.bp -= 12};
						while (item.price.ss >= 20) {item.price.gc += 1; item.price.ss -= 20};
						if (e.dataset.item == "other") {
							let choice = await ItemDialog.create(game.wfrp4e.looting.data.lootTables.filter(t => t.table.includes("Other-")).map((t, index) => (Object.assign(t, {name: t.title, value: t.table, id: index}))), 1, {text: game.i18n.localize("WFRP4E.Looting.Loot.Chat.Other"), title: game.i18n.localize("CONTROLS.CommonSelect"), defaultValue: "0"});
							if (choice.length) {
								let table = game.wfrp4e.looting.data.lootTables.filter(t => t.table.includes("Other-")).find(t => t.table == choice[0].value);
								if (debug) {
									console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage allItems get other \"table\"");
									console.debug(table);
								};
								let newItem = [];
								table.values.forEach(t => newItem = newItem.concat(Array(t.weight).fill(t.name)));
								newItem = newItem[Math.floor(Math.random() * table.weights)]
								item.value = await game.wfrp4e.utility.findBaseName(newItem) || newItem;
							};
						} else {
							item.value = game.items.get(e.dataset?.id) || await game.wfrp4e.utility.findBaseName(e.querySelector("a").textContent) || e.querySelector("a").textContent;
						};
						if (debug) {
							console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage allItems get \"item\"");
							console.debug(item);
						};
						takeItem(item, actor, element.altKey);
					};
				};
				elements.ul.remove();
				elements.p.remove();
				complete();
			});
		});
		//Все монеты
		html[0].querySelector(".message-content").querySelectorAll("p[data-type='money'] a").forEach(button => {
			button.addEventListener("click", async (element) => {
				let elements = {
					p: element.target.closest("p")
				};
				if (debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage allMoney \"elements\"");
					console.debug(elements);
				};
				let item = {
					price: {
						bp: parseInt(elements.p.dataset.pricevalue),
						ss: 0,
						gc: 0
					}
				};
				while (item.price.bp >= 12) {item.price.ss += 1; item.price.bp -= 12};
				while (item.price.ss >= 20) {item.price.gc += 1; item.price.ss -= 20};
				if (debug) {
					console.debug(...debugMessage, "WFRP4eLootingLoot chatMessage allMoney \"item\"");
					console.debug(item);
				};
				if (takeMoney(item.price, actor, element.altKey)) {return};
				elements.p.remove();
				complete();
			});
		});
	};
});

Hooks.on("getSceneControlButtons", (buttons) => {
	buttons.notes.tools.WFRP4eLootingLoot = {
		name: "WFRP4eLootingLoot",
		title: game.i18n.localize("WFRP4E.Looting.Loot.Title"),
		icon: "fas fa-treasure-chest",
		button: true,
		onChange: () => {warhammer.apps.WFRP4eLootingLoot.create()}
	};
});

class WFRP4eLootingGenerator extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        classes: ["WFRP4eLooting-generator", "WFRP4eLooting", "warhammer"],
        form: {
            submitOnChange: false,
            closeOnSubmit: false
        },
        window: {
            resizable: true,
            title: "WFRP4E.Looting.Generator.Title"
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
			this.type = e.target.value;
			let type = this.type;
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
		this.element.querySelectorAll("div.presets > label > input").forEach(i => {i.addEventListener("change", () => {this.updateProps()})});
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
		this.debug = game.settings.get("wfrp4e-looting", "debug");
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
			{value: "armour", type: "armour", name: game.i18n.localize("Armour")},
			{value: "basic", type: "melee", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Basic")},
			{value: "cavalry", type: "melee", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Cavalry")},
			{value: "fencing", type: "melee", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Fencing")},
			{value: "brawling", type: "melee", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Brawling")},
			{value: "flail", type: "melee", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Flail")},
			{value: "parry", type: "melee", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Parry")},
			{value: "polearm", type: "melee", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Polearm")},
			{value: "twohanded", type: "melee", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.TwoHanded")},
			{value: "blackpowder", type: "range", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Blackpowder")},
			{value: "bow", type: "range", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Bow")},
			{value: "crossbow", type: "range", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Crossbow")},
			{value: "entangling", type: "range", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Entangling")},
			{value: "engineering", type: "range", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Engineering")},
			{value: "explosives", type: "range", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Explosives")},
			{value: "sling", type: "range", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Sling")},
			{value: "throwing", type: "range", name: game.i18n.localize("Weapon") + ": " + game.i18n.localize("SPEC.Throwing")},
			{value: "ammunition", type: "range", name: game.i18n.localize("Ammunition")}
		];
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
			a.group = "armour";
			return a;
		});
		//Предметы
		params.items = trappings.concat(weapons, armours);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"trappings\"");
			console.debug(trappings);
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"weapons\"");
			console.debug(weapons);
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"armours\"");
			console.debug(armours);
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"params.items\"");
			console.debug(params.items);
		};
		//Шаблоны
		params.presets = game.wfrp4e.looting.data.generator.presets.all;
		//Скрипты
		params.scripts = game.wfrp4e.looting.data.generator.effects.all;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"params.presets\"");
			console.debug(params.presets);
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"params.scripts\"");
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
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"params.qualities\"");
			console.debug(params.qualities);
			console.debug(...debugMessage, "WFRP4eLootingGenerator create \"params.flaws\"");
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
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onClickPreset \"type\"");
			console.debug(type);
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onClickPreset \"id\"");
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
				id = "custom-" + getID(game.settings.get("wfrp4e-looting", "customGenerator").map(i => i.id.replace("custom-", "")));
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
				id = "custom-" + getID(game.settings.get("wfrp4e-looting", "customGenerator").map(i => i.id.replace("custom-", "")));
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
	 * @param {*} event PointerEvent при нажатии на кнопку. Оставьте пустым
	 * @param {*} html html element кнопки создания. Оставьте пустым
	 * @param {*} item UUID предмета, который будет создан при помощи генератора
	 * @param {*} presets Массив id's шаблонов, используемых при создании
	 */
	static async onCreate(event, html, item, presets=[]) {
		//Определение предмета по UUID
		if (item) {item = await fromUuid(item)}
		//Если item пуст, но есть диалоговое окно, определяется предмет в соответствии с выбранным в окне
		else if (this.element) {item = this.item}
		else {
			console.error(game.i18n.localize("WFRP4E.Looting.Generator.Error.ItemNotFound"));
			return;
		};
		//Если шаблоны не заданы
		if (!presets.length) {
			//Но есть диалоговое окно, определяется шаблоны в соответствии с выбранными в окне
			if (this.element) {presets = Array.from(this.element.querySelectorAll("div.presets > label:has(> input:checked)")).map(p => p.dataset.id)}
			else {
				console.error(game.i18n.localize("WFRP4E.Looting.Generator.Error."));
				return;
			};
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"item\"");
			console.debug(item);
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"presets\"");
			console.debug(presets);
		};
		let names = {a: [""], b: [""], c: [""]};
		let notification = {
			qualities: {
				true: [],
				false: []
			},
			flaws: {
				true: [],
				false: []
			},
			scripts: []
		};
		let scripts = [];
		let props = {
			qualities: [],
			flaws: []
		};
		//Перечисление шаблонов
		for (let i = 0; i < presets.length; i++) {
			//Нахождение шаблона
			let preset = game.wfrp4e.looting.data.generator.presets.all.find(p => p.id == presets[i]);
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate presets.forEach \"preset\"");
				console.debug(preset);
			};
			//Добавление скриптов шаблона
			scripts = scripts.concat(preset.scripts || []);
			//Броски на определение свойств предмета
			let getProperties = async (p, type) => {
				for (let a = 0; a < p.quantity; a++) {
					if (this.debug) {
						console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate presets.forEach preset \"p\"");
						console.debug(p);
					};
					if ((await new Roll("1d100").roll()).total <= p.chance) {
						let prop;
						//Если базовое свойство
						if (Object.assign({}, game.wfrp4e.utility.qualityList(), game.wfrp4e.utility.flawList())[p.name]) {
							prop = p.name;
						//Если категория
						} else {
							let getRandomArrayElement = (array) => {return array[Math.floor( (Math.random() * array.length) )]};
							let props = game.wfrp4e.looting.data.generator.props[type];
							switch (p.name) {
								case "any": {
									prop = getRandomArrayElement(props.any);
									break;
								};
								case "trapping": {
									prop = getRandomArrayElement(props.trapping);
									break;
								};
								case "type": {
									prop = getRandomArrayElement(props[this.type]);
									break;
								};
								case "melee": {
									prop = getRandomArrayElement(props.melee);
									break;
								};
								case "range": {
									prop = getRandomArrayElement(props.range);
									break;
								};
								case "armour": {
									prop = getRandomArrayElement(props.armour);
									break;
								};
							};
						};
						if (this.debug) {
							console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate presets.forEach preset p \"prop\"");
							console.debug(prop);
						};
						//Добавление свойства к результату
						props[type] = props[type].concat(prop);
					};
				};
			};
			for (let a = 0; a < preset.qualities.length; a++) {await getProperties(preset.qualities[a], "qualities")};
			for (let a = 0; a < preset.flaws.length; a++) {await getProperties(preset.flaws[a], "flaws")};
			//Добавление случайных имён к массиву случайных имён
			names.a = names.a.concat(preset.names?.a);
			names.b = names.b.concat(preset.names?.b);
			names.c = names.c.concat(preset.names?.c);
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
					if (propsCompatibility.find(p => p.prop == q)) {filter = propsCompatibility.find(p => p.prop == q).filter}
					else {
						filter = await foundry.applications.api.DialogV2.prompt({
							window: {title: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Compatibility.Title")},
							content: game.i18n.format("WFRP4E.Looting.Generator.Dialog.Props.Compatibility.Content", {q: game.wfrp4e.looting.data.generator.names[q], f: game.wfrp4e.looting.data.generator.names[f]}),
							buttons: [
								{
									action: "ok",
									default: true,
									label: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Compatibility.False"),
									callback: () => {return false}
								},
								{
									action: "true",
									label: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.Props.Compatibility.True"),
									callback: () => {return true}
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
						propsCompatibility.push({prop: q, filter: filter});
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
		//Проверка на совместимость по достоинствам
		for (let a = 0; a < props.qualities.length; a++) {
			let q = props.qualities[a];
			switch (q) {
				case "fine": {
					a = await check (q, "ugly", a);
					break;
				};
				case "lightweight": {
					a = await check (q, "bulky", a);
					break;
				};
				case "practical": {
					a = await check (q, "unreliable", a);
					break;
				};
				case "durable": {
					a = await check (q, "shoddy", a);
					break;
				};
				case "fast": {
					a = await check (q, "slow", a);
					break;
				};
				case "precise": {
					a = await check (q, "imprecise", a);
					break;
				};
				case "damaging": {
					a = await check (q, "undamaging", a);
					break;
				};
				case "impact": {
					a = await check (q, "undamaging", a);
					break;
				};
				case "defensive": {
					a = await check (q, "unbalanced", a);
					break;
				};
			};
		};
		//Установка стоимости предмета в зависимости он новых достоинств и изъянов
		let price = {gc: 0, ss: 0, bp: item.system.price.bp + (item.system.price.ss * 12) + (item.system.price.gc * 20 * 12)};
		["qualities", "flaws"].forEach(type => {
			props[type].forEach(p => {
				if (game.wfrp4e.config.propertyHasValue[p]) {
					if (item.system[type].value.find(ip => ip.name == p)) {
						item.system[type].value.find(ip => ip.name == p).value += 1;
					} else {
						item.system[type].value.push({name: p, value: 1});
					};
				} else {
					item.system[type].value.push({name: p});
				};
				if (type == "qualities") {price.bp *= 2}
				else {price.bp = Math.round(price.bp / 2)};
			});
		});
		while (price.bp >= 12) {
			price.ss += 1;
			price.bp -= 12;
		};
		while (price.ss >= 20) {
			price.gc += 1;
			price.ss -= 20;
		};
		item.system.price = price;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"price\"");
			console.debug(price);
		};
		//Совмещение дублей свойств. Применяется для добавляемых свойств, имеющих количество, и для исключённых свойств
		let merge = (array, count) => {
			return Object.entries(array.reduce((obj, p) => {
				if (game.wfrp4e.config.propertyHasValue[p] || count) {
					obj[p] = (obj[p] || 0) + 1;
				} else {
					obj[p] = 1;
				};
				return obj;
			}, {})).map(([key, value]) => game.wfrp4e.looting.data.generator.names[key] + (value > 1 ? " (" + value + ")" : ""));
		};
		notification.qualities.true = merge(props.qualities, false);
		notification.flaws.true = merge(props.flaws, false);
		notification.qualities.false = merge(notification.qualities.false, true);
		notification.flaws.false = merge(notification.flaws.false, true);
		notification.false = notification.qualities.false.reduce((arr, p, i) => {
			arr.push(p, notification.flaws.false[i]);
			return arr;
		}, []);
		//Определение имени
		let newNames = {};
		newNames.a = names.a[Math.floor( (Math.random() * names.a.length) )];
		newNames.b = names.b[Math.floor( (Math.random() * names.b.length) )];
		newNames.c = names.c.concat([newNames.a, item.name, newNames.b].filter(Boolean).join(" ")).filter(Boolean);
		newNames.c = newNames.c[Math.floor( (Math.random() * newNames.c.length) )];
		let originalName = item.name;
		item.name = newNames.c;
		let result;
		if (game.settings.get("wfrp4e-looting", "editName")) {
			result = await foundry.applications.api.DialogV2.prompt({
				window: {title: game.i18n.localize("WFRP4E.Looting.Generator.Dialog.EditName")},
				content: `<div style="display: flex ; gap: 5px; padding: 3px;"><input name="name" type="text" value="${item.name}" autofocus><a style="height: auto;" class="button" data-action="rerollName"><i class="fas fa-refresh"></i></a></div>`,
				ok: {
					label: game.i18n.localize("Submit"),
					callback: (event, button, dialog) => {item.name = button.form.elements.name.value}
				},
				render: (event, dialog) => {
					//Обновление имени по заданным шаблонам
					dialog.element.querySelector("[data-action='rerollName']").addEventListener("click", (element) => {
						item.name = originalName;
						newNames = {};
						newNames.a = names.a[Math.floor( (Math.random() * names.a.length) )];
						newNames.b = names.b[Math.floor( (Math.random() * names.b.length) )];
						newNames.c = names.c.concat([newNames.a, item.name, newNames.b].filter(Boolean).join(" ")).filter(Boolean);
						newNames.c = newNames.c[Math.floor( (Math.random() * newNames.c.length) )];
						element.target.closest("div").querySelector("input").value = newNames.c;
					});
				}
			});
			if (!result) {return};
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"item.name\"");
			console.debug(item.name);
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"scripts\"");
			console.debug(scripts);
		};
		//Определение скриптов по броскам
		let newScripts = [];
		for (let i = scripts.length - 1; i >= 0; i--) {
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate scripts.forEach \"scripts[i]\"");
				console.debug(scripts[i]);
			};
			if ((await new Roll("1d100").roll()).total <= scripts[i].chance) {
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
		//Уведомление по итогам генерации
		ui.notifications.notify([
			notification.qualities.true.length ? game.i18n.format("WFRP4E.Looting.Generator.Dialog.Create.Notification.Qualities", {qualities: notification.qualities.true.filter(Boolean).join(", ")}) : "",
			notification.flaws.true.length ? game.i18n.format("WFRP4E.Looting.Generator.Dialog.Create.Notification.Flaws", {flaws: notification.flaws.true.filter(Boolean).join(", ")}) : "",
			notification.scripts.length ? game.i18n.format("WFRP4E.Looting.Generator.Dialog.Create.Notification.Scripts", {scripts: notification.scripts.join(", ")}) : "",
			notification.false.length ? game.i18n.format("WFRP4E.Looting.Generator.Dialog.Create.Notification.False", {false: notification.false.filter(Boolean).join(", ")}) : ""
		].filter(Boolean).join("<br> "));
		//Создание предмета
		item = await Item.implementation.create((new ItemWFRP4e(item)), {renderSheet: true});
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator _onCreate \"item\"");
			console.debug(item);
		};
		//Добавление скриптов к созданному предмету
		this.constructor.addScripts(item.uuid, scripts);
	};

	/**
	 * Добавление скриптов генератора предметов предмету
	 * @param {*} item UUID предмета, которому добавляются скрипты
	 * @param {*} scripts Массив, содержащий ID добавляемых скриптов
	 */
	static async addScripts(item, scripts=[]) {
		//Определение предмета
		if (item) {item = await fromUuid(item)}
		else {
			console.error(game.i18n.localize("WFRP4E.Looting.Generator.Error.ItemNotFound"));
			return;
		};
		//Указание добавленных скриптов в свойства предмета
		await item.update({"flags.looting.scripts": scripts.map(s => s.id).concat(item.flags.looting?.scripts).filter(Boolean)});
		//Если скрипты не заданы
		if (!scripts.length) {return};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator addScripts \"item\"");
			console.debug(item);
			console.debug(...debugMessage, "WFRP4eLootingGenerator addScripts \"scripts\"");
			console.debug(scripts);
		};
		//Подготовка всех эффектов, принадлежащих выбранным скриптам
		scripts = scripts.map(s => game.wfrp4e.looting.data.generator.effects.all.find(e => e.id == s.id).effects).flat(1);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGenerator addScripts scripts \"effects\"");
			console.debug(scripts);
		};
		//Добавление базового скрипта проверки
		if (!item.effects.find(e => e.flags.looting.id == "onRemove")) {scripts.push(game.wfrp4e.looting.data.generator.effects.onRemove)};
		//Добавление скриптов, НЕ выполняющихся при добавлении к предмету
		await item.createEmbeddedDocuments("ActiveEffect", scripts.filter(e => e.system.transferData.documentType != "Item" || (e.system.transferData.documentType == "Item" && e.system.scriptData.find(s => s.trigger != "immediate"))), {broadcast: false});
		//Добавление скриптов, выполняющихся при добавлении к предмету
		await item.createEmbeddedDocuments("ActiveEffect", scripts.filter(e => e.system.transferData.documentType == "Item" && e.system.scriptData.find(s => s.trigger == "immediate")), {broadcast: false});
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
		//Отображание кнопки создания при существовании предмета (при выборе хотя бы одного шаблона)
		if (this.item) {this.element.querySelector("button[data-action='create']").hidden = false};
		//Обновление параметров предмета в соответствии с его типом
		element.querySelector("#base\\.money\\.gc").value = this.item?.system.price.gc || 0;
		element.querySelector("#base\\.money\\.ss").value = this.item?.system.price.ss || 0;
		element.querySelector("#base\\.money\\.bp").value = this.item?.system.price.bp || 0;
		element.querySelector("#base\\.encumbrance").value = this.item?.system.encumbrance.value || 0;
		element.querySelector("#base\\.availability").value = game.wfrp4e.config.availability[this.item?.system.availability.value || "None"];
		element.querySelector("#base\\.properties").value = this.item?.Qualities.concat(this.item?.Flaws).join(", ") || "";
		//Обновление параметров предмета для trapping
		if (element.querySelector("#base\\.type")) {element.querySelector("#base\\.type").value = game.wfrp4e.config.trappingTypes[this.item?.system.trappingType.value] || "-"};
		//Обновление параметров предмета для melee
		if (element.querySelector("#base\\.reach")) {element.querySelector("#base\\.reach").value = game.wfrp4e.config.weaponReaches[this.item?.system.reach.value] || "-"};
		if (element.querySelector("#base\\.damage")) {element.querySelector("#base\\.damage").value = this.item?.system.damage.value || ""};
		if (element.querySelector("#base\\.twohanded")) {this.item?.system.twohanded?.value ? element.querySelector("#base\\.twohanded").checked = true : element.querySelector("#base\\.twohanded").checked = false};
		//Обновление параметров предмета для range
		if (element.querySelector("#base\\.range")) {element.querySelector("#base\\.range").value = this.item?.system.range.value || 0};
		if (element.querySelector("#base\\.damage")) {element.querySelector("#base\\.damage").value = this.item?.system.damage.value || ""};
		if (element.querySelector("#base\\.twohanded")) {this.item?.system.twohanded?.value ? element.querySelector("#base\\.twohanded").checked = true : element.querySelector("#base\\.twohanded").checked = false};
		//Обновление параметров предмета для armour
		if (element.querySelector("#base\\.apHead")) {element.querySelector("#base\\.apHead").value = this.item?.system.AP.head || 0};
		if (element.querySelector("#base\\.apLArm")) {element.querySelector("#base\\.apLArm").value = this.item?.system.AP.lArm || 0};
		if (element.querySelector("#base\\.apRArm")) {element.querySelector("#base\\.apRArm").value = this.item?.system.AP.rArm || 0};
		if (element.querySelector("#base\\.apBody")) {element.querySelector("#base\\.apBody").value = this.item?.system.AP.body || 0};
		if (element.querySelector("#base\\.apLLeg")) {element.querySelector("#base\\.apLLeg").value = this.item?.system.AP.lLeg || 0};
		if (element.querySelector("#base\\.apRLeg")) {element.querySelector("#base\\.apRLeg").value = this.item?.system.AP.rLeg || 0};
		if (element.querySelector("#base\\.armorType")) {element.querySelector("#base\\.armorType").value = game.wfrp4e.config.armorTypesV2 ? game.wfrp4e.config.armorTypesV2[this.item?.system.armorType.value] || "" : game.wfrp4e.config.armorTypes[this.item?.system.armorType.value] || ""};
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
			console.debug(...debugMessage, "WFRP4eLootingGenerator updateProps \"props.qualities\"");
			console.debug(props.qualities);
			console.debug(...debugMessage, "WFRP4eLootingGenerator updateProps \"props.flaws\"");
			console.debug(props.flaws);
			console.debug(...debugMessage, "WFRP4eLootingGenerator updateProps \"props.scripts\"");
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
		preset.scripts.forEach(s => {
			let script = game.wfrp4e.looting.data.generator.effects.all.find(e => e.id == s.id);
			if (script) {
				s.name = script.name;
				s.hint = script.hint;
				s.default = script.default;
			};
		});
		let buttonPreset = this.element.querySelector(`label[data-type="custom"][data-id="${preset.id}"]`);
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

    close() {
        super.close();
        this.options.resolve();
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
            template: "templates/generic/form-footer.hbs"
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
			if (this.type != "default") {e.addEventListener("contextmenu", (a) => {a.target.remove()})};
		});
		//Добавление кнопок для изменение шаблона
		this.element.querySelectorAll("a.button[data-action=\"addProp\"]").forEach(b => {b.addEventListener("click", (e) => {this.addProp(b)})});
		this.element.querySelectorAll("a.button[data-action=\"removeProp\"]").forEach(b => {b.addEventListener("click", (e) => {this.removeProp(b)})});
		this.element.querySelectorAll("a.button[data-action=\"addName\"]").forEach(b => {b.addEventListener("click", (e) => {this.addName(b)})});
		this.element.querySelectorAll("a.button[data-action=\"removeName\"]").forEach(b => {b.addEventListener("click", (e) => {this.removeName(b)})});
		this.element.querySelectorAll("a.button[data-action=\"addScript\"]").forEach(b => {b.addEventListener("click", (e) => {this.addScript(b)})});
		//Отображение редактора скриптов
		this.element.querySelectorAll("a.button[data-action=\"scriptsEditor\"]").forEach(b => {b.addEventListener("click", async (e) => {(await fromUuid(game.settings.get("wfrp4e-looting", "effectsItem"))).sheet.render(true)})});
	};

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
		context.preset = this.preset;
		context.type = this.type;
		context.params = this.params;
		context.debug = this.debug;
		//Кнопка сохранения или закрытия окна
		context.buttons = [{
			icon: "<i class='fas fa-save'></i>",
			action: this.type == "custom" ? "save" : "close",
			default: true,
			label: this.type == "custom" ? game.i18n.localize("Save") : game.i18n.localize("Close")
		}];
		//Кнопка удаления для пользовательских шаблонов
		if (this.type == "custom") {
			context.buttons.unshift({
				action: "delete",
				icon: "<i class='fas fa-trash'></i>",
				label: game.i18n.localize("Delete")
			});
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset _prepareContext \"context\"");
			console.debug(context);
		};
        return context;
    };

    static async create(id, type, params, generator, options={}) {
		this.debug = game.settings.get("wfrp4e-looting", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset create");
		};
		//Определение названия шапки шаблона в соответствии с типом
		let title = (type == "custom" ? game.i18n.localize("WFRP4E.Looting.Generator.Preset.Title") : game.i18n.localize("WFRP4E.Looting.Generator.Preset.Default")) + (game.settings.get("wfrp4e-looting", "debug") ? " [ID: " + id + "]" : "");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset create \"title\"");
			console.debug(title);
		};
		params.props = {
			qualities: game.i18n.localize("WFRP4E.Looting.Generator.Preset.Props.Qualities"),
			flaws: game.i18n.localize("WFRP4E.Looting.Generator.Preset.Props.Flaws")
		};
        return new Promise(resolve => {
            options.resolve = resolve;
            new this(game.wfrp4e.looting.data.generator.presets.all.find(p => p.id == id), type, params, generator, this.debug, options).render({force: true, window: {title}});
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
					chance: p.querySelector("#chance").value || 100,
					name: p.querySelector("#prop").value || "type",
					label: game.wfrp4e.looting.data.generator.names[p.querySelector("#prop").value] || game.wfrp4e.looting.data.generator.names.type,
					quantity: p.querySelector("#quantity").value || 1
				})).filter(p => Boolean(p.chance) && p.name != "false" && Boolean(p.quantity)),
				flaws: Array.from(this.element.querySelectorAll("div.props .flaws")).map(p => ({
					chance: p.querySelector("#chance").value || 100,
					name: p.querySelector("#prop").value || "type",
					label: game.wfrp4e.looting.data.generator.names[p.querySelector("#prop").value] || game.wfrp4e.looting.data.generator.names.type,
					quantity: p.querySelector("#quantity").value || 1
				})).filter(p => Boolean(p.chance) && p.name != "false" && Boolean(p.quantity)),
				names: {
					a: Array.from(this.element.querySelectorAll("div.names div.a")).map(n => (n.querySelector("#name\\.a").value)).filter(Boolean),
					b: Array.from(this.element.querySelectorAll("div.names div.b")).map(n => (n.querySelector("#name\\.b").value)).filter(Boolean),
					c: Array.from(this.element.querySelectorAll("div.names div.c")).map(n => (n.querySelector("#name\\.c").value)).filter(Boolean)
				},
				scripts: Array.from(this.element.querySelectorAll("div.scripts a")).map(s => ({
					id: s.dataset.id,
					chance: Number(s.dataset.chance)
				}))
			};
			//Установка параметров фильтра шаблона
			preset.types.value = [(preset.types.trapping ? "trapping" : ""), (preset.types.melee ? "melee" : ""), (preset.types.range ? "range" : ""), (preset.types.armour ? "armour" : "")].filter(Boolean).join(",");
			//Должен быть выбран хотя бы один фильтр
			if (preset.types.value == "") {
				preset.types = presets.find(p => p.id == id).types;
				ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Generator.Error.PresetTypesEmpty"));
			};
			//Подсчёт Соотношения свойств
			preset.value = calcGeneratorPresetValue(preset);
			if (this.debug) {
				console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset _onSave \"preset\"");
				console.debug(preset);
			};
			this.update(game.settings.get("wfrp4e-looting", "customGenerator").map(p => p.id == preset.id ? preset : p));
			//Удаление кнопки шаблона, если окно открыто
			if (this.generator.element) {
				this.generator.editLabel(preset);
				this.generator.updateProps();
			};
			this.close();
		};
	};

	static async _onDelete() {
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset _onDelete \"this.preset.id\"");
			console.debug(this.preset.id);
		};
		this.update(game.settings.get("wfrp4e-looting", "customGenerator").filter(p => p.id != this.preset.id));
		//Удаление кнопки шаблона, если окно открыто
		if (this.generator.element) {
			this.generator.element.querySelector(`div.presets > label[data-type="custom"][data-id="${this.preset.id}"]`).remove();
			this.generator.updateProps();
		};
        this.close();
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
		button.closest(`div.${button.dataset.type}`).remove();
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
		button.closest("div").remove();
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
					this.remove();
				};
				script.dataset.tooltip = (effect.default ? effect.hint + "<hr>" : "")
					+ game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Hint.LMB")
					+ "<br>"
					+ game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Hint.Alt")
					+ "<br>"
					+ game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Dialog.Hint.RMB");
				this.updateChances(button.closest("div.scripts").querySelector("div.body").insertAdjacentElement("beforeend", script));
				if (this.debug) {
					console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addScript \"effect\"");
					console.debug(effect);
					console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addScript \"script\"");
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
		button.textContent = game.wfrp4e.looting.data.generator.effects.all.find(s => s.id == button.dataset.id).name + (button.dataset.chance == 100 ? "" : " [" + button.dataset.chance + "%]") + (this.debug ? " [" + button.dataset.id + "]" : "");
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

    close() {
        super.close();
        this.options.resolve();
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
			button.addEventListener("click", async (element) => {(await fromUuid(game.settings.get("wfrp4e-looting", "effectsItem"))).sheet.render(true)});
			document.querySelector("section#items > header > .header-actions").insertAdjacentElement("beforeend", button);
		};
	};
};

Hooks.on("renderItemSheetV2", (event, html) => {
	if (event.item.uuid == game.settings.get("wfrp4e-looting", "effectsItem")) {
		//Изменение отображения листов
		html.querySelector("div.sheet-header").hidden = true;
		html.querySelector("nav.sheet-tabs").hidden = true;
		html.querySelector("section.tab:not([data-tab=\"effects\"])").classList.remove("active");	
		html.querySelector("section.tab[data-tab=\"effects\"]").classList.add("active");
		html.querySelector("div.list-header div.list-controls").hidden = true;
		//Изменение отображения скриптов
		html.querySelectorAll("section[data-tab=\"effects\"] .list-content > div").forEach(e => {
			let effect = fromUuidSync(e.dataset.uuid);
			if (effect.flags.looting?.id) {
				if (effect.flags.looting?.default) {
					e.querySelector("div.list-name a.label").textContent = game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts." + effect.flags.looting.id + ".Label") + ": " + e.querySelector("div.list-name a.label").textContent + (game.settings.get("wfrp4e-looting", "debug") ? " [" + effect.flags.looting.id + "]" : "");
				} else {
					e.querySelector("div.list-name a.label").textContent = effect.flags.looting.name + ": " + e.querySelector("div.list-name a.label").textContent + (game.settings.get("wfrp4e-looting", "debug") ? " [" + effect.flags.looting.id + "]" : "");
				};
			} else (e.hidden = true);
			if (effect.flags.looting?.default) {e.querySelector("div.list-controls").hidden = true}
			else {e.querySelector("div.list-controls a.list-control[data-action=\"toggleProperty\"]").hidden = true};
		});
		//Добавление кнопки Нового скрипта
		if (!html.querySelector("button[data-action=\"addNewScript\"]")) {
			let button = document.createElement("button");
			button.type = "button";
			button.classList.add("header-control", "icon", "fa-solid", "fa-plus");
			button.ariaLabel = game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Add");
			button.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Add");
			button.dataset.action = "addNewScript";
			button.addEventListener("click", (element) => {addNewScript()});
			html.querySelector("header.window-header > h1.window-title").insertAdjacentElement("afterend", button);
		};
	} else if (!event.item.inCompendium && game.user.isGM) {
		//Добавление кнопки "Добавить скрипт" в шапку эффектов
		let button = addGeneratorScript(event.item, html);
		//Сокрытие скриптов генератора
		html.querySelectorAll("section[data-tab=\"effects\"] .list-content > div").forEach(e => {
			let effect = fromUuidSync(e.dataset.uuid);
			if (effect.flags.looting?.default) {e.hidden = true};
		});
		//Добавление списка скриптов
		let scripts = [];
		if (event.item.flags.looting?.scripts?.length) {
			event.item.flags.looting.scripts.forEach(e => {
				let effect = game.wfrp4e.looting.data.generator.effects.all.find(s => s.id == e);
				if (effect.default) {scripts.push(game.i18n.localize(`WFRP4E.Looting.Generator.Lists.Scripts.${e}.Label`))}
				else {scripts.push(effect.name)};
			});
		} else {scripts.push(game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Empty"))};
		button.dataset.tooltip = "<strong>" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Tooltip") + ": </strong><i>" + scripts.join(", ") + "</i>.<hr>" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.LMB") + "<br>" + game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.RMB");
	};
});

async function addNewScript(item, html) {
	let debug = game.settings.get("wfrp4e-looting", "debug");
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
					console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addNewScript \"newName\"");
					console.debug(IDbutton.form.elements.name.value);
					console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addNewScript \"script\"");
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
					}]);
				//Если добавляется новый скрипт
				} else {
					//Создание эффекта
					script = await item.createEmbeddedDocuments("ActiveEffect", [{
						name: IDbutton.form.elements.name.value,
						img: "modules/wfrp4e-core/icons/unarmed.png",
						flags: {
							looting: {
								id: "custom-" + getID(game.settings.get("wfrp4e-looting", "customEffects").map(i => i.id.replace("custom-", ""))),
								name: IDbutton.form.elements.name.value
							}
						}
					}]);
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
							let option = document.createElement("option");
							option.textContent = script.name + (debug ? " [" + script.flags.looting.id + "]" : "");
							option.value = script.flags.looting.id;
							document.querySelector(`div.scripts > select > option[value="add"]`).insertAdjacentElement("beforebegin", option);
							if (debug) {
								console.debug(...debugMessage, "WFRP4eLootingGeneratorPreset addNewScript \"option\"");
								console.debug(option);
							};
						};
					};
				};
			}
		}
	});
};

function addGeneratorScript(item, html) {
	if (!html.querySelector("section[data-tab=\"effects\"] .list-header > .list-controls > a[data-action=\"addGeneratorScript\"]")) {
		let a = document.createElement("a");
		a.classList.add("list-control");
		a.dataset.action = "addGeneratorScript";
		a.dataset.tooltip = "";
		a.innerHTML = "<i class=\"fas fa-square-plus\"></i>";
		a.addEventListener("click", async (element) => {
			let scripts = game.wfrp4e.looting.data.generator.effects.all.filter(s => !item.flags.looting?.scripts.includes(s.id));
			let choise = (await ItemDialog.create(scripts, scripts.length, {text: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Text.Add"), title: game.i18n.localize("WH.Scripts")}));
			if (choise.length) {warhammer.apps.WFRP4eLootingGenerator.addScripts(item.uuid, choise)};
		});
		a.addEventListener("contextmenu", async (element) => {
			element.preventDefault();
			let scripts = game.wfrp4e.looting.data.generator.effects.all.filter(s => item.flags.looting?.scripts.includes(s.id));
			let choise = (await ItemDialog.create(scripts, scripts.length, {text: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Item.Text.Remove"), title: game.i18n.localize("WH.Scripts")}));
			if (choise.length) {
				for (let i = 0; i < choise.length; i++) {
					item.effects.filter(e => e.flags.looting?.id == choise[i].id).forEach(e => {e.delete()});
				};
			};
		});
		return html.querySelector("section[data-tab=\"effects\"] .list-header > .list-controls").insertAdjacentElement("afterbegin", a);
	};
};

function calcGeneratorPresetValue(p) {
	let value = 0;
	p.qualities.forEach((q, i) => {
		p.qualities[i].label = game.wfrp4e.looting.data.generator.names[p.qualities[i].name];
		value += p.qualities[i].chance * p.qualities[i].quantity / 100;
	});
	p.flaws.forEach((f, i) => {
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
    game.settings.registerMenu("wfrp4e-looting", "importExport", {
		restricted: true,
		name: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Name"),
		label: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Label"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.importExport.Hint"),
		icon: "fas fa-file",
		type: importExport
	});
    game.settings.registerMenu("wfrp4e-looting", "debugMenu", {
		restricted: true,
		name: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Name"),
		label: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Label"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.debugMenu.Hint"),
		icon: "fas fa-debug",
		type: debugMenu
	});
	game.settings.register("wfrp4e-looting", "debug", {
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});
	game.settings.register("wfrp4e-looting", "currentMenu", {
		scope: "world",
		config: false,
		default: "loot",
		type: String
	});
	game.settings.register("wfrp4e-looting", "customLooting", {
		scope: "world",
		config: false,
		default: [],
		type: Array,
		onChange: (value) => {
			if (game.settings.get("wfrp4e-looting", "debug")) {
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
			game.wfrp4e.looting.data.generator.presets.all = game.wfrp4e.looting.data.generator.presets.concat(value);
			game.wfrp4e.looting.data.generator.presets.all.forEach(p => {
				p.types.value = [(p.types.trapping ? "trapping" : ""), (p.types.melee ? "melee" : ""), (p.types.range ? "range" : ""), (p.types.armour ? "armour" : "")].filter(Boolean).join(",");
				p.value = calcGeneratorPresetValue(p);
				p.scripts.forEach(s => {
					let script = game.wfrp4e.looting.data.generator.effects.all.find(e => e.id == s.id);
					if (script) {
						s.name = script.name;
						s.hint = script.hint;
						s.default = script.default;
					};
				});
			});
			if (game.settings.get("wfrp4e-looting", "debug")) {
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
			game.wfrp4e.looting.data.generator.effects.all = game.wfrp4e.looting.data.generator.effects.default.concat(value);
			if (game.settings.get("wfrp4e-looting", "debug")) {
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
	game.settings.register("wfrp4e-looting", "sellItems", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.sellItems.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.sellItems.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-looting", "modifier", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.modifier.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.modifier.Hint"),
		scope: "world",
		config: true,
		default: 1,
		type: Number
	});
	game.settings.register("wfrp4e-looting", "itemsModifier", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.itemsModifier.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.itemsModifier.Hint"),
		scope: "world",
		config: true,
		default: false,
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
	game.settings.register("wfrp4e-looting", "propsCompatibility", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.propsCompatibility.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.propsCompatibility.Hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
});

Hooks.once("ready", async () => {
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
				presets: [
					//Список цвета шаблонов: blue, cyan, goldenrod, gray, green, khaki, olivedrab, orange, orchid, red, salmon, slateblue, turquoise, violet.
					{
						id: "hereditary",
						label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Hereditary.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Hereditary.Title"),
						color: "salmon",
						type: "default",
						types: {
							trapping: false,
							melee: true,
							range: true,
							armour: false
						},
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
							{
								id: "Gromril",
								chance: 10
							},
							{
								id: "Ithilmar",
								chance: 10
							},
							{
								id: "Size&Species",
								chance: 100
							},
							{
								id: "Cursed",
								chance: 10
							}
						]
					},
					{
						id: "desecrated",
						label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Desecrated.Title"),
						color: "orchid",
						type: "default",
						types: {
							trapping: false,
							melee: true,
							range: true,
							armour: false
						},
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
							{
								id: "Incendiary",
								chance: 15
							},
							{
								id: "Infected",
								chance: 15
							},
							{
								id: "Throatseeker",
								chance: 15
							},
							{
								id: "TaintedWeapon",
								chance: 100
							},
							{
								id: "FullOfWind",
								chance: 15
							},
							{
								id: "Draining",
								chance: 25
							},
							{
								id: "RelentlessFury",
								chance: 15
							},
							{
								id: "WeaponOfForsakenFortune",
								chance: 25
							}
						]
					},
					{
						id: "mysterious",
						label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Mysterious.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Mysterious.Title"),
						color: "cyan",
						type: "default",
						types: {
							trapping: true,
							melee: true,
							range: true,
							armour: true
						},
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
							{
								id: "Incendiary",
								chance: 10
							},
							{
								id: "ObsidianInlays",
								chance: 10
							},
							{
								id: "DrawingTheWinds",
								chance: 10
							}
						]
					},
					{
						id: "heroic",
						label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Heroic.Title"),
						color: "goldenrod",
						type: "default",
						types: {
							trapping: true,
							melee: true,
							range: true,
							armour: true
						},
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
							{
								id: "Incendiary",
								chance: 15
							},
							{
								id: "Gromril",
								chance: 10
							},
							{
								id: "Throatseeker",
								chance: 10
							},
							{
								id: "Size&Species",
								chance: 100
							},
							{
								id: "Cursed",
								chance: 10
							}
						]
					},
					{
						id: "ancient",
						label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Ancient.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Ancient.Title"),
						color: "slateblue",
						type: "default",
						types: {
							trapping: true,
							melee: true,
							range: true,
							armour: true
						},
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
							{
								id: "TaintedWeapon",
								chance: 15
							},
							{
								id: "FullOfWind",
								chance: 15
							},
							{
								id: "Draining",
								chance: 15
							}
						]
					},
					{
						id: "magical",
						label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Magical.Title"),
						color: "violet",
						type: "default",
						types: {
							trapping: true,
							melee: true,
							range: true,
							armour: true
						},
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
							{
								id: "FullOfWind",
								chance: 20
							},
							{
								id: "DrawingTheWinds",
								chance: 10
							},
							{
								id: "ObsidianInlays",
								chance: 10
							}
						]
					},
					{
						id: "damaged",
						label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Damaged.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Damaged.Title"),
						color: "gray",
						type: "default",
						types: {
							trapping: true,
							melee: true,
							range: true,
							armour: true
						},
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
							{
								id: "TaintedWeapon",
								chance: 10
							}
						]
					},
					{
						id: "fatal",
						label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Fatal.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Fatal.Title"),
						color: "khaki",
						type: "default",
						types: {
							trapping: true,
							melee: true,
							range: true,
							armour: true
						},
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
							{
								id: "Throatseeker",
								chance: 25
							},
							{
								id: "Poisoned",
								chance: 25
							},
							{
								id: "RelentlessFury",
								chance: 25
							}
						]
					},
					{
						id: "insignificant",
						label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Presets.Insignificant.Title"),
						color: "orange",
						type: "default",
						types: {
							trapping: true,
							melee: true,
							range: true,
							armour: true
						},
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
							{
								id: "WeaponOfForsakenFortune",
								chance: 25
							}
						]
					},
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
				],
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
								script: "let effects = this.item.effects.filter(e => !e.flags.looting?.default).map(e => ({name: e.flags.looting?.name, id: e.flags.looting?.id, effects: [e]}));"
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
										+ "\n\tthis.item.update({\"flags.looting.scripts\": this.item.flags.looting.scripts.filter(s => s != args.document.flags.looting?.id)});"
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
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Immediate"),
									img: "modules/wfrp4e-core/icons/unarmed.png",
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
												+ "\n\tlet ap = this.item.system.AP;"
												+ "\n\tap = {"
												+ "\n\t\tbody: ap.body > 0 ? ap.body + 1 : ap.body,"
												+ "\n\t\thead: ap.head > 0 ? ap.head + 1 : ap.head,"
												+ "\n\t\tlArm: ap.lArm > 0 ? ap.lArm + 1 : ap.lArm,"
												+ "\n\t\tlLeg: ap.lLeg > 0 ? ap.lLeg + 1 : ap.lLeg,"
												+ "\n\t\trArm: ap.rArm > 0 ? ap.rArm + 1 : ap.rArm,"
												+ "\n\t\trLeg: ap.rLeg > 0 ? ap.rLeg + 1 : ap.rLeg"
												+ "\n\t};"
												+ "\n\tthis.item.update({"
												+ "\n\t\t\"system.description.value\": \"<p>\" + game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Gromril.Armour\") + \"</p><br>\" + this.item.system.description.value,"
												+ "\n\t\t\"system.AP\": ap"
												+ "\n\t});"
												+ "\n} else if (this.item.type == \"weapon\") {"
												+ "\n\tlet qualities = this.item.system.qualities.value;"
												+ "\n\tif (!qualities.find(q => q.name == \"unbreakable\")) {"
												+ "\n\t\tqualities.push({name: \"unbreakable\"});"
												+ "\n\t\tthis.item.update({\"system.qualities.value\": qualities});"
												+ "\n\t};"
												+ "\n};",
										}]
									}
								},
								{
									name: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.Delete"),
									img: "modules/wfrp4e-core/icons/unarmed.png",
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
												+ "\n\tlet ap = this.item.system.AP;"
												+ "\n\tap = {"
												+ "\n\t\tbody: ap.body > 0 ? ap.body - 1 : ap.body,"
												+ "\n\t\thead: ap.head > 0 ? ap.head - 1 : ap.head,"
												+ "\n\t\tlArm: ap.lArm > 0 ? ap.lArm - 1 : ap.lArm,"
												+ "\n\t\tlLeg: ap.lLeg > 0 ? ap.lLeg - 1 : ap.lLeg,"
												+ "\n\t\trArm: ap.rArm > 0 ? ap.rArm - 1 : ap.rArm,"
												+ "\n\t\trLeg: ap.rLeg > 0 ? ap.rLeg - 1 : ap.rLeg"
												+ "\n\t};"
												+ "\n\tthis.item.update({"
												+ "\n\t\t\"system.description.value\": this.item.system.description.value.replace(\"<p>\" + game.i18n.localize(\"WFRP4E.Looting.Generator.Lists.Scripts.Gromril.Armour\") + \"</p><br>\", \"\"),"
												+ "\n\t\t\"system.AP\": ap"
												+ "\n\t});"
												+ "\n} else if (this.item.type == \"weapon\") {"
												+ "\n\tthis.item.update({\"system.qualities.value\": this.item.system.qualities.value.filter(q => q.name != \"unbreakable\")});"
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
											script: "let wpTest = async () => {"
												+ "\n\tlet difficulty = Math.max(Number(this.item.flags?.looting?.modifier) || 0, -20);"
												+ "\n\tif (!this.item.flags?.looting?.modifier) {"
												+ "\n\t\tthis.item.update({\"flags.looting.modifier\": \"0\"});"
												+ "\n\t} else {"
												+ "\n\t\tdifficulty -= 10;"
												+ "\n\t\tthis.item.update({\"flags.looting.modifier\": difficulty});"
												+ "\n\t};"
												+ "\n\tdifficulty = game.wfrp4e.config.difficultyLabels[warhammer.utility.findKey(Number(difficulty), game.wfrp4e.config.difficultyModifiers) || \"challenging\"];"
												+ "\n\tthis.script.message(\"<strong>\" + (args.attacker.token?.name || args.attacker.name) + \"</strong> \" + game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.RelentlessFury.Message\", {difficulty}));"
												+ "\n};"
												+ "\nwpTest();",
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
										transferData: {documentType: "Actor"},
										scriptData: [
											{
												label: game.i18n.localize("NAME.Frenzy"),
												trigger: "immediate",
												script: "await fromUuid(\"Compendium.wfrp4e-core.items.hXcfygzujgyMN1uI\").then(item => Item.create([item.toObject()], {fromEffect: this.effect.id, parent: this.actor}));",
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.StartCombat"),
												trigger: "startCombat",
												script: "this.item.update({\"flags.looting.modifier\": \"10\"});",
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Scripts.Labels.EndCombat"),
												trigger: "endCombat",
												script: "this.item.update({\"flags.looting.modifier\": \"10\"});",
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
													activateScript: "return this.actor.system.status.fortune?.value > 0;",
													hideScript: "return args.weapon != this.item || this.actor.type != \"character\"",
													submissionScript: "args.context.weaponOfForsakenFortune = true;"
												},
												script: "args.fields.modifier += 20;",
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Label"),
												trigger: "opposedDefender",
												script: "if (args.opposedTest.result.winner == \"defender\" && args.defenderTest.item == this.item && args.defenderTest.options.weaponOfForsakenFortune && Number(args.opposedTest.result.differenceSL) <= 2) {"
													+ "\n\tif (this.actor.system.status.fortune.value == 0) {"
													+ "\n\t\targs.opposedTest.result.other.push(game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.NoFortune\", {item: \"<b>\" + this.item.name + \"</b>\", actor: \"<b>\" + (this.actor.token?.name || this.actor.name) + \"</b>\"}));"
													+ "\n\t} else {"
													+ "\n\t\targs.opposedTest.result.other.push(game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Message\", {item: \"<b>\" + this.item.name + \"</b>\", actor: \"<b>\" + (this.actor.token?.name || this.actor.name) + \"</b>\"}));"
													+ "\n\t};"
													+ "\n};",
											},
											{
												label: game.i18n.localize("WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Label"),
												trigger: "opposedAttacker",
												script: "if (args.opposedTest.result.winner == \"attacker\" && args.attackerTest.item == this.item && args.attackerTest.options.weaponOfForsakenFortune && Number(args.opposedTest.result.differenceSL) <= 2) {"
													+ "\n\tif (this.actor.system.status.fortune.value == 0) {"
													+ "\n\t\targs.opposedTest.result.other.push(game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.NoFortune\", {item: \"<b>\" + this.item.name + \"</b>\", actor: \"<b>\" + (this.actor.token?.name || this.actor.name) + \"</b>\"}));"
													+ "\n\t} else {"
													+ "\n\t\targs.opposedTest.result.other.push(game.i18n.format(\"WFRP4E.Looting.Generator.Lists.Scripts.WeaponOfForsakenFortune.Message\", {item: \"<b>\" + this.item.name + \"</b>\", actor: \"<b>\" + (this.actor.token?.name || this.actor.name) + \"</b>\"}));"
													+ "\n\t};"
													+ "\n};",
											}
										]
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

	game.wfrp4e.looting.data.generator.effects.all = game.wfrp4e.looting.data.generator.effects.default.concat(game.settings.get("wfrp4e-looting", "customEffects"));
	game.wfrp4e.looting.data.generator.presets.all = game.wfrp4e.looting.data.generator.presets.concat(game.settings.get("wfrp4e-looting", "customGenerator"));
	game.wfrp4e.looting.data.generator.presets.all.forEach(p => {
		p.types.value = [(p.types.trapping ? "trapping" : ""), (p.types.melee ? "melee" : ""), (p.types.range ? "range" : ""), (p.types.armour ? "armour" : "")].filter(Boolean).join(",");
		p.qualities = p.qualities.filter(q => game.wfrp4e.utility.qualityList()[q.name]);
		p.flaws = p.flaws.filter(f => game.wfrp4e.utility.flawList()[f.name]);
		p.value = calcGeneratorPresetValue(p);
		p.scripts.forEach(s => {
			let script = game.wfrp4e.looting.data.generator.effects.all.find(e => e.id == s.id);
			if (script) {
				s.name = script.name;
				s.hint = script.hint;
				s.default = script.default;
			};
		});
	});

	//Если предмет, содержащий Скрипты Генератора, был создан на другой версии модуля, он удаляется
	if (fromUuidSync(game.settings.get("wfrp4e-looting", "effectsItem"))?.flags.looting.version != game.modules.get("wfrp4e-looting").version) {await (await fromUuid(game.settings.get("wfrp4e-looting", "effectsItem")))?.delete()};
	//Если предмета, содержащего Скрипты Генератора, не существует, он создаётся
	if (!(game.settings.get("wfrp4e-looting", "effectsItem") && fromUuidSync(game.settings.get("wfrp4e-looting", "effectsItem"))) ) {
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
				description: {value: game.i18n.localize("WFRP4E.Looting.Settings.effectsItem.Item.Description")},
			},
			effects: [game.wfrp4e.looting.data.generator.effects.script].concat(game.wfrp4e.looting.data.generator.effects.default.map(s => s.effects).flat(1), game.settings.get("wfrp4e-looting", "customEffects").map(s => s.effects).flat(1))
		});
		if (game.settings.get("wfrp4e-looting", "debug")) {
			console.debug(...debugMessage, "checkItem \"newItem\"");
			console.debug(newItem);
		};
		await game.settings.set("wfrp4e-looting", "effectsItem", newItem.uuid);
		document.querySelector(`li.directory-item.document.item[data-entry-id="${newItem.id}"]`).hidden = true;
	};
	//Добавление кнопок во вкладку предметов
	updateGeneratorButton();
});

let socket;
Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerModule("wfrp4e-looting");

    socket.register("wfrp4e-looting:editHTML", (id, content) => {
		document.querySelector(`.chat-message.message[data-message-id="${id}"] div#WFRP4eLooting-chat`).innerHTML = content;
	});
    socket.register("wfrp4e-looting:editMessage", (message, content) => {game.messages.get(message).update({"content": content})});
});