import React, { useState, useEffect, memo } from 'react'
import Subject from "../../domain/Subject";
import Langs from '../Langs';
import { Error as ErrorMessage } from '../../apis/messages_pb'


export default class SubjectViewModel extends Subject {

  key: string;
  title: any;

  get value() {
    return this.id
  }

  children?: SubjectViewModel[];

  parent?: SubjectViewModel;

  constructor(subject: Subject, allSubjects?: Map<string, SubjectViewModel>, excludePath?: string) {
    super()
    Object.assign(this, subject)
    this.key = this.id;
    this.title = <div className="library-subject-item">{this.iconUrl ? <img src={this.iconUrl}></img> : null}{this.name + (this.totalArticleCount ? `(${this.totalArticleCount})` : '')}</div>;
    if (allSubjects) {
      if (allSubjects.has(subject.path!)) {
        console.log('Subject circle error.')
        throw new Error(Langs[ErrorMessage.ENTITY_CONFLICT])
      }
      allSubjects.set(subject.path!, this)
    }
    if (subject.children && subject.children.length) {
      this.children = []
      for (const c of subject.children) {
        if (c.path === excludePath) {
          continue
        }
        const child = new SubjectViewModel(c, allSubjects, excludePath)
        child.parent = this
        this.children.push(child)
      }
    }
  }
}