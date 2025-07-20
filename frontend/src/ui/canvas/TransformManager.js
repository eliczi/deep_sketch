class TransformManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.panX = 0;
    this.panY = 0;
    this.scale = 1.0;
    this.minScale = 0.2;
    this.maxScale = 2.0;
    this.zoomStep = 0.005;
  }

  pan(deltaX, deltaY) {
    this.panX += deltaX;
    this.panY += deltaY;
  }

  zoom(amount, centerX, centerY) {
    const newScale = Math.min(
      Math.max(this.scale + amount, this.minScale),
      this.maxScale,
    );

    if (newScale !== this.scale) {
      const rect = this.canvas.getBoundingClientRect();
      const zoomPointX = centerX - rect.left;
      const zoomPointY = centerY - rect.top;

      const worldX = (zoomPointX - this.panX) / this.scale;
      const worldY = (zoomPointY - this.panY) / this.scale;

      this.scale = newScale;

      this.panX = zoomPointX - worldX * this.scale;
      this.panY = zoomPointY - worldY * this.scale;

      return true;
    }
    return false;
  }

  reset() {
    this.panX = 0;
    this.panY = 0;
    this.scale = 1.0;
  }

  screenToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.panX) / this.scale,
      y: (clientY - rect.top - this.panY) / this.scale,
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.scale + this.panX,
      y: worldY * this.scale + this.panY,
    };
  }
}
export default new TransformManager();
