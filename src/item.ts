import { Direction } from './utils';

export class Item {

    private _value: number;
    private _node: HTMLDivElement;
    private _canMerge = true;
    private _nextValue: number;

    get value(): number {
        return this._nextValue;
    }

    get canMerge(): boolean {
        return this._canMerge;
    }

    constructor({node}: {node: HTMLDivElement}) {
        this._node = node;
        this.setValue(0);
    }

    setValue(value: number, applyAsync = false): void {
        this._nextValue = value;
        if (!applyAsync) {
            this.applyValue();
        }
    }

    setValueWithMerge(value: number) {
        this._canMerge = false;
        this.setValue(value, true);
    }

    animateTo({ direction, count }: {direction: Direction; count: number}): Promise<void> {

        let leftOffset = 0;
        let topOffset = 0;

        switch (direction) {
        case  Direction.Left:
            leftOffset = -count;
            break;
        case  Direction.Right:
            leftOffset = count;
            break;
        case  Direction.Up:
            topOffset = -count;
            break;
        case  Direction.Down:
            topOffset = count;
            break;
        }

        const animation = this._node.animate([
            { position: 'absolute', left: '0', top: '0', zIndex: 100 },
            { position: 'absolute', left: `calc(${leftOffset} * var(--item-size))`, top: `calc(${topOffset} * var(--item-size))`, zIndex: 100}
        ],  {
            duration: 150,
            iterations: 1,
        });

        return new Promise((resolve) => {
            animation.addEventListener('finish', () => {
                resolve();
            });
        });
    }

    applyValue(): void {
        if (this._nextValue !== this._value) {
            this._node.classList.remove(`item-${this._value}`);
            this._value = this._nextValue;
            this._node.textContent = this._value ? String(this._value) : '';
            this._node.classList.add(`item-${this._value}`);
        }
        this._canMerge = true;
    }

}
