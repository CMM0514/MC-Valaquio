const modal = document.querySelector("#preview-modal");
const modalImage = document.querySelector("#preview-image");
const modalTitle = document.querySelector("#preview-title");
const modalPlaceholder = document.querySelector("#preview-placeholder");
const modalClose = document.querySelector(".preview-close");

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

function openPreview(src, title) {
  modalTitle.textContent = title;
  if (src) {
    modalImage.alt = title;
    modalImage.src = src;
    modalImage.hidden = false;
    modalPlaceholder.hidden = true;
  } else {
    modalImage.removeAttribute("src");
    modalImage.hidden = true;
    modalPlaceholder.hidden = false;
  }
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalClose.focus();
}

function closePreview() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
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

  openPreview(trigger.dataset.preview, trigger.dataset.title);
});

modalImage.addEventListener("error", () => {
  modalImage.hidden = true;
  modalPlaceholder.hidden = false;
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
