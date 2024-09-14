import { Bucket } from '@google-cloud/storage'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import admin from 'firebase-admin'
import { buildError } from '../../utils/monitoring/logger.module'

@Injectable()
export class FirebaseClient {
  private readonly app: admin.app.App
  private bucket: Bucket
  private logger: Logger

  constructor(private configService: ConfigService) {
    const firebase = this.configService.get('firebase.key')
    this.app = FirebaseClient.getApp(firebase)
    this.logger = new Logger('FirebaseClient')
    this.logger.log('Connecting to Firebase...')
    this.app
      .remoteConfig()
      .listVersions()
      .then(() => this.logger.log('Firebase connection OK'))
      .catch(e => this.logger.error(buildError('Firebase connection KO', e)))

    this.bucket = admin.storage().bucket()
  }

  private static getApp(firebase: string): admin.app.App {
    return admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(firebase)),
      storageBucket: 'tuniautos-com.appspot.com'
    })
  }

  async uploadFile(
    file: Express.Multer.File,
    fileNameWithDirectoriesPath: string
  ): Promise<void> {
    const fileRef = this.bucket.file(fileNameWithDirectoriesPath)

    await fileRef.save(file.buffer, {
      contentType: file.mimetype
    })
  }

  async uploadJSON(
    fileNameWithDirectoriesPath: string,
    json: unknown
  ): Promise<string> {
    const jsonString = JSON.stringify(json, null, 2)
    const fileRef = this.bucket.file(fileNameWithDirectoriesPath)

    await fileRef.save(jsonString, {
      contentType: 'application/json'
    })

    return `https://storage.googleapis.com/${this.bucket.name}/${fileNameWithDirectoriesPath}`
  }

  async downloadFile(fileNameWithDirectoriesPath: string): Promise<Buffer> {
    const fileRef = this.bucket.file(fileNameWithDirectoriesPath)
    const [buffer] = await fileRef.download()
    return buffer
  }

  async listFiles(directoriesPrefix: string): Promise<string[]> {
    const [files] = await this.bucket.getFiles({ prefix: directoriesPrefix })
    return files.map(file => file.name)
  }
}
