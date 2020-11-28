import IClocksService, { ClockInfo } from '../ServiceInterfaces/IClocksStorage'
import KeyValueServiceBase from './KeyValueServiceBase'

export default class ClocksService extends KeyValueServiceBase<ClockInfo[]> implements IClocksService {
  key = 'clocks'
  group = IClocksService
}
