let client
let views

$(function () {
  client = ZAFClient.init()
  requestViews(client)
    .then(() => bindEventListeners())
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

  return client.request(settings)
    .then(response => {
      return Promise.all(response.views.map(each => getViewCount(client, each)))
    })
    .then(res => {
      views = { views: [...res] }
      showInfo(views)
    })
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

function buttonRefresh() {
  $('#content').html('<img src="./loading-buffering.gif" class="image is-96x96 mx-auto" />')
  return requestViews(client)
    .then(() => bindEventListeners())
}

function viewURL() {
  client.invoke('routeTo', 'views', this.id)
}

function bindEventListeners() {
  document.getElementById('refresh-button').addEventListener('click', buttonRefresh)
  views.views.map(each => document.getElementById(each.id).addEventListener('click', viewURL))
}