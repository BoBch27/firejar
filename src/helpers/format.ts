const format = (doc: any): any => {
  if (!doc.exists) {
    return null;
  } 
  
  return { id: doc.id, ...doc.data() };
};

export = format;