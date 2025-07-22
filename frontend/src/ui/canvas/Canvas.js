import NetworkModel from "../../models/NetworkModel.js";
import LayerFactory from "../LayerFactory.js";
import CanvasEventHandler from "./CanvasEventHandler.js";
import SelectionManager from "./SelectionManager.js";
import LayerPanelManager from "./LayerPanelManager.js";
import PreviewManager from "./PreviewManager.js";
import LayerManager from "./LayerManager.js";
import CanvasUtils from "./CanvasUtils.js";
import ConnectionVisualizer from "../connection/ConnectionVisualizer.js";
import GroupManager from "./GroupManager.js";
import DomUtils from "../../utils/DomUtils.js";
import ConnectionModel from "../../models/ConnectionModel.js";

import ContextMenu from "./ContextMenu.js";
/**
 * Manages the main drawing canvas, including layers, groups, panning, zoom, and user interactions.
 * Handles initialization of all canvas-related managers and UI updates.
 * @class
 */
class Canvas {
  constructor(canvasElement, layerPanel) {
    this.canvas = canvasElement;
    this.layerPanel = layerPanel;

    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this._panningStarted = true

    this.scale = 1.0;
    this.minScale = 0.2;
    this.maxScale = 2.0;
    this.zoomStep = 0.1;
    //right mouse button panning
    this.isMouseDown = false;
    this.lastX = 0;
    this.lastY = 0;

    this.initializeStyles();
    this.initializePanningEvents();

    this.canvasUtils = new CanvasUtils(this.canvas, this);
    this.selectionManager = new SelectionManager(this.canvas, this.canvasUtils);
    this.layerPanelManager = new LayerPanelManager(NetworkModel);
    this.previewManager = new PreviewManager(this);
    this.layerManager = new LayerManager(
      this.canvas,
      NetworkModel,
      LayerFactory,
      this,
    );
    this.groupManager = new GroupManager(
      this.canvas,
      this.selectionManager,
      this.layerManager,
      this,
    );
    this.contextMenu = new ContextMenu(this);

    this.eventHandler = new CanvasEventHandler(
      this.canvas,
      this.selectionManager,
      this.layerPanelManager,
      this.previewManager,
      this.layerManager,
      this.canvasUtils,
      this.layerPanel,
      this.groupManager,
      this,
    );

    this.eventHandler.initializeEventHandlers();
    console.log(this.canvas.style)
      // Create grid canvas
    this.gridCanvas = document.createElement("canvas");
    this.gridCanvas.style.position = "absolute";
    this.gridCanvas.style.top = "0";
    this.gridCanvas.style.left = "0";
    this.gridCanvas.style.pointerEvents = "none";
    console.log("Grid canvas created with dimensions:", this.canvas.width, this.canvas.height);
    this.gridCanvas.width = this.canvas.width;
    this.gridCanvas.height = this.canvas.height;
    this.canvas.parentNode.insertBefore(this.gridCanvas, this.canvas);

    this.drawGrid();
  }

