/**
 * Cardboard Utils - Shared logic for high-fidelity craft-style minigames
 * 
 * Includes:
 * - Simple Pointer Drag (Mouse/Touch)
 * - Wobble & Shake animations
 * - Layered depth effects
 */

export const CardboardUtils = {
  /**
   * Make an element draggable using pointer events
   * @param {HTMLElement} el - Element to make draggable
   * @param {Object} options - { onStart, onMove, onDrop, bounds }
   */
  makeDraggable(el, options = {}) {
    let isDragging = false;
    let startX, startY;
    let initialX, initialY;

    const onPointerDown = (e) => {
      isDragging = true;
      el.classList.add('is-dragging');
      
      const rect = el.getBoundingClientRect();
      // Store initial offset from pointer to element corner
      startX = e.clientX;
      startY = e.clientY;
      initialX = el.offsetLeft;
      initialY = el.offsetTop;

      el.style.zIndex = '1000';
      el.style.transition = 'none';

      if (options.onStart) options.onStart(el, e);
      
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      let newX = initialX + dx;
      let newY = initialY + dy;

      // Apply bounds if provided
      if (options.bounds) {
        newX = Math.max(options.bounds.left, Math.min(options.bounds.right - el.offsetWidth, newX));
        newY = Math.max(options.bounds.top, Math.min(options.bounds.bottom - el.offsetHeight, newY));
      }

      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;

      if (options.onMove) options.onMove(el, e, { x: newX, y: newY });
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove('is-dragging');
      
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (options.onDrop) options.onDrop(el, e);
    };

    el.style.position = 'absolute';
    el.style.touchAction = 'none'; // Prevent scrolling while dragging
    el.addEventListener('pointerdown', onPointerDown);

    // Return cleanup function
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  },

  /**
   * Add a "paper wobble" effect to an element
   */
  wobble(el, duration = 500) {
    el.classList.add('cardboard-wobble');
    setTimeout(() => el.classList.remove('cardboard-wobble'), duration);
  },

  /**
   * Helper to create a cardboard-textured element
   */
  createCardboardElement(tag, className, text = '') {
    const el = document.createElement(tag);
    el.className = `cardboard-item ${className}`;
    if (text) {
      const content = document.createElement('span');
      content.textContent = text;
      el.appendChild(content);
    }
    return el;
  }
};
