
"use strict";

/* QUIZ: What happens if there are no lists/items and we use them? */

const Alexa = require("ask-sdk-core");

const h = require("./helpers.js");
const db = require("./db.js");

const CreateList = {
  canHandle(input) {
    return h.handles(input, "IntentRequest", "CreateList");
  },
  async handle(input) {
    const s = h.setupInput(input); let msg;
    if (s.request.dialogState !== "COMPLETED") {
      return input
        .responseBuilder
        .addDelegateDirective(s.intent)
        .getResponse();
    } else if (h.slotHasValue(s.slots.list) &&
               await db.listExists(s.slots.list.value, s.alexaUserID)) {
      msg = `The ${s.slots.list.value} list already `;
      msg += `exists. Choose another name.`;
      return input
        .responseBuilder
        .speak(msg)
        .reprompt(msg)
        .addElicitSlotDirective("list")
        .getResponse();
    } else {
      db.createList(s.slots.list.value, s.alexaUserID);
      msg = `Done. I created the ${s.slots.list.value} list.`;
    }
    return input.responseBuilder.speak(msg).getResponse();
  }
};

const DeleteList = {
  canHandle(input) {
    return h.handles(input, "IntentRequest", "DeleteList");
  },
  async handle(input) {
    /* QUIZ: how would you avoid the "as well as the 0 items it contains? */
    const s = h.setupInput(input); let msg;
    if (s.request.dialogState !== "COMPLETED" && !h.slotHasValue(s.slots.list)) {
      return input.responseBuilder.addDelegateDirective(s.intent).getResponse();
    } else if (!(await db.listExists(s.slots.list.value, s.alexaUserID))) {
      msg = `The ${s.slots.list.value} list does not exist.`;
    } else if (s.intent.confirmationStatus === "NONE") {
      const items = await db.getListItems(s.slots.list.value, s.alexaUserID);
      msg = `The ${s.slots.list.value} list will be deleted, as well as the `;
      msg += `${items.length} item${items.length > 1 ? "s" : " "} it contains.`;
      msg += `This can not be undone. Are you sure?`;
      return input
        .responseBuilder
        .speak(msg)
        .reprompt(msg)
        .addConfirmIntentDirective()
        .getResponse();
    } else if (s.intent.confirmationStatus !== "CONFIRMED") {
      msg = "Ok. I cancelled it";
    } else {
      db.deleteList(s.slots.list.value, s.alexaUserID);
      msg = `Done. I deleted the ${s.slots.list.value} list.`;
    }
    return input.responseBuilder.speak(msg).getResponse();
  }
};

const ReadLists = {
  canHandle(input) {
    return h.handles(input, "IntentRequest", "ReadLists");
  },
  async handle(input) {
    const s = h.setupInput(input); let msg;
    const listNames = await db.getListNames(s.alexaUserID);
    if (listNames.length === 0) {
      msg = "You don't have any lists yet. Add some!";
    } else if (listNames.length === 1) {
      msg = `You only have the ${listNames[0]} list. Why not add more?`;
    } else {
      msg = "You have the following lists: ";
      msg += h.getListNamesAsString(listNames);
    }
    return input.responseBuilder.speak(msg).getResponse();
  }
};

const CreateItem = {
  canHandle(input) {
    return h.handles(input, "IntentRequest", "CreateItem");
  },
  async handle(input) {
    const s = h.setupInput(input); let msg;
    /* QUIZ: What would happen if there are no lists to start with? */
    const elicitPhrases = {
      list: "In what list should the item be created?",
      date: "When is the item due?",
      item: "What's the item?"
    };
    const listNames = await db.getListNames(s.alexaUserID);
    const requiredSlots = ["list", "date", "item"];
    if (listNames.length === 0) {
      msg = "You do not have any lists. You should create one first.";
    } else if (h.slotHasValue(s.slots.list) &&
          !(await db.listExists(s.slots.list.value, s.alexaUserID))) {
      msg = `The ${s.slots.list.value} list does not exist. Your lists `;
      msg += `are: ${h.getListNamesAsString(listNames)}. `;
      msg += `To continue, choose one.`;
      return input
        .responseBuilder
        .speak(msg)
        .reprompt(msg)
        .addElicitSlotDirective("list")
        .getResponse();
    } else if (s.request.dialogState !== "COMPLETED") {
      for (let i = 0; i < requiredSlots.length; i++) {
        if (!h.slotHasValue(s.slots[requiredSlots[i]])) {
          msg = elicitPhrases[requiredSlots[i]];
          return input
            .responseBuilder
            .speak(msg)
            .reprompt(msg)
            .addElicitSlotDirective(requiredSlots[i])
            .getResponse();
        }
      }
      return input.responseBuilder.addDelegateDirective(s.intent).getResponse();
    } else if (s.intent.confirmationStatus !== "CONFIRMED") {
      msg = "Ok. I cancelled it.";
    } else {
      db.createItem(
        s.slots.list.value,
        s.slots.item.value,
        s.slots.date.value,
        s.alexaUserID
      );
      msg = "Done.";
    }
    return input.responseBuilder.speak(msg).getResponse();
  }
};

