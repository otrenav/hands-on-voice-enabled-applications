
"use strict";

const db = require("./db.js");

exports.handler = async (event, context) => {
  let resp;
  const params = event.queryStringParameters;
  if (params &&
      params.action &&
      valid[params.action] &&
      valid[params.action](params, event)) {
    const alexaUserID = await db.getAlexaUserID(params.webAppUserID);
    resp = await actions[params.action](params, alexaUserID);
  } else {
    resp = { success: false };
    logError(params, event);
  }
  return {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    "body": JSON.stringify(resp)
  }
};

const actions = {};

actions.createList = function(params, alexaUserID) {
  db.createList(params.list, alexaUserID);
  return { success: true };
}

actions.deleteList = function(params, alexaUserID) {
  db.deleteList(params.list, alexaUserID);
  return { success: true };
}

actions.readLists = async function(params, alexaUserID) {
  const lists = await db.getListsFromDB(alexaUserID);
  return { success: true, result: lists };
}

actions.createItem = function(params, alexaUserID) {
  db.createItem(params.list, params.item, params.date, alexaUserID);
  return { success: true };
}

actions.deleteItem = function(params, alexaUserID) {
  db.deleteItem(params.list, params.number, alexaUserID);
  return { success: true };
}

actions.updateListState = async function(params, alexaUserID) {
  const lists = await db.getListsFromDB(alexaUserID);
  let state = 'open';
  lists.forEach((list, i) => {
    if (list.name === params.list && list.state === 'open') {
      state = 'close';
    }
  });
  db.updateListState(params.list, state, alexaUserID);
  return { success: true };
}

actions.getFirstName = async function(params, alexaUserID) {
  const firstName = await db.getFirstName(alexaUserID);
  return { success: true, result: firstName };
};

const valid = {};

valid.createList = function(params, event) {
  if (event.httpMethod !== "POST") return false;
  if (!(params.webAppUserID)) return false;
  if (!(params.list)) return false;
  return true;
}

valid.deleteList = function(params, event) {
  if (event.httpMethod !== "DELETE") return false;
  if (!(params.webAppUserID)) return false;
  if (!(params.list)) return false;
  return true;
}

valid.readLists = function(params, event) {
  if (event.httpMethod !== "GET") return false;
  if (!(params.webAppUserID)) return false;
  return true;
}

valid.createItem = function(params, event) {
  if (event.httpMethod !== "POST") return false;
  if (!(params.webAppUserID)) return false;
  if (!(params.list)) return false;
  if (!(params.item)) return false;
  if (!(params.date)) return false;
  return true;
}

valid.deleteItem = function(params, event) {
  if (event.httpMethod !== "DELETE") return false;
  if (!(params.webAppUserID)) return false;
  if (!(params.number)) return false;
  if (!(params.list)) return false;
  return true;
}

valid.updateListState = function(params, event) {
  if (event.httpMethod !== "PUT") return false;
  if (!(params.webAppUserID)) return false;
  if (!(params.list)) return false;
  return true;
}

valid.getFirstName = function(params, event) {
  if (event.httpMethod !== "GET") return false;
  if (!(params.webAppUserID)) return false;
  return true;
}

function logError(params, event) {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log("ERROR: Invalid parameters or event");
  console.log(JSON.stringify(params));
  console.log(JSON.stringify(event));
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
}
