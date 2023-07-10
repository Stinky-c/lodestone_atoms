import { mergeReadableStreams } from "https://deno.land/std@0.192.0/streams/merge_readable_streams.ts";
import * as Atom from "https://raw.githubusercontent.com/Lodestone-Team/lodestone-atom-lib/main/mod.ts";
import { EventStream } from "https://raw.githubusercontent.com/Lodestone-Team/lodestone-macro-lib/main/events.ts";

import { ImplInstance } from "./utils/default.ts";
import { LodestoneInstanceState, LodestoneTypes } from "./utils/types.ts";
import { ConsoleEventStream } from "./utils/eventStream.ts";
import { ProjectZomboidConfig,ProjectZomboidManifest } from "./configs/projectZomboid.ts";

export default class ProjectZomboidInstance extends ImplInstance {
  uuid!: string;
  _state: LodestoneInstanceState = LodestoneInstanceState.Stopped;
  path!: string;
  console_stream!: ConsoleEventStream;
  config!: ProjectZomboidConfig;
  _consoleWriter?: WritableStreamDefaultWriter<Uint8Array>;
  _textEncoder: TextEncoder = new TextEncoder();

  // static
  static restoreConfigName = "restore.json";
  static steamAppId = 380870;

  // TODO: finish configurable options
  // TODO: project zomboid ini configurations

  public async setupManifest(): Promise<Atom.SetupManifest> {
    return {setting_sections:ProjectZomboidManifest};
  }

  public async configurableManifest(): Promise<Atom.ConfigurableManifest> {
    return {
      auto_start: false,
      restart_on_crash: false,
      setting_sections: ProjectZomboidManifest,
    };
  }

  public async setup(
    setupValue: Atom.SetupValue,
    dotLodestoneConfig: Atom.DotLodestoneConfig,
    path: string,
  ): Promise<void> {
    console.log("Started Setup");

    this.uuid = dotLodestoneConfig.uuid;
    const port_1: number = this.identity(
      setupValue,
      "game_conf",
      "port_1",
      LodestoneTypes.UnsignedInteger,
    );
    const port_2: number = this.identity(
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

    // Install game files
    await this._Install(ProjectZomboidInstance.steamAppId.toString(), path); // wait for ProgressionEvent to be implemented
    // https://discord.com/channels/1061833018496532531/1061833019138256989/1126703169464959076

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
  // TODO: use the system for long running processes
  public async start(caused_by: Atom.CausedBy, block: boolean): Promise<void> {
    // State updates
    await this.updateState(LodestoneInstanceState.Starting);

    // process start and stdout, stderr, and stdin handling
    const cmd = new Deno.Command(`${this.config.path}/start-server.sh`, {
      stdin: "piped",
      stderr: "piped",
      stdout: "piped",
    }).spawn();
    cmd.ref(); // TODO: find a way to ensure process dies when lodestone closes


    this._consoleWriter = cmd.stdin.getWriter();

    mergeReadableStreams(cmd.stdout, cmd.stderr).pipeTo(
      this.console_stream,
      {preventAbort:true},
    );

    // await EventStream.emitDetach();
    // await this.updateState(LodestoneInstanceState.Running);

    console.log("Startup complete");
    return;
    // Functions randomly stops
    // console.log is called but process still dies?
  }

  public async stop(caused_by: Atom.CausedBy, block: boolean): Promise<void> {
    console.log("stop", caused_by);
    this.updateState(LodestoneInstanceState.Stopping);
    this.writeConsole("quit");
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
    const message = this._textEncoder.encode(command);
    this._consoleWriter?.write(message);
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
        "+login anonymous",
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
    if (this._consoleWriter === undefined) {
      throw new Error("Missing consoleWriter");
    }
  }
  private writeConsole(text: string) {
    this.checkConsole();
    this._consoleWriter?.write(
      this._textEncoder.encode(text),
    );
  }
}
