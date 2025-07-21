import DomUtils from "../../utils/DomUtils.js";

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
      parent = document.querySelector(".app-container");
      parent.appendChild(panel);
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
    // Removed this.styleLayerPanel(panel);
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
    //return value;
    if (!value) return "";
    return value
      .replace(/_/g, " ")
      // .replace(/([A-Z])/g, " $1")
      // .replace(/^\s+/, "")
      // .replace(/\s+/g, "")
      // .replace(/^./, (str) => str.toUpperCase());
  }

  formatParamName(name) {
    return name
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
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
