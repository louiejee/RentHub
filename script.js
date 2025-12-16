// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const bookingModal = document.getElementById('booking-modal');
    const authModal = document.getElementById('auth-modal');
    const startBookingBtn = document.getElementById('start-booking');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const formSteps = document.querySelectorAll('.form-step');
    const nextToPaymentBtn = document.getElementById('next-to-payment');
    const backToPersonalBtn = document.getElementById('back-to-personal');
    const proceedToReviewBtn = document.getElementById('proceed-to-review');
    const backToPaymentBtn = document.getElementById('back-to-payment');
    const confirmBookingBtn = document.getElementById('confirm-booking');
    const closeConfirmationBtn = document.getElementById('close-confirmation');
    const bookingForm = document.getElementById('booking-form');
    const loginBtn = document.querySelector('.login-btn');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authContents = document.querySelectorAll('.auth-content');
    const switchToSignup = document.querySelector('.switch-to-signup');
    const switchToLogin = document.querySelector('.switch-to-login');

    document.getElementById('booking-form').addEventListener('submit', function(e) {
        e.preventDefault();
      
        const fullName = document.getElementById('full-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const bikeType = document.getElementById('bike-type').value;
        const durationInHours = parseInt(document.getElementById('duration').value);
      
        const newBooking = {
          fullName,
          email,
          phone,
          bikeType,
          durationInHours,
          bookedAt: new Date().toLocaleString()
        };
      
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(newBooking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
      
        alert('Booking confirmed!');
        document.getElementById('booking-form').reset();
      });
      
    // Bike data - Daily prices remain EXACT (280, 320, 450, 300)
    // 4h, 8h, 2d, 3d are calculated as percentages of daily rate
    const bikePrices = {
        'mountain': { 
            daily: 280,     // EXACT - NO CHANGE
            // 4 hours = 60% of daily (280 * 0.6 = 168)
            // 8 hours = 80% of daily (280 * 0.8 = 224)
            // 2 days = daily * 2 - 100 discount (280 * 2 - 100 = 460)
            // 3 days = daily * 3 - 150 discount (280 * 3 - 150 = 690)
        },
        'road': { 
            daily: 320,     // EXACT - NO CHANGE
            // 4 hours = 60% of daily (320 * 0.6 = 192)
            // 8 hours = 80% of daily (320 * 0.8 = 256)
            // 2 days = daily * 2 - 100 discount (320 * 2 - 100 = 540)
            // 3 days = daily * 3 - 150 discount (320 * 3 - 150 = 810)
        },
        'electric': { 
            daily: 450,     // EXACT - NO CHANGE
            // 4 hours = 60% of daily (450 * 0.6 = 270)
            // 8 hours = 80% of daily (450 * 0.8 = 360)
            // 2 days = daily * 2 - 100 discount (450 * 2 - 100 = 800)
            // 3 days = daily * 3 - 150 discount (450 * 3 - 150 = 1200)
        },
        'hybrid': { 
            daily: 300,     // EXACT - NO CHANGE
            // 4 hours = 60% of daily (300 * 0.6 = 180)
            // 8 hours = 80% of daily (300 * 0.8 = 240)
            // 2 days = daily * 2 - 100 discount (300 * 2 - 100 = 500)
            // 3 days = daily * 3 - 150 discount (300 * 3 - 150 = 750)
        }
    };
    
    // Initialize modal and steps
    let currentStep = 0;
    
    // Event Listeners
    startBookingBtn.addEventListener('click', openBookingModal);
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
    nextToPaymentBtn.addEventListener('click', validatePersonalInfo);
    backToPersonalBtn.addEventListener('click', () => changeStep(0));
    proceedToReviewBtn.addEventListener('click', proceedToReview);
    backToPaymentBtn.addEventListener('click', () => changeStep(1));
    confirmBookingBtn.addEventListener('click', confirmBooking);
    closeConfirmationBtn.addEventListener('click', closeModal);
    loginBtn.addEventListener('click', openAuthModal);
    authTabs.forEach(tab => tab.addEventListener('click', switchAuthTab));
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab({ target: document.querySelector('.auth-tab[data-tab="signup"]') });
    });
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab({ target: document.querySelector('.auth-tab[data-tab="login"]') });
    });
    
    // View Details buttons for bikes
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const bikeType = this.getAttribute('data-bike');
            showBikeDetails(bikeType);
        });
    });

    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
    
        const inputEmail = document.getElementById('login-email').value;
        const inputPassword = document.getElementById('login-password').value;
    
        // Static admin credentials
        const adminAccount = {
            email: 'admin@renthub.com',
            password: 'admin123'
        };
    
        // Check if admin is logging in
        if (inputEmail === adminAccount.email && inputPassword === adminAccount.password) {
            alert('Welcome, Admin!');
            localStorage.setItem('currentUser', JSON.stringify({ role: 'admin', email: inputEmail }));
            window.location.href = 'admin-dashboard.html'; // Admin dashboard page
            return;
        }
    
        // Regular user login check
        const users = JSON.parse(localStorage.getItem('users')) || [];
    
        const matchedUser = users.find(user => user.email === inputEmail && user.password === inputPassword);
    
        if (matchedUser) {
            alert('Login successful!');
            localStorage.setItem('currentUser', JSON.stringify(matchedUser));
            window.location.href = 'dashboard.html'; // User dashboard page
        } else {
            alert('Invalid email or password.');
        }
    });
    
    // Payment method toggle
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.qr-payment').forEach(qr => qr.style.display = 'none');
            if (this.value === 'gcash') {
                document.getElementById('gcash-qr').style.display = 'block';
            } else if (this.value === 'paymaya') {
                document.getElementById('paymaya-qr').style.display = 'block';
            }
        });
    });

    document.getElementById('close-confirmation').addEventListener('click', () => {
        location.reload();
    });
    
    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== this.parentElement) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = null;
                    item.querySelector('.faq-question i').classList.remove('fa-chevron-up');
                    item.querySelector('.faq-question i').classList.add('fa-chevron-down');
                }
            });
            
            // Toggle current item
            this.parentElement.classList.toggle('active');
            
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });
    
    // Policy tabs
    document.querySelectorAll('.policy-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab
            document.querySelectorAll('.policy-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.policy-content').forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}-content`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Form submissions
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Reset error messages
        [email, password].forEach(input => {
            input.setCustomValidity("");
            if (input.nextElementSibling) {
                input.nextElementSibling.style.display = 'none'; // Hide error messages
            }
        });
        
        // Simple validation
        let isValid = true;
        
        if (!email.includes('@')) {
            document.getElementById('login-email').nextElementSibling.style.display = 'flex';
            isValid = false;
        } else {
            document.getElementById('login-email').nextElementSibling.style.display = 'none';
        }
        
        if (password.length < 6) {
            document.getElementById('login-password').nextElementSibling.style.display = 'flex';
            isValid = false;
        } else {
            document.getElementById('login-password').nextElementSibling.style.display = 'none';
        }
        
        if (isValid) {
            // In a real app, you would send this to your server
            console.log('Login submitted', { email, password });
            
            // Close the modal and redirect to dashboard
            closeModal();
            window.location.href = 'dashboard.html';
        }
    });

    function resetError(input) {
        input.setCustomValidity("");
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.style.display = 'none';
        }
    }
    
    // Helper function to show error messages
    function showError(input, message) {
        input.setCustomValidity(message);
        if (input.nextElementSibling) {
            input.nextElementSibling.textContent = message;
            input.nextElementSibling.style.display = 'flex'; // Show error message
        }
        input.reportValidity(); // Trigger built-in validation message display
    }
    
    // Switch auth tabs (Login/Signup)
    function switchAuthTab(e) {
        const targetTab = e.target.getAttribute('data-tab');
        const allTabs = document.querySelectorAll('.auth-tab');
        
        allTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === targetTab) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
    
    // Functions
    function openBookingModal() {
        const bikeType = document.getElementById('bike-type').value;
        const duration = document.getElementById('rental-duration').value;
        const date = document.getElementById('rental-date').value;
    
        // Show errors if not selected
        let hasError = false;
    
        if (!duration) {
            document.getElementById('rental-duration-error').style.display = 'flex';
            hasError = true;
        } else {
            document.getElementById('rental-duration-error').style.display = 'none';
        }
    
        if (!bikeType) {
            document.getElementById('bike-type-error').style.display = 'flex';
            hasError = true;
        } else {
            document.getElementById('bike-type-error').style.display = 'none';
        }
    
        if (hasError) return;
    
        // Proceed if both are selected
        bookingModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        currentStep = 0;
        showStep(currentStep);
    
        // Update summary with selected details
        updateBookingSummary(bikeType, duration, date);
    
        // Store selected details for later use
        bookingModal.dataset.bikeType = bikeType;
        bookingModal.dataset.duration = duration;
        bookingModal.dataset.date = date;

        // Set the review date
        document.getElementById('review-date').textContent = formatDate(date);
    }

    function openAuthModal(e) {
        e.preventDefault();
        authModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Reset to login tab when opening
        switchAuthTab({ target: document.querySelector('.auth-tab[data-tab="login"]') });
    }
    
    function closeModal() {
        bookingModal.style.display = 'none';
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    function showStep(step) {
        formSteps.forEach((formStep, index) => {
            formStep.classList.toggle('active', index === step);
        });
    }
    
    function changeStep(step) {
        currentStep = step;
        showStep(currentStep);
    }
    
    function switchAuthTab(e) {
        const tabName = e.target.getAttribute('data-tab');
        
        // Update active tab
        authTabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update active content
        authContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-content`) {
                content.classList.add('active');
            }
        });
    }

    function validatePersonalInfo() {
        let isValid = true;
        
        // Validate name
        const nameInput = document.getElementById('full-name');
        if (!nameInput.value.trim()) {
            nameInput.nextElementSibling.style.display = 'flex';
            nameInput.setCustomValidity("Please fill out this field");
            isValid = false;
        } else {
            nameInput.nextElementSibling.style.display = 'none';
            nameInput.setCustomValidity("");
        }
        
        // Validate email
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailInput.nextElementSibling.style.display = 'flex';
            emailInput.setCustomValidity("Please enter a valid email");
            isValid = false;
        } else {
            emailInput.nextElementSibling.style.display = 'none';
            emailInput.setCustomValidity("");
        }
        
        // Validate phone
        const phoneInput = document.getElementById('phone');
        if (!phoneInput.value.trim()) {
            phoneInput.nextElementSibling.style.display = 'flex';
            phoneInput.setCustomValidity("Please fill out this field");
            isValid = false;
        } else {
            phoneInput.nextElementSibling.style.display = 'none';
            phoneInput.setCustomValidity("");
        }
        
        if (isValid) {
            changeStep(1);
        } else {
            // Scroll to first error
            const firstError = document.querySelector('.error-message[style*="display: flex"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Trigger validation messages
            if (!nameInput.value.trim()) nameInput.reportValidity();
            else if (!emailRegex.test(emailInput.value)) emailInput.reportValidity();
            else if (!phoneInput.value.trim()) phoneInput.reportValidity();
        }
    }

    function proceedToReview() {
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        document.getElementById('review-payment-method').textContent = 
            paymentMethod === 'walk-in' ? 'Walk-in Payment' : 
            paymentMethod === 'gcash' ? 'GCash' : 'Maya';
        
        changeStep(2);
    }
  
    function updateBookingSummary(bikeType, duration, date) {
        const bikeData = bikePrices[bikeType];
        let price = bikeData.daily; // Default to daily price
        
        // Calculate price based on duration (as percentage of daily rate)
        if (duration === '4') {
            price = Math.round(bikeData.daily * 0.6); // 60% of daily
        } else if (duration === '8') {
            price = Math.round(bikeData.daily * 0.8); // 80% of daily
        } else if (duration === '24') {
            price = bikeData.daily; // 100% of daily
        } else if (duration === '48') {
            price = (bikeData.daily * 2) - 100; // 2 days with ₱100 discount
        } else if (duration === '72') {
            price = (bikeData.daily * 3) - 150; // 3 days with ₱150 discount
        }
    
        // Get the label from the dropdown
        const bikeTypeSelect = document.getElementById('bike-type');
        const selectedBikeLabel = bikeTypeSelect.options[bikeTypeSelect.selectedIndex].text;
    
        // Update review section
        document.getElementById('review-bike-type').textContent = selectedBikeLabel;
        document.getElementById('review-date').textContent = formatDate(date);
        document.getElementById('review-duration').textContent =
            duration === '4' ? '4 hours' :
            duration === '8' ? '8 hours' :
            duration === '24' ? '1 day' :
            duration === '48' ? '2 days' :
            duration === '72' ? '3 days' : '—';
        document.getElementById('review-total').textContent = `₱${price.toFixed(0)}`;
    
        // Update email and order number
        const email = document.getElementById('email').value || 'user@example.com';
        document.getElementById('review-email').textContent = email;
        document.getElementById('confirmation-email').textContent = email;
    
        const orderNumber = `PP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        document.getElementById('order-number').textContent = orderNumber;
        document.getElementById('confirmation-number').textContent = orderNumber;
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'Not selected';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    function showBikeDetails(bikeType) {
    const modal = document.getElementById('bike-details-modal');
    modal.style.display = 'block';
    
    // Set bike details based on type
    let bikeName, bikeImage, bikeSpecs, bikeFeatures, bikePrice;
    
    switch(bikeType) {
        case 'mountain':
            bikeName = 'Mountain Pro XT';
            bikeImage = 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&fit=crop&q=80';
            bikeSpecs = [
                '21-speed Shimano gears',
                'Hydraulic disc brakes',
                'Aluminum frame',
                '27.5" wheels'
            ];
            bikeFeatures = [
                'Front suspension fork',
                'Ergonomic grips',
                'Tubeless-ready tires',
                'Dropper post compatible'
            ];
            bikePrice = '₱280/day';  // CORRECT
            break;
        case 'road':
            bikeName = 'Road Elite S1';
            bikeImage = 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&fit=crop&q=80';
            bikeSpecs = [
                '18-speed Shimano groupset',
                'Carbon fiber fork',
                'Lightweight aluminum frame',
                '700c wheels'
            ];
            bikeFeatures = [
                'Aero handlebars',
                'Clipless pedal compatible',
                'Puncture-resistant tires',
                'Water bottle mounts'
            ];
            bikePrice = '₱320/day';  // CORRECT
            break;
        case 'electric':  // THIS IS E-CRUISER 5000
            bikeName = 'E-Cruiser 5000';
            bikeImage = 'https://images.unsplash.com/photo-1558981852-426c6c22a060?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&fit=crop&q=80';
            bikeSpecs = [
                '250W motor',
                '50km battery range',
                '7-speed Shimano gears',
                'Max speed: 25km/h'
            ];
            bikeFeatures = [
                'LED display',
                'USB charging port',
                'Integrated lights',
                'Adjustable pedal assist'
            ];
            bikePrice = '₱450/day';  // CORRECT - E-CRUISER IS ₱450
            break;
        case 'hybrid':  // THIS IS CITY HYBRID Z3
            bikeName = 'City Hybrid Z3';
            bikeImage = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&fit=crop&q=80';
            bikeSpecs = [
                '24-speed Shimano gears',
                'Steel frame',
                '700c wheels',
                'V-brakes'
            ];
            bikeFeatures = [
                'Comfort saddle',
                'Upright riding position',
                'Fender and rack mounts',
                'Kickstand included'
            ];
            bikePrice = '₱300/day';  // CORRECT - CITY HYBRID IS ₱300
            break;
    }
    
    // Update modal content
    document.getElementById('detail-bike-name').textContent = bikeName;
    document.getElementById('detail-bike-image').src = bikeImage;
    document.getElementById('detail-bike-image').alt = bikeName;
    document.getElementById('detail-bike-price').textContent = bikePrice;
    
    const specsList = document.getElementById('detail-bike-specs');
    specsList.innerHTML = '';
    bikeSpecs.forEach(spec => {
        const li = document.createElement('li');
        li.textContent = spec;
        specsList.appendChild(li);
    });
    
    const featuresList = document.getElementById('detail-bike-features');
    featuresList.innerHTML = '';
    bikeFeatures.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });
    
    // Set up book this bike button
    document.querySelector('.book-this-btn').addEventListener('click', function() {
        document.getElementById('bike-type').value = bikeType;
        modal.style.display = 'none';
        openBookingModal();
    });
    
    // Close button for bike details modal
    document.querySelector('#bike-details-modal .close-modal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
}
    
    function loadBookings() {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        const tableBody = document.getElementById('booking-table-body');
        tableBody.innerHTML = '';
    
        if (bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">No bookings found.</td></tr>';
        } else {
            bookings.forEach((booking, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${booking.fullName || 'Not specified'}</td>
                    <td>${booking.email || 'Not specified'}</td>
                    <td>${booking.phone || 'Not specified'}</td>
                    <td>${getBikeName(booking.bikeType)}</td>
                    <td>${formatDuration(booking.durationInHours)}</td>
                    <td>${booking.bookedAt || 'Not specified'}</td>
                    <td><button class="delete-btn" onclick="deleteBooking(${index})">Delete</button></td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
    
    // Helper function to format duration
    function formatDuration(duration) {
        if (!duration) return 'Not specified';
        const durations = {
            '4': '4 hours',
            '8': '8 hours',
            '24': '1 day',
            '48': '2 days',
            '72': '3 days'
        };
        return durations[duration] || duration;
    }
    
    // Helper function to get bike name
    function getBikeName(bikeType) {
        const bikeNames = {
            'mountain': 'Mountain Pro XT',
            'road': 'Road Elite S1',
            'electric': 'E-Cruiser 5000',
            'hybrid': 'City Hybrid Z3'
        };
        return bikeNames[bikeType] || bikeType;
    }
    
    function confirmBooking() {
        const bookingModal = document.getElementById('booking-modal');
        
        // Get user input
        const fullName = document.getElementById('full-name').value || "Not specified";
        const phone = document.getElementById('phone').value || "Not specified";
        const email = document.getElementById('email').value || "Not specified";
    
        // Display email in the confirmation
        document.getElementById('confirmation-email').textContent = email;
        
        // Get booking details - prioritize dataset but fallback to input elements
        const bikeType = bookingModal.dataset.bikeType || document.getElementById('bike-type')?.value || "Not specified";
        const duration = bookingModal.dataset.duration || document.getElementById('rental-duration')?.value || "Not specified";
        
        // Get rental date - this was the main issue
        const rentalDateInput = document.getElementById('rental-date');
        const rentalDate = rentalDateInput ? rentalDateInput.value : "Not specified";
        
        // Format the rental date properly for display
        const formattedRentalDate = formatDate(rentalDate);
        
        // Get current timestamp
        const now = new Date();
        const bookingTimestamp = now.toLocaleString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: 'numeric', 
            minute: 'numeric', 
            hour12: true
        });
        
        // Generate order number
        const orderNumber = `PP-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        
        // Create booking object
        const booking = {
            orderNumber: orderNumber,
            fullName: fullName,
            phone: phone,
            bikeType: bikeType,
            duration: duration,
            date: rentalDate,  // Store the actual date value
            formattedDate: formattedRentalDate,  // Store formatted version for display
            timestamp: bookingTimestamp,
            email: email
        };
        
        // Save booking to localStorage
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Update confirmation section
        document.getElementById('order-number').textContent = orderNumber;
        document.getElementById('confirmation-number').textContent = orderNumber;
        document.getElementById('confirmation-timestamp').textContent = `Confirmed on ${bookingTimestamp}`;
        document.getElementById('confirmation-date').textContent = formattedRentalDate;  // This displays the rental date
        
        // Move to confirmation step
        changeStep(3);
        alert('Booking Confirmed Successfully!');
    }
    
    // Helper function to format dates
    function formatDate(dateString) {
        if (!dateString || dateString === "Not specified") return "Not specified";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === bookingModal || event.target === authModal) {
            closeModal();
        }
        
        const bikeModal = document.getElementById('bike-details-modal');
        if (event.target === bikeModal) {
            bikeModal.style.display = 'none';
        }
    });
    
    // Initialize date picker with tomorrow's date as default
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('rental-date').value = formattedDate;
    document.getElementById('rental-date').min = formattedDate;
    
    // Update price when duration or bike type changes
    document.getElementById('rental-duration').addEventListener('change', updatePriceDisplay);
    document.getElementById('bike-type').addEventListener('change', updatePriceDisplay);
    
    function updatePriceDisplay() {
    const duration = document.getElementById('rental-duration').value;
    const bikeType = document.getElementById('bike-type').value;
    
    // FIXED prices regardless of bike type
    let price = 0;
    
    if (duration === '4') {
        price = 150;  // Same for all bikes
    } else if (duration === '8') {
        price = 250;  // Same for all bikes
    } else if (duration === '24') {
        // Use the bike's daily price
        price = bikePrices[bikeType].daily;
    } else if (duration === '48') {
        price = (bikePrices[bikeType].daily * 2) - 100;
    } else if (duration === '72') {
        price = (bikePrices[bikeType].daily * 3) - 150;
    }
        
        document.querySelector('.amount').textContent = `₱${price}`;
        
        // Update the booking summary with current values
        const date = document.getElementById('rental-date').value;
        updateBookingSummary(bikeType, duration, date);
    }
    
    // Initialize price display
    updatePriceDisplay();
});

