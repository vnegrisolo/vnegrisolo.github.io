class Presentation {
  constructor(el) {
    const [header, content, footer] = el.children;
    const progressEl = document.getElementById("presentation-progress");
    const page = parseInt(location.hash.replace("#", "")) || 1;

    const contentPagedNodes = [...content.children].reduce(([acc, i], child) => {
      if (child.tagName.toUpperCase() === "HR") {
        return [acc, i + 1];
      } else {
        acc[i] = [...(acc[i] || []), child]
        return [acc, i];
      }
    }, [
      [], 0
    ])[0];

    const pagedNodes = [
      [header],
      ...contentPagedNodes,
      [footer],
    ];

    this.state = {
      pagedNodes,
      page,
      progressEl,
    };
  }

  init() {
    this.listenKeyPresses();
    this.render();
  }

  listenKeyPresses() {
    window.addEventListener("keydown", e => {
      const {
        pagedNodes,
        page,
      } = this.state;

      if (e.key === "ArrowRight" && page < pagedNodes.length) {
        this.state.page = page + 1;
      }
      if (e.key === "ArrowLeft" && page > 1) {
        this.state.page = page - 1;
      }
      this.render();
    });
  }

  render() {
    const {
      pagedNodes,
      page,
      progressEl,
    } = this.state;

    progressEl.innerHTML = `${page} / ${pagedNodes.length}`;
    location.hash = page;

    pagedNodes.forEach((nodes, i) => {
      nodes.forEach(node => {
        node.style.display = page === i + 1 ? "block" : "none";
      });
    });
  }
}

window.onload = () => {
  document.querySelectorAll("article.presentation").forEach(el => {
    new Presentation(el).init();
  });
}