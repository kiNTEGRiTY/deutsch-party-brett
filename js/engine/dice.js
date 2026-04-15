/**
 * Dice - Dice rolling logic and visual state
 */

export class Dice {
  constructor() {
    this.value = 1;
    this.rolling = false;
  }

  /**
   * Roll the dice - returns a promise that resolves with the value
   * Includes a visual rolling delay
   */
  roll() {
    return new Promise((resolve) => {
      this.rolling = true;
      
      // Simulate visual rolling with intermediate values
      const rollDuration = 800;
      const intervalTime = 80;
      let elapsed = 0;
      
      const interval = setInterval(() => {
        elapsed += intervalTime;
        this.value = Math.floor(Math.random() * 6) + 1;
        
        // Dispatch event for UI updates during roll
        window.dispatchEvent(new CustomEvent('dice:rolling', { 
          detail: { value: this.value } 
        }));
        
        if (elapsed >= rollDuration) {
          clearInterval(interval);
          // Final value
          this.value = Math.floor(Math.random() * 6) + 1;
          this.rolling = false;
          
          window.dispatchEvent(new CustomEvent('dice:rolled', { 
            detail: { value: this.value } 
          }));
          
          resolve(this.value);
        }
      }, intervalTime);
    });
  }

  /**
   * Get the dot pattern for a dice face value (3x3 grid)
   * Returns array of 9 booleans for dot positions:
   * [TL, TC, TR, ML, MC, MR, BL, BC, BR]
   */
  static getDotPattern(value) {
    const patterns = {
      1: [0,0,0, 0,1,0, 0,0,0],
      2: [0,0,1, 0,0,0, 1,0,0],
      3: [0,0,1, 0,1,0, 1,0,0],
      4: [1,0,1, 0,0,0, 1,0,1],
      5: [1,0,1, 0,1,0, 1,0,1],
      6: [1,0,1, 1,0,1, 1,0,1]
    };
    return patterns[value] || patterns[1];
  }
}
