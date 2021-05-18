import './ArticleFolder.less'

import React, { useState, useEffect } from 'react'
import Article from '../../domain/ServiceInterfaces/Article'
import { ArticleContentType } from '../../pluginbase/IPluginInfo'

export function ArticleFolder (props: {path: string}) {
  const [items, setItems] = useState<[Article, ArticleContentType][]>([])
  return <div>{props.path}</div>
}
