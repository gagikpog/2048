import { Item } from './item';
import { Swipe } from './swipe';
import { Direction, checkEndOfGame, getData, randomAdd, saveData, saveDataDebounce } from './utils';

export class Game {

    private _map: Item[];
    private _animationRunning = false;
    private _score = 0;
    private _highScore = 0;
    private _history: string[] = [];
    private _scoreNode: HTMLDivElement;
    private _highScoreNode: HTMLDivElement;
    private _gameNode: HTMLDivElement;
    private _backButtonNode: HTMLDivElement;
    private _gameOverDialog: HTMLDialogElement;

    constructor() {
        this._scoreNode = document.querySelector<HTMLDivElement>('#score');
        this._highScoreNode = document.querySelector<HTMLDivElement>('#highScore');
        this._gameNode = document.querySelector<HTMLDivElement>('#newGame');
        this._backButtonNode = document.querySelector<HTMLDivElement>('#backButton');
        this._gameOverDialog = document.querySelector<HTMLDialogElement>('#gameOver');
        const itemWrapper = document.querySelectorAll<HTMLDivElement>('.item-wrapper');
        if (itemWrapper) {
            const rawItems = Array.from(itemWrapper).map((item) => {
                const node = document.createElement('div');
                item.appendChild(node);
                node.classList.add('item');
                return new Item({node});
            });

            const { items, score, highScore, history } = getData(rawItems);

            this._history = history;
            this._map = items;
            this._score = score;
            this._highScore = highScore;
            this._updateScore();
            this._init();
        }

        this._subscribe();
    }

    private _init(): void {
        if (this._map.every((items) => items.value === 0)) {
            randomAdd(this._map);
            randomAdd(this._map);
        }
    }

    private _move(direction: Direction): void {
        if (this._animationRunning) {
            return;
        }
        const currentDataForHistory = JSON.stringify({
            score: this._score,
            highScore: this._highScore,
            items: this._map.map((item) => item.value)
        });

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
                this._history = [currentDataForHistory];
                this._saveData(true);
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
        this._gameOverDialog.showModal();
    }

    private _newGame(): void {
        this._score = 0;
        this._map.forEach((item: Item) => {
            item.setValue(0);
        });
        this._updateScore();
        this._history = [];
        this._saveData();
        this._init();
        this._gameOverDialog.close();
    }

    private _saveData(withDebounce = false): void {
        const data = { items: this._map, score: this._score, highScore: this._highScore, history: this._history };
        if (withDebounce) {
            saveDataDebounce(data);
        } else {
            saveData(data);
        }
    }

    private _historyBack(): void {
        const dataStr = this._history.pop();
        if (dataStr) {
            const data = JSON.parse(dataStr);
            this._score = data.score || 0;
            this._highScore = data.highScore || 0;
            const rawItems = data.items || [];

            rawItems.forEach((value: number, index: number) => {
                this._map[index].setValue(value);
            });
            this._updateScore();
            this._saveData();
        }
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
        this._gameNode.addEventListener('click', () => this._newGame());
        this._backButtonNode.addEventListener('click', () => this._historyBack());

        const swap = new Swipe('main');

        swap.onDown(() => this._move(Direction.Down));
        swap.onUp(() => this._move(Direction.Up));
        swap.onLeft(() => this._move(Direction.Left));
        swap.onRight(() => this._move(Direction.Right));

    }
}
