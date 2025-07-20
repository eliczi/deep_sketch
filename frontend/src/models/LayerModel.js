import SVGGenerator from "../ui/SVGGenerator.js";
import LayerFactory from "../ui/LayerFactory.js";
import NetworkModel from "./NetworkModel.js";

/**
 * Represents a layer node in the network, including its parameters, type, and UI element.
 * Provides methods for updating visualization and managing layer-specific data.
 * @class
 */
class LayerModel {
  static LAYER_DIMENSIONS = {
    DEFAULT: { width: 64, height: 64 },
    InputLayer: { width: 64, height: 64 },
    ConvolutionalLayer: { width: 64, height: 64 },
    PoolingLayer: { width: 112, height: 64 },
    DenseLayer: { width: 64, height: 64 },
    EmbeddingLayer: { width: 64, height: 64 },
    DropoutLayer: { width: 64, height: 64 },
    FlatteningLayer: { width: 64, height: 64 },
    AttentionLayer: { width: 64, height: 64 },
    OutputLayer: { width: 64, height: 64 },
    ReLUFunction: { width: 40, height: 40 },
    LeakyReLUFunction: { width: 40, height: 40 },
    SoftMaxFunction: { width: 40, height: 40 },
    TanhFunction: { width: 40, height: 40 },
  };

  static VISUAL_PARAMETERS = {
    ConvolutionalLayer: [
      "kernelSize",
      "kernel_size",
      "filters",
      "stride",
      "padding",
    ],
    PoolingLayer: ["pooling_type"],
    BaseInputLayer: ["input_type"],
    EmbeddingLayer: [
      "input_dim",
      "output_dim",
      "embeddings_initializer",
      "embeddings_regularizer",
      "embeddings_constraint",
      "mask_zero",
      "lora_rank",
    ],
  };

  constructor(id, backendId, type, params, x, y) {
    this.id = id;
    this.backendId = backendId;
    this.type = type;
    this.params = params;
    this.x = x;
    this.y = y;
    this.element = null;

    const dimensions = this.getDimensions();
    this.width = dimensions.width;
    this.height = dimensions.height;
  }

  getElement() {
    return this.element;
  }

  setElement(element) {
    this.element = element;

    if (element) {
      element._svgContainer = element.querySelector(".node-svg-container");

      if (this.type === "ConvolutionalLayer") {
        element._kernelSize =
          this.params.kernelSize || this.params.kernel_size || 3;
      }
    }
  }

  getDimensions() {
    if (LayerModel.LAYER_DIMENSIONS[this.type]) {
      return LayerModel.LAYER_DIMENSIONS[this.type];
    }
    return LayerModel.LAYER_DIMENSIONS.DEFAULT;
  }

  getParameters() {
    return this.params;
  }

  /**
   * Get a specific parameter with fallback
   * @param {string} key - Parameter key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Parameter value
   * @private
   */
  getLayerParameter(key, defaultValue) {
    if (key in this.params) return this.params[key];
    return defaultValue;
  }

  getConvParamDimension() {
    if (this.type !== "ConvolutionalLayer") return 1;
    const convType = this.params.conv_type || "Conv2D";
    if (convType === "Conv1D") return 1;
    if (convType === "Conv2D") return 2;
    if (convType === "Conv3D") return 3;
    return 1;
  }

  updateParameter(key, value) {
    if (!(key in this.params)) return;
    this.params[key] = value;
    const visualParams = LayerModel.VISUAL_PARAMETERS[this.type] || [];
    if (visualParams.includes(key)) {
      this.updateVisualization();
    }
  }

