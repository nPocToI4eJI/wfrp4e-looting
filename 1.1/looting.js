Hooks.once('ready', () => {
    game.settings.register("wfrp4e-looting", "modifier", {
		name: game.i18n.localize("WFRP4E.Looting.Modifier.Name"),
		hint: game.i18n.localize("WFRP4E.Looting.Modifier.Hint"),
		scope: "world",
        config: true,
		default: "1",
		type: Number
	});
});

Hooks.on("chatMessage", (html, content, msg) => {
    let regExp;
    regExp = /(\S+)/g;
    let commands = content.match(regExp);
    let command = commands[0];

    if (command === "/loot") {
      lootCommand()
      return false;
    }
});

let moneyName = {}

function lootCommand() {
	new Promise(resolve => {
		new Dialog({
			title: game.i18n.localize("WFRP4E.Looting.Title"),
			content: `
				<input id="count" type="number" step="1" min="1" value="1" title="${game.i18n.localize("WFRP4E.Looting.Quantity")}">
				<select id="type" title="${game.i18n.localize("WFRP4E.Looting.Tables")}">
					<option class="brass" value="shack" title="${game.i18n.localize("WFRP4E.Looting.Shack.Title")}">${game.i18n.localize("WFRP4E.Looting.Shack.Name")}</option>
					<option class="silver" value="house" title="${game.i18n.localize("WFRP4E.Looting.House.Title")}">${game.i18n.localize("WFRP4E.Looting.House.Name")}</option>
					<option class="gold" value="estate" title="${game.i18n.localize("WFRP4E.Looting.Estate.Title")}">${game.i18n.localize("WFRP4E.Looting.Estate.Name")}</option>
					<option class="gold" value="wizard_house" title="${game.i18n.localize("WFRP4E.Looting.WizardHouse.Title")}">${game.i18n.localize("WFRP4E.Looting.WizardHouse.Name")}</option>
					<option class="silver" value="workshop" title="${game.i18n.localize("WFRP4E.Looting.Workshop.Title")}">${game.i18n.localize("WFRP4E.Looting.Workshop.Name")}</option>
					<option class="brass" value="sanctuary" title="${game.i18n.localize("WFRP4E.Looting.Sanctuary.Title")}">${game.i18n.localize("WFRP4E.Looting.Sanctuary.Name")}</option>
					<option class="gold" value="temple" title="${game.i18n.localize("WFRP4E.Looting.Temple.Title")}">${game.i18n.localize("WFRP4E.Looting.Temple.Name")}</option>
					<option class="silver" value="little_monster" title="${game.i18n.localize("WFRP4E.Looting.LittleMonster.Title")}">${game.i18n.localize("WFRP4E.Looting.LittleMonster.Name")}</option>
					<option class="gold" value="big_monster" title="${game.i18n.localize("WFRP4E.Looting.BigMonster.Title")}">${game.i18n.localize("WFRP4E.Looting.BigMonster.Name")}</option>
					<option class="silver" value="chest_open" title="${game.i18n.localize("WFRP4E.Looting.ChestOpen.Title")}">${game.i18n.localize("WFRP4E.Looting.ChestOpen.Name")}</option>
					<option class="gold" value="chest_locked" title="${game.i18n.localize("WFRP4E.Looting.ChestLocked.Title")}">${game.i18n.localize("WFRP4E.Looting.ChestLocked.Name")}</option>
					<option class="gold" value="chest_storage" title="${game.i18n.localize("WFRP4E.Looting.ChestStorage.Title")}">${game.i18n.localize("WFRP4E.Looting.ChestStorage.Name")}</option>
					<option class="brass" value="peasant" title="${game.i18n.localize("WFRP4E.Looting.Peasant.Title")}">${game.i18n.localize("WFRP4E.Looting.Peasant.Name")}</option>
					<option class="silver" value="citizen" title="${game.i18n.localize("WFRP4E.Looting.Citizen.Title")}">${game.i18n.localize("WFRP4E.Looting.Citizen.Name")}</option>
					<option class="gold" value="noble" title="${game.i18n.localize("WFRP4E.Looting.Noble.Title")}">${game.i18n.localize("WFRP4E.Looting.Noble.Name")}</option>
					<option class="gold" value="wizard" title="${game.i18n.localize("WFRP4E.Looting.Wizard.Title")}">${game.i18n.localize("WFRP4E.Looting.Wizard.Name")}</option>
					<option class="none" value="flaws_weapon">${game.i18n.localize("WFRP4E.Looting.FlawsWeapon")}</option>
					<option class="none" value="flaws_armour">${game.i18n.localize("WFRP4E.Looting.FlawsArmour")}</option>
				</select>
				
				<style>
					div.dialog-content {
						display: grid;
						grid-template-columns: 40% 60%;
						margin: 2px;
					}
					div.dialog-content>input,
					div.dialog-content>select {
						text-align: center;
						border: 2px solid gray;
						background: #33272C;
						box-shadow: inset 0px 0px 10px 2px gray;
						border-radius: 5px;
						margin: 2px;
						font-size: 14px;
						font-weight: bold;
						height: auto;
						padding: 3px;
						text-shadow: 1px 1px 2px black,
						-1px 1px 2px black,
						1px -1px 2px black,
						-1px -1px 2px black;
					}
					div.dialog-content>input:hover,
					div.dialog-content>select:hover {
						border: 2px solid silver;
						box-shadow: inset 0px 0px 7px 2px silver;
					}
					div.dialog-content>select>option {
						color: black;
					}
					div.dialog-content>select>option.brass,
					div.dialog-content>select:has(>option.brass:checked) {
						background: #B87333;
					}
					div.dialog-content>select>option.silver,
					div.dialog-content>select:has(>option.silver:checked) {
						background: #C0C0C0;
					}
					div.dialog-content>select>option.gold,
					div.dialog-content>select:has(>option.gold:checked) {
						background: #FFD700;
					}
					div.dialog-content>select>option.none {
						color: white;
						background: #33272C;
					}
				</style>
			`,
			default: "roll",
			buttons: {
				roll: {
					icon: "<i class=\"fas fa-dice\"></i>",
					label: game.i18n.localize("WFRP4E.Looting.Loot"),
					callback: html => resolve(startLooting(html.find('[id=count]')[0].value, html.find('[id=type]')[0].value))
				},
			},
			close: () => resolve(null)
		}).render(true);
	});
}

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function result(value) {
	let message = await ChatMessage.create({
		content: "<div style=\"text-align: center;\">" + value + "</div>",
		user: game.user.id
	});
	message.applyRollMode(game.settings.get("core", "rollMode"))
}

