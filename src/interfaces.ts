export interface CloneConfig {
    name: string;
    protocol: string;
    directory: string;
}

export interface CloneArguments {
    url: string;
    directory: string;
}

export interface ConfigJson {
    endpoint: string;
    type: string;
    name: string;
    defaultProtocol: string;
    repos: CloneConfig[];
    ignore: string[];
    cloned: string[];
}

export interface GitRepository {
    name: string;
    sshUrl: string;
    httpsUrl: string;
}
