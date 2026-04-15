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
    // Hide current
    if (this.currentScreen && this.screens[this.currentScreen]) {
      this.screens[this.currentScreen].classList.remove('active');
    }

    // Show new
    if (this.screens[name]) {
      this.screens[name].classList.add('active');
      // Trigger entrance animation
      this.screens[name].classList.remove('animate-screen');
      void this.screens[name].offsetWidth; // Force reflow
      this.screens[name].classList.add('animate-screen');
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
