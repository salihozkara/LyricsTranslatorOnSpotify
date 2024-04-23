function runScript(args, func) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Use the Scripting API to execute a script
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      args: args,
      func: func,
    });
  });
}

function callReset() {
  runScript([], resetSongLyrics);
}

function callTranslate() {
  const targetLanguage = document.getElementById("languageSelect").value;
  const lyricsColor = document.getElementById("lyricsColor").value;
  runScript([targetLanguage, lyricsColor], translateSongLyrics);
};

function callChangeLanguage() {
  const targetLanguage = document.getElementById("languageSelect").value;
  runScript([targetLanguage], changeLanguage);
};


function callChangeColor() {
  const lyricsColor = document.getElementById("lyricsColor").value;
  runScript([lyricsColor], changeColor);
};

async function getDefaultLanguage () {
  let defaultTargetLanguage = (await chrome.storage.sync.get([
    defaultTargetLanguageKey,
  ]))[defaultTargetLanguageKey];
  if (!defaultTargetLanguage) {
    defaultTargetLanguage = navigator.language || navigator.userLanguage;
    if (defaultTargetLanguage) {
      defaultTargetLanguage = defaultTargetLanguage.split("-")[0];
    }
  }

  return defaultTargetLanguage;
};

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.sync.get([defaultTargetLanguageKey], async (result) => {
    let defaultLanguage =
      result[defaultTargetLanguageKey] ||
      navigator.language ||
      navigator.userLanguage;
    let languageSelect = document.getElementById("languageSelect");

    languageSelect.addEventListener("change", () => {
      addDefaultLanguageToLocalStorage(languageSelect.value);
      callChangeLanguage();
    });

    var disabledLanguages = (await chrome.storage.sync.get(["disabledLanguages"])).disabledLanguages || [];
    var customLanguages = (await chrome.storage.sync.get(["customLanguages"])).customLanguages || [];
    var activeLanguages = languages.filter((language) => !disabledLanguages.includes(language.code)).concat(customLanguages);

    activeLanguages = activeLanguages.reduce((acc, language) => {
      if (!acc.find((l) => l.code === language.code)) {
        acc.push(language);
      }
      return acc;
    }, []);
    for (let language of activeLanguages){
      let option = document.createElement("option");
      option.value = language.code;
      option.text = language.name;
      option.selected = language.code === defaultLanguage;
      languageSelect.appendChild(option);
    }
  });

  let autoTranslateCheckbox = document.getElementById("autoTranslateCheckbox");
  chrome.storage.sync.get(["autoTranslate"], (result) => {
    autoTranslateCheckbox.checked = result.autoTranslate;
  });
  autoTranslateCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({ autoTranslate: autoTranslateCheckbox.checked });
    if (autoTranslateCheckbox.checked) {
      callTranslate();
    }
  });

  loadLyricsColorFromLocalStorage();
  document
    .getElementById("lyricsColor")
    .addEventListener("change", () => {
      addLyricsColorToLocalStorage();
      callChangeColor();
    });
});

document.getElementById("resetButton").addEventListener("click", callReset);

const addDefaultLanguageToLocalStorage = (defaultTargetLanguage) => {
  chrome.storage.sync.set({ defaultTargetLanguage: defaultTargetLanguage });
};

const addLyricsColorToLocalStorage = () => {
  let lyricsColor = document.getElementById("lyricsColor").value;
  chrome.storage.sync.set({ lyricsColor: lyricsColor });
};

const loadLyricsColorFromLocalStorage = () => {
  chrome.storage.sync.get(["lyricsColor"], (result) => {
    let lyricsColor = result.lyricsColor;
    if (lyricsColor) {
      document.getElementById("lyricsColor").value = lyricsColor;
    }
  });
};

document
  .getElementById("translateButton")
  .addEventListener("click", () => {
    callReset();
    callTranslate();
  });

document.getElementById("editLanguages").addEventListener("click", () => {
  window.open("editLanguages.html", "_blank");
});
