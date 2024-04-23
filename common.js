const LyricsLoaded = "lyrics-loaded";
const SongLyricsSelector = '[data-testid="fullscreen-lyric"] div';
const lyricsColorKey = "lyricsColor";
const autoTranslateKey = "autoTranslate";
const defaultTargetLanguageKey = "defaultTargetLanguage";

async function translateText(text, targetLanguage) {
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

      return translatedTexts.join(" ");
    } else {
      throw new Error("Translation failed.");
    }
  } catch (error) {
    console.error("Translation error:", error);
  }
}

function getSongLyrics() {
  return document.querySelectorAll(SongLyricsSelector);
}

async function translateLyrics(lyrics, targetLanguage, lyricsColor) {
  if (
    lyrics.hasAttribute(LyricsLoaded) &&
    lyrics.getAttribute(LyricsLoaded) === targetLanguage
  ) {
    return;
  }

  lyrics.setAttribute(LyricsLoaded, targetLanguage);

  var lyricsText = lyrics.innerText;
  if (lyricsText) {
    var translatedLyrics = await translateText(
      lyricsText.toString(),
      targetLanguage
    );

    if (
      translatedLyrics.toString().toLocaleLowerCase() ===
      lyricsText.toString().toLocaleLowerCase()
    ) {
      return;
    }

    if (lyrics.getElementsByClassName(LyricsLoaded).length > 0) {
      return;
    }

    let html =
      '<p class="' +
      LyricsLoaded +
      '" style="color: ' +
      lyricsColor +
      ';">' +
      translatedLyrics +
      "</p>";
    lyrics.innerHTML += html;
  }
}

async function translateSongLyrics(targetLanguage, lyricsColor) {

  var songLyrics = getSongLyrics();

  for (let lyrics of songLyrics) {
    await translateLyrics(lyrics, targetLanguage, lyricsColor);
  }
}

async function resetSongLyrics() {
  var songLyrics = getSongLyrics();
  for (let lyrics of songLyrics) {
    let loadedLyrics = lyrics.getElementsByClassName(LyricsLoaded);
    lyrics.removeAttribute(LyricsLoaded);
    for (let loadedLyric of loadedLyrics) {
      loadedLyric.remove();
    }
  }
}
function changeColor(color) {
  var songLyrics = getSongLyrics();
  for (let lyrics of songLyrics) {
    let loadedLyrics = lyrics.getElementsByClassName(LyricsLoaded);
    for (let loadedLyric of loadedLyrics) {
      loadedLyric.style.color = color;
    }
  }
}

async function changeLanguage(language) {
  var songLyrics = getSongLyrics();
  var color = (await chrome.storage.sync.get(["lyricsColor"]))["lyricsColor"];
  for (let lyrics of songLyrics) {
    let loadedLyrics = lyrics.getElementsByClassName(LyricsLoaded);
    for (let loadedLyric of loadedLyrics) {
      loadedLyric.remove();
    }
    if (lyrics.hasAttribute(LyricsLoaded)) {
      lyrics.removeAttribute(LyricsLoaded);
      translateLyrics(lyrics, language, color);
    }
  }
}