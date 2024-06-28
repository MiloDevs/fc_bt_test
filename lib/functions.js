import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { firebaseApp } from "../Database/config";

// Initialize Firestore
const db = getFirestore(firebaseApp);

/**
 * Function to post data to a specific collection in Firestore
 * @param {string} collectionPath - Path to the Firestore collection
 * @param {string} docId - Document ID for the new document
 * @param {object} data - Data to be added to the document
 * @returns {Promise} - A promise that resolves when the data is successfully added
 */
export const addDataToFirestore = async (collectionPath, docId, data) => {
  try {
    const docRef = doc(db, ...collectionPath.split("/"), docId);
    await setDoc(docRef, data);
    console.log(`Document successfully written at ${collectionPath}/${docId}`);
    return docRef.id;
  } catch (error) {
    console.error("Error writing document: ", error);
    throw new Error("Failed to add document");
  }
};

/**
 * Function to fetch data from a specific collection in Firestore
 * @param {string} collectionPath - Path to the Firestore collection
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of documents
 */
export const fetchDataFromFirestore = async (collectionPath) => {
  try {
    const collectionRef = collection(db, ...collectionPath.split("/"));
    const querySnapshot = await getDocs(collectionRef);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`Data successfully fetched from ${collectionPath}`);
    return data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw new Error("Failed to fetch data");
  }
};

/**
 * Function to remove data from a specific collection in Firestore
 * @param {string} collectionPath - Path to the Firestore collection
 * @param {string} docId - Document ID for the document to be deleted
 * @returns {Promise} - A promise that resolves when the document is successfully deleted
 */
export const deleteDataFromFirestore = async (collectionPath, docId) => {
  try {
    const docRef = doc(db, ...collectionPath.split("/"), docId);
    await deleteDoc(docRef);
    console.log(
      `Document successfully deleted from ${collectionPath}/${docId}`
    );
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw new Error("Failed to delete document");
  }
};
