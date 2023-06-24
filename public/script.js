const recordBtn = document.querySelector(".record"),
  result = document.querySelector(".result"),
  downloadBtn = document.querySelector(".download"),
  inputLanguage = document.querySelector("#language"),
  clearBtn = document.querySelector(".clear");

let SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition,
  recognition,
  recording = false;

function populateLanguages() {
  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.code;
    option.innerHTML = lang.name;
    inputLanguage.appendChild(option);
  });
}

populateLanguages();

function speechToText() {
  try {
    recognition = new SpeechRecognition();
    recognition.lang = inputLanguage.value;
    recognition.interimResults = true;
    recordBtn.classList.add("recording");
    recordBtn.querySelector("p").innerHTML = "Listening...";
    recognition.start();
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      //detect when intrim results
      if (event.results[0].isFinal) {
        result.innerHTML += " " + speechResult;
        result.querySelector("p").remove();
      } else {
        //creative p with class interim if not already there
        if (!document.querySelector(".interim")) {
          const interim = document.createElement("p");
          interim.classList.add("interim");
          result.appendChild(interim);
        }
        //update the interim p with the speech result
        document.querySelector(".interim").innerHTML = " " + speechResult;
      }
      downloadBtn.disabled = false;
    };
    recognition.onspeechend = () => {
      speechToText();
    };
    recognition.onerror = (event) => {
      stopRecording();
      if (event.error === "no-speech") {
        alert("No speech was detected. Stopping...");
      } else if (event.error === "audio-capture") {
        alert(
          "No microphone was found. Ensure that a microphone is installed."
        );
      } else if (event.error === "not-allowed") {
        alert("Permission to use microphone is blocked.");
      } else if (event.error === "aborted") {
        alert("Listening Stopped.");
      } else {
        alert("Error occurred in recognition: " + event.error);
      }
    };
  } catch (error) {
    recording = false;

    console.log(error);
  }
}

recordBtn.addEventListener("click", () => {
  if (!recording) {
    speechToText();
    recording = true;
  } else {
    stopRecording();
  }
});

function stopRecording() {
  recognition.stop();
  recordBtn.querySelector("p").innerHTML = "Start Listening";
  recordBtn.classList.remove("recording");
  recording = false;
}

function clearResponse() {
  result.innerHTML = "";
  downloadBtn.disabled = true;
}

// function download() {
//   const text = result.innerText;
//   console.log(text);
//   const filename = "speech.txt";

//   const element = document.createElement("a");
//   element.setAttribute(
//     "href",
//     "data:text/plain;charset=utf-8," + encodeURIComponent(text)
//   );
//   element.setAttribute("download", filename);
//   element.style.display = "none";
//   document.body.appendChild(element);
//   element.click();
//   document.body.removeChild(element);
// }

const getAnsFromGPT = async () => {
  const url = "/getAnswers";
  const data = { text: result.innerHTML };

  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.setRequestHeader("Content-Type", "application/json");

  request.onload = () => {
    if (request.status === 200) {
      stopRecording();
      const responseData = JSON.parse(request.responseText);

      if ("speechSynthesis" in window) {
        const speechSynthesis = window.speechSynthesis;

        const speakText = (text) => {
          const speechUtterance = new SpeechSynthesisUtterance(text);

          speechUtterance.lang = "en-US";
          speechUtterance.volume = 1;
          speechUtterance.rate = 1;
          speechUtterance.pitch = 1;

          speechSynthesis.speak(speechUtterance);
        };

        const textToSpeak = responseData.answer.content;
        speakText(textToSpeak);
      } else {
        alert("Speech synthesis not supported by the browser");
      }
    } else {
      console.log("Request failed.");
    }
  };

  request.onerror = () => {
    console.log("Request failed.");
  };

  request.send(JSON.stringify(data));
};

downloadBtn.addEventListener("click", getAnsFromGPT);

clearBtn.addEventListener("click", clearResponse);
