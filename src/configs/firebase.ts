import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAiqaWSlnKbmfdCFWD7ufbFcHvj1oNng84',
  authDomain: 'quiniela-mundial-d4a88.firebaseapp.com',
  projectId: 'quiniela-mundial-d4a88',
  storageBucket: 'quiniela-mundial-d4a88.appspot.com',
  messagingSenderId: '743574987318',
  appId: '1:743574987318:web:a9506b65136119073b6e97',
};

const firebase = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebase);
