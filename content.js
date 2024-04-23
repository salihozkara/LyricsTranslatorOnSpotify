function loaded() {
  chrome.storage.sync.get([lyricsColorKey], function (result) {
    if (!result[lyricsColorKey]) {
      chrome.storage.sync.set({ lyricsColor: "#00ff00" });
    }
  });
  chrome.storage.sync.get(
    [autoTranslateKey, defaultTargetLanguageKey, lyricsColorKey],
    function (result) {
      if (result[autoTranslateKey]) {
        translateSongLyrics(result[defaultTargetLanguageKey], result[lyricsColorKey]);
      }
    }
  );
}

var targetDiv = document.querySelector(SongLyricsSelector);
var contentObserver = new MutationObserver(function (mutations) {
  mutations.forEach(async function (mutation) {
    await load(mutation.addedNodes);
  });
});
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    observeContents(mutation.addedNodes, observer);
  });
});

if (targetDiv) {
  observer.observe(targetDiv, { childList: true });
} else {
  observer.observe(document.body, { childList: true, subtree: true });
}

async function load(divs) {
  divs.forEach(async (div) => {
    if (
      div.parentElement &&
      div.parentElement.classList.contains(SongLyricsSelector)
    ) {
      chrome.storage.sync.get(
        [autoTranslateKey, defaultTargetLanguageKey, lyricsColorKey],
        async function (result) {
          if (result[autoTranslateKey]) {
            await translateLyrics(
              div,
              result[defaultTargetLanguageKey],
              result[lyricsColorKey]
            );
          }
        }
      );
    }
  });
}

function observeContents(addedNodes, observer) {
  for (var i = 0; i < addedNodes.length; i++) {
    if (
      (addedNodes[i].classList && addedNodes[i].matches(SongLyricsSelector)) ||
      (addedNodes[i] instanceof HTMLElement &&
        addedNodes[i].querySelectorAll(SongLyricsSelector).length != 0)
    ) {
      observeDivContent(addedNodes[i]);
      break;
    }
  }
}

function observeDivContent(div) {
  loaded();
  contentObserver.observe(div, { childList: true, subtree: true });
}
