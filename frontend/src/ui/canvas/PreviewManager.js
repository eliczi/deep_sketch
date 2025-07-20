import NetworkModel from "../../models/NetworkModel.js";

/**
 * Manages the preview display of layers or network states on the canvas.
 * Handles rendering and updating of preview elements.
 * @class
 */
class PreviewManager {
  constructor(canvas) {
    this.canvas = canvas.canvas;
    this.parent = canvas;
    this.previewElement = null;
    window.previewManager = this;
  }

  updatePreviewElement(x, y, type) {
    const layerTypeDef = NetworkModel.getLayerType(`${type}`);
    let previewSize = { width: 64, height: 64 };
    let previewOffsetX = 32;
    let previewOffsetY = 32;
    if (type == "PoolingLayer") {
      previewSize.width = 112;
      previewSize.height = 64;
      previewOffsetX = 56;
      previewOffsetY = 56;
    }
    const previewX = x * this.parent.scale - previewOffsetX;
    const previewY = y * this.parent.scale - previewOffsetY;

    if (this.previewElement) {
      this.updateExistingPreview(
        previewX,
        previewY,
        previewSize.width,
        this.parent.scale,
      );
    } else {
      this.createNewPreview(
        previewX,
        previewY,
        previewSize.width,
        layerTypeDef,
      );
    }
  }
  updateExistingPreview(x, y, size, scale) {
    const svgElement = this.previewElement.querySelector("svg");
    svgElement.setAttribute("width", size);
    svgElement.setAttribute("height", size);
    Object.assign(this.previewElement.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
    });
  }

  /**
   * Creates a new preview element for a layer being added to the canvas.
   *
   * This method generates a visual preview of a layer as it's being dragged
   * onto the canvas. It creates a div container with an SVG
   * element inside, positions it at the specified coordinates, and animates
   * its appearance with a fade-in effect.
   *
   * @param {number} x - The x-coordinate where the preview should be positioned
   * @param {number} y - The y-coordinate where the preview should be positioned
   * @param {number} size - The width and height of the preview element in pixels
   * @param {Object} layerTypeDef - The layer type definition containing SVG representation
   *
   * @returns {undefined} This method doesn't return a value
   */
  createNewPreview(x, y, size, layerTypeDef) {
    this.previewElement = document.createElement("div");
    this.previewElement.className = "svg-element preview";

    Object.assign(this.previewElement.style, {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
    });

    this.previewElement.innerHTML = layerTypeDef.svg_representation.svg_content;

    const svgElement = this.previewElement.querySelector("svg");
    svgElement.setAttribute("width", size);
    svgElement.setAttribute("height", size);

    this.canvas.appendChild(this.previewElement);
    setTimeout(() => {
      this.previewElement.style.opacity = "1";
    }, 10);
  }

  removePreviewElement() {
    if (this.previewElement && this.previewElement.parentNode === this.canvas) {
      this.canvas.removeChild(this.previewElement);
      this.previewElement = null;
    }
  }

  getScale() {
    return this.scale;
  }
}

export default PreviewManager;
