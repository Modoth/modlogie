import React from 'react'
import ReactDOM from 'react-dom'
import 'antd/dist/antd.css'
import App from './view/App'
import LangsService from './domain/LangsService'
import { ServicesLocatorProvider } from './app/Contexts'
import LoginService from './app/LoginService'
import zhCN from 'antd/es/locale/zh_CN'
import { ConfigProvider } from 'antd'
import ServicesLocator from './common/ServicesLocator'
import IServicesLocator from './common/IServicesLocator'
import ILoginService from './app/ILoginService'
import ILangsService from './domain/ILangsService'
import ISubjectsService from './domain/ISubjectsService'
import SubjectsServiceSingleton from './domain/SubjectsServiceSingleton'
import { PluginsConfig } from './plugins/IPluginInfo'
import { ModlangPluginInfo } from './plugins/modlang'
import IArticleListService, { ArticleListSingletonService } from './domain/IArticleListService'
import Langs from './view/Langs'
import ITextImageService, { TextImageServiceSingleton } from './view/services/ITextImageService'
import ITagsService from './domain/ITagsService'
import IArticleViewServie, { ArticleViewServieSingleton } from './view/services/IArticleViewService'
import IAutoAccountService from './domain/IAutoAccountService'
import { LoginServiceClient } from './apis/LoginServiceClientPb'
import { KeyValuesServiceClient } from './apis/KeyvaluesServiceClientPb'
import { ConfigsServiceSingleton } from './domain/ConfigsServiceSingleton'
import IConfigsService, { Config, ConfigType } from './domain/IConfigsSercice'
import DefaultConfigs from './app/DefaultConfigs'
import { TagsServiceClient } from './apis/TagsServiceClientPb'
import TagsServiceSingleton from './domain/TagsServiceSingleton'
import { FilesServiceClient } from './apis/FilesServiceClientPb'
import IArticleService from './domain/IArticleService'
import ArticleService from './domain/ArticleService'
import BlogPluginInfo from './plugins/blog'
import ConfigKeys, { get_ARTICLE_SECTIONS, get_ARTICLE_TAGS, get_SUB_TYPE_TAG } from './app/ConfigKeys'
// import './assets/images'
import logoImg from './assets/logo.png'

const dynamicSetHead = () => {
  let icon = document.createElement('link');
  icon.rel = 'icon'
  icon.type = 'image/x-icon'
  icon.href = logoImg;
  document.head.appendChild(icon)

  let appTouchIcon = document.createElement('link');
  appTouchIcon.rel = 'apple-touch-icon'
  appTouchIcon.href = logoImg;
  document.head.appendChild(appTouchIcon)

}
dynamicSetHead();


const loadPlugins = async (serviceLocator: ServicesLocator): Promise<void> => {
  var configsService = serviceLocator.locate(IConfigsService)
  var tagsService = serviceLocator.locate(ITagsService)
  var enabledPlugins = await (await configsService.getValueOrDefault(ConfigKeys.PLUGINS)).split(' ').map(c => c.trim()).filter(c => c);
  var plugins = [];
  for (var p of enabledPlugins) {
    switch (p) {
      case 'Modlang':
        plugins.push(new ModlangPluginInfo());
        break
      case 'Blog':
        plugins.push(new BlogPluginInfo());
        break
    }
  }
  await configsService.addDefaultConfigs(...plugins.flatMap(p => p.defaultConfigs))
  await Promise.all(plugins.map(p => p.init(configsService)))
  await configsService.addDefaultConfigs(...plugins.flatMap(p => p.types).flatMap(t =>
    [
      new Config(get_ARTICLE_TAGS(t.name), ConfigType.STRING),
      new Config(get_SUB_TYPE_TAG(t.name), ConfigType.STRING),
      new Config(get_ARTICLE_SECTIONS(t.name), ConfigType.STRING),
    ]))
  var types = plugins.flatMap(p => p.types)
  for (var type of types) {
    type.subTypeTag = await configsService.getValueOrDefault(get_SUB_TYPE_TAG(type.name))
    if (type.subTypeTag) {
      type.subTypes = (await tagsService.get(type.subTypeTag))?.values
    }
  }

  await configsService.addDefaultConfigs(...plugins.flatMap(p => p.types).flatMap(t =>
    t.subTypes && t.subTypes.length ? t.subTypes.map(subType => new Config(get_ARTICLE_SECTIONS(t.name, subType), ConfigType.STRING)) : []))

  serviceLocator.registerInstance(PluginsConfig, new PluginsConfig(plugins))
}

const buildServicesLocator = () => {
  const serviceLocator = new ServicesLocator()
  serviceLocator.registerInstance(IConfigsService, new ConfigsServiceSingleton(DefaultConfigs))
  serviceLocator.registerInstance(ILoginService, new LoginService())
  serviceLocator.registerInstance(ILangsService, new LangsService())
  serviceLocator.registerInstance(IArticleListService, new ArticleListSingletonService())
  serviceLocator.registerInstance(ITextImageService, new TextImageServiceSingleton())
  serviceLocator.registerInstance(ITagsService, new TagsServiceSingleton())
  serviceLocator.registerInstance(IArticleViewServie, new ArticleViewServieSingleton())
  serviceLocator.registerInstance(ISubjectsService, new SubjectsServiceSingleton())
  serviceLocator.registerInstance(IArticleService, new ArticleService())

  var clientHost = window.origin + '/api';
  serviceLocator.registerFactory(LoginServiceClient, () => new LoginServiceClient(clientHost, null, null));
  serviceLocator.registerFactory(KeyValuesServiceClient, () => new KeyValuesServiceClient(clientHost, null, null));
  serviceLocator.registerFactory(TagsServiceClient, () => new TagsServiceClient(clientHost, null, null));
  serviceLocator.registerFactory(FilesServiceClient, () => new FilesServiceClient(clientHost, null, null));

  let w = window as any;
  if (w.autoAccountService) {
    serviceLocator.registerInstance(IAutoAccountService, w.autoAccountService)
  }
  return serviceLocator as IServicesLocator
}

const bootstrap = async () => {
  const serviceLocator = await buildServicesLocator()
  await loadPlugins(serviceLocator as ServicesLocator);
  const loginService = serviceLocator.locate(ILoginService)
  const langsService = serviceLocator.locate(ILangsService)
  const plugins = serviceLocator.locate(PluginsConfig)
  const autoAccountService = serviceLocator.locate(IAutoAccountService)
  const account = await autoAccountService?.get()
  await Promise.all([langsService.load(Langs, ...plugins.Plugins.map(p => p.langs)), account && account.userName && account.password ?
    loginService.login(account.userName!, account.password!).catch((e) => console.log(e)) : loginService.checkLogin()])
  ReactDOM.render(
    <React.StrictMode>
      <ServicesLocatorProvider value={serviceLocator}>
        <ConfigProvider locale={zhCN}>
          <App />
        </ConfigProvider>
      </ServicesLocatorProvider>
    </React.StrictMode>,
    document.getElementById('root')
  )
}

bootstrap()
