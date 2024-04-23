const TranslateSonglyrics = "translate-song-lyrics";

const ResetSonglyrics = "reset-song-lyrics";

const SongLyricsClass = "esRByMgBY3TiENAsbDHA";

const LyricsLoaded = "lyrics-loaded";

const reset = async () =>
  chrome.runtime.sendMessage({
    action: ResetSonglyrics,
  });

const translate = async (targetLanguage) =>
  chrome.runtime.sendMessage({
    action: TranslateSonglyrics,
    targetLanguage: targetLanguage,
  });

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
  autoTranslateCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({ autoTranslate: autoTranslateCheckbox.checked });
  });
});

document.getElementById("resetButton").addEventListener("click", reset);

const addDefaultLanguageToLocalStorage = (defaultTargetLanguage) => {
  chrome.storage.sync.set({ defaultTargetLanguage: defaultTargetLanguage });
};

document
  .getElementById("translateButton")
  .addEventListener("click", async () => {
    const targetLanguage = document.getElementById("languageSelect").value;
    addDefaultLanguageToLocalStorage(targetLanguage);
    await reset();
    await translate(targetLanguage);
  });
