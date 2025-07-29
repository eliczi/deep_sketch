import LayerPanel from "./LayerPanel.js";
import Tracker from "../utils/Tracker.js";
import Canvas from "./canvas/Canvas.js";
import PyTorchCodeGenerator from "../utils/PyTorchCodeGenerator.js";
import NetworkModel from "../models/NetworkModel.js";
class UIManager {
  constructor() {
    this.elements = {
      layerTypesContainer: document.getElementById("layer-types-container"),
      drawingArea: document.getElementById("drawing-area"),
      clearBtn: document.getElementById("clear-btn"),
      groupBtn: document.getElementById("group-btn"),
      saveBtn: document.getElementById("save-btn"),
      loadBtn: document.getElementById("load-btn"),
      generateBtn: document.getElementById("generate-btn"),
    };

    this.layerPanel = new LayerPanel(this.elements.layerTypesContainer);
    this.canvas = new Canvas(this.elements.drawingArea, this.layerPanel);

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.elements.clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear the canvas?")) {
        this.canvas.clearCanvas();
      }
    });
    this.elements.groupBtn.addEventListener("click", () => {
      this.handleGroupButtonClick();
    });
    this.elements.saveBtn.addEventListener("click", () => {
      this.handleSaveButtonClick();
    });
    this.elements.loadBtn.addEventListener("click", () => {
      this.handleLoadButtonClick();
    });
    this.elements.generateBtn.addEventListener("click", () => {
      this.handleGenerateButtonClick();
    });
  }

  handleGroupButtonClick() {
    const group = this.canvas.createGroup();

    if (!group) {
      alert("Please select at least two nodes to create a group.");
    }
  }

  handleSaveButtonClick() {
    const networkState = this.canvas.getNetworkState();
    Tracker.trackEvent("canvas", "save-network", {networkState: networkState});
    const jsonString = JSON.stringify(networkState, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "network_state.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  handleLoadButtonClick() {
    this.canvas.handleLoadButtonClick();
  }

  handleGenerateButtonClick() {
    const codeGenerator = new PyTorchCodeGenerator(NetworkModel);
    const code = codeGenerator.generateCode();
    // Create and download the file directly
    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.download = "network_code.py";
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
}

export default UIManager;
