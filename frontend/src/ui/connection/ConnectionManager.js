import { GeometryUtils } from "./GeometryUtils.js";
import DomUtils from "../../utils/DomUtils.js";
import NetworkModel from "../../models/NetworkModel.js";
/**
 * Manages the creation and management of connection lines between nodes on the canvas.
 * Handles user interaction for drawing and editing connections.
 * @class
 */
export class ConnectionManager {
    constructor(drawer) {
      this.drawer = drawer;
      this.networkModel = NetworkModel
      this.svgContainer = drawer.svgContainer;
    }
  
    findSourceAndTargetNodes(sourceId, targetId) {
      
      const targetElement = document.querySelector(`.layer-node[data-id="${targetId}"]`);
      const targetGroupId = targetElement?.dataset?.groupId;
      const targetGroupElement = targetGroupId 
        ? document.querySelector(`.layer-group[data-id="${targetGroupId}"]`) 
        : null;
      
      targetId = String(targetId);
      sourceId = String(sourceId);
      let isTargetGroup = targetId.startsWith('group-');
      
      
      if (isTargetGroup) {
        const group = document.querySelector(`.layer-group[data-id="${targetId}"]`);
        if (group && group.dataset.expanded === 'true') {
          return null; 
        }
      }
      
      
      if (targetGroupElement && targetGroupElement.dataset.expanded === 'false') {
        targetId = targetGroupElement.dataset.id;
        isTargetGroup = true;
      }
      
      
      let isSourceGroup = sourceId.startsWith('group-');
      const sourceElement = document.querySelector(`.layer-node[data-id="${sourceId}"]`);
      const sourceGroupId = sourceElement?.dataset?.groupId;
      const sourceGroupElement = sourceGroupId
        ? document.querySelector(`.layer-group[data-id="${sourceGroupId}"]`)
        : null;

      
       
      if (sourceGroupElement && sourceGroupElement.dataset.expanded === 'false') {
        sourceId = sourceGroupElement.dataset.id;
        isSourceGroup = true;
      }
      
      
      if (sourceGroupId && targetGroupId && sourceGroupId === targetGroupId) {
        const groupElement = document.querySelector(`.layer-group[data-id="${sourceGroupId}"]`);
        if (groupElement && groupElement.dataset.expanded === 'false') {
          return { inSameCollapsedGroup: true };
        }
      }

      
      const sourceSelector = isSourceGroup 
        ? `.layer-group[data-id="${sourceId}"]` 
        : `.layer-node[data-id="${sourceId}"]`;
      
      const targetSelector = isTargetGroup 
        ? `.layer-group[data-id="${targetId}"]` 
        : `.layer-node[data-id="${targetId}"]`;
      
      const sourceNode = document.querySelector(sourceSelector);
      const targetNode = document.querySelector(targetSelector);
      
      if (!sourceNode || !targetNode) {
        return { missingNodes: true, sourceId, targetId };
      }
      
      const sourcePoint = sourceNode._outputPoint;
      const targetPoint = targetNode._inputPoint;
      
      if (!sourcePoint || !targetPoint) {
        return { missingPoints: true, sourceId, targetId };
      }
      
      return { sourceNode, targetNode, sourcePoint, targetPoint, sourceId, targetId };
    }
  
    updateConnection(connectionElement, sourceId, targetId) {
      
      if (!connectionElement) return;
      
      const result = this.findSourceAndTargetNodes(sourceId, targetId);
      
      if (!result) {
        const group = document.querySelector(`.layer-group[data-id="${targetId}"]`);
        if (group && group.dataset.expanded === 'true') {
          const layers = group.querySelectorAll('.layer-node');
          layers.forEach(layer => {
            this.updateConnection(connectionElement, sourceId, layer.dataset.id);
          });
          return;
        }
      }
      
      if (result?.inSameCollapsedGroup) {
        connectionElement.style.display = 'none';
        return;
      }
      
      if (result?.missingNodes || result?.missingPoints) {
        console.warn(`Problem with connection: ${result.sourceId} -> ${result.targetId}`);
        return;
      }
      
      
      connectionElement.style.display = '';
      
      
      const sourceCoords = GeometryUtils.calculatePointCoordinates(
        result.sourcePoint, this.svgContainer);
      const targetCoords = GeometryUtils.calculatePointCoordinates(
        result.targetPoint, this.svgContainer);
      
      
      const pathData = GeometryUtils.calculatePathData(
        sourceCoords.x, sourceCoords.y, targetCoords.x, targetCoords.y);
      
      this.drawer.updateConnectionPath(connectionElement, pathData);
    }
  
    updateConnectionsForNode(nodeId) {
      this.networkModel.connections.forEach(conn => {
        if (conn.sourceId === nodeId || conn.targetId === nodeId) {
          this.updateConnection(conn.connectionElement, conn.sourceId, conn.targetId);
        }
      });
    }
  
    updateAllConnections() {
      if (!this.networkModel.connections || this.networkModel.connections.length === 0) {
        return; 
      }
      const currentScale = DomUtils.getScale();
      
      this.networkModel.connections.forEach(conn => {
        if (conn.connectionElement) {
          this.updateConnection(conn.connectionElement, conn.sourceId, conn.targetId);
        }
      });
      
      this.drawer.updateConnectionWidths(currentScale);
    }
  
    removeConnectionsForNode(nodeId) {
      const connectionsToRemove = this.networkModel.connections.filter(conn => 
        conn.sourceId == nodeId || conn.targetId == nodeId
      );
      
      connectionsToRemove.forEach(conn => {
        if (conn.connectionElement && conn.connectionElement.parentNode) {
          conn.connectionElement.parentNode.removeChild(conn.connectionElement);
        }
      });
      
      this.networkModel.connections = this.networkModel.connections.filter(conn => 
        conn.sourceId != nodeId && conn.targetId != nodeId
      );
    }
  
    removeAllConnections() {
      this.networkModel.connections.forEach(conn => {
        if (conn.connectionElement && conn.connectionElement.parentNode) {
          conn.connectionElement.parentNode.removeChild(conn.connectionElement);
        }
      });
    }
  }