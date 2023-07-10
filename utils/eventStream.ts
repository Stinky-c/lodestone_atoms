import { EventStream } from "https://raw.githubusercontent.com/Lodestone-Team/lodestone-macro-lib/main/events.ts";
const _textDecoder: TextDecoder = new TextDecoder();

export class ConsoleEventStream extends WritableStream {
  readonly locked: boolean = false;
  event_stream: EventStream;

  public constructor(eventStream: EventStream) {
    super(
      {
        async write(
          c: Uint8Array,
          _controller: WritableStreamDefaultController,
        ) {
          await eventStream.emitConsoleOut(_textDecoder.decode(c));
        },

        async start(_controller: WritableStreamDefaultController) {},

        close() {},

        abort(reason?: any) {
          throw new Error("`Abort` not implemented.");
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
