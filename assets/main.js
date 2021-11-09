$(function () {
  const client = ZAFClient.init()
  // client.invoke('resize', { width: '400px', height: '500px' })
  requestViews(client)
    // .then(() => {
    // })
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

function requestViews(client) {
  var settings = {
    url: '/api/v2/views/active.json',
    type:'GET',
    dataType: 'json',
  }
  let views = { views: [] }

  return client.request(settings)
    .then(response => {
      return Promise.all(response.views.map(each => getViewCount(client, each)))
    })
    .then(res => showInfo({ views: [...res] }))
    .catch(error => {
      console.error(error)
      showError(error)
    })
}

function getViewCount(client, viewObj) {
  const settings = {
    url: '/api/v2/views/' + viewObj.id + '/count.json',
    type:'GET',
    dataType: 'json',
  }
  return client.request(settings)
    .then(res => {
      viewObj.ticketCount = res.view_count.pretty
      return viewObj
    })
    .catch(error => {
      console.error(error)
      showError(error)
    })
}
