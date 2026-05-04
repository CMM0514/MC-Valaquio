const modal = document.querySelector("#preview-modal");
const modalImage = document.querySelector("#preview-image");
const modalTitle = document.querySelector("#preview-title");
const modalPlaceholder = document.querySelector("#preview-placeholder");
const modalClose = document.querySelector(".preview-close");
let galleryItems = [];
let galleryIndex = 0;
let galleryControls;
let galleryStatus;
let galleryPrev;
let galleryNext;
let previewLink;

function setActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".sidenav-nav a").forEach((link) => {
    const isActive =
      link.getAttribute("href").toLowerCase() === currentPage.toLowerCase();
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function ensureGalleryControls() {
  if (galleryControls) {
    return;
  }

  galleryControls = document.createElement("div");
  galleryControls.className = "preview-controls";
  galleryControls.innerHTML = `
    <button class="preview-nav" type="button" data-direction="previous">Previous</button>
    <span class="preview-count" aria-live="polite"></span>
    <button class="preview-nav" type="button" data-direction="next">Next</button>
  `;

  document.querySelector(".preview-content").appendChild(galleryControls);
  galleryStatus = galleryControls.querySelector(".preview-count");
  galleryPrev = galleryControls.querySelector('[data-direction="previous"]');
  galleryNext = galleryControls.querySelector('[data-direction="next"]');

  galleryControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-direction]");
    if (!button) {
      return;
    }

    const step = button.dataset.direction === "next" ? 1 : -1;
    showGalleryImage(galleryIndex + step);
  });
}

function ensurePreviewLink() {
  if (previewLink) {
    return;
  }

  previewLink = document.createElement("a");
  previewLink.className = "preview-open-link";
  previewLink.target = "_blank";
  previewLink.rel = "noopener";
  previewLink.textContent = "Open image";
  document.querySelector(".preview-content").appendChild(previewLink);
}

function updateGalleryControls() {
  ensureGalleryControls();
  const hasMultiple = galleryItems.length > 1;
  galleryControls.hidden = !hasMultiple;

  if (!hasMultiple) {
    return;
  }

  galleryStatus.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
  galleryPrev.disabled = galleryIndex === 0;
  galleryNext.disabled = galleryIndex === galleryItems.length - 1;
}

function showGalleryImage(index) {
  const nextIndex = Number.isFinite(Number(index)) ? Number(index) : 0;
  galleryIndex = Math.max(0, Math.min(nextIndex, galleryItems.length - 1));
  const src = galleryItems[galleryIndex];

  if (src) {
    modalImage.alt = modalTitle.textContent;
    modalImage.src = src;
    modalImage.dataset.originalSrc = src;
    modalImage.removeAttribute("hidden");
    modalPlaceholder.hidden = true;
    modalPlaceholder.style.display = "none";
    ensurePreviewLink();
    previewLink.href = src;
    previewLink.hidden = false;
  } else {
    modalImage.removeAttribute("src");
    modalImage.hidden = true;
    modalPlaceholder.textContent =
      "Preview file placeholder. Replace the filename in this card when your document is ready.";
    modalPlaceholder.hidden = false;
    modalPlaceholder.style.display = "grid";
    ensurePreviewLink();
    previewLink.hidden = true;
  }

  updateGalleryControls();
}

function openPreview(src, title, gallery = []) {
  modalTitle.textContent = title;
  galleryItems = gallery.length ? gallery : src ? [src] : [];
  const initialIndex = galleryItems.indexOf(src);
  galleryIndex = initialIndex >= 0 ? initialIndex : 0;
  showGalleryImage(galleryIndex);
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalClose.focus();
}

function closePreview() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  galleryItems = [];
  galleryIndex = 0;
}

fetch("sidenav.html")
  .then((response) => response.text())
  .then((html) => {
    document.querySelector("#sidenav-container").innerHTML = html;
    setActiveNav();
  });

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-preview]");
  if (!trigger) {
    return;
  }

  const gallery = trigger.dataset.gallery
    ? trigger.dataset.gallery.split("|").filter(Boolean)
    : [];

  openPreview(trigger.dataset.preview, trigger.dataset.title, gallery);
});

modalImage.addEventListener("error", () => {
  modalImage.hidden = true;
  modalPlaceholder.textContent = modalImage.dataset.originalSrc
    ? `Image not found: ${modalImage.dataset.originalSrc}`
    : "Preview file placeholder. Replace the filename in this card when your document is ready.";
  modalPlaceholder.hidden = false;
  modalPlaceholder.style.display = "grid";
  ensurePreviewLink();
  previewLink.hidden = true;
});

modalClose.addEventListener("click", closePreview);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closePreview();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("active")) {
    closePreview();
  }

  if (!modal.classList.contains("active") || galleryItems.length < 2) {
    return;
  }

  if (event.key === "ArrowLeft") {
    showGalleryImage(galleryIndex - 1);
  }

  if (event.key === "ArrowRight") {
    showGalleryImage(galleryIndex + 1);
  }
});

document.querySelectorAll(".preview-frame img").forEach((image) => {
  image.addEventListener("error", () => {
    image.hidden = true;
    image.closest(".preview-frame").classList.add("is-empty");
  });
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
