import './ClockView.less'
import { Button } from 'antd'
import { PauseOutlined, CaretRightOutlined } from '@ant-design/icons'
import IClock from '../../domain/ServiceInterfaces/IClock'
import React, { useEffect, useState } from 'react'
import { useServicesLocate } from '../common/Contexts'
import IViewService from '../../app/Interfaces/IViewService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'

const splitNnumber = (value:number) => {
  const left = Math.floor(value / 10)
  const right = value - left * 10
  return [left, right]
}
function NumGroup (props:{value:number}) {
  const [left, right] = splitNnumber(props.value)
  return (
    <span className="num-group">
      <span className="num">{left}</span>
      <span className="split"></span>
      <span className="num">{right}</span>
    </span>)
}

const splitHms = (ms:number) => {
  let sec = Math.ceil(ms / 1000)
  let min = Math.floor(sec / 60)
  sec -= min * 60
  let hour = Math.floor(min / 60)
  min -= hour * 60
  hour = hour % 24
  return [hour, min, sec]
}

export default function ClockView (props:{clock:IClock}) {
  const [h, m, s] = splitHms(props.clock.remain)
  const [hour, setHour] = useState(h)
  const [min, setMin] = useState(m)
  const [sec, setSec] = useState(s)
  const values = [5, 10, 30, 60, 120]
  const [total, setTotal] = useState(values[0] * 60 * 1000)
  const [started, setStarted] = useState(props.clock.started)
  const [finished, setFinished] = useState(props.clock.finished)
  const locate = useServicesLocate()
  const selectTimeAndRestart = () => {
    const viewService = locate(IViewService)
    const langs = locate(ILangsService)

    viewService.prompt(langs.get(LangKeys.Countdown), [
      {
        type: 'Enum',
        value: values[0],
        values
      }
    ], async (value:number) => {
      const total = value * 60 * 1000
      setTotal(total)
      props.clock.reset(total)
      props.clock.start()
      return true
    })
  }
  useEffect(() => {
    const onStart = () => {
      setStarted(true)
    }
    const onPause = () => {
      setStarted(false)
    }
    const onFinish = () => {
      setStarted(false)
      setFinished(true)
    }
    const onTick = () => {
      const [hour, min, sec] = splitHms(props.clock.remain)
      setHour(hour)
      setMin(min)
      setSec(sec)
    }
    const onReset = () => {
      setStarted(false)
      setFinished(false)
      onTick()
    }
    props.clock.registerEventListener('start', onStart)
    props.clock.registerEventListener('pause', onPause)
    props.clock.registerEventListener('finish', onFinish)
    props.clock.registerEventListener('tick', onTick)
    props.clock.registerEventListener('reset', onReset)
    return () => {
      props.clock.removeEventListener('start', onStart)
      props.clock.removeEventListener('pause', onPause)
      props.clock.removeEventListener('finish', onFinish)
      props.clock.removeEventListener('tick', onTick)
      props.clock.removeEventListener('reset', onReset)
    }
  }, [])
  return <div className="clock-view">
    <span className="title" onClick={selectTimeAndRestart}><NumGroup value={hour}></NumGroup><NumGroup value={min}></NumGroup><NumGroup value={sec}></NumGroup></span>
    {
      started
        ? <Button className="controls" size="large" icon={<PauseOutlined />} type="primary" shape="round" onClick={() => props.clock.pause()}></Button>
        : <Button className="controls" size="large" icon={<CaretRightOutlined />} type="primary" shape="round" onClick={() => {
          if (finished) {
            props.clock.reset(total)
          } else {
            props.clock.start()
          }
        }}></Button>
    }
  </div>
}
