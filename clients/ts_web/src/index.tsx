import React from 'react'
import ReactDOM from 'react-dom'
import 'antd/dist/antd.less'

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
import IPluginInfo, { PluginsConfig } from './plugins/IPluginInfo'
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
import ConfigKeys, { get_ARTICLE_SECTIONS, get_ARTICLE_TAGS, get_SUB_TYPE_TAG, get_DISPLAY_NAME } from './app/ConfigKeys'
import logoImg from './assets/logo.png'
import IMmConverter from './domain/IMmConverter'
import MmConverter from './domain/MmConverter'
import ISubjectsExporter from './domain/ISubjectsExporter'
import SubjectsExporter from './domain/SubjectsExporter'
import IUsersService from './domain/IUsersService'
import UsersService from './domain/UsersService'
import { UsersServiceClient } from './apis/UsersServiceClientPb'
import IPasswordStorage from './domain/IPasswordStorage'
import LocalPasswordStorage from './domain/LocalPasswordStorage'
import IFavoritesStorage from './domain/IFavoritesStorage'
import LocalFavoritesStorage from './domain/LocalFavoritesStorage'
import IFavoritesServer from './domain/IFavoritesServer'
import FavoritesServerSingleton from './domain/FavoritesServerSingleton'
import ILikesService from './domain/ILikesService'
import LikesService from './domain/LikesService'
import INavigationService from './view/services/INavigationService'
import NavigationService from './view/services/NavigationService'
import IKeywordsService from './domain/IKeywordsService'
import KeywordsService from './domain/KeywordsService'
import { KeywordsServiceClient } from './apis/KeywordsServiceClientPb'
import LangInterpretersService from './domain/LangInterpretersService'
import ILangInterpretersService from './domain/ILangInterpretersService'
import { BashInterpreter } from './domain/Interpreters/BashInterpreter'
import { CInterpreter } from './domain/Interpreters/CInterpreter'
import IDictService from './domain/IDictService'
import DictService from './domain/DictService'
import Blog from './plugins/blog'
import Chart from './plugins/chart'
import H5App from './plugins/h5app'
import H5 from './plugins/h5'
import Math from './plugins/math'
import ModLang from './plugins/modlang'
import ResFile from './plugins/resfile'

const loadPlugins = async (serviceLocator: ServicesLocator): Promise<void> => {
  const pluginInfos = new Map<string, { new(typeNames: string[]): IPluginInfo }>([
    Blog, Chart, H5, H5App, Math, ModLang, ResFile
  ].map(i => [i.name.toLocaleLowerCase(), i]))
  var configsService = serviceLocator.locate(IConfigsService)
  var tagsService = serviceLocator.locate(ITagsService)
  var enabledPlugins = await (await configsService.getValueOrDefault(ConfigKeys.PLUGINS)).split(',').map(c => c.trim()).filter(c => c);
  var plugins = [];
  for (var p of enabledPlugins) {
    let [pluginName, ...names] = p.split(' ').map(c => c.trim()).filter(c => c);
    let plugin: IPluginInfo | undefined;
    let hiddenPlugin = false;
    pluginName = pluginName.toLocaleLowerCase()
    if (pluginName.startsWith('_')) {
      hiddenPlugin = true;
      pluginName = pluginName.slice(1);
    }
    let orderByPublishedDesc = false
    if (pluginName.startsWith('^')) {
      orderByPublishedDesc = true;
      pluginName = pluginName.slice(1);
    }
    if (pluginInfos.has(pluginName)) {
      plugin = new (pluginInfos.get(pluginName)!)(names)
    }
    if (plugin) {
      if (hiddenPlugin) {
        plugin.types.forEach(t => {
          t.admOnly = true
        })
      }
      if (orderByPublishedDesc) {
        plugin.types.forEach(t => {
          t.orderBy = 'Published'
          t.orderByDesc = true
        })
      }
      plugins.push(plugin);
    }
  }
  await configsService.addDefaultConfigs(...plugins.flatMap(p => p.defaultConfigs))
  await Promise.all(plugins.map(p => p.init(configsService)))
  await configsService.addDefaultConfigs(...plugins.flatMap(p => p.types).flatMap(t =>
    [
      new Config(get_ARTICLE_TAGS(t.name), ConfigType.STRING),
      new Config(get_SUB_TYPE_TAG(t.name), ConfigType.STRING),
      new Config(get_DISPLAY_NAME(t.name), ConfigType.STRING, t.name)
    ].concat(!t.fixedSections ? [new Config(get_ARTICLE_SECTIONS(t.name), ConfigType.STRING, t.defaultSections)] : [])))
  var types = plugins.flatMap(p => p.types)
  const subjectServices = serviceLocator.locate(ISubjectsService);
  for (var type of types) {
    type.subTypeTag = await configsService.getValueOrDefault(get_SUB_TYPE_TAG(type.name))
    if (type.subTypeTag) {
      type.subTypes = (await tagsService.get(type.subTypeTag))?.values
    }
    var displayName = await configsService.getValueOrDefault(get_DISPLAY_NAME(type.name))
    if (!displayName) {
      continue;
    }
    type.displayName = displayName;
    var rootSubjectPath = `/${type.displayName}`

    var rootSubject = await subjectServices.getByPath(rootSubjectPath)
    if (rootSubject) {
      type.rootSubjectId = rootSubject.id;
      type.initArticleCount = rootSubject.totalArticleCount;
      type.iconUrl = rootSubject.resourceUrl;
    }
  }

  await configsService.addDefaultConfigs(...plugins.flatMap(p => p.types).filter(t => !t.fixedSections).flatMap(t =>
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
  serviceLocator.registerInstance(IMmConverter, new MmConverter())
  serviceLocator.registerInstance(ISubjectsExporter, new SubjectsExporter())
  serviceLocator.registerInstance(IUsersService, new UsersService())
  if (window.localStorage) {
    serviceLocator.registerInstance(IPasswordStorage, new LocalPasswordStorage())
    serviceLocator.registerInstance(IFavoritesStorage, new LocalFavoritesStorage())
  }
  serviceLocator.registerInstance(IFavoritesServer, new FavoritesServerSingleton())
  serviceLocator.registerInstance(IKeywordsService, new KeywordsService());
  serviceLocator.registerInstance(IDictService, new DictService());
  serviceLocator.register(ILikesService, LikesService);
  serviceLocator.register(INavigationService, NavigationService);

  var interpretersService = new LangInterpretersService()
  serviceLocator.registerInstance(ILangInterpretersService, interpretersService)
  interpretersService.set(new BashInterpreter())
  interpretersService.set(new CInterpreter())

  var clientHost = window.origin + '/api';
  serviceLocator.registerFactory(LoginServiceClient, () => new LoginServiceClient(clientHost, null, null));
  serviceLocator.registerFactory(KeyValuesServiceClient, () => new KeyValuesServiceClient(clientHost, null, null));
  serviceLocator.registerFactory(TagsServiceClient, () => new TagsServiceClient(clientHost, null, null));
  serviceLocator.registerFactory(FilesServiceClient, () => new FilesServiceClient(clientHost, null, null));
  serviceLocator.registerFactory(UsersServiceClient, () => new UsersServiceClient(clientHost, null, null));
  serviceLocator.registerFactory(KeywordsServiceClient, () => new KeywordsServiceClient(clientHost, null, null));

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
