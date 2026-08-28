/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const collection = new Collection({
      type: "base",
      name: "mpesa_orders",
      // Locked down: all reads/writes go through the Express server using
      // the superuser client (STK push init + Safaricom callback + status
      // polling route). No direct browser access to this collection.
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "checkout_request_id",
          type: "text",
          required: true,
          max: 100,
        },
        {
          name: "merchant_request_id",
          type: "text",
          required: false,
          max: 100,
        },
        { name: "phone", type: "text", required: true, max: 20 },
        { name: "amount", type: "number", required: true, min: 0 },
        {
          name: "currency",
          type: "text",
          required: false,
          max: 10,
        },
        {
          name: "status",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["pending", "paid", "failed", "cancelled"],
        },
        {
          name: "order_type",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["product", "subscription"],
        },
        { name: "items_snapshot", type: "json", required: false },
        { name: "customer_email", type: "email", required: false },
        { name: "customer_name", type: "text", required: false, max: 200 },
        {
          name: "user",
          type: "relation",
          required: false,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: false,
        },
        { name: "mpesa_receipt", type: "text", required: false, max: 100 },
        { name: "result_desc", type: "text", required: false, max: 500 },
        { name: "confirmation_sent", type: "bool", required: false },
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
        "CREATE UNIQUE INDEX idx_mpesa_orders_checkout_request_id ON mpesa_orders (checkout_request_id)",
      ],
    });

    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("mpesa_orders");
    app.delete(collection);
  },
);
