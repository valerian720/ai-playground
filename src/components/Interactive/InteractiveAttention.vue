<!-- eslint-disable prettier/prettier -->
<template>
  <div class="row p-2 m-2">
    <div class="col">
      <!--  -->
      <div class="row m-2">
        <div class="col">
          <div class="mb-3">
            <label class="form-label">Текст
              <button type="button" class="btn btn-outline-warning btn-sm" @click="SetDefaultText">
                сброс
              </button></label>
            <input type="text" class="form-control" placeholder="..." v-model="inputText" @change="VectorizeText" />
          </div>
        </div>
        <div class="col"></div>
      </div>
      <!--  -->
      <div class="row m-2">
        <div class="col">
          <p>Векторизация текста (text2vec)</p>
          <p>{{ tokens }}</p>
          <div class="row border m-1 p-1 rounded" v-for="(vectorizedWord, indexV) in vectorizedText" :key="indexV">
            {{ tokens[indexV] }} {{ vectorizedWord }}
          </div>
        </div>
        <div class="col">
          <div class="mb-3 row">
            <label class="form-label">Веса
              <button type="button" class="btn btn-outline-warning btn-sm" @click="SetDefaultWeights">
                сброс
              </button></label>
            <div class="col">
              <div class="row" v-for="(weightGroup, indexT2) in weights" :key="indexT2">
                <input v-for="(indWeight, indexW) in weightGroup" :key="indexW" type="number" min="-10" max="10"
                  step="0.01" class="form-control col m-1 border" placeholder="***" :class="[
                    indWeight.val > 0 ? 'border-success' : '',
                    indWeight.val < 0 ? 'border-danger' : '',
                  ]" v-model="indWeight.val" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--  -->
      <div class="row m-2 d-flex justify-content-center">
        <button class="btn btn-primary m-1 p-2 col-lg-3 col-6 btn-sm" @click="CalculateAttention">
          Посчитать q и k
        </button>
      </div>
      <!--  -->
      <div class="row m-2 justify-content-md-center">
        <div class="col-2">
          <p>K (key):</p>
          <p v-for="(keyRow, keyIndex) in attentionKey" :key="keyIndex">
            {{ keyRow.map((x) => parseFloat(x.toFixed(4))) }}
          </p>
        </div>
        <div class="col-2">
          <p>Q (querry):</p>
          <p v-for="(querryRow, querryIndex) in attentionQuerry" :key="querryIndex">
            {{ querryRow.map((x) => parseFloat(x.toFixed(4))) }}
          </p>
        </div>
        <div class="col-4">
          <ArrowViewer :name-list="tokens" :score-list="attentionScore" />
        </div>
      </div>
      <!--  -->

      <!--  -->
      <div class="row m-2">
        <!--  -->
        <div>
          <div class="mb-3">
            <b-button v-b-toggle.my-collapse variant="link">Отобразить доп. информацию и точные значения ⬇</b-button>
          </div>
          <b-collapse id="my-collapse" class="p-1 m-1 border border-info rounded">
            <p>tokens: {{ tokens }}</p>
            <p>attentionQuerry: {{ attentionQuerry }}</p>
            <p>attentionKey: {{ attentionKey }}</p>
            <p>Для дальнейшей визуализации:</p>
            <p>attetionQKpairs: {{ attetionQKpairs }}</p>
            <p>attentionScore: {{ attentionScore }}</p>
            <p>attentionSoftmax: {{ attentionSoftmax }}</p>
          </b-collapse>
        </div>
        <!--  -->
        <div class="table-responsive">
          <table class="table table-light">
            <thead>
              <tr>
                <th scope="col" class="text-end">querry (Q)</th>
                <th scope="col"></th>
                <th scope="col">Key (K)</th>
                <th scope="col"></th>
                <th scope="col">Score</th>
                <th scope="col">Softmax</th>
              </tr>
            </thead>
            <tbody>
              <!--  -->
              <tr class="" v-for="(QKpair, QKindex) in attetionQKpairs" :key="QKindex">
                <td class="text-end">
                  {{ QKpair[0] }}
                  {{ QKpair[1].map((x) => parseFloat(x.toFixed(4))) }}
                </td>
                <td class="text-center">⚫</td>
                <td>
                  {{ QKpair[2] }}
                  {{ QKpair[3].map((x) => parseFloat(x.toFixed(4))) }}
                </td>
                <td class="text-center">=</td>
                <td :class="[attentionScore[QKindex] < 0 ? 'text-danger' : '']">
                  {{ parseFloat(attentionScore[QKindex].toFixed(4)) }}
                </td>
                <td>{{ parseFloat(attentionSoftmax[QKindex].toFixed(4)) }}</td>
              </tr>
              <!--  -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import * as use from '@tensorflow-models/universal-sentence-encoder';

