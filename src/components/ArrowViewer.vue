<!-- eslint-disable prettier/prettier -->
<template>
  <div class="row m-2">
    <!-- drawing -->
    <svg :height="svgTopPadding * 2 + svgDistanseBetween * nameList.length" width="500">
      <defs>
        <marker id="markerArrow" markerWidth="13" markerHeight="13" refX="2" refY="6" orient="auto">
          <path d="M 2 4 L 2 9 L 10 6 L 2 4" />
        </marker>
        <marker id="markerRedArrow" markerWidth="13" markerHeight="13" refX="2" refY="6" orient="auto">
          <path d="M 2 4 L 2 9 L 10 6 L 2 4" style="fill: red;" />
        </marker>
      </defs>
      <!--  -->
      <g v-for="(colPos, indexT1) in svgCollumns" :key="'textIndexT1_' + indexT1">
        <g v-for="(token, indexT2) in nameList" :key="'textIndexT2_' + indexT2">
          <text :x="svgLeftPadding + colPos" :y="svgTopPadding + indexT2 * svgDistanseBetween" class="small" :fill="
            indexT1 == 0 && indexT2 == selectedArrowGroupIndex
              ? svgSelectedColor
              : indexT1 == 1 &&
                scoreList[
                selectedArrowGroupIndex * (token.length - 1) + indexT2
                ] < 0
                ? svgDanger
                : svgColor
          " @click="SvgSelect(indexT1, indexT2)">
            {{ token }}
          </text>
        </g>
      </g>

      <g v-for="(token, indexT1) in nameList" :key="'arrowIndexT1_' + indexT1">
        <g v-for="(token, indexT2) in nameList" :key="'arrowIndexT2_' + indexT2">
          <line :class="[
            indexT1 == selectedArrowGroupIndex ? '' : 'd-none',
            scoreList[
              selectedArrowGroupIndex * (token.length - 1) + indexT2
            ] < 0
              ? 'red-arrow'
              : '',
          ]" :x1="svgLeftPadding + svgWordVidth" :y1="svgTopPadding + indexT1 * svgDistanseBetween - svgCenterY"
            :x2="svgLeftPadding + svgCollumns[1] - 20" :y2="
              svgTopPadding +
              indexT1 * svgDistanseBetween +
              (indexT2 - indexT1) * svgDistanseBetween -
              svgCenterY
            " class="arrow" />

          <text :class="[indexT1 == selectedArrowGroupIndex ? '' : 'd-none']"
            :x="(svgWordVidth + svgCollumns[1] - 40) / 2 + svgLeftPadding" :y="
              ((indexT2 - indexT1) * svgDistanseBetween) /
              svgArrowSpanTextCoef +
              svgTopPadding +
              indexT1 * svgDistanseBetween -
              svgCenterY
            " class="small" :fill="svgSelectedColor">
            {{
    scoreList.length > 0
      ? parseFloat(
        scoreList[
          indexT1 * (token.length - 1) + indexT2
        ].toFixed(4)
      )
      : "?"
            }}
          </text>
        </g>
      </g>
    </svg>
    <!--  -->
  </div>
</template>

<script lang="js">
/*
Алгоритм:

*/

export default {
  name: "ArrowViewer",
  props: {
    scoreList: { type: Array, required: true, default: () => [] },
    nameList: { type: Array, required: true, default: () => [] },
  },
  data() {
    return {
      svgColor: "blue",
      svgSelectedColor: "orange",
      svgDanger: "red",
      svgTopPadding: 20,
      svgLeftPadding: 100,
      svgDistanseBetween: 50,

      svgWordVidth: 60,
      svgCollumns: [0, 200],
      svgCenterY: 5,
      svgCenterX: 10,
      svgArrowSpanTextCoef: 1.4,
      //
      selectedArrowGroupIndex: 0,
    }
  },
  methods: {
    SvgSelect(x, y) {
      if (x == 0)
        this.selectedArrowGroupIndex = y;
    },
  },
  mounted() {
  }
}
</script>

<style scoped lang="scss">
.arrow {
  stroke: rgb(0, 0, 0);
  stroke-width: 2;
  marker-end: url(#markerArrow);
}

.red-arrow {
  stroke: red;
  marker-end: url(#markerRedArrow);
}

.small {
  font: 20px sans-serif;
  cursor: pointer;
}
</style>
