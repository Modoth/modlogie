import IClocksService, { ClockInfo } from '../ServiceInterfaces/IClocksStorage'
import LocalKeyValueServiceBase from './LocalKeyValueServiceBase'

export default class ClocksService extends LocalKeyValueServiceBase<ClockInfo[]> implements IClocksService {
  key = 'clocks'
  group = IClocksService
}
