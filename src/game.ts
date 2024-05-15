import { Item } from './item';
import { Swipe } from './swipe';
import { Direction, checkEndOfGame, getData, randomAdd, saveData } from './utils';

export class Game {

    private _map: Item[];
    private _animationRunning = false;
    private _score = 0;
    private _highScore = 0;
    private _scoreNode: HTMLDivElement;
    private _highScoreNode: HTMLDivElement;

    constructor() {
        this._scoreNode = document.querySelector<HTMLDivElement>('#score');
        this._highScoreNode = document.querySelector<HTMLDivElement>('#highScore');
        const itemWrapper = document.querySelectorAll<HTMLDivElement>('.item-wrapper');
        if (itemWrapper) {
            const rawItems = Array.from(itemWrapper).map((item) => {
                const node = document.createElement('div');
                item.appendChild(node);
                node.classList.add('item');
                return new Item({node});
            });

            const {items, score} = getData(rawItems);

            this._map = items;
            this._score = score;
            this._updateScore();
            if (!score) {
                this._init();
            }
        }

        this._subscribe();
    }

    private _init(): void {
        randomAdd(this._map);
        randomAdd(this._map);
    }

    private _move(direction: Direction): void {
        if (this._animationRunning) {
            return;
        }
        const colDirection = direction === Direction.Right ? -1 : 1;
        const rowDirection = direction === Direction.Down ? -1 : 1;
        const colStart = direction === Direction.Right ? 3 : 0;
        const rowStart = direction === Direction.Down ? 3 : 0;
        const colEnd = direction === Direction.Right ? -1 : 4;
        const rowEnd = direction === Direction.Down ? -1 : 4;
        const colMove = direction === Direction.Up || direction === Direction.Down ? 0 : 1;
        const rowMove = direction === Direction.Left || direction === Direction.Right ? 0 : 1;

        const getItem = (row: number, col: number): Item => this._map[row * 4 + col];

        let hasChange = false;
        const resolvers = [];

        for (let row = rowStart; row !== rowEnd; row += rowDirection) {
            for (let col = colStart; col !== colEnd; col += colDirection) {
                const item = getItem(row, col);
                if (item.value) {
                    let mRow = row;
                    let mCol = col;
                    while (rowMove && mRow !== rowStart || colMove && mCol !== colStart) {
                        mRow -= rowMove * rowDirection;
                        mCol -= colMove * colDirection;
                        const tmpItem = getItem(mRow, mCol);
                        if (tmpItem.value) {
                            if (tmpItem.value !== item.value || !tmpItem.canMerge) {
                                mRow += rowMove * rowDirection;
                                mCol += colMove * colDirection;
                            }
                            break;
                        }
                    }

                    if (row !== mRow || col !== mCol) {
                        resolvers.push(item.animateTo({ direction, count: Math.abs(mRow - row + mCol - col) }));

                        const mItem = getItem(mRow, mCol);
                        if (mItem.value === item.value) {
                            this._score += item.value * 2;
                            mItem.setValueWithMerge(mItem.value + item.value);
                        } else {
                            mItem.setValue(mItem.value + item.value, true);
                        }
                        item.setValue(0, true);
                        hasChange = true;
                    }
                }
            }
        }

        if (hasChange) {
            this._animationRunning = true;
            Promise.all(resolvers).then(() => {
                this._animationRunning = false;
                this._map.forEach((item) => {
                    item.applyValue();
                });
                randomAdd(this._map);
                this._updateScore();
                saveData({items: this._map, score: this._score, highScore: this._highScore });
                if (checkEndOfGame(this._map)) {
                    this._gameOver();
                }
            });
        }
    }

    private _updateScore(): void {
        this._highScore = Math.max(this._score, this._highScore);
        this._scoreNode.innerText = `${this._score}`;
        this._highScoreNode.innerText = `${this._highScore}`;
    }

    private _gameOver(): void {

    }

    private _keyDownHandler = (event: KeyboardEvent): void => {
        switch (event.code) {
        case 'ArrowLeft':
            this._move(Direction.Left);
            break;
        case 'ArrowRight':
            this._move(Direction.Right);
            break;
        case 'ArrowUp':
            this._move(Direction.Up);
            break;
        case 'ArrowDown':
            this._move(Direction.Down);
            break;
        }
    };

    private _subscribe(): void {
        document.addEventListener('keydown', this._keyDownHandler);

        const swap = new Swipe('main');

        swap.onDown(() => this._move(Direction.Down));
        swap.onUp(() => this._move(Direction.Up));
        swap.onLeft(() => this._move(Direction.Left));
        swap.onRight(() => this._move(Direction.Right));

    }
}
