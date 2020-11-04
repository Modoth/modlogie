export const generateIconUrl = async (imgData) => {
  const canvas = document.createElement('canvas')
  canvas.width = imgData.width
  canvas.height = imgData.height
  let ctx = canvas.getContext('2d')
  ctx.putImageData(imgData, 0, 0)
  let icoType = 'image/vnd.microsoft.icon'
  let blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), icoType)
  )
  if (blob.type === icoType) {
    return window.URL.createObjectURL(blob)
  }
  let width = canvas.width
  let height = canvas.height
  let headerLength = 6 + 16 * 1 //ICONDIR + ICONDIRENTRY * 1
  var buffer = new ArrayBuffer(headerLength)
  var writer = new BufferWriter(buffer)
  //ICONDIR
  writer.writeUint16(0) //Reserved
  writer.writeUint16(1) //icon
  writer.writeUint16(1) //image numbers
  //ICONDIRENTRY
  writer.writeUint8(width % 256)
  writer.writeUint8(height % 256)
  writer.writeUint8(0) // color palette
  writer.writeUint8(0) //Reserved
  writer.writeUint16(1) // color planes
  writer.writeUint16(32) //bits per pixel
  writer.writeUint32(blob.size) // size of image data
  writer.writeUint32(headerLength) //offset
  blob = new Blob([buffer, blob], {
    type: icoType,
  })
  return window.URL.createObjectURL(blob)
}

import { BufferWriter } from './buffer-writer.js'
