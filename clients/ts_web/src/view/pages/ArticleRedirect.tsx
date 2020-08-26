import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Redirect } from 'react-router-dom'
import { ArticleType } from '../../plugins/IPluginInfo'

export function ArticleRedirect(props: {}) {
    const param = useLocation<any>()
    const path = param.pathname?.slice('/article'.length)
    var root = path.split('/').find(s => s)
    const [url, setUrl] = useState('')
    if (!url) {
        return <>{path}</>
    }
    useEffect(()=>{
        
    })
    return <Redirect to={url}></Redirect>
}