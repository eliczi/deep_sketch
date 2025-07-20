/**
 * Handles creation, deletion, and management of layer nodes on the canvas.
 * Interfaces with the network model and layer factory to add layers to the UI.
 * @class
 */
// import ConnectionVisualizer from '../ConnectionVisualizer.js';
import ConnectionVisualizer from '../connection/ConnectionVisualizer.js';
import LayerFactory from '../LayerFactory.js';
class LayerManager {
  constructor(canvas, networkModel, layerFactory, parent) {
    this.canvas = canvas;
    this.networkModel = networkModel;
    this.layerFactory = LayerFactory;
    this.parent = parent
  }
  
  // ===== Layer Creation/Deletion Methods =====
  
  async createLayer(layerType, x, y, scale) {
    const layerTypeDef = this.networkModel.getLayerType(layerType);
    if (!layerTypeDef) return null;

    const params = this.createDefaultParams(layerTypeDef);
    
    const layer = this.networkModel.addLayer(layerType, params, x, y);
    if (!layer) throw new Error('Failed to create layer');
    const clickHandler = (nodeId) => {
      this.canvas.dispatchEvent(new CustomEvent('node-clicked', { 
        detail: { nodeId }, 
        bubbles: true 
      }));
    };
    const nodeElement = this.layerFactory.createNodeElement(
      layer.id,
      layerType,
      x,
      y,
      clickHandler,
      layerTypeDef,
      scale,
      this.parent.panX,
      this.parent.panY
    );
    
    this.canvas.appendChild(nodeElement);
    layer.setElement(nodeElement);
    return layer;
      
    
  }
  
  createDefaultParams(layerTypeDef) {
    const params = {};
    if (layerTypeDef.params && Array.isArray(layerTypeDef.params)) {
      layerTypeDef.params.forEach(param => {
        if ('default' in param) {
          params[param.name] = param.default;
        } else if (param.type === 'number') {
          params[param.name] = 1;
        } else if (param.type === 'enum' && param.enum_values && param.enum_values.length > 0) {
          params[param.name] = param.enum_values[0];
        } else {
          params[param.name] = '';
        }
      });
    }
    return params;
  }
  
  deleteNodeById(nodeId) {
    ConnectionVisualizer.getInstance().removeConnectionsForNode(nodeId);
    const nodeElement = document.querySelector(`.layer-node[data-id="${nodeId}"]`);
    //check if something is attached to this node
    const attachedFunctionLayers = document.querySelectorAll(`.layer-node[data-attached-to="${nodeId}"]`);
    attachedFunctionLayers.forEach(functionLayer => {
      functionLayer.remove();
    });

    if (nodeElement) {
      nodeElement.remove();
    }
    this.networkModel.removeLayer(nodeId);
  }
  
  deleteSelectedNodes(selectedNodeIds) {
    selectedNodeIds.forEach(nodeId => {
      this.deleteNodeById(nodeId);
    });
  }
  
  clearCanvas() {
    const nodes = this.canvas.querySelectorAll('.layer-node');
    nodes.forEach(node => node.remove());
    ConnectionVisualizer.getInstance().removeAllConnections();
    this.networkModel.clear();
  }
}

export default LayerManager;