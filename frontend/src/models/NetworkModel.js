import apiClient from '../api/ApiClient.js';
import LayerModel from './LayerModel.js';
import GroupModel from './GroupModel.js';
/**
 * Represents the neural network model, including layers, connections, and groups.
 * Handles network initialization, layer management, and API communication.
 * @class
 */
class NetworkModel {
  constructor() {
    this.id = null;
    this.layers = []; 
    this.connections = []; 
    this.layerTypes = [];
    this.nextNodeId = 1;
    this.groups = []
  }
  
  async initialize() {
    try {
      this.id = await apiClient.createNetwork();
      this.layerTypes = await apiClient.getLayerTypes();
      //this.layerTypes = layerTypes;
      return true;
      
    } catch (error) {
      console.error('Failed to initialize network:', error);
      return false;
    }
  }
  async addLayer(type, params, x, y) {

    const backendId = await apiClient.addLayer(this.id, type, params);
    const nodeId = this.nextNodeId++;
    const layer = new LayerModel(nodeId, backendId, type, params, x, y);
    this.layers.push(layer);
    return layer;

  }
    
  getLayerType(typeName) {
    return this.layerTypes.find(lt => lt.name === typeName) || null;
  }
  
  clear() {
    this.layers = [];
    this.connections = [];
    this.nextNodeId = 1;
  }

  addConnection(connection){
    this.connections.push(connection)
  }

  getConnectionId(){
    return this.connections.length
  }

  
  removeLayer(layerId) {
    const layerIndex = this.layers.findIndex(layer => layer.id == layerId);    
    this.layers.splice(layerIndex, 1);
  }

  getLayerById(id) {
    return this.layers.find(layer => layer.id === id);
  }

  reset(){
    this.layers = []; 
    this.connections = []; 
    this.nextNodeId = 1;
    this.groups = []
  }
}

export default new NetworkModel();