async function startLooting(count, type) {
	moneyName = {bp: "/value/ " + game.i18n.localize("MARKET.Abbrev.BP"), ss: "/value/ " + game.i18n.localize("MARKET.Abbrev.SS"), gc: "/value/ " + game.i18n.localize("MARKET.Abbrev.GC")}
	let moneyList = game.items.filter(item => item.type == "money")
	if (moneyList.filter(item => item.name == game.i18n.localize("NAME.BP"))[0] != undefined) {moneyName.bp = "@UUID[" + moneyList.filter(item => item.name == game.i18n.localize("NAME.BP"))[0].uuid + "]{/value/ " + game.i18n.localize("MARKET.Abbrev.BP") + "}"}
	if (moneyList.filter(item => item.name == game.i18n.localize("NAME.SS"))[0] != undefined) {moneyName.ss = "@UUID[" + moneyList.filter(item => item.name == game.i18n.localize("NAME.SS"))[0].uuid + "]{/value/ " + game.i18n.localize("MARKET.Abbrev.SS") + "}"}
	if (moneyList.filter(item => item.name == game.i18n.localize("NAME.GC"))[0] != undefined) {moneyName.gc = "@UUID[" + moneyList.filter(item => item.name == game.i18n.localize("NAME.GC"))[0].uuid + "]{/value/ " + game.i18n.localize("MARKET.Abbrev.GC") + "}"}

	switch (type) {
		case "shack": lootingList(count, "Shack", "brass", {bp: [50, [1, "10"]], ss: [10, [1, "5"]], gc: [1, [1, "1"]]}, {household_item: [10, [1, "5"]], jewelry: [0], art: [0], clothes: [10, [1, "1"]]}); break;
		case "house": lootingList(count, "House", "silver", {bp: [100, [6, "10"]], ss: [100, [2, "10"]], gc: [25, [1, "10"]]}, {household_item: [100, [1, "10"]], jewelry: [5, [1, "5"]], art: [10, [1, "2"]], clothes: [25, [1, "5"]]}); break;
		case "estate": lootingList(count, "Estate", "gold", {bp: [100, [2, "100"]], ss: [100, [1, "100"]], gc: [100, [1, "100"]]}, {household_item: [100, [2, "10"]], jewelry: [90, [1, 10]], art: [75, [1, "10"]], clothes: [100, [1, "10"]]}); break;
		case "wizard_house": lootingList(count, "WizardHouse", "gold", {bp: [100, [3, "10"]], ss: [75, [5, "10"]], gc: [50, [3, "10"]]}, {household_item: [25, [1, "5"]], jewelry: [75, [1, "5"]], art: [75, [1, "5"]], clothes: [25, [1, "5"]]}); break;
		case "workshop": lootingList(count, "Workshop", "silver", {bp: [75, [1, "100"]], ss: [50, [3, "10"]], gc: [25, [1, "10"]]}, {household_item: [10, [1, "5"]], jewelry: [5, [1, "5"]], art: [1, [1, "1"]], clothes: [25, [1, "2"]]}); break;
		case "sanctuary": lootingList(count, "Sanctuary", "brass", {bp: [100, [1, "100"]], ss: [50, [1, "10"]], gc: [5, [1, "5"]]}, {household_item: [0], jewelry: [25, [1, "1"]], art: [75, [1, "1"]], clothes: [5, [1, "1"]]}); break;
		case "temple": lootingList(count, "Temple", "gold", {bp: [100, [5, "100"]], ss: [75, [1, "100"]], gc: [50, [5, "10"]]}, {household_item: [25, [1, "10"]], jewelry: [75, [1, "5"]], art: [50, [1, "1"]], clothes: [100, [1, "10"]]}); break;
		case "little_monster": lootingList(count, "LittleMonster", "silver", {bp: [50, [1, "10"]], ss: [15, [2, "10"]], gc: [15, [1, "5"]]}, {household_item: [0], jewelry: [15, [1, "1"]], art: [0], clothes: [0]}); break;
		case "big_monster": lootingList(count, "BigMonster", "gold", {bp: [75, [2, "100"]], ss: [50, [1, "100"]], gc: [25, [1, "100"]]}, {household_item: [5, [1, "10"]], jewelry: [75, [1, "10"]], art: [0], clothes: [0]}); break;
		case "chest_open": lootingList(count, "ChestOpen", "silver", {bp: [25, [1, "100"]], ss: [25, [1, "10"]], gc: [5, [1, "10"]]}, {household_item: [5, [1, "1"]], jewelry: [5, [1, "1"]], art: [0], clothes: [5, [1, "1"]]}); break;
		case "chest_locked": lootingList(count, "ChestLocked", "gold", {bp: [100, [5, "10"]], ss: [100, [3, "10"]], gc: [50, [2, "10"]]}, {household_item: [10, [1, "1"]], jewelry: [15, [1, "10"]], art: [5, [1, "1"]], clothes: [15, [1, "1"]]}); break;
		case "chest_storage": lootingList(count, "ChestStorage", "gold", {bp: [100, [5, "100"]], ss: [100, [4, "100"]], gc: [100, [3, "100"]]}, {household_item: [0], jewelry: [100, [1, "100"]], art: [100, [1, "10"]], clothes: [25, [1, "1"]]}); break;
		case "peasant": lootingList(count, "Peasant", "brass", {bp: [15, [1, "10"]], ss: [5, [1, "2"]], gc: [0]}, {household_item: [0], jewelry: [0], art: [0], clothes: [1, [1, "1"]]}); break;
		case "citizen": lootingList(count, "Citizen", "silver", {bp: [75, [1, "10"]], ss: [75, [1, "10"]], gc: [5, [1, "5"]]}, {household_item: [0], jewelry: [1, [1, "1"]], art: [0], clothes: [5, [1, "1"]]}); break;
		case "noble": lootingList(count, "Noble", "gold", {bp: [100, [1, "100"]], ss: [100, [2, "10"]], gc: [100, [1, "10"]]}, {household_item: [0], jewelry: [50, [1, "5"]], art: [5, [1, "1"]], clothes: [100, [1, "5"]]}); break;
		case "wizard": lootingList(count, "Wizard", "gold", {bp: [25, [2, "10"]], ss: [50, [2, "10"]], gc: [50, [1, "10"]]}, {household_item: [0], jewelry: [5, [1, "1"]], art: [0], clothes: [1, [1, "1"]]}); break;
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
}

async function lootingList(count, label, level, money, loot_chance) {
	for (let i = count; i > 0; i--) {
		let color = ""
		switch (level) {
			case "brass": color = "#B87333"; break;
			case "silver": color = "#C0C0C0"; break;
			case "gold": color = "#FFD700"; break;
		}
		let loot = "<p style=\"color: " + color + "; font-size: 20px; text-shadow: 1px 1px 2px black, -1px 1px 2px black, 1px -1px 2px black, -1px -1px 2px black; margin: unset;\" title=\"" + game.i18n.localize(`WFRP4E.Looting.${label}.Title`) + "\"><b>" + game.i18n.localize(`WFRP4E.Looting.${label}.Name`) + "</b></p> <p><b>" + game.i18n.localize("Money") + ":</b> <i>" + await rollMoney(money) + "</i></p>"
		let items = await rollItems(loot_chance, level)
		if (items[0] != "") {loot = loot + "<p><b>" + game.i18n.localize("WFRP4E.Looting.Prey") + " (" + items[1] + "):</b> <i>" + items[0] + "</i></p>"}
		result(loot)
	}
}

async function rollMoney(value) {
	let money = {bp: 0, ss: 0, gc: 0}
	let moneyResult = ""
	if (value.gc[0] != 0) {
		if (rand(1, 100) <= value.gc[0]) {
			let a = 0
			while (a < value.gc[1][0]) {
				let roll = (await new Roll(`1d${value.gc[1][1]}`).roll()).total
				if (value.gc[1][1] >= 10 && value.gc[1][1] == roll) {a--}
				money.gc += Math.round(roll * game.settings.get("wfrp4e-looting", "modifier"))
				a++
			}
		}
	}
	if (value.ss[0] != 0) {
		if (rand(1, 100) <= value.ss[0]) {
			let a = 0
			while (a < value.ss[1][0]) {
				let roll = (await new Roll(`1d${value.ss[1][1]}`).roll()).total
				if (value.ss[1][1] >= 10 && value.ss[1][1] == roll) {a--}
				money.ss += Math.round(roll * game.settings.get("wfrp4e-looting", "modifier"))
				a++
			}
		}
	}
	if (value.bp[0] != 0) {
		if (rand(1, 100) <= value.bp[0]) {
			let a = 0
			while (a < value.bp[1][0]) {
				let roll = (await new Roll(`1d${value.bp[1][1]}`).roll()).total
				if (value.bp[1][1] >= 10 && value.bp[1][1] == roll) {a--}
				money.bp += Math.round(roll * game.settings.get("wfrp4e-looting", "modifier"))
				a++
			}
		}
	}
	if (money.gc == 0 && money.ss == 0 && money.bp == 0) {moneyResult = game.i18n.localize("WFRP4E.Looting.Nothing")}
	else {
		while (money.bp >= 12) {
			money.ss += 1
			money.bp -= 12
		}
		while (money.ss >= 20) {
			money.gc += 1
			money.ss -= 20
		}
		if (money.gc != 0) {
			moneyResult = moneyName.gc.replace("/value/", money.gc)
		}
		if (money.ss != 0) {
			if (moneyResult != "") {moneyResult = moneyResult + ", "}
			moneyResult = moneyResult + moneyName.ss.replace("/value/", money.ss)
		}
		if (money.bp != 0) {
			if (moneyResult != "") {moneyResult = moneyResult + ", "}
			moneyResult = moneyResult + moneyName.bp.replace("/value/", money.bp)
		}
	}
	return moneyResult
}

async function rollItems(value, type) {
	let items = ""
	let cost = []
	let money = 0
	switch (type) {
		case "brass": cost = [moneyName.bp, " " + game.i18n.localize("MARKET.Abbrev.BP")]; break;
		case "silver": cost = [moneyName.ss, " " + game.i18n.localize("MARKET.Abbrev.SS")]; break;
		case "gold": cost = [moneyName.gc, " " + game.i18n.localize("MARKET.Abbrev.GC")]; break;
	}
	if (value.household_item[0] != 0) {
		if (rand(1, 100) <= value.household_item[0]) {
			let table = game.wfrp4e.tables.findTable("looting", "household_item") || ui.notifications.error(game.i18n.localize("WFRP4E.Looting.ErrorImport"));
			let a = 0
			while (a < value.household_item[1][0]) {
				let roll = (await new Roll(`1d${value.household_item[1][1]}`).roll()).total
				if (value.household_item[1][1] >= 10 && value.household_item[1][1] == roll) {a--}
				let i = 0
				while (i < roll) {
					if (items != "") {items = items + ", "}
					let price = Math.round(rand(1, 10) * game.settings.get("wfrp4e-looting", "modifier"))
					if (price > 0) {
						money = money + price
						items = items + (await table.roll()).results[0].text + " (" + price + cost[1] + ")"
					}
					i++
				}
				a++
			}
		}
	}
	if (value.jewelry[0] != 0) {
		if (rand(1, 100) <= value.jewelry[0]) {
			let table = ""
			if (rand(1, 10) <= 5) {
				table = game.wfrp4e.tables.findTable("looting", "precious_stones_" + type) || ui.notifications.error(game.i18n.localize("WFRP4E.Looting.ErrorImport"))
			}
			else {
				table = game.wfrp4e.tables.findTable("looting", "jewelry") || ui.notifications.error(game.i18n.localize("WFRP4E.Looting.ErrorImport"))
			}
			let a = 0
			while (a < value.jewelry[1][0]) {
				let roll = (await new Roll(`1d${value.jewelry[1][1]}`).roll()).total
				if (value.jewelry[1][1] >= 10 && value.jewelry[1][1] == roll) {a--}
				let i = 0
				while (i < roll) {
					if (items != "") {items = items + ", "}
					let price = Math.round((rand(1, 10) + rand(1, 10)) * game.settings.get("wfrp4e-looting", "modifier"))
					if (price > 0) {
						money = money + price
						items = items + (await table.roll()).results[0].text + " (" + price + cost[1] + ")"
					}
					i++
				}
				a++
			}
		}
	}
	if (value.art[0] != 0) {
		if (rand(1, 100) <= value.art[0]) {
			let table = game.wfrp4e.tables.findTable("looting", "art") || ui.notifications.error(game.i18n.localize("WFRP4E.Looting.ErrorImport"))
			let a = 0
			while (a < value.art[1][0]) {
				let roll = (await new Roll(`1d${value.art[1][1]}`).roll()).total
				if (value.art[1][1] >= 10 && value.art[1][1] == roll) {a--}
				let i = 0
				while (i < roll) {
					if (items != "") {items = items + ", "}
					let price = Math.round((rand(1, 10) * 5) * game.settings.get("wfrp4e-looting", "modifier"))
					if (price > 0) {
						money = money + price
						items = items + (await table.roll()).results[0].text + " (" + price + cost[1] + ")"
					}
					i++
				}
				a++
			}
		}
	}
	if (value.clothes[0] != 0) {
		if (rand(1, 100) <= value.clothes[0]) {
			let table = game.wfrp4e.tables.findTable("looting", "clothes") || ui.notifications.error(game.i18n.localize("WFRP4E.Looting.ErrorImport"))
			let a = 0
			while (a < value.clothes[1][0]) {
				let roll = (await new Roll(`1d${value.clothes[1][1]}`).roll()).total
				if (value.clothes[1][1] >= 10 && value.clothes[1][1] == roll) {a--}
				let i = 0
				while (i < roll) {
					if (items != "") {items = items + ", "}
					let price = Math.round(rand(1, 10) * game.settings.get("wfrp4e-looting", "modifier"))
					if (price > 0) {
						money = money + price
						items = items + (await table.roll()).results[0].text + " (" + price + cost[1] + ")"
					}
					i++
				}
				a++
			}
		}
	}
	money = cost[0].replace("/value/", money) 
	return [items, money]
}

async function rollFlaws(type) {
	let table = game.wfrp4e.tables.findTable("looting", type) || ui.notifications.error(game.i18n.localize("WFRP4E.Looting.ErrorImport"))
	let flaw = (await table.roll()).results[0].text
	if (flaw == "reroll") {
		flaw = (await rollFlaws()) + ", " + (await rollFlaws())
	}
	return flaw
}