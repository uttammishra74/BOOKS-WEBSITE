// Google Books API Configuration
const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = CONFIG.GOOGLE_BOOKS_API_KEY; // Load from config
const MAX_RESULTS = 20;

// App State
let currentFilter = "all";
let readingList = JSON.parse(localStorage.getItem("readingList")) || [];
let searchResults = [];
let isLoading = false;

// Preview State
let currentPreviewBook = null;
let currentZoomLevel = 1;
let isDarkMode = false;
let isFullscreen = false;
let readingProgress = JSON.parse(localStorage.getItem("readingProgress")) || {};

// DOM Elements
const bookGrid = document.getElementById("bookGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const filterBtns = document.querySelectorAll(".filter-btn");
const readingListContainer = document.getElementById("readingList");
const exportBtn = document.getElementById("exportList");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

// Preview Modal Elements
const previewModal = document.getElementById("bookPreviewModal");
const previewBookTitle = document.getElementById("previewBookTitle");
const googleBooksViewer = document.getElementById("googleBooksViewer");
const loadingSpinner = document.querySelector(".loading-spinner");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const closePreviewBtn = document.getElementById("closePreviewBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");
const progressFill = document.getElementById("progressFill");

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  renderBooks([]);
  renderReadingList();
  setupEventListeners();
  setupFAQAccordion();
  setupPreviewModal();

  // Load some default books on startup
  searchGoogleBooks("");
});

// Search Google Books API
async function searchGoogleBooks(query) {
  if (isLoading) return;

  isLoading = true;
  bookGrid.innerHTML = '<div class="loading">Searching for books...</div>';

  try {
    const searchQuery = query || "classic literature"; // Default search term
    const url = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=${MAX_RESULTS}&printType=books&projection=lite&key=${API_KEY}`;

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

    const response = await fetch(url, { 
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      searchResults = data.items.map((item) => transformGoogleBookData(item));
      renderBooks(getFilteredBooks());
    } else {
      searchResults = [];
      renderBooks([]);
    }
  } catch (error) {
    console.error("Error searching Google Books:", error);
    
    let errorMessage = error.message || "Unable to connect to Google Books API. Please try again later.";
    if (error.name === 'AbortError') {
      errorMessage = "Request timeout. Please check your connection and try again.";
    }
    
    bookGrid.innerHTML = `
            <div class="no-results">
                <h3>Search Error</h3>
                <p>${errorMessage}</p>
            </div>
        `;
    searchResults = [];
  } finally {
    isLoading = false;
  }
}

// Transform Google Books API data to our format
function transformGoogleBookData(item) {
  const volumeInfo = item.volumeInfo;
  const id = item.id;

  // Determine if book is free (public domain) or paid
  // Books published before 1929 are generally public domain
  const publishedDate = volumeInfo.publishedDate || "";
  const year = parseInt(publishedDate) || 0;
  const isPublicDomain = year > 0 && year < 1929;

  // Get cover image
  const coverImage =
    volumeInfo.imageLinks?.thumbnail ||
    volumeInfo.imageLinks?.smallThumbnail ||
    "https://via.placeholder.com/200x280/3498db/ffffff?text=No+Cover";

  // Get author(s)
  const authors = volumeInfo.authors || ["Unknown Author"];
  const author = Array.isArray(authors) ? authors.join(", ") : authors;

  // Get categories/genre
  const categories = volumeInfo.categories || ["General"];
  const genre = Array.isArray(categories) ? categories[0] : categories;

  return {
    id: id,
    title: volumeInfo.title || "Untitled",
    author: author,
    genre: genre,
    cover: coverImage.replace("http:", "https:"), // Ensure HTTPS
    type: isPublicDomain ? "free" : "paid",
    previewUrl: `https://books.google.com/books?id=${id}`,
    year: year,
    description: volumeInfo.description || "",
    pageCount: volumeInfo.pageCount || 0,
  };
}

