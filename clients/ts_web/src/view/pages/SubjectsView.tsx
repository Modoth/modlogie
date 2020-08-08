import React, { useState, useEffect } from 'react'
import { useServicesLocator, useUser } from '../../app/Contexts'
import ILangsService from '../../domain/ILangsService'
import IViewService from '../services/IViewService'
import Subject from '../../domain/Subject'
import ISubjectsService from '../../domain/ISubjectsService'
import classNames from 'classnames'
import './SubjectsView.less'
import { generateRandomStyle } from './common'
import { PluginsConfig, ArticleType } from '../../plugins/IPluginInfo'
import { useHistory, Link } from 'react-router-dom'
import { Badge, Tabs } from 'antd'
const { TabPane } = Tabs;

function sortSubjectByChildrenCount(subjects: Subject[]) {
  return subjects.sort((a, b) => (a.children?.length ? 1 : 0) - (b.children?.length ? 1 : 0))
}

function SubjectView(props: { type: ArticleType, subject: Subject, deepth: number, parentPath: string, rootPath: string }) {
  const displayName = props.subject.path!.slice(props.rootPath.length)
  if (props.subject.children && props.subject.children.length) {
    const path = props.parentPath ? (props.parentPath + "/" + props.subject.name) : props.subject.name
    return (
      <div className={classNames("category", `subject-${props.deepth}`)}>
        <Link to={{ pathname: '/' + props.type.route, state: { subjectId: props.subject.id } }} className={classNames("category-title")}>{props.subject.iconUrl ? <img src={props.subject.iconUrl}></img> : null}<span>{displayName || path}</span></Link>
        <div className="category-content">{sortSubjectByChildrenCount(props.subject.children).map(subject => <SubjectView key={subject.id} type={props.type} subject={subject} parentPath={path} rootPath={props.rootPath} deepth={props.deepth + 1}></SubjectView>)}</div>
      </div>
    )
  }
  return (
    <Badge count={props.subject.totalArticleCount} className={classNames("subject-content-wraper", `subject-${props.deepth}`)}>
      <Link to={{ pathname: '/' + props.type.route, state: { subjectId: props.subject.id } }} className={classNames("subject-content", generateRandomStyle())}>
        {
          props.subject.iconUrl ? <img src={props.subject.iconUrl}></img> : <span>{props.subject.name}</span>
        }
      </Link>
    </Badge>
  )
}

function SingleTypeSubjectsView(props: { type: ArticleType }) {
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const history = useHistory();
  const type = props.type;

  const fetchSubjects = async () => {
    const service = locator.locate(ISubjectsService)
    try {
      setSubjects(await service.all(type.rootSubject))
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])
  return (<>
    {
      subjects.map(subject => <SubjectView key={subject.id} type={type} subject={subject} parentPath="" rootPath={subject.path! + '/'} deepth={0}></SubjectView>)
    }
  </>)
}

export default function SubjectsView() {
  const locator = useServicesLocator()
  const plugins = locator.locate(PluginsConfig)
  const user = useUser();
  const types = plugins.Plugins.flatMap(p => p.types).filter(p => user?.editingPermission || !p.hiddenFromMenu);
  return (<Tabs className="subjects-view">
    {
      types.map(type => <TabPane tab={type.name} key={type.name}>
        <SingleTypeSubjectsView type={type}  ></SingleTypeSubjectsView>
      </TabPane>)
    }
  </ Tabs>)
}
