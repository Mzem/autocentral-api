const axios = require('axios')
const { Sequelize } = require('sequelize')
const uuid = require('uuid')
const args = process.argv.slice(2)

// The first argument is the token
const tokens = args.filter(arg => arg.includes('03A'))
let mat = 240000
let tokensLength

const site = process.env.SITE_SCRIPT
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

async function getCarInfo(token) {
  try {
    console.log('Request for ' + mat)
    console.log('token ' + token)

    const response = await axios.get(
      `https://${site}/api/gatewayclient/registration/${mat}RS?vinverif=3C0KZ48658A300326`,
      {
        headers: {
          Authorization: `Basic ${process.env.VID_AUTH}`,
          'captcha-token': token
        }
        //withCredentials: true
      }
    )

    if (!response.data || response.data == '') {
      console.log('NO RESPONSE DATA')
      tokensLength = -1
      return
    }

    console.log('Inserting ' + mat)
    await sequelize.query(
      `INSERT INTO car_registration (id, make, model, variant, registration, registration_date, type, fuel, fiscal_hp, cylinder, vin, engine, transmission, gearbox_code, constructor_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (registration) DO UPDATE SET make = ?, model = ?, variant = ?, registration_date = ?, type = ?, fuel = ?, fiscal_hp = ?, cylinder = ?, vin = ?, engine = ?, transmission = ?, gearbox_code = ?, constructor_type = ?`,
      {
        replacements: [
          uuid.v4(),
          response.data.manufacturer || null,
          response.data.model || null,
          response.data.bodyType || null,
          `${mat}RS`,
          response.data.inServiceDate || null,
          response.data.type || null,
          response.data.fuel || null,
          response.data.fiscalPower || null,
          response.data.cylinder || null,
          response.data.vin || null,
          response.data.engine || null,
          response.data.transmission || null,
          response.data.gearboxCode || null,
          response.data.constructorType || null,
          response.data.manufacturer || null,
          response.data.model || null,
          response.data.bodyType || null,
          response.data.inServiceDate || null,
          response.data.type || null,
          response.data.fuel || null,
          response.data.fiscalPower || null,
          response.data.cylinder || null,
          response.data.vin || null,
          response.data.engine || null,
          response.data.transmission || null,
          response.data.gearboxCode || null,
          response.data.constructorType || null
        ]
      }
    )
    console.log('Done inserting ' + mat)
  } catch (error) {
    console.error('Error during get car info: ' + mat, error)
    tokensLength = -1
    return
  }
}

async function run() {
  console.log('Getting currents regs...')
  const regs = await getRegistrations()

  console.log('Regs ok, looping')
  console.log(tokens.length + ' tokens')
  let tokensLength = tokens.length
  for (; tokensLength > 0; tokensLength--) {
    do {
      mat = mat - 1
    } while (regs.includes(mat.toString()))
    const token = tokens[tokensLength - 1]
    await getCarInfo(token)
  }
}

run()
