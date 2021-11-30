import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from '@aws-amplify/api';
import Amplify, { Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import logo from './logo.svg';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

const initialFormState = { name: '', description: '', conf: '' }

function PredictionsUpload() {
  /* This is Identify Entities Advanced feature
   * This will upload user images to the appropriate bucket prefix
   * and a Lambda trigger will automatically perform indexing
   */
  function upload(event) {
    const { target: { files } } = event;
    const [file,] = files || [];
    Storage.put(file.name, file, {
      level: 'public',
      customPrefix: {
        public: 'public/',
      }
    });
  }

  return (
    <div className="Text">
      <div>
        <h2>Intelligent Image Dectection - Upload Here!</h2>
        <input type="file" onChange={upload}></input>
      </div>
    </div>
  );
}


function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }
  
  return (
    <div className="App">
      <h1>Octank - Target Identification Department!</h1>
      <h2>Image Identifcation </h2>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Target ID:"
        value={formData.name}
      />   
       <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Description:"
        value={formData.description}
      />
      <input
        onChange={e => setFormData({ ...formData, 'conf': e.target.value})}
        placeholder="Confidence Score:"
        value={formData.conf}
      />
      <input
        type="file"
        onChange={onChange}
      />
      <button onClick={createNote}>Add New Identification</button>
      <br/>
      <br/>
      <PredictionsUpload />
      <br/>
      <h1> Images for Review </h1>
      <div style={{marginBottom: 30}}>
      {
        notes.map(note => (
          <div key={note.id || note.name}>
            <h2>ID/Name: {note.name}</h2>
            <p>Description: {note.description}</p>
            <p>Confidence Score: {note.conf}</p>
            <button onClick={() => deleteNote(note)}>Remove Item</button>
            {
              note.image && <img src={note.image} style={{width: 400}} alt=" " />
            }
          </div>
        ))
      }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);