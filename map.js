// Simple Campus Map with Zoom Controls

document.addEventListener('DOMContentLoaded', function() {
  const campusImage = document.getElementById('campusImage');
  const imageContainer = document.getElementById('imageContainer');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const resetZoomBtn = document.getElementById('resetZoom');
  
  let scale = 1;
  let panning = false;
  let pointX = 0;
  let pointY = 0;
  let start = { x: 0, y: 0 };

  function setTransform() {
    campusImage.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  }

  // Zoom controls
  zoomInBtn.addEventListener('click', () => {
    scale = Math.min(scale * 1.3, 4);
    setTransform();
  });

  zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(scale / 1.3, 0.5);
    setTransform();
  });

  resetZoomBtn.addEventListener('click', () => {
    scale = 1;
    pointX = 0;
    pointY = 0;
    setTransform();
  });

  // Mouse events for desktop
  campusImage.addEventListener('mousedown', (e) => {
    e.preventDefault();
    start = { x: e.clientX - pointX, y: e.clientY - pointY };
    panning = true;
    campusImage.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!panning) return;
    e.preventDefault();
    pointX = e.clientX - start.x;
    // Smooth dragging using requestAnimationFrame
    const targetX = e.clientX - start.x;
    const targetY = e.clientY - start.y;

    function animateDrag() {
      // Use a simple easing for smoothness
      pointX += (targetX - pointX) * 0.2;
      pointY += (targetY - pointY) * 0.2;
      setTransform();

      // If close enough to target, stop animating
      if (Math.abs(pointX - targetX) > 0.5 || Math.abs(pointY - targetY) > 0.5) {
        requestAnimationFrame(animateDrag);
      } else {
        pointX = targetX;
        pointY = targetY;
        setTransform();
      }
    }

    animateDrag();
    setTransform();
  });

  document.addEventListener('mouseup', () => {
    panning = false;
    campusImage.style.cursor = 'grab';
  });

  // Touch events for mobile
  campusImage.addEventListener('touchstart', (e) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      start = { x: touch.clientX - pointX, y: touch.clientY - pointY };
      panning = true;
    } else if (e.touches.length === 2) {
      panning = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    }
  });

  campusImage.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && panning) {
      const touch = e.touches[0];
      pointX = touch.clientX - start.x;
      pointY = touch.clientY - start.y;
      setTransform();
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (typeof initialDistance !== 'undefined' && initialDistance > 0) {
        const scaleChange = currentDistance / initialDistance;
        const newScale = Math.max(0.5, Math.min(4, scale * scaleChange));
        scale = newScale;
        setTransform();
        initialDistance = currentDistance;
      }
    }
  });

  campusImage.addEventListener('touchend', (e) => {
    e.preventDefault();
    panning = false;
    
    // Handle double tap to zoom
    if (e.touches.length === 0) {
      const now = new Date().getTime();
      const timeSince = now - (campusImage.lastTap || 0);
      
      if (timeSince < 300 && timeSince > 40) {
        if (scale === 1) {
          scale = 2;
        } else {
          scale = 1;
          pointX = 0;
          pointY = 0;
        }
        setTransform();
      }
      
      campusImage.lastTap = now;
    }
  });

  // Mouse wheel zoom
  imageContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale = Math.max(0.5, Math.min(4, scale * delta));
    setTransform();
  });

  // Prevent context menu
  campusImage.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Initialize
  campusImage.style.cursor = 'grab';
  
  let initialDistance = 0;
});
