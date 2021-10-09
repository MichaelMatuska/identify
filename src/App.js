import React, { useState } from 'react';

import './App.css';
import Amplify, { Storage, Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());


function TextTranslation() {
  const [response, setResponse] = useState("Input some text and click enter to test")
  const [textToTranslate, setTextToTranslate] = useState("write to translate");

  function translate() {
    Predictions.convert({
      translateText: {
        source: {
          text: textToTranslate,
          // language : "es" // defaults configured on aws-exports.js
          // supported languages https://docs.aws.amazon.com/translate/latest/dg/how-it-works.html#how-it-works-language-codes
        },
        // targetLanguage: "en"
      }
    }).then(result => setResponse(JSON.stringify(result, null, 2)))
      .catch(err => setResponse(JSON.stringify(err, null, 2)))
  }

  function setText(event) {
    setTextToTranslate(event.target.value);
  }

  return (
    <div className="Text">
      <div>
        <h3>Text Translation</h3>
        <input value={textToTranslate} onChange={setText}></input>
        <button onClick={translate}>Translate</button>
        <p>{response}</p>
      </div>
    </div>
  );
}

function LabelsIdentification() {
    const [response, setResponse] = useState("Click upload for test ")
  
    function identifyFromFile(event) {
      const { target: { files } } = event;
      const [file,] = files || [];
  
      if (!file) {
        return;
      }
      Predictions.identify({
        labels: {
          source: {
            file,
          },
          type: "ALL" // "LABELS" will detect objects , "UNSAFE" will detect if content is not safe, "ALL" will do both default on aws-exports.js
        }
      }).then(result => setResponse(JSON.stringify(result, null, 2)))
        .catch(err => setResponse(JSON.stringify(err, null, 2)))
    }
  
    return (
      <div className="Text">
        <div>
          <h3>Labels identification</h3>
          <input type="file" onChange={identifyFromFile}></input>
          <p>{response}</p>
        </div>
      </div>
    );
  }

function App() {
  return (
    <div className="App">
      Translate Text
      <TextTranslation />
      <br/>
      Label Objects
      <LabelsIdentification />
      <br/>
    </div>
  );
}

export default App;