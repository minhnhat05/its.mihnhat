/* =====================================================
   CẤU HÌNH — CHỈ CẦN SỬA PHẦN NÀY
   ===================================================== */
const CONFIG = {
  name: "Minh Nhật",
  bio: "it's mih nhat ✨",

  // Ảnh đại diện (GIF / WebP động đều được). Để trống hoặc sai đường dẫn -> tự tạo avatar chữ cái đầu
  avatar: "assets/avatar.jpg",

  // Video nền (mp4). Để "" hoặc không có file -> dùng gradient động
  backgroundVideo: "assets/bg.mp4",

  // Nhạc (link trực tiếp tới file .mp3, có thể là file trong assets hoặc link https://...mp3)
  // Để src: "" nếu không muốn có trình phát nhạc
  music: {
    src: "assets/music.mp3",
    title: "Stay With Me",
    volume: 0.5 // 0 -> 1
  },

  // Danh sách link: thêm / xoá / đổi thứ tự thoải mái
  // icon: tên icon Font Awesome (https://fontawesome.com/icons) ; color: màu icon khi hover
  links: [
    { label: "Facebook",  url: "https://facebook.com/ten-cua-ban",  icon: "fa-brands fa-facebook-f", color: "#1877f2" },
    { label: "Discord",   url: "https://discord.gg/ma-moi",         icon: "fa-brands fa-discord",    color: "#5865f2" },
    { label: "Instagram", url: "https://instagram.com/ten-cua-ban", icon: "fa-brands fa-instagram",  color: "#e1306c" },
    { label: "TikTok",    url: "https://tiktok.com/@ten-cua-ban",   icon: "fa-brands fa-tiktok",     color: "#25f4ee" },
    { label: "YouTube",   url: "https://youtube.com/@ten-cua-ban",  icon: "fa-brands fa-youtube",    color: "#ff0033" }
  ]
};

/* =====================================================
   PHẦN DƯỚI LÀ LOGIC — thường không cần sửa
   ===================================================== */
const $ = (id) => document.getElementById(id);

/* ---------- Thông tin + avatar ---------- */
document.title = CONFIG.name;
$("name").textContent = CONFIG.name;
$("bio").textContent = CONFIG.bio;

function letterAvatar(name) {
  const letter = (name.trim()[0] || "?").toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs>` +
    `<rect width="200" height="200" fill="url(#g)"/>` +
    `<text x="50%" y="54%" font-size="96" font-family="Arial" font-weight="700" fill="#fff" ` +
    `text-anchor="middle" dominant-baseline="middle">${letter}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const avatar = $("avatar");
avatar.onerror = () => { avatar.onerror = null; avatar.src = letterAvatar(CONFIG.name); };
avatar.src = CONFIG.avatar || letterAvatar(CONFIG.name);

/* ---------- Danh sách link ---------- */
const linksEl = $("links");
CONFIG.links.forEach((l) => {
  const a = document.createElement("a");
  a.className = "link";
  a.href = l.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  if (l.color) a.style.setProperty("--c", l.color);

  const icon = document.createElement("i");
  icon.className = l.icon || "fa-solid fa-link";

  const label = document.createElement("span");
  label.textContent = l.label;

  const arrow = document.createElement("i");
  arrow.className = "fa-solid fa-arrow-right arrow";

  a.append(icon, label, arrow);
  linksEl.appendChild(a);
});

/* ---------- Video nền ---------- */
const bgVideo = $("bgVideo");
if (CONFIG.backgroundVideo) {
  bgVideo.addEventListener("loadeddata", () => document.body.classList.add("has-video"));
  bgVideo.addEventListener("error", () => bgVideo.remove());
  bgVideo.src = CONFIG.backgroundVideo;
  bgVideo.play().catch(() => {});
} else {
  bgVideo.remove();
}

/* ---------- Trình phát nhạc ---------- */
const audio = $("audio");
const player = $("player");
const playBtn = $("playBtn");
const seek = $("seek");
const volume = $("volume");
const muteBtn = $("muteBtn");
const hasMusic = !!(CONFIG.music && CONFIG.music.src);

function setFill(el) {
  const p = ((el.value - el.min) / (el.max - el.min)) * 100;
  el.style.setProperty("--fill", p + "%");
}

function fmt(t) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updatePlayIcon() {
  playBtn.innerHTML = audio.paused
    ? '<i class="fa-solid fa-play"></i>'
    : '<i class="fa-solid fa-pause"></i>';
}

function updateVolIcon() {
  const v = audio.muted ? 0 : audio.volume;
  const cls = v === 0 ? "fa-volume-xmark" : v < 0.5 ? "fa-volume-low" : "fa-volume-high";
  muteBtn.innerHTML = `<i class="fa-solid ${cls}"></i>`;
}

if (hasMusic) {
  player.hidden = false;
  $("songTitle").textContent = CONFIG.music.title || "Nhạc nền";

  audio.src = CONFIG.music.src;
  audio.volume = CONFIG.music.volume ?? 0.5;
  volume.value = audio.volume;
  setFill(volume);
  setFill(seek);
  updateVolIcon();

  let dragging = false;

  playBtn.addEventListener("click", () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });
  audio.addEventListener("play", updatePlayIcon);
  audio.addEventListener("pause", updatePlayIcon);

  audio.addEventListener("loadedmetadata", () => { $("dur").textContent = fmt(audio.duration); });
  audio.addEventListener("timeupdate", () => {
    $("cur").textContent = fmt(audio.currentTime);
    if (!dragging && audio.duration) {
      seek.value = (audio.currentTime / audio.duration) * 1000;
      setFill(seek);
    }
  });

  seek.addEventListener("input", () => {
    dragging = true;
    setFill(seek);
    if (audio.duration) {
      audio.currentTime = (seek.value / 1000) * audio.duration;
      $("cur").textContent = fmt(audio.currentTime);
    }
  });
  seek.addEventListener("change", () => { dragging = false; });

  volume.addEventListener("input", () => {
    audio.volume = parseFloat(volume.value);
    audio.muted = false;
    setFill(volume);
    updateVolIcon();
  });

  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    updateVolIcon();
  });

  audio.addEventListener("error", () => {
    $("songTitle").textContent = "Không tìm thấy file nhạc";
  });
} else {
  player.remove();
  audio.remove();
}

/* ---------- Bỏ màn hình "Click để vào" ---------- */
const card = $("card");
$("enter").remove();
requestAnimationFrame(() => card.classList.add("show"));

/* Nhạc: thử phát luôn, nếu bị chặn thì phát khi người xem chạm/click lần đầu */
if (hasMusic) {
  audio.play().catch(() => {
    const start = () => {
      audio.play().catch(() => {});
      ["click", "touchstart", "keydown"].forEach((ev) =>
        document.removeEventListener(ev, start)
      );
    };
    ["click", "touchstart", "keydown"].forEach((ev) =>
      document.addEventListener(ev, start)
    );
  });
}

/* ---------- Hạt bay (particles) ---------- */
(function particles() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = $("particles");
  const ctx = canvas.getContext("2d");
  let w, h, dots;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor((w * h) / 22000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.4 + 0.15),
      a: Math.random() * 0.5 + 0.2
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.y < -5) { d.y = h + 5; d.x = Math.random() * w; }
      if (d.x < -5) d.x = w + 5;
      if (d.x > w + 5) d.x = -5;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${d.a})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  frame();
})();
