(() => {
  const track = document.getElementById("bannerTrack");
  const dots = [...document.querySelectorAll("#bannerDots .dot")];
  if (!track || !dots.length) return;

  const slides = [...track.children];
  let index = 0;
  let timer;

  const goTo = (next) => {
    index = (next + slides.length) % slides.length;
    track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });
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

(() => {
  const el = document.querySelector(".header-temp");
  if (!el) return;

  const CACHE_KEY = "dijital_alem_aksaray_temp_c";
  const LAT = 38.3686;
  const LON = 34.037;
  const URL =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m&timezone=Europe%2FIstanbul`;

  const apply = (celsius) => {
    const rounded = Math.round(Number(celsius));
    if (!Number.isFinite(rounded)) return;
    el.textContent = `${rounded}°`;
    el.setAttribute("aria-label", `Sıcaklık ${rounded} derece`);
  };

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached != null) apply(cached);
  } catch (_) {
    /* ignore quota / private mode */
  }

  const fetchLive = async () => {
    try {
      const res = await fetch(URL, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const t = data?.current?.temperature_2m;
      if (typeof t !== "number" || !Number.isFinite(t)) return;
      apply(t);
      try {
        localStorage.setItem(CACHE_KEY, String(t));
      } catch (_) {
        /* ignore */
      }
    } catch (_) {
      /* offline — keep last cached or static HTML value */
    }
  };

  fetchLive();
})();
