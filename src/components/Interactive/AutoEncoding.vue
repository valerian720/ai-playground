<!-- eslint-disable prettier/prettier -->
<template>
  <div class="row p-2 m-2">
    <div class="mb-3">
      <label for="" class="form-label">Text</label>
      <input type="text"
        class="form-control" name="" id="" aria-describedby="helpId" placeholder="" v-model="inputText" @change="ProcessText">
    </div>
    <p>tokens.length = {{tokens.length}}</p>
    <p>vocab = {{vocab}}</p>
    <p>vocab.length = {{Object.keys(vocab).length}}</p>
    <p>inverseVocab = {{inverseVocab}}</p>
    <p>simple vectorization = {{tokens.map(v => vocab[v])}}</p>
    <p>positive_skip_grams length = {{positiveSkipGrams.length}}</p>
    <p>positive_skip_grams = {{positiveSkipGrams}}</p>
    <p>examples:</p>
    <div>
      <p v-for="(exampleSkipGramm, index) in positiveSkipGrams.slice(0, 5)" :key="index">
        ({{ exampleSkipGramm[0] }}, {{ exampleSkipGramm[1] }}): ({{ inverseVocab[exampleSkipGramm[0]] }}, {{ inverseVocab[exampleSkipGramm[1]] }})
      </p>
    </div>

    <!-- <input type="color" name="color" value="#e66465" @change="colorPicked">
    <label for="color" class="m-2">Color: {{classified.label}} ({{parseFloat((classified.confidence*100).toFixed(2))}}%)</label> -->
    <!-- <div class="col">{{weights}}</div> -->
  </div>
</template>

<script lang="js">
// import ArrowViewer from "@/components/ArrowViewer.vue";
import ml5 from "ml5";

