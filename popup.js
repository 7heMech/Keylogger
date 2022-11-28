const WEBHOOK_REGEX = /^https?:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/\d+\/[\w-]+(?:\?thread_id=\d+)?$/;

const input = document.getElementById("url");
const btn = document.getElementById("submit");
const msgEl = document.getElementById("message");

async function updateToken() {
  if (btn.disabled) return;
  const { ok } = await fetch(input.value);
  if (!ok) return setValid(false, "Invalid discord webhook.");
  chrome.storage.local.set({ "webhookUrl": input.value });
  msgEl.style.removeProperty("display");
}

btn.onclick = updateToken;

input.addEventListener("input", async () => {
  if (!WEBHOOK_REGEX.test(input.value)) return setValid(false, "Invalid discord webhook url.");
  setValid(true, "Success.");
});

function setValid(bool, msg) {
  if (!bool) {
    msgEl.classList.remove("success");
    msgEl.classList.add("error");
    msgEl.style.removeProperty("display");
    msgEl.innerHTML = msg;
    btn.disabled = true;
  } else {
    msgEl.style.display = "none";
    msgEl.classList.remove("error");
    msgEl.classList.add("success");
    msgEl.innerHTML = msg;
    btn.disabled = false;
  }
}