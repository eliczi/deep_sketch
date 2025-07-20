import NetworkModel from "../../models/NetworkModel.js";
import DomUtils from "../../utils/DomUtils.js";
import GroupManager from "../canvas/GroupManager.js"
import { GeometryUtils } from "./GeometryUtils.js";
import { DraggableWindow } from "./DraggableWindow.js";
import { ConnectionDrawer } from "./ConnectionDrawer.js";
import { ConnectionWindow } from "./ConnectionWindow.js";
import { ConnectionManager } from "./ConnectionManager.js";

/**
 * Handles the visualization and updating of connections between nodes and groups on the canvas.
 * Implements singleton pattern for global access.
 * @class
 */
class ConnectionVisualizer {
  static instance = null;
  
  static getInstance() {
    if (!ConnectionVisualizer.instance) {
      ConnectionVisualizer.instance = new ConnectionVisualizer();
    }
    return ConnectionVisualizer.instance;
  }

  constructor() {
    this.svgContainer = document.getElementById('connections');
    this.drawer = new ConnectionDrawer(this.svgContainer);
    this.window = new ConnectionWindow();
    this.manager = new ConnectionManager(this.drawer);
  }

  // Public API methods that delegate to the appropriate modules
  createTemporaryLine(scale) {
    return this.drawer.createTemporaryLine(scale);
  }
  
  updateTemporaryLine(path, startX, startY, cursorX, cursorY, connectionPointType) {
    this.drawer.updateTemporaryLine(path, startX, startY, cursorX, cursorY, connectionPointType);
  }
  
  removeTemporaryLine(line) {
    this.drawer.removeTemporaryLine(line);
  }
  
  createPermanentConnection(sourceId, targetId) {
    const element = this.drawer.createPermanentConnection(
      sourceId, targetId, 
      (sId, tId, event) => this.showConnectionWindow(sId, tId, event)
    );
    this.manager.updateConnection(element, sourceId, targetId);
    return element;
  }
  
  updateConnection(connectionElement, sourceId, targetId) {
    this.manager.updateConnection(connectionElement, sourceId, targetId);
  }
  
  updateConnectionsForNode(nodeId) {
    this.manager.updateConnectionsForNode(nodeId);
  }
  
  updateAllConnections() {
    this.manager.updateAllConnections();
  }
  
  removeConnectionsForNode(nodeId) {
    this.manager.removeConnectionsForNode(nodeId);
  }
  
  removeAllConnections() {
    this.manager.removeAllConnections();
  }
  
  showConnectionWindow(sourceId, targetId, event) {
    this.window.show(sourceId, targetId, event);
  }
  
  closeConnectionWindow() {
    this.window.close();
  }
}

export default ConnectionVisualizer;