export default {
  name: "AutoEncoding",
  components: {
    // ArrowViewer,
  },
  props: {
    // msg: String,
  },
  data() {
    return {
      inputText: "Автором открытия закономерности является французский стенографист Жан-Батист Эсту (фр. Jean-Baptiste Estoup), который описал её в 1908 году в работе «Диапазон стенографии»[1]. Закон был впервые применён для описания распределения размеров городов немецким физиком Феликсом Ауэрбахом в работе «Закон концентрации населения» в 1913 году[2] и носит имя американского лингвиста Джорджа Ципфа, который в 1949 году активно популяризировал данную закономерность, впервые предложив использовать её для описания распределения экономических сил и социального статуса[2]. Объяснение закона Ципфа, основанное на корреляционных свойствах аддитивных марковских цепей (со ступенчатой функцией памяти), было дано в 2005 году[3]. Закон Ципфа математически описывается распределением Парето. Является одним из базовых законов, используемых в инфометрии.",
      //
      tokens: [],
      vocab: {},
      inverseVocab: {},
      positiveSkipGrams: [],
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
    CreateTokens() {
      this.tokens = this.inputText.toLowerCase().split(" ");
    },
    CreateVocab() {
      let index = 1; // start indexing from 1
      this.vocab['<pad>'] = 0  // add a padding token

      this.tokens.forEach(token => {
        if (!(token in this.vocab)) {
          this.vocab[token] = index;
          index++;
        }
      });
    },
    InveseVocab() {
      this.inverseVocab = Object.entries(this.vocab).reduce((r, [k, v]) => (r[v]=k, r), {});
    },
    GenSkipGrammar() {
      // Generate skip-grams from one sentence
      var keys = this.tokens.map(v => this.vocab[v]);
      var tmpGramms = [];
      for (var i = 0; i < keys.length; i++){
        var skGram = this.GetSkipGramsAtLocation(keys, i, 3);
        tmpGramms.push(...skGram);
      }
      this.positiveSkipGrams = Array.from(new Set(tmpGramms));

      // shiffle
      this.positiveSkipGrams = this.positiveSkipGrams
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
      // reduce (?)
      const reductionPersent = 0.8;
      this.positiveSkipGrams.splice(this.positiveSkipGrams.length * reductionPersent);
      //
    },
    GetSkipGramsAtLocation(inputList, location = 0, windowSize = 3) {
      var ret = [];
      for (var i = location - windowSize; i < location + windowSize; i++){
        if (i >= 0 && i < inputList.length && i != location) {
          ret.push([inputList[location], inputList[i]]);
        }
      }
      return ret;
    },
    //
    GenerateNegativeSamples() {
      var examplePositiveSkipGramm = this.positiveSkipGrams[0];
      var targetWord = examplePositiveSkipGramm[0];
      var contextWord = examplePositiveSkipGramm[1];

      const numNs = 4;
      const seed = 0;
      console.log(`${targetWord} ${contextWord} ${numNs}`);

      var negativeSamplingCandidates = this.LogUniformCandidateSampler([contextWord], 1, numNs, true, this.vocab.length, seed, "negative_sampling");
      console.log(negativeSamplingCandidates);
      /*
          # Get target and context words for one positive skip-gram.
          target_word, context_word = positive_skip_grams[0]

          # Set the number of negative samples per positive context.
          num_ns = 4

          context_class = tf.reshape(tf.constant(context_word, dtype="int64"), (1, 1))
          negative_sampling_candidates, _, _ = tf.random.log_uniform_candidate_sampler(
              true_classes=context_class,  # class that should be sampled as 'positive'
              num_true=1,  # each positive skip-gram has 1 positive context class
              num_sampled=num_ns,  # number of negative context words to sample
              unique=True,  # all the negative samples should be unique
              range_max=vocab_size,  # pick index of the samples from [0, vocab_size]
              seed=SEED,  # seed for reproducibility
              name="negative_sampling"  # name of this operation
          )
          print(negative_sampling_candidates)
          print([inverse_vocab[index.numpy()] for index in negative_sampling_candidates])
      */
    },
    LogUniformCandidateSampler(true_classes, num_true, num_sampled, unique, range_max, seed) {

      return [true_classes, num_true, num_sampled, unique, range_max, seed]; //
    },
    //
    ProcessText() {
      this.CreateTokens();
      this.CreateVocab();
      this.InveseVocab();
      this.GenSkipGrammar();
      //
      this.GenerateNegativeSamples();
    },
    // //////////////////
    // //////////////////
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
  },
  mounted() {
    //
    this.ProcessText();
    //
    /*
    // download dataset
    url = "https://ai.stanford.edu/~amaas/data/sentiment/aclImdb_v1.tar.gz"

    dataset = tf.keras.utils.get_file("aclImdb_v1.tar.gz", url,
                                      untar=True, cache_dir='.',
                                      cache_subdir='')

    dataset_dir = os.path.join(os.path.dirname(dataset), 'aclImdb')
    os.listdir(dataset_dir)
    remove_dir = os.path.join(train_dir, 'unsup')
    shutil.rmtree(remove_dir)
    // train
    batch_size = 1024
    seed = 123
    train_ds = tf.keras.utils.text_dataset_from_directory(
        'aclImdb/train', batch_size=batch_size, validation_split=0.2,
        subset='training', seed=seed)
    val_ds = tf.keras.utils.text_dataset_from_directory(
        'aclImdb/train', batch_size=batch_size, validation_split=0.2,
        subset='validation', seed=seed)

    for text_batch, label_batch in train_ds.take(1):
      for i in range(5):
        print(label_batch[i].numpy(), text_batch.numpy()[i])

    AUTOTUNE = tf.data.AUTOTUNE

    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    # Embed a 1,000 word vocabulary into 5 dimensions.
    embedding_layer = tf.keras.layers.Embedding(1000, 5)
    result = embedding_layer(tf.constant([1, 2, 3]))
    result.numpy()

    result = embedding_layer(tf.constant([[0, 1, 2], [3, 4, 5]]))
    result.shape

    # Create a custom standardization function to strip HTML break tags '<br />'.
    def custom_standardization(input_data):
      lowercase = tf.strings.lower(input_data)
      stripped_html = tf.strings.regex_replace(lowercase, '<br />', ' ')
      return tf.strings.regex_replace(stripped_html,
                                      '[%s]' % re.escape(string.punctuation), '')


    # Vocabulary size and number of words in a sequence.
    vocab_size = 10000
    sequence_length = 100

    # Use the text vectorization layer to normalize, split, and map strings to
    # integers. Note that the layer uses the custom standardization defined above.
    # Set maximum_sequence length as all samples are not of the same length.
    vectorize_layer = TextVectorization(
        standardize=custom_standardization,
        max_tokens=vocab_size,
        output_mode='int',
        output_sequence_length=sequence_length)

    # Make a text-only dataset (no labels) and call adapt to build the vocabulary.
    text_ds = train_ds.map(lambda x, y: x)
    vectorize_layer.adapt(text_ds)

    embedding_dim=16

    model = Sequential([
      vectorize_layer,
      Embedding(vocab_size, embedding_dim, name="embedding"),
      GlobalAveragePooling1D(),
      Dense(16, activation='relu'),
      Dense(1)
    ])

    model.compile(optimizer='adam',
              loss=tf.keras.losses.BinaryCrossentropy(from_logits=True),
              metrics=['accuracy'])

    model.fit(
      train_ds,
      validation_data=val_ds,
      epochs=15,
      callbacks=[tensorboard_callback])

    //
    weights = model.get_layer('embedding').get_weights()[0]
    vocab = vectorize_layer.get_vocabulary()
    */


    // TODO translate algorythm from this google collab to tfjs
    // https://colab.research.google.com/drive/18GpFIW0sCAl8DvEjze7X9ECvUWBzcWEG?usp=sharing

  }
}
</script>

<style scoped lang="less">
input:out-of-range {
  background-color: palegoldenrod;
}

input:placeholder-shown {
  background-color: paleturquoise;
}
</style>
