import './Home.less'
import React from 'react'
import SubjectsView from './SubjectsView'
import { ArticleEnvProvider } from '../common/Contexts'

export default function Home () {
  return (
    <ArticleEnvProvider value={{ blurBG: false }}>
      <div className="home">
        <SubjectsView></SubjectsView>
      </div>
    </ArticleEnvProvider>
  )
}
