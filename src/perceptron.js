import _ from 'lodash';

export default class Perceptron {
    constructor(inputsCount, threshold) {
        this.inputsCount = inputsCount;
        this.threshold = threshold;
        this.reset();
    }

    activate(inputs) {
        var value = 0;

        for (let i = 0; i < inputs.length; ++i) {
            value += inputs[i] * this.weights[i];
        }

        return {
            raw: value,
            value: +(value > this.threshold)
        };
    }

    reset() {
        this.weights = [];
        for (let i = 0; i < this.inputsCount; ++i) {
            this.weights.push(_.random(0, 1, true));
        }
    }

    train(trainingSet, speed) {
        var stepsCount = 0;
        var history = new Array(this.weights.length);
        history = _.map(history, () => []);

        this.logWeights(stepsCount, history);

        do {
            var sumError = 0;
            _.each(trainingSet, (images, label) => {
                _.each(images, (image) => {
                    let result = this.activate(image).value;
                    let error = label - result;
                    sumError += Math.abs(error);

                    this.weights = _.map(this.weights,
                        (w, i) => w + speed * error * image[i]);
                });
            });

            ++stepsCount;
            this.logWeights(stepsCount, history);
        } while(sumError != 0);

        return {
            stepsCount: stepsCount,
            history: history
        };
    }

    logWeights(step, history) {
        _.each(this.weights, (w, i) => {
            history[i].push([step, w]);
        });
    }
}