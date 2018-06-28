
const URL = (
  "https://pc94dupk7c.execute-api.us-east-1.amazonaws.com" +
  "/staging/ask-custom-ToDos-Web-App-site"
);

let UPDATES = "";
let CURRENT_LIST = "";
let WEB_APP_USER_ID = "";

function logIn() {
  WEB_APP_USER_ID = $("#webAppUserID").val();
  $("#login").html("");
  showFirstRow();
  showLists();
}

function showFirstRow() {
  let url = URL;
  url += `?webAppUserID=${WEB_APP_USER_ID}`
  url += `&action=getFirstName`;
  $.ajax({url: url, method: "GET", dataType: "json"})
   .done(resp => updateFirstRow(resp.result));
}

function updateFirstRow(name) {
  let html = `
    <div class="row">
      <div class="col mt-5 mb-5">
        <h2 class="bold">
          ${name}'s To-Dos
        </h2>
      </div>
          <div class="col mt-5 mb-5 align-right">
            <span class="info">Continous updates</span>
              <input type="checkbox" id="updates">
          </div>
    </div>
  `;
  $("#first-row").html(html);
}

function showLists() {
  let url = URL;
  url += `?webAppUserID=${WEB_APP_USER_ID}`
  url += `&action=readLists`;
  $.ajax({url: url, method: "GET", dataType: "json"})
   .done(resp => updateLists(resp.result));
}

function updateLists(lists) {
  let html = `
    <div id="accordion">
  `;
  lists.forEach((list, i) => { html += buildListHTML(list, i); });
  html += `
      <div class="row">
        <div class="col align-right">
          <button type="button"
            class="btn btn-raised btn-warning create-button"
            data-toggle="modal" data-target="#createListModal">
            Create List
          </button>
        </div>
      </div>
    </div>
  `;
  $("#lists").html(html);
}

function buildListHTML(list, i) {
  const listState = list.state === "open" ? "show" : "";
  let html = `
    <div class="card bg-info shadow mb-4">
      <div class="card-header" id="heading${i}">
        <div class="row">
          <div class="col">
            <h5 class="mb-0">
              <button class="btn btn-link collapsed text-white bold"
                      data-toggle="collapse" data-target="#collapse${i}"
                      onclick="updateListState('${list.name}')">
                ${list.name}
              </button>
            </h5>
          </div>
                <div class="col">
                  <div class="trash trash-list">
                    <i class="fas fa-trash align-middle mr-3"
                       onclick="deleteList('${list.name}')"></i>
                  </div>
                </div>
        </div>
      </div>
                      <div id="collapse${i}" class="collapse ${listState}">
                        <div class="card-body bg-light-blue">
  `;
  list.items.forEach((item, j) => {
    html += `
          <div class="row mb-2">
            <div class="col-2 bold date">
              ${item.due}
            </div>
            <div class="col-8 bold">
              ${item.name.toUpperCase()}
            </div>
            <div class="col-2 bold">
              <div class="trash trash-item">
                <i class="fas fa-trash align-middle mr-3"
                   onclick="deleteItem('${list.name}', ${j})"></i>
              </div>
            </div>
          </div>
    `;
  });
  html += `
          <div class="row mb-2 mt-4">
            <div class="col align-right">
              <button type="button"
                      class="btn btn-raised btn-success create-button"
                      data-toggle="modal" data-target="#createItemModal"
                      onclick="setCurrentList('${list.name}')">
                Create Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return html;
}

function createList() {
  const listName = $("#inputList").val().toLowerCase();
  let url = URL;
  url += `?webAppUserID=${WEB_APP_USER_ID}`
  url += `&action=createList`;
  url += `&list=${listName}`;
  $.ajax({url: url, method: "POST", dataType: "json"})
   .done(resp => console.log(resp));
  $("#inputList").val("");
  $("#createListModal").modal('hide');
}

function deleteList(listName) {
  let url = URL;
  url += `?webAppUserID=${WEB_APP_USER_ID}`
  url += `&action=deleteList`;
  url += `&list=${listName}`;
  $.ajax({url: url, method: "DELETE", dataType: "json"})
   .done(resp => console.log(resp));
}

function updateListState(listName) {
  let url = URL;
  url += `?webAppUserID=${WEB_APP_USER_ID}`
  url += `&action=updateListState`;
  url += `&list=${listName}`;
  $.ajax({url: url, method: "PUT", dataType: "json"})
   .done(resp => console.log(resp));
}

function setCurrentList(listName) {
  CURRENT_LIST = listName.toLowerCase();
}

function createItem() {
  const item = $("#inputItem").val().toLowerCase();
  const date = $("#inputDate").val().toLowerCase();
  let url = URL;
  url += `?webAppUserID=${WEB_APP_USER_ID}`
  url += `&action=createItem`;
  url += `&list=${CURRENT_LIST}`;
  url += `&item=${item}`;
  url += `&date=${date}`;
  $.ajax({url: url, method: "POST", dataType: "json"})
   .done(resp => console.log(resp));
  $("#inputItem").val("");
  $("#inputDate").val("");
  $("#createItemModal").modal('hide');
}

function deleteItem(listName, index) {
  let url = URL;
  url += `?webAppUserID=${WEB_APP_USER_ID}`
  url += `&action=deleteItem`;
  url += `&list=${listName}`;
  url += `&number=${index}`;
  $.ajax({url: url, method: "DELETE", dataType: "json"})
   .done(resp => console.log(resp));
}

setInterval(() => {
  if ($("#updates")[0] && $("#updates")[0].checked) { showLists(); }
}, 5000);
