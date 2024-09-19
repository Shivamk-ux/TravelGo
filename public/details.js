document.addEventListener('DOMContentLoaded', () => {
  const packageId = new URLSearchParams(window.location.search).get('id');
  if (packageId) {
    fetchPackageDetails(packageId);
  } else {
    displayErrorMessage('Package ID not found');
  }
  setupDarkMode();
  setupBookingForm();
});

async function fetchPackageDetails(id) {
  try {
    const response = await fetch(`/api/packages/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const package = await response.json();
    displayPackageDetails(package);
  } catch (error) {
    console.error('Error fetching package details:', error);
    displayErrorMessage('Failed to load package details. Please try again later.');
  }
}

function displayPackageDetails(package) {
  const detailsContainer = document.getElementById('packageDetails');
  detailsContainer.innerHTML = `
    <div class="package-image">
      <img src="${package.image_url}" alt="${package.destination}">
    </div>
    <div class="package-info">
      <h1>${package.destination}</h1>
      <p class="description">${package.description}</p>
      <div class="details">
        <p><strong>Duration:</strong> ${package.duration} days</p>
        <p><strong>Price:</strong> ${package.price.toFixed(2)}</p>
        <p><strong>Rating:</strong> ${displayRating(package.rating)}</p>
        <p><strong>Dates:</strong> ${formatDate(package.start_date)} - ${formatDate(package.end_date)}</p>
      </div>
      <div class="facilities">
        <h3>Facilities:</h3>
        <ul>
          ${package.facilities.map(facility => `<li><i class="fas fa-check"></i> ${facility}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
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

function setupBookingForm() {
  const form = document.getElementById('bookingFormElement');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (validateForm(form)) {
      const formData = new FormData(form);
      const bookingData = Object.fromEntries(formData.entries());
      
      const urlParams = new URLSearchParams(window.location.search);
      const packageId = urlParams.get('id');
      bookingData.package_id = packageId;

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });
        
        if (response.ok) {
          const result = await response.json();
          showBookingConfirmation(result);
          form.reset();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Booking failed');
        }
      } catch (error) {
        console.error('Error submitting booking:', error);
        showNotification(error.message, 'error');
      }
    }
  });
}

function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      showFieldError(field, 'This field is required');
    } else {
      clearFieldError(field);
    }
  });
  return isValid;
}

function showFieldError(field, message) {
  const errorElement = field.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.textContent = message;
  } else {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    field.parentNode.insertBefore(error, field.nextSibling);
  }
}

function clearFieldError(field) {
  const errorElement = field.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.remove();
  }
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function displayErrorMessage(message) {
  const detailsContainer = document.getElementById('packageDetails');
  detailsContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

function showBookingConfirmation(bookingDetails) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Booking Confirmation</h2>
      <p>Your booking has been successfully confirmed!</p>
      <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
      <p><strong>Destination:</strong> ${bookingDetails.destination}</p>
      <p><strong>Travel Date:</strong> ${formatDate(bookingDetails.travel_date)}</p>
      <p><strong>Number of Travelers:</strong> ${bookingDetails.travelers}</p>
      <button id="closeModal" class="btn-primary">Close</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('closeModal').addEventListener('click', () => {
    modal.remove();
  });
}
