import { DraggableWindow } from './DraggableWindow.js';
export class ConnectionWindow {
    constructor() {
      this.windowVisible = false;
      this.setupStyles();
    }
  
    setupStyles() {
      if (!document.getElementById('connection-styles')) {
        const style = document.createElement('style');
        style.id = 'connection-styles';
        style.textContent = `
          /* Connection window styles */
          .connection-window {
            position: absolute;
            background-color: white;
            border: 1px solid #5677fc;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            padding: 15px;
            z-index: 2000;
            min-width: 300px;
            min-height: 200px;
          }
          
          .connection-window-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          
          .connection-window-title {
            font-weight: bold;
            font-size: 16px;
          }
          
          .connection-window-close {
            cursor: pointer;
            font-size: 18px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
          }
          
          .connection-window-close:hover {
            background-color: #f0f0f0;
          }
          
          .connection-window-content {
            position: relative;
            min-height: 120px;
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    show(sourceId, targetId, event) {
      this.close();
      
      const windowElement = document.createElement('div');
      windowElement.className = 'connection-window';
      windowElement.id = 'connection-window';
      
      const header = document.createElement('div');
      header.className = 'connection-window-header';
      
      const title = document.createElement('div');
      title.className = 'connection-window-title';
      title.textContent = `Connection Details`;
      
      const closeButton = document.createElement('div');
      closeButton.className = 'connection-window-close';
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', () => this.close());
      
      header.appendChild(title);
      header.appendChild(closeButton);
      
      const content = document.createElement('div');
      content.className = 'connection-window-content';
      
      windowElement.appendChild(header);
      windowElement.appendChild(content);
      
      
      windowElement.style.left = `${event.clientX}px`;
      windowElement.style.top = `${event.clientY}px`;
      windowElement.style.transform = 'none';
  
      document.body.appendChild(windowElement);
      this.windowVisible = true;
      
      
      
      
      
      document.addEventListener('mousedown', this.handleOutsideClick);
    }
    
    handleOutsideClick = (e) => {
      const window = document.getElementById('connection-window');
      if (window && !window.contains(e.target) && this.windowVisible) {
        this.close();
      }
    }
    
    close() {
      const window = document.getElementById('connection-window');
      if (window) {
        window.remove();
        this.windowVisible = false;
        document.removeEventListener('mousedown', this.handleOutsideClick);
      }
    }
  }
  