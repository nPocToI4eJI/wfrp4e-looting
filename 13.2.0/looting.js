Hooks.once("init", () => {
	game.settings.register("wfrp4e-looting", "callType", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.callType.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.callType.Hint"),
		scope: "world",
		config: true,
		requiresReload: true,
		type: String,
		choices: {
			"1": game.i18n.localize("WFRP4E.Looting.Settings.callType.Same"),
			"2": game.i18n.localize("WFRP4E.Looting.Settings.callType.Chat"),
			"3": game.i18n.localize("WFRP4E.Looting.Settings.callType.ControlButton")
		},
		default: "1"
	});
	game.settings.register("wfrp4e-looting", "closeAfterRoll", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.CloseAfterRoll.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.CloseAfterRoll.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-looting", "DefaultPresets", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.DefaultPresets.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.DefaultPresets.Hint"),
		scope: "world",
		config: true,
		type: String,
		choices: {
			"1": game.i18n.localize("WFRP4E.Looting.Settings.DefaultPresets.Pedomarine"),
			"2": game.i18n.localize("WFRP4E.Looting.Settings.DefaultPresets.Looting"),
			"3": game.i18n.localize("WFRP4E.Looting.Settings.DefaultPresets.No")
		},
		default: "2",
		onChange: async () => {
			if (document.getElementById("WFRP4eLooting_Menu")) {
				document.getElementById("WFRP4eLooting_Menu").getElementsByClassName("dialog-content")[0].innerHTML = await generateLootingData();
			};
			if (document.getElementById("WFRP4eLooting_customPreset").getElementsByClassName("disabled")[0]) {
				document.getElementById("WFRP4eLooting_customPreset").remove();
			};
		}
	});
	game.settings.register("wfrp4e-looting", "modifier", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.Modifier.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.Modifier.Hint"),
		scope: "world",
		config: true,
		default: "1",
		type: Number
	});
	game.settings.register("wfrp4e-looting", "userList", {
		name: game.i18n.localize("WFRP4E.Looting.Settings.UserList.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Settings.UserList.Name"),
		scope: "world",
		config: true,
		default: "",
		type: String
	});
});

Hooks.on("getSceneControlButtons", (buttons) => {
	if (game.settings.get("wfrp4e-looting", "callType") == 1 || game.settings.get("wfrp4e-looting", "callType") == 3) {
		buttons.notes.tools.menuWFRP4eLooting = {
			name: "menuWFRP4eLooting",
			title: game.i18n.localize("WFRP4E.Looting.Name"),
			icon: "fas fa-treasure-chest",
			button: true,
			onChange: () => {
				if (!document.getElementById("WFRP4eLooting_Menu")) {showMenu()};
			}
		};
	};
});
Hooks.on("chatMessage", (html, content, msg) => {
	if (game.settings.get("wfrp4e-looting", "callType") == 1 || game.settings.get("wfrp4e-looting", "callType") == 2) {
		let regExp;
		regExp = /(\S+)/g;
		let commands = content.match(regExp);
		let command = commands[0];

		if (command === "/loot") {
			if (!document.getElementById("WFRP4eLooting_Menu")) {showMenu()};
			return false;
		}
	};
});

async function rollDice(count, min, max, modifier) {
	if (typeof count === "undefined") {count = 1};
	if (typeof min === "undefined") {min = 1};
	if (typeof modifier === "undefined") {modifier = "+0"}
	else if (!isNaN(Number(modifier.replaceAll(" ", "")[0]))) {modifier = "+" + modifier};
	let result = (await new Roll(`(${count}d@max + @min) ${modifier}`, {min: min - 1, max: max - min + 1}).roll());
	let cs = false;
	if (max != 1 && result.total == max) {cs = true};
	return {result: result.total, cs: cs};
}

let defaultList = [];
let userList = [];
let dataList = [];

