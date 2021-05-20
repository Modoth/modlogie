import './Wiki.less'
import React, { useEffect, useState } from 'react'
import { useServicesLocate, useWikiLevel } from '../../common/Contexts'
import ConfigKeys from '../../../domain/ServiceInterfaces/ConfigKeys'
import IConfigsService from '../../../domain/ServiceInterfaces/IConfigsSercice'
import ILangsService, { LangKeys } from '../../../domain/ServiceInterfaces/ILangsService'
import IServicesLocator from '../../../infrac/ServiceLocator/IServicesLocator'
import IViewService from '../../../app/Interfaces/IViewService'
import IWikiService from '../../../domain/ServiceInterfaces/IWikiService'

let wikiSubjectsPromise : Promise<Set<string>>| undefined
const getWikiSubjects = (locate:<IConfigsService>(ctor: new (...args: any) => IConfigsService) => IConfigsService & IServicesLocator) => {
  if (!wikiSubjectsPromise) {
    wikiSubjectsPromise = locate(IConfigsService).getValuesOrDefault(ConfigKeys.WIKI_SUBJECTS)
      .then(s => new Set(s))
  }
  return wikiSubjectsPromise!
}

export default function Wiki (props: { href: string, target: string, children:any}) {
  const curWikiLevel = useWikiLevel()
  const locate = useServicesLocate()
  const [wikiLevel, SetWikiLevel] = useState<number|undefined>()
  const [ref] = useState(() => {
    let group = ''
    let name = props.href
    const match = props.href.match(/^(\w*?):(.*)$/)
    const title = props.children[0]?.props?.value
    if (match) {
      group = match[1]
      name = decodeURIComponent(match[2]) || title
    }
    const proto = group.toLocaleLowerCase()
    if (proto === 'http' || proto === 'https' || proto === 'article') {
      group = ''
    }
    return { group, name, proto, title }
  })
  useEffect(() => {
    (async () => {
      SetWikiLevel(undefined)
      if (!ref.group) {
        return
      }
      const wikiSubjects = await getWikiSubjects(locate)
      if (!wikiSubjects.has(ref.group)) {
        return
      }
      const wikiLevels = await locate(IWikiService).getWeights(ref.group)
      const level = wikiLevels.get(ref.name)
      SetWikiLevel(level)
    })()
  }, [ref])
  if (!ref.group) {
    if (ref.proto === 'article') {
      return <a className="insite-link" onClick={() => {
        let articlePathOrName = ref.name
        if (articlePathOrName[0] !== '/') {
          articlePathOrName = '/' + articlePathOrName
        }
        const url = `#/article${articlePathOrName}`
        locate(IViewService).prompt(
          { title: ref.title, subTitle: locate(ILangsService).get(LangKeys.ComfireJump) + url }, [{
            type: 'Article',
            value: articlePathOrName
          }
          ], async () => {
            window.location.href = url!
            return true
          })
      }}>{props.children}</a>
    }
    return <a className="outsite-link" href={props.href} rel="noreferrer" target="_blank">{props.children}</a>
  }
  if (wikiLevel === undefined || wikiLevel < curWikiLevel) {
    return <a className="wiki-link-disabled">{props.children}</a>
  }
  return <a className="wiki-link" onClick={() => {
    locate(IViewService).prompt(
      ref.title, [{
        type: 'Article',
        value: { root: ref.group, name: ref.name }
      }
      ])
  }}>{props.children}</a>
}
