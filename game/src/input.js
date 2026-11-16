export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouseX = 480;
    this.mouseY = 300;
    this.pointerHeld = false;
    this.slowHeld = false;
    this.keysDown = new Set();
    this.clickQueue = [];
    this.pressedThisFrame = new Set();
    this.consumedPresses = new Set();
    this._updateMouse = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouseY = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    };
    this._onMouseMove = (event) => this._updateMouse(event);
    this._onMouseDown = (event) => {
      this._updateMouse(event);
      if (event.button === 0) {
        this.pointerHeld = true;
        this.clickQueue.push({ x: this.mouseX, y: this.mouseY });
      }
      if (event.button === 2) this.slowHeld = true;
    };
    this._onMouseUp = (event) => {
      if (event.button === 0) this.pointerHeld = false;
      if (event.button === 2) this.slowHeld = this.keysDown.has('KeyE');
    };
    this._onContextMenu = (event) => event.preventDefault();
    this._onKeyDown = (event) => {
      if (!this.keysDown.has(event.code)) this.pressedThisFrame.add(event.code);
      this.keysDown.add(event.code);
      if (event.code === 'KeyE') this.slowHeld = true;
    };
    this._onKeyUp = (event) => {
      this.keysDown.delete(event.code);
      if (event.code === 'KeyE') this.slowHeld = false;
    };
    canvas.addEventListener('mousemove', this._onMouseMove);
    canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    canvas.addEventListener('contextmenu', this._onContextMenu);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  takeClick() { return this.clickQueue.length ? this.clickQueue.shift() : null; }

  takeDash() {
    return ['ShiftLeft', 'ShiftRight', 'Space'].some((code) => this.wasPressed(code));
  }

  takeChoice() {
    for (const [code, value] of [['Digit1', 1], ['Digit2', 2], ['Digit3', 3]]) {
      if (this.wasPressed(code)) return value;
    }
    return null;
  }

  takeConfirm() {
    if (this.clickQueue.length) { this.clickQueue.shift(); return true; }
    return this.wasPressed('Enter');
  }

  takeRestart() { return this.wasPressed('KeyR'); }

  wasPressed(code) {
    if (!this.pressedThisFrame.has(code) || this.consumedPresses.has(code)) return false;
    this.consumedPresses.add(code);
    return true;
  }

  postUpdate() {
    this.pressedThisFrame.clear();
    this.consumedPresses.clear();
  }
}
