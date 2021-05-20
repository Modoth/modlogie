import React from 'react'

export const getText = (children: [React.ReactElement] | string): string => {
  if (children == null) {
    return ''
  }
  if (typeof (children) === 'string') {
    return children
  }
  if (!children.length) {
    return ''
  }
  return (children as [React.ReactElement]).map(c => c.props?.children ? getText(c.props?.children) : '').join('')
}
