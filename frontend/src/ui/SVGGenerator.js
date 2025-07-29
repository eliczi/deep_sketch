class SVGGenerator {
  static generateConvolutionalLayerSVG(width = 64, height = 64, options = {}) {
    const {
      backgroundColor = "none",
      strokeColor = "#000000",
      strokeWidth = 5,
      borderRadius = 4,

      kernelWidth = width / 3,
      kernelHeight = height / 3,
      kernelColor = "#000000",
      kernelX = 5,
      kernelY = 5,

      displayNumber = true,
      numberValue = 3,
      numberX = null,
      numberY = null,
      numberFontSize = 12,
      numberFontFamily = "Arial",
      numberColor = "#000000",

      displayBottomNumber = true,
      bottomNumberValue = 3,
      bottomNumberX = null,
      bottomNumberY = null,
      bottomNumberFontSize = 12,
      bottomNumberFontFamily = "Arial",
      bottomNumberColor = "#000000",
    } = options;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;

    svg += `<rect x="0" y="0" width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}" 
              fill="${backgroundColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;

    svg += `<rect x="${kernelX}" y="${kernelY}" width="${kernelWidth}" height="${kernelHeight}" 
              fill="none" stroke="${kernelColor}" stroke-width="2" class="kernel-rect"/>`;

    const calcNumberX = numberX !== null ? numberX : kernelX + kernelWidth + 4;
    const calcNumberY =
      numberY !== null
        ? numberY
        : kernelY + kernelHeight / 2 + numberFontSize / 3;

    const calcBottomNumberX =
      bottomNumberX !== null
        ? bottomNumberX
        : kernelX + kernelWidth / 2 - bottomNumberFontSize / 3;
    const calcBottomNumberY =
      bottomNumberY !== null ? bottomNumberY : kernelY + kernelHeight + 15;

    if (displayNumber) {
      svg += `<text x="${calcNumberX}" y="${calcNumberY}" 
                font-family="${numberFontFamily}" font-size="${numberFontSize}" 
                fill="${numberColor}" class="kernel-number">${numberValue}</text>`;
    }

    if (displayBottomNumber) {
      svg += `<text x="${calcBottomNumberX}" y="${calcBottomNumberY}" 
                font-family="${bottomNumberFontFamily}" font-size="${bottomNumberFontSize}" 
                fill="${bottomNumberColor}" class="kernel-bottom-number">${bottomNumberValue}</text>`;
    }

    svg += "</svg>";

    return svg;
  }


  static createSVGRepresentation(type, options = {}) {
    let svgContent = "";
    switch (type.toLowerCase()) {
      case "convolutionallayer":
        svgContent = this.generateConvolutionalLayerSVG(64, 64, options);
        break;
      default:
        return null;
    }

    return {
      svg_content: svgContent,
    };
  }

  /**
   * Updates kernel properties in an existing SVG
   * @param {HTMLElement} svgContainer - Container element holding the SVG
   * @param {Object} kernelOptions - Kernel options to update
   * @param {Object} numberOptions - Left number options to update
   * @param {Object} bottomNumberOptions - Bottom number options to update
   * @returns {boolean} Success or failure of the update
   */
  static updateKernelInSVG(
    svgContainer,
    kernelOptions = {},
    numberOptions = {},
    bottomNumberOptions = {},
  ) {
    const {
      kernelWidth = null,
      kernelHeight = null,
      kernelX = null,
      kernelY = null,
      kernelColor = null,
    } = kernelOptions;

    const {
      numberValue = null,
      numberColor = null,
      numberFontSize = null,
    } = numberOptions;

    const {
      bottomNumberValue = null,
      bottomNumberColor = null,
      bottomNumberFontSize = null,
    } = bottomNumberOptions;

    if (!svgContainer) return false;

    const svgElement = svgContainer.querySelector("svg");
    if (!svgElement) return false;

    let kernelRect = svgElement.querySelector(".kernel-rect");
    if (!kernelRect) {
      const rects = svgElement.querySelectorAll("rect");
      if (rects.length >= 2) {
        kernelRect = rects[1];
      } else {
        return false;
      }
    }

    if (kernelWidth !== null) kernelRect.setAttribute("width", kernelWidth);
    if (kernelHeight !== null) kernelRect.setAttribute("height", kernelHeight);
    if (kernelX !== null) kernelRect.setAttribute("x", kernelX);
    if (kernelY !== null) kernelRect.setAttribute("y", kernelY);
    if (kernelColor !== null) kernelRect.setAttribute("stroke", kernelColor);

    let numberText = svgElement.querySelector(".kernel-number");
    if (numberText) {
      if (numberValue !== null) numberText.textContent = numberValue;
      if (numberColor !== null) numberText.setAttribute("fill", numberColor);
      if (numberFontSize !== null)
        numberText.setAttribute("font-size", numberFontSize);

      if (kernelX !== null || kernelY !== null) {
        const kernelW =
          kernelWidth || parseInt(kernelRect.getAttribute("width"));
        const kernelH =
          kernelHeight || parseInt(kernelRect.getAttribute("height"));
        const kX =
          kernelX !== null ? kernelX : parseInt(kernelRect.getAttribute("x"));
        const kY =
          kernelY !== null ? kernelY : parseInt(kernelRect.getAttribute("y"));
        const fontSize =
          numberFontSize || parseInt(numberText.getAttribute("font-size"));

        const newX = kX + kernelW + 4;
        const newY = kY + kernelH / 2 + fontSize / 3;

        numberText.setAttribute("x", newX);
        numberText.setAttribute("y", newY);
      }
    }

    let bottomNumberText = svgElement.querySelector(".kernel-bottom-number");
    if (bottomNumberText) {
      if (bottomNumberValue !== null)
        bottomNumberText.textContent = bottomNumberValue;
      if (bottomNumberColor !== null)
        bottomNumberText.setAttribute("fill", bottomNumberColor);
      if (bottomNumberFontSize !== null)
        bottomNumberText.setAttribute("font-size", bottomNumberFontSize);

      if (
        kernelX !== null ||
        kernelY !== null ||
        kernelWidth !== null ||
        kernelHeight !== null
      ) {
        const kernelW =
          kernelWidth || parseInt(kernelRect.getAttribute("width"));
        const kernelH =
          kernelHeight || parseInt(kernelRect.getAttribute("height"));
        const kX =
          kernelX !== null ? kernelX : parseInt(kernelRect.getAttribute("x"));
        const kY =
          kernelY !== null ? kernelY : parseInt(kernelRect.getAttribute("y"));
        const fontSize =
          bottomNumberFontSize ||
          parseInt(bottomNumberText.getAttribute("font-size"));

        const newX = kX + kernelW / 2 - fontSize / 3;
        const newY = kY + kernelH + 15;

        bottomNumberText.setAttribute("x", newX);
        bottomNumberText.setAttribute("y", newY);
      }
    }

    return true;
  }

  static updateConvolutionalLayerSVG(
    width = 64,
    height = 64,
    options = {},
    kernelOptions = {},
    numberOptions = {},
    bottomNumberOptions = {},
  ) {
    const updatedOptions = {
      ...options,
      ...kernelOptions,
      ...numberOptions,
      ...bottomNumberOptions,
    };

    return this.generateConvolutionalLayerSVG(width, height, updatedOptions);
  }

  /**
   * Replaces an SVG with an updated version
   * @param {HTMLElement} container - Container element holding the SVG
   * @param {Object} kernelOptions - Kernel options to update
   * @param {Object} numberOptions - Left number options to update
   * @param {Object} bottomNumberOptions - Bottom number options to update
   * @returns {boolean} Success or failure of the replacement
   */
  static replaceKernelSVG(
    container,
    kernelOptions = {},
    numberOptions = {},
    bottomNumberOptions = {},
  ) {
    if (!container) return false;

    const svgElement = container.querySelector("svg");
    if (!svgElement) return false;

    const width = parseInt(svgElement.getAttribute("width")) || 64;
    const height = parseInt(svgElement.getAttribute("height")) || 64;

    const bgRect = svgElement.querySelector("rect");
    const options = {};

    if (bgRect) {
      options.backgroundColor = bgRect.getAttribute("fill") || "#FFFFFF";
      options.strokeColor = bgRect.getAttribute("stroke") || "#000000";
      options.strokeWidth = parseInt(bgRect.getAttribute("stroke-width")) || 5;
      options.borderRadius = parseInt(bgRect.getAttribute("rx")) || 4;
    }

    const newSVG = this.updateConvolutionalLayerSVG(
      width,
      height,
      options,
      kernelOptions,
      numberOptions,
      bottomNumberOptions,
    );

    container.innerHTML = newSVG;

    return true;
  }
}

export default SVGGenerator;
