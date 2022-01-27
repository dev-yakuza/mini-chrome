const { BrowserWindow } = require("electron");
const { setViewSize } = require("../logic/view");
const { setHeader, setHeaderSize } = require("../page");
const { Tab } = require("./tab");

class Window {
  constructor(browserWindow) {
    if (!browserWindow || !(browserWindow instanceof BrowserWindow)) {
      throw new Error("Window needs a BrowserWindow to be initialized.");
    }

    setHeader(browserWindow);

    browserWindow.setFullScreenable(true);

    browserWindow.on("resize", () => {
      const [headerView, pageView] = this.browserWindow.getBrowserViews();
      const [curWidth, curHeight] = browserWindow.getSize();

      setHeaderSize(headerView, curWidth);
      setViewSize(pageView, curWidth, curHeight);
    });

    this.browserWindow = browserWindow;
    this.tabs = [];
  }

  createNewTabWithView(browserView) {
    const newTabIndex = this.tabs.length;
    const newTab = new Tab(browserView, newTabIndex);

    this.tabs.push(newTab);
    this.setFocusTabIdx(newTab);

    return newTab;
  }

  setPageViewByTab(tab) {
    const views = this.browserWindow.getBrowserViews();
    while (views.length >= 2) {
      this.browserWindow.removeBrowserView(views.pop());
      // views에서 pop해도 browserWindow 내에는 그대로 존재하므로 별도로 remove 필요
    }
    this.browserWindow.addBrowserView(tab.getBrowserView());
  }

  toggleFocusTab(tab) {
    this.setPageViewByTab(tab);
    this.setFocusTabIdx(tab);
  }

  getBrowserWindow() {
    return this.browserWindow;
  }

  getTabs() {
    return this.tabs.map((tab) => tab.toString());
  }

  getTabById(tabId) {
    if (typeof tabId === "string") {
      tabId = parseInt(tabId);
    }

    for (let idx = 0; idx < this.tabs.length; idx++) {
      const tab = this.tabs[idx];
      if (tab.getId() === tabId) return tab;
    }
    throw new Error("Failed To find a tab by the given tabId on the window.");
  }

  deleteTabByTabId(tabId) {
    this.tabs.filter((tab) => tab.getId() !== tabId);
  }

  getFocusTabIdx() {
    return this.focusTabIdx;
  }

  setFocusTabIdx(tab) {
    this.focusTabIdx = tab.getIdx();
  }
}

module.exports = { Window };
