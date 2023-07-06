import { mergeReadableStreams } from "https://deno.land/std@0.192.0/streams/merge_readable_streams.ts";
import * as Atom from "https://raw.githubusercontent.com/Lodestone-Team/lodestone-atom-lib/main/mod.ts";
import { EventStream } from "https://raw.githubusercontent.com/Lodestone-Team/lodestone-macro-lib/main/events.ts";

import { ImplInstance } from "./utils/default.ts";
import { LodestoneInstanceState, LodestoneTypes } from "./utils/types.ts";
import { ConsoleEventStream } from "./utils/eventStream.ts";
import { ProjectZomboidConfig } from "./configs/projectZomboid.ts";

export default class ProjectZomboidInstance extends ImplInstance {
  uuid!: string;
  _state: LodestoneInstanceState = LodestoneInstanceState.Stopped;
  path!: string;
  event_stream!: EventStream;
  console_stream!: ConsoleEventStream;
  config!: ProjectZomboidConfig;
  _console_handlers: {
    _consoleWriter?: WritableStreamDefaultWriter<Uint8Array>;
    _consoleReader?: ReadableStreamDefaultReader<Uint8Array>;
    _textEncoder: TextEncoder;
    _textDecoder: TextDecoder;
  } = { _textEncoder: new TextEncoder(), _textDecoder: new TextDecoder() };

  // static
  static restoreConfigName = "restore.json";
  static steamAppId = 380870;

  // TODO: finish configurable options
  // TODO: project zomboid ini configurations

  public async setupManifest(): Promise<Atom.SetupManifest> {
    return {
      setting_sections: {
        "game_conf": {
          section_id: "game_conf",
          name: "Game Config",
          description: "Basic Server Configuration",
          settings: {
            "port_1": {
              setting_id: "port_1",
              name: "Port 1",
              description: "Game port",
              value: null,
              value_type: { type: "UnsignedInteger", min: 0, max: 65535 },
              default_value: { type: "UnsignedInteger", value: 16261 },
              is_secret: false,
              is_required: true,
              is_mutable: true,
            },
            "port_2": {
              setting_id: "port_2",
              name: "Port 2",
              description: "Direct Connect port",
              value: null,
              value_type: { type: "UnsignedInteger", min: 0, max: 65535 },
              default_value: { type: "UnsignedInteger", value: 16262 },
              is_secret: false,
              is_required: true,
              is_mutable: true,
            },
          },
        },
      },
    };
  }

  public async configurableManifest(): Promise<Atom.ConfigurableManifest> {
    return {
      auto_start: false,
      restart_on_crash: false,
      setting_sections: {},
    };
  }
  public async setup(
    setupValue: Atom.SetupValue,
    dotLodestoneConfig: Atom.DotLodestoneConfig,
    path: string,
  ): Promise<void> {
    console.log("Started Setup");

    this.uuid = dotLodestoneConfig.uuid;
    let port_1: number = this.identity(
      setupValue,
      "game_conf",
      "port_1",
      LodestoneTypes.UnsignedInteger,
    );
    let port_2: number = this.identity(
      setupValue,
      "game_conf",
      "port_2",
      LodestoneTypes.UnsignedInteger,
    );

    this.config = {
      uuid: this.uuid,
      name: setupValue.name,
      description: setupValue.description ?? "",
      path: path,

      port_1: port_1,
      port_2: port_2,
    };

    // write config to file
    await this.saveConfig(
      this.config,
      `${path}/${ProjectZomboidInstance.restoreConfigName}`,
    );

    await Deno.writeTextFile(
      path + "/" + "steam_appid.txt",
      ProjectZomboidInstance.steamAppId.toString(),
    );
    this.event_stream = new EventStream(this.uuid, this.config.name);
    this.console_stream = new ConsoleEventStream(this.event_stream);

    // Install process
    await this._Install(ProjectZomboidInstance.steamAppId.toString(), path); // Add to a task?

    console.log("Install complete!");
    return;
  }

  public async restore(
    dotLodestoneConfig: Atom.DotLodestoneConfig,
    path: string,
  ): Promise<void> {
    this.uuid = dotLodestoneConfig.uuid;
    this.config = await this.readConfig(
      `${path}/${ProjectZomboidInstance.restoreConfigName}`,
    ) as ProjectZomboidConfig;
    this.event_stream = new EventStream(this.uuid, this.config.name);
    this.console_stream = new ConsoleEventStream(this.event_stream);

    return;
  }

