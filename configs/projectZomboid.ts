// import { SetupManifest } from "https://raw.githubusercontent.com/Lodestone-Team/lodestone-atom-lib/main/mod.ts";
import {SectionManifest} from "https://raw.githubusercontent.com/Lodestone-Team/lodestone_core/dev/deno_bindings/SectionManifest.ts"

// Class Config
export interface ProjectZomboidConfig {
  // Instance configs
  uuid: string;
  name: string;
  description: string;
  path: string;

  // common server configs
  port_1: number;
  port_2: number;
}

/*
interface ProjectZomboidJson {
  mainClass: string;
  classpath: string[];
  vmArgs: string[];
}
*/

// Manifest options

export const ProjectZomboidManifest: Record<string, SectionManifest> = {
    "game_conf": {
      section_id: "game_conf",
      name: "Game Config",
      description: "Basic Server Configuration",
      settings: {
        "nightlengthmodifier": {
          setting_id: "nightlengthmodifier",
          name: "Night Length Modifier",
          description:
            "Controls the LENGTH of night. 1.0 is standard (please note length of night now adjusts based on the season too so it will be longer or shorter during different months of the game) if you change it to 0.5 for example the night will be half as long as usual.",
          value: null,
          value_type: { type: "Float", min: 0.0, max: 1.0 },
          default_value: { type: "Float", value: 1.0 },
          is_secret: false,
          is_required: true,
          is_mutable: true,
        },
        "PVP": {
          setting_id: "PVP",
          name: "PVP",
          description:
            "Allow PVP (still has a toggle for each player by default).",
          value: null,
          value_type: { type: "Boolean" },
          default_value: { type: "Boolean", value: true },
          is_mutable: true,
          is_required: true,
          is_secret: false,
        },
        "PauseEmpty": {
          setting_id: "PauseEmpty",
          name: "Pause When Empty",
          description:
            "The server will be progressing constantly (days will pass, crops will grow, zombies will migrate). If changed to true the server will pause when no players are logged in.",
          value: null,
          value_type: { type: "Boolean" },
          default_value: { type: "Boolean", value: false },
          is_mutable: true,
          is_required: true,
          is_secret: false,
        },
        "GlobalChat": {
          setting_id: "GlobalChat",
          name: "Enable Global Chat",
          description:
            "Enable Global Chat (/all command in chat). This allows players to chat regardless of distance.",
          value: null,
          value_type: { type: "Boolean" },
          default_value: { type: "Boolean", value: true },
          is_mutable: true,
          is_required: true,
          is_secret: false,
        },
        "Open": {
          setting_id: "Open",
          name: "Open",
          description: "Open to all (no whitelist)",
          value: null,
          value_type: { type: "Boolean" },
          default_value: { type: "Boolean", value: true },
          is_mutable: true,
          is_required: true,
          is_secret: false,
        },
        "LogLocalChat": {
          setting_id: "LogLocalChat",
          name: "Log Local Chat",
          description: "Log the local chat in the chat window (client side).",
          value: null,
          value_type: { type: "Boolean" },
          default_value: { type: "Boolean", value: true },
          is_mutable: true,
          is_required: true,
          is_secret: false,
        },
        "AutoCreateUserInWhiteList": {
          setting_id: "AutoCreateUserInWhiteList",
          name: "Auto Create User In Whitelist",
          description:
            'When changed to "true" this allows any new user accounts to be added automatically when joining the server. By default you have to create the users manually using the "adduser" command in the server console or "/adduser" when logged in as the admin',
          value: null,
          value_type: { type: "Boolean" },
          default_value: { type: "Boolean", value: true },
          is_mutable: true,
          is_required: true,
          is_secret: false,
        },
        "DisplayUserName": {
          setting_id: "DisplayUserName",
          name: "Display Username",
          description:
            "When changed to \"false\" you don't see others players username on above of their head + their name won't be logged inside the local chat.",
          value: null,
          value_type: { type: "Boolean" },
          default_value: { type: "Boolean", value: true },
          is_mutable: true,
          is_required: true,
          is_secret: false,
        },
        "SafetySystem": {
          setting_id: "SafetySystem",
          name: "SafetySystem",
          description:
            "Allow the user to change their safety (if false and if PVP=true, then the safety will always be off).",
          value: null,
          value_type: { type: "Boolean" },
          default_value: { type: "Boolean", value: true },
          is_mutable: true,
          is_required: true,
          is_secret: false,
        },
        "ShowSafety": {
          setting_id: "ShowSafety",
          name: "ShowSafety",
          description:
            "Allow the players to see if someone have his safety off with the skull icon.",
          value: null,
          value_type: { type: "Boolean" },
          default_value: { type: "Boolean", value: true },
          is_mutable: true,
          is_required: true,
          is_secret: false,
        },
        "SafetyToggleTimer":{
          setting_id:"SafetyToggleTimer",
          name: "SafetyToggleTimer",
          description:"When the player disable safety it take some times before HE enable it (tho the other players see it instantly), define it here ",
          value: null,
          value_type:{type:"Integer",min:null,max:null},
          default_value:{type:"Integer",value:100},
          is_mutable:true,
          is_required:true,
          is_secret:false
        },
        "SafetyCooldownTimer":{
          setting_id:"SafetyCooldownTimer",
          name: "SafetyCooldownTimer",
          description:"Every time you hit someone in safety off, add this timer to the cool down before you can actually toggle safety off ",
          value:null,
          value_type:{type:"Integer",min:null,max:null},
          default_value:{type:"Integer",value:120},
          is_mutable:true,
          is_required:true,
          is_secret:false
        },
        "DefaultPort":{
          setting_id:"DefaultPort",
          name: "DefaultPort",
          description:"Default port used by the server ",
          value:null,
          value_type:{type:"Integer",min:0,max:65535},
          default_value:{type:"Integer",value:16261},
          is_mutable:true,
          is_required:true,
          is_secret:true
        },
        "DoLuaChecksum":{
          setting_id:"DoLuaChecksum",
          name: "DoLuaChecksum",
          description:"Do the lua checksum. Players with modified Lua files that differ from the server files will not be able to connect ",
          value:null,
          value_type:{type:"Boolean"},
          default_value:{type:"Boolean",value:true},
          is_mutable:true,
          is_required:true,
          is_secret:false
        },
      },
    },
 };
