import './Branch.less'
import { BranchesOutlined } from '@ant-design/icons'
import { ChartViewerProps } from '../ChartLiveViewer'
import { Gitgraph, Orientation, templateExtend, TemplateName } from '@gitgraph/react'
import { previewArticleByPath } from '../../../../view/pages/ServiceView'
import { useServicesLocator } from '../../../../view/common/Contexts'
import Markdown from '../../../../infrac/components/Markdown'
import React from 'react'

class Node {
    id: string
    publish: Date
    content?: string
    link?: string
    changeLog?: string
    line: Line
}

class Line {
    nodes: Node[] = []
    parent?: Line
}

type NodeMap = string | { [idx: string]: [string | NodeMap] }

function parseNodes (data: { map?: NodeMap, nodes?: Map<string, Node> }): Node[] {
  if (!data.map || !data.nodes) {
    return []
  }
  const map = data.map!
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
  const handleNodeMap = (mapNode: NodeMap, nodes: Map<string, Node>, line?: Line, parentLine?: Line) => {
    let id: string
    let childrens: NodeMap[] = []
    if (typeof mapNode === 'string') {
      id = mapNode
    } else {
      id = Object.keys(mapNode)[0]
      childrens = mapNode[id]
    }
    const node = nodes.get(id)
    if (!node) {
      return
    }
    node.line = line || new Line()
    if (!line && parentLine) {
      node.line.parent = parentLine
    }
    node.line.nodes.push(node)
    if (!childrens.length) {
      return
    }
    handleNodeMap(childrens[0], nodes, node.line)
    childrens.shift()
    if (!childrens.length) {
      return
    }
    childrens.forEach(n => handleNodeMap(n, nodes, undefined, node!.line))
  }
  handleNodeMap(map, nodes)
  return Array.from(nodes.values()).sort((i, j) => i.publish.valueOf() - j.publish.valueOf())
}

const template = templateExtend(TemplateName.Metro, {
  branch: {
    label: {
      display: false
    }
  }
})

export function Branch (props: ChartViewerProps) {
  const nodes = parseNodes(props.data)
  const locator = useServicesLocator()
  const width = 300
  return <div className="branch">
    <Gitgraph options={{ orientation: Orientation.VerticalReverse, template }}>
      {(gitgraph: any) => {
        const branches = new Map<Line, any>()
        const getBranch = (line: Line): any => {
          if (branches.has(line)) {
            return branches.get(line)
          }
          const parentBranch = line.parent ? getBranch(line.parent) : gitgraph
          const branch = parentBranch.branch(line.nodes[line.nodes.length - 1].id)
          branches.set(line, branch)
          return branch
        }
        for (const n of nodes) {
          const b = getBranch(n.line)
          b.commit({
            subject: n.id,
            // eslint-disable-next-line react/display-name
            renderMessage: (commit: any) => {
              // const offset = commit.x + commit.style.dot.size * 3
              return (
              // <g transform={`translate(${offset}, 2)`}><foreignObject width={width - offset} x="0">
                <g ><foreignObject width="200" x="0">
                  <div style={{ borderColor: commit.style.dot.color, backgroundColor: commit.style.dot.color + '40' }} className="branch-summary">
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
