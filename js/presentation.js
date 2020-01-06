class Presentation {
  constructor(el) {
    const headers = [...el.querySelectorAll("h1[id],h2[id]")].map(h => `#${h.id}`);
    let currentPageIndex = headers.findIndex(h => h === location.hash) || 0;
    currentPageIndex = currentPageIndex > 0 ? currentPageIndex : 0;

    this.state = {
      headers,
      currentPageIndex,
    };
  }

  init() {
    this.listenKeyPresses();
  }

  goTo(pageIndex) {
    const { headers } = this.state;
    this.state.currentPageIndex = pageIndex;
    location.hash = headers[pageIndex];
  }

  listenKeyPresses() {
    window.addEventListener("keydown", e => {
      const {
        headers,
        currentPageIndex,
      } = this.state;

      if (e.key === "ArrowRight" && (currentPageIndex + 1) < headers.length) {
        this.goTo(currentPageIndex + 1)
      }
      if (e.key === "ArrowLeft" && currentPageIndex > 0) {
        this.goTo(currentPageIndex - 1)
      }
    });
  }
}

window.onload = () => {
  document.querySelectorAll("article.presentation").forEach(el => {
    new Presentation(el).init();
  });
}