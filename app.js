const API_BASE_URL = window.NEWSLETTER_CONFIG?.API_BASE_URL || "http://localhost:8000";
const TURNSTILE_SITE_KEY = window.NEWSLETTER_CONFIG?.TURNSTILE_SITE_KEY || "";

const form = document.querySelector("#subscribe-form");
const statusEl = document.querySelector("#status");
const turnstileContainer = document.querySelector("#turnstile-container");
let turnstileWidgetId = null;

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

window.onTurnstileLoaded = () => {
  if (!TURNSTILE_SITE_KEY || !turnstileContainer || !window.turnstile) {
    return;
  }

  turnstileWidgetId = window.turnstile.render(turnstileContainer, {
    sitekey: TURNSTILE_SITE_KEY,
  });
};

function getTurnstileToken() {
  if (!TURNSTILE_SITE_KEY) {
    throw new Error("Subscription security check is not configured.");
  }

  const token = window.turnstile?.getResponse(turnstileWidgetId);
  if (!token) {
    throw new Error("Please complete the security check.");
  }

  return token;
}

function resetTurnstile() {
  if (window.turnstile && turnstileWidgetId !== null) {
    window.turnstile.reset(turnstileWidgetId);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  setStatus("Submitting...");

  try {
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      consent: formData.get("consent") === "on",
      turnstileToken: getTurnstileToken(),
    };

    const response = await fetch(`${API_BASE_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.detail || "Subscription failed.");
    }

    form.reset();
    resetTurnstile();
    setStatus("Please check your email to confirm your subscription.", "success");
  } catch (error) {
    setStatus(error.message, "error");
    resetTurnstile();
  } finally {
    button.disabled = false;
  }
});
