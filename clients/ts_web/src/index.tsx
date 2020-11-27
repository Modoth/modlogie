import 'antd/dist/antd.less'
import { ArticleListSingletonService } from './app/AppServices/ArticleListService'
import { BashInterpreter } from './domain/Services/Interpreters/BashInterpreter'
import { CInterpreter } from './domain/Services/Interpreters/CInterpreter'
import { ConfigProvider } from 'antd'
import { ConfigsServiceSingleton } from './impl/RemoteServices/ConfigsServiceSingleton'
import { FilesServiceClient } from './impl/remote-apis/FilesServiceClientPb'
import { KeyValuesServiceClient } from './impl/remote-apis/KeyvaluesServiceClientPb'
import { KeywordsServiceClient } from './impl/remote-apis/KeywordsServiceClientPb'
import { LoginServiceClient } from './impl/remote-apis/LoginServiceClientPb'
import { ServicesLocateProvider } from './view/common/Contexts'
import { TagsServiceClient } from './impl/remote-apis/TagsServiceClientPb'
import { UsersServiceClient } from './impl/remote-apis/UsersServiceClientPb'
import { ViewService } from './view/pages/ServiceView'
import AnkiItemsExporter from './domain/Services/AnkiItemsExporter'
import App from './view/App'
import AppArticleServiceSingleton from './app/AppServices/ArticleAppservice'
import ArticleService from './impl/RemoteServices/ArticleService'
import AudioService from './app/AppServices/AudioService'
import Blog from './plugins/blog'
import ConfigKeys, { getArticleSections, getArticleTags, getSubtypeTag, getDisplayName } from './domain/ServiceInterfaces/ConfigKeys'
import CsvItemsExporter from './domain/Services/CsvItemsExporter'
import Data from './plugins/data'
import DefaultConfigs from './app/Interfaces/DefaultConfigs'
import DictService from './domain/Services/DictService'
import EditorsServiceSingleton from './app/AppServices/EditorsServiceSingleton'
import ExternalBlog from './plugins/externalblog'
import FavoritesServerSingleton from './domain/Services/FavoritesServerSingleton'
import H5 from './plugins/h5'
import IAnkiItemsExporter from './domain/ServiceInterfaces/IAnkiItemsExporter'
import IArticleAppservice from './app/Interfaces/IArticleAppservice'
import IArticleListService from './app/Interfaces/IArticleListService'
import IArticleService from './domain/ServiceInterfaces/IArticleService'
import IAudioService from './app/Interfaces/IAudioService'
import IAutoAccountService from './domain/ServiceInterfaces/IAutoAccountService'
import IConfigsService, { Config, ConfigType } from './domain/ServiceInterfaces/IConfigsSercice'
import ICsvItemsExporter from './domain/ServiceInterfaces/ICsvItemsExporter'
import IDictService from './domain/ServiceInterfaces/IDictService'
import IEditorsService from './app/Interfaces/IEditorsService'
import IFavoritesService from './domain/ServiceInterfaces/IFavoritesService'
import IKeyValueStorageManager, { ILocalKeyValueStorage, IRemoteKeyValueStorage } from './domain/ServiceInterfaces/IKeyValueStorage'
import IKeywordsService from './domain/ServiceInterfaces/IKeywordsService'
import ILangInterpretersService from './domain/ServiceInterfaces/ILangInterpretersService'
import ILangsService, { LangKeys } from './domain/ServiceInterfaces/ILangsService'
import ILikesService from './domain/ServiceInterfaces/ILikesService'
import ILoginAppservice from './app/Interfaces/ILoginAppservice'
import IMmConverter from './domain/ServiceInterfaces/IMmConverter'
import INavigationService from './app/Interfaces/INavigationService'
import IPasswordStorage from './domain/ServiceInterfaces/IPasswordStorage'
import IPluginInfo, { PluginsConfig } from './pluginbase/IPluginInfo'
import IRecentFileService from './domain/ServiceInterfaces/IRecentFileService'
import IRemoteServiceInvoker from './infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from './infrac/ServiceLocator/IServicesLocator'
import ISubjectsExporter from './domain/ServiceInterfaces/ISubjectsExporter'
import ISubjectsService from './domain/ServiceInterfaces/ISubjectsService'
import ITagsService from './domain/ServiceInterfaces/ITagsService'
import ITextImageService from './infrac/Image/ITextImageService'
import IUserConfigsService from './domain/ServiceInterfaces/IUserConfigsService'
import IUserLoginService from './domain/ServiceInterfaces/IUserLoginService'
import IUsersService from './domain/ServiceInterfaces/IUsersService'
import IViewService from './app/Interfaces/IViewService'
import IWordsStorage from './domain/ServiceInterfaces/IWordsStorage'
import KeyValueStorageManager from './domain/Services/KeyValueStorageManager'
import KeywordsService from './impl/RemoteServices/KeywordsService'
import LangInterpretersService from './domain/Services/Interpreters/LangInterpretersService'
import Langs from './view/common/Langs'
import LangsService from './domain/Services/LangsService'
import LikesService from './impl/RemoteServices/LikesService'
import LocalKeyValueStorage from './impl/LocalStorages/LocalKeyValueStorage'
import LocalPasswordStorage from './impl/LocalStorages/LocalPasswordStorage'
import LoginService from './app/AppServices/LoginService'
import Math from './plugins/math'
import MmConverter from './domain/Services/MmConverter'
import ModLang from './plugins/modlang'
import NavigationService from './app/AppServices/NavigationService'
import React from 'react'
import ReactDOM from 'react-dom'
import RecentFileService from './domain/Services/RecentFileService'
import RemoteServiceInvoker from './app/AppServices/RemoteServiceInvoker'
import ResFile from './plugins/resfile'
import Seperators from './domain/ServiceInterfaces/Seperators'
import ServicesLocator from './infrac/ServiceLocator/ServicesLocator'
import SubjectsExporter from './domain/Services/SubjectsExporter'
import SubjectsServiceSingleton from './impl/RemoteServices/SubjectsServiceSingleton'
import TagsServiceSingleton from './impl/RemoteServices/TagsServiceSingleton'
import TextImageServiceSingleton from './infrac/Image/TextImageServiceSingleton'
import UserConfigsService from './domain/Services/UserConfigsService'
import UserLoginService from './impl/RemoteServices/UserLoginService'
import UsersService from './impl/RemoteServices/UsersService'
import WordsStorageSingleton from './impl/WordsStorageSingleton'
import zhCN from 'antd/es/locale/zh_CN'

