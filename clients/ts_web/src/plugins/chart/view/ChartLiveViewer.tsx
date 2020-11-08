import './ChartLiveViewer.less'
import { AdditionalSectionViewerProps } from '../../../pluginbase/base/view/SectionViewerProps'
import { ArticleSection } from '../../../domain/ServiceInterfaces/Article'
import { Branch } from './Charts/Branch'
import { SectionNames } from './Sections'
import { Timeline } from './Charts/Timeline'
import React from 'react'
import YAML from 'yaml'

export class ChartViewerProps {
    type: string
    data: object
}

const combineContent = (sections: Map<string, ArticleSection>): ChartViewerProps & { error?: string } => {
  const type = sections.get(SectionNames.type)?.content || ''
  const data = sections.get(SectionNames.data)?.content
  if (!data) {
    return { type, data: {} }
  }
  try {
    return { type, data: YAML.parse(data) }
  } catch (e) {
    console.log(e)
    return { type, data: {}, error: e.toString() }
  }
}

const charts = new Map<string, {(props: ChartViewerProps): JSX.Element }>([['branch', Branch], ['timeline', Timeline]])

export default function ChartLiveViewer (props: AdditionalSectionViewerProps) {
  const chartData = combineContent(new Map(props.sections.map(s => [s.name!, s])))
  if (chartData.error) {
    return <div>{chartData.error}</div>
  }
  const Chart = charts.get(chartData.type)
  if (!Chart) {
    return <></>
  }
  return <Chart {...chartData}></Chart>
}