const DeleteItem = {
  canHandle(input) {
    return h.handles(input, "IntentRequest", "DeleteItem");
  },
  async handle(input) {
    const s = h.setupInput(input); let msg;
    if (!h.slotHasValue(s.slots.list)) {
      return input.responseBuilder.addDelegateDirective(s.intent).getResponse();
    } else if (!(await db.listExists(s.slots.list.value, s.alexaUserID))) {
      const listNames = await db.getListNames(s.alexaUserID);
      msg = `The ${s.slots.list.value} list does not exist. Your lists `;
      msg += `are: ${h.getListNamesAsString(listNames)}. `;
      msg += `To continue, choose one.`;
      return handerInput
        .responseBuilder
        .speak(msg)
        .reprompt(msg)
        .addElicitSlotDirective("list")
        .getResponse();
    } else if (!h.slotHasValue(s.slots.number)) {
      const items = await db.getListItems(s.slots.list.value, s.alexaUserID);
      if (items.length === 0) {
        msg = `Your ${s.slots.list.value} list does not have any items.`;
        return input.responseBuilder.speak(msg).getResponse();
      } else {
        msg = `Your ${s.slots.list.value} list has ${items.length} `;
        msg += `item${items.length > 1 ? "s" : " "}: `;
        msg += h.getListItemsAsString(items);
        msg += " To continue, choose one item number.";
        return input
          .responseBuilder
          .speak(msg)
          .reprompt(msg)
          .addElicitSlotDirective("number")
          .getResponse();
      }
    } else if (s.request.dialogState !== "COMPLETED" &&
               s.intent.confirmationStatus !== "CONFIRMED") {
      const items = await db.getListItems(s.slots.list.value, s.alexaUserID);
      msg = `The ${items[s.slots.number.value - 1].name} item from the `;
      msg += `${s.slots.list.value} list will be deleted. Are you sure?`;
      return input
        .responseBuilder
        .speak(msg)
        .reprompt(msg)
        .addConfirmIntentDirective()
        .getResponse();
    } else if (s.request.dialogState === "COMPLETED" &&
               s.intent.confirmationStatus !== "CONFIRMED") {
      msg = "Ok. I cancelled it.";
    } else if (s.request.dialogState === "COMPLETED" &&
               s.intent.confirmationStatus === "CONFIRMED") {
      db.deleteItem(
        s.slots.list.value,
        s.slots.number.value - 1,
        s.alexaUserID
      );
      msg = "Done.";
    } else {
      return input.responseBuilder.addDelegateDirective(s.intent).getResponse();
    }
    return input.responseBuilder.speak(msg).getResponse();
  }
};

const ReadItems = {
  canHandle(input) {
    return h.handles(input, "IntentRequest", "ReadItems");
  },
  async handle(input) {
    const s = h.setupInput(input); let msg;
    if (!h.slotHasValue(s.slots.list)) {
      return input
        .responseBuilder
        .addDelegateDirective(s.intent)
        .getResponse();
    } else if (!(await db.listExists(s.slots.list.value, s.alexaUserID))) {
      msg = `The ${s.slots.list.value} list does not exist.`;
    } else {
      const items = await db.getListItems(s.slots.list.value, s.alexaUserID);
      if (items.length === 0) {
        msg = `Your ${s.slots.list.value} list does not have any items.`;
      } else if (items.length === 1) {
        msg = `Your ${s.slots.list.value} list has 1 item: `;
        msg += `${items[0].name} for ${items[0].due}.`;
      } else {
        msg = `Your ${s.slots.list.value} list has ${items.length} items: `;
        msg += h.getListItemsAsString(items);
      }
    }
    return input.responseBuilder.speak(msg).getResponse();
  }
};

