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
        var async: boolean | undefined = undefined;
        var desc = '';
        if (title) {
            var ltitle = title.toLocaleLowerCase()
            if (ltitle.startsWith('http://') || ltitle.startsWith('https://')) {
                url = title
            }
        }
        if (!url || url === window.origin || url === `${window.origin}/`) {
            var keywordsService = this.locate(IKeywordsService)
            await Promise.all([
                sleep(200).then(() => {
                    if (async === undefined) {
                        async = true;
                    }
                }),
                keywordsService.get(title).then((s) => {
                    url = s.efficialUrl;
                    desc = s.description || '';
                    if (async === undefined) {
                        async = false;
                    }
                })
            ])
        }
        var u = new URL(url || '')
        var newTab = u.hostname !== window.location.hostname
        var articleView = !newTab && u.hash.startsWith('#/article/')
        var articlePath = articleView ? decodeURIComponent(u.hash.slice('#/article'.length)) : undefined
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
        if ((async && newTab) || desc || articlePath) {
            this.locate(IViewService).prompt(
                url ? { title, subTitle: this.locate(ILangsService).get(LangKeys.ComfireJump) + url } : title, [
                ...(desc ? [{
                    type: 'Markdown',
                    value: desc
                }] : (articlePath ? [{
                    type: 'Article',
                    value: articlePath
                }] : []))
            ], async () => {
                open();
                return true;
            })
        } else {
            open();
        }
    }
}