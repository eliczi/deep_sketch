class CanvasUtils {
    constructor(canvas, panManager = null) {
      this.canvas = canvas;
      this.panManager = panManager;
    }
    


    getCanvasPosition(event, scale, panX, panY, preview) {
        const rect = this.canvas.getBoundingClientRect();
    
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        if (preview) {
          return {
            x: screenX/scale,
            y: screenY/scale
          };
        }
        else{
          const worldX = screenX  / scale - panX / scale  
          const worldY = screenY  / scale - panY / scale; 
          return {
            x: worldX,
            y: worldY
          };

        }
       
    }
      
    
    getNodeCanvasRect(node) {
      const nodeRect = node.getBoundingClientRect();
      const canvasRect = this.canvas.getBoundingClientRect();
      
      return {
        left: nodeRect.left - canvasRect.left,
        top: nodeRect.top - canvasRect.top,
        right: nodeRect.right - canvasRect.left,
        bottom: nodeRect.bottom - canvasRect.top
      };
    }
    
    rectsIntersect(rect1, rect2) {
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    }
    
    formatParamName(name) {
      return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
    }
    getCanvasScale() {
        return this.canvas.scale || 1.0;
    }
  }
  
  export default CanvasUtils;