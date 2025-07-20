class CanvasEventHandler {
  constructor(canvas, selectionManager, layerPanelManager, previewManager, layerManager, canvasUtils, layerPanel, groupManager, parent) {
    this.canvas = canvas;
    this.selectionManager = selectionManager;
    this.layerPanelManager = layerPanelManager;
    this.previewManager = previewManager;
    this.layerManager = layerManager;
    this.canvasUtils = canvasUtils;
    this.layerPanel = layerPanel;
    this.groupManager = groupManager;
    this.parent = parent;
    this.isConnecting = false;
    this.sourceNodeId = null;
    
    this.justFinishedSelecting = false;
  }
  
  initializeEventHandlers() {
    this.setupDropZone();
    this.setupSelectionEvents();
    this.setupCanvasEvents();
    this.setupKeyboardEvents();
  }
  
  
  
  setupDropZone() {
    this.canvas.addEventListener('dragenter', this.handleDragEnter.bind(this));
    this.canvas.addEventListener('dragover', this.handleDragOver.bind(this));
    this.canvas.addEventListener('drop', this.handleDrop.bind(this));
    this.canvas.addEventListener('dragleave', this.handleDragLeave.bind(this));
  }
  
  setupSelectionEvents() {
    this.canvas.addEventListener('mousedown', this.handleSelectionStart.bind(this));
    document.addEventListener('mousemove', this.handleSelectionMove.bind(this));
    document.addEventListener('mouseup', this.handleSelectionEnd.bind(this));
  }
  
  setupCanvasEvents() {
    this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    this.canvas.addEventListener('node-clicked', this.handleNodeClicked.bind(this));
  }
  
  handleNodeClicked(e) {
    const { nodeId } = e.detail;
    this.selectionManager.selectNode(nodeId);
    this.layerPanelManager.showLayerPanel(nodeId);
    this.groupManager.deselectAllGroups()
  }

  setupKeyboardEvents() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  
  
  handleDragEnter(e) {
    e.preventDefault();
    this.canvas.classList.add('canvas-drag-active');
  }
  
  handleDragOver(e) {
    e.preventDefault();
    const position = this.canvasUtils.getCanvasPosition(e, this.parent.scale, this.parent.panX,this.parent.panY, true);
    this.previewManager.updatePreviewElement(position.x, position.y, this.layerPanel.currentDraggedLayerType);
    
    if (this.layerPanel.currentDraggedLayerType && this.layerPanel.currentDraggedLayerType.includes('Function')) {
      const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
      const nodeUnderCursor = elementsUnderCursor.find(element => 
        element.classList.contains('layer-node')
      );
      if (nodeUnderCursor) {
        const nodeId = nodeUnderCursor.dataset.id;
        if (nodeId && (!this.selectionManager.isNodeSelected(nodeId))) {
          this.selectionManager.selectNode(nodeId);
          nodeUnderCursor.classList.add('function-drop-target');
        }
      } else {
        this.selectionManager.clearSelection();
        document.querySelectorAll('.function-drop-target').forEach(node => {
          node.classList.remove('function-drop-target');
        });
      }
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    
    if (this.layerPanel.currentDraggedLayerType && this.layerPanel.currentDraggedLayerType.includes('Function')) {
      const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
      const nodeUnderCursor = elementsUnderCursor.find(element =>
        element.classList.contains('layer-node')
      );
      
      if (nodeUnderCursor) {
        const nodeId = nodeUnderCursor.dataset.id;
        this.previewManager.removePreviewElement();
        
        const targetRect = nodeUnderCursor.getBoundingClientRect();
        const targetPos = this.canvasUtils.getCanvasPosition({
          clientX: targetRect.right, 
          clientY: targetRect.top
        }, this.parent.scale, this.parent.panX, this.parent.panY, false);
        
        
        
        const functionLayer = this.layerManager.createLayer(
          this.layerPanel.currentDraggedLayerType, 
          targetPos.x,
          targetPos.y,
          this.parent.scale
        );
        
        nodeUnderCursor.dataset.activation_fuction = functionLayer;

        if (functionLayer) {
          const functionElement = functionLayer.getElement();
          functionElement.dataset.attachedTo = nodeId;
          if (nodeUnderCursor.dataset.groupId) {
            this.groupManager.addNodeToGroup(nodeUnderCursor.dataset.groupId, functionElement);
          }
        }
        
      }
    } 
    else {
      const layerType = e.dataTransfer.getData('text/plain');
      const position = this.canvasUtils.getCanvasPosition(e, this.parent.scale, this.parent.panX, this.parent.panY, false);
      this.previewManager.removePreviewElement();
      const layer = this.layerManager.createLayer(layerType, position.x, position.y, this.parent.scale);
      if (layer) {
        this.selectionManager.selectNode(layer.id);
        this.layerPanelManager.showLayerPanel(layer.id);
      }
    }

    this.previewManager.removePreviewElement();

    document.querySelectorAll('.function-drop-target').forEach(node => {
      node.classList.remove('function-drop-target');
    });
  }
  
  handleDragLeave(e) {
    if (!this.canvas.contains(e.relatedTarget)) {
      this.previewManager.removePreviewElement();
    }
  }
  
  handleSelectionStart(e) {
    if (e.target === this.canvas) {
      this.selectionManager.startSelection(this.canvasUtils.getCanvasPosition(e, 1, 0, 0, true));
    }
  }
  
  handleSelectionMove(e) {
    if (this.selectionManager.isSelecting) {
      this.selectionManager.updateSelection(this.canvasUtils.getCanvasPosition(e, 1, 0, 0, true));
    }
  }
  
  handleSelectionEnd(e) {
    if (this.selectionManager.isSelecting) {
      const didSelect = this.selectionManager.endSelection(this.canvasUtils.getCanvasPosition(e, 1, 0, 0, true));
      if (didSelect) {
        this.justFinishedSelecting = true;
        setTimeout(() => {
          this.justFinishedSelecting = false;
        }, 200);
      }
    }
  }
  
  handleCanvasClick(e) {
    if (e.target === this.canvas && !this.selectionManager.isSelecting && !this.justFinishedSelecting) {
      this.selectionManager.clearSelection();
      this.layerPanelManager.hideLayerPanel();
      return;
    }
    
    let target = e.target;
    while (target && target !== this.canvas) {
      if (target.classList.contains('layer-node')) {
        const nodeId = target.dataset.id;
        this.selectionManager.clearSelection();
        this.selectionManager.addNodeToSelection(nodeId);
        this.layerPanelManager.showLayerPanel(nodeId);
        break;
      }
      target = target.parentElement;
    }
  }
  
  handleKeyDown(e) {
    if (e.key === 'Backspace' && e.metaKey && this.selectionManager.hasSelectedNodes()) {
      this.layerManager.deleteSelectedNodes(this.selectionManager.getSelectedNodeIds());
      this.selectionManager.clearSelection();
    }
  }
}

export default CanvasEventHandler;