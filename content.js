const TranslateSonglyrics = "translate-song-lyrics";

const ResetSonglyrics = "reset-song-lyrics";

const SongLyricsClass = "esRByMgBY3TiENAsbDHA";

const LyricsLoaded = "lyrics-loaded";

const translateText = async (text, targetLanguage) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(
    text
  )}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    var translatedTexts = [];
    if (data && data[0]) {
      data[0].forEach((element) => {
        translatedTexts.push(element[0]);
      });

      return translatedTexts.join(".");
    } else {
      throw new Error("Translation failed.");
    }
  } catch (error) {
    console.error("Translation error:", error);
  }
};

const getSongLyrics = () =>
  document
    .getElementsByClassName(SongLyricsClass)[0]
    .getElementsByTagName("div");

async function translateLyrics(lyrics, targetLanguage) {
  if (lyrics.getElementsByTagName("p")[0]) {
    return;
  }

  var lyricsText = lyrics.innerText;
  if (lyricsText) {
    var translatedLyrics = await translateText(
      lyricsText.toString(),
      targetLanguage
    );

    if(translatedLyrics.toString().toLocaleLowerCase() === lyricsText.toString().toLocaleLowerCase()){
      return;
    }

    let html =
      '<p class="' +
      LyricsLoaded +
      '" style="color: #00ff00;">' +
      translatedLyrics +
      "</p>";
    lyrics.innerHTML += html;
  }
}

async function translateSongLyrics(targetLanguage) {
  await resetSongLyrics();

  var songLyrics = getSongLyrics();

  for (let lyrics of songLyrics) {
    await translateLyrics(lyrics, targetLanguage);
  }
}

async function resetSongLyrics() {
  var songLyrics = getSongLyrics();

  for (let lyrics of songLyrics) {
    let loadedLyrics = lyrics.getElementsByClassName(LyricsLoaded);
    for (let loadedLyric of loadedLyrics) {
      loadedLyric.remove();
    }
  }
}


function loaded() {
  chrome.storage.sync.get(
    ["autoTranslate", "defaultTargetLanguage"],
    function (result) {
      if (result.autoTranslate) {
        translateSongLyrics(result.defaultTargetLanguage);
      }
    }
  );
}

var targetDiv = document.querySelector("." + SongLyricsClass);

async function load(divs){
  divs.forEach(async (div) => {
    if(div.parentElement && div.parentElement.classList.contains(SongLyricsClass)){
      chrome.storage.sync.get(
        ["autoTranslate", "defaultTargetLanguage"],
        async function (result) {
          if (result.autoTranslate) {
            await translateLyrics(div, result.defaultTargetLanguage);
          }
        }
      );
    }
  });
}

if (targetDiv) {
  console.log("Div sayfada mevcut");

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      newFunction(mutation.addedNodes, observer);
    });
  });

  observer.observe(targetDiv, { childList: true });
} else {
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      newFunction(mutation.addedNodes, observer);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function newFunction(addedNodes, observer) {
  for (var i = 0; i < addedNodes.length; i++) {
    if ((addedNodes[i].classList &&
      addedNodes[i].classList.contains(SongLyricsClass)) || (addedNodes[i] instanceof HTMLElement && addedNodes[i].getElementsByClassName(SongLyricsClass).length != 0)) {
      observeDivContent(addedNodes[i]);
      break;
    }
  }
}

function observeDivContent(div) {
  loaded();
  var contentObserver = new MutationObserver(function (mutations) {
    mutations.forEach(async function (mutation) {
      let addedNodes = mutation.addedNodes;
      await load(addedNodes);
    });
  });
  contentObserver.observe(div, { childList: true, subtree: true });
}
