import ConnectionVisualizer from "../connection/ConnectionVisualizer.js";

class ElementUpdater {
  constructor(canvas, transformManager, zoomIndicator) {
    this.canvas = canvas;
    this.transformManager = transformManager;
    this.zoomIndicator = zoomIndicator;
  }

  updateAll() {
    this.updateZoomIndicator();
    this.updateElements(".layer-node");
    this.updateElements(".layer-group");
    this.updateConnections();
  }

  updateZoomIndicator() {
    if (this.zoomIndicator) {
      this.zoomIndicator.textContent = `${Math.round(this.transformManager.scale * 100)}%`;
    }
  }

  updateElements(selector) {
    const elements = this.canvas.querySelectorAll(selector);
    elements.forEach((element) => {
      if (!element.dataset.originalX) {
        element.dataset.originalX = parseFloat(element.style.left) || 0;
        element.dataset.originalY = parseFloat(element.style.top) || 0;
      }

      const originalX = parseFloat(element.dataset.originalX);
      const originalY = parseFloat(element.dataset.originalY);

      const transformed = this.transformManager.worldToScreen(
        originalX,
        originalY,
      );
      element.style.transform = `scale(${this.transformManager.scale})`;
      element.style.left = `${transformed.x}px`;
      element.style.top = `${transformed.y}px`;
    });
  }

  updateConnections() {
    if (ConnectionVisualizer.getInstance) {
      ConnectionVisualizer.getInstance().updateAllConnections();
    }
  }
}

export default ElementUpdater;
