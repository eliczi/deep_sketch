import { DEFAULT_STYLES } from '../config.js';
import DomUtils from '../utils/DomUtils.js';
import { InputPoint, OutputPoint } from './connection/ConnectionPoint.js';
import LayerModel from '../models/LayerModel.js';
import ConnectionVisualizer from './connection/ConnectionVisualizer.js';
import SVGGenerator from './SVGGenerator.js';
import GroupManager from './canvas/GroupManager.js';

class LayerFactory {
 
  static createNodeElement(nodeId, type, x, y, clickHandler, layerTypeDef, scale, panX, panY) {
    const node = DomUtils.createElementWithClass('div', 'layer-node');
    node.classList.add(type.toLowerCase().replace('layer', '-layer'));
    node.dataset.id = nodeId;
    node.dataset.type = type;

    this._setNodePositionAndData(node, x, y, scale, panX, panY, type);
    this._populateNodeContent(node, type, layerTypeDef);
    this._attachNodeBehaviors(node, nodeId, type, clickHandler);
    
    return node;
  }

  static _setNodePositionAndData(node, x, y, scale, panX, panY, type) {
    let offsetX = 32;
    let offsetY = 32;
    if (type === 'PoolingLayer') {
      offsetX = 56;
    }
    if(type.includes("Function")){
      offsetX = 22;
      offsetY = 22;
    }

    node.dataset.originalX = x - offsetX ;
    node.dataset.originalY = y - offsetY;  
    node.style.left = `${x * scale + panX - offsetX }px`;
    node.style.top = `${y * scale + panY - offsetY }px`;
    
    node.style.transformOrigin = 'center center';
    node.style.transform = `scale(${scale})`;
  }

  static _populateNodeContent(node, type, layerTypeDef) {
    node.innerHTML = '';
    const svgContainer = DomUtils.createElementWithClass('div', 'node-svg-container');
    if (layerTypeDef.name === 'ConvolutionalLayer') {
      const svgRepresentation = SVGGenerator.createSVGRepresentation('ConvolutionalLayer');
      svgContainer.innerHTML = svgRepresentation.svg_content;
    }
    else if (layerTypeDef.name.includes('InputLayer')) {
      this._setInputLayerSVG(svgContainer, layerTypeDef);
    }
    else if (layerTypeDef && layerTypeDef.svg_representation && layerTypeDef.svg_representation.svg_content) {
      svgContainer.innerHTML = layerTypeDef.svg_representation.svg_content;
      if (type === 'PoolingLayer') {
        this._addPoolingTypeText(svgContainer, node);
      }
    }
    else {
      const textElement = document.createElement('div');
      textElement.className = 'layer-text';
      textElement.textContent = type.replace('Layer', '');
      svgContainer.appendChild(textElement);
    }

    const svgElement = svgContainer.querySelector('svg');
    if (svgElement) {
      this.setDimensions(svgElement, svgContainer, type);
    }
    node.appendChild(svgContainer);
  }

  static _setInputLayerSVG(svgContainer, layerTypeDef) {
    if (layerTypeDef && layerTypeDef.svg_representation) {
      const inputType = layerTypeDef.name.replace('InputLayer', '').toUpperCase();
      if (
        inputType &&
        inputType !== 'BASE' &&
        layerTypeDef.svg_representation.all_representations &&
        layerTypeDef.svg_representation.all_representations[inputType]
      ) {
        svgContainer.innerHTML = layerTypeDef.svg_representation.all_representations[inputType];
      } else {
        svgContainer.innerHTML = layerTypeDef.svg_representation.svg_content;
      }
    }
  }

  static _addPoolingTypeText(svgContainer, node) {
    const svgElement = svgContainer.querySelector('svg');
    if (svgElement) {
      const poolingType = node.dataset.poolingType || 'MAX';
      const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textElement.setAttribute('x', 17);
      textElement.setAttribute('y', 16);
      textElement.setAttribute('text-anchor', 'middle');
      textElement.setAttribute('dominant-baseline', 'middle');
      textElement.setAttribute('font-family', 'Arial, sans-serif');
      textElement.setAttribute('font-size', '12px');
      textElement.setAttribute('font-weight', 'bold');
      textElement.setAttribute('fill', '#333');
      textElement.textContent = poolingType;
      svgElement.appendChild(textElement);
    }
  }

