Hooks.once("ready", () => {
	game.settings.register("wfrp4e-looting", "currentMenu", {
		scope: "client",
		config: false,
		default: "loot",
		type: String
	});
	game.settings.register("wfrp4e-looting", "customPresets", {
		scope: "world",
		config: false,
		default: [],
		type: Array
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
});

Hooks.on("getSceneControlButtons", (buttons) => {
	buttons.notes.tools.menuWFRP4eLooting = {
		name: "menuWFRP4eLooting",
		title: game.i18n.localize("WFRP4E.Looting.Name"),
		icon: "fas fa-treasure-chest",
		button: true,
		onChange: () => {showMenu()}
	};
});

Hooks.on("chatMessage", (html, content, msg) => {
	let regExp;
	regExp = /(\S+)/g;
	let commands = content.match(regExp);
	let command = commands[0];

	if (command === "/loot") {
		game.settings.set("wfrp4e-looting", "currentMenu", "loot");
		showMenu();
		return false;
	}
});

function defaultData() {
	let defaultList = [
		{
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.Hovel.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Hovel.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.House.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.House.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.Estate.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Estate.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.WizardsHouse.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.WizardsHouse.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.Workshop.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Workshop.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.Shrine.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Shrine.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.Temple.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Temple.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.SmallMonster.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.SmallMonster.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.LargeMonster.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.LargeMonster.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestOpen.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestOpen.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestSecure.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestSecure.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestVault.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.ChestVault.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.Peasant.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Peasant.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.Citizen.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Citizen.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.Noble.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Noble.Title"),
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
			name: game.i18n.localize("WFRP4E.Looting.DefaultList.Wizard.Name"),
			hint: game.i18n.localize("WFRP4E.Looting.DefaultList.Wizard.Title"),
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
	];

	return defaultList;
};

function lootTables() {
	let tables = [];
	tables.push({
		table: "DomesticItems",
		title: game.i18n.localize("WFRP4E.Looting.Tables.DomesticItems"),
		weights: 10,
		values: [
			{name: game.i18n.localize("WFRP4E.Looting.DomesticItems.CandelabraCandles"), weight: 1},
			{name: game.i18n.localize("WFRP4E.Looting.DomesticItems.CupsGlasses"), weight: 1},
			{name: game.i18n.localize("WFRP4E.Looting.DomesticItems.Cutlery"), weight: 1},
			{name: game.i18n.localize("WFRP4E.Looting.DomesticItems.Goblets"), weight: 1},
			{name: game.i18n.localize("WFRP4E.Looting.DomesticItems.LanternOil"), weight: 1},
			{name: game.i18n.localize("WFRP4E.Looting.DomesticItems.PipeTobacco"), weight: 1},
			{name: game.i18n.localize("WFRP4E.Looting.DomesticItems.PlatesBowls"), weight: 1},
			{name: game.i18n.localize("WFRP4E.Looting.DomesticItems.Teaware"), weight: 1},
			{name: game.i18n.localize("WFRP4E.Looting.DomesticItems.WineSpirits"), weight: 1},
			{name: game.i18n.localize("WFRP4E.Looting.Tables.OtherTrapping.Name"), weight: 1}
		],
		price: [1, 10]
	});
	tables.push({
		table: "GemsJewellery-brass",
		type: "brass",
		title: game.i18n.localize("WFRP4E.Looting.Tables.GemsJewellery"),
		weights: 200,
		values: [
			{name: game.i18n.localize("WFRP4E.Looting.GemsBrass.Amber"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsBrass.Agate"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsBrass.Hematite"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsBrass.LapisLazuli"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsBrass.Malachite"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsBrass.Rhodocrosite"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsBrass.Obsidian"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsBrass.Quartz"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsBrass.TigerEye"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsBrass.Turquoise"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Amulet"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Armlet"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Bracelet"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Brooch"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Chain"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Choker"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Circlet"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.CuffLinks"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Earrings"), weight: 9},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Hairpin"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Hatpin"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Locket"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Medallion"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Necklace"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Pendant"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.PocketWatch"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.PrayerBeads"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.RingDecorative"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.RingPromise"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.RingWedding"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.SignetRing"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Torc"), weight: 5},
		],
		price: [2, 10]
	});
	tables.push({
		table: "GemsJewellery-silver",
		type: "silver",
		title: game.i18n.localize("WFRP4E.Looting.Tables.GemsJewellery"),
		weights: 200,
		values: [
			{name: game.i18n.localize("WFRP4E.Looting.GemsSilver.Amethyst"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsSilver.Aquamarine"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsSilver.Bloodstone"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsSilver.Citrine"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsSilver.Jasper"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsSilver.Moonstone"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsSilver.Onyx"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsSilver.Peridot"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsSilver.Topaz"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsSilver.Zircon"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Amulet"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Armlet"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Bracelet"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Brooch"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Chain"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Choker"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Circlet"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.CuffLinks"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Earrings"), weight: 9},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Hairpin"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Hatpin"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Locket"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Medallion"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Necklace"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Pendant"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.PocketWatch"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.PrayerBeads"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.RingDecorative"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.RingPromise"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.RingWedding"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.SignetRing"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Torc"), weight: 5},
		],
		price: [2, 10]
	});
	tables.push({
		table: "GemsJewellery-gold",
		type: "gold",
		title: game.i18n.localize("WFRP4E.Looting.Tables.GemsJewellery"),
		weights: 200,
		values: [
			{name: game.i18n.localize("WFRP4E.Looting.GemsGold.Beryl"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsGold.Diamond"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsGold.Emerald"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsGold.Garnet"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsGold.Jade"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsGold.Opal"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsGold.Pearl"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsGold.Ruby"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsGold.Sapphire"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.GemsGold.Spinel"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Amulet"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Armlet"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Bracelet"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Brooch"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Chain"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Choker"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Circlet"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.CuffLinks"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Earrings"), weight: 9},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Hairpin"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Hatpin"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Locket"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Medallion"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Necklace"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Pendant"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.PocketWatch"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.PrayerBeads"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.RingDecorative"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.RingPromise"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.RingWedding"), weight: 4},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.SignetRing"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.Jewellery.Torc"), weight: 5},
		],
		price: [2, 10]
	});
	tables.push({
		table: "ObjetsdArt",
		title: game.i18n.localize("WFRP4E.Looting.Tables.ObjetsdArt"),
		weights: 100,
		values: [
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Abacus"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.CarvedDragonEgg"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.CeremonialWeapon"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Chalice"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.CostumeMask"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.CrownFalse"), weight: 2},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.CrownReal"), weight: 1},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.DecorativeComb"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Doll"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.EngravedDice"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Figurine"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Flask"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Flute"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.FramedPortrait"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.GameBoardPieces"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.HarpToy"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Idol"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Instrument"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.IvoryDrinkingHorn"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.JewelleryBox"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.LargeStatue"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.LetterOpener"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.MiniSarcophagus"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.MusicBox"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Orrery"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Painting"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Paperweight"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.PewterMug"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Sceptre"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.SmallMirror"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Statuette"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.Vase"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.WarMask"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ObjetsdArt.WoodCarving"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.Tables.OtherTrapping.Name"), weight: 1}
		],
		price: [2, 10, "*5"]
	});
	tables.push({
		table: "ClothesFursHangings",
		title: game.i18n.localize("WFRP4E.Looting.Tables.ClothesFursHangings"),
		weights: 100,
		values: [
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.AnimalPelt"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Belt"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Blankets"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.BootsShoes"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Cape"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Cloak"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.ClothesFine"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.ClothesPractical"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.ClothesTravel"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Coat"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Costume"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.CourtlyGarb"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.DrapesFine"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Embroidery"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.FurCoat"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.FurStole"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.GlovesFine"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.GlovesPractical"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.HandkerchiefSilk"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.HatFancy"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.HatPractical"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.LinensFine"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.LinensPractical"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Pouch"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Purse"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Robes"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.RugFine"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.RugWoven"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Shawl"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Tapestry"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.Uniform"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.WalkingCane"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.ClothesFursHangings.WallHanging"), weight: 3},
			{name: game.i18n.localize("WFRP4E.Looting.Tables.OtherTrapping.Name"), weight: 1}
		],
		price: [1, 10]
	});
	/*
	tables.push({
		table: "Other-PacksContainers",
		title: `${game.i18n.localize("WFRP4E.Looting.Tables.OtherTrapping.PacksContainers")} (${game.i18n.localize("WFRP4E.Looting.Tables.OtherTrapping.Name")})`,
		weights: 100,
		values: [
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.Backpack"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.Barrel"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.Cask"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.Flask"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.Jug"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.PewterStein"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.Pouch"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.Purse"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.Sack"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.SackLarge"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.Saddlebags"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.SlingBag"), weight: 10},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.ScrollCase"), weight: 5},
			{name: game.i18n.localize("WFRP4E.Looting.OtherTrapping.PacksContainers.Waterskin"), weight: 10}
		],
		price: [0, 0]
	});
	*/

	return tables;
};

async function showMenu() {
	let buttonsList = {
		generate: {
			action: "generate",
			icon: "<i class='fas fa-dice-d20'></i>",
			label: game.i18n.localize("WFRP4E.Looting.Menu.Generate.Title"),
			callback: () => {game.settings.set("wfrp4e-looting", "currentMenu", "generate")}
		},
		loot: {
			action: "loot",
			icon: "<i class='fas fa-treasure-chest'></i>",
			label: game.i18n.localize("WFRP4E.Looting.Menu.Loot.Title"),
			callback: () => {game.settings.set("wfrp4e-looting", "currentMenu", "loot")}
		},
		tables: {
			action: "tables",
			icon: "<i class='fas fa-table-list'></i>",
			label: game.i18n.localize("WFRP4E.Looting.Menu.Tables.Title"),
			callback: () => {game.settings.set("wfrp4e-looting", "currentMenu", "table")}
		}
	};

	let title = "";
	let buttons = [];
	let params = {};
	/*В работе
	switch (game.settings.get("wfrp4e-looting", "currentMenu")) {
		case "generate": {
			title = game.i18n.localize("WFRP4E.Looting.Menu.Generate.Title");

			buttons.push(buttonsList.loot, buttonsList.tables);
			break;
		};
		case "loot": {
			title = game.i18n.localize("WFRP4E.Looting.Menu.Loot.Title");

			buttons.push(buttonsList.generate, buttonsList.tables);

			params.default = defaultData();
			params.custom = game.settings.get("wfrp4e-looting", "customPresets");
			break;
		};
		case "tables": {
			title = game.i18n.localize("WFRP4E.Looting.Menu.Tables.Title");

			buttons.push(buttonsList.generate, buttonsList.loot);
			break;
		}
	};
	*/
	//Временная затычка:
	title = game.i18n.localize("WFRP4E.Looting.Menu.Loot.Title");
	params.default = defaultData();
	params.custom = game.settings.get("wfrp4e-looting", "customPresets");
	buttons.push({
		action: "close",
		icon: "<i class='fas fa-window-close'></i>",
		label: game.i18n.localize("Close")
	});

	let lootMenu = await new foundry.applications.api.DialogV2({
		window: {title: title},
		content: await foundry.applications.handlebars.renderTemplate(`modules/wfrp4e-looting/templates/${game.settings.get("wfrp4e-looting", "currentMenu")}.hbs`, {params}),
		buttons: buttons,
		actions: {
			click: async (event, button) => {
				let type = button.dataset.type;
				let id = button.dataset.id;
				if (button.classList.value.includes("add") || event.altKey || event.ctrlKey) {
					let allTables = lootTables();
					let tablePreset = "<div class='body'>"
						+ "\t{{TABLE}}"
						+ "\t<div style='width: 32%;'>"
						+ "\t\t<input id='chance' type='range' value='50' min='0' max='100'>"
						+ "\t\t<output>50%</output>"
						+ "\t</div>"
						+ "\t<div style='width: 16%;'>"
						+ "\t\t<input id='diceCount' style='flex: 2;' type='number' value='1' min='1' step='1'>"
						+ "\t\t<span style='flex: 1;'>d</span>"
						+ "\t\t<select id='diceType' style='flex: 3;'>"
						+ "\t\t\t<option>1</option>"
						+ "\t\t\t<option>2</option>"
						+ "\t\t\t<option>5</option>"
						+ "\t\t\t<option selected>10</option>"
						+ "\t\t\t<option>20</option>"
						+ "\t\t\t<option>100</option>"
						+ "\t\t</select>"
						+ "\t</div>"
						+ "\t<button type='button' data-action='removeTable' style='width: 4%;' data-tooltip='" + game.i18n.localize("WFRP4E.Looting.Menu.Loot.Table.Remove") + "'><i class='fas fa-trash'></i></button>"
						+ "</div>";
					if (button.classList.value.includes("add")) {
						params.custom.push({
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
						});
						game.settings.set("wfrp4e-looting", "customPresets", params.custom);
						id = params.custom.length - 1;
						lootMenu.element.querySelector("button.add").insertAdjacentHTML("beforebegin", `<button type="button" class="brass" data-action="click" data-type="custom" data-id="${id}" data-tooltip="${game.i18n.localize("Description")}<hr>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.Ctrl")}">${game.i18n.localize("Name")}</button>`)
					} else if (event.ctrlKey) {
						params.custom.push(params[type][id]);
						game.settings.set("wfrp4e-looting", "customPresets", params.custom);
						type = "custom";
						id = params.custom.length - 1;
						lootMenu.element.querySelector("button.add").insertAdjacentHTML("beforebegin", `<button type="button" class="${params.custom[id].type}" data-action="click" data-type="custom" data-id="${id}" data-tooltip="${params.custom[id].hint}<hr>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.Ctrl")}">${params.custom[id].name}</button>`)
					};
					let editPresetButtons = [];
					if (type == "custom") {editPresetButtons.push({
						action: "remove",
						icon: "<i class='fas fa-trash'></i>",
						label: game.i18n.localize("Delete"),
						callback: () => {
							if (lootMenu.element) {
								lootMenu.element.querySelector(`button[data-type="custom"][data-id="${id}"]`).remove();

								let buttons = lootMenu.element.querySelectorAll("button[data-type='custom']");
								buttons.forEach((button, index) => {if (!button.classList.value.includes("add")) {button.dataset.id = index}});

								params.custom.splice(id, 1);
								game.settings.set("wfrp4e-looting", "customPresets", params.custom);
							} else {
								let newCustomPresets = game.settings.get("wfrp4e-looting", "customPresets");
								newCustomPresets.splice(id, 1);
								game.settings.set("wfrp4e-looting", "customPresets", newCustomPresets);
							};
						}
					})};
					editPresetButtons.push({
						icon: "<i class='fas fa-save'></i>",
						action: "save",
						label: type == "custom" ? game.i18n.localize("Save") : game.i18n.localize("Close"),
						callback: (event, button) => {
							let element = button.closest("footer.form-footer").previousElementSibling;
							if (type == "custom") {
								let newPreset = {
									name: element.querySelector("#name").value,
									hint: element.querySelector("#hint").value,
									type: element.querySelector("#type").value,
									money: {
										bp: {
											chance: element.querySelector("#BP-chance").value,
											dice: {count: element.querySelector("#BP-diceCount").value, type: Number(element.querySelector("#BP-diceType").value)}
										},
										ss: {
											chance: element.querySelector("#SS-chance").value,
											dice: {count: element.querySelector("#SS-diceCount").value, type: Number(element.querySelector("#SS-diceType").value)}
										},
										gc: {
											chance: element.querySelector("#GC-chance").value,
											dice: {count: element.querySelector("#GC-diceCount").value, type: Number(element.querySelector("#GC-diceType").value)}
										}
									},
									tables: Array.from(element.querySelectorAll("#tables > li")).map(t => ({
										table: t.querySelector("#table").value ? t.querySelector("#table").value : {key: t.querySelector("#tableKey").value, column: t.querySelector("#tableColumn").value},
										chance: t.querySelector("#chance").value,
										dice: {count: t.querySelector("#diceCount").value, type: Number(t.querySelector("#diceType").value)}
									}))
								};
								if (lootMenu.element) {
									let buttonPreset = lootMenu.element.querySelector(`button[data-type="custom"][data-id="${id}"]`);
									buttonPreset.classList.value = newPreset.type;
									buttonPreset.dataset.tooltip = `${newPreset.hint}<hr>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.Ctrl")}`;
									buttonPreset.textContent = newPreset.name;

									params.custom[id] = newPreset;
									game.settings.set("wfrp4e-looting", "customPresets", params.custom);
								} else {
									let newCustomPresets = game.settings.get("wfrp4e-looting", "customPresets");
									newCustomPresets[id] = newPreset;
									game.settings.set("wfrp4e-looting", "customPresets", newCustomPresets);
								};
							};
						}
					});
					let editPreset = await new foundry.applications.api.DialogV2({
						window: {title: game.i18n.localize(`WFRP4E.Looting.Menu.Loot.Preset.${type}`)},
						content: await foundry.applications.handlebars.renderTemplate(`modules/wfrp4e-looting/templates/loot/editPreset.hbs`, {preset: params[type][id], tables: allTables, type}),
						buttons: editPresetButtons,
						actions: {
							addTable: (event, button) => {
								let table = document.createElement("li");
								table.innerHTML = tablePreset.replace("{{TABLE}}", ("<select id='table' style='width: 48%;'>"
									+ `\t<option hidden disabled selected value="false">${game.i18n.localize("WFRP4E.Looting.Menu.Loot.Table.Select")}</option>`
									+ allTables.map(tab => `\t<option data-tooltip="${game.i18n.localize("Cost")}: <span style='color: var(--presetType);'>${tab.price} <i class='fas fa-coins'></i></span><br>${game.i18n.localize("WFRP4E.Looting.Menu.Loot.Table.Values")} (${tab.weights}):<ul>${tab.values.map(v => "<li>" + v.name + " (" + v.weight + ")</li>").join("")}</ul> value='${tab.table}'"${tab.type ? " data-type='" + tab.type + "'": ""}>${tab.title}</option>`).join("\n")
									+ "</select>"));
								table.querySelector("input#chance").addEventListener("input", (e) => {e.target.nextElementSibling.value = e.target.value + "%"});
								table.querySelector("select#table").addEventListener("change", (e) => {e.target.dataset.tooltip = e.target.querySelector("option:checked").dataset.tooltip});
								button.closest("div.tables").querySelector("ul#tables").insertAdjacentElement("beforeend", table);
							},
							addCustomTable: (event, button) => {
								let table = document.createElement("li");
								table.innerHTML = tablePreset.replace("{{TABLE}}", ("<div class='table' style='width: 48%;'>"
									+ `\t<input id="tableKey" style="flex: 1;" type="string" value="" placeholder="${game.i18n.localize("TABLE.Key")}">`
									+ `\t<input id="tableColumn" style="flex: 1;" type="string" value="" placeholder="${game.i18n.localize("TABLE.Column")}">`
									+ "</div>"));
								table.querySelector("input#chance").addEventListener("input", (e) => {e.target.nextElementSibling.value = e.target.value + "%"});
								button.closest("div.tables").querySelector("ul#tables").insertAdjacentElement("beforeend", table);
							},
							removeTable: (event, button) => {
								button.closest("li").remove();
							}
						},
						classes: ["WFRP4eLooting_editPreset"]
					}).render(true);

					document.documentElement.style.setProperty("--presetType", `var(--${editPreset.element.querySelector("select#type").querySelector("option:checked").value})`);
					editPreset.element.querySelector("select#type").addEventListener("change", (element) => {
						element.target.classList.value = element.target.querySelector("option:checked").value;
						document.documentElement.style.setProperty("--presetType", `var(--${element.target.querySelector("option:checked").value})`);
						let selectTables = editPreset.element.querySelectorAll("select#table");
						selectTables.forEach(selectTable => {
							if (selectTable.querySelector("option:checked").dataset.type && selectTable.querySelector("option:checked").dataset?.type != element.target.querySelector("option:checked").value) {
								selectTable.querySelector("option:checked").selected = false;
								selectTable.querySelector(`option[data-type="${element.target.querySelector("option:checked").value}"]`).selected = true;
								selectTable.dataset.tooltip = selectTable.querySelector("option:checked").dataset.tooltip;
							};
						});
					});

					let chances = editPreset.element.querySelectorAll("input#BP-chance, input#SS-chance, input#GC-chance, input#chance");
					chances.forEach(chance => {
						chance.addEventListener("input", (element) => {element.target.nextElementSibling.value = element.target.value + "%"});
					});
					if (editPreset.element.querySelector("ul#tables").children.length) {
						let selectTables = editPreset.element.querySelectorAll("select#table");
						selectTables.forEach(selectTable => {
							selectTable.dataset.tooltip = selectTable.querySelector("option:checked").dataset.tooltip;
							selectTable.addEventListener("change", (element) => {element.target.dataset.tooltip = element.target.querySelector("option:checked").dataset.tooltip});
						});
					};
				} else {
					looting(params[type][id]);
				};
			}
		},
		classes: ["WFRP4eLooting"]
	}, {height: "unset"}).render(true);
};

async function looting(preset) {
	//Определение значения денежной награды
	let money = {bp: 0, ss: 0, gc: 0};
	for (let key in money) {
		if ((await new Roll("1d100").roll()).total <= preset.money[key].chance) {
			let roll = await new Roll(`${preset.money[key].dice.count}d${preset.money[key].dice.type}`).roll();
			let critical = async () => {
				let criticalRoll = (await new Roll(`1d${preset.money[key].dice.type}`).roll()).total;
				if (criticalRoll == preset.money[key].dice.type) {criticalRoll += await critical()};
				return criticalRoll;
			};
			for (let v in roll.dice[0].values) {
				money[key] += roll.dice[0].values[v];
				if (roll.dice[0].values[v] == preset.money[key].dice.type && preset.money[key].dice.type != 1) {money[key] += (await critical())};
			};
		};
	};
	//Конверсия денег
	money.bp = Math.round((money.bp + (money.ss * 12) + (money.gc * 20 * 12)) * game.settings.get("wfrp4e-looting", "modifier"));
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

	//Определение предметов по таблицам
	let items = [];
	for (let key in preset.tables) {
		let tableItems = [];
		if ((await new Roll("1d100").roll()).total <= preset.tables[key].chance) {
			let count = 0;
			for (let i = 0; i < preset.tables[key].dice.count; i++) {
				let roll = (await new Roll(`1d${preset.tables[key].dice.type}`).roll()).total;
				count += roll;
				if (roll == preset.tables[key].dice.type && preset.tables[key].dice.type != 1) {i--};
			};
			for (let i = 0; i < count; i++) {
				if (preset.tables[key].table?.key) {
					let table = game.wfrp4e.tables.findTable(preset.tables[key].table.key, preset.tables[key].table.column);
					let item = (await table.roll()).results;
					for (let r in item) {
						let price = table.description.match(/(?<=\{price: ).*?(?=\ loot})/g)[0].split(",");
						switch (preset.type) {
							case "brass": price = {bp: (await new Roll(`${price[0]}d${price[1]} ${price[2] || "+0"}`).roll()).total, ss: 0, gc: 0}; break;
							case "silver": price = {bp: 0, ss: (await new Roll(`${price[0]}d${price[1]} ${price[2] || "+0"}`).roll()).total, gc: 0}; break;
							case "gold": price = {bp: 0, ss: 0, gc: (await new Roll(`${price[0]}d${price[1]} ${price[2] || "+0"}`).roll()).total}; break;
						};
						price.bp = Math.round((price.bp + (price.ss * 12) + (price.gc * 20 * 12)) * game.settings.get("wfrp4e-looting", "modifier") * (game.settings.get("wfrp4e-looting", "itemsModifier") ? 0.5 : 1 ));
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
						tableItems.push({item: item[r], price: price, tableName: table.name});
					};
				} else {
					let table = lootTables().find(t => t.table == preset.tables[key].table);
					let item = [];
					table.values.forEach(t => item = item.concat(Array(t.weight).fill(t.name)));
					item = item[Math.floor(Math.random() * table.weights)];
					let price = {};
					switch (preset.type) {
						case "brass": price = {bp: (await new Roll(`${table.price[0]}d${table.price[1]} ${table.price[2] || "+0"}`).roll()).total, ss: 0, gc: 0}; break;
						case "silver": price = {bp: 0, ss: (await new Roll(`${table.price[0]}d${table.price[1]} ${table.price[2] || "+0"}`).roll()).total, gc: 0}; break;
						case "gold": price = {bp: 0, ss: 0, gc: (await new Roll(`${table.price[0]}d${table.price[1]} ${table.price[2] || "+0"}`).roll()).total}; break;
					};
					price.bp = Math.round((price.bp + (price.ss * 12) + (price.gc * 20 * 12)) * game.settings.get("wfrp4e-looting", "modifier") * (game.settings.get("wfrp4e-looting", "itemsModifier") ? 0.5 : 1 ));
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
					tableItems.push({item: item, price: price, table: table.title});
				};
			};
		};
		items = items.concat(tableItems.sort((a, b) => a.item.localeCompare(b.item)));
	};

	let params = {
		flavor: game.i18n.localize("WFRP4E.Looting.Name") + " (" + preset.name + ")",
		user: game.user.character?.name || "",
		status: {
			money: (money.bp == 0 && money.ss == 0 && money.gc == 0) ? false : true,
			items: items.length ? true : false,
			value: false
		},
		price: {bp: 0, ss: 0, gc: 0}
	};
	for (let key in items) {
		params.price.bp += parseInt(items[key].price.bp);
		params.price.ss += parseInt(items[key].price.ss);
		params.price.gc += parseInt(items[key].price.gc);
	};
	params.price.bp = params.price.bp + (params.price.ss * 12) + (params.price.gc * 20 * 12);
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
	//Вывод сообщения в чат
	let chatData = {
		user: game.user.id,
		content: await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-looting/templates/loot/chat.hbs", {money, items, params}),
		flavor: params.flavor
	};
	ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));
	ChatMessage.create(chatData);
};

