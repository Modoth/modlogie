import './ClocksPanel.less'
import { useServicesLocate } from '../common/Contexts'
import ClockView from './ClockView'
import IClock from '../../domain/ServiceInterfaces/IClock'
import IClocksAppService from '../../app/Interfaces/IClocksAppService'
import React, { useEffect, useState } from 'react'

export default function ClocksPanel () {
  const [clocks, setClocks] = useState<IClock[]>([])
  const locate = useServicesLocate()
  const [defaultRemain] = useState(30 * 60 * 1000)
  const clockService = locate(IClocksAppService)
  useEffect(() => {
    const initClocks = async () => {
      const clocks = await clockService.all()
      if (!clocks.length) {
        const clock = await clockService.add(defaultRemain)
        clocks.push(clock)
      }
      setClocks(clocks)
    }
    initClocks()
  }, [])
  return <div className="clocks-panel">
    {
      clocks.map(clock => <ClockView key={clock.id} clock={clock}></ClockView>)
    }
  </div>
}