  updateVisualization() {
    if (!this.element) return;

    switch (this.type) {
      case "ConvolutionalLayer":
        this.updateConvLayerVisualization();
        break;
      case "PoolingLayer":
        const poolingType = this.getLayerParameter("pooling_type", "max");
        LayerFactory.updatePoolingTypeText(this.element, poolingType);
        break;
      case "DropoutLayer":
        this.updateDropoutLayerVisualization();
        break;
      case "EmbeddingLayer":
        this.updateEmbeddingLayerVisualization();
        break;
      case "BaseInputLayer":
        let inputType = this.getLayerParameter("input_type", "IMAGE");
        inputType =
          inputType.charAt(0).toUpperCase() + inputType.slice(1).toLowerCase();
        const layer = NetworkModel.getLayerType(`${inputType}InputLayer`);
        let newParams = {};
        layer.params.forEach((param) => {
          if (param.name === "input_type") {
            newParams[param.name] = inputType.toUpperCase();
            return;
          }
          newParams[param.name] = param.default;
        });
        this.params = newParams;

        const svgContent =
          layer.svg_representation.all_representations[
            inputType.toUpperCase()
          ] || layer.svg_representation.all_representations.IMAGE;
        this.element._svgContainer.innerHTML = svgContent;
        const svgElement = this.element._svgContainer.querySelector("svg");
        if (svgElement) {
          svgElement.setAttribute("width", "64px");
          svgElement.setAttribute("height", "64px");
        }
        break;
    }
  }

  updateConvLayerVisualization() {
    const svgContainer = this.element._svgContainer;
    if (!svgContainer) return;

    const kernelSize = this.getLayerParameter("kernel_size", 3);
    const filters = this.getLayerParameter("filters", 32);
    const stride = this.getLayerParameter("stride", 1);

    const scaledKernelSize = this.calculateKernelDisplaySize(kernelSize);

    const kernelX = 5 * 2;
    const kernelY = 5 * 2;

    const kernelOptions = {
      kernelWidth: scaledKernelSize,
      kernelHeight: scaledKernelSize,
      kernelX: kernelX,
      kernelY: kernelY,
    };

    const numberOptions = {
      numberValue: kernelSize,
    };

    const bottomNumberOptions = {
      bottomNumberValue: kernelSize,
    };

    const success = SVGGenerator.replaceKernelSVG(
      svgContainer,
      kernelOptions,
      numberOptions,
      bottomNumberOptions,
    );

    if (success) {
      this.element._kernelSize = kernelSize;
    } else {
      console.warn("Failed to update kernel visualization");
    }
  }
  updateDropoutLayerVisualization() {
    const svgContainer = this.element._svgContainer;
    if (!svgContainer) return;

    const probability = this.getLayerParameter("probability", 0.5);
    const inplace = this.getLayerParameter("inplace", false);
    const svgElement = svgContainer.querySelector("svg");
    if (svgElement) {
      let probabilityText = svgElement.querySelector(".probability-text");
      if (!probabilityText) {
        probabilityText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        probabilityText.setAttribute("class", "probability-text");
        probabilityText.setAttribute("x", "32");
        probabilityText.setAttribute("y", "40");
        probabilityText.setAttribute("text-anchor", "middle");
        probabilityText.setAttribute("font-size", "10px");
        probabilityText.setAttribute("fill", "#666");
        svgElement.appendChild(probabilityText);
      }
      probabilityText.textContent = `${probability}`;
    }
  }

  updateEmbeddingLayerVisualization() {
    const svgContainer = this.element._svgContainer;
    if (!svgContainer) return;

    const inputDim = this.getLayerParameter("input_dim", 1000);
    const outputDim = this.getLayerParameter("output_dim", 100);

    const svgElement = svgContainer.querySelector("svg");
    if (svgElement) {
      let dimensionsText = svgElement.querySelector(".embedding-dimensions");
      if (!dimensionsText) {
        dimensionsText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        dimensionsText.setAttribute("class", "embedding-dimensions");
        dimensionsText.setAttribute("x", "32");
        dimensionsText.setAttribute("y", "40");
        dimensionsText.setAttribute("text-anchor", "middle");
        dimensionsText.setAttribute("font-size", "10px");
        dimensionsText.setAttribute("fill", "#666");
        svgElement.appendChild(dimensionsText);
      }
      dimensionsText.textContent = `${inputDim} → ${outputDim}`;
    }
  }

  calculateKernelDisplaySize(kernelSize) {
    const size = parseInt(kernelSize);
    if (isNaN(size) || size < 1) return 21;

    return Math.min(15 + size * 3, 35);
  }

  static getDimensionsForType(layerType) {
    return (
      LayerModel.LAYER_DIMENSIONS[layerType] ||
      LayerModel.LAYER_DIMENSIONS.DEFAULT
    );
  }
}

export default LayerModel;
