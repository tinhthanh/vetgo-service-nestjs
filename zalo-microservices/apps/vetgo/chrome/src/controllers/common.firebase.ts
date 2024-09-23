

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import "firebase/compat/database";
import { environment } from '../environment';
firebase.initializeApp(environment.firebaseConfig);
export const FirebaseDatabase = firebase.database();
