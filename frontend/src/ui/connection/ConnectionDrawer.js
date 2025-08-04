import DomUtils from "../../utils/DomUtils.js";

export class ConnectionDrawer {
  constructor(svgContainer) {
    this.svgContainer = svgContainer;
    this.baseStrokeWidth = 2;
    this.baseHoverStrokeWidth = 4;
  }

  createTemporaryLine(scale = 1.0) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "#000000");
    path.setAttribute("stroke-width", `${this.baseStrokeWidth * scale}`);
    path.setAttribute("stroke-dasharray", "5,3");
    path.setAttribute("fill", "none");
    path.dataset.baseWidth = this.baseStrokeWidth;
    line.appendChild(path);
    this.svgContainer.appendChild(line);
    return { line, path };
  }

  updateTemporaryLine(path,startX,startY,cursorX,cursorY,connectionPointType,) 
  {
    const containerRect = this.svgContainer.getBoundingClientRect();
    const adjustedCursorX = cursorX - containerRect.left;
    const adjustedCursorY = cursorY - containerRect.top;

    let pathData;
    const offset = Math.abs(adjustedCursorY - startY) / 2;
    if (connectionPointType === "output") {
      pathData = `M ${startX} ${startY} C ${startX + offset} ${startY}, ${startX + offset} ${adjustedCursorY}, ${adjustedCursorX} ${adjustedCursorY}`;
    } else {
      pathData = `M ${startX} ${startY} C ${startX - offset} ${startY}, ${startX - offset} ${adjustedCursorY}, ${adjustedCursorX} ${adjustedCursorY}`;
    }
    path.setAttribute("d", pathData);
    
    // Get current scale and add arrowhead
    const currentScale = DomUtils.getScale();
    this.addArrowhead(path, adjustedCursorX, adjustedCursorY, connectionPointType, currentScale);
  }

  addArrowhead(path, endX, endY, connectionPointType, scale = 1.0) {
    // Remove existing arrowhead if any
    const existingArrowhead = path.parentNode.querySelector('.temp-arrowhead');
    if (existingArrowhead) {
      existingArrowhead.remove();
    }

    // Calculate arrow direction based on connection type
    const arrowLength = 12 * scale; // Scale the arrow length
    const arrowAngle = Math.PI / 6; // 30 degrees
    
    // Calculate the direction vector (simplified - you might want to calculate actual tangent)
    let directionX, directionY;
    if (connectionPointType === "output") {
      directionX = 1; // Pointing right
      directionY = 0;
    } else {
      directionX = -1; // Pointing left
      directionY = 0;
    }

    // Calculate arrow points
    const arrowTipX = endX;
    const arrowTipY = endY;
    
    const arrowBase1X = endX - directionX * arrowLength * Math.cos(arrowAngle);
    const arrowBase1Y = endY - directionY * arrowLength * Math.cos(arrowAngle) - arrowLength * Math.sin(arrowAngle);
    
    const arrowBase2X = endX - directionX * arrowLength * Math.cos(arrowAngle);
    const arrowBase2Y = endY - directionY * arrowLength * Math.cos(arrowAngle) + arrowLength * Math.sin(arrowAngle);

    // Create arrowhead path
    const arrowheadPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrowheadPath.setAttribute("d", `M ${arrowTipX} ${arrowTipY} L ${arrowBase1X} ${arrowBase1Y} L ${arrowBase2X} ${arrowBase2Y} Z`);
    arrowheadPath.setAttribute("fill", "#666");
    arrowheadPath.setAttribute("stroke", "#666");
    arrowheadPath.setAttribute("stroke-width", `${1 * scale}`); // Scale the stroke width
    arrowheadPath.classList.add("temp-arrowhead");
    
    // Add arrowhead to the same container as the path
    path.parentNode.appendChild(arrowheadPath);
  }

  removeTemporaryLine(line) {
    if (line && line.parentNode) {
      // Remove the temporary arrowhead if it exists
      const arrowhead = line.parentNode.querySelector('.temp-arrowhead');
      if (arrowhead) {
        arrowhead.remove();
      }
      line.parentNode.removeChild(line);
    }
  }

  createPermanentConnection(sourceId, targetId, clickHandler) {
    const connectionElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    connectionElement.classList.add("permanent-connection");
    connectionElement.dataset.sourceId = sourceId;
    connectionElement.dataset.targetId = targetId;

    const currentScale = DomUtils.getScale();

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "#000000");
    path.setAttribute("stroke-width", `${this.baseStrokeWidth * currentScale}`);
    path.setAttribute("stroke-dasharray", "5,3");
    path.setAttribute("fill", "none");

    path.dataset.baseWidth = this.baseStrokeWidth;
    path.dataset.baseHoverWidth = this.baseHoverStrokeWidth;
    path.dataset.isHovered = "false";

    this.setupPathInteractivity(
      path,
      sourceId,
      targetId,
      clickHandler,
      currentScale,
    );

    connectionElement.appendChild(path);
    this.svgContainer.appendChild(connectionElement);

    return connectionElement;
  }

  setupPathInteractivity(path, sourceId, targetId, clickHandler, scale) {
    path.style.pointerEvents = "all";
    path.style.cursor = "pointer";

    if (!path.hasAttribute("data-hover-added")) {
      path.addEventListener("mouseenter", () => {
        path.dataset.isHovered = "true";
        path.setAttribute(
          "stroke-width",
          `${this.baseHoverStrokeWidth * scale}`,
        );
      });

      path.addEventListener("mouseleave", () => {
        path.dataset.isHovered = "false";
        if (!path.dataset.isClicked || path.dataset.isClicked === "false") {
          path.setAttribute("stroke-width", `${this.baseStrokeWidth * scale}`);
        }
      });

      path.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log('click')
        if(path.dataset.isClicked === 'true') {
          path.setAttribute("stroke-width", `${this.baseStrokeWidth * scale}`);
          this.pathClicked = false;
          path.dataset.isClicked = "false";
        } else {  
          path.setAttribute("stroke-width", `${this.baseHoverStrokeWidth * scale}`);
          this.pathClicked = true;
          path.dataset.isClicked = "true";
        }
        console.log(path.dataset.isClicked)

        //clickHandler(sourceId, targetId, e);
      });

      path.setAttribute("data-hover-added", "true");
    }
  }

  updateConnectionPath(connectionElement, sourcePath, targetPath) {
    const path = connectionElement.querySelector("path");
    if (!path) return;

    const currentScale = DomUtils.getScale();
    path.setAttribute("d", sourcePath);

    const baseWidth = parseFloat(
      path.dataset.baseWidth || this.baseStrokeWidth,
    );
    const baseHoverWidth = parseFloat(
      path.dataset.baseHoverWidth || this.baseHoverStrokeWidth,
    );
    const isHovered = path.dataset.isHovered === "true";

    if (isHovered) {
      path.setAttribute("stroke-width", `${baseHoverWidth * currentScale}`);
    } else {
      path.setAttribute("stroke-width", `${baseWidth * currentScale}`);
    }
  }

  updateConnectionWidths(scale) {
    const connections = document.querySelectorAll(".permanent-connection path");
    connections.forEach((path) => {
      const baseWidth = parseFloat(
        path.dataset.baseWidth || this.baseStrokeWidth,
      );
      const baseHoverWidth = parseFloat(
        path.dataset.baseHoverWidth || this.baseHoverStrokeWidth,
      );
      const isHovered = path.dataset.isHovered === "true";

      if (isHovered) {
        path.setAttribute("stroke-width", `${baseHoverWidth * scale}`);
      } else {
        path.setAttribute("stroke-width", `${baseWidth * scale}`);
      }
    });
  }
}
