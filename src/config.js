import localConfig from "./config-local";
import devConfig from "./config-dev";

const env = "dev"
let config
switch (env) {
    case "local":
        config = localConfig
        break
    case "dev":
        config = devConfig
        break
    default:
        throw new Error("env config error: " + env);
}
export default config