// User Authentication System
const users = JSON.parse(localStorage.getItem('users')) || [];

// Helper functions
function findUserByEmail(email) {
    return users.find(user => user.email === email);
}

function showError(input, message) {
    const errorElement = input.nextElementSibling;
    input.setCustomValidity(message);
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.querySelector('span').textContent = message;
        errorElement.style.display = 'flex';
    }
    input.reportValidity();
}

function resetError(input) {
    const errorElement = input.nextElementSibling;
    input.setCustomValidity("");
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.style.display = 'none';
    }
}

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authModal = document.getElementById('auth-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const loginBtn = document.querySelector('.login-btn');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authContents = document.querySelectorAll('.auth-content');
    const switchToSignup = document.querySelector('.switch-to-signup');
    const switchToLogin = document.querySelector('.switch-to-login');

    // Event Listeners
    loginBtn?.addEventListener('click', function(e) {
        e.preventDefault();
        authModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            authContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}-content`) {
                    content.classList.add('active');
                }
            });
        });
    });

    switchToSignup?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.auth-tab[data-tab="signup"]').click();
    });

    switchToLogin?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.auth-tab[data-tab="login"]').click();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === authModal) {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Signup Form Submission
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const firstName = document.getElementById('signup-firstname');
    const middleName = document.getElementById('signup-middlename');
    const lastName = document.getElementById('signup-lastname');
    const email = document.getElementById('signup-email');
    const phone = document.getElementById('signup-phone');
    const password = document.getElementById('signup-password');
    const confirmPassword = document.getElementById('signup-confirm-password');

    // Reset errors
    [firstName, lastName, email, phone, password, confirmPassword].forEach(resetError);

    // Validate form
    let isValid = true;
    
    // Check if email is already registered
    const existingUser = users.find(user => user.email === email.value.trim());
    if (existingUser) {
        alert("Email is already registered.");
        location.reload();
        return;
    }


    // Then validate other fields
    if (!firstName.value.trim()) {
        showError(firstName, "Please enter your first name");
        isValid = false;
    }
    
    if (!lastName.value.trim()) {
        showError(lastName, "Please enter your last name");
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError(email, "Please enter your email");
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        showError(email, "Please enter a valid email");
        isValid = false;
    }

    // Check for duplicate phone number
    const existingUserPhone = users.find(user => user.phone === phone.value.trim());
    if (existingUserPhone) {
        alert("Phone Number is already registered");
        location.reload();
        return;
    }
    
    if (!phone.value.trim()) {
        showError(phone, "Please enter your phone number");
        isValid = false;
    }
    
    if (!password.value.trim()) {
        showError(password, "Please enter a password");
        isValid = false;
    }
    
    if (!confirmPassword.value.trim()) {
        showError(confirmPassword, "Please confirm your password");
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, "Passwords don't match");
        isValid = false;
    }

    if (isValid) {
         // Form is valid - submit data
        console.log('Signup submitted', { 
            firstName: firstName.value.trim(),
            middleName: middleName.value.trim(), // Optional field
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            password: password.value
        });

        // Create user object
        const newUser = {
            firstName: firstName.value.trim(),
            middleName: middleName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            password: password.value
        };

        // Save user
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        // Show success message and switch to login tab
        alert('Account successfully registered. You can now login.');
        location.reload();

        // Clear form
        this.reset();
    }
});


        // Login Form Submission
document.getElementById('login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    // Reset errors
    [emailInput, passwordInput].forEach(resetError);

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Find user by email
    const user = findUserByEmail(email);

    // If user not found
    if (!user) {
        showError(emailInput, "User not found");

        setTimeout(function() {
            window.location.reload(); // Refresh the current tab
        }, 1500);  // Wait for 2 seconds before refreshing
        return;
    }

    // If password is incorrect
    if (user.password !== password) {
        showError(passwordInput, "Incorrect password");

        // Refresh the page to allow the user to try again in the same tab
        setTimeout(function() {
            window.location.reload(); // Refresh the current tab
        }, 300);  // Wait for 2 seconds before refreshing

        return;
    }

    // Login successful - store current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
});

// Logout Functionality
document.querySelector('.logout-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');
    // Redirect to homepage (login page)
    window.location.href = 'index.html';
});

// Helper function to reset error messages
function resetError(input) {
    input.setCustomValidity("");  // Clear any custom validity
    const errorMessage = input.nextElementSibling;
    if (errorMessage) {
        errorMessage.style.display = 'none';  // Hide error message
    }
}

// Function to show error message
function showError(input, message) {
    input.setCustomValidity(message);
    const errorMessage = input.nextElementSibling;
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'flex';  // Show error message
    }
    input.reportValidity();  // Trigger built-in validation message display
}

// Function to find user by email from localStorage
function findUserByEmail(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(user => user.email === email);
}

document.addEventListener('DOMContentLoaded', function() {
    const rentals = JSON.parse(localStorage.getItem('rentals')) || [];
    const rentalsTableBody = document.querySelector('#rentals-table tbody');
    
    // Clear any previous data
    rentalsTableBody.innerHTML = '';
    
    rentals.forEach((rental, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${rental.user.firstName}</td>
            <td>${rental.user.lastName}</td>
            <td>${rental.user.email}</td>
            <td>${rental.rental.rentalDate}</td>
            <td>${rental.rental.rentalDuration} hours</td>
            <td>
                <button class="delete-user" data-index="${index}">Delete</button>
            </td>
        `;
        
        rentalsTableBody.appendChild(row);
    });
    
    // Delete user functionality
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', function() {
            const userIndex = button.dataset.index;
            deleteUser(userIndex);
        });
    });
});
