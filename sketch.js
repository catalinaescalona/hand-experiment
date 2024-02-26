/*
Author: Catalina Escalona
Coding Lab Project Work
Winter Semester 2023/24
University of Applied Arts
Vienna, Austria

Last updated: February 26, 2024

Based off of Nahuel Gerth's starter code:
https://github.com/NahuelGerthVK/bodytracking-p5-mediapipe/tree/main/04_resize_letter

MediaPipe hand landmark detection documentation:
https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
*/

/* - - MediaPipe Hand Tracking - - */

/*

Which tracking points can I use?
https://developers.google.com/static/mediapipe/images/solutions/hand-landmarks.png

We have a total of 21 points per hand:
0 = wrist
4 = thumb tip
8 = index finger tip
20 = pinky tip

What we do in this code:
- draw a an ellipse on index fingers
- draw a an ellipse on thumbs
- calculate the center points between index and thumb fingers
- draw text at the center of the points point (the text is taken from an array of words)
- calculate the distance between index and thumb
- use distances to change text size and have text follow the points on screen
- when fingers touch, randomly select word from array

*/


/* - - Variables - - */

// webcam variables
let capture; // our webcam
let captureEvent; // callback when webcam is ready

// styling
let ellipseSize = 10; // size of the ellipses
let letterSize = 10; // size of the letter

// arrays of phrases
let wordsArray1 = [
    "ab", "an", "auf", "aus", "bei", "ein", "emp", "ent", "er", "fern",
    "ge", "her", "hin", "hoch", "mit", "nach", "nieder", "ob", "um",
    "un", "ver", "vor", "weg", "wider", "zu", "zurück", "zusammen",
    "be", "en", "entgegen", "erz", "fehl", "fern",
    "mittler", "mittel", "mitunter", "mitver", "mitüber", "nicht", "viel", "weiter", "wieder",
    "zwischen", "folge", "vorbei", "zusammenzu", "zumal", "zusehends", "zunächst", "zurzeit", "zusätzlich",
    "anheim", "herbei", "hierher", "dorthin", "daneben", "damit", "danach", "darin", "dahinter", "davor",
    "durch", "fort", "her", "hinauf", "heran", "heim", "hoch", "los", "nieder",
    "umher", "vorbei", "voraus", "vorwärts", "zurück", "auf", "aus", "an", "ein",
    "mit", "nach", "vor", "zu", "hinter", "gegen", "entgegen", "unter", "hinauf",
    "hinaus", "hindurch", "hinunter", "zurück", "um", "her", "neu", "weiter", "nach",
    "durch", "ein", "aus", "zu", "heraus", "weg", "vor", "zurück", "an",
    "hoch", "weiter", "voll", "fern", "ab", "voran", "an", "wieder",
    "hinauf", "voneinander", "mehrfach", "hinweg", "seitlich", "recht", "link", "nach", "darauf", "dergleichen",
    "derart", "derlei", "dies", "das", "jenes", "solch", "manch", "wenig", "viel",
    "mehr", "meiste", "meistens", "bereits", "bestimmt", "diesmal", "dort", "deshalb", "darum",
    "demnach", "danach", "davor"
];

