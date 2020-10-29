import React from 'react'
import './Home.less'
import RecentsView from './RecentsView'
import SubjectsView from './SubjectsView'

export default function Home() {
  return (<div className="home">
    <SubjectsView></SubjectsView>
  </div>)
}
