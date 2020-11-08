import React, { useState, useEffect, memo } from "react";
import { ErrorMessage } from "../../domain/ServiceInterfaces/ILangsService";
import Subject from "../../domain/ServiceInterfaces/Subject";
import Langs from "../Langs";

export default class SubjectViewModel extends Subject {
  key: string;
  title: any;

  get value() {
    return this.id;
  }

  children?: SubjectViewModel[];

  parent?: SubjectViewModel;

  constructor(
    subject: Subject,
    allSubjects?: Map<string, SubjectViewModel>,
    excludePath?: string,
    getDisplayName?: { (subjectId: string): string | undefined }
  ) {
    super();
    Object.assign(this, subject);
    this.key = this.id;
    this.title = (
      <div className="library-subject-item">
        {this.resourceUrl ? <img src={this.resourceUrl}></img> : null}
        {getDisplayName
          ? getDisplayName(subject.id) || this.name
          : this.name +
            (this.totalArticleCount ? `(${this.totalArticleCount})` : "")}
      </div>
    );
    if (allSubjects) {
      if (allSubjects.has(subject.path!)) {
        console.log("Subject circle error.");
        throw new Error(Langs[ErrorMessage.MSG_ERROR_ENTITY_CONFLICT]);
      }
      allSubjects.set(subject.path!, this);
    }
    if (subject.children && subject.children.length) {
      this.children = [];
      for (const c of subject.children) {
        if (c.path === excludePath) {
          continue;
        }
        const child = new SubjectViewModel(c, allSubjects, excludePath);
        child.parent = this;
        this.children.push(child);
      }
    }
  }
}
