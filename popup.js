document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleSwitch");

  chrome.storage.local.get("scriptCollectorEnabled", (res) => {
    toggle.checked = res.scriptCollectorEnabled ?? false;
  });

  toggle.addEventListener("change", () => {
    chrome.storage.local.set({ scriptCollectorEnabled: toggle.checked });
  });
});
