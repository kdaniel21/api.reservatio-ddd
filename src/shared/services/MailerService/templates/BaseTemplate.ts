import { MJMLParseResults } from 'mjml-core'

export abstract class BaseTemplate {
  readonly name = this.constructor.name

  abstract readonly subject: string
  abstract readonly template: MJMLParseResults

  get html(): string {
    return this.template.html
  }
}

export type Template<TemplateData> = new (templateData: TemplateData) => BaseTemplate
