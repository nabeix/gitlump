import promptly = require("promptly");

export function prompt(message: string, opts?: promptly.Options): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        promptly.prompt(message, opts, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        });
    });
}
