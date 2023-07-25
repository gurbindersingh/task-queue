# A Simple Task Queue

Sometimes it is necessary to execute functions in a certain order, but the functions have to be executed asynchronously and they don't necessarily depend on each other. This queue is an example of a simple way to loosen the coupling between those functions. This is far from a refined method but might be a good starting point.

> The reason why the project was originally named "Ajax Queue" is because that was my original use case for it but it will work with any function.

## Example

```javascript
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

// Obviously we can also pass an arrow function
QUEUE.add(() => Promise.resolve());

```
