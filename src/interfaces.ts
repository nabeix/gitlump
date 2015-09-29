export interface AuthInfo {
    username: string,
    password: string
}

export interface RepositoryConfig {
    name: string;
    protocol: string;
    directory: string;
}

export interface AppConfig {
    endpoint: string;
    type: string;
    name: string;
    defaultProtocol: string;
    repos: RepositoryConfig[];
    ignore: string[];
    cloned: string[];
}

export interface GitRepository {
    name: string;
    sshUrl: string;
    httpsUrl: string;
}

export interface CloneConfig {
    name: string,
    directory: string,
    url: string
}
