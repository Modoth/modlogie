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
        var desc = '';
        if (!url || url === window.origin || url === `${window.origin}/`) {
            await Promise.all([
                sleep(200).then(() => {
                    if (async === undefined) {
                        async = true;
                    }
                }),
                keywordsService.get(title).then((s) => {
                    url = s.url;
                    desc = s.description || '';
                    if (async === undefined) {
                        async = false;
                    }
                })
            ])
        }

        var newTab = new URL(url || '').hostname !== window.location.hostname
        const open = () => {
            if (!url) {
                return
            }
            if (!newTab) {
                window.location.href = url!;
            } else {
                window.open(url, '_blank');
            }
        }
        if ((async && newTab) || desc) {
            this.locate(IViewService).prompt(
                url ? { title, subTitle: this.locate(ILangsService).get(LangKeys.ComfireJump) + url } : title, [
                ...(desc ? [{
                    type: 'Markdown',
                    value: desc
                }] : [])
            ], async () => {
                open();
                return true;
            })
        } else {
            open();
        }
    }
}