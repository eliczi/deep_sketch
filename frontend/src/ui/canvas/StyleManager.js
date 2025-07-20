class StyleManager {
  constructor() {
    this.injectStyles();
    this.zoomIndicator = this.createZoomIndicator();
  }

  injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .selection-area {
          position: absolute;
          border: 1px dashed #3498db;
          background-color: rgba(52, 152, 219, 0.1);
          pointer-events: none;
          z-index: 1000;
        }
        
        .layer-node.selected {
          outline: 2px solid #3498db !important;
          box-shadow: 0 0 8px rgba(52, 152, 219, 0.6) !important;
        }
      `;
    document.head.appendChild(style);
  }

  createZoomIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "zoom-indicator";
    indicator.textContent = "100%";
    document.body.appendChild(indicator);
    return indicator;
  }
}

export default StyleManager;
