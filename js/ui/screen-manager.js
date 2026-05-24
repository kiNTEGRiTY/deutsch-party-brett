/**
 * Screen Manager - Controls screen visibility and transitions
 */

export class ScreenManager {
  constructor() {
    this.screens = {};
    this.currentScreen = null;
    this.history = [];
  }

  /**
   * Register a screen element
   */
  register(name, element) {
    if (!element) {
      console.error(`Screen element not found: ${name}`);
      return;
    }
    this.screens[name] = element;
  }

  /**
   * Show a screen with animation
   */
  show(name) {
    // Hide ALL screens via inline style (immune to CSS loading failures)
    Object.values(this.screens).forEach(el => {
      el.style.display = 'none';
      el.style.pointerEvents = 'none';
      el.classList.remove('active');
    });

    // Show target screen via inline style
    if (this.screens[name]) {
      this.screens[name].style.display = 'flex';
      this.screens[name].style.pointerEvents = 'auto';
      this.screens[name].classList.add('active');
      // Force pastel green background directly
      this.screens[name].style.backgroundColor = '#beddba';
      this.screens[name].style.position = 'fixed';
      this.screens[name].style.inset = '0';
      this.screens[name].style.width = '100vw';
      this.screens[name].style.height = '100vh';
    }

    if (this.currentScreen) {
      this.history.push(this.currentScreen);
    }
    this.currentScreen = name;
  }

  /**
   * Go back to previous screen
   */
  back() {
    if (this.history.length > 0) {
      const prev = this.history.pop();
      // Don't push to history when going back
      if (this.currentScreen && this.screens[this.currentScreen]) {
        this.screens[this.currentScreen].classList.remove('active');
      }
      if (this.screens[prev]) {
        this.screens[prev].classList.add('active');
      }
      this.currentScreen = prev;
    }
  }

  /**
   * Get current screen name
   */
  getCurrent() {
    return this.currentScreen;
  }
}
