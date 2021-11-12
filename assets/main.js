let client
let subdomain

$(function () {
  client = ZAFClient.init()
  // client.invoke('resize', { width: '400px', height: '500px' })
  // bindEventListener()
  client.context()  
    .then(res => {
      return subdomain = res.account.subdomain
    })
    .then(subdomain => requestViews(client, subdomain))
    .then(() => bindEventListener())
})

function showInfo (data) {
  const source = $('#view-template').html()
  const template = Handlebars.compile(source)
  const html = template(data)
  $('#content').html(html)
}

function showError(response) {
  var error_data = {
    'status': response.status,
    'statusText': response.statusText
  }
  var source = $("#error-template").html()
  var template = Handlebars.compile(source)
  var html = template(error_data)
  $("#content").html(html)
}

function requestViews(client, subdomain) {
  var settings = {
    url: '/api/v2/views/active.json',
    type:'GET',
    dataType: 'json',
  }

  return client.request(settings)
    .then(response => {
      return Promise.all(response.views.map(each => getViewCount(client, each, subdomain)))
    })
    .then(res => showInfo({ views: [...res] }))
    .catch(error => {
      console.error(error)
      showError(error)
    })
}

function getViewCount(client, viewObj, subdomain) {
  const settings = {
    url: '/api/v2/views/' + viewObj.id + '/count.json',
    type:'GET',
    dataType: 'json',
  }

  return client.request(settings)
    .then(res => {
      viewObj.ticketCount = res.view_count.pretty
      viewObj.link = 'https://'+ subdomain + '.zendesk.com/agent/filters/' + viewObj.id
      // console.log(viewObj)
      return viewObj
    })
    .catch(error => {
      console.error(error)
      showError(error)
    })
}

function buttonRefresh() {
  $('#content').html('<img src="./loading-buffering.gif" heighy/>')
  console.log('click!')
  return requestViews(client, subdomain)
}

function bindEventListener() {
  document.getElementById('refresh-button').addEventListener('click', buttonRefresh)
  console.log('listener bound!')
}