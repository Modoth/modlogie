import './Timeline.less'
import { BranchesOutlined } from '@ant-design/icons'
import { ChartViewerProps } from '../ChartLiveViewer'
import { Gitgraph, Orientation, templateExtend, TemplateName } from '@gitgraph/react'
import { previewArticleByPath } from '../../../../view/pages/ServiceView'
import { useServicesLocator } from '../../../../view/common/Contexts'
import React from 'react'
import Markdown from '../../../../infrac/components/Markdown'

class Node {
    id: string
    publish: Date
    content?: string
    link?: string
    changeLog?: string
    type: string
}

function parseNodes (data: { nodes?: Map<string, Node> }): Node[] {
  if (!data.nodes) {
    return []
  }
  const detail = data.nodes!
  const nodes = new Map<string, Node>()
  detail.forEach((value: any) => {
    const node = new Node()
    const key = Object.keys(value)[0]
    node.id = key
    Object.assign(node, value[key])
    node.publish = new Date(node.publish)
    nodes.set(key, node)
  })

  return Array.from(nodes.values()).sort((i, j) => i.publish.valueOf() - j.publish.valueOf())
}

const template = templateExtend(TemplateName.Metro, {
  branch: {
    label: {
      display: false
    }
  }
})

const typesColors = new Map<string, string>()
const allColors = ['#979797', '#008fb5', '#f1c109']
const getColor = (t: string) => {
  if (!t) {
    return allColors[0]
  }
  if (typesColors.has(t)) {
    return typesColors.get(t)
  }
  const color = allColors[typesColors.size % allColors.length]
  typesColors.set(t, color)
  return color
}

export function Timeline (props: ChartViewerProps) {
  const nodes = parseNodes(props.data)
  const locator = useServicesLocator()
  return <div className="branch">
    <Gitgraph options={{ orientation: Orientation.VerticalReverse, template }}>
      {(gitgraph: any) => {
        const master = gitgraph.branch('master')
        for (const n of nodes) {
          const color = getColor(n.type)
          master.commit({
            style: { dot: { color } },
            subject: n.id,
            // eslint-disable-next-line react/display-name
            renderMessage: (commit: any) => {
              return (
                <g ><foreignObject width="200" x="0">
                  <div style={{ borderColor: color, backgroundColor: color + '40' }} className="branch-summary">
                    <div className="branch-summary-title">
                      <span className="button" onClick={
                        previewArticleByPath(locator, n.link, n.id)
                      }>{n.id}</span>
                      {n.changeLog ? <span className="button" onClick={previewArticleByPath(locator, n.changeLog, n.id)} ><BranchesOutlined /></span> : undefined}
                      <span className="flex"></span>
                      {n.publish ? <span className="published">{n.publish.toLocaleDateString()}</span> : undefined}
                    </div>
                    {n.content ? <div className='content'><Markdown source={n.content}></Markdown> </div> : undefined}
                  </div>
                </foreignObject></g>)
            }
          })
        }
      }}
    </Gitgraph>
  </div >
}
