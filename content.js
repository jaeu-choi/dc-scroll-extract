chrome.storage.local.get("scriptCollectorEnabled", (res) => {
  if (!res.scriptCollectorEnabled) return;

  if (!window.__scriptCollectorInitialized) {
    window.__scriptCollectorInitialized = true;

    document.addEventListener("dblclick", async function (e) {
      const target = e.target.closest("div[data-index]");
      if (!target) {
        alert("스크립트 셀을 더블클릭해주세요.");
        return;
      }

      const scrollParent = findScrollableParent(target);
      if (!scrollParent) {
        alert("스크롤 가능한 부모 요소를 찾지 못했습니다.");
        return;
      }

      const collected = new Map();
      let unchangedScrollCount = 0;
      let prevScrollTop = -1;
      let reachedEndCounter = 0;

      while (true) {
        scrollParent.querySelectorAll("div[data-index]").forEach((div) => {
          const index = parseInt(div.getAttribute("data-index"));
          const p = div.querySelector("p");
          if (p && !collected.has(index)) {
            collected.set(index, p.innerText.trim());
          }
        });

        scrollParent.scrollBy(0, 300);
        await new Promise((r) => setTimeout(r, 500));

        const { scrollTop, scrollHeight, clientHeight } = scrollParent;
        const scrollDelta = Math.abs(scrollTop - prevScrollTop);

        if (scrollDelta < 2) {
          unchangedScrollCount++;
        } else {
          unchangedScrollCount = 0;
          prevScrollTop = scrollTop;
        }

        const reachedEnd = scrollTop + clientHeight >= scrollHeight - 1;
        if (reachedEnd) {
          reachedEndCounter++;
        }

        if (reachedEnd && unchangedScrollCount >= 5) {
          break;
        }
      }

      const titleEl = document.querySelector(".unit-title p");
      const titleText = titleEl ? titleEl.innerText.trim() : "script_items";

      const output = [
        `제목: ${titleText}`,
        "",
        ...[...collected.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([i, t]) => `${i.toString().padStart(2, "0")}. ${t}`),
      ].join("\n");

      const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const sanitizedTitle = titleText.replace(/[\\/:*?"<>|]/g, "_");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizedTitle}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      alert("스크립트 수집 및 저장 완료");
    });

    function findScrollableParent(el) {
      while (el) {
        const style = getComputedStyle(el);
        const overflowY = style.overflowY;
        const scrollable = overflowY === "auto" || overflowY === "scroll";
        if (scrollable && el.scrollHeight > el.clientHeight) return el;
        el = el.parentElement;
      }
      return null;
    }
  }
});
