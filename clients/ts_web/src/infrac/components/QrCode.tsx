import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import './QrCode.less'

export default function QrCode (props: { content: string, logo?: string }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    QRCode.toDataURL(props.content, { errorCorrectionLevel: props.logo ? 'H' : 'L' }).then(setUrl)
  }, [])
  if (!url) {
    return <></>
  }
  return <span>
    <img alt={props.content} src={url}></img>
    {
      props.logo ? <img className="qrcode-logo" src={props.logo}></img> : undefined
    }
  </span>
}
