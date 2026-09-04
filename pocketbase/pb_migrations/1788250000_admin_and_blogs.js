/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Add is_admin to users collection
  const usersCollection = app.findCollectionByNameOrId("users");
  
  if (usersCollection) {
    usersCollection.fields.add(new Field({
      "hidden": false,
      "id": "bool_is_admin",
      "name": "is_admin",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    }));
    app.save(usersCollection);
  }

  // 2. Create blogs collection
  const blogsCollection = new Collection({
    "createRule": "", // Allow admin only
    "deleteRule": "", // Allow admin only
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text_title",
        "name": "title",
        "required": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text_slug",
        "name": "slug",
        "required": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text_category",
        "name": "category",
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text_author",
        "name": "author",
        "type": "text"
      },
      {
        "hidden": false,
        "id": "date_date",
        "name": "date",
        "type": "date"
      },
      {
        "hidden": false,
        "id": "text_readTime",
        "name": "readTime",
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text_image",
        "name": "image",
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text_excerpt",
        "name": "excerpt",
        "type": "text"
      },
      {
        "hidden": false,
        "id": "json_content",
        "name": "content",
        "type": "json" // store arrays of text blocks like in blogData.js
      },
      {
        "hidden": false,
        "id": "json_related",
        "name": "related",
        "type": "json" // store arrays of slugs
      }
    ],
    "id": "pbc_blogs_collection",
    "indexes": [],
    "listRule": "", // Publicly readable
    "name": "blogs",
    "system": false,
    "type": "base",
    "updateRule": "", // Allow admin only
    "viewRule": ""    // Publicly readable
  });

  return app.save(blogsCollection);
}, (app) => {
  // Revert blogs collection
  try {
    const blogsCollection = app.findCollectionByNameOrId("pbc_blogs_collection");
    if (blogsCollection) {
      app.delete(blogsCollection);
    }
  } catch (e) {}

  // Revert is_admin field
  try {
    const usersCollection = app.findCollectionByNameOrId("users");
    if (usersCollection) {
      usersCollection.fields.removeById("bool_is_admin");
      app.save(usersCollection);
    }
  } catch (e) {}
})
