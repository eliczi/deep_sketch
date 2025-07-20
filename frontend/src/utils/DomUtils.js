class DomUtils {
   
    static createElementWithClass(tag, className) {
      const element = document.createElement(tag);
      if (className) {
        element.className = className;
      }
      return element;
    }

    static getScale()
    {
      let zoomIndicator = document.querySelector('.zoom-indicator');
      zoomIndicator = zoomIndicator ? parseFloat(zoomIndicator.textContent) : 1.0;
      return zoomIndicator / 100;
    }

    static getNodes(element)
    {
      return element.querySelectorAll('.layer-node');
    }

    
    static showToast(message, duration = 2000) {
      
      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '10000';
        document.body.appendChild(toastContainer);
      }
      
      
      const toast = document.createElement('div');
      toast.className = 'toast-message';
      toast.textContent = message;
      toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      toast.style.color = 'white';
      toast.style.padding = '10px 15px';
      toast.style.borderRadius = '4px';
      toast.style.marginTop = '10px';
      toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      toast.style.transition = 'opacity 0.3s ease-in-out';
      
      
      toastContainer.appendChild(toast);
      
      
      setTimeout(() => {
        toast.style.opacity = '1';
      }, 10);
      
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, duration);
    }
  }
  
  export default DomUtils;