/// <reference path="../typings/tsd.d.ts" />

export  class BaseError implements Error {
    message: string;
    name: string;
    rawError: Error|NodeJS.ErrnoException;

    constructor(message?: string, rawError?: Error|NodeJS.ErrnoException, name?: string) {
        this.message = message;
        this.rawError = rawError;
        this.name = name;
    }
}

export class NotImplementedError extends BaseError {
    constructor() {
        super("Not Implemented.");
    }
}

export class ReadFileError extends BaseError {
    constructor(message: string, rawError: Error|NodeJS.ErrnoException) {
        super(message, rawError);
    }
}

export class WriteFileError extends BaseError {
    constructor(message: string, rawError: Error|NodeJS.ErrnoException) {
        super(message, rawError);
    }
}

export class CreateDirectoryError extends BaseError {
    constructor(message: string, rawError: Error|NodeJS.ErrnoException) {
        super(message, rawError);
    }
}

export class AuthRequiredError extends BaseError {
    constructor(message: string) {
        super(message);
    }
}

export class AuthFailedError extends BaseError {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidConfigError extends BaseError {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidTypeError extends BaseError {
    constructor(message: string) {
        super(message);
    }
}

export class UnknownProtocolError extends BaseError {
    constructor(message: string) {
        super(message);
    }
}

export class GitCommandExecError extends BaseError {
    stderr: string;
    constructor(message: string, stderr?: string) {
        super(message);
        this.stderr = stderr;
    }
}
