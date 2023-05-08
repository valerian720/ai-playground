var VecMath = {
  Transpose(maxtix) {
    return maxtix[0].map((_, i) => maxtix.map((row) => row[i]));
  },
  Dot(arrA, arrB) {
    return arrA.map((_, i) => arrA[i] * arrB[i]).reduce((m, n) => m + n);
  },
  Softmax(arr) {
    return arr.map(function (value) {
      return (
        Math.exp(value) / arr.map((y) => Math.exp(y)).reduce((a, b) => a + b)
      );
    });
  },
  MatrixDot(maxtixA, maxtixB) {
    return maxtixA.map((_, i) => this.Dot(maxtixA[i], maxtixB[i]));
  },
  PerCollumnSum(matrix) {
    return matrix.map((subArr) => {
      return subArr.reduce((pre, item) => pre + item, 0);
    });
  },
  MultiplyArrayByMatrix(arr, matrix) {
    return matrix.map((row, i) => row.map((v) => v * arr[i]));
  },
  CreateCombinations(indexes, arrA, arrB) {
    let ret = arrA.flatMap((d, di) =>
      arrB.map((v, vi) => [indexes[di], d, indexes[vi], v])
    );
    //
    return ret;
  },
};

export default VecMath;