import ArrowViewer from "@/components/ArrowViewer.vue";
import VecMath from "@/lib/VecMath";

export default {
  name: "InteractiveAttention",
  components: {
    ArrowViewer,
  },
  props: {
    // msg: String,
  },
  data() {
    return {
      weights: [
        [{ val: 0.1 }, { val: 0.2 }, { val: 0.1 }, { val: -0.3 }, { val: 0.5 }],
        [{ val: 0.1 }, { val: 0.5 }, { val: -0.6 }, { val: 0.4 }, { val: -0.1 }],
        [{ val: 0.1 }, { val: 0.2 }, { val: 0.3 }, { val: 0.8 }, { val: 0.5 }],
        [{ val: -0.1 }, { val: -0.6 }, { val: 0.3 }, { val: -0.4 }, { val: 0.5 }],
        [{ val: 0.1 }, { val: 0.2 }, { val: 0.5 }, { val: 0.4 }, { val: -0.3 }],
      ],
      defaultWeights: [],
      inputText: "Мама мыла раму",
      defaultInputText: "",
      //
      tokens: [],
      vectorizedText: [],
      //
      attentionQuerry: [],
      attentionKey: [],
      //
      attetionQKpairs: [],
      attentionScore: [],
      attentionSoftmax: [],
    }
  },
  methods: {
    SetDefaultText() {
      this.inputText = `${this.defaultInputText}`;
      this.VectorizeText();
    },
    SetDefaultWeights() {
      console.log(this.defaultWeights);
      console.log(this.weights);
      this.weights = JSON.parse(JSON.stringify(this.defaultWeights));
    },
    VectorizeText() {
      // TODO: do normally
      let lookupTable = {
        "мама": [0.1, 0.2, 0.3, 0.4, 0.1],
        "мыла": [0.1, 0.4, 0.3, 0.3, 0.1],
        "раму": [0.1, 0.2, 0.2, 0.5, 0.6],
        "[SEP]": [0.8, 0.1, 0.2, 0.1, 0.1],
        "[BEGIN]": [0.8, 0.1, 0.2, 0.1, 0.1],
        "[END]": [0.1, 0.1, 0.2, 0.1, 0.8],
      };
      //
      this.tokens = this.inputText.toLowerCase().replace('. ', ' [SEP] ').split(' ');
      // this.tokens.unshift('[BEGIN]');
      // this.tokens.push('[END]');
      //
      this.vectorizedText = this.tokens.map(val => lookupTable[val]);
      // does it work?
      use.loadTokenizer().then(tokenizer => {
        this.vectorizedText = tokenizer.encode('Hello, how are you?'); // [341, 4125, 8, 140, 31, 19, 54]
      });

    },
    CalculateAttention() {
      this.attentionQuerry = this.vectorizedText;
      //
      let weightsExtracted = this.weights.map(v => { return v.map(x => x.val) });
      this.attentionKey = VecMath.Transpose(weightsExtracted.map(w => { return VecMath.PerCollumnSum(VecMath.MultiplyArrayByMatrix(w, this.vectorizedText)) }));
      //
      // calc attetionQKpairs to represent full list of combinations
      this.attetionQKpairs = VecMath.CreateCombinations(this.tokens, this.attentionQuerry, this.attentionKey);
      this.attentionScore = VecMath.MatrixDot(this.attetionQKpairs.map(v => v[1]), this.attetionQKpairs.map(v => v[3]));
      this.attentionSoftmax = VecMath.Softmax(this.attentionScore);
      //
    },
  },
  mounted() {
    this.VectorizeText();
    // default copy
    this.defaultWeights = JSON.parse(JSON.stringify(this.weights));
    this.defaultInputText = `${this.inputText}`;
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