async function generateLootingData() {
	if (game.settings.get("wfrp4e-looting", "DefaultPresets") == 1) {
		defaultList = [
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Hovel.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Hovel.Title"),
				type: "brass",
				typeLabel: game.i18n.localize("MARKET.Abbrev.BP").toLowerCase(),
				money: {gc: {chance: 1, dices: 1, sides: 1}, ss: {chance: 10, dices: 1, sides: 5}, bp: {chance: 50, dices: 1, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 10, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "clothes"}, chance: 10, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.House.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.House.Title"),
				type: "silver",
				typeLabel: game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(),
				money: {gc: {chance: 25, dices: 1, sides: 10}, ss: {chance: 100, dices: 2, sides: 10}, bp: {chance: 100, dices: 6, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 100, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_silver"}, chance: 5, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 10, dices: 1, sides: 2, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 25, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Estate.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Estate.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 100, dices: 1, sides: 100}, ss: {chance: 100, dices: 1, sides: 100}, bp: {chance: 100, dices: 2, sides: 100}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 100, dices: 2, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 90, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 75, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 100, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.WizardsHouse.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.WizardsHouse.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 50, dices: 3, sides: 10}, ss: {chance: 75, dices: 5, sides: 10}, bp: {chance: 100, dices: 3, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 25, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 75, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 75, dices: 1, sides: 2, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 25, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Workshop.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Workshop.Title"),
				type: "silver",
				typeLabel: game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(),
				money: {gc: {chance: 25, dices: 1, sides: 10}, ss: {chance: 50, dices: 3, sides: 10}, bp: {chance: 75, dices: 1, sides: 100}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 10, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_silver"}, chance: 5, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 1, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 25, dices: 1, sides: 2, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Shrine.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Shrine.Title"),
				type: "brass",
				typeLabel: game.i18n.localize("MARKET.Abbrev.BP").toLowerCase(),
				money: {gc: {chance: 5, dices: 1, sides: 5}, ss: {chance: 50, dices: 1, sides: 10}, bp: {chance: 100, dices: 1, sides: 100}},
				items: [
					{table: {key: "looting", column: "precious_stones_brass"}, chance: 25, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 75, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Temple.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Temple.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 50, dices: 5, sides: 10}, ss: {chance: 75, dices: 1, sides: 100}, bp: {chance: 100, dices: 5, sides: 100}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 25, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 75, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 50, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 100, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.SmallMonster.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.SmallMonster.Title"),
				type: "silver",
				typeLabel: game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(),
				money: {gc: {chance: 15, dices: 1, sides: 5}, ss: {chance: 15, dices: 2, sides: 10}, bp: {chance: 50, dices: 1, sides: 10}},
				items: [
					{table: {key: "looting", column: "precious_stones_silver"}, chance: 15, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.LargeMonster.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.LargeMonster.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 25, dices: 1, sides: 100}, ss: {chance: 50, dices: 1, sides: 100}, bp: {chance: 75, dices: 2, sides: 100}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 5, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 75, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestOpen.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestOpen.Title"),
				type: "silver",
				typeLabel: game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(),
				money: {gc: {chance: 5, dices: 1, sides: 10}, ss: {chance: 25, dices: 1, sides: 10}, bp: {chance: 25, dices: 1, sides: 100}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_silver"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "clothes"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestSecure.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestSecure.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 50, dices: 2, sides: 10}, ss: {chance: 100, dices: 3, sides: 10}, bp: {chance: 100, dices: 5, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 10, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 15, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 15, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestVault.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestVault.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 100, dices: 3, sides: 100}, ss: {chance: 100, dices: 4, sides: 100}, bp: {chance: 100, dices: 5, sides: 100}},
				items: [
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 100, dices: 1, sides: 100, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 100, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 25, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Peasant.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Peasant.Title"),
				type: "brass",
				typeLabel: game.i18n.localize("MARKET.Abbrev.BP").toLowerCase(),
				money: {gc: {chance: 0, dices: 1, sides: 1}, ss: {chance: 5, dices: 1, sides: 2}, bp: {chance: 15, dices: 1, sides: 10}},
				items: [
					{table: {key: "looting", column: "clothes"}, chance: 1, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Citizen.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Citizen.Title"),
				type: "silver",
				typeLabel: game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(),
				money: {gc: {chance: 5, dices: 1, sides: 5}, ss: {chance: 75, dices: 1, sides: 10}, bp: {chance: 75, dices: 1, sides: 10}},
				items: [
					{table: {key: "looting", column: "precious_stones_silver"}, chance: 1, dices: 1, sides: 1, price: {dices: 2, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "clothes"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Noble.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Noble.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 100, dices: 1, sides: 10}, ss: {chance: 100, dices: 2, sides: 10}, bp: {chance: 100, dices: 1, sides: 100}},
				items: [
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 50, dices: 1, sides: 2, price: {dices: 2, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 100, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Wizard.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Wizard.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 50, dices: 1, sides: 10}, ss: {chance: 50, dices: 2, sides: 10}, bp: {chance: 25, dices: 2, sides: 10}},
				items: [
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 5, dices: 1, sides: 1, price: {dices: 2, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "clothes"}, chance: 1, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
		];
	} else if (game.settings.get("wfrp4e-looting", "DefaultPresets") == 2) {
		defaultList = [
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Hovel.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Hovel.Title"),
				type: "brass",
				typeLabel: game.i18n.localize("MARKET.Abbrev.BP").toLowerCase(),
				money: {gc: {chance: 1, dices: 1, sides: 1}, ss: {chance: 10, dices: 1, sides: 5}, bp: {chance: 50, dices: 1, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 10, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "clothes"}, chance: 10, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.House.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.House.Title"),
				type: "silver",
				typeLabel: game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(),
				money: {gc: {chance: 25, dices: 1, sides: 10}, ss: {chance: 100, dices: 2, sides: 10}, bp: {chance: 100, dices: 6, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 100, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_silver"}, chance: 5, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 10, dices: 1, sides: 2, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 25, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Estate.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Estate.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 100, dices: 3, sides: 10}, ss: {chance: 100, dices: 5, sides: 10}, bp: {chance: 100, dices: 10, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 100, dices: 2, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 90, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 75, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 100, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.WizardsHouse.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.WizardsHouse.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 50, dices: 3, sides: 10}, ss: {chance: 75, dices: 5, sides: 10}, bp: {chance: 100, dices: 3, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 25, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 75, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 75, dices: 1, sides: 2, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 25, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "magical_items"}, chance: 5, dices: 1, sides: 1, price: {dices: 5, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Workshop.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Workshop.Title"),
				type: "silver",
				typeLabel: game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(),
				money: {gc: {chance: 25, dices: 1, sides: 10}, ss: {chance: 50, dices: 3, sides: 10}, bp: {chance: 75, dices: 1, sides: 100}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 10, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_silver"}, chance: 5, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 1, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 25, dices: 1, sides: 2, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Shrine.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Shrine.Title"),
				type: "brass",
				typeLabel: game.i18n.localize("MARKET.Abbrev.BP").toLowerCase(),
				money: {gc: {chance: 5, dices: 1, sides: 5}, ss: {chance: 50, dices: 1, sides: 10}, bp: {chance: 100, dices: 1, sides: 100}},
				items: [
					{table: {key: "looting", column: "precious_stones_brass"}, chance: 25, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 75, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Temple.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Temple.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 50, dices: 5, sides: 10}, ss: {chance: 75, dices: 5, sides: 10}, bp: {chance: 100, dices: 10, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 25, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 75, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 50, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 100, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.SmallMonster.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.SmallMonster.Title"),
				type: "silver",
				typeLabel: game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(),
				money: {gc: {chance: 15, dices: 1, sides: 5}, ss: {chance: 15, dices: 2, sides: 10}, bp: {chance: 50, dices: 1, sides: 10}},
				items: [
					{table: {key: "looting", column: "precious_stones_silver"}, chance: 15, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.LargeMonster.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.LargeMonster.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 25, dices: 5, sides: 10}, ss: {chance: 50, dices: 5, sides: 10}, bp: {chance: 75, dices: 10, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 5, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 75, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestOpen.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestOpen.Title"),
				type: "silver",
				typeLabel: game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(),
				money: {gc: {chance: 5, dices: 1, sides: 10}, ss: {chance: 25, dices: 1, sides: 10}, bp: {chance: 25, dices: 5, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_silver"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "clothes"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestSecure.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestSecure.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 50, dices: 2, sides: 10}, ss: {chance: 100, dices: 3, sides: 10}, bp: {chance: 100, dices: 5, sides: 10}},
				items: [
					{table: {key: "looting", column: "household_item"}, chance: 10, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 15, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 15, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "magical_items"}, chance: 1, dices: 1, sides: 1, price: {dices: 5, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestVault.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestVault.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 100, dices: 5, sides: 10}, ss: {chance: 100, dices: 10, sides: 10}, bp: {chance: 100, dices: 15, sides: 10}},
				items: [
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 100, dices: 5, sides: 10, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 100, dices: 1, sides: 10, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 25, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Peasant.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Peasant.Title"),
				type: "brass",
				typeLabel: game.i18n.localize("MARKET.Abbrev.BP").toLowerCase(),
				money: {gc: {chance: 0, dices: 1, sides: 1}, ss: {chance: 5, dices: 1, sides: 2}, bp: {chance: 15, dices: 1, sides: 10}},
				items: [
					{table: {key: "looting", column: "clothes"}, chance: 1, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Citizen.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Citizen.Title"),
				type: "silver",
				typeLabel: game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(),
				money: {gc: {chance: 5, dices: 1, sides: 5}, ss: {chance: 75, dices: 1, sides: 10}, bp: {chance: 75, dices: 1, sides: 10}},
				items: [
					{table: {key: "looting", column: "precious_stones_silver"}, chance: 1, dices: 1, sides: 1, price: {dices: 2, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "clothes"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Noble.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Noble.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 100, dices: 1, sides: 10}, ss: {chance: 100, dices: 2, sides: 10}, bp: {chance: 100, dices: 5, sides: 10}},
				items: [
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 50, dices: 1, sides: 2, price: {dices: 2, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "art"}, chance: 5, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "*5"}},
					{table: {key: "looting", column: "clothes"}, chance: 100, dices: 1, sides: 5, price: {dices: 1, sides: 10, modifier: "0"}}
				]
			},
			{
				disabled: true,
				name: game.i18n.localize("WFRP4E.Looting.DefaultList.Wizard.Name"),
				hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Wizard.Title"),
				type: "gold",
				typeLabel: game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(),
				money: {gc: {chance: 50, dices: 1, sides: 10}, ss: {chance: 50, dices: 2, sides: 10}, bp: {chance: 25, dices: 2, sides: 10}},
				items: [
					{table: {key: "looting", column: "precious_stones_gold"}, chance: 5, dices: 1, sides: 1, price: {dices: 2, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "clothes"}, chance: 1, dices: 1, sides: 1, price: {dices: 1, sides: 10, modifier: "0"}},
					{table: {key: "looting", column: "magical_items"}, chance: 5, dices: 1, sides: 1, price: {dices: 5, sides: 10, modifier: "0"}}
				]
			},
		];
	} else {defaultList = []};
	userList = game.settings.get("wfrp4e-looting", "userList").split("|");
	let lootingData = "";
	for (let i = 0; i < defaultList.length; i++) {
		lootingData += `<button onclick="window.parent.looting(this, ${i})" oncontextmenu="window.parent.edit(${i})" class="${defaultList[i].type} id_${i}" data-tooltip="${defaultList[i].name}<br>${defaultList[i].hint}<br><br>${game.i18n.localize("WFRP4E.Looting.Dialog.Presets.Hint")}">${defaultList[i].name}</button>`;
	};
	for (let i = 0; i < userList.length; i++) {
		userList[i] = JSON.parse(userList[i]);
		lootingData += `<button onclick="window.parent.looting(this, ${i + defaultList.length})" oncontextmenu="window.parent.edit(${i + defaultList.length})" class="custom ${userList[i].type} id_${i + defaultList.length}" data-tooltip="${userList[i].name}<br>${userList[i].hint}<br><br>${game.i18n.localize("WFRP4E.Looting.Dialog.Presets.Hint")}">${userList[i].name}</button>`;
	};
	dataList = defaultList.concat(userList);
	return lootingData + `<button onclick="window.parent.create(this)" class="add" data-tooltip="${game.i18n.localize("WFRP4E.Looting.Dialog.Add")}"><i class='fas fa-plus'></i></button>`;
};

async function saveData() {
	let dataToSave = dataList.slice(defaultList.length);
	for (let i = 0; i < dataToSave.length; i++) {dataToSave[i] = JSON.stringify(dataToSave[i])};
	await game.settings.set("wfrp4e-looting", "userList", dataToSave.join("|"));
	ui.notifications.info(game.i18n.localize("WFRP4E.Looting.Dialog.Save.Complete"));
};

function showMenu() {
	new Dialog({
		title: game.i18n.localize("WFRP4E.Looting.Name"),
		content: "",
		buttons: {},
		close: () => {},
		render: async (html) => {
			html[0].innerHTML = await generateLootingData();
		}
	}, {id: "WFRP4eLooting_Menu", height: "unset"}).render(true);
};

function showPreset(index, template, buttons) {
	new Dialog({
		title: dataList[index].disabled ? game.i18n.localize("WFRP4E.Looting.Dialog.Presets.TitleDefault") : game.i18n.localize("WFRP4E.Looting.Dialog.Presets.Title"),
		content: template,
		render: async (html) => {
			for (let i = 0; i < dataList[index].items.length; i++) {
				let items = await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-looting/templates/customPreset/items.hbs", {item: dataList[index].items[i], disabled: dataList[index].disabled});
				html[0].getElementsByClassName("add")[0].insertAdjacentHTML("beforebegin", items);
			};
		},
		buttons: buttons,
		default: "save",
		close: () => {}
	}, {id: "WFRP4eLooting_customPreset", width: 500, resizable:true }).render(true);
};

window.looting = async function(html, index) {
	let notEmpty = true;
	let money = {text: "", bp: 0, ss: 0, gc: 0};
	//Определение значения денежной награды
	if (dataList[index].money.gc.chance != 0) {
		if ((await rollDice(1, 1, 100)).result <= dataList[index].money.gc.chance) {
			for (let i = 0; i < dataList[index].money.gc.dices; i++) {
				let roll = await rollDice(1, 1, dataList[index].money.gc.sides);
				money.gc += roll.result;
				if (roll.cs) {i--};
			}
			money.gc = Math.round(money.gc * game.settings.get("wfrp4e-looting", "modifier"));
		};
	};
	if (dataList[index].money.ss.chance != 0) {
		if ((await rollDice(1, 1, 100)).result <= dataList[index].money.ss.chance) {
			for (let i = 0; i < dataList[index].money.ss.dices; i++) {
				let roll = await rollDice(1, 1, dataList[index].money.ss.sides);
				money.ss += roll.result;
				if (roll.cs) {i--};
			}
			money.ss = Math.round(money.ss * game.settings.get("wfrp4e-looting", "modifier"));
		};
	};
	if (dataList[index].money.bp.chance != 0) {
		if ((await rollDice(1, 1, 100)).result <= dataList[index].money.bp.chance) {
			for (let i = 0; i < dataList[index].money.bp.dices; i++) {
				let roll = await rollDice(1, 1, dataList[index].money.bp.sides);
				money.bp += roll.result;
				if (roll.cs) {i--};
			}
			money.bp = Math.round(money.bp * game.settings.get("wfrp4e-looting", "modifier"));
		};
	};
	//Конверсия денег
	if (money.gc != 0 || money.ss != 0 || money.bp != 0) {
		while (money.bp >= 12) {
			money.ss += 1;
			money.bp -= 12;
		};
		while (money.ss >= 20) {
			money.gc += 1;
			money.ss -= 20;
		};
		if (money.gc != 0) {money.text += money.gc + game.i18n.localize("MARKET.Abbrev.GC").toLowerCase()};
		if (money.ss != 0) {money.text += money.ss + game.i18n.localize("MARKET.Abbrev.SS").toLowerCase()};
		if (money.bp != 0) {money.text += money.bp + game.i18n.localize("MARKET.Abbrev.BP").toLowerCase()};
	};
	//Определение предметов по таблицам
	let items = {list: [], price: {sum: 0, bp: 0, ss: 0, gc: 0}};
	for (let i = 0; i < dataList[index].items.length; i++) {
		if ((await rollDice(1, 1, 100)).result <= dataList[index].items[i].chance) {
			for (let a = 0; a < dataList[index].items[i].dices; a++) {
				let roll = await rollDice(1, 1, dataList[index].items[i].sides);
				for (let o = 0; o < roll.result; o++) {
					let item = (await game.wfrp4e.tables.findTable(dataList[index].items[i].table.key, dataList[index].items[i].table.column).roll()).results[0];
					if (item.name) {item = item.name}
					else if (item.text) {item = item.text};
					let price = Math.round((await rollDice(dataList[index].items[i].price.dices, 1, dataList[index].items[i].price.sides, dataList[index].items[i].price.modifier)).result * game.settings.get("wfrp4e-looting", "modifier"));
					items.price.sum += price;
					items.list.push({item: item, price: price, type: dataList[index].typeLabel, tableName: game.wfrp4e.tables.findTable(dataList[index].items[i].table.key, dataList[index].items[i].table.column).name});
				};
				if (roll.cs) {a--};
			};
		};
	};
	if (items.price.sum != 0) {
		switch (dataList[index].typeLabel) {
			case game.i18n.localize("MARKET.Abbrev.BP").toLowerCase(): {
				items.price.bp = items.price.sum;
				items.price.sum = "";
				while (items.price.bp >= 12) {
					items.price.ss += 1;
					items.price.bp -= 12;
				};
				while (items.price.ss >= 20) {
					items.price.gc += 1;
					items.price.ss -= 20;
				};
				if (items.price.gc != 0) {items.price.sum += items.price.gc + game.i18n.localize("MARKET.Abbrev.GC").toLowerCase()};
				if (items.price.ss != 0) {items.price.sum += items.price.ss + game.i18n.localize("MARKET.Abbrev.SS").toLowerCase()};
				if (items.price.bp != 0) {items.price.sum += items.price.bp + game.i18n.localize("MARKET.Abbrev.BP").toLowerCase()};
				break;
			};
			case game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(): {
				items.price.ss = items.price.sum;
				items.price.sum = "";
				while (items.price.ss >= 20) {
					items.price.gc += 1;
					items.price.ss -= 20;
				};
				if (items.price.gc != 0) {items.price.sum += items.price.gc + game.i18n.localize("MARKET.Abbrev.GC").toLowerCase()};
				if (items.price.ss != 0) {items.price.sum += items.price.ss + game.i18n.localize("MARKET.Abbrev.SS").toLowerCase()};
				break;
			};
			case game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(): {
				items.price.sum += game.i18n.localize("MARKET.Abbrev.GC").toLowerCase();
				break;
			};
		};
	} else if (items.list.length != 0) {items.price.sum = `0${dataList[index].typeLabel}`};
	items.list.sort((a, b) => a.item.localeCompare(b.item));
	if (items.list.length == 0 && money.gc == 0 && money.ss == 0 && money.bp == 0) {notEmpty = false};
	//Вывод сообщения в чат
	const chatDataTemplate = await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-looting/templates/chatMessage.hbs", {user: game.user.id, notEmpty: notEmpty, money: money.text, items: {list: items.list, price: items.price.sum}});
	let chatData = {
		user: game.user.id,
		content: chatDataTemplate,
		flavor: game.i18n.localize("WFRP4E.Looting.Name") + ": " + dataList[index].name
	};
	ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));
	ChatMessage.create(chatData);
	if (game.settings.get("wfrp4e-looting", "closeAfterRoll")) {html.closest("#WFRP4eLooting_Menu").remove()};
};

window.edit = async function(index) {
	let customPresetTemplate = await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-looting/templates/customPreset/menu.hbs", {preset: dataList[index], index: index});
	let customPresetButtons;
	if (dataList[index].disabled) {
		customPresetButtons = {
			copy: {
				icon: "<i class='fas fa-copy'></i>",
				label: game.i18n.localize("WFRP4E.Looting.Dialog.Copy.Title"),
				callback: () => {
					navigator.clipboard.writeText(JSON.stringify(dataList[index]));
					ui.notifications.info(game.i18n.localize("WFRP4E.Looting.Dialog.Copy.Hint"));
				}
			},
			back: {
				icon: "<i class='fas fa-backward'></i>",
				label: game.i18n.localize("WFRP4E.Looting.Dialog.Back"),
				callback: () => {
					if (!document.getElementById("WFRP4eLooting_Menu")) {
						showMenu();
					};
				}
			}
		};
	}
	else {
		customPresetButtons = {
			copy: {
				icon: "<i class='fas fa-copy'></i>",
				label: game.i18n.localize("WFRP4E.Looting.Dialog.Copy.Title"),
				callback: () => {
					navigator.clipboard.writeText(JSON.stringify(dataList[index]));
					ui.notifications.info(game.i18n.localize("WFRP4E.Looting.Dialog.Copy.Hint"));
				}
			},
			paste: {
				icon: "<i class='fas fa-paste'></i>",
				label: game.i18n.localize("WFRP4E.Looting.Dialog.Paste.Title"),
				callback: async () => {
					let clipboardData;
					try {
						clipboardData = JSON.parse(await navigator.clipboard.readText());
						clipboardData.disabled = false;
						dataList[index] = clipboardData;
						await saveData();
						//Удаление шаблона из меню
						if (document.getElementById("WFRP4eLooting_Menu")) {
							document.getElementById("WFRP4eLooting_Menu").getElementsByClassName("dialog-content")[0].innerHTML = await generateLootingData();
						};
						ui.notifications.info(game.i18n.localize("WFRP4E.Looting.Dialog.Paste.Hint"))
					} catch (e) {
						return ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Dialog.Paste.Error"))
					}
				}
			},
			save: {
				icon: "<i class='fas fa-save'></i>",
				label: game.i18n.localize("WFRP4E.Looting.Dialog.Save.Title"),
				callback: async (html) => {
					let items = [];
					let itemsData = html[0].getElementsByClassName("items");
					for (let i = 0; i < itemsData.length; i++) {
						items.push({table: {key: itemsData[i].getElementsByClassName("table_key")[0].value == "" ? "looting" : itemsData[i].getElementsByClassName("table_key")[0].value, column: itemsData[i].getElementsByClassName("table_column")[0].value}, chance: Math.min(100, Math.max(0, html[0].getElementsByClassName("item_chance")[0].value)), dices: Math.max(1, html[0].getElementsByClassName("item_dices")[0].value), sides: itemsData[i].getElementsByClassName("item_sides")[0].value, price: {dices: Math.max(1, html[0].getElementsByClassName("price_dices")[0].value), sides: itemsData[i].getElementsByClassName("price_sides")[0].value, modifier: itemsData[i].getElementsByClassName("price_modifier")[0].value == "" ? 0 : itemsData[i].getElementsByClassName("price_modifier")[0].value}});
					};
					let typeLabel = "";
					switch (html[0].getElementsByClassName("type")[0].value) {
						case "brass": typeLabel = game.i18n.localize("MARKET.Abbrev.BP").toLowerCase(); break;
						case "silver": typeLabel = game.i18n.localize("MARKET.Abbrev.SS").toLowerCase(); break;
						case "gold": typeLabel = game.i18n.localize("MARKET.Abbrev.GC").toLowerCase(); break;
					};
					dataList[index] = {
						disabled: false,
						name: html[0].getElementsByClassName("name")[0].value == "" ? game.i18n.localize("WFRP4E.Looting.Dialog.Presets.Description.DefaultValue") : html[0].getElementsByClassName("name")[0].value,
						hint: html[0].getElementsByClassName("hint")[0].value,
						type: html[0].getElementsByClassName("type")[0].value,
						typeLabel: typeLabel,
						money: {bp: {chance: Math.min(100, Math.max(0, html[0].getElementsByClassName("bp_chance")[0].value)), dices: Math.max(1, html[0].getElementsByClassName("bp_dices")[0].value), sides: html[0].getElementsByClassName("bp_sides")[0].value}, ss: {chance: Math.min(100, Math.max(0, html[0].getElementsByClassName("ss_chance")[0].value)), dices: Math.max(1, html[0].getElementsByClassName("ss_dices")[0].value), sides: html[0].getElementsByClassName("ss_sides")[0].value}, gc: {chance: Math.min(100, Math.max(0, html[0].getElementsByClassName("gc_chance")[0].value)), dices: Math.max(1, html[0].getElementsByClassName("gc_dices")[0].value), sides: html[0].getElementsByClassName("gc_sides")[0].value}},
						items: items
					};
					//Сохранение пользовательских таблиц
					await saveData();
					//Обновление окна
					if (document.getElementById("WFRP4eLooting_Menu")) {
						document.getElementById("WFRP4eLooting_Menu").getElementsByClassName("dialog-content")[0].innerHTML = await generateLootingData();
					};
				}
			},
			back: {
				icon: "<i class='fas fa-backward'></i>",
				label: game.i18n.localize("WFRP4E.Looting.Dialog.Back"),
				callback: () => {
					if (!document.getElementById("WFRP4eLooting_Menu")) {
						showMenu();
					};
				}
			},
			delete: {
				icon: "<i class='fas fa-trash'></i>",
				label: game.i18n.localize("WFRP4E.Looting.Dialog.Remove"),
				callback: (html) => {
					window.parent.delete(index);
				}
			}
		};
	};
	showPreset(index, customPresetTemplate, customPresetButtons);
};

window.create = async function(html) {
	dataList.push({
		disabled: false,
		name: game.i18n.localize("WFRP4E.Looting.Dialog.Presets.Description.DefaultValue"),
		hint: "",
		type: "brass",
		typeLabel: game.i18n.localize("MARKET.Abbrev.BP").toLowerCase(),
		money: {gc: {chance: 0, dices: 1, sides: 1}, ss: {chance: 0, dices: 1, sides: 1}, bp: {chance: 0, dices: 1, sides: 1}},
		items: []
	});
	window.parent.edit(dataList.length - 1);
	//Сохранение пользовательских таблиц
	await saveData();
	//Вставка новой кнопки в меню
	if (document.getElementById("WFRP4eLooting_Menu")) {
		html.insertAdjacentHTML("beforebegin", `<button onclick="window.parent.looting(this, ${dataList.length - 1})" oncontextmenu="window.parent.edit(${dataList.length - 1})" class="custom ${dataList[dataList.length - 1].type} id_${dataList.length - 1}" data-tooltip="${dataList[dataList.length - 1].name}<br>${dataList[dataList.length - 1].hint}<br><br>${game.i18n.localize("WFRP4E.Looting.Dialog.Presets.Hint")}">${dataList[dataList.length - 1].name}</button>`);
	};
};

window.delete = async function(index) {
	//Удаление шаблона
	dataList.splice(index, 1);
	//Сохранение пользовательских таблиц
	await saveData();
	//Удаление шаблона из меню
	if (document.getElementById("WFRP4eLooting_Menu")) {
		document.getElementById("WFRP4eLooting_Menu").getElementsByClassName(`id_${index}`)[0].remove();
	};
};



/*
Старый код для изъянов. В процессе добавления.
switch (type) {
	case "flaws_weapon": {
		let i = 0
		while (i < count) {
			result("<p><b>" + game.i18n.localize("WFRP4E.Looting.FlawsWeapon") + ":</b> <i>" + await rollFlaws("flaws-weapon") + "</i></p>")
			i++
		}
		break
	}
	case "flaws_armour": {
		let i = 0
		while (i < count) {
			result("<p><b>" + game.i18n.localize("WFRP4E.Looting.FlawsArmour") + ":</b> <i>" + await rollFlaws("flaws-armour") + "</i></p>")
			i++
		}
		break
	}
}
	
async function rollFlaws(type) {
	let table = game.wfrp4e.tables.findTable("looting", type) || ui.notifications.error(game.i18n.localize("WFRP4E.Looting.ErrorImport"))
	let flaw = "@Property[" + (await table.roll()).results[0].name + "]"
	if (flaw == "@Property[reroll]") {
		flaw = (await rollFlaws(type)) + ", " + (await rollFlaws(type))
	}
	return flaw
}
*/