// Render Books
function renderBooks(books) {
  bookGrid.innerHTML = "";

  if (books.length === 0) {
    bookGrid.innerHTML = `
            <div class="no-results">
                <h3>No books found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
    return;
  }

  books.forEach((book) => {
    const bookCard = createBookCard(book);
    bookGrid.appendChild(bookCard);
  });
}

// Create Book Card
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";
  card.dataset.id = book.id;

  const isSaved = readingList.some((item) => item.id === book.id);
  const buttonText =
    book.type === "free" ? "Read on Site" : "Preview on Google";
  const buttonClass = book.type === "free" ? "free" : "paid";

  card.innerHTML = `
        <img src="${book.cover}" alt="${book.title}" class="book-cover" loading="lazy">
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <p class="book-genre">${book.genre}</p>
            <div class="book-actions">
                <button class="read-btn ${buttonClass}" onclick="openBook('${book.previewUrl}', '${book.type}')">${buttonText}</button>
                <button class="save-btn ${isSaved ? "saved" : ""}" onclick="toggleSaveBook(${book.id})" aria-label="${isSaved ? "Remove from reading list" : "Save to reading list"}">
                    ${isSaved ? "♥" : "♡"}
                </button>
            </div>
        </div>
    `;

  return card;
}

// Open Book
function openBook(url, type) {
  // Now opens in-site preview instead of new tab
  openBookPreview(url, type);
}

// Toggle Save Book
function toggleSaveBook(bookId) {
  // First check if book is in current search results
  let book = searchResults.find((b) => b.id === bookId);

  // If not found in search results, check reading list
  if (!book) {
    book = readingList.find((b) => b.id === bookId);
  }

  if (!book) return;

  const existingIndex = readingList.findIndex((item) => item.id === bookId);

  if (existingIndex > -1) {
    readingList.splice(existingIndex, 1);
  } else {
    readingList.push(book);
  }

  localStorage.setItem("readingList", JSON.stringify(readingList));
  renderReadingList();
  renderBooks(getFilteredBooks());
}

// Render Reading List
function renderReadingList() {
  readingListContainer.innerHTML = "";

  if (readingList.length === 0) {
    readingListContainer.innerHTML =
      '<p class="empty-list">No books saved yet</p>';
    exportBtn.disabled = true;
    return;
  }

  exportBtn.disabled = false;

  readingList.forEach((book) => {
    const item = document.createElement("div");
    item.className = "reading-list-item";
    item.innerHTML = `
            <span class="reading-list-item-title">${book.title}</span>
            <button class="remove-btn" onclick="toggleSaveBook('${book.id}')" aria-label="Remove from reading list">×</button>
        `;
    readingListContainer.appendChild(item);
  });
}

// Export Reading List
function exportReadingList() {
  if (readingList.length === 0) return;

  const exportData = readingList.map((book) => ({
    title: book.title,
    author: book.author,
    genre: book.genre,
    year: book.year || "Unknown",
    type: book.type,
    previewUrl: book.previewUrl,
  }));

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "freebookleaf-reading-list.json";
  link.click();

  URL.revokeObjectURL(url);
}

// Get Filtered Books
function getFilteredBooks() {
  let filtered = [...searchResults];

  // Apply type filter
  if (currentFilter === "free") {
    filtered = filtered.filter((book) => book.type === "free");
  } else if (currentFilter === "paid") {
    filtered = filtered.filter((book) => book.type === "paid");
  }

  // Apply search filter (if we want to filter within results)
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm && filtered.length > 0) {
    filtered = filtered.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.genre.toLowerCase().includes(searchTerm),
    );
  }

  return filtered;
}

// Setup Event Listeners
function setupEventListeners() {
  // Search functionality - calls Google Books API
  searchBtn.addEventListener("click", () => {
    const searchTerm = searchInput.value.trim();
    searchGoogleBooks(searchTerm);
  });

  // Debounced search input
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.trim();
      if (searchTerm.length >= 2) {
        searchGoogleBooks(searchTerm);
      }
    }, 500); // 500ms debounce
  });

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      clearTimeout(searchTimeout);
      const searchTerm = searchInput.value.trim();
      searchGoogleBooks(searchTerm);
    }
  });

  // Filter buttons - filter existing search results
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      const filtered = getFilteredBooks();
      renderBooks(filtered);
    });
  });

  // Export button
  exportBtn.addEventListener("click", exportReadingList);

  // Mobile navigation toggle
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove("active");
    }
  });
}

// Setup FAQ Accordion
function setupFAQAccordion() {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const isExpanded = question.getAttribute("aria-expanded") === "true";

      // Close all other FAQs
      faqQuestions.forEach((q) => {
        q.setAttribute("aria-expanded", "false");
      });

      // Toggle current FAQ
      if (!isExpanded) {
        question.setAttribute("aria-expanded", "true");
      }
    });
  });
}

// ==================== BOOK PREVIEW MODAL FUNCTIONS ====================

// Setup Preview Modal
function setupPreviewModal() {
  // Close button
  closePreviewBtn.addEventListener("click", closeBookPreview);

  // Click outside to close
  previewModal.addEventListener("click", (e) => {
    if (e.target === previewModal) {
      closeBookPreview();
    }
  });

  // Zoom controls
  zoomInBtn.addEventListener("click", () => {
    if (currentZoomLevel < 2) {
      currentZoomLevel += 0.25;
      updateZoom();
    }
  });

  zoomOutBtn.addEventListener("click", () => {
    if (currentZoomLevel > 1) {
      currentZoomLevel -= 0.25;
      updateZoom();
    }
  });

  // Fullscreen toggle
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  // Dark mode toggle
  darkModeBtn.addEventListener("click", toggleDarkMode);

  // Navigation controls
  prevPageBtn.addEventListener("click", navigatePage.bind(null, "prev"));
  nextPageBtn.addEventListener("click", navigatePage.bind(null, "next"));

  // Keyboard controls
  document.addEventListener("keydown", handleKeyboardControls);
}

// Open Book Preview
function openBookPreview(url, type) {
  currentPreviewBook = url;
  
  // Show modal
  previewModal.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scrolling

  // Set book title (extract from URL or use default)
  const bookId = extractBookId(url);
  const book = searchResults.find(b => b.id === bookId);
  previewBookTitle.textContent = book ? book.title : "Book Preview";

  // Show loading state
  loadingSpinner.style.display = "block";
  googleBooksViewer.classList.remove("loaded");

  // Load Google Books embedded viewer
  loadGoogleBooksViewer(bookId);
}

// Extract Book ID from URL
function extractBookId(url) {
  const match = url.match(/id=([^&]+)/);
  return match ? match[1] : "";
}

// Load Google Books Embedded Viewer
function loadGoogleBooksViewer(bookId) {
  if (!bookId) {
    showError("Unable to load book preview");
    return;
  }

  // Google Books Embedded Viewer URL
  const viewerUrl = `https://books.google.com/books?id=${bookId}&lpg=PP1&pg=PP1&output=embed`;

  // Set iframe source
  googleBooksViewer.src = viewerUrl;

  // Handle iframe load
  googleBooksViewer.onload = () => {
    loadingSpinner.style.display = "none";
    googleBooksViewer.classList.add("loaded");
    
    // Restore reading progress if available
    if (readingProgress[bookId]) {
      // Note: Google Books iframe doesn't support direct page navigation
      // This is a placeholder for when we implement a custom viewer
      updateProgressInfo(readingProgress[bookId].currentPage, readingProgress[bookId].totalPages);
    } else {
      updateProgressInfo(1, 1);
    }
  };

  // Handle iframe error
  googleBooksViewer.onerror = () => {
    showError("Failed to load book preview. The book may not have a preview available.");
  };
}

// Show Error in Modal
function showError(message) {
  loadingSpinner.style.display = "none";
  googleBooksViewer.style.display = "none";
  
  const errorDiv = document.createElement("div");
  errorDiv.className = "preview-error";
  errorDiv.innerHTML = `
    <div class="error-icon">⚠️</div>
    <p>${message}</p>
    <button class="error-close-btn" onclick="closeBookPreview()">Close</button>
  `;
  
  document.querySelector(".viewer-container").appendChild(errorDiv);
}

// Close Book Preview
function closeBookPreview() {
  previewModal.classList.remove("active");
  document.body.style.overflow = ""; // Restore scrolling
  
  // Reset viewer
  googleBooksViewer.src = "";
  googleBooksViewer.classList.remove("loaded");
  loadingSpinner.style.display = "block";
  
  // Remove any error messages
  const errorDiv = document.querySelector(".preview-error");
  if (errorDiv) {
    errorDiv.remove();
  }
  
  // Reset state
  currentPreviewBook = null;
  currentZoomLevel = 1;
  updateZoom();
}

// Update Zoom
function updateZoom() {
  const zoomClass = `zoom-${currentZoomLevel.toString().replace(".", "-")}`;
  googleBooksViewer.className = `google-books-viewer loaded ${zoomClass}`;
}

// Toggle Fullscreen
function toggleFullscreen() {
  isFullscreen = !isFullscreen;
  previewModal.classList.toggle("fullscreen", isFullscreen);
  fullscreenBtn.textContent = isFullscreen ? "⛶" : "⛶";
}

// Toggle Dark Mode
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  previewModal.classList.toggle("dark-mode", isDarkMode);
  darkModeBtn.textContent = isDarkMode ? "◐" : "◑";
}

