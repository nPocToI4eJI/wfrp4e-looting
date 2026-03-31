Hooks.once("init", () => {
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
		scope: "client",
		config: true,
		default: true,
		type: Boolean
	});
});

Hooks.once("ready", () => {
	game.wfrp4e.looting = {
		data: {
			defaultList: [
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
			],
			lootTables: [
				{
					table: "DomesticItems",
					title: game.i18n.localize("WFRP4E.Looting.Tables.DomesticItems"),
					weights: 10,
					hidden: false,
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
					price: {count: 1, type: 10, mod: ""}
				},
				{
					table: "GemsJewellery-brass",
					type: "brass",
					title: game.i18n.localize("WFRP4E.Looting.Tables.GemsJewellery"),
					weights: 200,
					hidden: false,
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
					price: {count: 2, type: 10, mod: ""}
				},
				{
					table: "GemsJewellery-silver",
					type: "silver",
					title: game.i18n.localize("WFRP4E.Looting.Tables.GemsJewellery"),
					weights: 200,
					hidden: false,
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
					price: {count: 2, type: 10, mod: ""}
				},
				{
					table: "GemsJewellery-gold",
					type: "gold",
					title: game.i18n.localize("WFRP4E.Looting.Tables.GemsJewellery"),
					weights: 200,
					hidden: false,
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
					price: {count: 2, type: 10, mod: ""}
				},
				{
					table: "ObjetsdArt",
					title: game.i18n.localize("WFRP4E.Looting.Tables.ObjetsdArt"),
					weights: 100,
					hidden: false,
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
					price: {count: 2, type: 10, mod: "*5"}
				},
				{
					table: "ClothesFursHangings",
					title: game.i18n.localize("WFRP4E.Looting.Tables.ClothesFursHangings"),
					weights: 100,
					hidden: false,
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
					price: {count: 1, type: 10, mod: ""}
				},
				{
					table: "Other-PacksContainers",
					title: `${game.i18n.localize("WFRP4E.Looting.Tables.OtherTrapping.PacksContainers")} (${game.i18n.localize("WFRP4E.Looting.Tables.OtherTrapping.Name")})`,
					weights: 100,
					hidden: true,
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
					]
				}
			],
			defaultTables: [
				{
					name: game.i18n.localize("WFRP4E.Looting.Menu.Tables.Flaws.Weapon.Title"),
					hint: game.i18n.localize("WFRP4E.Looting.Menu.Tables.Flaws.Weapon.Hint"),
					action: "flaws",
					type: "weapon"
				},
				{
					name: game.i18n.localize("WFRP4E.Looting.Menu.Tables.Flaws.Armour.Title"),
					hint: game.i18n.localize("WFRP4E.Looting.Menu.Tables.Flaws.Armour.Hint"),
					action: "flaws",
					type: "armour"
				},
				{
					name: game.i18n.localize("WFRP4E.Looting.Menu.Tables.Loot.Title"),
					hint: game.i18n.localize("WFRP4E.Looting.Menu.Tables.Loot.Hint"),
					action: "randLoot"
				}
			],
			flaws: {
				weapon: {
					default: [
						{value: "bulky", name: game.i18n.localize("PROPERTY.Bulky"), weight: 10},
						{value: "dangerous", name: game.i18n.localize("PROPERTY.Dangerous"), weight: 15},
						{value: "imprecise", name: game.i18n.localize("PROPERTY.Imprecise"), weight: 10},
						{value: "shoddy", name: game.i18n.localize("PROPERTY.Shoddy"), weight: 15},
						{value: "slow", name: game.i18n.localize("PROPERTY.Slow"), weight: 10},
						{value: "ugly", name: game.i18n.localize("PROPERTY.Ugly"), weight: 10},
						{value: "undamaging", name: game.i18n.localize("PROPERTY.Undamaging"), weight: 10},
						{value: "unreliable", name: game.i18n.localize("PROPERTY.Unreliable"), weight: 15},
						{value: "roll", weight: 5},
					]
				},
				armour: {
					default: [
						{value: "bulky", name: game.i18n.localize("PROPERTY.Bulky"), weight: 15},
						{value: "partial", name: game.i18n.localize("PROPERTY.Partial"), weight: 15},
						{value: "shoddy", name: game.i18n.localize("PROPERTY.Shoddy"), weight: 20},
						{value: "ugly", name: game.i18n.localize("PROPERTY.Ugly"), weight: 15},
						{value: "unreliable", name: game.i18n.localize("PROPERTY.Unreliable"), weight: 15},
						{value: "weakpoints", name: game.i18n.localize("PROPERTY.Weakpoints"), weight: 15},
						{value: "roll", weight: 5},
					]
				}
			},
			generator: {
				names: Object.assign({
					any: game.i18n.localize("WFRP4E.Looting.Menu.Generator.Names.Any"),
					trapping: game.i18n.localize("WFRP4E.Looting.Menu.Generator.Names.trapping"),
					type: game.i18n.localize("WFRP4E.Looting.Menu.Generator.Names.Type"),
					melee: game.i18n.localize("WFRP4E.Looting.Menu.Generator.Names.Melee"),
					range: game.i18n.localize("WFRP4E.Looting.Menu.Generator.Names.Range"),
					armour: game.i18n.localize("WFRP4E.Looting.Menu.Generator.Names.Armour")
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
						label: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Hereditary.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Hereditary.Title"),
						color: "salmon",
						types: "melee,range",
						value: game.i18n.localize("WFRP4E.Looting.Menu.Generator.RatioOfProperties.1"),
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
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Hereditary.Names.a.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Hereditary.Names.a.2")
							],
							b: [
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Hereditary.Names.b.1")
							]
						}
					},
					{
						id: "desecrated",
						label: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Desecrated.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Desecrated.Title"),
						color: "orchid",
						types: "melee,range",
						value: game.i18n.localize("WFRP4E.Looting.Menu.Generator.RatioOfProperties.0"),
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
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Desecrated.Names.a.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Desecrated.Names.a.2"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Desecrated.Names.a.3"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Desecrated.Names.a.4")
							],
							b: [
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Desecrated.Names.b.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Desecrated.Names.b.2"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Desecrated.Names.b.3"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Desecrated.Names.b.4")
							]
						}
					},
					{
						id: "mysterious",
						label: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Mysterious.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Mysterious.Title"),
						color: "cyan",
						types: "trapping,melee,range,armour",
						value: game.i18n.localize("WFRP4E.Looting.Menu.Generator.RatioOfProperties.0"),
						qualities: [
							{chance: 50, name: "magical", quantity: 1},
							{chance: 50, name: "lightweight", quantity: 1},
							{chance: 25, name: "all", quantity: 2}
						],
						flaws: [
							{chance: 50, name: "ugly", quantity: 1},
							{chance: 50, name: "shoddy", quantity: 1},
							{chance: 25, name: "all", quantity: 2}
						],
						names: {
							a: [
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Mysterious.Names.a.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Mysterious.Names.a.2")
							]
						}
					},
					{
						id: "heroic",
						label: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Heroic.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Heroic.Title"),
						color: "goldenrod",
						types: "trapping,melee,range,armour",
						value: game.i18n.localize("WFRP4E.Looting.Menu.Generator.RatioOfProperties.>2"),
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
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Heroic.Names.a.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Heroic.Names.a.2"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Heroic.Names.a.3")
							],
							b: [
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Heroic.Names.b.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Heroic.Names.b.2"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Heroic.Names.b.3"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Heroic.Names.b.4")
							]
						}
					},
					{
						id: "ancient",
						label: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Ancient.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Ancient.Title"),
						color: "slateblue",
						types: "trapping,melee,range,armour",
						value: game.i18n.localize("WFRP4E.Looting.Menu.Generator.RatioOfProperties.2"),
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
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Ancient.Names.a.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Ancient.Names.a.2")
							],
							b: [
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Ancient.Names.b.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Ancient.Names.b.2"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Ancient.Names.b.3")
							]
						}
					},
					{
						id: "magical",
						label: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Title"),
						color: "violet",
						types: "trapping,melee,range,armour",
						value: game.i18n.localize("WFRP4E.Looting.Menu.Generator.RatioOfProperties.2"),
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
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Names.a.1")
							],
							b: [
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Names.b.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Names.b.2"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Names.b.3"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Names.b.4"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Names.b.5"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Names.b.6"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Names.b.7"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Names.b.8"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Magical.Names.b.9")
							]
						}
					},
					{
						id: "damaged",
						label: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Damaged.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Damaged.Title"),
						color: "gray",
						types: "trapping,melee,range,armour",
						value: game.i18n.localize("WFRP4E.Looting.Menu.Generator.RatioOfProperties.-1"),
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
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Damaged.Names.a.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Damaged.Names.a.2")
							]
						}
					},
					{
						id: "fatal",
						label: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Fatal.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Fatal.Title"),
						color: "khaki",
						types: "trapping,melee,range,armour",
						value: game.i18n.localize("WFRP4E.Looting.Menu.Generator.RatioOfProperties.-2"),
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
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Fatal.Names.a.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Fatal.Names.a.2")
							],
							b: [
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Fatal.Names.b.1")
							]
						}
					},
					{
						id: "insignificant",
						label: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Insignificant.Name"),
						hint: game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Insignificant.Title"),
						color: "orange",
						types: "trapping,melee,range,armour",
						value: game.i18n.localize("WFRP4E.Looting.Menu.Generator.RatioOfProperties.<-2"),
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
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Insignificant.Names.a.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Insignificant.Names.a.2"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Insignificant.Names.a.3"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Insignificant.Names.a.4"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Insignificant.Names.a.5")
							],
							b: [
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Insignificant.Names.b.1"),
								game.i18n.localize("WFRP4E.Looting.GeneratorPresets.Insignificant.Names.b.2")
							]
						}
					},
					{
						id: "fine",
						label: game.i18n.localize("PROPERTY.Fine"),
						hint: game.i18n.localize("WFRP4E.Properties.Fine"),
						color: "green",
						types: "trapping,melee,range,armour",
						hasValue: true,
						qualities: [{chance: 100, name: "fine", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Fine")]}
					},
					{
						id: "unbreakable",
						label: game.i18n.localize("PROPERTY.Unbreakable"),
						hint: game.i18n.localize("WFRP4E.Properties.Unbreakable"),
						color: "green",
						types: "trapping,melee,range,armour",
						qualities: [{chance: 100, name: "unbreakable", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Unbreakable")]}
					},
					{
						id: "lightweight",
						label: game.i18n.localize("PROPERTY.Lightweight"),
						hint: game.i18n.localize("WFRP4E.Properties.Lightweight"),
						color: "green",
						types: "trapping,melee,range,armour",
						qualities: [{chance: 100, name: "lightweight", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Lightweight")]}
					},
					{
						id: "practical",
						label: game.i18n.localize("PROPERTY.Practical"),
						hint: game.i18n.localize("WFRP4E.Properties.Practical"),
						color: "green",
						types: "trapping,melee,range,armour",
						qualities: [{chance: 100, name: "practical", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Practical")]}
					},
					{
						id: "durable",
						label: game.i18n.localize("PROPERTY.Durable"),
						hint: game.i18n.localize("WFRP4E.Properties.Durable"),
						color: "green",
						types: "trapping,melee,range,armour",
						hasValue: true,
						qualities: [{chance: 100, name: "durable", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Durable")]}
					},
					{
						id: "penetrating",
						label: game.i18n.localize("PROPERTY.Penetrating"),
						hint: game.i18n.localize("WFRP4E.Properties.Penetrating"),
						color: "green",
						types: "melee,range",
						qualities: [{chance: 100, name: "penetrating", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Penetrating")]}
					},
					{
						id: "fast",
						label: game.i18n.localize("PROPERTY.Fast"),
						hint: game.i18n.localize("WFRP4E.Properties.Fast"),
						color: "green",
						types: "melee,range",
						qualities: [{chance: 100, name: "fast", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Fast")]}
					},
					{
						id: "damaging",
						label: game.i18n.localize("PROPERTY.Damaging"),
						hint: game.i18n.localize("WFRP4E.Properties.Damaging"),
						color: "green",
						types: "melee,range",
						qualities: [{chance: 100, name: "damaging", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Damaging")]}
					},
					{
						id: "defensive",
						label: game.i18n.localize("PROPERTY.Defensive"),
						hint: game.i18n.localize("WFRP4E.Properties.Defensive"),
						color: "green",
						types: "melee,range",
						qualities: [{chance: 100, name: "defensive", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Defensive")]}
					},
					{
						id: "trapblade",
						label: game.i18n.localize("PROPERTY.TrapBlade"),
						hint: game.i18n.localize("WFRP4E.Properties.TrapBlade"),
						color: "green",
						types: "melee",
						qualities: [{chance: 100, name: "trapblade", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.TrapBlade")]}
					},
					{
						id: "entangle",
						label: game.i18n.localize("PROPERTY.Entangle"),
						hint: game.i18n.localize("WFRP4E.Properties.Entangle"),
						color: "green",
						types: "melee",
						qualities: [{chance: 100, name: "entangle", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Entangle")]}
					},
					{
						id: "wrap",
						label: game.i18n.localize("PROPERTY.Wrap"),
						hint: game.i18n.localize("WFRP4E.Properties.Wrap"),
						color: "green",
						types: "melee",
						qualities: [{chance: 100, name: "wrap", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Wrap")]}
					},
					{
						id: "distract",
						label: game.i18n.localize("PROPERTY.Distract"),
						hint: game.i18n.localize("WFRP4E.Properties.Distract"),
						color: "green",
						types: "melee",
						qualities: [{chance: 100, name: "distract", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Distract")]}
					},
					{
						id: "pummel",
						label: game.i18n.localize("PROPERTY.Pummel"),
						hint: game.i18n.localize("WFRP4E.Properties.Pummel"),
						color: "green",
						types: "melee,range",
						qualities: [{chance: 100, name: "pummel", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Pummel")]}
					},
					{
						id: "trip",
						label: game.i18n.localize("PROPERTY.Trip"),
						hint: game.i18n.localize("WFRP4E.Properties.Trip"),
						color: "green",
						types: "melee",
						qualities: [{chance: 100, name: "trip", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Trip")]}
					},
					{
						id: "impale",
						label: game.i18n.localize("PROPERTY.Impale"),
						hint: game.i18n.localize("WFRP4E.Properties.Impale"),
						color: "green",
						types: "melee,range",
						qualities: [{chance: 100, name: "impale", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Impale")]}
					},
					{
						id: "hack",
						label: game.i18n.localize("PROPERTY.Hack"),
						hint: game.i18n.localize("WFRP4E.Properties.Hack"),
						color: "green",
						types: "melee,range",
						qualities: [{chance: 100, name: "hack", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Hack")]}
					},
					{
						id: "slash",
						label: game.i18n.localize("PROPERTY.Slash"),
						hint: game.i18n.localize("WFRP4E.Properties.Slash"),
						color: "green",
						types: "melee",
						qualities: [{chance: 100, name: "slash", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Slash")]}
					},
					{
						id: "impact",
						label: game.i18n.localize("PROPERTY.Impact"),
						hint: game.i18n.localize("WFRP4E.Properties.Impact"),
						color: "green",
						types: "melee",
						qualities: [{chance: 100, name: "impact", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Impact")]}
					},
					{
						id: "precise",
						label: game.i18n.localize("PROPERTY.Precise"),
						hint: game.i18n.localize("WFRP4E.Properties.Precise"),
						color: "green",
						types: "melee,range",
						qualities: [{chance: 100, name: "precise", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Precise")]}
					},
					{
						id: "accurate",
						label: game.i18n.localize("PROPERTY.Accurate"),
						hint: game.i18n.localize("WFRP4E.Properties.Accurate"),
						color: "green",
						types: "range",
						qualities: [{chance: 100, name: "accurate", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Accurate")]}
					},
					{
						id: "impenetrable",
						label: game.i18n.localize("PROPERTY.Impenetrable"),
						hint: game.i18n.localize("WFRP4E.Properties.Impenetrable"),
						color: "green",
						types: "armour",
						qualities: [{chance: 100, name: "impenetrable", quantity: 1}],
						flaws: [],
						names: {a: [game.i18n.localize("PROPERTY.Impenetrable")]}
					},
					{
						id: "bulky",
						label: game.i18n.localize("PROPERTY.Bulky"),
						hint: game.i18n.localize("WFRP4E.Properties.Bulky"),
						color: "red",
						types: "trapping,melee,range,armour",
						qualities: [],
						flaws: [{chance: 100, name: "bulky", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Bulky")]}
					},
					{
						id: "ugly",
						label: game.i18n.localize("PROPERTY.Ugly"),
						hint: game.i18n.localize("WFRP4E.Properties.Ugly"),
						color: "red",
						types: "trapping,melee,range,armour",
						qualities: [],
						flaws: [{chance: 100, name: "ugly", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Ugly")]}
					},
					{
						id: "unreliable",
						label: game.i18n.localize("PROPERTY.Unreliable"),
						hint: game.i18n.localize("WFRP4E.Properties.Unreliable"),
						color: "red",
						types: "trapping,melee,range,armour",
						qualities: [],
						flaws: [{chance: 100, name: "unreliable", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Unreliable")]}
					},
					{
						id: "shoddy",
						label: game.i18n.localize("PROPERTY.Shoddy"),
						hint: game.i18n.localize("WFRP4E.Properties.Shoddy"),
						color: "red",
						types: "trapping,melee,range,armour",
						qualities: [],
						flaws: [{chance: 100, name: "shoddy", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Shoddy")]}
					},
					{
						id: "tiring",
						label: game.i18n.localize("PROPERTY.Tiring"),
						hint: game.i18n.localize("WFRP4E.Properties.Tiring"),
						color: "red",
						types: "melee,range",
						qualities: [],
						flaws: [{chance: 100, name: "tiring", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Tiring")]}
					},
					{
						id: "slow",
						label: game.i18n.localize("PROPERTY.Slow"),
						hint: game.i18n.localize("WFRP4E.Properties.Slow"),
						color: "red",
						types: "melee,range",
						qualities: [],
						flaws: [{chance: 100, name: "slow", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Slow")]}
					},
					{
						id: "unbalanced",
						label: game.i18n.localize("PROPERTY.Unbalanced"),
						hint: game.i18n.localize("WFRP4E.Properties.Unbalanced"),
						color: "red",
						types: "melee,range",
						qualities: [],
						flaws: [{chance: 100, name: "unbalanced", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Unbalanced")]}
					},
					{
						id: "imprecise",
						label: game.i18n.localize("PROPERTY.Imprecise"),
						hint: game.i18n.localize("WFRP4E.Properties.Imprecise"),
						color: "red",
						types: "melee,range",
						qualities: [],
						flaws: [{chance: 100, name: "imprecise", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Imprecise")]}
					},
					{
						id: "dangerous",
						label: game.i18n.localize("PROPERTY.Dangerous"),
						hint: game.i18n.localize("WFRP4E.Properties.Dangerous"),
						color: "red",
						types: "melee,range",
						qualities: [],
						flaws: [{chance: 100, name: "dangerous", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Dangerous")]}
					},
					{
						id: "undamaging",
						label: game.i18n.localize("PROPERTY.Undamaging"),
						hint: game.i18n.localize("WFRP4E.Properties.Undamaging"),
						color: "red",
						types: "melee,range",
						qualities: [],
						flaws: [{chance: 100, name: "undamaging", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Undamaging")]}
					},
					{
						id: "partial",
						label: game.i18n.localize("PROPERTY.Partial"),
						hint: game.i18n.localize("WFRP4E.Properties.Partial"),
						color: "red",
						types: "armour",
						qualities: [],
						flaws: [{chance: 100, name: "partial", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Partial")]}
					},
					{
						id: "weakpoints",
						label: game.i18n.localize("PROPERTY.Weakpoints"),
						hint: game.i18n.localize("WFRP4E.Properties.Weakpoints"),
						color: "red",
						types: "armour",
						qualities: [],
						flaws: [{chance: 100, name: "weakpoints", quantity: 1}],
						names: {a: [game.i18n.localize("PROPERTY.Weakpoints")]}
					}
				]
			}
		}
	};
});

let socket;
Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerModule("wfrp4e-looting");

    socket.register("wfrp4e-looting:editHTML", (id, content) => {
		document.querySelector(`.chat-message.message[data-message-id="${id}"] div#WFRP4eLooting_Message`).innerHTML = content;
	});
    socket.register("wfrp4e-looting:editMessage", (message, content) => {game.messages.get(message).update({"content": content})});
});

Hooks.on("getSceneControlButtons", (buttons) => {
	buttons.notes.tools.menuWFRP4eLooting = {
		name: "menuWFRP4eLooting",
		title: game.i18n.localize("WFRP4E.Looting.Name"),
		icon: "fas fa-treasure-chest",
		button: true,
		onChange: () => {checkMenu()}
	};
});

Hooks.on("chatMessage", (html, content, msg) => {
	let regExp;
	regExp = /(\S+)/g;
	let commands = content.match(regExp);
	let command = commands[0];

	if (command === "/loot") {
		game.settings.set("wfrp4e-looting", "currentMenu", "loot");
		checkMenu();
		return false;
	} else if (command === "/generator") {
		game.settings.set("wfrp4e-looting", "currentMenu", "generator");
		checkMenu();
		return false;
	}
});

async function showMenu(title, buttons, params) {
	if (game.settings.get("wfrp4e-looting", "currentMenu") == "loot") {
		try {document.querySelector("dialog.WFRP4eLooting-loot").remove()} catch {};
		let lootMenu = await new foundry.applications.api.DialogV2({
			window: {title: title},
			content: await foundry.applications.handlebars.renderTemplate(`modules/wfrp4e-looting/templates/${game.settings.get("wfrp4e-looting", "currentMenu")}.hbs`, {params}),
			buttons: buttons,
			actions: {
				preset: async (event, button) => {
					let type = button.dataset.type;
					let id = button.dataset.id;
					if (button.classList.value.includes("add") || event.altKey || event.ctrlKey) {
						let allTables = game.wfrp4e.looting.data.lootTables.filter(t => !t.hidden);
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
							lootMenu.element.querySelector("button.add").insertAdjacentHTML("beforebegin", `<button type="button" class="brass" data-action="preset" data-type="custom" data-id="${id}" data-tooltip="${game.i18n.localize("Description")}<hr>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.Ctrl")}">${game.i18n.localize("Name")}</button>`)
						} else if (event.ctrlKey) {
							params.custom.push(params[type][id]);
							game.settings.set("wfrp4e-looting", "customPresets", params.custom);
							type = "custom";
							id = params.custom.length - 1;
							lootMenu.element.querySelector("button.add").insertAdjacentHTML("beforebegin", `<button type="button" class="${params.custom[id].type}" data-action="preset" data-type="custom" data-id="${id}" data-tooltip="${params.custom[id].hint}<hr>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.Alt")}<br>${game.i18n.localize("WFRP4E.Looting.Menu.Hint.Ctrl")}">${params.custom[id].name}</button>`)
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
											table:
												t.querySelector("#table") ? t.querySelector("#table").value :
												t.querySelector("#tableID") ? {id: t.querySelector("#tableID").value} :
												{key: t.querySelector("#tableKey").value, column: t.querySelector("#tableColumn").value},
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
						let updateChances = (element) => {
							element.addEventListener("input", (e) => {e.target.nextElementSibling.value = e.target.value + "%"});
						};
						let updateTable = (element) => {
							element.addEventListener("change", (e) => {e.target.dataset.tooltip = e.target.querySelector("option:checked").dataset.tooltip});
						};
						let updateCustomTable = (element) => {
							element.addEventListener("change", (e) => {
								let parent = e.target.parentElement;
								let table = game.tables.filter(i => i.getFlag("wfrp4e", "key") == parent.querySelector("input#tableKey").value && i.getFlag("wfrp4e", "column") == parent.querySelector("input#tableColumn").value);

								if (table.length) {
									table = table[0];
									let tablePrice = $(table.description).filter("p#tablePrice")[0];
									if (tablePrice) {
										tablePrice = tablePrice?.textContent?.split("|") || [0, 1, "+0"];
										parent.dataset.tooltip = `${game.i18n.localize("DOCUMENT.RollTable")}: "${table.name}"<hr>${game.i18n.localize("Cost")}: <span style='color: var(--presetType);'>${tablePrice[0]}d${tablePrice[1]}${tablePrice[2] || ""} <i class='fas fa-coins'></i></span>`;
									};
								} else {parent.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Menu.Loot.Table.AddCustom.Missing")};
							});
						};
						let updateItem = (element) => {
							element.addEventListener("change", (e) => {
								let item = game.items.get(e.target.value.replace("Item.", "")) || false;
								if (item) {e.target.dataset.tooltip = game.i18n.localize("DOCUMENT.Item") + ": \"" + item.name + "\"<hr>" + game.i18n.localize("Cost") + ": <span>" + [
									item.price.bp ? "<span style='color: var(--brass);'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</span>" : false,
									item.price.ss ? "<span style='color: var(--silver);'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</span>" : false,
									item.price.gc ? "<span style='color: var(--gold);'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</span>" : false
								].filter(Boolean).join(" ") || 0}
								else {e.target.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Menu.Loot.Table.AddItem.Missing")};
							});
						};
						let editPreset = await new foundry.applications.api.DialogV2({
							window: {title: game.i18n.localize(`WFRP4E.Looting.Menu.Loot.Preset.${type}`)},
							content: await foundry.applications.handlebars.renderTemplate(`modules/wfrp4e-looting/templates/loot/editPreset.hbs`, {preset: params[type][id], tables: allTables, type}),
							buttons: editPresetButtons,
							actions: {
								addTable: (event, button) => {
									let table = document.createElement("li");
									table.innerHTML = tablePreset.replace("{{TABLE}}", ("<select id='table' style='width: 48%;'>"
										+ `\t<option hidden disabled selected value="false">${game.i18n.localize("WFRP4E.Looting.Menu.Loot.Table.Select")}</option>`
										+ allTables.map(tab => `\t<option data-tooltip="${tab.price ? game.i18n.localize("Cost") + "<span style='color: var(--presetType);'>" + tab.price.count + "d" + tab.price.type + tab.price.mod + "<i class='fas fa-coins'></i></span><hr>" : ""}${game.i18n.localize("WFRP4E.Looting.Menu.Loot.Table.Values")} (${tab.weights}):<ul>${tab.values.map(v => "<li>" + v.name + " (" + v.weight + ")</li>").join("")}</ul> value='${tab.table}'"${tab.type ? " data-type='" + tab.type + "'": ""}>${tab.title}</option>`).join("\n")
										+ "</select>"));
									updateChances(table.querySelector("input#chance"));
									updateTable(table.querySelector("select#table"));
									button.closest("div.tables").querySelector("ul#tables").insertAdjacentElement("beforeend", table);
								},
								addCustomTable: (event, button) => {
									let table = document.createElement("li");
									table.innerHTML = tablePreset.replace("{{TABLE}}", ("<div class='table' style='width: 48%;'>"
										+ `\t<input id="tableKey" style="flex: 1;" type="string" value="" placeholder="${game.i18n.localize("TABLE.Key")}">`
										+ `\t<input id="tableColumn" style="flex: 1;" type="string" value="" placeholder="${game.i18n.localize("TABLE.Column")}">`
										+ "</div>"));
									updateChances(table.querySelector("input#chance"));
									updateCustomTable(table.querySelector("input#tableKey"));
									updateCustomTable(table.querySelector("input#tableColumn"));
									button.closest("div.tables").querySelector("ul#tables").insertAdjacentElement("beforeend", table);
								},
								addItem: (event, button) => {
									let table = document.createElement("li");
									table.innerHTML = tablePreset.replace("{{TABLE}}", ("<input id='tableID' style='width: 48%; text-align: center;' type='string' value='' placeholder='UUID'>"));
									updateChances(table.querySelector("input#chance"));
									updateItem(table.querySelector("input#tableID"));
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
							editPreset.element.querySelectorAll("select#table").forEach(e => {
								if (e.querySelector("option:checked").dataset.type && e.querySelector("option:checked").dataset?.type != element.target.querySelector("option:checked").value) {
									e.querySelector("option:checked").selected = false;
									e.querySelector(`option[data-type="${element.target.querySelector("option:checked").value}"]`).selected = true;
									e.dataset.tooltip = e.querySelector("option:checked").dataset.tooltip;
								};
							});
						});

						editPreset.element.querySelectorAll("input#BP-chance, input#SS-chance, input#GC-chance, input#chance").forEach(e => {updateChances(e)});

						editPreset.element.querySelectorAll("div.table").forEach(e => {
							let table = game.tables.filter(i => i.getFlag("wfrp4e", "key") == e.querySelector("input#tableKey").value && i.getFlag("wfrp4e", "column") == e.querySelector("input#tableColumn").value);

							if (table.length) {
								table = table[0];
								let tablePrice = $(table.description).filter("p#tablePrice")[0]?.textContent?.split("|") || [0, 1, "+0"];
								e.dataset.tooltip = `${game.i18n.localize("DOCUMENT.RollTable")}: "${table.name}"<hr>${game.i18n.localize("Cost")}: <span style='color: var(--presetType);'>${tablePrice[0]}d${tablePrice[1]}${tablePrice[2] || ""} <i class='fas fa-coins'></i></span>`;
							} else {e.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Menu.Loot.Table.AddCustom.Missing")};

							updateCustomTable(e.querySelector("input#tableKey"));
							updateCustomTable(e.querySelector("input#tableColumn"));
						});

						editPreset.element.querySelectorAll("input#tableID").forEach(e => {
							let item = game.items.get(e.value.replace("Item.", "")) || false;
							if (item) {e.dataset.tooltip = game.i18n.localize("DOCUMENT.Item") + ": \"" + item.name + "\"<hr>" + game.i18n.localize("Cost") + ": <span>" + [
								item.price.bp ? "<span style='color: var(--brass);'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</span>" : false,
								item.price.ss ? "<span style='color: var(--silver);'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</span>" : false,
								item.price.gc ? "<span style='color: var(--gold);'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</span>" : false
							].filter(Boolean).join(" ") || 0}
							else {e.dataset.tooltip = game.i18n.localize("WFRP4E.Looting.Menu.Loot.Table.AddItem.Missing")};

							updateItem(e);
						});

						if (editPreset.element.querySelector("ul#tables").children.length) {
							editPreset.element.querySelectorAll("select#table").forEach(e => {
								e.dataset.tooltip = e.querySelector("option:checked").dataset.tooltip;
								e.addEventListener("change", (element) => {element.target.dataset.tooltip = element.target.querySelector("option:checked").dataset.tooltip});
							});
						};
					} else {
						looting(params[type][id]);
					};
				}
			},
			classes: ["WFRP4eLooting", "WFRP4eLooting-loot"]
		}, {height: "unset"}).render(true);
	} else	if (game.settings.get("wfrp4e-looting", "currentMenu") == "tables") {
		try {document.querySelector("dialog.WFRP4eLooting-tables").remove()} catch {};
		let tableMenu = await new foundry.applications.api.DialogV2({
			window: {title: title},
			content: await foundry.applications.handlebars.renderTemplate(`modules/wfrp4e-looting/templates/${game.settings.get("wfrp4e-looting", "currentMenu")}.hbs`, {params}),
			buttons: buttons,
			actions: {
				randLoot: (event, button) => {
					let id = button.parentElement.querySelector("select").value.split("|");
					let preset;
					if (id[0] == "rand") {
						preset = params.loot.default.concat(params.loot.custom);
						preset = preset[Math.floor(Math.random() * preset.length)];
					} else {preset = params.loot[id[1]][id[0]]};
					looting(preset);
				},
				flaws: async (event, button) => {
					let item = button.parentElement.querySelector("select").value;
					if (item == "none") {return};

					item = (await fromUuid(item)).toObject();
					item.system.price = {
						bp: item.system.price.bp + item.system.price.ss * 12 + item.system.price.gc * 240,
						ss: 0,
						gc: 0
					};
					let getFlaws = (flaw = []) => {
						let table = game.wfrp4e.looting.data.flaws[button.dataset.type].default;
						let newFlaw = [];
						let weights = 0;
						table.forEach(t => {
							newFlaw = newFlaw.concat(Array(t.weight).fill({value: t.value, name: t.name || ""}));
							weights += t.weight;
						});
						newFlaw = newFlaw[Math.floor(Math.random() * weights)];
						if (newFlaw.value == "roll") {return flaw.concat(getFlaws(flaw), getFlaws())}
						else {return flaw.concat([newFlaw])};
					};
					let flaws = getFlaws();
					flaws.forEach(f => {
						item.system.flaws.value = item.system.flaws.value.concat({name: f.value, value: null});
						item.system.price.bp = Math.floor(item.system.price.bp / 2);
					});
					while (item.system.price.bp >= 12) {item.system.price.ss += 1; item.system.price.bp -= 12};
					while (item.system.price.ss >= 20) {item.system.price.gc += 1; item.system.price.ss -= 20};

					let actor = game.user.character;
					if (!actor) {
						ui.notifications.notify(game.i18n.localize("WFRP4E.Looting.Menu.Tables.Flaws.Complete") + flaws.map(f => f.name).join(", ") + ".");
						item = new ItemWFRP4e(item);
						item.postItem(1);
					} else {
						ChatMessage.create(ChatMessage.applyRollMode({
							user: game.user.id,
							content: `<p style="text-align: center;font-size: 14px;"><b>${actor.link}</b> ${game.i18n.format("WFRP4E.Looting.Chat.Flaws", {item: item.name})} <i>${flaws.map(f => f.name).join(", ")}</i>.</p>`,
							flavor: game.i18n.localize("WFRP4E.Looting.Name")
						}, game.settings.get("core", "rollMode")));
						actor.createEmbeddedDocuments("Item", [item]);
					};
				}
			},
			classes: ["WFRP4eLooting", "WFRP4eLooting-tables"]
		}, {height: "unset"}).render(true);
	} else	if (game.settings.get("wfrp4e-looting", "currentMenu") == "generator") {
		try {document.querySelector("dialog.WFRP4eLooting-generator").remove()} catch {};
		let generatorMenu = await new foundry.applications.api.DialogV2({
			window: {title: title},
			content: await foundry.applications.handlebars.renderTemplate(`modules/wfrp4e-looting/templates/${game.settings.get("wfrp4e-looting", "currentMenu")}.hbs`, {params}),
			buttons: buttons,
			actions: {
				create: async (event, button) => {
					let item = (await fromUuid(button.parentElement.querySelector("select#item").value)).toObject();
					let presets = Array.from(button.parentElement.querySelectorAll("div.presets > label:has(> input:checked)")).map(p => p.dataset.id);
					let names = {a: [""], b: [""], c: [""]};
					let notification = [];

					for (let i = 0; i < presets.length; i++) {
						let preset = game.wfrp4e.looting.data.generator.presets.find(p => p.id == presets[i]);

						let getProperties = async (p, type) => {
							for (let a = 0; a < p.quantity; a++) {
								if ((await new Roll("1d100").roll()).total <= p.chance) {
									let prop;
									let value = 1;
									if (Object.assign({}, game.wfrp4e.utility.qualityList(), game.wfrp4e.utility.flawList())[p.name]) {
										prop = p.name;
										value = button.parentElement.querySelector(`div.presets > label:has(> input:checked)[data-id="${preset.id}"]`).dataset.value || 1;
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
												prop = getRandomArrayElement(props[button.parentElement.querySelector("select#type > option:checked").dataset.type]);
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
									if (game.wfrp4e.config.propertyHasValue[prop] && item.system[type].value.find(v => v.name == prop && game.wfrp4e.config.propertyHasValue[v.name])) {
										item.system[type].value.find(v => v.name == prop).value = item.system[type].value.find(v => v.name == prop).value + value;
									} else {
										item.system[type].value.push({name: prop, value: value > 1 ? value : undefined});
									};
									value > 1 ? notification.push(Object.assign({}, game.wfrp4e.utility.qualityList(), game.wfrp4e.utility.flawList())[prop] + " (" + value + ")") : notification.push(Object.assign({}, game.wfrp4e.utility.qualityList(), game.wfrp4e.utility.flawList())[prop]);

									let price = {gc: 0, ss: 0, bp: item.system.price.bp + (item.system.price.ss * 12) + (item.system.price.gc * 20 * 12)};
									if (type == "qualities") {price.bp *= 2}
									else {price.bp = Math.round(price.bp / 2)};
									while (price.bp >= 12) {
										price.ss += 1;
										price.bp -= 12;
									};
									while (price.ss >= 20) {
										price.gc += 1;
										price.ss -= 20;
									};
									item.system.price = price;
								};
							};
						};
						for (let a = 0; a < preset.qualities.length; a++) {await getProperties(preset.qualities[a], "qualities")};
						for (let a = 0; a < preset.flaws.length; a++) {await getProperties(preset.flaws[a], "flaws")};

						names.a = names.a.concat(preset.names?.a);
						names.b = names.b.concat(preset.names?.b);
						names.c = names.c.concat(preset.names?.c);
					};

					names.a = names.a[Math.floor( (Math.random() * names.a.length) )];
					names.b = names.b[Math.floor( (Math.random() * names.b.length) )];
					names.c = names.c.concat([names.a, item.name, names.b].filter(Boolean).join(" ")).filter(Boolean);
					names.c = names.c[Math.floor( (Math.random() * names.c.length) )];
					item.name = names.c;

					let result;
					if (game.settings.get("wfrp4e-looting", "editName")) {
						result = await foundry.applications.api.DialogV2.prompt({
							window: {title: game.i18n.localize("WFRP4E.Looting.Menu.Generator.Name")},
							content: `<input name="name" type="text" value="${item.name}" autofocus>`,
							ok: {
								label: game.i18n.localize("Submit"),
								callback: (event, button, dialog) => {item.name = button.form.elements.name.value}
							}
						});
						if (!result) {return};
					};
					ui.notifications.notify(game.i18n.localize("WFRP4E.Looting.Menu.Generator.Complete") + notification.join(", ") + ".");
					await Item.implementation.create((new ItemWFRP4e(item)), {renderSheet: true});
				}
			},
			classes: ["WFRP4eLooting", "WFRP4eLooting-generator"]
		}, {height: "unset"}).render(true);

		let updateType = (e) => {
			let type = e.value;

			generatorMenu.element.querySelector("button[data-action='create']").hidden = true;

			generatorMenu.element.querySelectorAll("div.base_item").forEach(d => {
				let dataType = e.querySelector("option:checked").dataset.type;
				if (d.classList.value.includes(dataType)) {d.hidden = false}
				else {d.hidden = true};
				updateItem(e.target);
			});

			e.nextElementSibling.querySelectorAll(`option[data-type="${type}"]`).forEach(o => {o.hidden = false});
			e.nextElementSibling.querySelectorAll(`option:not([data-type="${type}"])`).forEach(o => {
				if (o.dataset.type) {
					o.hidden = true;
					o.selected = false;
				} else {
					o.hidden = false;
					o.selected = true;
				};
			});

			generatorMenu.element.querySelector("div.presets").hidden = false;
			generatorMenu.element.querySelectorAll("div.presets > label").forEach(l => {
				let labelTypes = l.dataset.types.replaceAll(" ", "").split(",");
				if (labelTypes.includes(e.querySelector("option:checked").dataset.type)) {l.hidden = false}
				else {
					l.hidden = true;
					l.querySelector("input").checked = false;
				};
			});
		};
		let updateItem = async (e) => {
			let item = await fromUuid(e?.value);
			let type = generatorMenu.element.querySelector("select#type > option:checked").dataset.type;
			let element = generatorMenu.element.querySelector(`div.base_item.${type}`);

			if (item) {generatorMenu.element.querySelector("button[data-action='create']").hidden = false};

			element.querySelector("#base\\.money\\.gc").value = item?.system.price.gc || 0;
			element.querySelector("#base\\.money\\.ss").value = item?.system.price.ss || 0;
			element.querySelector("#base\\.money\\.bp").value = item?.system.price.bp || 0;
			element.querySelector("#base\\.encumbrance").value = item?.system.encumbrance.value || 0;
			element.querySelector("#base\\.availability").value = game.wfrp4e.config.availability[item?.system.availability.value || "None"];
			element.querySelector("#base\\.properties").value = item?.Qualities.concat(item?.Flaws).join(", ") || "";
			switch (type) {
				case "trapping": {
					element.querySelector("#base\\.type").value = game.wfrp4e.config.trappingTypes[item?.system.trappingType.value] || "-";
					break;
				};
				case "melee": {
					element.querySelector("#base\\.reach").value = game.wfrp4e.config.weaponReaches[item?.system.reach.value] || "-";
					element.querySelector("#base\\.damage").value = item?.system.damage.value || "";
					item?.system.twohanded?.value ? element.querySelector("#base\\.twohanded").checked = true : element.querySelector("#base\\.twohanded").checked = false;
					break;
				};
				case "range": {
					element.querySelector("#base\\.range").value = item?.system.range.value || 0;
					element.querySelector("#base\\.damage").value = item?.system.damage.value || "";
					item?.system.twohanded?.value ? element.querySelector("#base\\.twohanded").checked = true : element.querySelector("#base\\.twohanded").checked = false;
					break;
				};
				case "armour": {
					element.querySelector("#base\\.apHead").value = item?.system.AP.head || 0;
					element.querySelector("#base\\.apLArm").value = item?.system.AP.lArm || 0;
					element.querySelector("#base\\.apRArm").value = item?.system.AP.rArm || 0;
					element.querySelector("#base\\.apBody").value = item?.system.AP.body || 0;
					element.querySelector("#base\\.apLLeg").value = item?.system.AP.lLeg || 0;
					element.querySelector("#base\\.apRLeg").value = item?.system.AP.rLeg || 0;
					element.querySelector("#base\\.type").value = game.wfrp4e.config.armorTypesV2 ? game.wfrp4e.config.armorTypesV2[item?.system.armorType.value] || "" : game.wfrp4e.config.armorTypes[item?.system.armorType.value] || "";
					break;
				}
			}
		};
		generatorMenu.element.querySelector("select#type").addEventListener("change", (e) => {updateType(e.target)});
		generatorMenu.element.querySelector("select#item").addEventListener("change", (e) => {updateItem(e.target)});

		generatorMenu.element.querySelectorAll("div.presets > label[data-value]").forEach(l => {
			l.addEventListener("contextmenu", (e) => {
				e.preventDefault();
				let check = l.querySelector("input").checked;
				l.innerHTML = l.innerHTML.replace(/\d+x /, "");
				let value = l.dataset.value;
				if (e.altKey) {value = Math.max(value - 1, 1)}
				else {value++};
				l.dataset.value = value;
				l.innerHTML = value + "x " + l.innerHTML;
				l.querySelector("input").checked = check;
			});
		});
		generatorMenu.element.querySelectorAll("div.presets > label > input").forEach(i => {
			i.addEventListener("change", (e) => {
				let props = {qualities: [], flaws: []};
				generatorMenu.element.querySelectorAll("div.presets > label:has(> input:checked)").forEach(l => {
					let div = document.createElement('div');
					div.innerHTML = l.dataset.tooltip;
					props.qualities = props.qualities.concat(Array.from(div.querySelectorAll("li.qualities")).map(e => "<span class='qualities'>" + e.innerText + "</span>"));
					props.flaws = props.flaws.concat(Array.from(div.querySelectorAll("li.flaws")).map(e => "<span class='flaws'>" + e.innerText + "</span>"));
				});
				generatorMenu.element.querySelector("div.props").innerHTML = props.qualities.concat(props.flaws).join("");
			});
		});
	};
};

async function checkMenu() {
	if (!document.querySelector("WFRP4eLooting")) {
		let buttonsList = {
			generator: {
				action: "generator",
				icon: "fas fa-dice-d20",
				label: game.i18n.localize("WFRP4E.Looting.Menu.Generator.Title"),
				callback: () => {
					game.settings.set("wfrp4e-looting", "currentMenu", "generator");
					checkMenu();
				}
			},
			loot: {
				action: "loot",
				icon: "fas fa-treasure-chest",
				label: game.i18n.localize("WFRP4E.Looting.Menu.Loot.Title"),
				callback: () => {
					game.settings.set("wfrp4e-looting", "currentMenu", "loot");
					checkMenu();
				}
			},
			tables: {
				action: "tables",
				icon: "fas fa-table-list",
				label: game.i18n.localize("WFRP4E.Looting.Menu.Tables.Title"),
				callback: () => {
					game.settings.set("wfrp4e-looting", "currentMenu", "tables");
					checkMenu();
				}
			}
		};

		let title = "";
		let buttons = [];
		let params = {};
		switch (game.settings.get("wfrp4e-looting", "currentMenu")) {
			case "generator": {
				title = game.i18n.localize("WFRP4E.Looting.Menu.Generator.Title");
				buttons.push(buttonsList.loot, buttonsList.tables);

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
					return a;
				});
				params.items = trappings.concat(weapons, armours);

				params.presets = game.wfrp4e.looting.data.generator.presets;
				params.presets.forEach(p => {
					p.qualities.forEach((q, i) => {p.qualities[i].label = game.wfrp4e.looting.data.generator.names[p.qualities[i].name]});
					p.flaws.forEach((f, i) => {p.flaws[i].label = game.wfrp4e.looting.data.generator.names[p.flaws[i].name]});
				});
				break;
			};
			case "loot": {
				title = game.i18n.localize("WFRP4E.Looting.Menu.Loot.Title");

				buttons.push(buttonsList.generator, buttonsList.tables);

				params.default = game.wfrp4e.looting.data.defaultList;
				params.custom = game.settings.get("wfrp4e-looting", "customPresets");
				break;
			};
			case "tables": {
				title = game.i18n.localize("WFRP4E.Looting.Menu.Tables.Title");

				buttons.push(buttonsList.generator, buttonsList.loot);

				params.tables = game.wfrp4e.looting.data.defaultTables;
				params.loot = {
					default: game.wfrp4e.looting.data.defaultList,
					custom: game.settings.get("wfrp4e-looting", "customPresets")
				};

				params.weapons = (await warhammer.utility.findAllItems("weapon", false, true)).sort((a, b) => a.name.localeCompare(b.name));
				params.weapons.map(w => {
					if (w.uuid.indexOf("Compendium.") > -1) {w.pack = game.packs.get(w.uuid.substring(w.uuid.indexOf("Compendium.") + 11, w.uuid.indexOf(".Item."))).title}
					return w;
				});
				params.armours = ((await warhammer.utility.findAllItems("armour", false, true))
					.concat(await warhammer.utility.findAllItems("wfrp4e-archives3.armour", false, true)))
					.sort((a, b) => a.name.localeCompare(b.name));
				params.armours.map(a => {
					if (a.uuid.indexOf("Compendium.") > -1) {a.pack = game.packs.get(a.uuid.substring(a.uuid.indexOf("Compendium.") + 11, a.uuid.indexOf(".Item."))).title};
					return a;
				});
				break;
			};
		};

		showMenu(title, buttons, params);
	};
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

	//Определение предметов по таблицам
	let items = [];
	for (let key in preset.tables) {
		let tableItems = [];
		if ((await new Roll("1d100").roll()).total <= preset.tables[key].chance) {
			let count = 0;
			for (let i = 0; i < preset.tables[key].dice.count; i++) {
				let roll = (await new Roll(`1d${preset.tables[key].dice.type}`).roll()).total;
				count += roll;
				if (roll == preset.tables[key].dice.type && [10, 20, 100].includes(preset.tables[key].dice.type)) {i--};
			};
			for (let i = 0; i < count; i++) {
				if (preset.tables[key].table?.key) {
					let table = game.wfrp4e.tables.findTable(preset.tables[key].table.key, preset.tables[key].table.column);
					let item = (await table.roll()).results;
					for (let a in item) {
						let tablePrice = $(table.description).filter("p#tablePrice")[0]?.textContent?.split("|") || [0, 1, "+0"];
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

						let id;
						if (item[a].type == "document") {id = item[a].documentUuid.replace("Item.", "")}
						else if (item[a].name == game.i18n.localize("WFRP4E.Looting.Tables.OtherTrapping.Name")) {id = "other"};
						tableItems.push({item: item[a].name, price: price, priceValue, id, tableName: table.name});
					};
				} else if (preset.tables[key].table?.id) {
					let item = game.items.get(preset.tables[key].table.id.replace("Item.", ""));
					let price = {bp: item.price.bp, ss: item.price.ss, gc: item.price.gc};
					let priceValue = price.bp + (price.ss * 12) + (price.gc * 20 * 12);
					tableItems.push({item: item.name, price: price, priceValue, id: item.id});
				} else {
					let table = game.wfrp4e.looting.data.lootTables.find(t => t.table == preset.tables[key].table);
					let item = [];
					table.values.forEach(t => item = item.concat(Array(t.weight).fill(t.name)));
					item = item[Math.floor(Math.random() * table.weights)];
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

					let id = await game.wfrp4e.utility.findBaseName(item) || false;
					if (item == game.i18n.localize("WFRP4E.Looting.Tables.OtherTrapping.Name")) {id = "other"};
					tableItems.push({item: item, price: price, priceValue, id, table: table.title});
				};
			};
		};
		items = items.concat(tableItems.sort((a, b) => a.item.localeCompare(b.item)));
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
	//Вывод сообщения в чат
	let chatData = {
		user: game.user.id,
		content: await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-looting/templates/loot/chat.hbs", {money, items, params}),
		flavor: params.flavor
	};
	ChatMessage.create(ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode")));
};

Hooks.on("renderChatMessage", (message, html, data) => {
	if (html[0].querySelector("div#WFRP4eLooting_Message")) {
		async function takeMoney(item, actor) {
			let money = {
				bp: item.bp,
				ss: item.ss,
				gc: item.gc
			};

			for (let c of [{name: game.i18n.localize("NAME.BP"), value: 1}, {name: game.i18n.localize("NAME.SS"), value: 12}, {name: game.i18n.localize("NAME.GC"), value: 240}]) {
				if (!actor.itemTags.money.find(m => m.system.coinValue.value == c.value)) {
					let newMoney = (await fromUuid((await game.wfrp4e.utility.findItem(c.name, "money")).uuid)).toObject();
					newMoney.system.quantity.value = 0;
					await actor.createEmbeddedDocuments("Item", [newMoney]);
				};
			};
			money.value = game.wfrp4e.market.creditCommand(game.wfrp4e.market.amountToString(game.wfrp4e.market.parseMoneyTransactionString(money.bp + game.i18n.localize('MARKET.Abbrev.BP') + money.ss + game.i18n.localize('MARKET.Abbrev.SS') + money.gc + game.i18n.localize('MARKET.Abbrev.GC'))), actor, {suppressMessage: true});
			if (money.value) {actor.updateEmbeddedDocuments("Item", money.value)};
		};
		async function takeItem(item, actor) {
			if (typeof item.value === "object") {
				item.value = item.value.toObject();
				item.value.system.price = {
					bp: item.price.bp,
					ss: item.price.ss,
					gc: item.price.gc
				};
				actor.createEmbeddedDocuments("Item", [item.value]);
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
				actor.createEmbeddedDocuments("Item", [item.value]);
			};

			return item.value;
		};
		function complete(chatData, count) {
			if (Object.keys(chatData).length != 0) {
				ChatMessage.create(ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode")));
				if (game.dice3d && game.settings.get("wfrp4e", "throwMoney") && count) {
					let type = html[0].querySelector("div#WFRP4eLooting_Message").dataset.type;
					new Roll(`${count || type == "brass" ? 3 : type == "silver" ? 5 : 10}dc`).evaluate({allowInteractive: false}).then((roll) => {
						game.dice3d.showForRoll(roll, game.user, true);
					});
				};
			};
			socket.executeForOthers("wfrp4e-looting:editHTML", message.id, html[0].querySelector("div#WFRP4eLooting_Message").innerHTML);
			socket.executeAsGM("wfrp4e-looting:editMessage", message.id, html[0].querySelector("div#WFRP4eLooting_Message").outerHTML);
		};
		let actor = false;
		let chatData = {};
		html[0].querySelector(".message-content").querySelectorAll("li[data-type='item'] a").forEach(button => {
			button.addEventListener("click", async (element) => {
				actor = game.user.character;
				if (!actor) {
					ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Error.NotAttachedCharacter"));
					return false;
				};

				let elements = {
					a: element.target.closest("a"),
					li: element.target.closest("li"),
					ul: element.target.closest("ul"),
					p: element.target.closest("ul").previousElementSibling
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
				item.price.text = ""
					+ (item.price.bp ? "<b style='margin: 0 1px;'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</b>" : "")
					+ (item.price.ss ? "<b style='margin: 0 1px;'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</b>" : "")
					+ (item.price.gc ? "<b style='margin: 0 1px;'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</b>" : "");

				let price = {
					bp: parseInt(elements.p.dataset.pricevalue) - item.price.priceValue,
					ss: 0,
					gc: 0,
					priceValue: parseInt(elements.p.dataset.pricevalue) - item.price.priceValue,
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
					item.price.text = ""
						+ (item.price.bp ? "<b style='margin: 0 1px;'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</b>" : "")
						+ (item.price.ss ? "<b style='margin: 0 1px;'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</b>" : "")
						+ (item.price.gc ? "<b style='margin: 0 1px;'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</b>" : "");

					takeMoney(item.price, actor);

					chatData = {
						user: game.user.id,
						content: `<p style="text-align: center;font-size: 14px;"><b>${actor.link}</b> ${game.i18n.format("WFRP4E.Looting.Chat.Action.Sell", {item: elements.a.previousElementSibling.textContent})} <i${game.settings.get("wfrp4e-looting", "itemsModifier") ? " data-tooltip='" + game.i18n.localize("WFRP4E.Looting.Settings.itemsModifier.Tooltip") + "'" : ""}><i class='fas fa-coins'></i> ${item.price.text}</i>.</p>`,
						flavor: html[0].querySelector("div#WFRP4eLooting_Message").closest(".chat-message.message").querySelector(".flavor-text")?.textContent || game.i18n.localize("WFRP4E.Looting.Name")
					};
				} else if (elements.li.hasAttribute("data-item")) {
					if (elements.li.dataset.item == "other") {
						let choice = await ItemDialog.create(game.wfrp4e.looting.data.lootTables.filter(t => t.hidden).map((t, index) => (Object.assign(t, {name: t.title, value: t.table, id: index}))), 1, {text: game.i18n.localize("WFRP4E.Looting.Menu.Loot.Other.Choice"), title: game.i18n.localize("CONTROLS.CommonSelect"), defaultValue: "0"});
						if (choice.length) {
							let table = game.wfrp4e.looting.data.lootTables.filter(t => t.hidden).find(t => t.table == choice[0].value);
							let newItem = [];
							table.values.forEach(t => newItem = newItem.concat(Array(t.weight).fill(t.name)));
							newItem = newItem[Math.floor(Math.random() * table.weights)]

							item.value = await game.wfrp4e.utility.findBaseName(newItem) || newItem;
						};
					} else {
						item.value = game.items.get(elements.li.dataset?.id) || await game.wfrp4e.utility.findBaseName(elements.a.textContent) || elements.a.textContent;
					};
					item.value = await takeItem(item, actor);

					chatData = {
						user: game.user.id,
						content: `<p style="text-align: center;font-size: 14px;"><b>${actor.link}</b> ${game.i18n.localize("WFRP4E.Looting.Chat.Action.Take")} <b data-tooltip="<i class='fas fa-coins'></i> ${item.price.text}">"${item.value.name}"</b>.</p>`,
						flavor: html[0].querySelector("div#WFRP4eLooting_Message").closest(".chat-message.message").querySelector(".flavor-text")?.textContent || game.i18n.localize("WFRP4E.Looting.Name")
					};
				};

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

				complete(chatData, Math.floor(item.price.priceValue / 12));
			});
		});
		html[0].querySelector(".message-content").querySelectorAll("p[data-type='items'] a").forEach(button => {
			button.addEventListener("click", async (element) => {
				actor = game.user.character;
				if (!actor) {
					ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Error.NotAttachedCharacter"));
					return false;
				};

				let elements = {
					a: element.target.closest("a"),
					ul: element.target.closest("p[data-type='items']").nextElementSibling,
					p: element.target.closest("p[data-type='items']")
				};
				let item = {};

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
					item.price.text = ""
						+ (item.price.bp ? "<b style='margin: 0 1px;'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</b>" : "")
						+ (item.price.ss ? "<b style='margin: 0 1px;'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</b>" : "")
						+ (item.price.gc ? "<b style='margin: 0 1px;'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</b>" : "");

					takeMoney(item.price, actor);

					chatData = {
						user: game.user.id,
						content: `<p style="text-align: center;font-size: 14px;"><b>${actor.link}</b> ${game.i18n.localize("WFRP4E.Looting.Chat.Action.SellAll")} <i${game.settings.get("wfrp4e-looting", "itemsModifier") ? " data-tooltip='" + game.i18n.localize("WFRP4E.Looting.Settings.itemsModifier.Tooltip") + "'" : ""}><i class='fas fa-coins'></i> ${item.price.text}</i>.</p>`,
						flavor: html[0].querySelector("div#WFRP4eLooting_Message").closest(".chat-message.message").querySelector(".flavor-text")?.textContent || game.i18n.localize("WFRP4E.Looting.Name")
					};
				} else if (elements.a.hasAttribute("data-item")) {
					let chatDataText = [];

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
						item.price.text = ""
							+ (item.price.bp ? "<b style='margin: 0 1px;'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</b>" : "")
							+ (item.price.ss ? "<b style='margin: 0 1px;'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</b>" : "")
							+ (item.price.gc ? "<b style='margin: 0 1px;'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</b>" : "");

						if (e.dataset.item == "other") {
							let choice = await ItemDialog.create(game.wfrp4e.looting.data.lootTables.filter(t => t.hidden).map((t, index) => (Object.assign(t, {name: t.title, value: t.table, id: index}))), 1, {text: game.i18n.localize("WFRP4E.Looting.Menu.Loot.Other.Choice"), title: game.i18n.localize("CONTROLS.CommonSelect"), defaultValue: "0"});
							if (choice.length) {
								let table = game.wfrp4e.looting.data.lootTables.filter(t => t.hidden).find(t => t.table == choice[0].value);
								let newItem = [];
								table.values.forEach(t => newItem = newItem.concat(Array(t.weight).fill(t.name)));
								newItem = newItem[Math.floor(Math.random() * table.weights)]

								item.value = await game.wfrp4e.utility.findBaseName(newItem) || newItem;
							};
						} else {
							item.value = game.items.get(e.dataset?.id) || await game.wfrp4e.utility.findBaseName(e.querySelector("a").textContent) || e.querySelector("a").textContent;
						};
						item.value = await takeItem(item, actor);

						chatDataText.push(`<b data-tooltip="<i class='fas fa-coins'></i> ${item.price.text}">"${item.value.name}"</b>`);
					};

					chatData = {
						user: game.user.id,
						content: `<p style="text-align: center;font-size: 14px;"><b>${actor.link}</b> ${game.i18n.localize("WFRP4E.Looting.Chat.Action.Take")}: ${chatDataText.join(", ")}.</p>`,
						flavor: html[0].querySelector("div#WFRP4eLooting_Message").closest(".chat-message.message").querySelector(".flavor-text")?.textContent || game.i18n.localize("WFRP4E.Looting.Name")
					};
				};

				elements.ul.remove();
				elements.p.remove();

				complete(chatData, Math.floor(item.price.priceValue / 12));
			});
		});
		html[0].querySelector(".message-content").querySelectorAll("p[data-type='money'] a").forEach(button => {
			button.addEventListener("click", async (element) => {
				actor = game.user.character;
				if (!actor) {
					ui.notifications.error(game.i18n.localize("WFRP4E.Looting.Error.NotAttachedCharacter"));
					return false;
				};

				let elements = {
					p: element.target.closest("p")
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
				item.price.text = ""
					+ (item.price.bp ? "<b style='margin: 0 1px;'>" + item.price.bp + " " + game.i18n.localize("MARKET.Abbrev.BP") + "</b>" : "")
					+ (item.price.ss ? "<b style='margin: 0 1px;'>" + item.price.ss + " " + game.i18n.localize("MARKET.Abbrev.SS") + "</b>" : "")
					+ (item.price.gc ? "<b style='margin: 0 1px;'>" + item.price.gc + " " + game.i18n.localize("MARKET.Abbrev.GC") + "</b>" : "");

				takeMoney(item.price, actor);

				chatData = {
					user: game.user.id,
					content: `<p style="text-align: center;font-size: 14px;"><b>${actor.link}</b> ${game.i18n.localize("WFRP4E.Looting.Chat.Action.Coins")} <i><i class='fas fa-coins'></i> ${item.price.text}</i>.</p>`,
					flavor: html[0].querySelector("div#WFRP4eLooting_Message").closest(".chat-message.message").querySelector(".flavor-text")?.textContent || game.i18n.localize("WFRP4E.Looting.Name")
				};

				elements.p.remove();

				complete(chatData, Math.floor(item.price.priceValue / 12));
			});
		});
	};
});