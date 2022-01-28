const {
  custom_events: { red: closeWindow },
  custom_utils: {
    setFocusTabByTabId,
    resetAllTabs,
    createNewTabElement,
    cleanseTabFocus,
    updateTabState,
  },
  request_main: {
    getCurrentTabs,
    createNewTab,
    toggleFocusTabById,
    deleteTabById,
  },
  listen_on: { renderAllTabs, renderNewTab, updateTabInfo },
} = window;

const omnibox2 = document.getElementById("omnibox");
const focusOnOmniboxIfNewTab = () => {
  if (!omnibox2.value || omnibox2.value === "") {
    omnibox2.focus(); // omnibox2.select();
  } else {
    omnibox2.blur();
  }
};

const tabArea = document.getElementById("tab-area-container");
const isLoading = () => tabArea.classList.contains("loading");
const setIsLoading = (isLoading) => {
  isLoading
    ? tabArea.classList.add("loading")
    : tabArea.classList.remove("loading");
};

// event delegation
tabArea.addEventListener("click", (e) => {
  const { target } = e;

  if (isLoading()) return;

  if (target.id === "tab-create-btn") triggerCreateNewTab();
  if (target.classList.contains("tab-container")) {
    if (target.parentElement.classList.contains("focused-tab")) return;
    triggerFocusTabToggle(target.parentElement.id);
  }
  if (target.classList.contains("tab-close-btn")) triggerTabClose(target);
});

const triggerCreateNewTab = () => {
  setIsLoading(true);
  createNewTab();
};

const triggerFocusTabToggle = (tabId) => {
  toggleFocusTabById(tabId);
  setFocusTabByTabId(tabId);
};

const triggerTabClose = async (target) => {
  const tab = target.parentElement.parentElement.parentElement;

  if (!tab.classList.contains("tab")) {
    throw new Error("document structure exception on tab-close-btn div");
  }
  const isFocusTab = tab.classList.contains("focused-tab");
  let focusTabId = tab.id;

  if (isFocusTab) {
    const allTabs = document.querySelectorAll(".tab");

    if (allTabs.length <= 1) return closeWindow();

    focusTabId = findNextFocusTabId(allTabs, tab);
    triggerFocusTabToggle(focusTabId);
  }

  tab.remove();

  await deleteTabById(tab.id, focusTabId);
};

const findNextFocusTabId = (allTabs, curFocusTab) => {
  let focusTabIdx = -1;

  for (let tabIdx = 0; tabIdx < allTabs.length; tabIdx++) {
    if (allTabs[tabIdx] === curFocusTab) {
      focusTabIdx = tabIdx;
      break;
    }
  }

  if (focusTabIdx === allTabs.length - 1) {
    focusTabIdx--;
  } // 마지막 탭은 곧 제거됨. 해당 index의 탭에 focus 불가.

  return allTabs[focusTabIdx].id;
};

// listen on requests from main process
renderAllTabs((_, { tabs, focusTabId }) => {
  tabs = tabs.map((tab) => JSON.parse(tab));
  resetAllTabs(tabs, focusTabId);

  setIsLoading(false);
});

renderNewTab(async (_, { tab, focusTabId }) => {
  tab = JSON.parse(tab);
  const tabs = document.getElementById("tabs");
  await createNewTabElement(tab, focusTabId, tabs);
  cleanseTabFocus(focusTabId);

  setIsLoading(false);
});

updateTabInfo((_, tabData) => {
  const {
    id: tabId,
    title,
    url,
    canGoBack,
    canGoForward,
    pageLoading,
  } = JSON.parse(tabData);
  const tab = document.getElementById(tabId);

  if (!tab) return; // 아직 생성되지 않은 탭을 업데이트하려는 경우 (탭 생성시에도 트리거되기 때문)

  tab.getElementsByClassName("tab-title")[0].innerText = title;

  if (tab.classList.contains("focused-tab")) {
    updateTabState(canGoBack, canGoForward, pageLoading, url);
  }

  focusOnOmniboxIfNewTab();
});

// init
const initTabs = async () => {
  await getCurrentTabs();
};

initTabs();
