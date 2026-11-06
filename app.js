(() => {
  const track = document.getElementById("bannerTrack");
  const frame = document.getElementById("bannerFrame");
  const dots = [...document.querySelectorAll("#bannerDots .dot")];
  if (!track || !dots.length) return;

  const slides = [...track.children];
  let index = 0;
  let timer;

  const goTo = (next) => {
    index = (next + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });
    const slideFrame = slides[index]?.getAttribute("data-frame");
    if (frame && slideFrame) {
      frame.style.setProperty("--frame", slideFrame);
    }
  };

  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), 4200);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
      restart();
    });
  });

  let startX = 0;
  let deltaX = 0;
  let dragging = false;

  track.addEventListener(
    "touchstart",
    (e) => {
      dragging = true;
      startX = e.touches[0].clientX;
      deltaX = 0;
      clearInterval(timer);
    },
    { passive: true }
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      if (!dragging) return;
      deltaX = e.touches[0].clientX - startX;
    },
    { passive: true }
  );

  track.addEventListener("touchend", () => {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(deltaX) > 40) {
      goTo(deltaX < 0 ? index + 1 : index - 1);
    }
    restart();
  });

  // Allow design screenshots / demos to freeze on first slide
  const params = new URLSearchParams(location.search);
  const frozen = params.has("freeze") || params.get("slide") !== null;
  const start = Number(params.get("slide") || 0);

  goTo(Number.isFinite(start) ? start : 0);
  if (!frozen) restart();
  else clearInterval(timer);

  window.__bannerGoTo = goTo;
})();