let wordsArray2 = [
    "anrufen", "antworten", "arbeiten", "atmen", "backen", "baden", "bauen", "beantworten", "behalten", "beinhalten",
    "bekommen", "bellen", "beraten", "beschreiben", "besitzen", "besuchen", "bieten", "binden", "bleiben", "braten",
    "bringen", "denken", "dienen", "dürfen", "einladen", "einrichten", "einsteigen", "empfangen", "entdecken", "enthalten",
    "entwickeln", "essen", "fahren", "fallen", "fangen", "finden", "fliegen", "fließen", "fragen", "freuen",
    "fühlen", "geben", "gehen", "gehören", "genießen", "geschehen", "gewinnen", "glauben", "grillen", "haben",
    "halten", "handeln", "hängen", "heißen", "helfen", "hören", "hüpfen", "kaufen", "kennen", "klettern",
    "kommen", "können", "kosten", "küssen", "lachen", "laufen", "legen", "leiden", "leihen", "lesen",
    "lieben", "liefern", "lösen", "machen", "malen", "meiden", "meinen", "messen", "möchten", "mögen",
    "müssen", "nehmen", "öffnen", "planen", "prüfen", "raten", "rechnen", "reisen", "retten", "rufen",
    "sagen", "schauen", "schlafen", "schließen", "schmecken", "schreiben", "schwimmen", "sehen", "sein", "senden",
    "setzen", "singen", "sitzen", "sollen", "sprechen", "springen", "stehen", "sterben", "studieren", "suchen",
    "tanzen", "tragen", "treffen", "trinken", "tun", "überlegen", "übernachten", "übernehmen", "überzeugen", "umfahren",
    "umgehen", "umziehen", "unterhalten", "verabschieden", "verbringen", "vergessen", "verlassen", "verlieren", "verschenken", "versprechen",
    "verstehen", "verteidigen", "vorstellen", "wachsen", "warten", "waschen", "wechseln", "wecken", "weinen", "werden",
    "werfen", "wissen", "wohnen", "zahlen", "zeigen", "ziehen", "zuhören", "zulassen", "zumachen", "zurückkommen",
    "zusammenarbeiten", "zuschauen", "zusehen", "zuspielen", "zustimmen", "zutreffen", "zwischenlagern", "zwingen", "üben",
    "überholen", "übersetzen", "überziehen", "unterbrechen", "unternehmen", "unterrichten", "unterschreiben", "unterstützen", "untersuchen", "urteilen",
    "verabreden", "verändern", "veranstalten", "verarbeiten", "verbinden", "verbreiten", "verdienen", "verfolgen", "verhandeln", "verhalten",
    "verhindern", "verkaufen", "verlangen", "verlegen", "verletzen", "vermeiden", "vermieten", "verschwinden", "versorgen", "versprechen",
    "vertreten", "verwalten", "verweigern", "verzichten", "veröffentlichen", "vorbeigehen", "vorbeugen", "vorbereiten", "vorstellen", "vorschlagen",
    "vorziehen", "wählen", "wahrnehmen", "wehren", "weichen", "weisen", "weitersagen", "werben", "wiederholen", "widersprechen",
    "wirken", "zeigen", "zusammenleben", "zusammenpassen", "zusammenstoßen", "zweifeln", "zwinkern"
];

// bookkeeping variables
let fingersTouching1 = false; // variable to keep track of whether fingers are touching or not
let fingersTouching2 = false; 
let currentPhrase1 = ""; // variable to store the current phrase
let currentPhrase2 = ""; 


/* - - Setup - - */

function setup() {
    createCanvas(windowWidth, windowHeight);
    captureWebcam(); // launch webcam
    
    // styling
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    fill('white');
}


/* - - Draw - - */

