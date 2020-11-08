import React from 'react'
import { AdditionalSectionViewerProps } from '../../base/view/SectionViewerProps';
import { ArticleSection } from '../../../domain/ServiceInterfaces/Article';
import { SectionNames } from './Sections';
import './ChartLiveViewer.less'
import { Branch } from './Charts/Branch';
import YAML from 'yaml'
import { Timeline } from './Charts/Timeline';

export class ChartViewerProps {
    type: string
    data: object
}

const combineContent = (sections: Map<string, ArticleSection>): ChartViewerProps & { error?: string } => {
    let type = sections.get(SectionNames.type)?.content || ''
    let data = sections.get(SectionNames.data)?.content
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

const charts = new Map<string, { (props: ChartViewerProps): JSX.Element }>([['branch', Branch], ['timeline', Timeline]])

export default function ChartLiveViewer(props: AdditionalSectionViewerProps) {
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