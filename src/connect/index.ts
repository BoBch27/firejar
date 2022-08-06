let projectFirestore: any = null;

const connectDB = (firestoreService: any) => projectFirestore = firestoreService;

const getDB = () => projectFirestore;

export { connectDB, getDB };