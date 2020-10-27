import React, { useState } from 'react'
import { AdditionalSectionsViewerProps } from '../../sections-base/view/SectionViewerProps';
import { ArticleSection } from '../../../domain/Article';
import { SectionNames } from './SectionNames';
import './ChartLiveViewer.less'
import { Branch } from './Charts/Branch';
import YAML, { stringify } from 'yaml'
import { Timeline } from './Charts/Timeline';


export class ChartViewerProps {
    type: string
    data: object
}

const combineContent = (sections: Map<string, ArticleSection>): ChartViewerProps & { error?: string } => {
    var type = sections.get(SectionNames.type)?.content || ''
    var data = sections.get(SectionNames.data)?.content
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

export default function ChartLiveViewer(props: AdditionalSectionsViewerProps) {
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