const loadPlugins = async (serviceLocator: ServicesLocator): Promise<void> => {
  const pluginInfos = new Map<
    string,
    { new(typeNames: string[]): IPluginInfo }
      >(
      [Blog, Data, ExternalBlog, H5, Math, ModLang, ResFile].map((i) => [
        i.typeName.toLocaleLowerCase(),
        i
      ])
      )
  const configsService = serviceLocator.locate(IConfigsService)
  const tagsService = serviceLocator.locate(ITagsService)
  const enabledPlugins = await configsService.getFieldsOrDefault(ConfigKeys.PLUGINS)
  const plugins = []
  for (const p of enabledPlugins) {
    let [pluginName, ...names] = p
    let plugin: IPluginInfo | undefined
    let hiddenPlugin = false
    pluginName = pluginName.toLocaleLowerCase()
    if (pluginName.startsWith('_')) {
      hiddenPlugin = true
      pluginName = pluginName.slice(1)
    }
    let orderByPublishedDesc = false
    if (pluginName.startsWith('^')) {
      orderByPublishedDesc = true
      pluginName = pluginName.slice(1)
    }
    if (pluginInfos.has(pluginName)) {
      plugin = new (pluginInfos.get(pluginName)!)(names)
    }
    if (plugin) {
      if (hiddenPlugin) {
        plugin.types.forEach((t) => {
          t.admOnly = true
        })
      }
      if (orderByPublishedDesc) {
        plugin.types.forEach((t) => {
          t.orderBy = 'Published'
          t.orderByDesc = true
        })
      }
      plugins.push(plugin)
    }
  }
  await configsService.addDefaultConfigs(
    ...plugins.flatMap((p) => p.defaultConfigs)
  )
  await Promise.all(plugins.map((p) => p.init(configsService)))
  await configsService.addDefaultConfigs(
    ...plugins
      .flatMap((p) => p.types)
      .flatMap((t) =>
        [
          new Config(getArticleTags(t.name), ConfigType.STRING),
          new Config(getSubtypeTag(t.name), ConfigType.STRING),
          new Config(getDisplayName(t.name), ConfigType.STRING, t.name)
        ].concat(
          !t.fixedSections
            ? [
              new Config(
                getArticleSections(t.name),
                ConfigType.STRING,
                Seperators.joinItems(t.defaultSections || [])
              )
            ]
            : []
        )
      )
  )
  const types = plugins.flatMap((p) => p.types)
  const subjectServices = serviceLocator.locate(ISubjectsService)
  for (const type of types) {
    type.subTypeTag = await configsService.getValueOrDefault(
      getSubtypeTag(type.name)
    )
    if (type.subTypeTag) {
      type.subTypes = (await tagsService.get(type.subTypeTag))?.values
    }
    const displayName = await configsService.getValueOrDefault(
      getDisplayName(type.name)
    )
    if (!displayName) {
      continue
    }
    type.displayName = displayName
    const rootSubjectPath = `/${type.name}`

    const rootSubject = await subjectServices.getByPath(rootSubjectPath)
    if (rootSubject) {
      type.rootSubjectId = rootSubject.id
      type.initArticleCount = rootSubject.totalArticleCount
      type.iconUrl = rootSubject.resourceUrl
    }
  }

  await configsService.addDefaultConfigs(
    ...plugins
      .flatMap((p) => p.types)
      .filter((t) => !t.fixedSections)
      .flatMap((t) =>
        t.subTypes && t.subTypes.length
          ? t.subTypes.map(
            (subType) =>
              new Config(
                getArticleSections(t.name, subType),
                ConfigType.STRING
              )
          )
          : []
      )
  )

  serviceLocator.registerInstance(PluginsConfig, new PluginsConfig(plugins))
}

