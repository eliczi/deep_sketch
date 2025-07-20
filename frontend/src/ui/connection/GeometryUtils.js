export class GeometryUtils {
    static calculatePointCoordinates(connectionPoint, container) {
      const node = connectionPoint.node;
      const position = connectionPoint.getPosition();
      const nodeRect = node.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      return {
        x: (nodeRect.left + position.x) - containerRect.left,
        y: (nodeRect.top + position.y) - containerRect.top
      };
    }
  
    static calculatePathData(startX, startY, endX, endY) {
      const offset = Math.abs(endY - startY) / 2;
      return `M ${startX} ${startY} C ${startX + offset} ${startY}, ${endX - offset} ${endY}, ${endX} ${endY}`;
    }
  }