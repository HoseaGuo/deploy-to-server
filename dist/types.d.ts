import { Config } from 'node-ssh';

interface Options extends Config {
    distPath?: string;
    serverPath?: string;
    installNpmPackage?: boolean;
    zipFileame?: string;
    cleanExclude?: string;
    pm2ConfigFileName?: string;
}
declare function deploy(options: Options): void;

export { deploy as default };