  static _attachNodeBehaviors(node, nodeId, type, clickHandler) {
    if (!type.includes("Function")) {
      const inputPoint = new InputPoint(node);
      const outputPoint = new OutputPoint(node);
      node.appendChild(outputPoint.getElement());
      node._inputPoint = inputPoint;
      node._outputPoint = outputPoint;
      node.appendChild(inputPoint.getElement());
    }
    
    this.addHoverText(node, type);
    this.makeDraggable(node);
    
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      if (clickHandler) clickHandler(nodeId);
    });
  }


  static addHoverText(node, type) {
    const hoverText = DomUtils.createElementWithClass('div', 'node-hover-text');
    hoverText.textContent = type.replace('Layer', ' Layer');
    node.appendChild(hoverText);

    node.addEventListener('mouseenter', () => {
      hoverText.style.display = 'block';
    });

    node.addEventListener('mouseleave', () => {
      hoverText.style.display = 'none';
    });
  }

  static addText(node, layerTypeDef){
    const textAboveNode = DomUtils.createElementWithClass('div', 'node-text');
    textAboveNode.textContent = 'AVG';
    textAboveNode.style.position = 'absolute';
    textAboveNode.style.top = '30px'; 
    textAboveNode.style.left = '50%';
    textAboveNode.style.transform = 'translateX(-50%)'; 
    node.appendChild(textAboveNode);
  }
  
  static makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;
    let selectedNodesInfo = [];
    const visualizer = ConnectionVisualizer.getInstance();
  
    element.addEventListener('mousedown', startDrag);
    
    function getCanvasInfo(canvas) {
      const canvasRect = canvas.getBoundingClientRect();
      const zoomIndicator = document.querySelector('.zoom-indicator');
      const zoomFloat = zoomIndicator ? parseFloat(zoomIndicator.textContent) : 100;
      const scale = zoomFloat / 100;
      
      const canvasInstance = canvas.canvasInstance;
      const panX = canvasInstance?.panX || parseFloat(document.querySelector('.panx-indicator')?.textContent || 100);
      const panY = canvasInstance?.panY || parseFloat(document.querySelector('.pany-indicator')?.textContent || 100);
      
      return { canvasRect, scale, panX, panY };
    }

    function calculateWorldCoordinates(clientX, clientY, canvasRect, scale, panX, panY) {
      return {
        x: (clientX - canvasRect.left - panX) / scale,
        y: (clientY - canvasRect.top - panY) / scale
      };
    }

    function updateNodePosition(node, left, top, scale, panX, panY) {
      const transformedX = left * scale + panX;
      const transformedY = top * scale + panY;
      
      node.style.left = `${transformedX}px`;
      node.style.top = `${transformedY}px`;
      node.dataset.originalX = left;
      node.dataset.originalY = top;
    }

    function updateAttachedFunctionLayers(element, transformedX, transformedY, scale) {
      const attachedFunctionLayers = document.querySelectorAll(`.layer-node[data-attached-to="${element.dataset.id}"]`);
      attachedFunctionLayers.forEach(functionLayer => {
        let functionLeft, functionTop;
        if (functionLayer.dataset.groupId) {
          functionLeft = transformedX + element.offsetWidth - 22;
          functionTop = transformedY - 22;
        }
        else{
          functionLeft = transformedX + element.offsetWidth * scale - 22 * scale;
          functionTop = transformedY - 22 * scale;
        }
        
        functionLayer.style.left = `${functionLeft}px`;
        functionLayer.style.top = `${functionTop}px`;
        functionLayer.dataset.originalX = functionLeft;
        functionLayer.dataset.originalY = functionTop;
      });
    }

    function startDrag(e) {
      if (e.target.classList.contains('connection-point')) return;
      
      isDragging = true;
      const canvas = element.closest('.drawing-area') || element.parentElement;
      const { canvasRect, scale, panX, panY } = getCanvasInfo(canvas);
      
      const worldCoords = calculateWorldCoordinates(e.clientX, e.clientY, canvasRect, scale, panX, panY);
      const currentLeft = parseFloat(element.style.left) || 0;
      const currentTop = parseFloat(element.style.top) || 0;
      
      offsetX = worldCoords.x - (currentLeft - panX) / scale;
      offsetY = worldCoords.y - (currentTop - panY) / scale;

      e.stopPropagation();
      
      if (element.classList.contains('selected')) {
        selectedNodesInfo = Array.from(document.querySelectorAll('.layer-node.selected'))
          .filter(node => node !== element)
          .map(node => ({
            node,
            offsetLeft: (parseFloat(node.dataset.originalX) || 0) - (parseFloat(element.dataset.originalX) || 0),
            offsetTop: (parseFloat(node.dataset.originalY) || 0) - (parseFloat(element.dataset.originalY) || 0)
          }));
      } else {
        selectedNodesInfo = [];
      }
  
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDrag);
      e.preventDefault();
    }
    
    function drag(e) {
      if (!isDragging) return;
      
      const canvas = element.closest('.drawing-area');
      const { canvasRect, scale, panX, panY } = getCanvasInfo(canvas);
      let left, top;
      
      if (element.dataset.groupId) {
        const group = element.closest('.layer-group');
        if (group) {
          offsetX = parseFloat(group.style.left);
          offsetY = parseFloat(group.style.top);
          left = (e.clientX - canvasRect.left - offsetX) / scale - element.offsetWidth / 2;
          top = (e.clientY - canvasRect.top - offsetY ) / scale - element.offsetHeight / 2;
          if (left < 0) {
            left = 0;
          }
          if (top < 30) {
            top = 30;
          }
          if(left>parseFloat(group.style.width) - element.offsetWidth)
          {
            left = parseFloat(group.style.width) - element.offsetWidth;
          }
          //same for bottom
          if(top>parseFloat(group.style.height) - element.offsetHeight)
          {
            top = parseFloat(group.style.height) - element.offsetHeight;
          }
          element.style.left = `${left}px`;
          element.style.top = `${top}px`;
          element.dataset.originalX = left;
          element.dataset.originalY = top;
        }
      } else {
        
        const worldCoords = calculateWorldCoordinates(e.clientX, e.clientY, canvasRect, scale, panX, panY);
        left = worldCoords.x - offsetX;
        top = worldCoords.y - offsetY;
        updateNodePosition(element, left, top, scale, panX, panY);
      }
      
      if (element.dataset.groupId) 
      {
        const group = element.closest('.layer-group');
        updateAttachedFunctionLayers(element, left, top, scale);
      } 
      else 
      {
        updateAttachedFunctionLayers(element, left * scale + panX, top * scale + panY, scale);
      }
      
      selectedNodesInfo.forEach(nodeData => {
        const newLeft = left + nodeData.offsetLeft;
        const newTop = top + nodeData.offsetTop;
        updateNodePosition(nodeData.node, newLeft, newTop, scale, panX, panY);
        visualizer.updateConnectionsForNode(nodeData.node.dataset.id);
      });
      
      visualizer.updateConnectionsForNode(element.dataset.id);
    }
    
    function stopDrag() {
      isDragging = false;
      selectedNodesInfo = [];
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', stopDrag);
    }
  }
  
  static setDimensions(svgElement,svgContainer, layerType) {
    const dimensions = LayerModel.getDimensionsForType(layerType)
    svgElement.setAttribute('width', dimensions.width);
    svgElement.setAttribute('height', dimensions.height); 
    svgContainer.style.width = `${dimensions.width}px`;
    svgContainer.style.height = `${dimensions.height}px`;

  }

  static updatePoolingTypeText(node, poolingType) {
    if (node.dataset.type === 'PoolingLayer') {
      const svgElement = node.querySelector('svg');
      if (svgElement) {
        node.dataset.poolingType = poolingType;
        
        let textElement = svgElement.querySelector('text');
        if (!textElement) {
          textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          textElement.setAttribute('x', svgElement.getAttribute('width') / 2);
          textElement.setAttribute('y', svgElement.getAttribute('height') / 2);
          textElement.setAttribute('text-anchor', 'middle');
          textElement.setAttribute('dominant-baseline', 'middle');
          textElement.setAttribute('font-family', 'Arial, sans-serif');
          textElement.setAttribute('font-size', '12px');
          textElement.setAttribute('font-weight', 'bold');
          textElement.setAttribute('fill', '#333');
          svgElement.appendChild(textElement);
        }
        textElement.textContent = poolingType;
      }
    }
  }

  static getCanvasPosition(event, adjustForZoom = false) {
    const canvas  = document.querySelector('.drawing-area')
    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;
    if (adjustForZoom) {
      const zoomIndicator = document.querySelector('.zoom-indicator');
      const zoomFloat = zoomIndicator ? parseFloat(zoomIndicator.textContent) : 100;
      const scale = zoomFloat / 100;
      
      return {
        x: (clientX - rect.left) / scale,
        y: (clientY - rect.top) / scale
      };
    } else {
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }
  }

}

export default LayerFactory;