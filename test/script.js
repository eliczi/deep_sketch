document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const draggables = document.querySelectorAll('.draggable');
    
    // SVG definitions - store your SVG shapes here
    const svgTemplates = {
        rectangle: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" width="100" height="60">
                <rect x="5" y="5" width="90" height="50" fill="#4285f4" stroke="#2a56c6" stroke-width="2"/>
            </svg>
        `,
        circle: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                <circle cx="50" cy="50" r="45" fill="#34a853" stroke="#0f8c3c" stroke-width="2"/>
            </svg>
        `,
        star: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                <polygon points="50,5 63,38 100,38 70,60 80,95 50,75 20,95 30,60 0,38 37,38" fill="#fbbc05" stroke="#d9b234" stroke-width="2"/>
            </svg>
        `,
        custom: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" width="120" height="80">
                <rect x="10" y="10" width="100" height="60" rx="10" ry="10" fill="#ea4335" stroke="#b31412" stroke-width="2"/>
                <circle cx="40" cy="40" r="15" fill="white"/>
                <circle cx="80" cy="40" r="15" fill="white"/>
            </svg>
        `
    };
    
    // Variable to store the current SVG type being dragged
    let currentDragSvgType = null;
    
    // Variable to store the preview element
    let previewElement = null;
    
    // Add event listeners to draggable elements
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', handleDragStart);
        draggable.addEventListener('dragend', handleDragEnd);
    });
    
    // Canvas event listeners
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('dragleave', handleDragLeave);
    
    function handleDragStart(e) {
        // Store the SVG type in the dataTransfer object and in our variable
        const svgType = e.target.getAttribute('data-svg-type');
        e.dataTransfer.setData('text/plain', svgType);
        currentDragSvgType = svgType;
        
        // Set the drag image (optional)
        const dragIcon = document.createElement('div');
        dragIcon.textContent = e.target.textContent;
        dragIcon.style.backgroundColor = '#e9e9e9';
        dragIcon.style.padding = '5px';
        dragIcon.style.borderRadius = '3px';
        document.body.appendChild(dragIcon);
        e.dataTransfer.setDragImage(dragIcon, 0, 0);
        setTimeout(() => {
            document.body.removeChild(dragIcon);
        }, 0);
    }
    
    function handleDragEnd(e) {
        // Reset the current SVG type
        currentDragSvgType = null;
        
        // Remove preview if it exists
        if (previewElement && previewElement.parentNode === canvas) {
            canvas.removeChild(previewElement);
            previewElement = null;
        }
    }
    
    function handleDragOver(e) {
        e.preventDefault(); // Allow drop
        e.dataTransfer.dropEffect = 'copy';
        
        if (!currentDragSvgType) return;
        
        // Get the SVG template using our stored variable
        const svgTemplate = svgTemplates[currentDragSvgType];
        
        if (!svgTemplate) return;
        
        // Calculate position relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // If we already have a preview, just update its position
        if (previewElement) {
            previewElement.style.left = `${x}px`;
            previewElement.style.top = `${y}px`;
        } else {
            // Create a container for the SVG preview
            previewElement = document.createElement('div');
            previewElement.className = 'svg-element preview';
            previewElement.style.left = `${x}px`;
            previewElement.style.top = `${y}px`;
            previewElement.innerHTML = svgTemplate;
            
            // Add to canvas
            canvas.appendChild(previewElement);
        }
    }
    
    function handleDragLeave(e) {
        // Remove the preview when dragging leaves the canvas
        // console.log(e.target)
        if (previewElement && previewElement.parentNode === canvas) {
            canvas.removeChild(previewElement);
            previewElement = null;
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        
        // Get the SVG type from dataTransfer
        const svgType = e.dataTransfer.getData('text/plain');
        
        // Get the SVG template
        const svgTemplate = svgTemplates[svgType];
        
        if (!svgTemplate) return;
        
        // Calculate position relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Remove the preview if it exists
        if (previewElement && previewElement.parentNode === canvas) {
            canvas.removeChild(previewElement);
            previewElement = null;
        }
        
        // Create a container for the SVG
        const svgContainer = document.createElement('div');
        svgContainer.className = 'svg-element';
        svgContainer.style.left = `${x}px`;
        svgContainer.style.top = `${y}px`;
        svgContainer.innerHTML = svgTemplate;
        
        // Add draggable functionality to placed SVG elements
        makeSvgDraggable(svgContainer);
        
        // Add to canvas
        canvas.appendChild(svgContainer);
    }
    
    function makeSvgDraggable(element) {
        // Variables to track position
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        // Add mouse event listeners
        element.addEventListener('mousedown', dragStart);
        element.addEventListener('mouseup', dragEnd);
        element.addEventListener('mousemove', drag);
        
        // For better user experience, we'll also handle touch events
        element.addEventListener('touchstart', dragStart, { passive: false });
        element.addEventListener('touchend', dragEnd, { passive: false });
        element.addEventListener('touchmove', drag, { passive: false });
        
        // Make sure the SVG can receive pointer events
        element.style.pointerEvents = 'auto';
        
        function dragStart(e) {
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            
            if (e.target === element || element.contains(e.target)) {
                isDragging = true;
            }
        }
        
        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            
            isDragging = false;
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === 'touchmove') {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }
                
                xOffset = currentX;
                yOffset = currentY;
                
                setTranslate(currentX, currentY, element);
            }
        }
        
        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        }
    }
});