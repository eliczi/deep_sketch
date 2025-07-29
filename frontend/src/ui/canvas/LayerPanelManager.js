import DomUtils from "../../utils/DomUtils.js";
import Tracker from "../../utils/Tracker.js";
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
    //if node is of type custom layer, add button to load an image and custom parameters
    if (layer.type === "CustomLayer") {
      const customControlsContainer = DomUtils.createElementWithClass("div", "custom-controls-container");
      
      const loadImageButton = DomUtils.createElementWithClass("button", "load-image-button");
      loadImageButton.textContent = "Load Image";
      loadImageButton.addEventListener("click", () => {
        this.loadImage();
      });
      customControlsContainer.appendChild(loadImageButton);

      const addParamButton = DomUtils.createElementWithClass("button", "add-param-button");
      addParamButton.textContent = "Add Custom Parameter";
      addParamButton.addEventListener("click", () => {
        this.showAddParameterDialog();
      });
      customControlsContainer.appendChild(addParamButton);

      basicParamsContainer.appendChild(customControlsContainer);
    }   

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

    // --- Handle custom parameters for CustomLayer ---
    if (layer.type === "CustomLayer" && typeof value === 'object' && value.value !== undefined) {
      const customParam = value;
      const paramType = customParam.type || "text";

      if (paramType === "boolean") {
        input = document.createElement("input");
        input.type = "checkbox";
        input.checked = customParam.value;
      } else if (paramType === "number") {
        input = document.createElement("input");
        input.type = "number";
        input.step = "any";
        input.value = customParam.value;
      } else {
        input = document.createElement("input");
        input.type = "text";
        input.value = customParam.value;
      }
      input.id = `param-${key}-${this.currentLayerNodeId}`;

      input.addEventListener("change", (e) => {
        let newValue = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        if (paramType === "number") {
          newValue = parseFloat(newValue) || 0;
        }
        layer.update_custom_parameter(key, newValue);
        Tracker.trackEvent("layer", "update-custom-parameter", {
          nodeId: this.currentLayerNodeId, 
          parameter: key, 
          value: newValue
        });
      });

      // Add remove button for custom parameters
    const removeButton = DomUtils.createElementWithClass("button", "remove-param-button");
    removeButton.textContent = "×";
    removeButton.title = "Remove parameter";
    removeButton.addEventListener("click", () => {
      layer.remove_custom_parameter(key);
      this.showLayerPanel(this.currentLayerNodeId);
      Tracker.trackEvent("layer", "remove-custom-parameter", {
        nodeId: this.currentLayerNodeId, 
        parameter: key
      });
    });
    paramContainer.appendChild(removeButton);
  }
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
        Tracker.trackEvent("layer", "update-parameter", {nodeId: this.currentLayerNodeId, layerType: layer.type, parameter: key, value: e.target.value});
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

  loadImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');          
          canvas.width = 64;
          canvas.height = 64;
          const scale = Math.min(64 / image.width, 64 / image.height);
          const scaledWidth = image.width * scale;
          const scaledHeight = image.height * scale;
          const x = (64 - scaledWidth) / 2;
          const y = (64 - scaledHeight) / 2;
          ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
          const resizedImage = canvas.toDataURL();
          const layer = this.networkModel.getLayerById(this.currentLayerNodeId);
          const layerElement = layer.getElement();
          layerElement.style.backgroundImage = `url(${resizedImage})`;
          layerElement.style.backgroundSize = "contain";
          layerElement.style.backgroundPosition = "center";
          layerElement.style.backgroundRepeat = "no-repeat";
          layerElement.style.backgroundColor = "transparent";

        };    
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  showAddParameterDialog() {
    const dialog = DomUtils.createElementWithClass("div", "parameter-dialog");
    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>Add Custom Parameter</h3>
        <div class="form-group">
          <label for="param-name">Parameter Name:</label>
          <input type="text" id="param-name" placeholder="e.g., learning_rate">
        </div>
        <div class="form-group">
          <label for="param-value">Default Value:</label>
          <input type="text" id="param-value" placeholder="e.g., 0.001">
        </div>
        <div class="form-group">
          <label for="param-type">Parameter Type:</label>
          <select id="param-type">
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>
        <div class="form-group">
          <label for="param-description">Description:</label>
          <textarea id="param-description" placeholder="Optional description"></textarea>
        </div>
        <div class="dialog-buttons">
          <button class="btn-cancel">Cancel</button>
          <button class="btn-add">Add Parameter</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    const addButton = dialog.querySelector('.btn-add');
    const cancelButton = dialog.querySelector('.btn-cancel');

    addButton.addEventListener('click', () => {
      const name = dialog.querySelector('#param-name').value.trim();
      const value = dialog.querySelector('#param-value').value.trim();
      const type = dialog.querySelector('#param-type').value;
      const description = dialog.querySelector('#param-description').value.trim();

      if (name && value !== '') {
        const parameter = {
          name: name,
          default: value,
          is_basic: true,
          type: type
        }
        this.networkModel.appendLayerType(parameter);
        this.addCustomParameter(name, value, type, description);
        
        document.body.removeChild(dialog);
      } else {
        alert('Please provide a name and value for the parameter.');
      }
    });

    cancelButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }

  addCustomParameter(name, value, type, description) {
    const layer = this.networkModel.getLayerById(this.currentLayerNodeId);
    if (layer && layer.type === "CustomLayer") {
      let convertedValue = value;
      if (type === "number") {
        convertedValue = parseFloat(value) || 0;
      } else if (type === "boolean") {
        convertedValue = value.toLowerCase() === "true";
      }

      layer.addCustomParameter(name, convertedValue, type, description);
      this.showLayerPanel(this.currentLayerNodeId);
      
      Tracker.trackEvent("layer", "add-custom-parameter", {
        nodeId: this.currentLayerNodeId, 
        parameterName: name, 
        parameterType: type
      });
    }
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
    
    // Handle custom parameters for CustomLayer
    if (layer.type === "CustomLayer" && typeof value === 'object' && value.value !== undefined) {
      const customParam = value;
      const paramType = customParam.type || "text";
      
      if (paramType === "boolean") {
        input = document.createElement("input");
        input.type = "checkbox";
        input.checked = customParam.value;
      } else if (paramType === "number") {
        input = document.createElement("input");
        input.type = "number";
        input.step = "any";
      } else {
        input = document.createElement("input");
        input.type = "text";
      }
      
      input.value = customParam.value;
      input.id = `param-${key}-${this.currentLayerNodeId}`;

      input.addEventListener("change", (e) => {
        let newValue = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        if (paramType === "number") {
          newValue = parseFloat(newValue) || 0;
        }
        
        layer.update_custom_parameter(key, newValue);
        Tracker.trackEvent("layer", "update-custom-parameter", {
          nodeId: this.currentLayerNodeId, 
          parameter: key, 
          value: newValue
        });
      });

      const removeButton = DomUtils.createElementWithClass("button", "remove-param-button");
      removeButton.textContent = "×";
      removeButton.title = "Remove parameter";
      removeButton.addEventListener("click", () => {
        layer.remove_custom_parameter(key);
        this.showLayerPanel(this.currentLayerNodeId);
        Tracker.trackEvent("layer", "remove-custom-parameter", {
          nodeId: this.currentLayerNodeId, 
          parameter: key
        });
      });
      paramContainer.appendChild(removeButton);

    } else if (
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
        Tracker.trackEvent("layer", "update-parameter", {nodeId: this.currentLayerNodeId, layerType: layer.type, parameter: key, value: e.target.value});
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

    if (layer.type === "CustomLayer" && typeof value === 'object' && value.description) {
      const helpText = DomUtils.createElementWithClass("div", "param-help");
      helpText.textContent = value.description;
      paramContainer.appendChild(helpText);
    } else if (paramDef && paramDef.description) {
      const helpText = DomUtils.createElementWithClass("div", "param-help");
      helpText.textContent = paramDef.description;
      paramContainer.appendChild(helpText);
    }

    return paramContainer;
  }
}

export default LayerPanelManager;
