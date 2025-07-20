class SelectionManager {
  constructor(canvas, utils) {
    this.canvas = canvas;
    this.utils = utils;
    this.isSelecting = false;
    this.selectionStart = { x: 0, y: 0 };
    this.selectionEnd = { x: 0, y: 0 };
    this.selectionElement = null;
    this.selectedNodeIds = new Set();
  }
  
  
  
  startSelection(position) {
    this.isSelecting = true;
    this.selectionStart = position;
    this.selectionEnd = { ...position };
    this.createSelectionElement();
  }
  
  updateSelection(position) {
    this.selectionEnd = position;
    this.updateSelectionElement();
  }
  
  endSelection(position) {
    this.isSelecting = false;
    this.selectionEnd = position;
    
    const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
    const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
    const isRealSelection = width > 5 || height > 5;
    
    if (isRealSelection) {
      this.selectNodesInArea();
    }
    
    this.removeSelectionElement();
    return isRealSelection;
  }
  
  createSelectionElement() {
    this.selectionElement = document.createElement('div');
    this.selectionElement.className = 'selection-area';
    this.canvas.appendChild(this.selectionElement);
    this.updateSelectionElement();
  }
  
  updateSelectionElement() {
    const dimensions = this.calculateSelectionDimensions();
    Object.assign(this.selectionElement.style, {
      left: `${dimensions.left}px`,
      top: `${dimensions.top}px`,
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`
    });
  }
  
  removeSelectionElement() {
    if (this.selectionElement) {
      this.canvas.removeChild(this.selectionElement);
      this.selectionElement = null;
    }
  }
  
  calculateSelectionDimensions() {
    return {
      left: Math.min(this.selectionStart.x, this.selectionEnd.x),
      top: Math.min(this.selectionStart.y, this.selectionEnd.y),
      width: Math.abs(this.selectionEnd.x - this.selectionStart.x),
      height: Math.abs(this.selectionEnd.y - this.selectionStart.y)
    };
  }
  
  selectNodesInArea() {
    const scale = this.utils.getCanvasScale();
    const selectionRect = {
      left: Math.min(this.selectionStart.x, this.selectionEnd.x),
      top: Math.min(this.selectionStart.y, this.selectionEnd.y),
      right: Math.max(this.selectionStart.x, this.selectionEnd.x),
      bottom: Math.max(this.selectionStart.y, this.selectionEnd.y)
    };
    
    const nodes = this.canvas.querySelectorAll('.layer-node');
    nodes.forEach(node => {
      const nodeCanvasRect = this.getScaledNodeRect(node, scale);
      if (this.rectsIntersect(selectionRect, nodeCanvasRect)) {
        this.addNodeToSelection(node.dataset.id);
      }
    });
  }
  

  getScaledNodeRect(node, scale) {
    const rect = node.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
      
    const left = rect.left - canvasRect.left;
    const top = rect.top - canvasRect.top;
    
    return {
      left: left,
      top: top,
      right: left + (rect.width),
      bottom: top + (rect.height)
    };
  }
  
  /**
   * Check if two rectangles intersect
   */
  rectsIntersect(rect1, rect2) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }
  
  addNodeToSelection(nodeId) {
    this.selectedNodeIds.add(nodeId);
    const node = document.querySelector(`.layer-node[data-id="${nodeId}"]`);
    if (node) {
      node.classList.add('selected');
    } else {
      console.warn(`Node ${nodeId} not found in DOM when trying to select`);
    }
  }
  
  clearSelection() {
    this.selectedNodeIds.forEach(nodeId => {
      const node = document.querySelector(`.layer-node[data-id="${nodeId}"]`);
      if (node) {
        node.classList.remove('selected');
      }
    });
    this.selectedNodeIds.clear();
  }
  
  selectNode(nodeId) {
    this.clearSelection();
    this.addNodeToSelection(nodeId);
  }
  
  hasSelectedNodes() {
    return this.selectedNodeIds.size > 0;
  }
  
  getSelectedNodeIds() {
    return Array.from(this.selectedNodeIds);
  }

  isNodeSelected(nodeId) {
    return this.selectedNodeIds.has(nodeId);
  }
}

export default SelectionManager;