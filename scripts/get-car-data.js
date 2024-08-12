// Create a new XMLHttpRequest object
// const axios = require('axios')
const puppeteer = require('puppeteer')
//const { chromium } = require('playwright')
const { Sequelize } = require('sequelize')
const uuid = require('uuid')
require('dotenv').config()

const site = process.env.SITE_SCRIPT
const capt = process.env.VID_CAPT
const auth = process.env.VID_AUTH

let browserPage
let mat

const databaseUrl = process.env.DATABASE_URL

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres'
})

async function getRegistrations() {
  const regsRaw = await sequelize.query(
    `SELECT registration FROM car_registration`
  )
  return regsRaw[0].map(reg => {
    return reg.registration.replace('RS', '')
  })
}

async function getCarInfo() {
  try {
    console.log('Waiting for captcha..')

    await browserPage.waitForFunction('typeof grecaptcha !== "undefined"')

    console.log('Captcha for ' + mat)
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

    console.log('Request for ' + mat)

    const response = await browserPage.evaluate(
      async (token, mat) => {
        const url = `https://${site}/api/gatewayclient/registration/${mat}RS?vinverif=3C0KZ48658A300326`
        try {
          const result = await fetch(url, {
            method: 'GET',
            headers: {
              Authorization: `Basic ${auth}`,
              'captcha-token': token
            }
          })

          // Check the response status
          if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`)
          }

          // Parse response as JSON
          const data = await result.json()
          return data
        } catch (error) {
          console.error('Error during fetch:', error)
          return null
        }
      },
      token,
      mat
    )

    // const response = await axios.get(
    //   `https://${site}/api/gatewayclient/registration/${mat}RS?vinverif=3C0KZ48658A300326`,
    //   {
    //     headers: {
    //       Authorization: `Basic ${auth}`,
    //       'captcha-token': token,
    //       Accept: 'application/json, text/javascript, */*; q=0.01',
    //       'Accept-Encoding': 'gzip, deflate, br, zstd',
    //       'Accept-Language': 'en-US,en;q=0.9',
    //       'Cache-Control': 'no-cache',
    //       Connection: 'keep-alive',
    //       Pragma: 'no-cache'
    //     },
    //     withCredentials: true
    //   }
    // )

    //if (!response.data || response.data == '') {
    if (!response) {
      console.log('NO RESPONSE DATA')
      // await browser.close()
      // console.log('browser closed')
      // // await new Promise(resolve => setTimeout(resolve, 20000))
      // browser = await puppeteer.launch()
      // browserPage = await browser.newPage()
      // console.log('going to page')
      // await browserPage.goto(`https://${site}`, { timeout: 0 })
      // console.log('okay browser again')
      // mat = mat - 1
      mat = -1
      return
    }

    console.log('Inserting ' + mat)
    await sequelize.query(
      `INSERT INTO car_registration (id, make, model, variant, registration, registration_date, type, fuel, fiscal_hp, cylinder, vin, engine, transmission, gearbox_code, constructor_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (registration) DO UPDATE SET make = ?, model = ?, variant = ?, registration_date = ?, type = ?, fuel = ?, fiscal_hp = ?, cylinder = ?, vin = ?, engine = ?, transmission = ?, gearbox_code = ?, constructor_type = ?`,
      {
        replacements: [
          uuid.v4(),
          response.manufacturer || null,
          response.model || null,
          response.bodyType || null,
          `${mat}RS`,
          response.inServiceDate || null,
          response.type || null,
          response.fuel || null,
          response.fiscalPower || null,
          response.cylinder || null,
          response.vin || null,
          response.engine || null,
          response.transmission || null,
          response.gearboxCode || null,
          response.constructorType || null,
          response.manufacturer || null,
          response.model || null,
          response.bodyType || null,
          response.inServiceDate || null,
          response.type || null,
          response.fuel || null,
          response.fiscalPower || null,
          response.cylinder || null,
          response.vin || null,
          response.engine || null,
          response.transmission || null,
          response.gearboxCode || null,
          response.constructorType || null
        ]
      }
    )
    console.log('Done inserting ' + mat)
  } catch (error) {
    console.error('Error during get car info: ' + mat, error)
    mat = -1
    return
  }
}

async function run() {
  console.log('Opening browser')
  const browser = await puppeteer.launch()
  browserPage = await browser.newPage()

  console.log('Going to page')
  await browserPage.goto(`https://${site}`, { timeout: 0 })

  console.log('Page ok, getting currents regs...')
  const regs = await getRegistrations()

  console.log('Regs ok, looping')
  let maxLoops = 4
  for (mat = 140000; mat > 218; mat--) {
    if (regs.includes(mat.toString())) {
      continue
    }
    await getCarInfo()
    maxLoops--
    if (maxLoops === 0) break
    await new Promise(resolve => setTimeout(resolve, Math.random() * 4000))
  }

  console.log('Closing browser')
  //browserPage.close()
  await browser.close()
}

run()
