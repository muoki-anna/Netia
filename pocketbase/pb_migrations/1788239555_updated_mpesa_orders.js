/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_121890926")

  // add field
  collection.fields.addAt(17, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3600822142",
    "help": "",
    "hidden": false,
    "id": "relation2300036481",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "store_order",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_121890926")

  // remove field
  collection.fields.removeById("relation2300036481")

  return app.save(collection)
})
