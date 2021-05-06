import React from 'react'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import { useServicesLocate } from '../common/Contexts'
import './NotSupportView.less'


export default function NotSupportView(){
    const locate = useServicesLocate()
    const langs = locate(ILangsService)
    return <div className="warn-not-support">{langs.get(LangKeys.NotSopport)}</div>
}