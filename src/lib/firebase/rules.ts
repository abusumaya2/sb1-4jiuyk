// Firebase Security Rules
export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isValidAmount(amount) {
      return amount is number && amount > 0;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
      
      // User's order history
      match /orderHistory/{orderId} {
        allow read: if isOwner(userId);
        allow write: if false; // Only written by server
      }
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid &&
        isValidAmount(request.resource.data.amount);
      allow update, delete: if false; // Only managed by server
    }

    // Mining collection
    match /mining/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && !exists(/databases/$(database)/documents/mining/$(userId));
      allow update: if isOwner(userId);
      
      // Mining history subcollection
      match /history/{historyId} {
        allow read: if isOwner(userId);
        allow write: if false; // Only written by server
      }
    }

    // Leaderboard collection
    match /leaderboard/{type} {
      allow read: if true;
      allow write: if false; // Only managed by server
      
      match /users/{userId} {
        allow read: if true;
        allow write: if false;
      }
    }

    // Referrals collection
    match /referrals/{referralId} {
      allow read: if isAuthenticated() &&
        (resource.data.referrerId == request.auth.uid || 
         resource.data.referredId == request.auth.uid);
      allow write: if false; // Only managed by server
    }
  }
}`;

// Indexes required for queries
export const firestoreIndexes = {
  indexes: [
    {
      collectionGroup: "orders",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "status", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" }
      ]
    },
    {
      collectionGroup: "leaderboard",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "points", order: "DESCENDING" },
        { fieldPath: "winRate", order: "DESCENDING" }
      ]
    }
  ],
  fieldOverrides: []
};