import { ConfigService } from '@nestjs/config'
import { NestExpressApplication } from '@nestjs/platform-express'
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule
} from '@nestjs/swagger'
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export function useSwagger(
  appConfig: ConfigService,
  app: NestExpressApplication
): void {
  const baserUrl = appConfig.get('baseUrl')
  const apiKeySecuritySchemeObject: SecuritySchemeObject = {
    type: 'apiKey',
    in: 'header',
    name: 'X-API-KEY'
  }
  const swaggerConfigBuilder = new DocumentBuilder()
    .setTitle('AUTOCENTRAL.TN Api')
    .setVersion('1.0')
    .addSecurity('api_key', apiKeySecuritySchemeObject)

  const swaggerConfig = swaggerConfigBuilder.build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      oauth2RedirectUrl: `${baserUrl}/documentation/oauth2-redirect.html`
    }
  }
  SwaggerModule.setup('documentation', app, document, customOptions)
}