// Navigate Pages
function navigatePage(direction) {
  // Note: Google Books iframe doesn't support programmatic page navigation
  // This is a placeholder for when we implement a custom viewer
  // For now, we'll show a message
  if (direction === "prev") {
    showNotification("Use the Google Books viewer controls to navigate pages");
  } else {
    showNotification("Use the Google Books viewer controls to navigate pages");
  }
}

// Update Progress Info
function updateProgressInfo(currentPage, totalPages) {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  const progress = (currentPage / totalPages) * 100;
  progressFill.style.width = `${progress}%`;
  
  // Update button states
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

// Save Reading Progress
function saveReadingProgress(bookId, currentPage, totalPages) {
  readingProgress[bookId] = {
    currentPage,
    totalPages,
    lastRead: new Date().toISOString()
  };
  localStorage.setItem("readingProgress", JSON.stringify(readingProgress));
}

// Handle Keyboard Controls
function handleKeyboardControls(e) {
  if (!previewModal.classList.contains("active")) return;

  switch (e.key) {
    case "Escape":
      closeBookPreview();
      break;
    case "ArrowLeft":
      navigatePage("prev");
      break;
    case "ArrowRight":
      navigatePage("next");
      break;
    case "+":
    case "=":
      if (currentZoomLevel < 2) {
        currentZoomLevel += 0.25;
        updateZoom();
      }
      break;
    case "-":
      if (currentZoomLevel > 1) {
        currentZoomLevel -= 0.25;
        updateZoom();
      }
      break;
    case "f":
    case "F":
      toggleFullscreen();
      break;
    case "d":
    case "D":
      toggleDarkMode();
      break;
  }
}

// Show Notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "preview-notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--primary-color);
    color: white;
    padding: 12px 24px;
    border-radius: 5px;
    z-index: 3000;
    animation: slideDown 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = "slideUp 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Make functions globally available
window.openBook = openBook;
window.toggleSaveBook = toggleSaveBook;
window.closeBookPreview = closeBookPreview;
