const defaultLanguageTemplate = `
<span class="language-name">{name}</span>
<span class="language-code">{code}</span>
<button class="disable-button switch-button" data-code="{code}">Disable</button>
<button class="enable-button switch-button" data-code="{code}">Enable</button>
`;

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.sync.get(["disabledLanguages"], (result) => {
    let disabledLanguages = result.disabledLanguages || [];
    let languageList = document.getElementById("default-languages-list");
    for (let language of languages) {
      let template = defaultLanguageTemplate;
      template = template.replace("{name}", language.name);
      template = template.replace("{code}", language.code);
      let li = document.createElement("li");
      li.innerHTML = template;
      let disableButton = li.querySelector(".disable-button");
      disableButton.addEventListener("click", () => {
        disabledLanguages.push(language.code);
        chrome.storage.sync.set({ disabledLanguages: disabledLanguages });
        disableButton.disabled = true;
        enableButton.disabled = false;
      });
      disableButton.disabled = disabledLanguages.indexOf(language.code) !== -1;
      let enableButton = li.querySelector(".enable-button");
      enableButton.addEventListener("click", () => {
        disabledLanguages = disabledLanguages.filter(
          (code) => code !== language.code
        );
        chrome.storage.sync.set({ disabledLanguages: disabledLanguages });
        disableButton.disabled = false;
        enableButton.disabled = true;
      });
      enableButton.disabled = disabledLanguages.indexOf(language.code) === -1;
      languageList.appendChild(li);
    }
  });
});

const customLanguageTemplate = `
<input type="text" class="language-name-input" placeholder="Language Name">
<input type="text" class="language-code-input" placeholder="Language Code">
<button class="save-button">Save</button>
<button class="delete-button">Delete</button>
`;

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.sync.get(["customLanguages"], (result) => {
    let customLanguages = result.customLanguages || [];

    const createLi = (language) => {
      let template = customLanguageTemplate;
      let li = document.createElement("li");
      li.innerHTML = template;
      let nameInput = li.querySelector(".language-name-input");
      nameInput.value = language.name;
      let codeInput = li.querySelector(".language-code-input");
      codeInput.value = language.code;
      let saveButton = li.querySelector(".save-button");
      saveButton.addEventListener("click", () => {
        language.name = nameInput.value;
        language.code = codeInput.value;
        chrome.storage.sync.set({ customLanguages: customLanguages });
      });
      let deleteButton = li.querySelector(".delete-button");
      deleteButton.addEventListener("click", () => {
        customLanguages = customLanguages.filter((l) => l !== language);
        chrome.storage.sync.set({ customLanguages: customLanguages });
        li.remove();
      });
      return li;
    };
    let languageList = document.getElementById("custom-languages-list");
    for (let language of customLanguages) {
      let li = createLi(language);
      languageList.appendChild(li);
    }

    var newLanguageTemplate = customLanguageTemplate;
    let newLi = document.createElement("li");
    newLi.innerHTML = newLanguageTemplate;
    let newNameInput = newLi.querySelector(".language-name-input");
    let newCodeInput = newLi.querySelector(".language-code-input");
    let saveButton = newLi.querySelector(".save-button");
    let deleteButton = newLi.querySelector(".delete-button");
    deleteButton.remove();
    saveButton.addEventListener("click", () => {
      var newLanguage = { name: newNameInput.value, code: newCodeInput.value };
      customLanguages.push(newLanguage);
      chrome.storage.sync.set({ customLanguages: customLanguages });
      newNameInput.value = "";
      newCodeInput.value = "";

      let li = createLi(newLanguage);
      newLi.before(li);
    });
    languageList.appendChild(newLi);
  });
});