const buildServicesLocator = () => {
  const serviceLocator = new ServicesLocator()
  serviceLocator.registerInstance(
    IConfigsService,
    new ConfigsServiceSingleton(DefaultConfigs)
  )
  serviceLocator.registerInstance(ILoginAppservice, new LoginService())
  serviceLocator.registerInstance(ILangsService, new LangsService())
  serviceLocator.registerInstance(
    IArticleListService,
    new ArticleListSingletonService()
  )
  serviceLocator.registerInstance(
    ITextImageService,
    new TextImageServiceSingleton()
  )
  serviceLocator.registerInstance(ITagsService, new TagsServiceSingleton())
  serviceLocator.registerInstance(
    IArticleAppservice,
    new AppArticleServiceSingleton()
  )
  serviceLocator.registerInstance(
    ISubjectsService,
    new SubjectsServiceSingleton()
  )
  serviceLocator.registerInstance(IArticleService, new ArticleService())
  serviceLocator.registerInstance(IMmConverter, new MmConverter())
  serviceLocator.registerInstance(ISubjectsExporter, new SubjectsExporter())
  serviceLocator.registerInstance(IUsersService, new UsersService())
  serviceLocator.registerInstance(IUserLoginService, new UserLoginService())
  serviceLocator.registerInstance(IEditorsService, new EditorsServiceSingleton())
  serviceLocator.registerInstance(
    IRemoteServiceInvoker,
    new RemoteServiceInvoker()
  )
  serviceLocator.registerInstance(
    IPasswordStorage,
    new LocalPasswordStorage()
  )
  serviceLocator.registerInstance(
    IFavoritesService,
    new FavoritesServerSingleton()
  )
  serviceLocator.registerInstance(IKeywordsService, new KeywordsService())
  serviceLocator.registerInstance(IDictService, new DictService())
  serviceLocator.register(ILikesService, LikesService)
  serviceLocator.register(INavigationService, NavigationService)
  serviceLocator.register(IWordsStorage, WordsStorageSingleton)
  serviceLocator.register(ICsvItemsExporter, CsvItemsExporter)
  serviceLocator.register(IAnkiItemsExporter, AnkiItemsExporter)

  const interpretersService = new LangInterpretersService()
  serviceLocator.registerInstance(
    ILangInterpretersService,
    interpretersService
  )
  interpretersService.set(new BashInterpreter())
  interpretersService.set(new CInterpreter())

  serviceLocator.register(ILocalKeyValueStorage, LocalKeyValueStorage)
  serviceLocator.register(IRemoteKeyValueStorage, IRemoteKeyValueStorage)
  serviceLocator.registerInstance(IKeyValueStorageManager, new KeyValueStorageManager([
    {
      group: IFavoritesService,
      name: LangKeys.Favorite
    },
    {
      group: IWordsStorage,
      name: LangKeys.FavoriteWords
    },
    {
      group: IRecentFileService,
      name: LangKeys.LocalFile
    },
    {
      group: IUserConfigsService,
      name: LangKeys.Configs
    }
  ]))

  serviceLocator.register(IRecentFileService, RecentFileService)
  serviceLocator.register(IUserConfigsService, UserConfigsService)

  // eslint-disable-next-line no-undef
  const apiBase = (window.ENV_OVERRIDE || ENV).API_BASE
  const clientHost = apiBase || (window.origin + '/api')
  const credentials :any = undefined
  const options :any = apiBase && { withCredentials: true }
  serviceLocator.registerFactory(
    LoginServiceClient,
    () => new LoginServiceClient(clientHost, credentials, options)
  )
  serviceLocator.registerFactory(
    KeyValuesServiceClient,
    () => new KeyValuesServiceClient(clientHost, credentials, options)
  )
  serviceLocator.registerFactory(
    TagsServiceClient,
    () => new TagsServiceClient(clientHost, credentials, options)
  )
  serviceLocator.registerFactory(
    FilesServiceClient,
    () => new FilesServiceClient(clientHost, credentials, options)
  )
  serviceLocator.registerFactory(
    UsersServiceClient,
    () => new UsersServiceClient(clientHost, credentials, options)
  )
  serviceLocator.registerFactory(
    KeywordsServiceClient,
    () => new KeywordsServiceClient(clientHost, credentials, options)
  )

  serviceLocator.registerInstance(IAudioService, new AudioService())
  serviceLocator.registerInstance(IViewService, new ViewService(undefined, undefined, undefined, undefined, undefined, undefined, undefined))

  const w = window as any
  if (w.autoAccountService) {
    serviceLocator.registerInstance(IAutoAccountService, w.autoAccountService)
  }
  return serviceLocator as IServicesLocator
}

const bootstrap = async () => {
  const serviceLocator = await buildServicesLocator()
  await loadPlugins(serviceLocator as ServicesLocator)
  const loginService = serviceLocator.locate(ILoginAppservice)
  const langsService = serviceLocator.locate(ILangsService)
  const plugins = serviceLocator.locate(PluginsConfig)
  const autoAccountService = serviceLocator.locate(IAutoAccountService)
  const editorsService = serviceLocator.locate(IEditorsService)
  const account = await autoAccountService?.get()
  await Promise.all([
    langsService.load(Langs, ...plugins.Plugins.map((p) => p.langs)),
    account && account.userName && account.password
      ? loginService
        .login(account.userName!, account.password!)
        .catch((e) => console.log(e))
      : loginService.checkLogin(),
    editorsService.init()
  ])
  ReactDOM.render(
    <React.StrictMode>
      <ServicesLocateProvider value={serviceLocator.locate.bind(serviceLocator)}>
        <ConfigProvider locale={zhCN}>
          <App />
        </ConfigProvider>
      </ServicesLocateProvider>
    </React.StrictMode>,
    document.getElementById('root')
  )
}

bootstrap()
