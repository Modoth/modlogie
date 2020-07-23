import React, { useState, useEffect, Props } from 'react'
import { useServicesLocator } from '../../app/Contexts'
import ILangsService from '../../domain/ILangsService'
import IViewService from '../services/IViewService'
import Subject from '../../domain/Subject'
import ISubjectsService from '../../domain/ISubjectsService'
import classNames from 'classnames'
import './SubjectsView.less'
import { generateRandomStyle } from './common'
import IPluginInfo from '../../plugins/IPluginInfo'
import { useHistory } from 'react-router-dom'
import { Badge } from 'antd'

function sortSubjectByChildrenCount(subjects: Subject[]) {
  return subjects.sort((a, b) => (a.children?.length ? 1 : 0) - (b.children?.length ? 1 : 0))
}

function SubjectView(props: { subject: Subject, deepth: number, parentPath: string, onClick: { (subject: Subject): void } }) {
  if (props.subject.children && props.subject.children.length) {
    const path = props.parentPath ? (props.parentPath + "/" + props.subject.name) : props.subject.name
    return (
      <div className={classNames("category", `subject-${props.deepth}`)}>
        <div onClick={() => props.onClick(props.subject)} className={classNames("category-title")}>{path}</div>
        <div className="category-content">{sortSubjectByChildrenCount(props.subject.children).map(subject => <SubjectView key={subject.id} onClick={props.onClick} subject={subject} parentPath={path} deepth={props.deepth + 1}></SubjectView>)}</div>
      </div>
    )
  }
  return (
    <Badge count={props.subject.totalArticleCount} className={classNames("subject-content-wraper", `subject-${props.deepth}`)}>
      <div onClick={() => props.onClick(props.subject)} className={classNames("subject-content", generateRandomStyle())}>{props.subject.name}</div>
    </Badge>
  )
}

export default function SubjectsView() {
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const history = useHistory();

  const fetchSubjects = async () => {
    const service = locator.locate(ISubjectsService)
    try {
      setSubjects(await service.all())
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }
  const goto = (id: string) => {
    const plugin = locator.locate(IPluginInfo)
    var type = plugin.types[0];
    if (!type) {
      return
    }
    history.push('/' + type.route + '/' + id)
  }
  useEffect(() => {
    fetchSubjects()
  }, [])
  return (<div className="subjects-view">
    {
      subjects.map(subject => <SubjectView key={subject.id} onClick={(s) => goto(s.id)} subject={subject} parentPath="" deepth={0}></SubjectView>)
    }
  </div>)
}
