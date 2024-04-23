const TranslateSonglyrics = "translate-song-lyrics";

const ResetSonglyrics = "reset-song-lyrics";

const SongLyricsClass = "esRByMgBY3TiENAsbDHA";

const LyricsLoaded = "lyrics-loaded";

const reset = async () =>
  chrome.runtime.sendMessage({
    action: ResetSonglyrics,
  });

const translate = async () => {
  const targetLanguage = document.getElementById("languageSelect").value;
  const lyricsColor = document.getElementById("lyricsColor").value;
  chrome.runtime.sendMessage({
    action: TranslateSonglyrics,
    targetLanguage: targetLanguage,
    lyricsColor: lyricsColor,
  });
};

const getDefaultLanguage = () => {
  let defaultTargetLanguage = chrome.storage.sync.get([
    "defaultTargetLanguage",
  ]);
  if (!defaultTargetLanguage) {
    defaultTargetLanguage = navigator.language || navigator.userLanguage;
    if (defaultTargetLanguage) {
      defaultTargetLanguage = defaultTargetLanguage.split("-")[0];
    }
  }

  return defaultTargetLanguage;
};

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.sync.get(["defaultTargetLanguage"], (result) => {
    let defaultLanguage =
      result.defaultTargetLanguage ||
      navigator.language ||
      navigator.userLanguage;
    let languageSelect = document.getElementById("languageSelect");

    languageSelect.addEventListener("change", () => {
      addDefaultLanguageToLocalStorage(languageSelect.value);
    });

    for (let language of languages) {
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
  autoTranslateCheckbox.addEventListener("change", async () => {
    chrome.storage.sync.set({ autoTranslate: autoTranslateCheckbox.checked });
    if (autoTranslateCheckbox.checked) {
      await translate();
    }
  });

  loadLyricsColorFromLocalStorage();
  document.getElementById("lyricsColor").addEventListener("change", () => {
    addLyricsColorToLocalStorage();
  });
});

document.getElementById("resetButton").addEventListener("click", reset);

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
  .addEventListener("click", async () => {
    await reset();
    await translate();
  });
