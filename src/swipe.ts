export class Swipe {

    private _xDown: number;
    private _yDown: number;
    private _xDiff: number;
    private _yDiff: number;
    private _element: HTMLElement;
    private _direction: 'left|right' | 'none' | null;

    constructor(element: string) {

        this._element = document.querySelector(element);
        this._element.addEventListener('touchstart', (evt) => {
            evt.preventDefault();
            this._xDown = evt.touches[0]?.clientX;
            this._yDown = evt.touches[0]?.clientY;
        }, false);

        this._element.addEventListener('touchmove', (evt) => {
            this._handleTouchMove(evt);
        }, false);

        this._element.addEventListener('touchend', (evt) => {
            if (!this._xDiff && !this._yDiff) {
                this._onTouchHandler();
            }
            this._xDiff = this._yDiff = this._xDown = this._yDown = 0;
            this._direction = null;
        }, false);
    }

    onTouch(callback: () => void): Swipe {
        this._onTouchHandler = callback;
        return this;
    }

    onLeft(callback: () => void): Swipe {
        this._onLeftHandler = callback;
        return this;
    }

    onRight(callback: () => void): Swipe {
        this._onRightHandler = callback;
        return this;
    }

    onUp(callback: () => void): Swipe {
        this._onUpHandler = callback;
        return this;
    }

    onDown(callback: () => void): Swipe {
        this._onDownHandler = callback;
        return this;
    }

    private _handleTouchMove(evt: TouchEvent) {
        if (!this._xDown || !this._yDown || this._direction === 'none') {
            return;
        }

        const xUp = evt.touches[0]?.clientX;
        const yUp = evt.touches[0]?.clientY;

        this._xDiff = this._xDown - xUp;
        this._yDiff = this._yDown - yUp;

        const delta = Math.sqrt(Math.pow(this._xDiff, 2) + Math.pow(this._yDiff, 2));

        if (delta > 30) {
            if (Math.abs(this._xDiff) > Math.abs(this._yDiff)) {
                if (this._xDiff > 0) {
                    this._onLeftHandler();
                } else {
                    this._onRightHandler();
                }
                this._direction = 'left|right';
            } else {
                if (!this._direction) {
                    this._direction = 'none';
                    if (this._yDiff > 0) {
                        this._onUpHandler();
                    } else {
                        this._onDownHandler();
                    }
                }
            }
            this._xDown = xUp;
            this._yDown = yUp;
        }
    }

    private _onTouchHandler() {}

    private _onUpHandler() {}

    private _onRightHandler() {}

    private _onDownHandler() {}

    private _onLeftHandler() {}

}
