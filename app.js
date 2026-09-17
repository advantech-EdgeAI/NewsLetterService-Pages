const API_BASE_URL = window.NEWSLETTER_CONFIG?.API_BASE_URL || "http://localhost:8000";

const form = document.querySelector("#subscribe-form");
const statusEl = document.querySelector("#status");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  setStatus("Submitting...");

  const formData = new FormData(form);
  const payload = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    consent: formData.get("consent") === "on",
  };

  try {
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
    setStatus("Please check your email to confirm your subscription.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    button.disabled = false;
  }
});