  public async start(caused_by: Atom.CausedBy, block: boolean): Promise<void> {
    // State updates
    console.log("start");
    this.event_stream.emitStateChange(LodestoneInstanceState.Running);
    this._state = LodestoneInstanceState.Running;

    // process start and stdout, stderr, and stdin handling
    const cmd = new Deno.Command(`${this.config.path}/start-server.sh`, {
      stdin: "piped",
      stderr: "piped",
      stdout: "piped",
    }).spawn();

    this._console_handlers._consoleWriter = cmd.stdin.getWriter();
    /*
    mergeReadableStreams(cmd.stdout, cmd.stderr).pipeTo(this.console_stream, {
      preventAbort: true,
      preventCancel: true,
    });
    */
    mergeReadableStreams(cmd.stdout, cmd.stderr).pipeTo(Deno.stdout.writable, {
      preventAbort: true,
      preventCancel: true,
    });

    console.log("Startup complete!");
    return;
  }

  public async stop(caused_by: Atom.CausedBy, block: boolean): Promise<void> {
    console.log("stop", caused_by);
    this._state = LodestoneInstanceState.Stopped;
    this.writeConsole("quit");
    this.event_stream.emitStateChange(LodestoneInstanceState.Running);
    return;
  }

  public restart(caused_by: Atom.CausedBy, block: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public kill(caused_by: Atom.CausedBy): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async state(): Promise<Atom.InstanceState> {
    return this._state;
  }

  public async sendCommand(
    command: string,
    caused_by: Atom.CausedBy,
  ): Promise<void> {
    const message = this._console_handlers._textEncoder.encode(command);
    this._console_handlers._consoleWriter?.write(message);
    this.event_stream.emitConsoleOut(`Got command: ${command}`);
    console.log(`Got command: ${command}`);
  }

  public monitor(): Promise<Atom.PerformanceReport> {
    throw new Error("Method not implemented.");
  }

  public async name(): Promise<string> {
    return this.config.name;
  }

  public version(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  public game(): Promise<Atom.Game> {
    throw new Error("Method not implemented.");
  }

  public async description(): Promise<string> {
    return this.config.description;
  }

  public async port(): Promise<number> {
    return this.config.port_1;
  }

  public getAutoStart(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  public getRestartOnCrash(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  public async setName(name: string): Promise<void> {
    this.config.name = name;
  }

  public async setDescription(description: string): Promise<void> {
    this.config.description = description;
  }

  public async setPort(port: number): Promise<void> {
    throw new Error("Method not implemented");
  }

  public setAutoStart(auto_start: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public setRestartOnCrash(restart_on_crash: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public playerCount(): Promise<number> {
    throw new Error("Method not implemented.");
  }

  public maxPlayerCount(): Promise<number> {
    throw new Error("Method not implemented.");
  }

  public playerList(): Promise<Atom.GenericPlayer[]> {
    throw new Error("Method not implemented.");
  }

  public updateConfigurable(
    section_id: string,
    setting_id: string,
    value: Atom.ConfigurableValue,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  private async _Install(steamAppId: string, path: string) {
    const tmpcmd = new Deno.Command("which", {
      args: ["steamcmd"],
      stdout: "null",
      stderr: "null",
    }).spawn();
    const testSteamcmd = await tmpcmd.status;
    if (!testSteamcmd.success) {
      throw new Error("Missing Steamcmd");
    }
    console.log("Installing server files!");

    const installGame = new Deno.Command("steamcmd", {
      args: [
        `+force_install_dir ${path + "/"}`,
        "+login anonymous ",
        `+app_update ${steamAppId} validate`,
        "+quit",
      ],
      stdout: "null",
      stderr: "piped",
    });
    const process = installGame.spawn();
    process.ref();

    const installStatus = await process.status;
    if (!installStatus.success) {
      throw new Error("Install process failed!");
    }
  }

  //#region - Console handlers
  private checkConsole() {
    if (this._console_handlers._consoleReader == undefined) {
      throw new Error("Missing consoleReader");
    }
    if (this._console_handlers._consoleWriter === undefined) {
      throw new Error("Missing consoleWriter");
    }
  }
  private writeConsole(text: string) {
    this.checkConsole();
    this._console_handlers._consoleWriter?.write(
      this._console_handlers._textEncoder.encode(text),
    );
  }
}
