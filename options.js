document.addEventListener("DOMContentLoaded", () => {
  const keywordInput = document.getElementById("keywordInput");
  const keywordsTable = document
    .getElementById("keywordsTable")
    .querySelector("tbody");
  const filterToggle = document.getElementById("filterToggle");
  const adFilterToggle = document.getElementById("adFilterToggle");
  const nsfwFilterToggle = document.getElementById("nsfwFilterToggle");
  const logToggle = document.getElementById("logToggle");
  const saveButton = document.getElementById("save");
  const addPoliticsKeywordsButton = document.getElementById(
    "addPoliticsKeywords"
  );

  const predefinedKeywords = {
    politics: [
      "trump",
      "biden",
      "politics",
      "republican",
      "republicans",
      "democrat",
      "democrats",
      "election",
      "senate",
      "congress",
      "government",
      "policy",
      "maga",
      "political",
      "vote",
      "voting",
      "voters",
      "voter",
      "president",
      "campaign",
      "debate",
      "republic",
      "democracy",
      "lib",
      "libs",
      "conservative",
    ],
  };

  function updateKeywordsTable(keywords) {
    keywordsTable.innerHTML = "";
    keywords.forEach((keyword, index) => {
      const row = keywordsTable.insertRow();
      const cellKeyword = row.insertCell(0);
      const cellAction = row.insertCell(1);
      cellKeyword.textContent = keyword;
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete";
      deleteButton.addEventListener("click", () => {
        keywords.splice(index, 1);
        chrome.storage.sync.set({ keywords }, () => updateKeywordsTable(keywords));
      });
      cellAction.appendChild(deleteButton);
    });
  }

  chrome.storage.sync.get(
    ["keywords", "filterEnabled", "adFilterEnabled", "nsfwFilterEnabled", "loggingEnabled"],
    (data = {}) => {
      const keywords = data.keywords || [];
      updateKeywordsTable(keywords);
      filterToggle.checked = data.filterEnabled ?? true;  // Default to `true`
      adFilterToggle.checked = data.adFilterEnabled ?? true;
      nsfwFilterToggle.checked = data.nsfwFilterEnabled ?? true;
      logToggle.checked = data.loggingEnabled ?? false;
    }
  );

  keywordInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && keywordInput.value.trim() !== "") {
      chrome.storage.sync.get("keywords", (data = {}) => {
        const keywords = data.keywords || [];
        if (!keywords.includes(keywordInput.value.trim())) {
          keywords.push(keywordInput.value.trim());
          chrome.storage.sync.set({ keywords }, () => updateKeywordsTable(keywords));
        }
        keywordInput.value = "";
      });
    }
  });

  addPoliticsKeywordsButton.addEventListener("click", () => {
    chrome.storage.sync.get("keywords", (data = {}) => {
      const keywords = data.keywords || [];
      predefinedKeywords.politics.forEach((keyword) => {
        if (!keywords.includes(keyword)) {
          keywords.push(keyword);
        }
      });
      chrome.storage.sync.set({ keywords }, () => updateKeywordsTable(keywords));
    });
  });

  saveButton.addEventListener("click", () => {
    const settings = {
      filterEnabled: filterToggle.checked,
      adFilterEnabled: adFilterToggle.checked,
      nsfwFilterEnabled: nsfwFilterToggle.checked,
      loggingEnabled: logToggle.checked
    };

    chrome.storage.sync.set(settings, () => {
      console.log("Settings saved:", settings);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) chrome.tabs.reload(tabs[0].id);
      });
    });
  });
});
