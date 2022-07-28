import { Config } from 'node-ssh';

declare type Options = Config & {
    distPath?: string;
    serverPath?: string;
    installNpmPackage?: boolean;
    zipFileame?: string;
};
declare function deploy(options: Options): void;

export { deploy as default };
