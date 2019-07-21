// Interface for Callbacks passed to the queue
export type QueueCallback = (...args: any[]) => Promise<void>;

export class AjaxQueue {
    // Callback to the executed in case of a rejected Promise
    public onError?: () => void;
    private queue: QueueCallback[];
    private callBackParams: any[];
    private callbackSignatures: string[];
    private logsEnabled: boolean;
    private isIdle: boolean;
    private round: number;

    /**
     * Creates a AjaxQueue instance.
     *
     * @param disableLogs Controls whether or not to output any logging messages
     */
    public constructor(disableLogs: boolean = false) {
        this.queue = [];
        this.callbackSignatures = [];
        this.callBackParams = [];

        this.isIdle = true;
        this.round = 0;
        this.logsEnabled = !disableLogs;

        if (this.logsEnabled) {
            console.log('[-] Created new Queue.');
        }
    }

    /**
     * Adds a callback to the queue and if no other task is being executed, it
     * will immediately start executing the passed callback.
     *
     * @param callback The callback to be executed.
     * @param args The parameters to be passed to the callback
     */
    public add(callback: QueueCallback, ...args: any[]): void {
        let params: string = JSON.stringify(args);
        params = params.substring(1, params.length - 1);

        let signature = callback.name !== '' ? callback.name : 'anonymous_function';
        signature += '(' + params + ')';
        this.callbackSignatures.push(signature);

        this.queue.push(callback);
        this.callBackParams.push(args);
        const message = 'Adding ' + signature;

        if (this.isIdle) {
            this.log('log', message);
            this.isIdle = false;
            this.execute();
        } else {
            this.log('log', message + '\n    -> Queued, still executing other tasks.');
        }
    }

    /**
     * Executes the first callback in the queue. If the callback terminates
     * success (returns a resolved Promise) the next callback in the queue
     * will be executed. If a rejected Promise is returned by the callback
     * then the function will empty remove the remaining callbacks from the
     * queue.
     *
     * WARNING: At the moment the function cannot handle cases where you
     * forget to return a Promise. So make sure to return a Promise in
     * every case.
     */
    private execute(): void {
        if (this.queue && this.queue.length > 0) {
            this.round += 1;
            const callback = this.queue.shift();
            const parameters = this.callBackParams.shift();
            const signature = this.callbackSignatures.shift();

            if (callback !== undefined && parameters !== undefined) {
                this.log('log', 'Executing ' + signature);

                callback(...parameters)
                    .then(() => {
                        this.log('log', signature + ' executed, starting on next one.');
                        this.execute();
                    })
                    .catch(() => {
                        this.log('error', 'Error in ' + signature + '. Emptying queue.');
                        this.queue.length = 0;
                        this.callBackParams.length = 0;
                        this.round = 0;

                        if (this.onError !== undefined) {
                            this.log('error', 'Calling onError.');
                            this.onError();
                        }
                        this.isIdle = true;
                    });
            } else {
                if (callback === undefined) {
                    this.log('log', 'Request is undefined');
                } else if (parameters === undefined) {
                    this.log('log', 'Request Parameters are undefined');
                }
            }
        } else {
            this.isIdle = true;
            this.round = 0;
            this.log('log', 'All tasks complete. Going into Idle mode');
        }
    }

    /**
     *
     * @param level Controls the level of the logs.
     * @param message The text to be logged.
     */
    private log(level: 'log' | 'error', message: string): void {
        if (this.logsEnabled) {
            console[level]('[' + this.round + '] ' + message);
        }
    }
}
