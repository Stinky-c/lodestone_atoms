import { EventStream } from "https://raw.githubusercontent.com/Lodestone-Team/lodestone-macro-lib/main/events.ts";
const _textDecoder: TextDecoder = new TextDecoder();

export class ConsoleEventStream extends WritableStream {
  readonly locked: boolean = false;
  event_stream: EventStream;

  public constructor(eventStream: EventStream) {
    super(
      {
        async write(c: Uint8Array, _c2) {
          await eventStream.emitConsoleOut(_textDecoder.decode(c));
        },
        async start(_c2) {
          return Promise.resolve();
        },
        close() {
          console.log("");
          return Promise.resolve();
        },
        abort(reason?: any) {
          Promise.resolve();
        },
      },
    );

    this.event_stream = eventStream;
  }

  abort(reason?: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  close(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  getWriter(): WritableStreamDefaultWriter<any> {
    throw new Error("Method not implemented.");
  }
}
