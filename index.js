//NOTE : Skenario pengiriman dan pengambilan data             -->
//1. Pada saat ESP32 akan mengirimkan gambar, ubah val "num"  -->
//   di dalam tree "id" ESP32 menjadi val+1, sehingga program -->
//   web-app akan berjaga hingga pengiriman selesai           -->
//2. Setelah selesai mengirim gambar, ESP32 harus mengubah    -->
//   "done" menjadi true sehingga web-app dapat mengambil     -->
//   gambar. Setelah seluruh base64 diambil, "done" -> false  -->
import * as tf from '@tensorflow/tfjs';

var id = "pop1";
var numImg = 0;
var partBase64 = ["","","","","","","",""];
var base64imageStr = "";
var refDB = firebase.database().ref().child(id).child('image');

var zeros = null;
var resize_width = 224;
var resize_length = 224;

let object = document.getElementById("object");
let image = document.getElementById("base64image");
let canvas = document.getElementById("canvas");
let pre = document.getElementById("predictions");
const model = null;

function setupCanvas() {
  getBase64Firebase();
  base64image.setAttribute('src',base64imageStr);

  //Pengosongan base64 string dan komponen2 nya
  base64imageStr = "";
  for (var i = 1; i < 9; i++) {
      partBase64[i] = "";
  }

  let context = canvas.getContext("2d"),
    width = image.width,
    height = image.height;

  if (width && height) {
    canvas.width = width;
    canvas.height = height;

    context.drawImage(image, 0, 0, width, height);

    classifyImage();
  }
}

function getBase64Firebase() {
  var numRef = refDB.child('num');
  numRef.on('value', snap => {
    object.innerHTML = "hai";
    //aktivitas saat nilai diambil/berubah
    numImg = snap.val();
    object.innerHTML = numImg;
  });

  if(numImg > 0){
    for (var i = 1; i < 9; i++) {
      var partRef = refDB.child(numImg).child("part"+i);
      partRef.on('value', snap => {
        partBase64[i] = snap.val();
        base64imageStr += partBase64[i];
      });
    }
  }
}

function displayPredictions(predictions) {
	var once = false;
	var highVal = "";
  let val = "";

  highVal = predictions;

  /*
  for (prediction of predictions) {
    let perc = (prediction.probability * 100).toFixed(2);   //toFixed untuk mengatur desimal akurasi
    if(!once){
    	once = true;
    	highVal = prediction.className;
    }
    
    if(perc >= 10){
      val += `${perc}% | ${prediction.className}\n`;
      persen = prediction.className;
    }else{
      val += ` ${perc}% | ${prediction.className}\n`;
    }
    console.log(val);
  }
  */
  pre.innerHTML = highVal;

  var resRef = refDB.child("resMain");
  resRef.update({
  	"res": highVal
  });
}

async function classifyImage() {
  zeros = tf.zeros([1,resize_width, resize_length, 3]);
  predictions = mode.lpredict(zeros);
  displayPredictions(predictions);
}

async function main() {
  model = await tf.loadLayersModel('model/model.json');
  setInterval(() => setupCanvas(), 1000);
}

main();


