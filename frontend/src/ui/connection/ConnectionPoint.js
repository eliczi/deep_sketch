import DomUtils from "../../utils/DomUtils.js";
import ConnectionModel from "../../models/ConnectionModel.js";
import NetworkModel from "../../models/NetworkModel.js";
import ConnectionVisualizer from "../connection/ConnectionVisualizer.js";
import { GeometryUtils } from "../connection/GeometryUtils.js";

class ConnectionPoint {
  constructor(type, node, position) {
    this.type = type;
    this.node = node;
    this.element = this.createElement();
    this.position = position;
    this.setupEventListeners();
    this.defaultSize = "12px";
    this.hoverSize = "15px";
    this.activeLine = null;
    this.activePath = null;
    this.visualizer = ConnectionVisualizer.getInstance();
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
  }

  createElement() {
    const element = DomUtils.createElementWithClass("div", "connection-point");
    element.classList.add(`${this.type}-point`);
    return element;
  }

  setupEventListeners() {
    this.element.addEventListener("mousedown", (e) => {
      //e.stopPropagation();
      this.onMouseDown(e);
    });
    this.element.addEventListener("mouseover", (e) => {
      this.onHover(e);
    });
    this.element.addEventListener("mouseout", (e) => {
      this.onMouseOut(e);
    });
  }

  onMouseDown(e) {
    const startCoords = GeometryUtils.calculatePointCoordinates(
      this,
      this.visualizer.svgContainer
    );

    this.startX = startCoords.x;
    this.startY = startCoords.y;

    const lineObjects = this.visualizer.createTemporaryLine(
      DomUtils.getScale()
    );
    this.activeLine = lineObjects.line;
    this.activePath = lineObjects.path;

    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);

    this.visualizer.updateTemporaryLine(
      this.activePath,
      this.startX,
      this.startY,
      e.clientX,
      e.clientY,
      this.type
    );
  }

  onMouseMove(e) {
    this.visualizer.updateTemporaryLine(
      this.activePath,
      this.startX,
      this.startY,
      e.clientX,
      e.clientY,
      this.type
    );
  }

  onMouseUp(e) {
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);

    const pointUnderMouse = this.findConnectionPointUnderMouse(e);

    if (pointUnderMouse) {
      if (
        this.type === "output" &&
        pointUnderMouse.classList.contains("input-point")
      ) {
        const sourceNode = this.node;
        const targetNode = this.findParentNode(pointUnderMouse);
        if (sourceNode && targetNode) {
          this.createConnection(sourceNode.dataset.id, targetNode.dataset.id);
        }
      } else if (
        this.type === "input" &&
        pointUnderMouse.classList.contains("output-point")
      ) {
        const sourceNode = this.findParentNode(pointUnderMouse);
        const targetNode = this.node;
        if (sourceNode && targetNode) {
          this.createConnection(sourceNode.dataset.id, targetNode.dataset.id);
        }
      } else {
        this.visualizer.removeTemporaryLine(this.activeLine);
        this.activeLine = null;
        this.activePath = null;
      }
    } else {
      this.visualizer.removeTemporaryLine(this.activeLine);
      this.activeLine = null;
      this.activePath = null;
    }
  }

  findConnectionPointUnderMouse(e) {
    const connectionPoints = document.querySelectorAll(".connection-point");
    for (const point of connectionPoints) {
      const rect = point.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        if (point === this.element) {
          continue;
        }
        return point;
      }
    }
    return null;
  }

  findParentNode(connectionPointElement) {
    let currentElement = connectionPointElement;
    while (
      currentElement &&
      !currentElement.classList.contains("layer-node") &&
      !currentElement.classList.contains("layer-group")
    ) {
      currentElement = currentElement.parentElement;
    }
    return currentElement;
  }

  createConnection(source, target) {
    const id = NetworkModel.getConnectionId();
    const connectionElement = this.visualizer.createPermanentConnection(
      source,
      target
    );
    if (connectionElement) {
      let targetNode = document.querySelector(
        `.layer-node[data-id="${target}"]`
      );
      if (!targetNode) {
        targetNode = document.querySelector(
          `.layer-group[data-id="${target}"]`
        );
      }
      const connection = new ConnectionModel(
        id,
        source,
        target,
        this.node,
        targetNode,
        connectionElement
      );
      NetworkModel.addConnection(connection);
      this.visualizer.removeTemporaryLine(this.activeLine);
      this.activeLine = null;
      this.activePath = null;
    }
  }

  onHover(e) {
    this.element.style.width = this.hoverSize;
    this.element.style.height = this.hoverSize;
    this.element.style.transition = "width 0.2s, height 0.2s";
  }

  onMouseOut(e) {
    this.element.style.width = this.defaultSize;
    this.element.style.height = this.defaultSize;
  }

  getElement() {
    return this.element;
  }

  getPosition() {
    const nodeRect = this.node.getBoundingClientRect();
    const pointRect = this.element.getBoundingClientRect();

    return {
      x: pointRect.left + pointRect.width / 2 - nodeRect.left,
      y: pointRect.top + pointRect.height / 2 - nodeRect.top,
    };
  }
}

class InputPoint extends ConnectionPoint {
  constructor(node) {
    super("input", node, "top");
  }
}

class OutputPoint extends ConnectionPoint {
  constructor(node) {
    super("output", node, "bottom");
  }
}

export { ConnectionPoint, InputPoint, OutputPoint };
