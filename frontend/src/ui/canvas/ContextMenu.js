/**
 * Manages the context menu UI for right-click actions on the canvas.
 * Handles menu creation, display, and user interaction.
 * @class
 */
class ContextMenu {
  constructor(canvas) {
    this.canvas = canvas;
    this.contextMenu = null;
    this.targetElement = null;
    this.isVisible = false;

    this.createContextMenu();
    this.bindEvents();
  }

  createContextMenu() {
    this.contextMenu = document.createElement("div");
    this.contextMenu.className = "context-menu";
    this.contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="group">
          <span class="menu-icon">📁</span>
          Group Selected Layers
        </div>
        <div class="context-menu-item" data-action="ungroup">
          <span class="menu-icon">📂</span>
          Ungroup Layers
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" data-action="delete">
          <span class="menu-icon">🗑️</span>
          Delete Selected
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" data-action="select-all">
          <span class="menu-icon">☑️</span>
          Select All
        </div>
        <div class="context-menu-item" data-action="clear-selection">
          <span class="menu-icon">❌</span>
          Clear Selection
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" data-action="reset-view">
          <span class="menu-icon">🏠</span>
          Reset View
        </div>
      `;

    this.addStyles();

    this.contextMenu.style.display = "none";
    document.body.appendChild(this.contextMenu);
  }

  addStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .context-menu {
          position: fixed;
          background: white;
          border: 1px solid #ccc;
          border-radius: 6px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          z-index: 10000;
          min-width: 180px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          padding: 4px 0;
        }
        
        .context-menu-item {
          padding: 8px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          color: #333;
          transition: background-color 0.15s ease;
        }
        
        .context-menu-item:hover {
          background-color: #f0f0f0;
        }
        
        .context-menu-item.disabled {
          color: #999;
          cursor: not-allowed;
        }
        
        .context-menu-item.disabled:hover {
          background-color: transparent;
        }
        
        .context-menu-separator {
          height: 1px;
          background-color: #e0e0e0;
          margin: 4px 0;
        }
        
        .menu-icon {
          margin-right: 8px;
          font-size: 16px;
          width: 20px;
          text-align: center;
        }
      `;
    document.head.appendChild(style);
  }

  bindEvents() {
    this.canvas.canvas.addEventListener("contextmenu", (e) => {
      if (this.canvas._panningStarted) {
        e.preventDefault();
        this.canvas._panningStarted = false; // reset for next time
        return;
      }
      e.preventDefault();
    this.showContextMenu(e.clientX, e.clientY, e.target);
    });

    this.contextMenu.addEventListener("click", (e) => {
      const menuItem = e.target.closest(".context-menu-item");
      if (menuItem && !menuItem.classList.contains("disabled")) {
        const action = menuItem.dataset.action;
        this.executeAction(action);
        this.hideContextMenu();
      }
    });



    document.addEventListener("click", (e) => {
      if (this.isVisible && !this.contextMenu.contains(e.target)) {
        this.hideContextMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isVisible) {
        this.hideContextMenu();
      }
    });

    this.canvas.canvas.addEventListener("wheel", () => {
      if (this.isVisible) {
        this.hideContextMenu();
      }
    });
  }

  showContextMenu(x, y, targetElement) {
    this.targetElement = targetElement;
    this.updateMenuState();

    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;
    this.contextMenu.style.display = "block";
    this.isVisible = true;

    this.adjustMenuPosition();
  }

  hideContextMenu() {
    this.contextMenu.style.display = "none";
    this.isVisible = false;
    this.targetElement = null;
  }

  adjustMenuPosition() {
    const rect = this.contextMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (rect.right > viewportWidth) {
      this.contextMenu.style.left = `${viewportWidth - rect.width - 10}px`;
    }

    if (rect.bottom > viewportHeight) {
      this.contextMenu.style.top = `${viewportHeight - rect.height - 10}px`;
    }
  }

  updateMenuState() {
    const selectedNodes = this.canvas.selectionManager.getSelectedNodeIds();
    const hasSelection = selectedNodes.length > 0;
    const hasMultipleSelection = selectedNodes.length > 1;

    const hasGroupedNodes = selectedNodes.some((nodeId) => {
      const node = document.querySelector(`.layer-node[data-id="${nodeId}"]`);
      return node && node.dataset.groupId;
    });

    const clickedOnGroup =
      this.targetElement &&
      (this.targetElement.classList.contains("layer-group") ||
        this.targetElement.closest(".layer-group"));

    const menuItems = this.contextMenu.querySelectorAll(".context-menu-item");

    menuItems.forEach((item) => {
      const action = item.dataset.action;
      item.classList.remove("disabled");

      switch (action) {
        case "group":
          if (!hasMultipleSelection) {
            item.classList.add("disabled");
          }
          break;
        case "ungroup":
          if (!hasGroupedNodes && !clickedOnGroup) {
            item.classList.add("disabled");
          }
          break;
        case "delete":
          if (!hasSelection && !clickedOnGroup) {
            item.classList.add("disabled");
          }
          break;
        case "clear-selection":
          if (!hasSelection) {
            item.classList.add("disabled");
          }
          break;
      }
    });
  }

  executeAction(action) {
    switch (action) {
      case "group":
        this.groupSelectedLayers();
        break;
      case "ungroup":
        this.ungroupLayers();
        break;
      case "delete":
        this.deleteSelected();
        break;
      case "select-all":
        this.selectAllLayers();
        break;
      case "clear-selection":
        this.clearSelection();
        break;
      case "reset-view":
        this.resetView();
        break;
    }
  }

  groupSelectedLayers() {
    const selectedNodes = this.canvas.selectionManager.getSelectedNodeIds();
    if (selectedNodes.length > 1) {
      this.canvas.createGroup();
    }
  }

  ungroupLayers() {
    const selectedNodes = this.canvas.selectionManager.getSelectedNodeIds();
    const groupIds = new Set();
    selectedNodes.forEach((nodeId) => {
      const node = document.querySelector(`.layer-node[data-id="${nodeId}"]`);
      if (node && node.dataset.groupId) {
        groupIds.add(node.dataset.groupId);
      }
    });

    if (this.targetElement) {
      const group = this.targetElement.closest(".layer-group");
      if (group && group.dataset.id) {
        groupIds.add(group.dataset.id);
      }
    }

    groupIds.forEach((groupId) => {
      this.canvas.deleteGroup(groupId);
    });
  }

  deleteSelected() {
    const selectedNodes = this.canvas.selectionManager.getSelectedNodeIds();

    if (this.targetElement) {
      const group = this.targetElement.closest(".layer-group");
      if (group && group.dataset.id) {
        this.canvas.deleteGroup(group.dataset.id);
      }
    }

    this.canvas.selectionManager.clearSelection();
  }

  selectAllLayers() {
    const allNodes = this.canvas.canvas.querySelectorAll(".layer-node");
    this.canvas.selectionManager.clearSelection();

    allNodes.forEach((node) => {
      if (node.dataset.id) {
        this.canvas.selectionManager.addNodeToSelection(node.dataset.id);
      }
    });
  }

  clearSelection() {
    this.canvas.selectionManager.clearSelection();
  }

  resetView() {
    this.canvas.clearCanvas();
  }

  destroy() {
    if (this.contextMenu && this.contextMenu.parentNode) {
      this.contextMenu.parentNode.removeChild(this.contextMenu);
    }
  }
}

export default ContextMenu;
