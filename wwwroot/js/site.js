// Preview before upload
function previewImage() {
    const input = document.getElementById("fileInput");
    const preview = document.getElementById("previewBox");

    preview.innerHTML = "";

    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        preview.appendChild(img);
    };

    reader.readAsDataURL(file);
}

// Modal zoom
function openModal(src) {
    document.getElementById("modal").style.display = "flex";
    document.getElementById("modalImg").src = src;
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Like system
function likeImage(name) {
    let likes = JSON.parse(localStorage.getItem("likes")) || {};
    likes[name] = (likes[name] || 0) + 1;
    localStorage.setItem("likes", JSON.stringify(likes));
    loadLikes();
}

// Load likes
function loadLikes() {
    let likes = JSON.parse(localStorage.getItem("likes")) || {};

    for (let key in likes) {
        let el = document.getElementById("likes-" + key);
        if (el) el.innerText = "❤️ " + likes[key];
    }
}

// Save caption
function saveCaption(name, text) {
    let captions = JSON.parse(localStorage.getItem("captions")) || {};
    captions[name] = text;
    localStorage.setItem("captions", JSON.stringify(captions));
}

// Load captions
function loadCaptions() {
    let captions = JSON.parse(localStorage.getItem("captions")) || {};

    document.querySelectorAll("input").forEach(input => {
        let name = input.getAttribute("oninput")?.match(/'(.*?)'/)?.[1];
        if (name && captions[name]) {
            input.value = captions[name];
        }
    });
}

// Init
window.onload = function() {
    loadLikes();
    loadCaptions();
    initSlider();
};

// Zoom and Pan variables
let currentSlideIndex = 0;
let currentZoom = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartPanX = 0;
let dragStartPanY = 0;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

function initSlider() {
    const slides = document.querySelectorAll(".slide");
    if (slides.length > 0) {
        updateSliderPosition();
        resetZoom();
        setupPanListeners();
    }
}

function setupPanListeners() {
    const wrapper = document.querySelector(".slider-wrapper");
    if (!wrapper) return;
    
    wrapper.addEventListener("mousedown", handleDragStart);
    wrapper.addEventListener("mousemove", handleDragMove);
    wrapper.addEventListener("mouseup", handleDragEnd);
    wrapper.addEventListener("mouseleave", handleDragEnd);
    wrapper.addEventListener("wheel", handleWheel, { passive: false });
}

function handleDragStart(e) {
    if (currentZoom <= 1) return;
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartPanX = panX;
    dragStartPanY = panY;
    
    e.currentTarget.style.cursor = "grabbing";
}

function handleDragMove(e) {
    if (!isDragging || currentZoom <= 1) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    const wrapper = document.querySelector(".slider-wrapper");
    const wrapperRect = wrapper.getBoundingClientRect();
    const maxPan = (currentZoom - 1) * (wrapperRect.width / 2);
    const maxPanY = (currentZoom - 1) * (wrapperRect.height / 2);
    
    panX = Math.max(-maxPan, Math.min(maxPan, dragStartPanX + deltaX));
    panY = Math.max(-maxPanY, Math.min(maxPanY, dragStartPanY + deltaY));
    
    applyZoom();
}

function handleDragEnd() {
    isDragging = false;
    const wrapper = document.querySelector(".slider-wrapper");
    if (wrapper) {
        wrapper.style.cursor = currentZoom > 1 ? "grab" : "default";
    }
}

function handleWheel(e) {
    if (currentZoom <= 1) return;
    
    e.preventDefault();
    
    if (e.deltaY < 0) {
        zoomIn();
    } else {
        zoomOut();
    }
}

function openSlider(imageName) {
    const slides = document.querySelectorAll(".slide");
    
    // Find the index of the clicked image
    for (let i = 0; i < slides.length; i++) {
        if (slides[i].getAttribute("data-img") === imageName) {
            currentSlideIndex = i;
            break;
        }
    }
    
    resetZoom();
    updateSliderPosition();
    document.getElementById("sliderModal").classList.add("active");
}

function closeSlider() {
    document.getElementById("sliderModal").classList.remove("active");
    resetZoom();
    panX = 0;
    panY = 0;
}

function updateSliderPosition() {
    const track = document.getElementById("sliderTrack");
    const slides = document.querySelectorAll(".slide");
    
    if (slides.length === 0) return;
    
    // Wrap around
    if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    }
    
    const offset = -currentSlideIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
    
    document.getElementById("currentSlide").textContent = currentSlideIndex + 1;
}

function nextSlide() {
    currentSlideIndex++;
    updateSliderPosition();
}

function prevSlide() {
    currentSlideIndex--;
    updateSliderPosition();
}

// Zoom functions
function zoomIn() {
    if (currentZoom < MAX_ZOOM) {
        currentZoom += ZOOM_STEP;
        applyZoom();
    }
}

function zoomOut() {
    if (currentZoom > MIN_ZOOM) {
        currentZoom -= ZOOM_STEP;
        applyZoom();
    }
}

function resetZoom() {
    currentZoom = 1;
    panX = 0;
    panY = 0;
    applyZoom();
}

function applyZoom() {
    const slides = document.querySelectorAll(".slide");
    slides.forEach(slide => {
        slide.style.transform = `scale(${currentZoom}) translate(${panX}px, ${panY}px)`;
        
        // Change cursor based on zoom level
        if (currentZoom > 1) {
            slide.style.cursor = "grab";
        } else {
            slide.style.cursor = "pointer";
        }
    });
    
    const zoomPercent = Math.round(currentZoom * 100);
    const zoomLevel = document.getElementById("zoomLevel");
    if (zoomLevel) {
        zoomLevel.textContent = zoomPercent + "%";
    }
}

// Close slider on Escape key
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeSlider();
    }
});