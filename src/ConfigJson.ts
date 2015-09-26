interface ConfigJson {
    endpoint: string;
    auth: {};
    type: string;
    name: string;
    defaultProtocol: string;
    repos: any[];
    ignore: string[];
    cloned: string[];
}

export = ConfigJson;
