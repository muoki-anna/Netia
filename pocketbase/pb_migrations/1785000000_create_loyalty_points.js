/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("users");

  const accounts = new Collection({
    name: "loyalty_accounts",
    type: "base",
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: usersCollection.id,
        cascadeDelete: true,
        maxSelect: 1,
      },
      {
        name: "points",
        type: "number",
        required: true,
        onlyInt: true,
      },
      {
        name: "created",
        type: "autodate",
        onCreate: true,
        onUpdate: false,
      },
      {
        name: "updated",
        type: "autodate",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_loyalty_accounts_user ON loyalty_accounts (user)",
    ],
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: "user = @request.auth.id",
    updateRule: "user = @request.auth.id",
    deleteRule: null,
  });

  app.save(accounts);

  const transactions = new Collection({
    name: "loyalty_transactions",
    type: "base",
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: usersCollection.id,
        cascadeDelete: true,
        maxSelect: 1,
      },
      {
        name: "points",
        type: "number",
        required: true,
        onlyInt: true,
      },
      {
        name: "type",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["earn", "redeem"],
      },
      {
        name: "note",
        type: "text",
        required: false,
        max: 500,
      },
      {
        name: "created",
        type: "autodate",
        onCreate: true,
        onUpdate: false,
      },
    ],
    indexes: [
      "CREATE INDEX idx_loyalty_transactions_user ON loyalty_transactions (user)",
    ],
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: "user = @request.auth.id",
    updateRule: null,
    deleteRule: null,
  });

  app.save(transactions);
}, (app) => {
  const transactions = app.findCollectionByNameOrId("loyalty_transactions");
  app.delete(transactions);

  const accounts = app.findCollectionByNameOrId("loyalty_accounts");
  app.delete(accounts);
});
