import DomUtils from "../../utils/DomUtils.js";
/**
 *
 * Handles displaying and updating the properties panel for neural network layers.
 * Shows editable parameters and updates the network model when changes are made.
 * The panel appears when a layer is selected and allows configuring layer-specific properties.
 *
 * @class LayerPanelManager
 * @param {NetworkModel} networkModel - The network model instance to manage layers for
 *
 * @property {NetworkModel} networkModel - Reference to the network model
 * @property {string|null} currentLayerNodeId - ID of currently selected layer node
 *
 * @method showLayerPanel - Shows the properties panel for a given layer node
 * @method createParameterControl - Creates UI controls for layer parameters
 * @method hideLayerPanel - Hides the properties panel
 * @method styleLayerPanel - Applies styling to the panel
 */

class LayerPanelManager {
  constructor(networkModel) {
    this.networkModel = networkModel;
    this.currentLayerNodeId = null;
    this.showAdditionalParams = false;
  }

  showLayerPanel(nodeId) {
    this.currentLayerNodeId = nodeId;
    const layer = this.networkModel.getLayerById(nodeId);
    if (!layer) {
      this.hideLayerPanel();
      return;
    }
    const layerDefinition = this.networkModel.getLayerType(layer.type);
    let panel = document.getElementById("layer-properties-panel");
    if (!panel) {
      panel = DomUtils.createElementWithClass("div", "layer-properties-panel");
      panel.id = "layer-properties-panel";
      document.body.appendChild(panel);
    }
    panel.innerHTML = "";

    const header = DomUtils.createElementWithClass("div", "panel-header");
    const type = layer.type;
    const typeParts = type.split(/(?=[A-Z])/);
    const formattedType = typeParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    header.textContent = `${formattedType} Properties`;
    panel.appendChild(header);

    const content = DomUtils.createElementWithClass("div", "panel-content");
    const params = layer.getParameters();

    const paramDefinitions = {};
    if (layerDefinition && layerDefinition.params) {
      layerDefinition.params.forEach((paramDef) => {
        paramDefinitions[paramDef.name] = paramDef;
      });
    }

    const basicParamsContainer = DomUtils.createElementWithClass(
      "div",
      "basic-params-container",
    );
    basicParamsContainer.innerHTML = "<h3>Basic Parameters</h3>";

    let additionalParamsContainer, additionalParamsContent;
    const hasAdditionalParams = Object.entries(params).some(([key]) => {
      const paramDef = paramDefinitions[key];
      return paramDef && !paramDef.is_basic;
    });

    if (hasAdditionalParams) {
      additionalParamsContainer = DomUtils.createElementWithClass(
        "div",
        "additional-params-container",
      );
      const additionalHeader = document.createElement("div");
      additionalHeader.className = "additional-params-header";
      additionalHeader.innerHTML = `
        <h3>Additional Parameters</h3>
        <button class="toggle-additional-params">
          ${this.showAdditionalParams ? "Show Less" : "Show More"}
        </button>
      `;
      additionalParamsContainer.appendChild(additionalHeader);

      additionalParamsContent = DomUtils.createElementWithClass(
        "div",
        "additional-params-content",
      );
      additionalParamsContent.style.maxHeight = this.showAdditionalParams
        ? "1000px"
        : "0";
      additionalParamsContent.style.opacity = this.showAdditionalParams
        ? "1"
        : "0";
      additionalParamsContainer.appendChild(additionalParamsContent);

      additionalHeader.querySelector("button").addEventListener("click", () => {
        this.showAdditionalParams = !this.showAdditionalParams;
        additionalParamsContent.style.maxHeight = this.showAdditionalParams
          ? "1000px"
          : "0";
        additionalParamsContent.style.opacity = this.showAdditionalParams
          ? "1"
          : "0";
        additionalHeader.querySelector("button").textContent = this
          .showAdditionalParams
          ? "Show Less"
          : "Show More";
      });
    }

    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const paramDef = paramDefinitions[key];
        const paramControl = this.createParameterControl(
          key,
          params[key],
          layer,
          paramDef,
        );

        if (paramDef && paramDef.is_basic) {
          basicParamsContainer.appendChild(paramControl);
        } else {
          additionalParamsContent.appendChild(paramControl);
        }
      }
    }

    if (basicParamsContainer) {
      content.appendChild(basicParamsContainer);
    }
    if (additionalParamsContainer) {
      content.appendChild(additionalParamsContainer);
    }
    panel.appendChild(content);
    this.styleLayerPanel(panel);
    panel.style.display = "block";
  }

  createParameterControl(key, value, layer, paramDef) {
    const paramContainer = DomUtils.createElementWithClass(
      "div",
      "param-container",
    );

    const label = DomUtils.createElementWithClass("label", "param-label");
    label.textContent = this.formatParamName(key);
    label.htmlFor = `param-${key}-${this.currentLayerNodeId}`;

    let input;
    if (
      paramDef &&
      paramDef.type === "enum" &&
      paramDef.enum_values &&
      paramDef.enum_values.length > 0
    ) {
      input = document.createElement("select");
      input.id = `param-${key}-${this.currentLayerNodeId}`;

      paramDef.enum_values.forEach((enumValue) => {
        const option = document.createElement("option");
        option.value = enumValue;
        option.textContent = this.formatEnumValue(enumValue);
        if (value === enumValue) {
          option.selected = true;
        }
        input.appendChild(option);
      });

      input.addEventListener("change", (e) => {
        const newValue = e.target.value;
        if (layer.getParameters()[key] !== newValue) {
          layer.updateParameter(key, newValue);

          if (this.currentLayerNodeId) {
            this.showLayerPanel(this.currentLayerNodeId);
          }
        }
      });
    } else {
      input = document.createElement("input");
      input.id = `param-${key}-${this.currentLayerNodeId}`;

      if (typeof value === "number") {
        input.type = "number";
        if (paramDef) {
          if (paramDef.min !== undefined) input.min = paramDef.min;
          if (paramDef.max !== undefined) input.max = paramDef.max;
          if (paramDef.step !== undefined) input.step = paramDef.step;
        }
      } else {
        input.type = "text";
      }

      input.value = value;

      input.addEventListener("change", (e) => {
        const newValue =
          input.type === "number" ? parseFloat(e.target.value) : e.target.value;
        layer.updateParameter(key, newValue);

        if (this.currentLayerNodeId) {
          this.showLayerPanel(this.currentLayerNodeId);
        }
      });
    }

    paramContainer.appendChild(label);
    paramContainer.appendChild(input);

    if (paramDef && paramDef.description) {
      const helpText = DomUtils.createElementWithClass("div", "param-help");
      helpText.textContent = paramDef.description;
      paramContainer.appendChild(helpText);
    }

    return paramContainer;
  }

  formatEnumValue(value) {
    return value;
    if (!value) return "";
    return value
      .replace(/_/g, "")
      .replace(/([A-Z])/g, " $1")
      .replace(/^\s+/, "")
      .replace(/\s+/g, "")
      .replace(/^./, (str) => str.toUpperCase());
  }

  formatParamName(name) {
    return name
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }

  styleLayerPanel(panel) {
    Object.assign(panel.style, {
      position: "fixed",
      right: "0px",
      top: "0px",
      width: "300px",
      maxHeight: "100vh",
      backgroundColor: "var(--surface-color, #ffffff)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      borderLeft: "1px solid rgba(0,0,0,0.1)",
      zIndex: "1000",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.3s ease-in-out",
    });

    const style = document.createElement("style");
    style.textContent = `
      .layer-properties-panel {
        display: flex;
        flex-direction: column;
        min-height: min-content;
        max-height: 100vh;
      }

      .panel-header {
        padding: 20px 20px 10px 20px;
        font-size: 16px;
        font-weight: 500;
        border-bottom: 1px solid #eee;
        background: var(--surface-color, #ffffff);
        position: sticky;
        top: 0;
        z-index: 2;
      }

      .panel-content {
        flex: 0 1 auto;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 20px;
        scrollbar-width: thin;
        scrollbar-color: rgba(0,0,0,0.2) transparent;
      }

      .panel-content::-webkit-scrollbar {
        width: 6px;
      }

      .panel-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .panel-content::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,0.2);
        border-radius: 3px;
      }

      .basic-params-container,
      .additional-params-container {
        margin-bottom: 20px;
      }
      
      .basic-params-container h3,
      .additional-params-container h3 {
        font-size: 14px;
        color: #666;
        margin: 0 0 10px 0;
      }

      .additional-params-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-top: 10px;
        border-top: 1px solid #eee;
      }

      .additional-params-content {
        transition: all 0.3s ease-in-out;
        overflow: hidden;
        margin-top: 10px;
      }

      .additional-params-content > * {
        margin-bottom: 15px;
      }

      .additional-params-content > *:last-child {
        margin-bottom: 0;
      }

      .toggle-additional-params {
        background: none;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        color: #666;
        transition: all 0.2s ease;
      }

      .toggle-additional-params:hover {
        background: #f5f5f5;
        border-color: #999;
      }

      .param-container {
        margin-bottom: 15px;
      }

      .param-container:last-child {
        margin-bottom: 0;
      }

      .param-label {
        display: block;
        font-size: 12px;
        margin-bottom: 4px;
        color: #333;
      }

      input, select {
        width: 100%;
        padding: 6px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        box-sizing: border-box;
      }

      input:focus, select:focus {
        outline: none;
        border-color: #0066cc;
      }

      .param-help {
        font-size: 11px;
        color: #666;
        margin-top: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  hideLayerPanel() {
    const panel = document.getElementById("layer-properties-panel");
    if (panel) {
      panel.style.display = "none";
    }
    this.currentLayerNodeId = null;
    this.showAdditionalParams = false;
  }
}

export default LayerPanelManager;
