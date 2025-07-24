// MongoDB initialization script for Docker
print('Initializing MongoDB databases for NestJS Microservices...');

// Create databases with initial setup
const databases = ['iam_db', 'bpm_db', 'lgm_db', 'nsm_db'];

databases.forEach(dbName => {
  const db = db.getSiblingDB(dbName);
  
  // Create a dummy collection to ensure database is created
  db.createCollection('_init');
  
  // Create indexes for common fields
  db._init.createIndex({ "owner.userId": 1 });
  db._init.createIndex({ "owner.orgId": 1 });
  db._init.createIndex({ "createdAt": 1 });
  db._init.createIndex({ "deletedAt": 1 });
  
  // Remove the dummy collection
  db._init.drop();
  
  print(`Database ${dbName} initialized successfully`);
});

print('MongoDB initialization completed!');
