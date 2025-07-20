
/**
 * Manages the session timer for tracking elapsed time in the UI.
 * Handles timer start, stop, and display updates.
 * @class
 */
class SessionTimer {
  constructor() {
    this.startTime = Date.now();
    this.timerElement = null;
    this.intervalId = null;
    this.isVisible = false;
  }

  init(elementId = 'session-timer') {
    this.timerElement = document.getElementById(elementId);
    if (!this.timerElement) {
      this.timerElement = document.createElement('div');
      this.timerElement.id = elementId;
      this.timerElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--surface-color, #ffffff);
        color: #333;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 13px;
        font-weight: 500;
        z-index: 1000;
        display: none;
        user-select: none;
        cursor: default;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid rgba(0,0,0,0.1);
        backdrop-filter: blur(10px);
        transition: opacity 0.2s ease;
      `;
      
      
      this.timerElement.innerHTML = `
        <span class="timer-label">Session: </span>
        <span class="timer-main" style="font-family: 'Menlo', 'Monaco', 'Courier New', monospace;"></span>
        <span class="timer-ms" style="color: #666; font-size: 11px; font-family: 'Menlo', 'Monaco', 'Courier New', monospace;"></span>
      `;
      
      document.body.appendChild(this.timerElement);
      
      
      this.timerElement.title = 'Press Ctrl+T to toggle timer visibility';
    }
    
    this.startDisplay();
  }

  show() {
    if (this.timerElement) {
      this.timerElement.style.display = 'block';
      this.isVisible = true;
    }
  }

  hide() {
    if (this.timerElement) {
      this.timerElement.style.display = 'none';
      this.isVisible = false;
    }
  }

  startDisplay() {
    this.updateDisplay();
    
    this.intervalId = setInterval(() => {
      this.updateDisplay();
    }, 16);
  }

  updateDisplay() {
    const elapsed = Date.now() - this.startTime;
    const formatted = this.formatTime(elapsed);
    if (this.timerElement) {
      const mainTimer = this.timerElement.querySelector('.timer-main');
      const msTimer = this.timerElement.querySelector('.timer-ms');
      if (mainTimer && msTimer) {
        mainTimer.textContent = formatted.main;
        msTimer.textContent = formatted.ms;
      }
    }
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return {
      main: [
        hours.toString().padStart(2, '0'),
        (minutes % 60).toString().padStart(2, '0'),
        (seconds % 60).toString().padStart(2, '0')
      ].join(':'),
      ms: `.${milliseconds.toString().padStart(2, '0')}`
    };
  }

  getElapsedSeconds() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }


  
  

  getElapsedTime() {
    const elapsed = Date.now() - this.startTime;
    const formatted = this.formatTime(elapsed);
    return `${formatted.main}${formatted.ms}`;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.startTime = Date.now();
    this.updateDisplay();
  }
}

export default new SessionTimer();
