export interface DomainError {
  readonly code: string
  readonly message: string
  readonly reason?: string
}

export class NonTrouveError implements DomainError {
  static CODE = 'NON_TROUVE'
  readonly code: string = NonTrouveError.CODE
  readonly message: string

  constructor(entityType: string, critereRecherche = '') {
    this.message = `${entityType} ${critereRecherche} non trouvé(e)`
  }
}
