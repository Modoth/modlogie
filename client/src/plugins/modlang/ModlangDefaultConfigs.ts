import ModlangConfigKeys, { ModlangConfigKeysInterface } from "./ModlangConfigKeys";
import { Config, ConfigType } from "../../domain/IConfigsSercice";


class ModlangDefaultConfigsClass implements ModlangConfigKeysInterface<Config> {
    MODLANG_TYPES = new Config(ModlangConfigKeys.MODLANG_TYPES, ConfigType.STRING, "");
}

const ModlangDefaultConfigs: Config[] = Array.from(Object.values(new ModlangDefaultConfigsClass()))

export default ModlangDefaultConfigs;