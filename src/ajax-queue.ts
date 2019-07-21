// Interface for Callbacks passed to the queue
export type QueueCallback = (...args: any[]) => Promise<void>;

export class AjaxQueue {
    public onError?: () => void;

    private queue: QueueCallback[];
    private callBackParams: any[];
    private callbackSignatures: string[];
    private logsEnabled: boolean;
    private isIdle: boolean;
    private round: number;

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

    private log(level: 'log' | 'error', message: string): void {
        if (this.logsEnabled) {
            console[level]('[' + this.round + '] ' + message);
        }
    }
}
