import IKeywordsService from "./IKeywordsService";
import sleep from "../common/sleep";
import IServicesLocator from "../common/IServicesLocator";
import IConfigsService from "./IConfigsSercice";
import ConfigKeys from "../app/ConfigKeys";

export default class KeywordsService extends IServicesLocator implements IKeywordsService {
    private loaded = false;
    async getUrl(keyword: string): Promise<string> {
        if (!this.loaded) {
            this.loaded = true;
        }
        var url = await this.locate(IConfigsService).getValueOrDefault(ConfigKeys.SEARCH_URL)
        if (!url) {
            return url;
        }
        url = url.replace('${keyword}', keyword);
        return url;
    }
}