import { QueueCallback } from './ICallback';

export class AjaxQueue {
    public onError?: () => void;

    private queue: QueueCallback[];
    private isIdle: boolean;
    private callBackParams: any[];

    public constructor() {
        this.queue = [];
        this.callBackParams = [];
        this.isIdle = true;
        console.log('[0] Created new Queue.');
    }

    public add(callback: QueueCallback, parameters?: {}): void {
        this.queue.push(callback);
        this.callBackParams.push(parameters);

        console.log('[0] Adding new task.');

        if (this.isIdle) {
            this.isIdle = false;
            this.execute(1);
        } else {
            console.log('[0] Still executing other tasks. Request was queued.');
        }
    }

    private execute(round: number): void {
        if (this.queue && this.queue.length > 0) {
            const firstRequest = this.queue.shift();
            const requestParams = this.callBackParams.shift();

            if (firstRequest !== undefined && requestParams !== undefined) {
                console.log('[' + round + '] Executing ' + firstRequest.name);

                firstRequest(requestParams)
                    .then(() => {
                        console.log(
                            '[' +
                                round +
                                '] Task executed, starting on next one.',
                        );

                        this.execute(round + 1);
                    })
                    .catch(() => {
                        console.error(
                            '[' +
                                round +
                                '] Failed to execute task. Emptying queue.',
                        );

                        this.queue.length = 0;
                        this.callBackParams.length = 0;

                        if (this.onError !== undefined) {
                            console.error('[' + round + '] Calling onError.');
                            this.onError();
                        }
                        this.isIdle = true;
                    });
            } else {
                if (firstRequest === undefined) {
                    console.log('[' + round + '] Request is undefined');
                } else if (requestParams === undefined) {
                    console.log(
                        '[' + round + '] Request Parameters are undefined',
                    );
                }
            }
        } else {
            this.isIdle = true;

            console.log(
                '[' +
                    round +
                    '] All tasks complete. Going into Idle mode: ' +
                    this.isIdle,
            );
        }
    }
}
