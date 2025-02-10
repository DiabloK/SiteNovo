import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

export async function getTemplatesFromFirebase() {
  const templatesCol = collection(db, "messages");
  const templateSnapshot = await getDocs(templatesCol);
  const templatesList = templateSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return templatesList;
}
