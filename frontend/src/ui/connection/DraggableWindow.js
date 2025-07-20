export class DraggableWindow {
  constructor(element, handle) {
    this.element = element;
    this.handle = handle;
    this.initialize();
  }

  initialize() {
    this.handle.addEventListener("mousedown", this.startDrag.bind(this));
  }

  startDrag(e) {
    e.preventDefault();
    e.stopPropagation();

    const rect = this.element.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;

    document.addEventListener("mousemove", this.drag.bind(this));
    document.addEventListener("mouseup", this.stopDrag.bind(this), {
      once: true,
    });
  }

  drag(e) {
    this.element.style.top = `${e.clientY - this.offsetY}px`;
    this.element.style.left = `${e.clientX - this.offsetX}px`;
    this.element.style.transform = "none";
  }

  stopDrag() {
    document.removeEventListener("mousemove", this.drag.bind(this));
  }
}
