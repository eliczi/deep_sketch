export default class HistoryManager {
  constructor(limit = 20) {
    this.stack = [];
    this.currentIndex = -1;
    this.limit = limit;
  }

  push(state) {
    if (this.currentIndex < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.currentIndex + 1);
    }

    this.stack.push(state);

    if (this.stack.length > this.limit) {
      this.stack.shift();
    } else {
      this.currentIndex++;
    }
  }

  getPreviousState() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.stack[this.currentIndex];
    }
    return null;
    
  }

  getNextState() {
    if (this.currentIndex < this.stack.length - 1) {
      this.currentIndex++;
      console.log(this.currentIndex)
      return this.stack[this.currentIndex];
    }
    return null;
  }
}