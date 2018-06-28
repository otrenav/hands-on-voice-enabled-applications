
const helpers = {};

helpers.handles = function(input, type, intentName) {
  return input.requestEnvelope.request.type === type &&
         input.requestEnvelope.request.intent.name === intentName
}

helpers.setupInput = function(input) {
  const request = input.requestEnvelope.request;
  return {
    alexaUserID: input.requestEnvelope.session.user.userId,
    slots: getSlots(request.intent),
    intent: request.intent,
    request: request
  }
}

helpers.slotHasValue = function(slot) {
  return slot.value !== null;
}

helpers.getListNamesAsString = function(listNames) {
  let string = "";
  listNames.forEach((list, index) => {
    string += list + separator(index, listNames.length);
  });
  return string;
}

helpers.getListItemsAsString = function(items) {
  let msg = "";
  items.forEach((item, index) => {
    msg += `${index + 1}: ${item.name} for ${item.due}`;
    msg += `${separator(index, items.length)}`;
  });
  return msg;
}

function separator(index, length) {
  return index < length - 2 ? ", " : index == length - 2 ? ", and" : ".";
}

function getSlots(intent) {
  const slots = {};
  if (intent.slots) {
    Object.keys(intent.slots).forEach((key) => {
      let code = null;
      const slot = intent.slots[key];
      if (slot.resolutions && slot.resolutions.resolutionsPerAuthority[0]) {
        code = slot.resolutions.resolutionsPerAuthority[0].status.code;
      }
      slots[key] = {
        value: slot.value ? slot.value : null,
        code: code
      }
    });
  }
  return slots;
}

module.exports = helpers;
