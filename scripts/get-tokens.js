const puppeteer = require('puppeteer')
let browserPage

const site = process.env.SITE_SCRIPT
const capt = process.env.VID_CAPT

async function getToken() {
  for (let index = 0; index < 10; index++) {
    try {
      await browserPage.goto(`https://${site}`, { timeout: 0 })

      await browserPage.waitForFunction('typeof grecaptcha !== "undefined"')

      const token = await browserPage.evaluate(async () => {
        return new Promise((resolve, reject) => {
          grecaptcha.ready(() => {
            return grecaptcha
              .execute(capt, {
                action: 'getCarInfo'
              })
              .then(resolve)
              .catch(reject)
          })
        })
      })

      console.log(token)
    } catch (error) {
      console.log('Error token', error)
      //break
    }
  }
}

async function run() {
  const browser = await puppeteer.launch()
  browserPage = await browser.newPage()

  await getToken()

  await browserPage.close()
  await browser.close()
}

run()
