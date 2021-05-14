import './SubjectsView.less'
import { Badge, Tabs } from 'antd'
import { generateRandomStyle } from './common'
import { PluginsConfig, ArticleType } from '../../pluginbase/IPluginInfo'
import { useHistory, Link } from 'react-router-dom'
import { useMagicSeed, useServicesLocate, useUser } from '../common/Contexts'
import classNames from 'classnames'
import ILangsService from '../../domain/ServiceInterfaces/ILangsService'
import ISubjectsService from '../../domain/ServiceInterfaces/ISubjectsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'
import RecentsView from './RecentsView'
import Subject from '../../domain/ServiceInterfaces/Subject'

const { TabPane } = Tabs

function sortSubjectByChildrenCount (subjects: Subject[]) {
  return subjects.sort((a, b) => (a.children?.length ? 1 : 0) - (b.children?.length ? 1 : 0))
}

function SubjectView (props: { type: ArticleType, subject: Subject, deepth: number, parentPath: string, rootPath: string }) {
  const displayName = props.subject.path!.slice(props.rootPath.length)
  const magicSeed = useMagicSeed()
  const langs = useServicesLocate()(ILangsService)
  if (props.subject.children && props.subject.children.length) {
    const path = props.parentPath ? (props.parentPath + '/' + props.subject.name) : props.subject.name
    return (
      <div className={classNames('category', `subject-${props.deepth}`)}>
        <Link to={{ pathname: '/' + props.type.route, state: { subjectId: props.subject.id } }} className={classNames('category-title', props.deepth ? '' : 'category-title-root')}>{props.subject.resourceUrl ? <img src={props.subject.resourceUrl}></img> : null}<span >{props.deepth ? (displayName || path) : props.type.displayName}</span></Link>
        <div className="category-content">{sortSubjectByChildrenCount(props.subject.children).filter(s => s.totalArticleCount).map(subject => <SubjectView key={subject.id} type={props.type} subject={subject} parentPath={path} rootPath={props.rootPath} deepth={props.deepth + 1}></SubjectView>)}</div>
      </div>
    )
  }
  return (
    <Badge count={props.subject.totalArticleCount} className={classNames('subject-content-wraper', `subject-${props.deepth}`)}>
      <Link to={{ pathname: '/' + props.type.route, state: { subjectId: props.subject.id } }} className={classNames('subject-content', generateRandomStyle(props.subject.id, magicSeed))}>
        {
          props.subject.resourceUrl
            ? <img src={props.subject.resourceUrl} />
            : <span>{props.subject.name}</span>
        }
      </Link>
    </Badge>
  )
}

function SingleTypeSubjectsView (props: { type: ArticleType }) {
  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const viewService = locate(IViewService)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const history = useHistory()
  const type = props.type

  const fetchSubjects = async () => {
    const service = locate(ISubjectsService)
    try {
      setSubjects([(await service.get(type.rootSubjectId!))!])
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])
  return (<>
    {
      subjects.filter(s => s.totalArticleCount).map(subject => <SubjectView key={subject.id} type={type} subject={subject} parentPath="" rootPath={subject.path! + '/'} deepth={0}></SubjectView>)
    }
  </>)
}

export default function SubjectsView () {
  const locate = useServicesLocate()
  const plugins = locate(PluginsConfig)
  const user = useUser()
  const types = user?.editingPermission ? plugins.AllTypes : plugins.NormalTypes
  return (<Tabs className="subjects-view">
    {
      types.map(type => <TabPane tab={type.displayName || type.name} key={type.name}>
        <RecentsView type={type}></RecentsView>
        <div className="single-subject-wraper"><SingleTypeSubjectsView type={type} ></SingleTypeSubjectsView></div>
      </TabPane>)
    }
  </ Tabs>)
}
