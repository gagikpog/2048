import { Item } from './item';
const GAME_SATE_PARAM = '2048-game-data';

interface IData<TItem = Item> {
    items: TItem[];
    score: number;
    highScore: number;
    history: string[];
}

export enum Direction {
    Left = 'left',
    Right = 'right',
    Up = 'up',
    Down = 'down'
}

function getValue(): number {
    return Math.random() > 0.05 ? 2 : 4;
}

function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomAdd(items: Item[]): void {
    const emptyIndexes = items.reduce((acc: number[], item: Item, index: number) => {
        if (item.value === 0) {
            acc.push(index);
        }
        return acc;
    }, []);

    if (emptyIndexes.length === 1) {
        const index = emptyIndexes[0];
        const item = items[index];
        const left = items[index % 4 === 0 ? -1 : index - 1];
        const right = items[index % 4 === 3 ? -1 : index + 1];
        const top = items[index > 3 ? index - 4 : -1];
        const bottom = items[index < 12 ? index + 4 : -1];

        const [value = 2] = [left, right, top, bottom]
            .filter(Boolean)
            .map((item) => item.value === 2 || item.value === 4 ? item.value : 0)
            .filter(Boolean);

        item.setValue(value);

    } else if (emptyIndexes.length) {
        const index = emptyIndexes[random(0, emptyIndexes.length - 1)];

        const item = items[index];
        item.setValue(getValue());
    }
}

export function checkEndOfGame(items: Item[]): boolean {
    // test empty element
    return items.every((item) => item.value !== 0) &&
        // test neighbors with some value
        items.every((item, index) => !checkSomeNeighbor(item.value, items, index));
}

function checkSomeNeighbor(value: number, items: Item[], index: number): boolean {
    // test right element
    return checkValue(value, items, index % 4 === 3 ? -1 : index + 1) ||
        // test bottom element
        checkValue(value, items, index < 12 ? index + 4 : -1);
}

function checkValue(value: number, items: Item[], index: number) {
    return items[index] && items[index].value === value;
}

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: Parameters<F>) => {
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };

    return debounced as (...args: Parameters<F>) => ReturnType<F>;
};

export function saveData({ items, score, highScore, history }: IData) {
    localStorage.setItem(GAME_SATE_PARAM, JSON.stringify({ score, highScore, items: items.map((item) => item.value), history }));
}

export const saveDataDebounce = debounce(saveData, 500);

export function getData(items: Item[]): IData {

    try {
        const dataStr = localStorage.getItem(GAME_SATE_PARAM) || '{}';
        const data = JSON.parse(dataStr) as IData<number>;

        const score = data.score || 0;
        const highScore = data.highScore || 0;
        const rawItems = data.items || [];
        const history = data.history || [];

        rawItems.forEach((value: number, index: number) => {
            items[index].setValue(value);
        });

        return { score, items, highScore, history };

    } catch (error) {
        return { score: 0, items, highScore: 0, history: [] };
    }
}