const LinkUser = {
  /* QUIZ: How to avoid asking for first name again? */
  canHandle(input) {
    return h.handles(input, "IntentRequest", "LinkUser");
  },
  async handle(input) {
    const s = h.setupInput(input); let msg;
    if (s.request.dialogState !== "COMPLETED") {
      return input
        .responseBuilder
        .addDelegateDirective(s.intent)
        .getResponse();
    } else if (h.slotHasValue(s.slots.webAppUserID) &&
               await db.webAppUserIDExists(s.slots.webAppUserID)) {
      msg = `The ${s.slots.webAppUserID.value} user ID already `;
      msg += `exists. Choose another four digit number.`;
      return input
        .responseBuilder
        .speak(msg)
        .reprompt(msg)
        .addElicitSlotDirective("webAppUserID")
        .getResponse();
    } else {
      db.linkUser(
        s.alexaUserID,
        s.slots.webAppUserID.value,
        s.slots.firstName.value
      );
      msg = `Done. I linked your account to user ID `;
      msg += `${s.slots.webAppUserID.value}.`;
    }
    return input.responseBuilder.speak(msg).getResponse();
  }
};

const UpdateListState = {
  canHandle(input) {
    return h.handles(input, "IntentRequest", "UpdateListState");
  },
  async handle(input) {
    const s = h.setupInput(input); let msg;
    const listNames = await db.getListNames(s.alexaUserID);
    const requiredSlots = ["list", "date", "item"];
    if (listNames.length === 0) {
      msg = "You do not have any lists. You should create one first.";
    } else if (h.slotHasValue(s.slots.list) &&
               !(await db.listExists(s.slots.list.value, s.alexaUserID))) {
      msg = `The ${s.slots.list.value} list does not exist. Your lists `;
      msg += `are: ${h.getListNamesAsString(listNames)}. `;
      msg += `To continue, choose one.`;
      return input
        .responseBuilder
        .speak(msg)
        .reprompt(msg)
        .addElicitSlotDirective("list")
        .getResponse();
    } else if (s.request.dialogState !== "COMPLETED") {
      return input
        .responseBuilder
        .addDelegateDirective(s.intent)
        .getResponse();
    } else {
      db.updateListState(
        s.slots.list.value,
        s.slots.listState.value,
        s.alexaUserID
      );
      msg = "Done.";
    }
    return input.responseBuilder.speak(msg).getResponse();
  }
};

const LaunchRequestHandler = {
  canHandle(input) {
    return input.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(input) {
    let msg = "Hi! Welcome to the To-Dos Web App. I can help you manage ";
    msg += "your To-Dos using lists of items. What would you like to do?";
    return input.responseBuilder.speak(msg).reprompt(msg).getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(input) {
    return h.handles(input, "IntentRequest", "AMAZON.HelpIntent");
  },
  handle(input) {
    let msg = "You can ask me to create, delete, and read ";
    msg += "lists and items, as well as read them back to you.";
    return input.responseBuilder.speak(msg).reprompt(msg).getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(input) {
    return input.requestEnvelope.request.type === "IntentRequest"
        && (input.requestEnvelope.request.intent.name === "AMAZON.CancelIntent"
         || input.requestEnvelope.request.intent.name === "AMAZON.StopIntent");
  },
  handle(input) {
    return input.responseBuilder.getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(input) {
    return input.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(input) {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(`Session ended with reason: ${input.requestEnvelope.request.reason}`);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
    return input.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(input, error) {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(`Error handled: ${error.message}`);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    let msg = "Sorry, there was an error.";
    return input.responseBuilder.speak(msg).getResponse();
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    CreateList,
    DeleteList,
    ReadLists,
    UpdateListState,
    CreateItem,
    DeleteItem,
    ReadItems,
    LinkUser,
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