  drawGrid(gridSize = 32) {
    
    const ctx = this.gridCanvas.getContext("2d");
    ctx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);

    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    for (let x = 0; x < this.gridCanvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.gridCanvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.gridCanvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.gridCanvas.width, y);
      ctx.stroke();
    }
  }

  initializeStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .selection-area {
          position: absolute;
          border: 1px dashed rgb(0, 0, 0);
          background-color:rgba(236, 106, 86, 0.22);
          pointer-events: none;
          z-index: 1000;
        }
        

        }        
      `;
    document.head.appendChild(style);

    this.zoomIndicator = document.createElement("div");
    this.zoomIndicator.className = "zoom-indicator";
    this.zoomIndicator.textContent = "100%";
    document.body.appendChild(this.zoomIndicator);

    this.panXIndicator = document.createElement("div");
    this.panXIndicator.className = "panx-indicator";
    this.panXIndicator.textContent = "0";
    document.body.appendChild(this.panXIndicator);

    this.panYIndicator = document.createElement("div");
    this.panYIndicator.className = "pany-indicator";
    this.panYIndicator.textContent = "0";
    document.body.appendChild(this.panYIndicator);
    
  }

  initializePanningEvents() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));

    this.canvas.addEventListener("wheel", this.handleWheel.bind(this), {
      passive: false,
    });

    //event responsible for panning with right mouse button
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.buttons === 2) {
        this.isMouseDown = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY; 
        this._panningStarted = false;
        this.contextMenu.hideContextMenu();
        
      }
    });
    this.canvas.addEventListener("mousemove", (e) => {
      if (this.isMouseDown && e.buttons === 2) {
        if (e.clientX !== this.lastX || e.clientY !== this.lastY) {
          this.isPanning = true;
          this._panningStarted = true;
        } 
        //this.isPanning = true
        this.canvas.style.cursor = "move";
        e.preventDefault();
        const deltaX = e.clientX - this.lastX; 
        const deltaY = e.clientY - this.lastY; 
        this.panX += deltaX;
        this.panY += deltaY;
        this.updateElementPositions();
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (e.buttons === 2) { 
        isMouseDown = false; 
        setTimeout(() => { this.isPanning = false; }, 0);
      }
      this.canvas.style.cursor = "default";
    });
  }

  handleWheel(e) {
    console.log(this.canvas.style)
    e.preventDefault();
    if (e.ctrlKey) {
      let zoomAmount = -e.deltaY * 0.005;
      if (Math.abs(e.deltaY) == 100){
        zoomAmount *= 0.05; 
      }
      this.zoom(zoomAmount, e.clientX, e.clientY);
    } else {
      
      // if (Math.abs(e.deltaY) == 100){
      //   zoomAmount *= 0.05; 
      // }
      this.panX -= e.deltaX;
      this.panY -= e.deltaY;
      this.updateElementPositions();
    }
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

      const currentPanX = this.panX || 0;
      const currentPanY = this.panY || 0;

      const worldX = (zoomPointX - currentPanX) / this.scale;
      const worldY = (zoomPointY - currentPanY) / this.scale;
      this.scale = newScale;

      this.panX = zoomPointX - worldX * this.scale;
      this.panY = zoomPointY - worldY * this.scale;
      this.updateElementZoom();
    }
  }

  handleKeyDown(e) {
    if (
      !(e.target instanceof HTMLInputElement) &&
      !(e.target instanceof HTMLTextAreaElement) &&
      !(e.target instanceof HTMLSelectElement)
    ) {
      const panSpeed = 20;
      switch (e.key) {
        case "ArrowLeft":
          this.offsetX += panSpeed;
          this.updateElementPositions();
          e.preventDefault();
          break;
        case "ArrowRight":
          this.offsetX -= panSpeed;
          this.updateElementPositions();
          e.preventDefault();
          break;
        case "ArrowUp":
          this.offsetY += panSpeed;
          this.updateElementPositions();
          e.preventDefault();
          break;
        case "ArrowDown":
          this.offsetY -= panSpeed;
          this.updateElementPositions();
          e.preventDefault();
          break;
        case "Home":
          this.resetView();
          e.preventDefault();
          break;
      }
    }
  }

  updateElementZoom() {
    if (this.zoomIndicator) {
      this.zoomIndicator.textContent = `${Math.round(this.scale * 100)}%`;
      this.panXIndicator.textContent = `${Math.round(this.panX)}`;
      this.panYIndicator.textContent = `${Math.round(this.panY)}`;
    }
    const nodes = this.canvas.querySelectorAll(
      ".layer-node:not([data-group-id])",
    );
    nodes.forEach((node) => {
      if (!node.dataset.originalX) {
        node.dataset.originalX = parseFloat(node.style.left);
        node.dataset.originalY = parseFloat(node.style.top);
      }
      if (!node.dataset.attachedTo) {
        const originalX = parseFloat(node.dataset.originalX);
        const originalY = parseFloat(node.dataset.originalY);

        const transformedX = originalX * this.scale + this.panX;
        const transformedY = originalY * this.scale + this.panY;

        const attachedFunctionLayers = document.querySelectorAll(
          `.layer-node[data-attached-to="${node.dataset.id}"]`,
        );
        attachedFunctionLayers.forEach((functionLayer) => {
          const functionLeft =
            transformedX + node.offsetWidth * this.scale - 22 * this.scale;
          const functionTop = transformedY - 22 * this.scale;

          functionLayer.style.transformOrigin = "0 0";
          functionLayer.style.transform = `scale(${this.scale})`;

          functionLayer.style.left = `${functionLeft}px`;
          functionLayer.style.top = `${functionTop}px`;
        });

        node.style.transformOrigin = "0 0";
        node.style.transform = `scale(${this.scale})`;
        node.style.left = `${transformedX}px`;
        node.style.top = `${transformedY}px`;
      }
    });

    const groups = this.canvas.querySelectorAll(".layer-group");
    groups.forEach((group) => {
      const groupNodes = Array.from(group.querySelectorAll(".layer-node"));
      groupNodes.forEach((node) => {
        node.style.transform = `scale(${1})`;
      });
      if (!group.dataset.originalX) {
        group.dataset.originalX = parseFloat(group.style.left);
        group.dataset.originalY = parseFloat(group.style.top);
      }
      const originalX = parseFloat(group.dataset.originalX);
      const originalY = parseFloat(group.dataset.originalY);
      const transformedX = originalX * this.scale + this.panX;
      const transformedY = originalY * this.scale + this.panY;

      group.style.transformOrigin = "0 0";
      group.style.transform = `scale(${this.scale})`;
      group.style.left = `${transformedX}px`;
      group.style.top = `${transformedY}px`;
    });

    if (ConnectionVisualizer.getInstance) {
      ConnectionVisualizer.getInstance().updateAllConnections();
    }
  }

  updateElementPositions() {
    const nodes = DomUtils.getNodes(this.canvas);
    this.panXIndicator.textContent = `${Math.round(this.panX)}`;
    this.panYIndicator.textContent = `${Math.round(this.panY)}`;

    nodes.forEach((node) => {
      if (node.dataset.groupId) return;
      if (!node.dataset.originalX) {
        node.dataset.originalX = parseFloat(node.style.left);
        node.dataset.originalY = parseFloat(node.style.top);
      }
      if (!node.dataset.attachedTo) {
        const originalX = parseFloat(node.dataset.originalX);
        const originalY = parseFloat(node.dataset.originalY);

        const transformedX = originalX * this.scale + this.panX;
        const transformedY = originalY * this.scale + this.panY;
        node.style.transformOrigin = "0 0";
        node.style.transform = `scale(${this.scale})`;
        node.style.left = `${transformedX}px`;
        node.style.top = `${transformedY}px`;

        const attachedFunctionLayers = document.querySelectorAll(
          `.layer-node[data-attached-to="${node.dataset.id}"]`,
        );
        attachedFunctionLayers.forEach((functionLayer) => {
          const functionLeft =
            transformedX + node.offsetWidth * this.scale - 22 * this.scale;
          const functionTop = transformedY - 22 * this.scale;

          functionLayer.style.transformOrigin = "0 0";
          functionLayer.style.transform = `scale(${this.scale})`;

          functionLayer.style.left = `${functionLeft}px`;
          functionLayer.style.top = `${functionTop}px`;
        });
      }
    });

    const groups = this.canvas.querySelectorAll(".layer-group");
    groups.forEach((group) => {
      if (!group.dataset.originalX) {
        group.dataset.originalX = parseFloat(group.style.left);
        group.dataset.originalY = parseFloat(group.style.top);
      }
      const originalX = parseFloat(group.dataset.originalX);
      const originalY = parseFloat(group.dataset.originalY);
      const transformedX = originalX * this.scale + this.panX;
      const transformedY = originalY * this.scale + this.panY;

      group.style.transformOrigin = "0 0";
      group.style.transform = `scale(${this.scale})`;
      group.style.left = `${transformedX}px`;
      group.style.top = `${transformedY}px`;
    });

    if (ConnectionVisualizer.getInstance) {
      ConnectionVisualizer.getInstance().updateAllConnections();
    }
  }

  getAdjustedCanvasPosition(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: (clientX - rect.left) / this.scale,
      y: (clientY - rect.top) / this.scale,
    };
  }

  resetView() {
    const nodes = this.canvas.querySelectorAll(".layer-node");
    const groups = this.canvas.querySelectorAll(".layer-group");

    this.scale = 1.0;

    nodes.forEach((node) => {
      node.style.transform = "scale(1)";
      if (node.dataset.originalLeft) {
        node.style.left = `${node.dataset.originalLeft}px`;
        node.style.top = `${node.dataset.originalTop}px`;
      }
    });

    groups.forEach((group) => {
      group.style.transform = "scale(1)";
      if (group.dataset.originalLeft) {
        group.style.left = `${group.dataset.originalLeft}px`;
        group.style.top = `${group.dataset.originalTop}px`;
      }
    });

    this.offsetX = 0;
    this.offsetY = 0;

    if (ConnectionVisualizer.getInstance) {
      ConnectionVisualizer.getInstance().updateAllConnections();
    }

    if (this.zoomIndicator) {
      this.zoomIndicator.textContent = "100%";
    }
  }

  clearCanvas() {
    this.layerManager.clearCanvas();
    this.selectionManager.clearSelection();

    const groups = this.canvas.querySelectorAll(".layer-group");
    groups.forEach((group) => group.remove());

    this.resetView();
  }

  createGroup() {
    return this.groupManager.createGroup();
  }

  getNetworkState() {
    const layers = Array.from(this.canvas.querySelectorAll(".layer-node")).map(
      (node) => {
        return {
          id: node.dataset.id,
          type: node.dataset.type,
          x: parseInt(node.dataset.originalX),
          y: parseInt(node.dataset.originalY),
          properties: this.getNodeProperties(node),
          groupId: node.dataset.groupId || null,
        };
      },
    );
    console.log(layers);

    const connections = NetworkModel.connections.map((conn) => {
      return {
        id: conn.id,
        sourceId: conn.sourceId,
        targetId: conn.targetId,
      };
    });

    const groups = this.groupManager.groups.map((group) => {
      const groupElement = group.element;
      return {
        id: group.id,
        name: groupElement.dataset.name || `Group`,
        x: parseInt(groupElement.style.left),
        y: parseInt(groupElement.style.top),
        width: parseInt(groupElement.style.width),
        height: parseInt(groupElement.style.height),
        expanded: group.expanded,
        nodeIds: Array.from(groupElement.querySelectorAll(".layer-node")).map(
          (node) => node.dataset.id,
        ),
      };
    });

    return {
      layers,
      connections,
      groups,
    };
  }

  getNodeProperties(node) {
    const properties = {};

    for (const key in node.dataset) {
      if (["id", "groupId", "originalX", "originalY"].includes(key)) continue;
      properties[key] = node.dataset[key];
    }
    return properties;
  }

  deleteGroup(groupId) {
    this.groupManager.deleteGroup(groupId);
  }

  handleLoadButtonClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", async (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            await this.loadNetworkState(jsonData);
          } catch (error) {
            console.error("Error parsing network file:", error);
            alert("Failed to parse network file: " + error.message);
          }
        };

        reader.readAsText(file);
      } catch (error) {
        console.error("Error loading network:", error);
        alert("Failed to load network: " + error.message);
      }
    });

    input.click();
  }

  /**
   * Loads a network state from parsed JSON data
   * @param {Object} networkState - The network state object
   * @returns {Promise<boolean>} - True if loaded successfully
   */
  async loadNetworkState(networkState) {
    if (!networkState || typeof networkState !== "object") {
      throw new Error("Invalid network state data");
    }
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;

    try {
      this.clearNetwork();

      const idMapping = {};

      if (networkState.layers && Array.isArray(networkState.layers)) {
        for (const layerData of networkState.layers) {
          const layer = await this.createLayerFromData(layerData);
          if (layer) {
            idMapping[layerData.id] = layer.id;
          }
        }
      }

      if (networkState.groups && Array.isArray(networkState.groups)) {
        for (const groupData of networkState.groups) {
          await this.createGroupFromData(groupData, idMapping);
        }
      }

      if (networkState.connections && Array.isArray(networkState.connections)) {
        for (const connectionData of networkState.connections) {
          const sourceId =
            idMapping[connectionData.sourceId] || connectionData.sourceId;
          const targetId =
            idMapping[connectionData.targetId] || connectionData.targetId;

          await this.createConnectionFromData(sourceId, targetId);
        }
      }

      return true;
    } catch (error) {
      console.error("Error loading network state:", error);
      throw error;
    }
  }

  /**
   * Clears the current network
   */
  clearNetwork() {
    const nodes = Array.from(this.canvas.querySelectorAll(".layer-node"));
    nodes.forEach((node) => node.remove());

    const groups = Array.from(this.canvas.querySelectorAll(".layer-group"));
    groups.forEach((group) => group.remove());

    const visualizer = ConnectionVisualizer.getInstance();
    if (visualizer) {
      visualizer.removeAllConnections();
    }

    NetworkModel.reset();

    this.groupManager.groups = [];
    this.groupManager.groupCounter = 0;
    this.groupManager.selectedGroup = null;
  }

  async createLayerFromData(layerData) {
    try {
      const layer = await this.layerManager.createLayer(
        layerData.type,
        layerData.x,
        layerData.y,
        this.scale || 1,
      );

      if (!layer) return null;

      const element = layer.getElement();

      if (layerData.properties) {
        for (const [key, value] of Object.entries(layerData.properties)) {
          element.dataset[key] = value;
        }
      }

      return layer;
    } catch (error) {
      console.error("Error creating layer:", error);
      return null;
    }
  }

  /**
   * Creates a group from saved data
   * @param {Object} groupData - The group data object
   * @param {Object} idMapping - Mapping from old IDs to new IDs
   * @returns {Promise<HTMLElement>} - The created group element
   */
  async createGroupFromData(groupData, idMapping) {
    try {
      this.selectionManager.clearSelection();

      const nodeIds = groupData.nodeIds || [];
      for (const oldId of nodeIds) {
        const newId = idMapping[oldId];
        if (newId) {
          const node = document.querySelector(
            `.layer-node[data-id="${newId}"]`,
          );
          if (node) {
            this.selectionManager.addNodeToSelection(node.dataset.id);
          }
        }
      }

      const groupElement = this.createGroup();

      if (!groupElement) return null;

      groupElement.dataset.name = groupData.name || "Group";
      const titleElement = groupElement.querySelector(".group-title");
      if (titleElement) {
        titleElement.textContent = groupData.name || "Group";
      }

      groupElement.style.left = `${groupData.x}px`;
      groupElement.style.top = `${groupData.y}px`;

      if (groupData.width) groupElement.style.width = `${groupData.width}px`;
      if (groupData.height) groupElement.style.height = `${groupData.height}px`;

      const group = this.groupManager.groups.find(
        (g) => g.element === groupElement,
      );
      if (group) {
        if (groupData.expanded === false) {
          this.groupManager.toggleGroup(group.id);
        }
      }

      return groupElement;
    } catch (error) {
      console.error("Error creating group:", error);
      return null;
    }
  }

  /**
   * Creates a connection from saved data
   * @param {string} sourceId - The source node ID
   * @param {string} targetId - The target node ID
   * @returns {Promise<Object>} - The created connection
   */
  async createConnectionFromData(sourceId, targetId) {
    try {
      const sourceNode = document.querySelector(
        `.layer-node[data-id="${sourceId}"]`,
      );
      const targetNode =
        document.querySelector(`.layer-node[data-id="${targetId}"]`) ||
        document.querySelector(`.layer-group[data-id="${targetId}"]`);

      if (!sourceNode || !targetNode) {
        console.warn(
          `Cannot create connection: node(s) not found (${sourceId} -> ${targetId})`,
        );
        return null;
      }

      const visualizer = ConnectionVisualizer.getInstance();
      const connectionElement = visualizer.createPermanentConnection(
        String(sourceId),
        String(targetId),
      );

      if (connectionElement) {
        const id = NetworkModel.getConnectionId();
        const connection = new ConnectionModel(
          id,
          String(sourceId),
          String(targetId),
          sourceNode,
          targetNode,
          connectionElement,
        );
        NetworkModel.addConnection(connection);
      }
      if (ConnectionVisualizer.getInstance) {
        ConnectionVisualizer.getInstance().updateAllConnections();
      }

      return null;
    } catch (error) {
      console.error("Error creating connection:", error);
      return null;
    }
  }
}

export default Canvas;
