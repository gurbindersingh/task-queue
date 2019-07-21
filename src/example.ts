import { AjaxQueue } from './ajax-queue';

function foo(): Promise<void> {
    const randomNum = Math.ceil(Math.random() * 100);
    console.log('    ', randomNum);

    if (randomNum % 2 === 0) {
        return Promise.resolve();
    }
    return Promise.reject();
}

function bar(text: string, num: number): Promise<void> {
    console.log('    ', num);
    if (num % 2 === 1) {
        console.log(text);
        return Promise.resolve();
    }
    return Promise.reject();
}

const queue = new AjaxQueue();

queue.add(foo);
queue.add(bar, 'The quick brown fox', Math.ceil(Math.random() * 100));
queue.add(() => Promise.resolve());
