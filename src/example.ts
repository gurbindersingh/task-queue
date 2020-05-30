import { AjaxQueue } from './ajax-queue';

// This function will be passed to the queue later on
function foo(): Promise<void> {
    // Generate a random number between 0 and 99
    const randomNum = Math.ceil(Math.random() * 100);

    // Return a resolved Promise if the random number was even
    if (randomNum % 2 === 0) {
        return Promise.resolve();
    }
    // Default return value is a rejected Promises
    return Promise.reject();
}

// This function will also be passed to the queue
function bar(text: string, num: number): Promise<void> {
    if (num % 2 === 1) {
        console.log(text);
        return Promise.resolve();
    }
    return Promise.reject();
}

// Initialise Queue
const QUEUE = new AjaxQueue();

// Calling a function which takes no parameters
QUEUE.add(foo);

// The syntax for passing parameters to a function is the same as for the setIntervall() method
QUEUE.add(bar, 'The quick brown fox', Math.ceil(Math.random() * 100));

// Obviously we can also pass a arrow function
QUEUE.add(() => Promise.resolve());
