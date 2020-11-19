import './ManageDictsAndWords.less'
import ManageDicts from './ManageDicts'
import ManageWrods from './ManageWords'
import React from 'react'

export default function ManageDictsAndWords () {
  return <div className="manage-dicts-and-words">
    <ManageDicts></ManageDicts>
    <ManageWrods></ManageWrods>
  </div>
}
