// deno-lint-ignore-file
import * as Atom from "https://raw.githubusercontent.com/Lodestone-Team/lodestone-atom-lib/main/mod.ts";
import { EventStream } from "https://raw.githubusercontent.com/Lodestone-Team/lodestone-macro-lib/main/events.ts";
import { SetupValue } from "https://raw.githubusercontent.com/Lodestone-Team/lodestone-atom-lib/main/mod.ts";
import { LodestoneInstanceState, LodestoneTypes } from "./types.ts";

/**
 * A base abstract class for atom instances
 */
export abstract class ImplInstance extends Atom.AtomInstance {
  _state: LodestoneInstanceState = LodestoneInstanceState.Stopped;
  event_stream!: EventStream;

  //#region Impl

  public setupManifest(): Promise<Atom.SetupManifest> {
    throw new Error("Method not implemented.");
  }
  public setup(
    setupValue: Atom.SetupValue,
    dotLodestoneConfig: Atom.DotLodestoneConfig,
    path: string,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public restore(
    dotLodestoneConfig: Atom.DotLodestoneConfig,
    path: string,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public start(caused_by: Atom.CausedBy, block: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public stop(caused_by: Atom.CausedBy, block: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public restart(caused_by: Atom.CausedBy, block: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public kill(caused_by: Atom.CausedBy): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public state(): Promise<Atom.InstanceState> {
    throw new Error("Method not implemented.");
  }
  public sendCommand(command: string, caused_by: Atom.CausedBy): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public monitor(): Promise<Atom.PerformanceReport> {
    throw new Error("Method not implemented.");
  }
  public configurableManifest(): Promise<Atom.ConfigurableManifest> {
    throw new Error("Method not implemented.");
  }
  public name(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  public version(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  public game(): Promise<Atom.Game> {
    throw new Error("Method not implemented.");
  }
  public description(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  public port(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  public getAutoStart(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  public getRestartOnCrash(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  public setName(name: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public setDescription(description: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public setPort(port: number): Promise<void> {
    throw new Error("Method not implemented.");
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
  //#endregion impl

  //#region utils

  /**
   * Validates and returns the correct value
   *
   * @param config - The Lodestone SetupValue config
   * @param k1 - The first key location
   * @param k2 - The second key location
   * @param expected - A string enum option to expect
   *
   * @returns The expected type
   */
  public identity<Type>(
    config: SetupValue,
    k1: string,
    k2: string,
    expected: LodestoneTypes,
  ): Type {
    let option = config.setting_sections[k1].settings[k2].value;

    if (option?.type != expected) {
      throw new Error("Unexpected Type");
    }

    // @ts-ignore
    return option.value;
  }

  public async saveConfig<Type>(config: Type, path: string) {
    await Deno.writeTextFile(path, JSON.stringify(config));
  }

  public async readConfig(path: string) {
    return JSON.parse(await Deno.readTextFile(path));
  }
  public async updateState(state: LodestoneInstanceState) {
    this._state = state;
    await this.event_stream.emitStateChange(state);
  }

  //#endregion utils
}
