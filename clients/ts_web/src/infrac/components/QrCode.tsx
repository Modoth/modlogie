import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QrCode (props: { content: string }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    QRCode.toDataURL(props.content).then(setUrl)
  }, [])
  if (!url) {
    return <></>
  }
  return <img src={url}></img>
}
