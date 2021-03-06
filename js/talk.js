class Talk {
  constructor(el) {
    const [header, content, footer] = el.children;
    const progressEl = document.getElementById("talk-progress");
    const page = parseInt(location.hash.replace("#", "")) || 1;
    const channel = typeof BroadcastChannel != "undefined" && new BroadcastChannel('talk_channel');

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
      channel,
    };
  }

  init() {
    this.listenKeyPresses();
    this.listenChannel();
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

  listenChannel() {
    const {
      channel
    } = this.state;

    if (!channel) {
      return;
    }

    channel.onmessage = ({
      data
    }) => {
      if (this.state.page !== data.page) {
        this.state.page = data.page;
        this.render();
      }
    };
  }

  render() {
    const {
      pagedNodes,
      page,
      progressEl,
      channel,
    } = this.state;

    progressEl.innerHTML = `${page} / ${pagedNodes.length}`;
    location.hash = page;
    console.clear();

    pagedNodes.forEach((nodes, i) => {
      nodes.forEach(node => {
        if (page === i + 1) {
          [...node.innerHTML.matchAll(/--(.+)--/g)].map(x => console.log(x[1].toString()));
          if ([...node.classList].includes("two-column")) {
            node.style.display = "inline-block";
          } else {
            node.style.display = "block";
          }
        } else {
          node.style.display = "none";
        }
      });
    });

    channel && channel.postMessage({page});
  }
}

window.onload = () => {
  document.querySelectorAll("article.talk").forEach(el => {
    new Talk(el).init();
  });
}