Hooks.on("renderChatMessage", (message, html, data) => {
	if (html[0].querySelector("div#WFRP4eLooting_Message")) {
		html[0].querySelector(".message-content").querySelectorAll("a.action-link").forEach(button => {
			button.addEventListener("click", (element) => {
				if (element.target.closest("li[data-type='item']")) {
					if (element.target.closest("ul").children.length == 1) {
						element.target.closest("ul").previousElementSibling.remove();
						element.target.closest("ul").remove();
					} else {
						let args = element.target.closest("ul").previousElementSibling.querySelector("a").dataset.args;
						let newAmount = args.split(" amount=")[1];
						newAmount = {
							bp: parseInt(newAmount.split(game.i18n.localize("MARKET.Abbrev.BP"))[0]),
							ss: parseInt(newAmount.split(game.i18n.localize("MARKET.Abbrev.BP"))[1].split(game.i18n.localize("MARKET.Abbrev.SS"))[0]),
							gc: parseInt(newAmount.split(game.i18n.localize("MARKET.Abbrev.SS"))[1].split(game.i18n.localize("MARKET.Abbrev.GC"))[0])
						};
						newAmount.bp = newAmount.bp + (newAmount.ss * 12) + (newAmount.gc * 20 * 12);

						let value = element.target.closest("a").dataset.args.split(" amount=")[1];
						value = {
							bp: parseInt(value.split(game.i18n.localize("MARKET.Abbrev.BP"))[0]),
							ss: parseInt(value.split(game.i18n.localize("MARKET.Abbrev.BP"))[1].split(game.i18n.localize("MARKET.Abbrev.SS"))[0]),
							gc: parseInt(value.split(game.i18n.localize("MARKET.Abbrev.SS"))[1].split(game.i18n.localize("MARKET.Abbrev.GC"))[0])
						};
						value.bp = value.bp + (value.ss * 12) + (value.gc * 20 * 12);

						newAmount.bp -= value.bp;
						newAmount.ss = 0;
						newAmount.gc = 0;

						while (newAmount.bp >= 12) {
							newAmount.ss += 1;
							newAmount.bp -= 12;
						};
						while (newAmount.ss >= 20) {
							newAmount.gc += 1;
							newAmount.ss -= 20;
						};

						element.target.closest("ul").previousElementSibling.querySelector("a").dataset.args = `${args.split(" amount=")[0]} amount=${newAmount.bp}${game.i18n.localize("MARKET.Abbrev.BP")}${newAmount.ss}${game.i18n.localize("MARKET.Abbrev.SS")}${newAmount.gc}${game.i18n.localize("MARKET.Abbrev.GC")}`;
						element.target.closest("ul").previousElementSibling.querySelector("a").innerHTML = `<i class="fas fa-coins"></i>${newAmount.bp ? "<b style='margin: 0 1px;'>" + newAmount.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</b>" : ""}${newAmount.ss ? "<b style='margin: 0 1px;'>" + newAmount.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</b>" : ""}${newAmount.gc ? "<b style='margin: 0 1px;'>" + newAmount.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</b>" : ""}`;
						element.target.closest("li[data-type='item']").remove()
					};
				}
				else if (element.target.closest(`p[data-type="money"]`)) {element.target.closest(`p[data-type="money"]`).remove()}
				else if (element.target.closest(`p[data-type="items"]`)) {
					element.target.closest(`p[data-type="items"]`).nextElementSibling.remove();
					element.target.closest(`p[data-type="items"]`).remove();
				};
				message.update({"content": html[0].querySelector("div#WFRP4eLooting_Message").outerHTML});
			});
		});
	};
});


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