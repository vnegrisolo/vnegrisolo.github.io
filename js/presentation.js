class Presentation {
  constructor(el) {
    const headers = [...el.querySelectorAll("h1[id],h2[id]")].map(h => `#${h.id}`);
    let currentPageIndex = headers.findIndex(h => h === location.hash) || 0;
    currentPageIndex = currentPageIndex > 0 ? currentPageIndex : 0;
    const progressEl = document.getElementById("presentation-progress");

    this.state = {
      headers,
      currentPageIndex,
      progressEl,
    };
  }

  init() {
    this.listenKeyPresses();
    this.setProgressBar();
  }

  setProgressBar() {
    const { headers, currentPageIndex, progressEl } = this.state;
    progressEl.innerHTML = `${currentPageIndex + 1} / ${headers.length}`;
  }

  goTo(pageIndex) {
    const { headers } = this.state;
    this.state.currentPageIndex = pageIndex;
    location.hash = headers[pageIndex];
    this.setProgressBar();
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