import React, { useState, useEffect } from "react";
import { ArticleContentType } from "../../plugins/IPluginInfo";
import { useServicesLocator } from "../Contexts";
import IViewService from "../../app/Interfaces/IViewService";
import Article, {
  ArticleSection,
} from "../../domain/ServiceInterfaces/Article";
import classNames from "classnames";
import "./ArticlePreview.less";
import IArticleAppservice from "../../app/Interfaces/IArticleAppservice";

export function ArticlePreview(props: {
  path: string;
  className?: string;
  dataSections?: ArticleSection[];
}) {
  const locator = useServicesLocator();
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [type, setType] = useState<ArticleContentType | undefined>(undefined);
  useEffect(() => {
    (async () => {
      const viewService = locator.locate(IViewService);
      viewService.setLoading(true);
      const ret = () => {
        viewService.setLoading(false);
      };
      const [article, type] = await locator
        .locate(IArticleAppservice)
        .fetchArticleByPath(props.path);
      if (!article || !type) {
        return ret();
      }
      if (props.dataSections && props.dataSections.length) {
        article.content?.sections?.push(...props.dataSections);
      }
      setArticle(article);
      setType(type);
      ret();
    })();
  }, []);
  if (!article || !type || !article.content) {
    return <></>;
  }
  return (
    <type.Viewer
      className={classNames("article-preview", props.className)}
      published={article.published}
      showAdditionals={false}
      content={article.content!}
      files={article.files}
      type={type}
    ></type.Viewer>
  );
}
