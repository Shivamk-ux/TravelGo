document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('packageContainer')) {
    fetchFeaturedPackages();
  }

  if (document.getElementById('navSearch') && document.getElementById('navSearchBtn')) {
    setupSearchFunctionality();
  }

  if (document.querySelectorAll('.card').length > 0) {
    setupScrollAnimation();
  }

  if (document.getElementById('filterForm')) {
    setupFilters();
  }

  setupDarkMode();
  setupHamburgerMenu();
});

function setupHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  document.querySelectorAll('.nav-links').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}


function setupDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.body;
  const isDarkMode = localStorage.getItem("darkMode") === "enabled";

  setDarkMode(isDarkMode);

  darkModeToggle.addEventListener("click", () => {
    const newMode = !body.classList.contains("dark-mode");
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode ? "enabled" : "disabled");
  });
}

function setDarkMode(enabled) {
  const body = document.body;
  const darkModeToggle = document.getElementById('darkModeToggle');
  const icon = darkModeToggle.querySelector('i');
  const text = darkModeToggle.querySelector('span');

  body.classList.toggle("dark-mode", enabled);
  icon.className = enabled ? "fas fa-sun" : "fas fa-moon";
  text.textContent = enabled ? "Light Mode" : "Dark Mode";
}

async function fetchPackages(searchParams = {}) {
  try {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`/api/packages/search?${queryString}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const packages = await response.json();
    return packages;
  } catch (error) {
    console.error('Error fetching packages:', error);
    displayErrorMessage('Failed to load packages. Please try again later.');
    return [];
  }
}

async function fetchFeaturedPackages() {
  try {
    const response = await fetch('/api/featured-packages');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const packages = await response.json();
    displayPackages(packages);
  } catch (error) {
    console.error('Error fetching featured packages:', error);
    displayErrorMessage('Failed to load featured packages. Please try again later.');
  }
}

function displayPackages(packages) {
  const packageContainer = document.getElementById('packageContainer');
  if (!packageContainer) return;

  packageContainer.innerHTML = '';

  if (packages.length === 0) {
    packageContainer.innerHTML = '<p>No packages found matching your criteria.</p>';
    return;
  }

  packages.forEach(package => {
    const card = createPackageCard(package);
    packageContainer.appendChild(card);
  });
}

function createPackageCard(package) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${package.image_url}" alt="${package.destination}" class="card-image">
    <div class="card-content">
      <h3>${package.destination}</h3>
      <p>${package.description.substring(0, 100)}...</p>
      <p><strong>Duration:</strong> ${package.duration} days</p>
      <p><strong>Price:</strong> $${package.price.toFixed(2)}</p>
      <p><strong>Rating:</strong> ${displayRating(package.rating)}</p>
      <p><strong>Dates:</strong> ${formatDate(package.start_date)} - ${formatDate(package.end_date)}</p>
      <a href="./details.html?id=${package.id}" class="readmore">More Details</a>
    </div>
  `;
  return card;
}

function displayRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let ratingHTML = '';

  for (let i = 0; i < fullStars; i++) {
    ratingHTML += '<i class="fas fa-star"></i>';
  }
  if (halfStar) {
    ratingHTML += '<i class="fas fa-star-half-alt"></i>';
  }

  return ratingHTML;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function setupSearchFunctionality() {
  const navSearch = document.getElementById('navSearch');
  const navSearchBtn = document.getElementById('navSearchBtn');
  const searchSuggestions = document.getElementById('searchSuggestions');

  let debounceTimer;

  navSearch.addEventListener('input', async (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const searchTerm = e.target.value.trim();
      if (searchTerm.length > 2) {
        const packages = await fetchPackages({ destination: searchTerm });
        displaySearchSuggestions(packages);
      } else {
        searchSuggestions.style.display = 'none';
      }
    }, 300);
  });

  navSearchBtn.addEventListener('click', () => {
    performSearch();
  });

  navSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  document.addEventListener('click', (e) => {
    if (!navSearch.contains(e.target) && !searchSuggestions.contains(e.target)) {
      searchSuggestions.style.display = 'none';
    }
  });
}

function displaySearchSuggestions(packages) {
  const searchSuggestions = document.getElementById('searchSuggestions');
  searchSuggestions.innerHTML = '';

  if (packages.length > 0) {
    packages.slice(0, 5).forEach(package => {
      const suggestion = document.createElement('div');
      suggestion.className = 'search-suggestion';
      suggestion.textContent = package.destination;
      suggestion.addEventListener('click', () => {
        document.getElementById('navSearch').value = package.destination;
        searchSuggestions.style.display = 'none';
        performSearch();
      });
      searchSuggestions.appendChild(suggestion);
    });
    searchSuggestions.style.display = 'block';
  } else {
    searchSuggestions.style.display = 'none';
  }
}

async function performSearch() {
  const searchTerm = document.getElementById('navSearch').value.trim();
  if (searchTerm) {
    const packages = await fetchPackages({ destination: searchTerm });
    displayPackages(packages);
  }
}

function setupFilters() {
  const filterForm = document.getElementById('filterForm');
  filterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(filterForm);
    const filterParams = Object.fromEntries(formData.entries());
    const packages = await fetchPackages(filterParams);
    displayPackages(packages);
  });
}

function displayErrorMessage(message) {
  const packageContainer = document.getElementById('packageContainer');
  if (!packageContainer) return;

  packageContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

function setupScrollAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card').forEach(card => observer.observe(card));
}
