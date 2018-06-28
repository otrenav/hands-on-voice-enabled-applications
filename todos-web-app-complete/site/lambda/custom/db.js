
const db = {};

const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

db.createList = async function(listName, alexaUserID) {
  /* QUIZ: What would happen if we had not checked that the list exists? */
  const lists = await db.getListsFromDB(alexaUserID);
  lists.push({ name: listName, state: 'open', items: [] });
  saveListsInDB(lists, alexaUserID);
}

db.deleteList = async function(listName, alexaUserID) {
  const lists = await db.getListsFromDB(alexaUserID);
  saveListsInDB(lists.filter(l => l.name != listName), alexaUserID);
}

db.getListNames = async function(alexaUserID) {
  return (await db.getListsFromDB(alexaUserID)).map((l, i) => l.name);
}

db.updateListState = async function(listName, listState, alexaUserID) {
  const lists = await db.getListsFromDB(alexaUserID);
  const newLists = lists.map((list, index) => {
    if (list.name === listName) {
      list.state = listState;
    }
    return list;
  });
  saveListsInDB(newLists, alexaUserID);
}

db.createItem = async function(listName, item, date, alexaUserID) {
  const lists = await db.getListsFromDB(alexaUserID);
  const newLists = lists.map((list, index) => {
    if (list.name === listName) {
      list.items.push({ name: item, due: date });
    }
    return list;
  });
  saveListsInDB(newLists, alexaUserID);
}

db.deleteItem = async function(listName, index, alexaUserID) {
  const lists = await db.getListsFromDB(alexaUserID);
  const newLists = lists.map((list, i) => {
    if (list.name === listName) {
      list.items.splice(index, 1);
    }
    return list;
  });
  saveListsInDB(newLists, alexaUserID);
}

db.getListItems = async function(listName, alexaUserID) {
  const lists = await db.getListsFromDB(alexaUserID);
  const newLists = lists.filter(l => l.name === listName)[0].items;
  return newLists;
}

db.listExists = async function(listName, alexaUserID) {
  return (await db.getListNames(alexaUserID)).indexOf(listName) > -1;
};

db.linkUser = function(alexaUserID, webAppUserID, firstName) {
  dynamoDB.put({
    TableName: "to-dos-web-app-users",
    Item: {
      alexaUserID: alexaUserID,
      webAppUserID: webAppUserID,
      firstName: firstName
    }
  }).promise().catch(err => logError(err));
}

db.webAppUserIDExists = function(webAppUserID) {
  return dynamoDB.scan({
    TableName: "to-dos-web-app-users",
    FilterExpression: "webAppUserID = :webAppUserID",
    ExpressionAttributeValues: { ":webAppUserID": webAppUserID }
  }).promise().then(resp => resp.Count > 0);
}

db.getAlexaUserID = function(webAppUserID) {
  return dynamoDB.scan({
    TableName: "to-dos-web-app-users",
    FilterExpression: "webAppUserID = :webAppUserID",
    ExpressionAttributeValues: { ":webAppUserID": webAppUserID }
  }).promise().then(resp => resp.Items[0].alexaUserID);
}

db.getFirstName = function(alexaUserID) {
  /* QUIZ: What happens if now users are registered? */
  return dynamoDB.scan({
    TableName: "to-dos-web-app-users",
    FilterExpression: "alexaUserID = :alexaUserID",
    ExpressionAttributeValues: { ":alexaUserID": alexaUserID }
  }).promise().then(resp => resp.Items[0].firstName);
}

db.getListsFromDB = function(alexaUserID) {
  return dynamoDB.get({
    TableName : "to-dos-web-app-lists",
    Key: { alexaUserID: alexaUserID }
  }).promise().then(resp => resp.Item ? resp.Item.lists : []);
}

function saveListsInDB(lists, alexaUserID) {
  dynamoDB.put({
    TableName: "to-dos-web-app-lists",
    Item: {
      alexaUserID: alexaUserID,
      lists: lists
    }
  }).promise().catch(err => logError(err));
}

function logError(error) {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log("ERROR when working with DynamoDB");
  console.log(JSON.stringify(error));
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
}

module.exports = db;
