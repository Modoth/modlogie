import Article from './Article'

export default class ILikesService {
  enabled (): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  addLike (articleId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  addDislike (articleId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  canLike (articleId: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  canDislike (articleId: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  likeCount (article: Article): Promise<number> {
    throw new Error('Method not implemented.')
  }

  dislikeCount (article: Article): Promise<number> {
    throw new Error('Method not implemented.')
  }
}