function draw() {
    background(0);
    
    /* WEBCAM */
    push();
    centerOurStuff(); // center the webcam
    scale(-1, 1); // mirror webcam
    image(capture, -capture.scaledWidth, 0, capture.scaledWidth, capture.scaledHeight); // draw webcam
    scale(-1, 1); // unset mirror
    pop();
    
    /* TRACKING */
    if (mediaPipe.landmarks[0] && mediaPipe.landmarks[1]) { // is at least one hand tracking ready?
        // index finger 1
        let index1X = map(mediaPipe.landmarks[0][8].x, 1, 0, 0, capture.scaledWidth);
        let index1Y = map(mediaPipe.landmarks[0][8].y, 0, 1, 0, capture.scaledHeight);
        // index finger 2
        let index2X = map(mediaPipe.landmarks[1][8].x, 1, 0, 0, capture.scaledWidth);
        let index2Y = map(mediaPipe.landmarks[1][8].y, 0, 1, 0, capture.scaledHeight);

        // thumb 1
        let thumb1X = map(mediaPipe.landmarks[0][4].x, 1, 0, 0, capture.scaledWidth);
        let thumb1Y = map(mediaPipe.landmarks[0][4].y, 0, 1, 0, capture.scaledHeight);
        // thumb 2
        let thumb2X = map(mediaPipe.landmarks[1][4].x, 1, 0, 0, capture.scaledWidth);
        let thumb2Y = map(mediaPipe.landmarks[1][4].y, 0, 1, 0, capture.scaledHeight);

        // center point between index 1 and thumb 1
        let center1X = (index1X + thumb1X) / 2;
        let center1Y = (index1Y + thumb1Y) / 2;
        // center point between index 2 and thumb 2
        let center2X = (index2X + thumb2X) / 2;
        let center2Y = (index2Y + thumb2Y) / 2;

        // distance between index 1 and thumb 1
        let distance1 = dist(index1X, index1Y, thumb1X, thumb1Y);
        // distance between index 2 and thumb 2
        let distance2 = dist(index2X, index2Y, thumb2X, thumb2Y);

        push();
        centerOurStuff();

        // draw fingers
        fill('white');
        ellipse(index1X, index1Y, ellipseSize, ellipseSize); // index finger 1
        ellipse(index2X, index2Y, ellipseSize, ellipseSize); // index finger 2
        ellipse(thumb1X, thumb1Y, ellipseSize, ellipseSize); // thumb 1
        ellipse(thumb2X, thumb2Y, ellipseSize, ellipseSize); // thumb 2

        // check if fingers touch for hand 1
        if (distance1 < 60) {
            if (!fingersTouching1) {
                fingersTouching1 = true;
                currentPhrase1 = random(wordsArray1);
            }
            textSize(distance1 * 0.9);
            text(currentPhrase1, center1X, center1Y);
        } else {
            fingersTouching1 = false;
            textSize(distance1 * 0.9);
            text(currentPhrase1, center1X, center1Y);
        }

        // check if fingers touch for hand 2
        if (distance2 < 60) {
            if (!fingersTouching2) {
                fingersTouching2 = true;
                currentPhrase2 = random(wordsArray2);
            }
            textSize(distance2 * 0.9);
            text(currentPhrase2, center2X, center2Y);
        } else {
            fingersTouching2 = false;
            textSize(distance2 * 0.9);
            text(currentPhrase2, center2X, center2Y);
        }
        pop();
    }
}


/* - - Helper functions - - */

// function: launch webcam
function captureWebcam() {
    capture = createCapture(
        {
            audio: false,
            video: {
                facingMode: "user",
            },
        },
        function (e) {
            captureEvent = e;
            console.log(captureEvent.getTracks()[0].getSettings());
            // do things when video ready
            // until then, the video element will have no dimensions, or default 640x480
            capture.srcObject = e;
            
            setCameraDimensions(capture);
            mediaPipe.predictWebcam(capture);
            //mediaPipe.predictWebcam(parentDiv);
        }
        );
        capture.elt.setAttribute("playsinline", "");
        capture.hide();
}

// function: resize webcam depending on orientation
function setCameraDimensions(video) {
    const vidAspectRatio = video.width / video.height; // aspect ratio of the video
    const canvasAspectRatio = width / height; // aspect ratio of the canvas
    if (vidAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas aspect ratio
        video.scaledHeight = height;
        video.scaledWidth = video.scaledHeight * vidAspectRatio;
    } else {
        // Image is taller than canvas aspect ratio
        video.scaledWidth = width;
        video.scaledHeight = video.scaledWidth / vidAspectRatio;
    }
}


// function: center our stuff
function centerOurStuff() {
    translate(width / 2 - capture.scaledWidth / 2, height / 2 - capture.scaledHeight / 2); // center the webcam
}

// function: window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setCameraDimensions(capture);
}