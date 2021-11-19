import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from '@aws-amplify/api';
import Amplify, { Storage, Predictions } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import logo from './logo.svg';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

const initialFormState = { name: '', description: '', conf: '' }

function TextIdentification() {
  const [response, setResponse] = useState("Gather information from uploading an image...powered by ML! ")

  function identifyFromFile(event) {
    setResponse('Gathering information from uploaded image...powered by ML');
    const { target: { files } } = event;
    const [file,] = files || [];

    if (!file) {
      return;
    }
    Predictions.identify({
      text: {
        source: {
          file,
        },
        format: "PLAIN", // Available options "PLAIN", "FORM", "TABLE", "ALL"
      }
    }).then(({text: { fullText }}) => {
      setResponse(fullText)
    })
      .catch(err => setResponse(JSON.stringify(err, null, 2)))
  }

  return (
    <div className="Text">
      <div>
        <h3>Can't read the plate? Let Octank eyes try! Today</h3>
        <input type="file" onChange={identifyFromFile}></input>
        <p>{response}</p>
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
  
  function EntityIdentification() {
    const [response, setResponse] = useState("Click upload for test ")
    const [src, setSrc] = useState("");
  
    function identifyFromFile(event) {
      setResponse('searching...');
      
      const { target: { files } } = event;
      const [file,] = files || [];
  
      if (!file) {
        return;
      }
      Predictions.identify({
        entities: {
          source: {
            file,
          },
          /**For using the Identify Entities advanced features, enable collection:true and comment out celebrityDetection
           * Then after you upload a face with PredictionsUpload you'll be able to run this again
           * and it will tell you if the photo you're testing is in that Collection or not and display it*/
          collection: true
          //celebrityDetection: true
        }
      }).then(result => {
        console.log(result);
        const entities = result.entities;
        let imageId = ""
        let names = ""
        entities.forEach(({ boundingBox, metadata: { name = "", externalImageId = "" } }) => {
          const {
            width, // ratio of overall image width
            height, // ratio of overall image height
            left, // left coordinate as a ratio of overall image width
            top // top coordinate as a ratio of overall image height
          } = boundingBox;
          imageId = externalImageId;
          if (name) {
            names += name + " .";
          }
          console.log({ name });
        })
        if (imageId) {
          Storage.get("", {
            customPrefix: {
              public: imageId
            },
            level: "public",
          }).then(setSrc); // this should be better but it works
        }
        console.log({ entities });
        setResponse(names);
      })
        .catch(err => console.log(err))
    }
    
    return (
      <div className="Text">
        <div>
          <h3>Entity identification</h3>
          <input type="file" onChange={identifyFromFile}></input>
          <p>{response}</p>
          { src && <img src="{src}"></img>}
        </div>
      </div>
    );
  }
  function PredictionsUpload() {
    /* This is Identify Entities Advanced feature
     * This will upload user images to the appropriate bucket prefix
     * and a Lambda trigger will automatically perform indexing
     */
    function upload(event) {
      const { target: { files } } = event;
      const [file,] = files || [];
      Storage.put(file.name, file, {
        level: 'protected',
        customPrefix: {
          protected: 'protected/predictions/index-faces/',
        }
      });
    }
  
    return (
      <div className="Text">
        <div>
          <h3>Upload to predictions s3</h3>
          <input type="file" onChange={upload}></input>
        </div>
      </div>
    );
  }


  return (
    <div className="App">
      <h1>City of Octank - Police Department</h1>
      <h2>Ticketing and Document Managment</h2>
      
       
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Name:"
        value={formData.name}
      />   
       <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Ticket Notes"
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
      <button onClick={createNote}>Modify Ticket</button>
      <br/>
      <EntityIdentification />
      <br/>
      <PredictionsUpload />
      <br/>
      <div style={{marginBottom: 30}}>
      {
        notes.map(note => (
          <div key={note.id || note.name}>
            <h2>First Name: {note.name}</h2>
            <p>Last Name: {note.description}</p>
            <p>Confidence Score: {note.conf}</p>
            <button onClick={() => deleteNote(note)}>Delete Ticket Notes</button>
            {
              note.image && <img src={note.image} style={{width: 400}} />
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