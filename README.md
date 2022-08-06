# Firejar
Firejar is a [Mongoose](https://mongoosejs.com/)-inspired [Firestore](https://cloud.google.com/firestore/) object modeling tool to make life simpler.

## Installation
Use the package manager [npm](https://www.npmjs.com/) to install Firejar.

```bash
npm install firejar --save
```

# Importing
```javascript
// Using Node.js
const firejar = require('firejar');

// Using ES6 imports
import firejar from 'firejar';
```

# Connection
You can connect to Firejar using the [Firestore service](https://googleapis.dev/nodejs/firestore/latest/Firestore.html) imported from [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup).

```javascript
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { connectDB } from 'firejar';

initializeApp();

connectDB(getFirestore());
```
```javascript
import admin from 'firebase-admin';
import { connectDB } from 'firejar';

admin.initializeApp();

connectDB(admin.firestore());
```

If needed, you can retrieve the same instance of the Firestore service using 'getDB'.

```javascript
import { getDB } from 'firejar';

const db = getDB();
```

# Types
Firejar supports following data types:
- **String**: string
- **Number**: number (integer or float)
- **Boolean**: boolean
- **Object**: Javascript object
- **Array**: Javascript array
- **Date**: Javascript date

# Schema
The Schema constructor has 2 parameters.

- Schema Definitions - Each Key in the schema can have the following properties:
    - type: A type from Firejar Types. **If the type is an Object and its properties are defined explicitly, this attribute should be omitted.**
    - of (optional): If type is an Array, this specifies the type of values inside. **If the type is not an Array, this attribute should be omitted.**
    - required (optional): Boolean indicating if the field is required.
    - default (optional): Any data type specifying default value.
    - validate (optional): An array of 2 values - first value is the check to be carried out (can be a function which accepts *value* as a parameter), second value is a string containing an error message for when check fails.
    - maxlength (optional): An array of 2 values - first value is the limit, second value is a string containing an error message for when check fails.
    - minlength (optional): An array of 2 values - first value is the limit, second value is a string containing an error message for when check fails.
    - transform (optional): A custom method to be carried out to the parsed value.
- Methods (optional):
    - beforeSave: A method to be executed before each save to Firestore.

```javascript
import { Schema, Types } from 'firejar';
import validator from 'validator';
import bcrypt from 'bcrypt';

const { String, Number, Boolean, Array } = Types;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    transform: (value) => value.charAt(0).toUpperCase() + value.slice(1)
  },
  email: {
    type: String,
    required: true,
    validate: [ validator.isEmail, 'Please enter a valid email address' ],
    transform: (value) => value.toLowerCase()
  },
  password: {
    type: String,
    required: true
  },
  // "details" is an Object and its properties are defined explicitly, so the "type" attribute is omitted
  details: {
    address: {
      type: String,
      default: '',
      validate: [ 
        (value) => value.match('^[A-Za-z0-9]+$'), 
        'An address can only contain letters and numbers' 
      ]
    },
    skills: {
      type: Array,
      of: String,
      minlength: [ 1, 'Please enter at least 1 skill' ],
      maxlength: [ 5, 'You can only have up to 5 skills' ]
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  createdAt: {
    type: Number,
    default: () => Date.now()
  }
}, {
  beforeSave: async (data) => {
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
  }
});
```

# Model
You can create model from the schema. It requires 2 parameters.
- collection: String value for the Firestore collection
- schema: An instance of Schema.

```javascript
import { Model } from 'firejar';

const User = Model("users", userSchema);
```

# Usage
Model object has following methods:

## create
This method creates a document in the respective Firestore collection.

**Requires**
- data: An object of the data to be stored in Firestore

**Returns**
- A promise of the data stored in the Firestore collection

```javascript
const data = await User.create({
  name: "johnny davis", 
  email: "johnny@gmail.com", 
  password: "123456",
  details: {
    skills: ["coding"]
  }
});
/*
{
  id: 'IKbgSBsj0pPsq5OyCgjU',
  name: 'Johnny Davis',
  email: 'johnny@gmail.com',   
  password: '$2a$10$FKgf3mILGVZEr6qWbhFMEOAAOjJle5EBQniqJmrs1scruRgF/i8qu', 
  details: {
    address: '',
    skills: ["coding"],
    isAdmin: false
  }       
  createdAt: 1659555047599
}
*/
```

**Optional**
- options: An object containing 3 properties
  - id: A string which can be used as an ID of the newly created document. If omitted, Firestore will automatically generate one.
  - skipValidation: A boolean which can disable the validation before adding document to Firestore.
  - skipFormatting: A boolean which can disable formatting and return the [document reference](https://firebase.google.com/docs/reference/node/firebase.firestore.DocumentReference), instead of the formatted object.

```javascript
const data = await User.create({
  name: "johnny davis", 
  email: "johnny@gmail.com", 
  password: "123456",
  details: {
    skills: ["coding"]
  }
}, { id: 'custom-id', skipValidation: true });
/*
{
  id: 'custom-id',
  name: 'johnny davis',
  email: 'johnny@gmail.com',   
  password: '123456',   
  details: {
    skills: ["coding"]
  }     
}
*/
```
```javascript
const data = await User.create({
  name: "johnny davis", 
  email: "johnny@gmail.com", 
  password: "123456",
  details: {
    skills: ["coding"]
  }
}, { skipFormatting: true });
/*
{
  id: 'IKbgSBsj0pPsq5OyCgjU',
  firestore: ...,
  parent: ...,   
  path: ...,
  ...
}
*/
```

## findById
This method returns a single document from the collection.

**Requires**
- id: id of the document

**Returns**
- Promise of the data from collection

```javascript
const data = await User.findById('IKbgSBsj0pPsq5OyCgjU');
/*
{
  id: 'IKbgSBsj0pPsq5OyCgjU',
  name: 'Johnny Davis',
  email: 'johnny@gmail.com',   
  password: '$2a$10$FKgf3mILGVZEr6qWbhFMEOAAOjJle5EBQniqJmrs1scruRgF/i8qu', 
  details: {
    address: '',
    skills: ["coding"],
    isAdmin: false
  }       
  createdAt: 1659555047599
}
*/
```

**Optional**
- options: An object containing 1 property.
  - skipFormatting: A boolean which can disable the formatting and will return a single [document snapshot](https://firebase.google.com/docs/reference/node/firebase.firestore.DocumentSnapshot) from the collection, instead of the formatted object.

```javascript
const data = await User.findById('IKbgSBsj0pPsq5OyCgjU', { skipFormatting: true });
/*
{
  id: 'IKbgSBsj0pPsq5OyCgjU',
  exists: true,
  metadata: ...,   
  ref: ...,
  ...
}
*/
```

## find
This method can be used to get one or more documents from Firestore. You can use following methods with find.
- where: Specifying conditions.
- orderBy: Ordering data by a field.
- limit: Limiting total documents returned from Firestore.
- offset: Offset on the data returned from Firestore.
- execute: This method is required at the end of each query with find.
  - options (optional) - An object containing 1 property.
    - skipFormatting - A boolean which can disable formatting and return a [query snapshot](https://firebase.google.com/docs/reference/node/firebase.firestore.QuerySnapshot), instead of the formatted documents.

Differtent usages of this method are as following:

```javascript
//returns all the  posts in collection
const posts = await Post.find().execute();
/*
[
  {
    id: 'qXdmXL1ebnE2aAMRJLBt',
    user: { id: 'IKbgSBsj0pPsq5OyCgjU' },
    createdAt: 2022-07-20T18:17:54.456Z, 
    updatedAt: 2022-07-20T18:17:54.456Z, 
    content: 'This is a test post',      
    title: 'Hello World 2'
  },
  {
    id: 'zHsHFjSQ0MCcrIgnilN1',
    user: { id: 'NLQklOyIeP6FChAPtMck' },
    title: 'Hello World',
    createdAt: 2022-07-20T16:16:14.882Z,
    updatedAt: 2022-07-20T18:38:35.018Z,
    content: 'Updated content'
  }
]
*/
```
```javascript
// returns conditional (unformatted) data
const data = await Post
  .find()
  .where('user.id', '==', 'IKbgSBsj0pPsq5OyCgjU')
  .orderBy('createdAt', 'desc')
  .limit(2)
  .offset(1)
  .execute({ skipFormatting: true });
/*
{
  docs: [{...}],
  empty: false,
  metadata: ...,   
  size: 1,
  ...
}
*/
```

## updateById
This method can be used to update the content of an existing document in collection.

**Requires**
- id: Id of the document
- data: Data to be updated

**Returns**
- Promise of the id

```javascript
const data = await User.updateById('IKbgSBsj0pPsq5OyCgjU', { 
  email: 'johnny2@gmail.com' 
});
/*
IKbgSBsj0pPsq5OyCgjU
*/
```
```javascript
const data = await User.updateById('IKbgSBsj0pPsq5OyCgjU', { 
  'details.isAdmin': true 
});
/*
IKbgSBsj0pPsq5OyCgjU
*/
```

**Optional**
- options: An object containing a 1 property
  - skipValidation: A boolean which can disable the validation before updating document in Firestore.

```javascript
const data = await User.updateById(
  'IKbgSBsj0pPsq5OyCgjU', 
  { 
    'details.skills': [] 
  }, 
  { 
    skipValidation: true 
  }
);
/*
IKbgSBsj0pPsq5OyCgjU
*/
```

## deleteById
This method can be used to delete an existing document in collection.

**Requires**
- id: Id of the document

**Returns**
- Promise of the id

```javascript
const data = await User.deleteById('IKbgSBsj0pPsq5OyCgjU');
/*
IKbgSBsj0pPsq5OyCgjU
*/
```

## validate
This method validates input data based on schema rules (does not take into account 'default' and 'required' properties).

**Requires**
- data: An object of the data to be validated

**Returns**
- A promise of the validated data

```javascript
const data = await User.validate({
  isAdmin: true,
  skills: ["coding"]
});
/*
{
  isAdmin: true,
  skills: ["coding"]
}
*/
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)