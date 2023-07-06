export interface ProjectZomboidConfig {
    // Instance configs
    uuid: string;
    name: string;
    description: string;
    path: string;

    // runtime configs
    // java: string;
    // env: ProjectZomboidEnv;
    // json: ProjectZomboidJson;

    // server configs
    port_1: number;
    port_2: number;

}

interface ProjectZomboidJson {
    mainClass: string;
    classpath: string[];
    vmArgs: string[]
}

interface ProjectZomboidEnv {

}
