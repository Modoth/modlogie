import INavigationService from "./INavigationService";
import IServicesLocator from "../../common/IServicesLocator";
import IKeywordsService from "../../domain/IKeywordsService";
import IViewService from "./IViewService";
import ILangsService, { LangKeys } from "../../domain/ILangsService";
import sleep from "../../common/sleep";

export default class NavigationService extends IServicesLocator implements INavigationService {
    async promptGoto(title?: string, url?: string): Promise<void> {
        if (!url || !title) {
            return
        }
        var keywordsService = this.locate(IKeywordsService)
        var async: boolean | undefined = undefined;
        if (!url || url === window.origin || url === `${window.origin}/`) {
            await Promise.all([
                sleep(200).then(() => {
                    if (async === undefined) {
                        async = true;
                    }
                }),
                keywordsService.getUrl(title).then((s) => {
                    url = s;
                    if (async === undefined) {
                        async = false;
                    }
                })
            ])
        }
        if (!url) {
            return
        }
        var u = new URL(url)
        var newTab = u.hostname !== window.location.hostname

        const open = () => {
            if (!newTab) {
                window.location.href = url!;
            } else {
                window.open(url, '_blank');
            }
        }
        console.log({ async, newTab })
        if (async && newTab) {
            this.locate(IViewService).prompt(this.locate(ILangsService).get(LangKeys.ComfireJump), [
                {
                    type: 'Label',
                    value: url
                },
            ], async () => {
                open();
                return true;
            })
        } else {
            open();
        }
    }
}