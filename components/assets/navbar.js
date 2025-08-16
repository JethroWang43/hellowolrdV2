// Make floating hamburger draggable
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.floating-hamburger');
  if (!hamburger) return;
  let isDragging = false, offsetX = 0, offsetY = 0;

  hamburger.addEventListener('mousedown', function(e) {
    isDragging = true;
    offsetX = e.clientX - hamburger.offsetLeft;
    offsetY = e.clientY - hamburger.offsetTop;
    hamburger.style.transition = 'none';
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    // Clamp to window edges
    x = Math.max(0, Math.min(window.innerWidth - hamburger.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - hamburger.offsetHeight, y));
    hamburger.style.left = x + 'px';
    hamburger.style.top = y + 'px';
  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
    hamburger.style.transition = '';
  });

  // Touch support
  hamburger.addEventListener('touchstart', function(e) {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - hamburger.offsetLeft;
    offsetY = touch.clientY - hamburger.offsetTop;
    hamburger.style.transition = 'none';
  });
  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    const touch = e.touches[0];
    let x = touch.clientX - offsetX;
    let y = touch.clientY - offsetY;
    x = Math.max(0, Math.min(window.innerWidth - hamburger.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - hamburger.offsetHeight, y));
    hamburger.style.left = x + 'px';
    hamburger.style.top = y + 'px';
  });
  document.addEventListener('touchend', function() {
    isDragging = false;
    hamburger.style.transition = '';
  });
});
// Floating hamburger menu functionality for component nav
// Place this script in your HTML after the nav markup or import it as a module

document.addEventListener('DOMContentLoaded', function() {
  var floatingHamburger = document.getElementById('floatingHamburger');
  var floatingNav = document.getElementById('floatingNav');
  var floatingNavOverlay = document.getElementById('floatingNavOverlay');
  var floatingNavClose = document.getElementById('floatingNavClose');
  if (floatingHamburger && floatingNav && floatingNavOverlay) {
    floatingHamburger.addEventListener('click', function() {
      var isOpen = floatingNav.classList.toggle('open');
      floatingHamburger.classList.toggle('open');
      floatingNavOverlay.classList.toggle('open', isOpen);
    });
    floatingNavOverlay.addEventListener('click', function() {
      floatingNav.classList.remove('open');
      floatingHamburger.classList.remove('open');
      floatingNavOverlay.classList.remove('open');
    });
    if (floatingNavClose) {
      floatingNavClose.addEventListener('click', function() {
        floatingNav.classList.remove('open');
        floatingHamburger.classList.remove('open');
        floatingNavOverlay.classList.remove('open');
      });
    }
  }
});
