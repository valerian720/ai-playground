<!-- eslint-disable prettier/prettier -->
<template>
  <div class="row p-2 m-2">
    <input type="color" name="color" value="#e66465" @change="colorPicked">
    <label for="color" class="m-2">Color: {{classified.label}} ({{parseFloat((classified.confidence*100).toFixed(2))}}%)</label>
    <!-- <div class="col">{{weights}}</div> -->
  </div>
</template>

<script lang="js">
// import ArrowViewer from "@/components/ArrowViewer.vue";
import ml5 from "ml5";

export default {
  name: "ColorClassification",
  components: {
    // ArrowViewer,
  },
  props: {
    // msg: String,
  },
  data() {
    return {
      inputText: "Мама мыла раму",
      //
      nnOptions: {
        task: 'classification',
        debug: false,
      },
      trainingOptions: {
        epochs: 32,
        batchSize: 12,
      },
      nn: null,
      execAfterFinishedTraining: null,
      //
      classified: '',
    }
  },
  methods: {
    colorPicked(e) {
      const input = this.convertHex2Rgb(e.target.value.substring(1,7));
      this.classify(input);
    },
    //
    classify(input) {
      this.nn.classify(input, this.handleClassifyResults);
    },
    handleClassifyResults(err, result) {
      if (err)
        console.warn(err);

      else {
        this.classified = result[0];
        console.log(result);
      }
    },

    initNN(data) {

    // init and train net
    this.nn = ml5.neuralNetwork(this.nnOptions);


    //  add data to net
    data.forEach((item) => {
      const inputs = {
        r: item.r,
        g: item.g,
        b: item.b,
      };

      const output = {
        color: item.color
      };

      this.nn.addData(inputs, output);
    });

    // normalize data
    this.nn.normalizeData();

    // train the neural net
    this.nn.train(this.trainingOptions, this.finishedTraining);
    },
    // callback
    finishedTraining() {
      console.log("finished training");
      try {
        this.execAfterFinishedTraining();
      } catch (error) {;}
    },
    // helper
    convertHex2Rgb(hex) {
      if (hex.length == 6) {
        let rgbArray = hex.match(/.{1,2}/g);
        return {r: parseInt(rgbArray[0], 16), g: parseInt(rgbArray[1], 16), b: parseInt(rgbArray[2], 16)};
      }
      else console.error("invalid length, only six digit allowed");
    },
  },
  mounted() {
    // this.VectorizeText();
    let data = [
      { "r": 255, "g": 0, "b": 0, "color": "red-ish" },
      { "r": 254, "g": 0, "b": 0, "color": "red-ish" },
      { "r": 253, "g": 0, "b": 0, "color": "red-ish" },
      { "r": 0, "g": 255, "b": 0, "color": "green-ish" },
      { "r": 0, "g": 254, "b": 0, "color": "green-ish" },
      { "r": 0, "g": 253, "b": 0, "color": "green-ish" },
      { "r": 0, "g": 0, "b": 255, "color": "blue-ish" },
      { "r": 0, "g": 0, "b": 254, "color": "blue-ish" },
      { "r": 0, "g": 0, "b": 253, "color": "blue-ish" }
    ];

    this.initNN(data);
    // // test it
    // this.execAfterFinishedTraining = () => {
    //   const input = { r: 255, g: 0, b: 0 };
    //   this.classify(input);
    // };

  }
}
</script>

<style scoped lang="scss">
input:out-of-range {
  background-color: palegoldenrod;
}

input:placeholder-shown {
  background-color: paleturquoise;
}
</style>
